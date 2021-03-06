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
import classes.Experiment;
import classes.ExternalSource;
import classes.User;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import common.ExtensionLoader;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import common.ServerErrorManager;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.OutputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.AccessControlException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import java.util.Map;
import javax.servlet.http.Cookie;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.codec.binary.Base64;

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;

/**
 *
 * SERVLET FOR MESSAGES:
 * +----------------------+-------------------+---------------+-----------------------+---------------------+
 * | Resource             | POST              | GET           | PUT                   | DELETE              |
 * +----------------------+-------------------+---------------+------------------------------+--------------+
 * | /rest/files          | Upload a new file | List files    | -                     | -                   |
 * +----------------------+-------------------+---------------+-----------------------+---------------------+
 * | /rest/files/1234     | -                 | Download file | If exist replace file | Delete file         |
 * +----------------------+-------------------+---------------+-----------------------+---------------------+
 * | /rest/files/send     | Send selection    |   -           | -                     | -                   |
 * +----------------------+-------------------+---------------+-----------------------+---------------------+
 *
 */
public class File_servlets extends Servlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/send")) {
            send_file_handler(request, response);
        } else if (matchService(request.getPathInfo(), "/(.+)")) {
            //Do nothing
        } else {
            add_new_file_handler(request, response);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            get_file_handler(request, response);
        } else {
            get_all_files_handler(request, response);
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            update_file_handler(request, response);
        } else {
            //Do nothing
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            delete_file_handler(request, response);
        } else {
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * POST REQUEST HANDLERS                                                                    *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void add_new_file_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO daoInstance;
            File uploadedFile;
            Experiment experiment;
            String parent_dir;
            String file_name;

            try {

                if (!ServletFileUpload.isMultipartContent(request)) {
                    throw new Exception("Erroneus request.");
                }

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                Map<String, Cookie> cookies = this.getCookies(request);

                String loggedUser, loggedUserID = null, sessionToken;
                if (cookies != null) {
                    loggedUser = cookies.get("loggedUser").getValue();
                    sessionToken = cookies.get("sessionToken").getValue();
                    loggedUserID = cookies.get("loggedUserID").getValue();
                } else {
                    String apicode = request.getParameter("apicode");
                    apicode = new String(Base64.decodeBase64(apicode));

                    loggedUser = apicode.split(":")[0];
                    sessionToken = apicode.split(":")[1];
                }

                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                if (loggedUserID == null) {
                    daoInstance = DAOProvider.getDAOByName("User");
                    loggedUserID = ((User) daoInstance.findByID(loggedUser, new Object[]{null, false, true})).getUserID();
                }

                /**
                 * *******************************************************
                 * STEP 2 Get the Experiment Object from DB. IF ERROR --> throws
                 * MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                String experiment_id;
                if (request.getParameter("experiment_id") != null) {
                    experiment_id = request.getParameter("experiment_id");
                } else {
                    experiment_id = cookies.get("currentExperimentID").getValue();
                }

                parent_dir = "";
                if (request.getParameter("parent_dir") != null) {
                    parent_dir = request.getParameter("parent_dir");
                }

                file_name = "";
                if (request.getParameter("file_name") != null) {
                    file_name = request.getParameter("file_name");
                }
                /**
                 * *******************************************************
                 * STEP 3 Check that the user is a valid owner for the
                 * experiment.
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("Experiment");
                experiment = (Experiment) daoInstance.findByID(experiment_id, null);

                if (!experiment.isOwner(loggedUserID) && !experiment.isMember(loggedUserID) && !isValidAdminUser(loggedUser)) {
                    throw new AccessControlException("Cannot add files to selected study. Current user is not a valid member for study " + experiment_id + ".");
                }

                /**
                 * *******************************************************
                 * STEP 4 Read the uploaded file and store in a temporal dir.
                 * *******************************************************
                 */
                FileItem tmpUploadedFile = null;
                final String CACHE_PATH = "/tmp/";
                final int CACHE_SIZE = 500 * (int) Math.pow(10, 6);
                final int MAX_REQUEST_SIZE = 600 * (int) Math.pow(10, 6);
                final int MAX_FILE_SIZE = 500 * (int) Math.pow(10, 6); //TODO: READ FROM SETTINGS

                // Create a factory for disk-based file items
                DiskFileItemFactory factory = new DiskFileItemFactory();
                // Set factory constraints
                factory.setRepository(new File(CACHE_PATH));
                factory.setSizeThreshold(CACHE_SIZE);

                // Create a new file upload handler
                ServletFileUpload upload = new ServletFileUpload(factory);
                // Set overall request size constraint
                upload.setSizeMax(MAX_REQUEST_SIZE);
                upload.setFileSizeMax(MAX_FILE_SIZE);

                // Parse the request
                List<FileItem> items = upload.parseRequest(request);
                for (FileItem item : items) {
                    if (!item.isFormField()) {
                        if (!item.getName().equals("")) {
                            tmpUploadedFile = item;
                        }
                    }
                }

                if (tmpUploadedFile == null) {
                    throw new Exception("The file was not uploaded correctly.");
                }

                /**
                 * *******************************************************
                 * STEP 5 SAVE THE FILE IN THE SERVER.
                 * *******************************************************
                 */
                //First check if the file already exists -> error, probably a previous treatmente exists with the same treatment_id
                Path tmpDir = Files.createTempDirectory(null);
                file_name = (file_name.isEmpty() ? tmpUploadedFile.getName() : file_name);
                uploadedFile = new File(tmpDir.toString(), file_name);

                try {
                    tmpUploadedFile.write(uploadedFile);

                    if (request.getParameter("credentials") != null) {
                        byte[] decoded = Base64.decodeBase64(request.getParameter("credentials"));
                        String[] credentials = new String(decoded).split(":", 2);
                        experiment.setDataDirectoryUser(credentials[0]);
                        experiment.setDataDirectoryPass(credentials[1]);
                    } else if (request.getParameter("apikey") != null) {
                        experiment.setDataDirectoryApiKey(request.getParameter("apikey"));
                    }

                    FileManager.getFileManager(DATA_LOCATION).saveFiles(new File[]{uploadedFile}, experiment.getDataDirectoryInformation(), parent_dir);
                } catch (IOException e) {
                    // Directory creation failed
                    throw new Exception("Unable to save the uploded file. Please check if the Tomcat user has read/write permissions over the data application directory.");
                } finally {
                    tmpUploadedFile.delete();
                    uploadedFile.delete();
                    Files.delete(tmpDir);
                }
            } catch (Exception e) {
                ServerErrorManager.handleException(e, File_servlets.class.getName(), "add_new_file_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 5b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    response.getWriter().print(obj.toString());
                }
            }
        } catch (Exception e) {
            ServerErrorManager.handleException(e, File_servlets.class.getName(), "add_new_file_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     * This function sends a file to an external application (e.g. a Galaxy
     * server).
     *
     * @param request
     * @param response
     * @throws IOException
     */
    private void send_file_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO daoInstance = null;
            String errors = "";
            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                Map<String, Cookie> cookies = this.getCookies(request);

                String loggedUser, loggedUserID = null, sessionToken;
                loggedUser = cookies.get("loggedUser").getValue();
                sessionToken = cookies.get("sessionToken").getValue();
                loggedUserID = cookies.get("loggedUserID").getValue();

                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get the Experiment Object from DB. IF ERROR --> throws
                 * MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                ArrayList<String> files = new ArrayList<String>();
                Iterator<JsonElement> it = requestData.get("files").getAsJsonArray().iterator();
                while (it.hasNext()) {
                    files.add(it.next().getAsString());
                }

                String source_id = requestData.get("source_id").getAsString();
                daoInstance = DAOProvider.getDAOByName("ExternalSource");
                ExternalSource externalSource = (ExternalSource) daoInstance.findByID(source_id, null);

                //CONFIGURE THE DESTINATION SETTINGS
                HashMap<String, String> destination_settings = new HashMap<String, String>();
                destination_settings.put("type", externalSource.getType());
                destination_settings.put("host", externalSource.getUrl());

                if (requestData.get("credentials") != null && !"".equals(requestData.get("credentials").getAsString())) {
                    String credentials = requestData.get("credentials").getAsString();
                    credentials = new String(Base64.decodeBase64(credentials));
                    destination_settings.put("user", credentials.split(":")[0]);
                    destination_settings.put("pass", (credentials.split(":").length > 1 ? credentials.split(":")[1] : ""));
                } else {
                    String apikey = requestData.get("apikey").getAsString();
                    destination_settings.put("apikey", apikey);
                }

                String experiment_id;
                if (request.getParameter("experiment_id") != null) {
                    experiment_id = requestData.get("experiment_id").getAsString();
                } else {
                    experiment_id = cookies.get("currentExperimentID").getValue();
                }

                /**
                 * *******************************************************
                 * STEP 3 Check that the user is a valid owner for the
                 * experiment.
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("Experiment");
                Experiment experiment = (Experiment) daoInstance.findByID(experiment_id, null);

                if (!experiment.isOwner(loggedUserID) && !experiment.isMember(loggedUserID) && !loggedUserID.equals("admin")) {
                    throw new AccessControlException("Cannot get files for selected study. Current user is not a valid member for study " + experiment_id + ".");
                }

                /**
                 * *******************************************************
                 * STEP 3 SEND THE FILES IN THE SERVER. IF ERROR --> throws
                 * exception if not valid session, GO TO STEP 6b ELSE --> GO TO
                 * STEP 3
                 * *******************************************************
                 */
                for (String file_path : files) {
                    try {
                        FileManager.getFileManager(DATA_LOCATION).sendFile(file_path, experiment.getDataDirectoryInformation(), destination_settings);
                    } catch (Exception e) {
                        errors += "Failed while sending file " + file_path + "\n";
                    }
                }

            } catch (Exception e) {
                ServerErrorManager.handleException(e, File_servlets.class.getName(), "send_file_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 5b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    obj.add("errors", new JsonPrimitive(errors));
                    response.getWriter().print(obj.toString());
                }
            }
        } catch (Exception e) {
            ServerErrorManager.handleException(e, File_servlets.class.getName(), "send_file_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * GET REQUEST HANDLERS                                                                     *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void get_all_files_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            String directoryContent = "";
            try {
                Map<String, Cookie> cookies = this.getCookies(request);
                String loggedUser = cookies.get("loggedUser").getValue();
                String sessionToken = cookies.get("sessionToken").getValue();
                String loggedUserID = cookies.get("loggedUserID").getValue();

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get the Experiment Object from DB. IF ERROR --> throws
                 * MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                String experiment_id;
                if (request.getParameter("experiment_id") != null) {
                    experiment_id = request.getParameter("experiment_id");
                } else {
                    experiment_id = cookies.get("currentExperimentID").getValue();
                }

                /**
                 * *******************************************************
                 * STEP 3 Check that the user is a valid owner for the
                 * experiment.
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                Experiment experiment = (Experiment) dao_instance.findByID(experiment_id, null);

                if (!experiment.isOwner(loggedUserID) && !experiment.isMember(loggedUserID) && !loggedUserID.equals("admin")) {
                    throw new AccessControlException("Cannot get files for selected Experiment. Current user is not a valid member for this Experiment.");
                }

                if (request.getParameter("credentials") != null) {
                    byte[] decoded = Base64.decodeBase64(request.getParameter("credentials"));
                    String[] credentials = new String(decoded).split(":", 2);
                    experiment.setDataDirectoryUser(credentials[0]);
                    experiment.setDataDirectoryPass(credentials[1]);
                } else if (request.getParameter("apikey") != null) {
                    experiment.setDataDirectoryApiKey(request.getParameter("apikey"));
                }
                //If using an external storage and pass or user is not set
                if (!("local_directory".equals(experiment.getDataDirectoryInformation().get("type")) || "none".equals(experiment.getDataDirectoryInformation().get("type")))
                        && ("".equals(experiment.getDataDirectoryInformation().get("user")) || "".equals(experiment.getDataDirectoryInformation().get("pass")))) {
                    directoryContent = "{\"success\" : false, \"error_code\" : 201, \"host\" : \"" + experiment.getDataDirectoryInformation().get("host") + "\"}";
                } else {
                    directoryContent = FileManager.getFileManager(DATA_LOCATION).getDirectoryContent("", experiment.getDataDirectoryInformation());
                }

            } catch (Exception e) {
                ServerErrorManager.handleException(e, File_servlets.class.getName(), "get_all_files_handler", e.getMessage());
            } finally {
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
                    response.getWriter().print(directoryContent);
                }
                /**
                 * *******************************************************
                 * STEP 4 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, File_servlets.class.getName(), "get_all_files_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_file_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            String tmpFile = "";
            Path tmpDir = null;
            try {
                Map<String, Cookie> cookies = this.getCookies(request);
                String loggedUser = cookies.get("loggedUser").getValue();
                String sessionToken = cookies.get("sessionToken").getValue();
                String loggedUserID = cookies.get("loggedUserID").getValue();

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get the Experiment Object from DB. IF ERROR --> throws
                 * MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                String experiment_id;
                if (request.getParameter("experiment_id") != null) {
                    experiment_id = request.getParameter("experiment_id");
                } else {
                    experiment_id = cookies.get("currentExperimentID").getValue();
                }

                /**
                 * *******************************************************
                 * STEP 3 Check that the user is a valid owner for the
                 * experiment.
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                Experiment experiment = (Experiment) dao_instance.findByID(experiment_id, null);

                if (!experiment.isOwner(loggedUserID) && !experiment.isMember(loggedUserID) && !loggedUserID.equals("admin")) {
                    throw new AccessControlException("Cannot get files for selected Experiment. Current user is not a valid member for this Experiment.");
                }

                String fileName;
                if (request.getParameter("filename") != null) {
                    fileName = request.getParameter("filename");
                } else {
                    throw new FileNotFoundException("Cannot get selected file. File not found in server.");
                }

                if (request.getParameter("credentials") != null) {
                    byte[] decoded = Base64.decodeBase64(request.getParameter("credentials"));
                    String[] credentials = new String(decoded).split(":", 2);
                    experiment.setDataDirectoryUser(credentials[0]);
                    experiment.setDataDirectoryPass(credentials[1]);
                } else if (request.getParameter("apikey") != null) {
                    experiment.setDataDirectoryApiKey(request.getParameter("apikey"));
                }

                fileName= fileName.replaceAll(" ", "%20");
                
                tmpDir = Files.createTempDirectory(null);
                tmpFile = FileManager.getFileManager(DATA_LOCATION).getFile(fileName, experiment.getDataDirectoryInformation(), tmpDir.toString());

            } catch (Exception e) {
                ServerErrorManager.handleException(e, File_servlets.class.getName(), "get_file_handler", e.getMessage());
            } finally {
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
                    // reads input file from an absolute path
                    File downloadFile = new File(tmpFile);
                    try {
                        FileInputStream inStream = new FileInputStream(downloadFile);
                        // gets MIME type of the file
                        String mimeType = getServletContext().getMimeType(tmpFile);
                        if (mimeType == null) {
                            // set to binary type if MIME mapping not found
                            mimeType = "application/octet-stream";
                        }
                        response.setContentType(mimeType);
                        response.setHeader("Content-Disposition", "filename=\"" + downloadFile.getName() + "\"");

                        // obtains response's output stream
                        OutputStream outStream = response.getOutputStream();

                        byte[] buffer = new byte[4096];
                        int bytesRead = -1;

                        while ((bytesRead = inStream.read(buffer)) != -1) {
                            outStream.write(buffer, 0, bytesRead);
                        }

                        inStream.close();
                        outStream.close();
                    } catch (Exception ex) {
                    } finally {
                        if (downloadFile.exists()) {
                            downloadFile.delete();
                        }
                        if (tmpDir != null) {
                            Files.delete(tmpDir);
                        }
                    }
                }
                /**
                 * *******************************************************
                 * STEP 4 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, File_servlets.class.getName(), "get_file_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * PUT REQUEST HANDLERS                                                                     *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void update_file_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        throw new IOException("Not implemented");
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * DELETE REQUEST HANDLERS                                                                  *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void delete_file_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            String tmpFile = "";
            Path tmpDir = null;
            try {
                Map<String, Cookie> cookies = this.getCookies(request);
                String loggedUser = cookies.get("loggedUser").getValue();
                String sessionToken = cookies.get("sessionToken").getValue();
                String loggedUserID = cookies.get("loggedUserID").getValue();

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get the Experiment Object from DB. IF ERROR --> throws
                 * MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                String experiment_id;
                if (request.getParameter("experiment_id") != null) {
                    experiment_id = request.getParameter("experiment_id");
                } else {
                    experiment_id = cookies.get("currentExperimentID").getValue();
                }

                /**
                 * *******************************************************
                 * STEP 3 Check that the user is a valid owner for the
                 * experiment.
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                Experiment experiment = (Experiment) dao_instance.findByID(experiment_id, null);

                if (!experiment.isOwner(loggedUserID) && !experiment.isMember(loggedUserID) && !loggedUserID.equals("admin")) {
                    throw new AccessControlException("Cannot delete files for selected Experiment. Current user is not a valid member for this Experiment.");
                }

                String fileName;
                if (request.getParameter("filename") != null) {
                    fileName = request.getParameter("filename");
                } else {
                    throw new FileNotFoundException("Cannot delete selected file. File not found in server.");
                }

                if (request.getParameter("credentials") != null) {
                    byte[] decoded = Base64.decodeBase64(request.getParameter("credentials"));
                    String[] credentials = new String(decoded).split(":", 2);
                    experiment.setDataDirectoryUser(credentials[0]);
                    experiment.setDataDirectoryPass(credentials[1]);
                } else if (request.getParameter("apikey") != null) {
                    experiment.setDataDirectoryApiKey(request.getParameter("apikey"));
                }

                tmpDir = Files.createTempDirectory(null);
                String[] files = new String[]{fileName};
                FileManager.getFileManager(DATA_LOCATION).removeFiles(files, experiment.getDataDirectoryInformation());

            } catch (Exception e) {
                ServerErrorManager.handleException(e, File_servlets.class.getName(), "delete_file_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 3b CATCH ERROR. GO TO STEP 4
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    response.getWriter().print(obj.toString());
                }
                /**
                 * *******************************************************
                 * STEP 4 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, File_servlets.class.getName(), "delete_file_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

}

class FileManager {

    private static FileManager instance = null;
    private String DATA_LOCATION = "";

    private FileManager() {
    }

    private synchronized static void createFileManager(String DATA_LOCATION) {
        if (instance == null) {
            instance = new FileManager();
            instance.DATA_LOCATION = DATA_LOCATION;
        }
    }

    public static FileManager getFileManager(String DATA_LOCATION) {
        if (instance == null) {
            createFileManager(DATA_LOCATION);
        }
        return instance;
    }

    public boolean saveFiles(File[] files, Map<String, String> hostInfo, String path) throws Exception {
        Path tmpDir = Files.createTempDirectory(null);
        try {
            for (File tmpfile : files) {
                try {
                    //STEP 1. LOAD THE CORRESPONDING PLUGIN FOR THE FILE SYSTEM
                    Object fileSystemManager = ExtensionLoader.getExtensionLoader().loadClass(DATA_LOCATION + "/extensions/", hostInfo.get("type"), Object.class);
                    //STEP 2. LOAD THE SETTINGS
                    Method method = fileSystemManager.getClass().getDeclaredMethod("loadSettings", Map.class);
                    method.invoke(fileSystemManager, hostInfo);
                    //STEP 3. RUN THE CORRESPONDING FUNCTION
                    method = fileSystemManager.getClass().getDeclaredMethod("saveFile", File.class, String.class);
                    method.invoke(fileSystemManager, tmpfile, path);
                } catch (InvocationTargetException e) {
                    throw new Exception(e.getTargetException());
                }
            }
        } catch (Exception ex) {
            throw ex;
        } finally {
            Files.delete(tmpDir);
        }
        return true;
    }

    public boolean removeFiles(String[] filePaths, Map<String, String> hostInfo) throws Exception {
        for (String filepath : filePaths) {
            //STEP 1. LOAD THE CORRESPONDING PLUGIN FOR THE FILE SYSTEM
            Object fileSystemManager = ExtensionLoader.getExtensionLoader().loadClass(DATA_LOCATION + "/extensions/", hostInfo.get("type"), Object.class);
            //STEP 2. LOAD THE SETTINGS
            Method method = fileSystemManager.getClass().getDeclaredMethod("loadSettings", Map.class);
            method.invoke(fileSystemManager, hostInfo);
            //STEP 3. RUN THE CORRESPONDING FUNCTION
            method = fileSystemManager.getClass().getDeclaredMethod("removeFile", String.class);
            method.invoke(fileSystemManager, filepath);
        }
        return true;
    }

    public String getFile(String filePath, Map<String, String> hostInfo, String tmpDir) throws Exception {
        //STEP 1. LOAD THE CORRESPONDING PLUGIN FOR THE FILE SYSTEM
        Object fileSystemManager = ExtensionLoader.getExtensionLoader().loadClass(DATA_LOCATION + "/extensions/", hostInfo.get("type"), Object.class);
        //STEP 2. LOAD THE SETTINGS
        Method method = fileSystemManager.getClass().getDeclaredMethod("loadSettings", Map.class);
        method.invoke(fileSystemManager, hostInfo);
        //STEP 3. RUN THE CORRESPONDING FUNCTION
        method = fileSystemManager.getClass().getDeclaredMethod("getFile", String.class, String.class);
        String path = (String) method.invoke(fileSystemManager, filePath, tmpDir);

        return path;
    }

    public boolean sendFile(String filePath, Map<String, String> hostInfo, Map<String, String> destination_settings) throws Exception {
        //STEP 1. GET THE FILE
        Path tmpDir = Files.createTempDirectory(null);
        String tmpfile = this.getFile(filePath, hostInfo, tmpDir.toString());
        //STEP 2. LOAD THE CORRESPONDING PLUGIN FOR THE DESTINATION
        Object externalToolManager = ExtensionLoader.getExtensionLoader().loadClass(DATA_LOCATION + "/extensions/", destination_settings.get("type"), Object.class);
        //STEP 3. LOAD THE SETTINGS
        Method method = externalToolManager.getClass().getDeclaredMethod("loadSettings", Map.class);
        method.invoke(externalToolManager, destination_settings);
        //STEP 4. RUN THE CORRESPONDING FUNCTION
        method = externalToolManager.getClass().getDeclaredMethod("sendFile", String.class);
        method.invoke(externalToolManager, tmpfile);
        return true;
    }

    public String getDirectoryContent(String dirPath, Map<String, String> hostInfo) throws Exception {
        try {
            //STEP 1. LOAD THE CORRESPONDING PLUGIN FOR THE FILE SYSTEM
            Object fileSystemManager = ExtensionLoader.getExtensionLoader().loadClass(DATA_LOCATION + "/extensions/", hostInfo.get("type"), Object.class);
            //STEP 2. LOAD THE SETTINGS
            Method method = fileSystemManager.getClass().getDeclaredMethod("loadSettings", Map.class);
            method.invoke(fileSystemManager, hostInfo);
            //STEP 3. RUN THE CORRESPONDING FUNCTION
            //FileSystemManager.class.cast(fileSystemManager);
            //((FileSystemManager) fileSystemManager).loadSettings(hostInfo);
            method = fileSystemManager.getClass().getDeclaredMethod("getDirectoryContent", String.class);
            String content = (String) method.invoke(fileSystemManager, dirPath);
            return content;
        } catch (InvocationTargetException e) {
            throw new Exception(e.getTargetException());
        }
    }
}
