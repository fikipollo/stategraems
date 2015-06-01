<div class="imageContainer" style="" >
    <img src="img/stategraems_logo.png" title="STATegra EMS LOGO."/>
</div>

# STATegra EMS Autoinstaller

Since version 0.6, the STATegra EMS includes an auto-installer script which makes easier to deploy and configure the the system. 

1. Download the last version for the STATegra EMS **Unix command line autoinstaller** from this [link](http://bioinfo.cipf.es/stategraems/get-stategra-ems/) and follow the instructions:
    -  First, the auto-installer will check all the dependencies and download the last binaries.
    -  By default, the application will be accessible using *http://yourservernameandport/**stategraems_app***, but the installer will ask you to change that, in case that you prefer other subdomain, e.g. use *experiment_manager* instead of *stategraems_app*.
    -  Finally, the application will be deployed and configured. 
2. The STATegra EMS will store some files and images while users add new information into the system so we need to specify the location for those files (default location is */data*).
Whatever location you decide, please do not forget to **set allow read/write access** in this location to the Tomcat user.   

2. Now, open your favourite browser, navigate to the STATegra EMS application instance ( *http://yourservernameandport/**stategraems_app***) and follow the instructions to finish the installation.   
If everything is valid, you will be redirected to the main page of the STATegra EMS.   
**Note:** in case that you changed the default subdomain, the application must be reloaded after configuration, in order to update the new settings (e.g. via the Tomcat Manager). 

<div class="imageContainer" style="text-align:center; font-size:10px; color:#898989" >
    <img src="img/4_installation_2.jpg" title="Fill the form to finish the installation."/>
</div>


# STATegra EMS Manual installation

Alternatively, you can install the application manually, instead of using the auto-installer.
    
1. Download the last version of the STATegra EMS binaries from this [link](http://bioinfo.cipf.es/stategraems/get-stategra-ems/) and follow the instructions:
    
2. By default, STATegra EMS will be accesible using *http://yourservernameandport/**stategraems_app***, if you want to change this subdomain, e.g. use *experiment_manager* instead of *stategraems_app*, rename the **WAR** file before loading it into Tomcat.    

3. Open the Tomcat Application manager and load the WAR file (stategraems_app.war). Tomcat should automatically deploy the application, creating a new directory for the STATegra EMS, at *{tomcat_location}/webapps/stategraems_app*.   
Alternatively, instead of using the Tomcat Manager, you can copy copy the WAR file (*stategraems_app.war*) into the *webapps* directory located in the Tomcat directory, Tomcat should automatically deploy the application. 

4. In case that you decided to change the default subdomain, edit the *ServerConfiguration.js* file (*{tomcat_location}/webapps/{new_subdomain_name}/resources/ServerConfiguration.js*) replacing the **SERVER_URL** value with the new subdomain name.

5. The STATegra EMS will store some files and images while users add new information into the system so we need to specify the location for those files (default location is */data*).
Whatever location you decide, please do not forget to **set allow read/write access** in this location to the Tomcat user.   

6. Create the following directory structure under the /data directory or the choosen location:

            [Your Location]
                  |___stategra_ems_data # or the name that you prefer
                          |___treatment_documents
                          |___SOP_documents
    
7. Copy the file **db_config.properties** included in the compressed file, into the *[Your Location]/stategra_ems_data* dir.  
Adapt the Database settings if you consider it necessary.

8. Edit the *data_location.properties* file located at *[tomcat_location]/webapps/<subdomain_name>/WEB-INF/classes/conf/data_location.properties*), replacing the **data_location** value by the new location.

9. Adapt the SQL script included in the compressed file.  
**Database name** must be the same than in the *db_config.properties* file.  
By default, a new MySQL user will be created for database management, change the username and the default password if you consider it necessary.  
Finally, please note that, by default, the STATegra EMS included an administrator user *admin* with default password *adminpassword*. Edit the SQL script and change this password or change the password later, using the account settings.

10. Run the SQL script in order to install the STATegraEMS database.  
The MySQL user must have DATABASE and USER CREATION privileges.

        $ mysql -u your_mysql_user -p < databases.sql
    
