#!/bin/bash

previous_location=$(pwd)
install_dir=""
tomcat_location=""
mysql_user=""
mysql_database=""
server_subdomain="stategraems_app"


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

function selectEMSinstance {
	local status;
	local RESP;
	local valid_data;

	status=0
	echo -e "\033[1mSTEP $1/$2. PLEASE, CHOOSE THE STATegra EMS instance that will be removed.\033[0m"
	valid_data=1;
	while [ "$valid_data" = "1" ]; do
		files=$(cd $tomcat_location/webapps && ls *.war); 
		for file in $files; do 
			echo -e "\t"$file | sed 's/\.war//'; 
		done
		echo -e "\tWrite the instance name:"
		echo -n "            > ";read -p "" RESP
		valid_data=$(echo $files | grep -w $RESP);
		valid_data=$?;
		if [ "$valid_data" = "1" ]; then 
			echo -e "\tOption not valid, please try again (Ctrl + C to quit)";
		fi
	done
	server_subdomain=$RESP;
	echo -e "\tThe STATegra EMS instance "$server_subdomain" will be removed. Do you want to continue? [Yy/Nn]";
	echo -n "            > ";read -p "" RESP
	if [ "$RESP" != "Y" ] && [ "$RESP" != "y" ]; then
		echo -e "\tInstallation aborted."
		quit 1;
	fi
}

function backupConfFile {
	local status;
	local RESP;
	local valid_data;

	local data_location=$(cat $tomcat_location/webapps/$server_subdomain/WEB-INF/classes/conf/data_location.properties | grep data_location | sed 's/data_location=//')

	status=0
	echo -en "\033[1mSTEP $1/$2. SAVING STATegra EMS SETTINGS...\033[0m"

	cp $tomcat_location/webapps/$server_subdomain/WEB-INF/classes/conf/data_location.properties $data_location/data_location.properties
	cp $tomcat_location/webapps/$server_subdomain/resources/ServerConfiguration.js $data_location/ServerConfiguration.js
	status=$(($status || $?))
	if [ $status != 0 ];then 
		echo -e "\n\tUnable to save the STATegra EMS settings, \033[91;1minstallation aborted\033[0m, Try again later.";
		quit 1
	fi
	echo -e "\033[92;1mDONE\033[0m"
}

function removeDatabase {
	local status;
	local RESP;
	local valid_data;

	status=0
	echo -e "\033[1mSTEP $1/$2. REMOVING STATegra EMS Database...\033[0m"

	local data_location=$(cat $tomcat_location/webapps/$server_subdomain/WEB-INF/classes/conf/data_location.properties | grep data_location | sed 's/data_location=//')
	local databasename=$(cat $data_location/db_config.properties | grep databasename | sed 's/databasename=//');
	local userName=$(cat $data_location/db_config.properties | grep username | sed 's/username=//');
	local mysql_password
	
	echo -e "\tPlease type the MYSQL user name which will be used to create the database (must have DATABASE DELETION privileges)   "	
	echo -n "            > "; read -p "" mysql_user
	echo -e "\tPlease insert your MYSQL user password."
	echo -n "            > "; read -s mysql_password
	echo ""

	status=$(mysql -s -u $mysql_user --password=$mysql_password  -e "DROP DATABASE $databasename" 2>&1 | awk 'BEGIN {error=0}{if ($0 ~ /.*Access denied.*/ || $0 ~ /.*ERROR 1045.*/){error=1} else if ($0 ~ /.*ERROR.*/){ error=-1}} END { print error}')
	
	if [ $status == -1 ]; then 
		echo -e "\tAn error ocurred trying to remove the MYSQL database ($databasename). Installation aborted."
		quit 1
	elif [ $status == 1 ]; then
		echo -e "\tFailed trying to remove database($databasename). Check your MYSQL user name password and privileges and try again."
		removeDatabase $1 $2
	else
		echo -e "STEP $1/$2. REMOVING STATegra EMS Database ($databasename)...\033[92;1mDONE\033[0m"
	fi


	status=$(mysql -s -u $mysql_user --password=$mysql_password  -e "DELETE FROM mysql.user WHERE User='$userName'" 2>&1 | awk 'BEGIN {error=0}{if ($0 ~ /.*Access denied.*/ || $0 ~ /.*ERROR 1045.*/){error=1} else if ($0 ~ /.*ERROR.*/){ error=-1}} END { print error}')
	
	if [ $status == -1 ]; then 
		echo -e "\tAn error ocurred trying to remove the MYSQL user ($userName). Installation aborted."
		quit 1
	elif [ $status == 1 ]; then
		echo -e "\tFailed trying to remove database. Check your MYSQL user name password and privileges and try again."
		removeDatabase $1 $2
	else
		echo -e "STEP $1/$2. REMOVING STATegra EMS Database user ($userName)...\033[92;1mDONE\033[0m"
	fi


}

