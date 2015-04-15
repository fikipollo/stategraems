#!/bin/bash

previous_location=$(pwd)
install_dir=""
tomcat_location=""
mysql_user=""
mysql_database=""
mysql_password=""
server_subdomain="stategraems_app"
limsuserPass=""
newUserName=""

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
	wget http://bioinfo.cipf.es/stategraems/dist/STATegraEMS_bin_last.tar.gz -P $install_dir -o $install_dir/install.log
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
	echo -e "            By default, STATegra EMS will be accesible using http://yourservername/stategraems_app."
	echo -en "            Do you want to change it? [Yy/Nn]"
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
				echo -e "            Are you agree? [Yy/Nn]"
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
	echo -e "STEP $1/$2. DEPLOYING STATegra EMS...\033[92;1mDONE\033[0m"
}

function installSTATegraEMSdatabase {
	local status
	local nUser
	local previousName
	
	echo -e "\033[1mSTEP $1/$2. INSTALLING STATegra EMS database...\033[0m"
	status=0
	cp databases.sql databases_tmp.sql
	echo -e "\tPlease type the MYSQL database name which will be used to create the database (by default STATegraDB, leave blank to use default)"
	echo -n "            > "; read -p "" mysql_database
	if [ "$mysql_database" == "" ]; then
		mysql_database="STATegraDB"
	fi
	sed -i "s/STATegraDB/$mysql_database/g" databases_tmp.sql


	echo -e "\tPlease type the MYSQL user name which will be used to create the database (must have DATABASE and USER CREATION privileges)"	
	echo -n "            > "; read -p "" mysql_user
	echo -e "\n\tPlease write your MYSQL user password."
	echo -n "            > "; read -s mysql_password
	echo ""
	
	#ASK FOR THE DATABASE USER PASSWORD
	echo -en "\t     Getting STATegra EMS database user name..."
	previousName=$(mysql -s -u $mysql_user --password=$mysql_password -e 'SELECT User from mysql.user WHERE User like "limsuser%" ORDER BY User DESC LIMIT 1;')
	status=$?;
	if [ "$status" = "1" ]; then
		echo -e "\tFailed trying to create database. Check your MYSQL user name password and privileges and try again."
		installSTATegraEMSdatabase $1 $2
		return
	fi

	if [[ $previousName = "" ]]; then 
		previousName="limsuser0"
	fi
	nUser=$(echo "$previousName" | awk '{split($1, ar, "limsuser");print ar[2]+1}')
	newUserName="limsuser$nUser"
	
	echo -e "\033[92;1mOK\033[0m\n\tUser $newUserName will be created."
	
	valid_data=1
	while [ $valid_data != 0 ]; do
		  echo -e "\t     Please type a password for the STATegra EMS database user ($newUserName)."
		  echo -n "            > "; read -s password1
		  echo ""
		  echo -e "\t     Please type again the password for the STATegra EMS database user ($newUserName)."
		  echo -n "            > "; read -s password2
		  if [ "$password1" == "" ] || [ "$password1" != "$password2" ] ; then
			      echo -e "\t     EMPTY PASSWORDS OR NOT MATCHING! Please try again."
			      echo ""
		  else
		      	valid_data=0
		      	limsuserPass=$password1
		  fi
	done

	#REPLACE THE DEFAULT PASSWORD BY THE NEW ONE 	
	sed -i 's/limsuser#123/'$limsuserPass'/g' databases_tmp.sql
	sed -i 's/limsuser/'$newUserName'/g' databases_tmp.sql
	echo ""
	echo -e "\t     INSTALLING DATABASE..."

	#CREATE THE DATABASE
	status=$(mysql -s -u $mysql_user --password=$mysql_password < databases_tmp.sql 2>&1 | awk 'BEGIN {error=0}{if ($0 ~ /.*Access denied.*/ || $0 ~ /.*ERROR 1045.*/){error=1; print $0 > "/dev/stderr"} else if ($0 ~ /.*ERROR.*/){ error=-1; print $0 > "/dev/stderr"}} END { print error}')
	
	if [ $status == -1 ]; then 
		echo -e "\tAn error ocurred trying to create the MYSQL database. Installation aborted."
		quit 1
	elif [ $status == 1 ]; then
		echo -e "\tFailed trying to create database. Check your MYSQL user name password and privileges and try again."
		installSTATegraEMSdatabase $1 $2
		return
	else
		echo -e "STEP $1/$2. INSTALLING STATegra EMS database...\033[92;1mDONE\033[0m"
	fi
}

