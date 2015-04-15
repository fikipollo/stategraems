#!/bin/bash

previous_location=$(pwd)
install_dir=""
tomcat_location=""
server_subdomain="stategraems_app"

origin="http://bioinfo.cipf.es/stategraems/unofficial_dist"

function quit {
	cd $previous_location
	if [ "$install_dir" != "" ]; then
		echo -e "\tCLEANING INSTALLATION FILES"
		rm -r $install_dir
	fi
	exit $1
}

function checkJavaInstallation {
	local status
	local RESP

	echo -en "\tLOOKING FOR JAVA...."
	status=$(java -version 2> /dev/null)
	status=$?
	if [ $status == 1 ]; then 
		status=$(which java)
		status=$?
	fi
	if [ $status == 1 ]; then 
		echo -en "\n\tJAVA was not detected in this machine, Is JAVA correctly installed and running? (Yy/Nn)   "	
		read -p "" RESP
		if [ "$RESP" = "y" ] || [ "$RESP" = "Y" ]; then
			echo -e "\t                    .....\033[92;1mOK\033[0m"
		else
			echo -e "\tJAVA is required. Please install it first and restart the STATegra EMS installation. more info. http://bioinfo.cipf.es/stategralims/?page_id=78"
			quit 1;
		fi
	else
		  echo -e ".....\033[92;1mOK\033[0m"
	fi
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
			echo -e "\t                      ...\033[92;1mOK\033[0m Tomcat files located at "$tomcat_location
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

		echo -e "...\033[92;1mOK\033[0m Tomcat files located at "$tomcat_location
	fi
}


function checkMySQLInstallation {
	local status;
	local RESP;
	local valid_data;

	echo -en "\tLOOKING FOR MySQL....";
	#CHECK IF mysql daemon is running
	status=$(ps -Af | grep mysqld);
	status=$?;
	#IF RUNNING, CHECK IF ACCEPT QUERIES 	
	if [ $status == 0 ];then
		status=$(echo "exit"| mysql -u testifrunning 2>&1 | awk '{if ($0 ~ /.*Access denied.*/ || $0 ~ /.*ERROR 1045.*/){print 0} else if($0 ~ /.*ERROR 2002.*/) { print "1" } else { print "-1"}} END { if (NR == 0){print "0"} }')
	fi
	
	#IF MYSQL DAEMON IS NOT RUNNING OR CAN NOT BE DETECTED
	if [ $status == 1 ];then 
		valid_data=1;
		while [ $valid_data == 1 ];do
			echo -en "\n\tMySQL service was not detected in this machine, please start the mysql service and press ENTER to continue.";
			read -p "" RESP;
			echo -en "\n\tCheking if MySQL daemon is currently running...";
			status=$(echo "exit"| mysql -u testifrunning 2>&1 | awk '{if ($0 ~ /.*Access denied.*/ || $0 ~ /.*ERROR 1045.*/){print 0} else if($0 ~ /.*ERROR 2002.*/) { print "1" } else { print "-1"}} END { if (NR == 0){print "0"} }')
			if [ $status == 0 ]; then
				valid_data=0;
			else
				echo "FAIL";
			fi
		done
	#ELSE IF RUNNING AND ACCEPTY QUERIES
	elif [ $status == 0 ]; then
		echo -e "....\033[92;1mOK\033[0m";
	else 
		echo -e "\tMySQL is required. Please install it first and restart the STATegra EMS installation. more info. http://bioinfo.cipf.es/stategraems/stategra-ems-installation/";
		quit 1;
	fi
}

function getSTATegraEMSdata {
	local status

	echo -en "\033[1mSTEP $1/$2. DOWNLOADING STATegra EMS LAST VERSION (COULD TAKE FEW MINUTES)...\033[0m"
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
	echo -e "\033[92;1mDONE\033[0m"
}

