#!/bin/bash

previous_location=$(pwd)
install_dir=""
tomcat_location=""
mysql_user=""
mysql_database=""
mysql_password=""
server_subdomain="stategraems_app"
UPDATEDB="TRUE"

origin="http://bioinfo.cipf.es/stategraems/dist"

function quit {
	cd $previous_location
	if [ "$install_dir" != "" ]; then
		echo -e "\tCLEANING INSTALLATION FILES"
		rm -r $install_dir
	fi
	exit $1
}

function readTomcatLocation {
	local valid_data
	local status

	valid_data=1
	while [ $valid_data == 1 ]; do
		echo -en "\tPlease type the location of TOMCAT in the system (e.g. /opt/tomcat6/). This location must contains the webapps directory. [Ctrl + C to cancel]  "	
		read -e -p "" tomcat_location

		status=$(ls $tomcat_location | grep webapps)
		status=$?
		if [ $status == 1 ]; then 
			echo -e "\tThe given location is not valid. Please check if TOMCAT is correctly installed and if so, the correct location for the files."
		else
			echo -e "\t                      ...OK Tomcat files located at "$tomcat_location
			valid_data=0
		fi
	done
}

function checkTomcatInstallation {
	local status
	local RESP

	echo -en "\tLOOKING FOR TOMCAT...."
	tomcat_location=$(ps -Af | grep tomcat | grep java)

	status=$?
	if [ $status == 1 ]; then 
		echo -en "\n\tTOMCAT was not detected in this machine, Is TOMCAT correctly installed and running? (Yy/Nn)   "	
		read -p "" RESP
		if [ "$RESP" = "y" ] || [ "$RESP" = "Y" ]; then
			readTomcatLocation
		else
			echo -e "\tTOMCAT is required. Please install it first and restart the STATegra EMS installation. more info. http://bioinfo.cipf.es/stategraems/stategra-ems-installation/"
			quit 1;
		fi
	else
		tomcat_location=$(echo $tomcat_location | awk  '{for (i=1; i<=NF; i++) if ($i ~ /[.]*Dcatalina.home[.]*/){split($i,tmp,"=");printf tmp[2] "\n";}}')
		status=$(ls $tomcat_location | grep webapps)
		status=$?
		if [ $status == 1 ]; then 
			echo -e "\t"$tomcat_location"does not contain the webapp directory. Please specify manually the location for this directory."
			readTomcatLocation
		fi

		echo -e "...OK Tomcat files located at "$tomcat_location
	fi
}

function selectEMSinstance {
	local status;
	local RESP;
	local valid_data;

	status=0
	echo -e "\033[1mSTEP $1/$2. PLEASE, CHOOSE THE STATegra EMS instance that will be updated.\033[0m"
	valid_data=1;
	while [ "$valid_data" = "1" ]; do
		files=$(cd $tomcat_location/webapps && ls *.war); 
		for file in $files; do 
			echo -e "\t"$file | sed 's/\.war//'; 
		done
		echo -n "            > ";read -p "" RESP
		valid_data=$(echo $files | grep  $RESP);
		valid_data=$?;
                if [ "$valid_data" = "1" ]; then 
                        echo -e "\tOption not valid, please try again (Ctrl + C to quit)";
                fi
	done
	server_subdomain=$RESP;
	echo -e "\tThe STATegra EMS instace "$server_subdomain" will be updated. Do you want to continue? [Yy/Nn]";
	echo -en "\t\t> ";read -p "" RESP
	if [ "$RESP" != "Y" ] && [ "$RESP" != "y" ]; then
		echo -e "\tInstallation aborted."
		quit 1;
	fi
}

function getSTATegraEMSdata {
	local status

	echo -en "\033[1mSTEP $1/$2. DOWNLOADING STATegra EMS LAST VERSION...\033[0m"
	#CREATE THE TEMPORAL DIRECTORY
	install_dir=$(mktemp -d)
	echo "" > $install_dir/install.log
	#DOWNLOAD THE COMPRESSED FILES
	status=0
	wget $origin/STATegraEMS_bin_last.tar.gz -P $install_dir -o $install_dir/install.log
	status=$(($status || $?))
	#MOVE TO INSTALLATION DIRECTORY
	cd $install_dir
	status=$(($status || $?))
	#CREATE THE DIR FOR DATA EXTRACTION
	mkdir $install_dir/STATegraEMS_bin_last
	status=$(($status || $?))
	#EXTRACT DATA
	tar xzvf $install_dir/STATegraEMS_bin_last.tar.gz -C $install_dir/STATegraEMS_bin_last > $install_dir/install.log
	status=$(($status || $?))
	#MOVE TO EXTRACTED DIRECTORY
	cd $install_dir/STATegraEMS_bin_last/STATegraEMS_bin_v*
	status=$(($status || $?))
	#CHECK IF EVERYTHING IS OK
	if [ $status != 0 ];then 
		echo -e "\n\tUnable to get the STATegra EMS binaries, installation aborted, Try again later.";
		quit 1
	fi
	echo "...DONE"
}

function backupConfFile {
	local status;
	local RESP;
	local valid_data;

	status=0
	echo -e "\033[1mSTEP $1/$2. SAVING STATegra EMS SETTINGS...\033[0m"

	cp $tomcat_location/webapps/$server_subdomain/WEB-INF/classes/conf/data_location.properties data_location.properties
	cp $tomcat_location/webapps/$server_subdomain/resources/ServerConfiguration.js ServerConfiguration.js
	status=$(($status || $?))
	if [ $status != 0 ];then 
		echo -e "\n\tUnable to save the STATegra EMS settings, installation aborted, Try again later.";
		quit 1
	fi
	echo "...DONE"
}

