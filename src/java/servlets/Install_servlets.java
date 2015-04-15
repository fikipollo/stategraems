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
import bdManager.DBConnectionManager;
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
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Properties;

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
                String mysqladminUser = null;
                String mysqladminPass = null;
                String dbname = null;
                String emsusername = null;
                String emsuserpass = null;
                String emsadminpass = null;
                String previousVersion = null;
                String newVersion = null;

                String installation_type = request.getParameter("installation_type");
                String data_location = request.getParameter("data_location");

                //SAVE THE STDOUT
                /**
                 * ************
                 * INSTALL OPTION ************
                 */
                if ("install".equals(installation_type)) {
                    mysqladminUser = request.getParameter("mysqladminUser");
                    mysqladminPass = request.getParameter("mysqladminPass");
                    dbname = request.getParameter("dbname");
                    emsusername = request.getParameter("emsusername");
                    emsuserpass = request.getParameter("emsuserpass");
                    emsadminpass = request.getParameter("emsadminpass");

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
                            line = line.replace("emsuser#123", emsuserpass);
                            line = line.replace("emsuser", emsusername);
                            line = line.replace("adminpassword", emsadminpass);
                            printWriter.println(line);
                        }
                        bufferedReader.close();
                        printWriter.close();

                        //2.Execute the SQL script
                        logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Executing SQL script");
                        String[] mysqlCommand = {"mysql", "-u", mysqladminUser, "--password=" + mysqladminPass, "-e", "source " + data_location + "/install_databases.sql"};
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
                            line = line.replace("emsuser#123", emsuserpass);
                            line = line.replace("emsuser", emsusername);
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
                        path = Install_servlets.class.getResource("/").getPath();
                        new File(path + "/../../index.html").delete();
                        new File(path + "/../../_index.html").renameTo(new File(path + "/../../index.html"));
                    } else {
                        throw new IOException("Unable to write at " + data_location + "</br>Please check if directory exists and Tomcat user has read/write permissions on this directory.");
                    }
                    /**
                     * UPDATE OPTION
                     */
                } else {
                    try {
                        mysqladminUser = request.getParameter("mysqladminUser");
                        mysqladminPass = request.getParameter("mysqladminPass");
                        previousVersion = request.getParameter("previous_version");
                        newVersion = request.getParameter("new_version");

                        File f = new File(data_location);
                        if (!f.exists()) {
                            throw new IOException("Unable to write at " + data_location + "</br>The directory doesn't exist.</br>Please check if parent directory exists and Tomcat user has read/write permissions on that directory.");
                        }

                        if (f.canWrite()) {
                            BufferedReader bufferedReader;
                            String path;
                            String line;
                            String commandOutput = "";
                            PrintWriter printWriter;
                            Properties properties = new Properties();

                            logWriter = new PrintWriter(new FileWriter(data_location + "/update.log"));
                            logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Data location is " + data_location);

                            properties.load(new FileReader(data_location + "/db_config.properties"));

                            dbname = properties.getProperty("databasename");
                            Double prevVersion = Double.parseDouble(previousVersion.replace("v", "")) + 0.1;
                            Double currentVersion = Double.parseDouble(newVersion.replace("v", "").replace("r1","")) + 0.1;

                            logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Upgrading from version " + prevVersion + " to " + currentVersion);

                            for (double i = prevVersion; i < currentVersion; i = i + 0.1) {
                                //1. Open the SQL Database update script,  Replace the database name 
                                logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Upgrading to version " + i);
                                path = Install_servlets.class.getResource("/sql_scripts/update_scripts/" + i + ".sql").getPath();

                                logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Adapting SQL script...");
                                bufferedReader = new BufferedReader(new FileReader(path));
                                printWriter = new PrintWriter(new FileWriter(data_location + "/" + i + ".sql"));
                                while ((line = bufferedReader.readLine()) != null) {
                                    line = line.replace("STATegraDB", dbname);
                                    printWriter.println(line);
                                }
                                bufferedReader.close();
                                printWriter.close();

                                //2.Execute the SQL script
                                logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Executing SQL script...");
                                String[] mysqlCommand = {"mysql", "-u", mysqladminUser, "--password=" + mysqladminPass, "-e", "source " + data_location + "/" + i + ".sql"};
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
                                new File(data_location + "/" + i + ".sql").delete();
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

                            //6. Remove the temporal files
                            logWriter.println(dateFormat.format(cal.getTime()) + '\t' + "Removing installation page...");
                            path = Install_servlets.class.getResource("/").getPath();
                            new File(path + "/../../index.html").delete();
                            new File(path + "/../../_index.html").renameTo(new File(path + "/../../index.html"));
                        } else {
                            throw new IOException("Unable to write at " + data_location + "</br>Please check if directory exists and Tomcat user has read/write permissions on this directory.");
                        }

                    } catch (IOException e) {
                        throw new IOException("Unable to read database configuration file at " + data_location + "</br>Please check if directory exists and Tomcat user has read/write permissions on this directory.");
                    }
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
                    response.getWriter().print("{success: " + true + " }");
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
