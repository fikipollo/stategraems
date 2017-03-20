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
import classes.Message;
import classes.User;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import common.ServerErrorManager;
import java.io.File;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.AccessControlException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import java.util.Map;
import javax.servlet.http.Cookie;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

/**
 *
 * SERVLET FOR MESSAGES:
 * +----------------------+-----------------------+---------------+------------------------------+---------------------+
 * | Resource             | POST                  | GET           |  PUT                         | DELETE              |
 * +----------------------+-----------------------+---------------+------------------------------+---------------------+
 * | /rest/files          | Upload a new file     | List files    |                              |                     |
 * +----------------------+-----------------------+---------------+------------------------------+---------------------+
 * | /rest/files/1234     | Error                 | Download file | If exist replace file        | Delete file         |
 * +----------------------+-----------------------+---------------+------------------------------+---------------------+
 * | /rest/files/send     | Send selection        |               |                              |                     |
 * +----------------------+-----------------------+---------------+------------------------------+---------------------+
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
            DAO daoInstance = null;
            File uploadedFile = null;
            Experiment experiment = null;
            boolean REMOVE_FILE_NEEDED = false;
            String parent_dir = "";
            String file_name = "";
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
                    apicode = new String(Base64.getDecoder().decode(apicode));

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
                 * STEP 2 Get the Experiment Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
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
                 * STEP 3 Check that the user is a valid owner for the experiment.
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("Experiment");
                experiment = (Experiment) daoInstance.findByID(experiment_id, null);

                if (!experiment.isOwner(loggedUserID) && !experiment.isMember(loggedUserID) && !isValidAdminUser(loggedUser)) {
                    throw new AccessControlException("Cannot add files to selected study. Current user is not a valid member for study " + experiment_id + ".");
                }

                /**
                 * *******************************************************
                 * STEP 1 Get the request params: read the params and the PDF file.
                 * IF ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
                 * STEP 9 *******************************************************
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
                 * STEP 3 SAVE THE FILE IN THE SERVER. IF ERROR --> throws
                 * exception if not valid session, GO TO STEP 6b ELSE --> GO TO STEP
                 * 3 *******************************************************
                 */
                //First check if the file already exists -> error, probably a previous treatmente exists with the same treatment_id
                Path tmpDir = Files.createTempDirectory(null);
                file_name = (file_name.isEmpty()? tmpUploadedFile.getName() : file_name);
                uploadedFile = new File(tmpDir.toString(), file_name);

                try {
                    tmpUploadedFile.write(uploadedFile);
                    REMOVE_FILE_NEEDED = true;
                    experiment.addExperimentDataDirectoryContent(new File[]{uploadedFile}, parent_dir);
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

                    if (REMOVE_FILE_NEEDED && experiment != null) {
                        experiment.deleteExperimentDataDirectoryContent(new File[]{uploadedFile}, parent_dir);
                    }
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
    This function sends a file to an external application (e.g. a Galaxy server).
    
    @param request
    @param response
    @throws IOException 
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
                 * STEP 2 Get the Experiment Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                ArrayList<String> files = new ArrayList<String>();
                Iterator<JsonElement> it = requestData.get("files").getAsJsonArray().iterator();
                while (it.hasNext()) {
                    files.add(it.next().getAsString());
                }

                String destination = requestData.get("destination").getAsString();
                //TODO: read destination URL and credentials from User
                HashMap<String, String> destination_settings = new HashMap<String, String>();
                destination_settings.put("type", "galaxy");
                destination_settings.put("URL", "http://localhost:8090");
                destination_settings.put("key", "2b059e2a17f03406c65e5a7e429958f1");

                String experiment_id;
                if (request.getParameter("experiment_id") != null) {
                    experiment_id = requestData.get("experiment_id").getAsString();
                } else {
                    experiment_id = cookies.get("currentExperimentID").getValue();
                }

                /**
                 * *******************************************************
                 * STEP 3 Check that the user is a valid owner for the experiment.
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
                 * exception if not valid session, GO TO STEP 6b ELSE --> GO TO STEP
                 * 3 *******************************************************
                 */
                String tmpfile;
                for (String file : files) {
                    try {
                        tmpfile = this.retrieveFileFromDataDir(file, experiment);
                        this.sendFileToExternalApplication(tmpfile, destination_settings);
                    } catch (Exception e) {
                        errors += "Failed while sending file " + file + "\n";
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
                 * STEP 2 Get the Experiment Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
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
                 * STEP 3 Check that the user is a valid owner for the experiment.
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                Experiment experiment = (Experiment) dao_instance.findByID(experiment_id, null);

                if (!experiment.isOwner(loggedUserID) && !experiment.isMember(loggedUserID) && !loggedUserID.equals("admin")) {
                    throw new AccessControlException("Cannot get files for selected Experiment. Current useris not a valid member for this Experiment.");
                }

                directoryContent = experiment.getExperimentDataDirectoryContent();

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
            Message message = null;
            try {
                Map<String, Cookie> cookies = this.getCookies(request);
                String loggedUser = cookies.get("loggedUser").getValue();
                String sessionToken = cookies.get("sessionToken").getValue();
                String messageID = request.getPathInfo().replaceAll("/", "");

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
                 * STEP 2 Get THE ANALYSIS Object from DB. IF ERROR --> throws
                 * MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Message");
                message = (Message) dao_instance.findByID(messageID, null);

            } catch (Exception e) {
                ServerErrorManager.handleException(e, File_servlets.class.getName(), "get_message_handler", e.getMessage());
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
                     * STEP 3A WRITE SUCCESS RESPONSE. GO TO STEP 4
                     * *******************************************************
                     */
                    if (message != null) {
                        response.getWriter().print(message.toJSON());
                    } else {
                        response.getWriter().print("{}");
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
            ServerErrorManager.handleException(e, File_servlets.class.getName(), "get_message_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * PUT REQUEST HANDLERS                                                                     *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void update_all_messages_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
    }

    private void update_file_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            boolean ROLLBACK_NEEDED = false;
            DAO daoInstance = null;

            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5A ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                Map<String, Cookie> cookies = this.getCookies(request);
                String loggedUser = cookies.get("loggedUser").getValue();
                String sessionToken = cookies.get("sessionToken").getValue();

                String messageID = request.getPathInfo().replaceAll("/", "");

                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get the Object by parsing the JSON data. IF ERROR -->
                 * throws JsonParseException, GO TO STEP 5A ELSE --> GO TO STEP
                 * 3 *******************************************************
                 */
                Message message = Message.fromJSON(requestData.get("message_json_data"));
                message.setMessageID(messageID);

                /**
                 * *******************************************************
                 * STEP 3 UPDATE the message in DATABASE. IF ERROR --> throws
                 * SQL Exception, GO TO STEP 5A ELSE --> GO TO STEP 4
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("Message");
                daoInstance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                daoInstance.update(message);

                /**
                 * *******************************************************
                 * STEP 4 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5A ELSE --> GO TO
                 * STEP 5B
                 * *******************************************************
                 */
                daoInstance.doCommit();
            } catch (Exception e) {
                if (e.getClass().getSimpleName().equals("MySQLIntegrityConstraintViolationException")) {
                    ServerErrorManager.handleException(null, null, null, "Unable to update the Analysis information.");
                } else {
                    ServerErrorManager.handleException(e, File_servlets.class.getName(), "update_message_handler", e.getMessage());
                }
            } finally {
                /**
                 * *******************************************************
                 * STEP 5A CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());

                    if (ROLLBACK_NEEDED) {
                        daoInstance.doRollback();
                    }
                } else {
                    /**
                     * *******************************************************
                     * STEP 5B return success
                     * *******************************************************
                     */
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    response.getWriter().print(obj.toString());
                }

                /**
                 * *******************************************************
                 * STEP 6 Close connection.
                 * ********************************************************
                 */
                if (daoInstance != null) {
                    daoInstance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, File_servlets.class.getName(), "update_message_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * DELETE REQUEST HANDLERS                                                                  *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void delete_all_messages_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
    }

    private void delete_file_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            boolean ROLLBACK_NEEDED = false;
            DAO daoInstance = null;

            try {
                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                Map<String, Cookie> cookies = this.getCookies(request);
                String loggedUser = cookies.get("loggedUser").getValue();
                String sessionToken = cookies.get("sessionToken").getValue();

                String messageID = request.getPathInfo().replaceAll("/", "");

                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 3 Remove the message
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("Message");
                daoInstance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                daoInstance.remove(messageID);

                /**
                 * *******************************************************
                 * STEP 5 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                daoInstance.doCommit();
            } catch (Exception e) {
                ServerErrorManager.handleException(e, File_servlets.class.getName(), "delete_message_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 7b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                    if (ROLLBACK_NEEDED) {
                        daoInstance.doRollback();
                    }
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    response.getWriter().print(obj.toString());
                }

                /**
                 * *******************************************************
                 * STEP 9 Close connection.
                 * ********************************************************
                 */
                if (daoInstance != null) {
                    daoInstance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, File_servlets.class.getName(), "delete_message_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * AUXILIAR FUNCTIONS                                                                       *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private String retrieveFileFromDataDir(String filename, Experiment experiment) throws Exception {
        if ("local_dir".equalsIgnoreCase(experiment.getDataDirectoryType())) {
            filename = filename.substring(filename.indexOf("/") + 1);
            return experiment.getDataDirectoryPath() + filename;
        } else if ("ftp_dir".equalsIgnoreCase(experiment.getDataDirectoryType())) {
            throw new Exception("Not implemented");
        } else if ("irods_dir".equalsIgnoreCase(experiment.getDataDirectoryType())) {
            throw new Exception("Not implemented");
        } else if ("seeddms_dir".equalsIgnoreCase(experiment.getDataDirectoryType())) {
            throw new Exception("Not implemented");
        }
        return null;
    }

    private void sendFileToExternalApplication(String file_path, HashMap<String, String> destination_settings) throws Exception {
        if ("galaxy".equalsIgnoreCase(destination_settings.get("type"))) {
            this.sendFileToGalaxy(file_path, destination_settings);
        } else {
            throw new Exception("Destination type unknown.");
        }
    }

    private void sendFileToGalaxy(String file_path, HashMap<String, String> destination_settings) throws Exception {
        CloseableHttpClient httpclient = HttpClients.createDefault();
        URI uri = new URIBuilder(destination_settings.get("URL") + "/api/histories/most_recently_used").addParameter("key", destination_settings.get("key")).build();

        HttpGet get = new HttpGet(uri);
        HttpResponse response = httpclient.execute(get);
        JsonElement jelement = new JsonParser().parse(org.apache.http.util.EntityUtils.toString(response.getEntity()));

        String historyID = jelement.getAsJsonObject().get("id").getAsString();
        
        uri = new URIBuilder(destination_settings.get("URL") + "/api/tools/").addParameter("key", destination_settings.get("key")).build();
        HttpPost post = new HttpPost(uri);
        FileBody fileBody = new FileBody(new File(file_path));

        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        builder.addPart("files_0|file_data", fileBody);
//        builder.addPart("inputs", new StringBody("{\"dbkey\":\"?\",\"file_type\":\"txt\",\"files_0|type\":\"upload_dataset\",\"files_0|space_to_tab\":null,\"files_0|to_posix_lines\":\"Yes\"}"));
        builder.addPart("tool_id", new StringBody("upload1"));
        builder.addPart("history_id", new StringBody(historyID));
        post.setEntity(builder.build());

        response = httpclient.execute(post);

        httpclient.close();
        
        if(response.getStatusLine().getStatusCode() != 200){
            throw new Exception();
        }
    }

}