function undeploySTATegraEMS {
	local status;
	local RESP;
	local valid_data;
	local data_location=$(cat $tomcat_location/webapps/$server_subdomain/WEB-INF/classes/conf/data_location.properties | grep data_location | sed 's/data_location=//')

	status=0
	echo -e "\033[1mSTEP $1/$2. UNDEPLOYING PREVIOUS VERSION OF STATegra EMS...\033[0m"

	mv $tomcat_location/webapps/$server_subdomain".war" $data_location/$server_subdomain.war_old
	status=$(($status || $?))
	if [ $status != 0 ];then 
		echo -e "\n\tUnable to remove the previous version of the STATegra EMS, \033[91;1minstallation aborted\033[0m, Try again later.";
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
		echo -e "\n\tUnable to remove the previous version of the STATegra EMS, \033[91;1minstallation aborted\033[0m, Try again later.";
		quit 1
	fi
	echo -e "STEP $1/$2. UNDEPLOYING PREVIOUS VERSION OF STATegra EMS...\033[92;1mDONE\033[0m"

	echo -e "\n\tDo you want to REMOVE the data folder (analysis images, PDF documents...? (Yy/Nn)   "	
	echo -n "            > ";read -p "" RESP
    echo ""
	if [ "$RESP" = "y" ] || [ "$RESP" = "Y" ]; then
		rm -r $data_location
	fi

	echo -e "\033[1mUnistall finished successfully.\033[0m"
}

#---------------------------------------------------------
#step 1.	CHECK IF SOFTWARE DEPENDENCIES ARE INSTALLED
echo -e "\033[1mWELCOME TO THE STATegraEMS UNINSTALL.\033[0m"
echo -e "     This tool was developed to easily uninstall a STATegra EMS instance. "
echo -e "     Although this program has been checked and tested, it is distributed in the hope that it will be useful but WITHOUT ANY WARRANTY therefore the user must run it under his own risk."
echo -e "     "
echo -e "     \e[4mIt is highly recommended that you back-up the content of the database and the data directory of the application before continuing with the process.\e[0m"
echo -e "     "
echo -e "    Do you want to continue? [Yy/Nn]"
echo -en "    > "; read -p "" RESP
if [ "$RESP" != "y" ] && [ "$RESP" != "Y" ]; then
	echo -en "    Unistallation aborted. Bye."
fi
echo ""
#---------------------------------------------------------
#step 1.	CHECK IF SOFTWARE DEPENDENCIES ARE INSTALLED
echo -e "\033[1mSTEP 1/5. CHECKING SOFTWARE REQUISITES....\033[0m"
#---------------------------------------------------------
#	step 1.2	CHECK IF TOMCAT IS INSTALLED -------------
checkTomcatInstallation
#---------------------------------------------------------
#	step 1.2	CHECK IF MYSQL IS INSTALLED and RUNNING-
checkMySQLInstallation
echo ""
#---------------------------------------------------------
#step 2.	CHOOSE THE INSTANCE TO UPDATE
selectEMSinstance 2 5
echo ""
#---------------------------------------------------------
#step 4.	SAVE SETTINGS
backupConfFile 3 5
echo ""
#---------------------------------------------------------
#step 3.	REMOVE THE DATABASE
removeDatabase 4 5
echo ""
#---------------------------------------------------------
#step 4.	UNDEPLOY THE PREVIOUS VERSION 
undeploySTATegraEMS 5 5
echo ""
quit 0