function configureSTATegraEMS {
	local status
	local admin_user
	local valid_data
	local password1
	local password2
	local location
	local SERVER_URL
	
	status=0
	echo -en "\tA. UPDATING STATEGRA EMS CLIENT APP CONFIGURATION..."

	sed '1,2d' $tomcat_location/webapps/$server_subdomain/resources/ServerConfiguration.js > tmp
	status=$(($status || $?))

	if [ $status != 0 ];then 
		echo -e "\n\tUnable to find the ServerConfiguration file at "$tomcat_location". Installation aborted.";
		quit 1
	fi

	SERVER_URL="SERVER_URL='/"$server_subdomain"';"
	echo $SERVER_URL >  $tomcat_location/webapps/$server_subdomain/resources/ServerConfiguration.js
	status=$(($status || $?))

	echo "SERVER_PORT = '';" >> $tomcat_location/webapps/$server_subdomain/resources/ServerConfiguration.js
	status=$(($status || $?))

	cat tmp >> $tomcat_location/webapps/$server_subdomain/resources/ServerConfiguration.js
	status=$(($status || $?))

	if [ $status != 0 ];then 
		echo -e "\n\tError during ServerConfiguration file updating at "$tomcat_location". Installation aborted.";
		quit 1
	fi

	echo -e "...\033[92;1mDONE\033[0m"

	echo -e "\tB. ADMIN USER CONFIGURATION: The STATegra EMS has an special user with administrative privileges (user creation,etc.)."

	admin_user="admin"
	valid_data=1
	while [ $valid_data != 0 ]; do
		  echo -e "\t     Please type the administrator password."
		  echo -n "            > "; read -s password1
		  echo -e "\n\t     Please type again the administrator password."
		  echo -n "            > "; read -s password2
		  if [ "$password1" == "" ] || [ "$password1" != "$password2" ] ; then
		          echo -e "\n\t     EMPTY PASSWORDS OR NOT MATCHING! Please try again."
		          echo ""
		  else
		          valid_data=0
		  fi
	done

	#ADD THE ADMINISTRATOR USER TO THE DATABASE
	echo -en "\n\t     Adding administrator to database..."
	echo "INSERT INTO "$mysql_database".users VALUES('"$admin_user"',SHA1('"$password1"'),'',null);" | mysql -u $mysql_user --password=$mysql_password

	status=$?
	if [ $status == 1 ]; then 
		  echo -e "FAIL\n\tAn error ocurred update the STATEGRA EMS configuration."
		  quit 1
	fi
	echo -e "\033[92;1mDONE\033[0m\n\t     Administrator user (admin) created successfully, Don't forget the admin password!."


	echo -e "\tC. DOCUMENTS AND IMAGES STORING: The STATegra EMS stores some files and images after users add new information in the system so it is necessary to specify the location for those files. "
	echo -e "\t     By default, files will be stored at /data/. Type your own location or leave blank to use default."
	echo -e "\t     Please do not forget to set allow read/write access in this location to the Tomcat user."

	valid_data=1
	while [ $valid_data != 0 ]; do
		echo -e "\t     Please type the directory for files storage (leave blank to use default /data/)."
		echo -n "            > "; read -e -p "" location
		if [ "$location" != "" ] ; then
			if [ ! -d "$location" ]; then
				echo -e "\t     Invalid location, directory not found."
				echo ""
			else
				valid_data=0
			fi
		else
			location="/data/"
			if [ ! -d "/data/" ]; then
				mkdir /data/
			fi
			valid_data=0
		fi
	done

	echo "data_location="$location"/"$server_subdomain"_data" > $tomcat_location/webapps/$server_subdomain/WEB-INF/classes/conf/data_location.properties
	status=$(($status || $?))
	
	mkdir $location/$server_subdomain"_data"/
	mkdir $location/$server_subdomain"_data"/treatment_documents
	mkdir $location/$server_subdomain"_data"/SOP_documents

	cp db_config.properties $location/$server_subdomain"_data"/
	sed -i "s/STATegraDB/$mysql_database/g" $location/$server_subdomain"_data"/db_config.properties
	sed -i "s/limsuser#123/$limsuserPass/g" $location/$server_subdomain"_data"/db_config.properties
	sed -i "s/limsuser/$newUserName/g" $location/$server_subdomain"_data"/db_config.properties
	
mysql_password=""

	echo -e "\033[1mInstallation finished successfully.\033[0m"
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
echo -e "\033[1mSTEP 1/5. CHECKING SOFTWARE REQUISITES...\033[0m"
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
getSTATegraEMSdata 2 5 
echo ""
#---------------------------------------------------------
#step 3.	COPY AND DEPLOY THE STATEGRAMEMS BINARY
deploySTATegraEMS 3 5
echo ""
#---------------------------------------------------------
#step 4.	INSTALL DATABASE
installSTATegraEMSdatabase 4 5
echo ""
#---------------------------------------------------------
#step 5.	CONFIGURE STATegraEMS
echo -e "\033[1mSTEP 5/5. CONFIGURING STATegra EMS...\033[0m"
configureSTATegraEMS
echo ""
quit 0