function deploySTATegraEMS {
	local status;
	local RESP;
	local valid_data;

	status=0
	echo -e "\033[1mSTEP $1/$2. DEPLOYING STATegra EMS...\033[0m"
	echo -e "            The STATegra EMS is a web application and it is necessary to specify the address that will be used to access to it."
	echo -e "            By default, STATegra EMS will be accessible using http://yourservername/stategraems_app."
	echo -en "           Do you want to change it? [Yy/Nn]"
	read -p "" RESP
	if [ "$RESP" = "y" ] || [ "$RESP" = "Y" ]; then
		valid_data=1
		while [ $valid_data == 1 ];do
			echo -e "            Please type the name that you will use to access STATegra EMS (default, stategraems_app)."
			echo -e "            Accepted charset [a-z A-Z 0-9 _ - ]"
			echo -n "            > "; read -p "" RESP
			if [[ ! $RESP =~ ^[a-z0-9]+[a-z0-9_-]* ]]; then 
				echo -e "            Invalid name, please try again.";
			else
				server_subdomain=$RESP
				echo -e "            STATegra EMS will be accesible using http://yourservername/"$RESP
				echo -e "            Do you agree? [Yy/Nn]"
				echo -n "            > "; read -p "" RESP
				if [ "$RESP" = "y" ] || [ "$RESP" = "Y" ]; then
					valid_data=0
				else
					echo ""
				fi
			fi
		done
		if [ "$server_subdomain" == "" ]; then
			server_subdomain="stategraems_app"
		fi
	else
		server_subdomain="stategraems_app"
	fi

	cp stategraems_app.war $tomcat_location/webapps/$server_subdomain".war"
	status=$(($status || $?))
	if [ $status != 0 ];then 
		echo -e "\n\tUnable to get the STATegra EMS binaries, installation aborted, Try again later.";
		quit 1
	fi
	
	local nTry=1;
	# Check if the directory exists
	while [ ! -d "$tomcat_location/webapps/$server_subdomain" ] && [ $nTry -lt 4 ] ; do
		echo -e "\tTomcat should autocreate the application folder, waiting "$((5 * $nTry))"seconds...";
		sleep $((5 * $nTry));
		nTry=$(($nTry+1));
	done

	if [ $nTry -eq 5 ];then 
		echo -e "\n\tUnable to find the STATegra EMS instance, \033[91;1minstallation aborted\033[0m, Try again later.";
		quit 1
	fi
	
	echo -e "STEP $1/$2. DEPLOYING STATegra EMS...\033[92;1mDONE\033[0m"
	
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
	echo -e ""
	echo -e "	\e[4mPlease note:\e[0m after configuration, webapplication application must be reloaded in order to apply the new settings. (e.g. via the Tomcat Manager)."
	echo -e "	Thank you very much for using the STATegra EMS."
	echo -e "	Press any key to continue."
	read	
}


echo -e "\033[1mWELCOME TO THE STATegraEMS INSTALLATOR.\033[0m"
echo -e "     This tool was developed to facilitate installation of the STATegra EMS application to the latest version. "
echo -e "     Although this program has been checked and tested,this program is distributed in the hope that it will be useful, but \e[4mWITHOUT ANY WARRANTY\e[0m and the user must run it under his own risk ."
echo -e "     "
echo -en "    Continue with installation? [Yy/Nn]"
read -p "" RESP
if [ "$RESP" != "y" ] && [ "$RESP" != "Y" ]; then
	echo -en "    Installation aborted. Bye."
fi
echo ""

#---------------------------------------------------------
#step 1.	CHECK IF SOFTWARE DEPENDENCIES ARE INSTALLED
echo -e "\033[1mSTEP 1/3. CHECKING SOFTWARE REQUISITES...\033[0m"
#---------------------------------------------------------
#	step 1.1	CHECK IF JAVA IS INSTALLED -------------
checkJavaInstallation

#---------------------------------------------------------
#	step 1.2	CHECK IF TOMCAT IS INSTALLED -------------
checkTomcatInstallation

#---------------------------------------------------------
#	step 1.2	CHECK IF MYSQL IS INSTALLED and RUNNING-
checkMySQLInstallation
echo ""
#---------------------------------------------------------
#step 2.	GET THE STATEGRA EMS BINARIES AND EXTRACT
getSTATegraEMSdata 2 4 
echo ""
#---------------------------------------------------------
#step 3.	COPY AND DEPLOY THE STATEGRAMEMS BINARY
deploySTATegraEMS 3 4
echo ""
#---------------------------------------------------------
#step 3.	COPY AND DEPLOY THE STATEGRAMEMS BINARY
configureSTATegraEMS 4 4
echo ""

quit 0

