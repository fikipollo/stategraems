/* ***************************************************************
 *  This file is part of STATegra EMS.
 *
 *  STATegra EMS is free software: you can redistribute it and/or 
 *  modify it under the terms of the GNU General Public License as
 *  published by the Free Software Foundation, either version 3 of 
 *  the License, or (at your option) any later version.
 * 
 *  STATegra EMS is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with STATegra EMS.  If not, see <http://www.gnu.org/licenses/>.
 * 
 *  More info http://bioinfo.cipf.es/stategraems
 *  Technical contact stategraemsdev@gmail.com
 *  *************************************************************** */
package servlets;

import bdManager.DAO.DAO;
import bdManager.DAO.DAOProvider;
import bdManager.DAO.User_JDBCDAO;
import bdManager.DBConnectionManager;
import classes.User;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import common.ServerErrorManager;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Properties;
import resources.SHA1;

/**
 * SERVLET /login
 *
 * This class implements the user LOG-IN, LOG-OUT functionality, User_servlets
 * requests could be carried out only via POST.
 *
 * @author Rafa Hernández de Diego
 *
 */
//@WebServlet(name = "user_servlets", urlPatterns = {"/install"})
public class Install_servlets extends Servlet {

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("text/html");

        if (request.getServletPath().equals("/install")) {
            installPostHandler(request, response);
        } else if (request.getServletPath().equals("/is_valid_installation")) {
            checkInstallationValidityPostHandler(request, response);
        } else {
            common.ServerErrorManager.addErrorMessage(3, Install_servlets.class.getName(), "doPost", "What are you doing here?.");
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     * **************************************************************************
     ****************************************************************************
     * USER LOG-IN HANDLER
     * ***************************************************************************
     * **************************************************************************
     */
    private void checkInstallationValidityPostHandler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Properties properties = new Properties();
        properties.load(DBConnectionManager.class.getResourceAsStream("/conf/data_location.properties"));
        String data_location = properties.getProperty("data_location");
        File f = new File(data_location + "/db_config.properties");
        boolean valid = f.exists();

        JsonObject obj = new JsonObject();
        obj.add("success", new JsonPrimitive(valid));

        String is_docker = System.getenv("is_docker");
//        String is_docker = properties.getProperty("is_docker");
        obj.add("is_docker", new JsonPrimitive("true".equals(is_docker)));

        response.getWriter().print(obj.toString());
    }

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void installPostHandler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            PrintWriter logWriter = null;

            DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            Calendar cal = Calendar.getInstance();