function undeploySTATegraEMS {
	local status;
	local RESP;
	local valid_data;

	status=0
	echo -e "\033[1mSTEP $1/$2. UNDEPLOYING PREVIOUS VERSION OF STATegra EMS...\033[0m"

	mv $tomcat_location/webapps/$server_subdomain".war" $server_subdomain.war_old
	status=$(($status || $?))
	if [ $status != 0 ];then 
		echo -e "\n\tUnable to remove the previous version of the STATegra EMS, installation aborted, Try again later.";
		quit 1
	fi

	local nTry=1;
	# Check if the directory exists
	while [ -d "$tomcat_location/webapps/$server_subdomain" ] && [ $nTry -lt 4 ] ; do
		echo -e "\tTomcat should autoremove the application folder, waiting "$((5 * $nTry))"seconds...";
		sleep $((5 * $nTry));
		nTry=$(($nTry+1));
	done

	if [ $nTry -eq 4 ];then 
		echo -e "\n\tUnable to remove the previous version of the STATegra EMS, installation aborted, Try again later.";
		quit 1
	fi

	echo "...DONE"
}

function deploySTATegraEMS {
	local status;
	local RESP;
	local valid_data;

	status=0
	echo -e "\033[1mSTEP $1/$2. DEPLOYING STATegra EMS...\033[0m"

	cp stategraems_app.war $tomcat_location/webapps/$server_subdomain".war"
	status=$(($status || $?))
	if [ $status != 0 ];then 
		echo -e "\n\tUnable to deploy the STATegra EMS binaries, installation aborted, Try again later.";
		quit 1
	fi

	local nTry=1;
	# Check if the directory exists
	while [ ! -d "$tomcat_location/webapps/$server_subdomain" ] && [ $nTry -lt 4 ] ; do
		echo -e "\tTomcat should autocreate the application folder, waiting "$((5 * $nTry))"seconds...";
		sleep $((5 * $nTry));
		nTry=$(($nTry+1));
	done

	if [ $nTry -eq 4 ];then 
		echo -e "\n\tUnable to create the application folder for the new version of STATegra EMS, installation aborted, Try again later.";
		quit 1
	fi

	echo "...DONE"
}

function getIPAddress {
	IP_ADDRESS=$(hostname -I| sed 's/ $//');
	
	if [ "$IP_ADDRESS" == "" ]; then
		echo "";
	fi
	echo "http://"$IP_ADDRESS":8080/$server_subdomain OR "
}


function configureSTATegraEMS {
	echo -e "\033[1mSTEP $1/$2. CONFIGURING STATegra EMS...\033[0m"
	echo -e "	We are almost done! "
	echo -e "	The new version of STATegra EMS has been installed successfully!"	
	echo -e "	Open your favourite browser, navigate to the STATegra EMS application instance ("$(getIPAddress)"http://<YOUR_SERVER_IP>:<TOMCAT_PORT>/$server_subdomain)"
	echo -e "	and follow the instructions to finish the installation."
	echo -e "	* Previous data location was:"; sed -n "2p" data_location.properties;
	echo -e ""
	echo -e "	\e[4mPlease note:\e[0m after configuration, webapplication application must be reloaded in order to apply the new settings. (e.g. via the Tomcat Manager)."
	echo -e "	Thank you very much for using the STATegra EMS."
	echo -e "	Press any key to continue."
	read
}


echo -e "\033[1mWELCOME TO THE STATegraEMS INSTALLATOR.\033[0m"
echo -e "	This tool was developed to facilitate upgrading of the STATegra EMS application to the latest version. "
echo -e "	Although this program has been checked and tested,this program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY and the user must run it under his own risk ."
echo -e "	"
echo -e "	It is highly recommended that you back up the contents of the database application and data directory of the application before continuing with the process. We also recommend stopping the application using the Tomcat manager to prevent user access to the application during the upgrade process (but Tomcat should keep running ) ."
echo -e "	"
echo -e "	Briefly these are the steps that will be implemented during the upgrade :"
echo -e "	 1. Check the installed services (Java, Tomcat...)."
echo -e "	 2. Download the latest version of STATegraEMS."
echo -e "	 3. Backup previous settings."
echo -e "	 4. Install the latest version of the program."
echo -e "	 5. Configure the service and cleanup the installation files."
echo -e "	"
echo -en "    Continue with upgrading? [Yy/Nn]"
read -p "" RESP
if [ "$RESP" != "y" ] && [ "$RESP" != "Y" ]; then
	echo -en "    Upgrading aborted. Bye."
fi

#---------------------------------------------------------
#step 1.	CHECK IF SOFTWARE DEPENDENCIES ARE INSTALLED
echo -e "\033[1mSTEP 1/7. CHECKING SOFTWARE REQUISITES...\033[0m"
#---------------------------------------------------------
#	step 1.2	CHECK IF TOMCAT IS INSTALLED -------------
checkTomcatInstallation

#---------------------------------------------------------
#step 2.	CHOOSE THE INSTANCE TO UPDATE
selectEMSinstance 2 7

#---------------------------------------------------------
#step 3.	GET THE STATEGRA EMS BINARIES AND EXTRACT
getSTATegraEMSdata 3 7

#---------------------------------------------------------
#step 4.	SAVE SETTINGS
backupConfFile 4 7

#---------------------------------------------------------
#step 5.	UNDEPLOY THE PREVIOUS VERSION 
undeploySTATegraEMS 5 7

#---------------------------------------------------------
#step 6.	DEPLOY THE NEW VERSION 
deploySTATegraEMS 6 7

#---------------------------------------------------------
#step 7.	RESTORE CONF FILES
configureSTATegraEMS 7 7

quit 0

