# STATegra EMS Autoinstaller

However an auto-install bash script for UNIX environments has been developed.
For automatic installation, download the script from this link and follow the installation steps.

# Manual installation
1.Download the last version for STATegra EMS binaries from this [link](http://bioinfo.cipf.es/stategraems/get-stategra-ems/) and extract the compressed file.

2.Copy the WAR file (stategraems_app.war) in the webapps directory located in the Tomcat directory.
If Tomcat is running, the WAR file should be automatically deployed, creating a new directory for the STATegra EMS application (*<tomcat_location>/webapps/stategraems_app*).

**Note**: By default, STATegra EMS will be accesible using *http://yourservernameandport/stategraems_app*, if you want to change this subdomain, i.e. stategraems_app, rename the WAR file before copying in the webapps.

3.If you decide to change the subdomain, edit the *ServerConfiguration.js* file (*<tomcat_location>/webapps/<new_subdomain_name>/resources/ServerConfiguration.js*) replacing the **SERVER_URL** value with the new subdomain name.

4.The STATegra EMS stores some files and images after users add new information in the system so it is necessary to specify the location for those files.
Whatever location you decide, please do not forget to set allow read/write access in this location to the Tomcat user.

By default, the location is */data*, if your are agree, just create the following directory structure under the */data* directory:

```
/data
|___stategra_ems_data
|___treatment_documents
|___SOP_documents
```

After that, copy the provided db_config.properties file into the /data/stategra_ems_data/ dir.
    
5.If you decide to change this location, choose your own location and create the following directory structure:

```
<Your Location>
|___stategra_ems_data
        |___treatment_documents
        |___SOP_documents
```
    
After that, copy the provided **db_config.properties** file into the *<Your Location>/stategra_ems_data* dir.
Finally, edit the data_location.properties file (*<tomcat_location>/webapps/<subdomain_name>/conf/data_location.properties*), replacing the **data_location** value with the new location (without the stategra_ems_data dir).

6.Run the provided SQL script (*databases.sql*) to install the STATegraEMS database.
  The used MySQL user must have DATABASE and USER CREATION privileges.

```
$ mysql -u your_mysql_user -p < databases.sql
```
    
7.Finally, add the Administrator user to the STATegraEMS database, setting the PASSWORD value to the password you choose.

```
$ echo "INSERT INTO STATegraDB.users VALUES('admin', SHA1('your_admin_password'),'');" | mysql -u your_mysql_user -p
```