            try {
                /**
                 * *******************************************************
                 * STEP 1 Check if the user exists in the DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 2b throws
                 * NoSuchAlgorithmException, GO TO STEP 2b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                String installation_type = requestData.get("installation_type").getAsString();
                String data_location = requestData.get("data_location").getAsString();

                String emsadminpass = requestData.get("emsadminpass").getAsString();
                String emsadminuser = requestData.get("emsadminuser").getAsString().toLowerCase();

                /* *******************************************************
                 * INSTALL OPTION
                 * *******************************************************/
                if ("install".equals(installation_type)) {
                    String mysql_emsusername = requestData.get("emsusername").getAsString();
                    String mysql_emsuserpass = requestData.get("emsuserpass").getAsString();
                    String mysql_adminUser = requestData.get("mysqladminUser").getAsString();
                    String mysql_adminPass = requestData.get("mysqladminPass").getAsString();
                    String dbname = requestData.get("dbname").getAsString();
                    String dbhost = requestData.get("dbhost").getAsString();

                    String userHost = ("localhost".equals(dbhost)?dbhost:"%");

                    File f = new File(data_location);
                    if (!f.exists()) {
                        try {
                            f.mkdirs();
                        } catch (Exception e) {
                            throw new IOException("Unable to write at " + data_location + "</br>The directory doesn't exist and Tomcat was unable to create it.</br>Please check if parent directory exists and Tomcat user has read/write permissions on that directory.");
                        }
                    }

                    if (f.canWrite()) {
                        BufferedReader bufferedReader;
                        String path;
                        String line;
                        String commandOutput = "";
                        PrintWriter printWriter;
                        Properties properties;

                        logWriter = new PrintWriter(new FileWriter(data_location + "/install.log"));
                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Data location is " + data_location);

                        //1. Open the SQL Database install script,  Replace the database name and the EMS user name
                        path = Install_servlets.class.getResource("/sql_scripts/install_databases.sql").getPath();
                        bufferedReader = new BufferedReader(new FileReader(path));
                        printWriter = new PrintWriter(new FileWriter(data_location + "/install_databases.sql"));
                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Adapting SQL script");
                        while ((line = bufferedReader.readLine()) != null) {
                            line = line.replace("STATegraDB", dbname);
                            line = line.replace("emsuser#123", mysql_emsuserpass);
                            line = line.replace("emsuser", mysql_emsusername);
                            line = line.replace("adminpassword", emsadminpass);
                            line = line.replace("localhost", userHost);

                            printWriter.println(line);
                        }
                        bufferedReader.close();
                        printWriter.close();

                        //2.Execute the SQL script
                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Executing SQL script");
                        String[] mysqlCommand = {"mysql", "-u", mysql_adminUser, "--password=" + mysql_adminPass, "-h", dbhost, "-e", "source " + data_location + "/install_databases.sql"};
                        Process dumpProcess = Runtime.getRuntime().exec(mysqlCommand);

                        bufferedReader = new BufferedReader(new InputStreamReader(dumpProcess.getInputStream()));
                        line = bufferedReader.readLine();
                        // Mientras se haya leido alguna linea 
                        while (line != null) {
                            commandOutput += "\n" + line;
                            line = bufferedReader.readLine();
                        }
                        int exitCode = dumpProcess.waitFor();
                        logWriter.println("/************************************************************/\n*** STDOUT\n/************************************************************/");

                        logWriter.println(commandOutput);

                        //GET THE ERROR OUTPUT
                        commandOutput = "";
                        bufferedReader = new BufferedReader(new InputStreamReader(dumpProcess.getErrorStream()));
                        line = bufferedReader.readLine();
                        while (line != null) {
                            commandOutput += "\n" + line;
                            line = bufferedReader.readLine();
                        }
                        logWriter.println("/************************************************************/\n*** STDERR\n/************************************************************/");
                        logWriter.println(commandOutput);

                        if (exitCode != 0) {
                            throw new SQLException("Failed while executing the mysql database installation. Error: " + commandOutput.replace("\n", "</br>").replace("\r", "</br>"));
                        }

                        //3. Update the data location property
                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Updating the application settings...");
                        path = Install_servlets.class.getResource("/conf/data_location.properties").getPath();
                        properties = new Properties();
                        properties.load(new FileReader(path));

                        FileOutputStream fileOutputStream = new FileOutputStream(path);
                        properties.setProperty("data_location", data_location);
                        properties.store(fileOutputStream, null);
                        fileOutputStream.close();

                        //4. COPY AND UPDATE the db_config.properties file 
                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Updating the database connection settings...");
                        path = Install_servlets.class.getResource("/sql_scripts/db_config.properties").getPath();
                        bufferedReader = new BufferedReader(new FileReader(path));
                        printWriter = new PrintWriter(new FileWriter(data_location + "/db_config.properties"));

                        while ((line = bufferedReader.readLine()) != null) {
                            line = line.replace("STATegraDB", dbname);
                            line = line.replace("emsuser#123", mysql_emsuserpass);
                            line = line.replace("emsuser", mysql_emsusername);
                            line = line.replace("localhost", dbhost);
                            printWriter.println(line);
                        }
                        bufferedReader.close();
                        printWriter.close();

                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Creating directories...");
                        //5. Create all the necessary directories
                        new File(data_location + "/SOP_documents").mkdir();
                        new File(data_location + "/treatment_documents").mkdir();

                        //6. Remove the temporal files
                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Cleaning temporal files...");
                        new File(data_location + "/install_databases.sql").delete();

                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Removing installation page...");
                    } else {
                        throw new IOException("Unable to write at " + data_location + "</br>Please check if directory exists and Tomcat user has read/write permissions on this directory.");
                    }
                }

                try {
                    /**
                     * ***********************************************************************************************************************
                     */
                    /* UPDATE OPTION                                                                                                          */
                    /**
                     * ***********************************************************************************************************************
                     */

                    //CHECK IF USER IS VALID ADMIN
                    String password = SHA1.getHash(emsadminpass);
                    Object[] params = {password, false, false};
                    DAO dao_instance = DAOProvider.getDAOByName("User");
                    User user = (User) ((User_JDBCDAO) dao_instance).findByID("admin", params);

                    if (user == null) {
                        throw new IOException("Unable to update databases. Invalid admin password.");
                    }

                    //GET PREVIOUS VERSION FROM DATABASE
                    PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT version FROM appVersion;");
                    ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
                    double currentAppVersion = 0.6 * 10;
                    if (rs.first()) {
                        currentAppVersion = Double.parseDouble(rs.getString("version")) * 10;
                    }

                    //GET LAST UPDATE SCRIPT
                    String path = Install_servlets.class.getResource("/sql_scripts/update_scripts/").getPath();
                    double lastAppVersion = currentAppVersion;
                    boolean exists = true;
                    File f;
                    while (exists) {
                        lastAppVersion = lastAppVersion + 1;
                        f = new File(path + lastAppVersion / 10 + ".sql");
                        exists = f.exists();
                    }

                    //START UPDATING
                    f = new File(data_location);
                    if (!f.exists()) {
                        throw new IOException("Unable to write at " + data_location + "</br>The directory doesn't exist.</br>Please check if parent directory exists and Tomcat user has read/write permissions on that directory.");
                    }

                    if (f.canWrite()) {
                        BufferedReader bufferedReader;
                        String line;
                        String commandOutput = "";
                        PrintWriter printWriter;
                        Properties properties = new Properties();

                        logWriter = new PrintWriter(new FileWriter(data_location + "/update.log"));
                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Data location is " + data_location);

                        properties.load(new FileReader(data_location + "/db_config.properties"));

                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Upgrading from version " + currentAppVersion + " to " + (lastAppVersion - 0.1));

                        //FOR EACH AVAILABLE NEW VERSION
                        for (double i = currentAppVersion + 1; i < lastAppVersion; i = i + 1) {
                            String dbuser = DBConnectionManager.getConnectionManager().getProperties().getProperty("username");
                            String dbpass = DBConnectionManager.getConnectionManager().getProperties().getProperty("password");
                            String dbname = DBConnectionManager.getConnectionManager().getProperties().getProperty("databasename");
                            String dbhost = DBConnectionManager.getConnectionManager().getProperties().getProperty("url");
                            dbhost = dbhost.replace("jdbc:mysql://", "").replace("/" + dbname, "");

                            //1. Open the SQL Database update script,  Replace the database name 
                            logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Upgrading to version " + i / 10);
                            path = Install_servlets.class.getResource("/sql_scripts/update_scripts/" + i / 10 + ".sql").getPath();

                            logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Adapting SQL script...");
                            bufferedReader = new BufferedReader(new FileReader(path));
                            printWriter = new PrintWriter(new FileWriter(data_location + "/" + i / 10 + ".sql"));
                            while ((line = bufferedReader.readLine()) != null) {
                                line = line.replace("STATegraDB", dbname);
                                line = line.replace("emsadminuser@email.com", emsadminuser);
                                printWriter.println(line);
                            }
                            bufferedReader.close();
                            printWriter.close();

                            //2.Execute the SQL script
                            logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Executing SQL script...");
                            String[] mysqlCommand = {"mysql", "-u", dbuser, "--password=" + dbpass, "-h", dbhost, "-e", "source " + data_location + "/" + i / 10 + ".sql"};
                            Process dumpProcess = Runtime.getRuntime().exec(mysqlCommand);

                            bufferedReader = new BufferedReader(new InputStreamReader(dumpProcess.getInputStream()));
                            line = bufferedReader.readLine();
                            // Mientras se haya leido alguna linea 
                            while (line != null) {
                                commandOutput += "\n" + line;
                                line = bufferedReader.readLine();
                            }
                            int exitCode = dumpProcess.waitFor();

                            //SAVE THE STDOUT
                            logWriter.println("/************************************************************/\n*** STDOUT\n/************************************************************/");
                            logWriter.println(commandOutput);

                            //GET THE ERROR OUTPUT
                            commandOutput = "";
                            bufferedReader = new BufferedReader(new InputStreamReader(dumpProcess.getErrorStream()));
                            line = bufferedReader.readLine();
                            while (line != null) {
                                commandOutput += "\n" + line;
                                line = bufferedReader.readLine();
                            }
                            logWriter.println("/************************************************************/\n*** STERR\n/************************************************************/");
                            logWriter.println(commandOutput);

                            if (exitCode != 0) {
                                throw new SQLException("Failed while executing the mysql database update script. Error: " + commandOutput);
                            }
                            logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Executing SQL script... DONE");
                            logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Cleaning temporal files...");
                            new File(data_location + "/" + i / 10 + ".sql").delete();
                        }

                        //3. Update the data location property
                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Updating the application settings...");
                        path = Install_servlets.class.getResource("/conf/data_location.properties").getPath();
                        properties = new Properties();
                        properties.load(new FileReader(path));

                        FileOutputStream fileOutputStream = new FileOutputStream(path);
                        properties.setProperty("data_location", data_location);
                        properties.store(fileOutputStream, null);
                        fileOutputStream.close();

                        //6. Remove the temporal redirection
//                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Disabling installation page...");
//                        path = Install_servlets.class.getResource("/").getPath();
//                        new File(path + "/../../index.html").delete();
//                        new File(path + "/../../install.html").delete();
//                        new File(path + "/../../_index.html").renameTo(new File(path + "/../../index.html"));
                    } else {
                        throw new IOException("Unable to write at " + data_location + "</br>Please check if directory exists and Tomcat user has read/write permissions on this directory.");
                    }

                } catch (IOException e) {
                    throw new IOException("Unable to read database configuration file at " + data_location + "</br>Please check if directory exists and Tomcat user has read/write permissions on this directory.");
                }

            } catch (Exception e) {
                if (logWriter != null) {
                    logWriter.println(dateFormat.format(cal.getTime()) + "\t INSTALLATION FAILED " + e.getMessage());
                }
                ServerErrorManager.handleException(e, Install_servlets.class.getName(), "installPostHandler", e.getMessage());
            } finally {
                if (logWriter != null) {
                    logWriter.close();
                }

                /**
                 * *******************************************************
                 * STEP 3b CATCH ERROR. GO TO STEP 4
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                } else {
                    /**
                     * *******************************************************
                     * STEP 3A WRITE RESPONSE ERROR. GO TO STEP 4
                     * *******************************************************
                     */
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    response.getWriter().print(obj.toString());
                }
                /**
                 * *******************************************************
                 * STEP 4 FORCE DBConnection Reloaded
                 * ********************************************************
                 */
//                Properties properties = new Properties();
//                properties.load(DBConnectionManager.class.getResourceAsStream("/conf/data_location.properties"));
//                String data_location = properties.getProperty("data_location");
//                this.DATA_LOCATION = data_location;
//                DBConnectionManager.setDataLocation(data_location);
//                DBConnectionManager.reloadConnectionManager();
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Install_servlets.class.getName(), "userLoginPostHandler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }
}
