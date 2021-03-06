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
import bdManager.DAO.Experiment_JDBCDAO;
import classes.Experiment;
import classes.Message;
import classes.User;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import common.BlockedElementsManager;
import common.ServerErrorManager;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.AccessControlException;
import java.util.ArrayList;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.tomcat.util.http.fileupload.FileUtils;

/**
 * @author Rafa Hernández de Diego
 */
public class Experiment_servlets extends Servlet {

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
        response.setContentType("application/json");
//        response.setContentType("text/html");

        if (!matchService(request.getServletPath(), "/rest/experiments(.*)")) {
            if (request.getServletPath().equals("/get_all_experiments")) {
                get_all_experiments_handler(request, response);
            } else if (request.getServletPath().equals("/get_experiment")) {
                get_experiment_handler(request, response);
            } else if (request.getServletPath().equals("/add_experiment")) {
                add_experiment_handler(request, response);
            } else if (request.getServletPath().equals("/update_experiment")) {
                update_experiment_handler(request, response);
            } else if (request.getServletPath().equals("/lock_experiment")) {
                lock_experiment_handler(request, response);
            } else if (request.getServletPath().equals("/unlock_experiment")) {
                unlock_experiment_handler(request, response);
            } else if (request.getServletPath().equals("/remove_experiment")) {
                remove_experiment_handler(request, response);
            } else if (request.getServletPath().equals("/change_current_experiment")) {
                change_current_experiment_handler(request, response);
            } else if (request.getServletPath().equals("/experiment_member_request")) {
                process_new_membership_request(request, response);
            } else {
                common.ServerErrorManager.addErrorMessage(3, Experiment_servlets.class.getName(), "doPost", "What are you doing here?.");
                response.setStatus(400);
                response.getWriter().print(ServerErrorManager.getErrorResponse());
            }
        }

        //NEW SERVICES
//        if (matchService(request.getPathInfo(), "/import")) {
//            import_analysis_handler(request, response);
//        } else if (matchService(request.getPathInfo(), "/(.+)")) {
//            //Do nothing
//        } else {
//            add_biocondition_handler(request, response);
//        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");

        if (matchService(request.getPathInfo(), "/export")) {
            export_experiments_handler(request, response);
//        } else if (matchService(request.getPathInfo(), "/(.+)")) {
//            get_analysis_handler(request, response);
//        } else {
//            get_all_analysis_handler(request, response);
        }
    }

    //************************************************************************************
    //*****EXPERIMENT SERVLET HANDLERS     **************************************************
    //************************************************************************************
    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void add_experiment_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {

            String LOCKED_ID = null;
            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;
            String warning_message = "";

            try {
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                String loggedUser = requestData.get("loggedUser").getAsString();
                String sessionToken = requestData.get("sessionToken").getAsString();

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 6b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get the new ID for the EXPERIMENT. IF ERROR --> throws
                 * SQL Exception, GO TO STEP 6b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                String newID = dao_instance.getNextObjectID(null);
                LOCKED_ID = newID;

                /**
                 * *******************************************************
                 * STEP 3 Get the Object by parsing the JSON data. IF ERROR -->
                 * throws JsonParseException, GO TO STEP 6b ELSE --> GO TO STEP
                 * 4 *******************************************************
                 */
                Experiment experiment = null;
                experiment = Experiment.fromJSON(requestData.get("experiment_json_data"));

                /**
                 * *******************************************************
                 * STEP 4 Set the object ID. IF ERROR --> GO TO STEP 6b ELSE -->
                 * GO TO STEP 5
                 * *******************************************************
                 */
                experiment.setExperimentID(newID);

                if ("local_directory".equalsIgnoreCase(experiment.getDataDirectoryType()) || "none".equalsIgnoreCase(experiment.getDataDirectoryType())) {
                    experiment.setDataDirectoryHost("");
                    experiment.setDataDirectoryPort("");
                    experiment.setDataDirectoryUser("");
                    experiment.setDataDirectoryPass("");

                    if ("local_directory".equalsIgnoreCase(experiment.getDataDirectoryType())) {
                        File f = new File(experiment.getDataDirectoryPath() + File.separator + ".stategraems_dir");
                        if (!f.exists()) {
                            warning_message = "Invalid directory. To enable the selected directory, please create a new file called '.stategraems_dir' in the selected path.";
                        }
                    }
                }

                /**
                 * *******************************************************
                 * STEP 5 Add the new Object in the DATABASE. IF ERROR -->
                 * throws SQL Exception, GO TO STEP 6b ELSE --> GO TO STEP 6
                 * *******************************************************
                 */
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                dao_instance.insert(experiment);

                /**
                 * *******************************************************
                 * STEP 6 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 6b ELSE --> GO TO
                 * STEP 7 ******************************************************
                 */
                // DEPRECATED
                //boolean success = (new File(DATA_LOCATION + File.separator + newID + File.separator + "analysis_images")).mkdirs();
                //if (!success) {
                //    // Directory creation failed
                //    throw new Exception("Unable to create the new Experiment folder. Please check if the Tomcat user has read/write permissions over the data application directory.");
                //}
                //success = (new File(DATA_LOCATION + File.separator + newID + File.separator + "experimentDataDirectoryContent.txt")).createNewFile();
                //if (!success) {
                //    // Directory creation failed
                //    throw new Exception("Unable to create the new Experiment folder. Please check if the Tomcat user has read/write permissions over the data application directory.");
                //}
                //UPDATE THE INFORMATION FOR DATA DIR (REMOVE UNNECESARY DATA)
                /**
                 * *******************************************************
                 * STEp 7 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 6b ELSE --> GO TO
                 * STEP 7
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "add_experiment_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 6b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());

                    if (ROLLBACK_NEEDED) {
                        dao_instance.doRollback();
                    }
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("newID", new JsonPrimitive(LOCKED_ID));
                    obj.add("warning_message", new JsonPrimitive(warning_message));
                    response.getWriter().print(obj.toString());
                }

                if (LOCKED_ID != null) {
                    BlockedElementsManager.getBlockedElementsManager().unlockID(LOCKED_ID);
                }
                /**
                 * *******************************************************
                 * STEP 8 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "add_experiment_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void update_experiment_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {

            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;
            String warning_message = "";

            try {
                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 6b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                String loggedUser = requestData.get("loggedUser").getAsString();
                String loggedUserID = requestData.get("loggedUserID").getAsString();
                String sessionToken = requestData.get("sessionToken").getAsString();

                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 READ ALL PARAMETERS --> ARRAYS WITH ALL TASKS. ELSE
                 * --> GO TO STEP 3
                 * *******************************************************
                 */
                /**
                 * *******************************************************
                 * STEP 3 Get the EXPERIMENT Object by parsing the JSON data. IF
                 * ERROR --> throws JsonParseException, GO TO STEP ? ELSE --> GO
                 * TO STEP 4
                 * *******************************************************
                 */
                Experiment experiment = Experiment.fromJSON(requestData.get("experiment_json_data"));

                /**
                 * *******************************************************
                 * STEP 4 UPDATE THE EXPERIMENT IN DATABASE. IF ERROR --> throws
                 * SQL Exception, GO TO STEP ? ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");

                //CHECK IF CURRENT USER IS A VALID OWNER (AVOID HACKING)
                boolean loadRecursive = false;
                Experiment experimentAux = (Experiment) dao_instance.findByID(experiment.getExperimentID(), new Object[]{loadRecursive});
                if (!experimentAux.isOwner(loggedUserID) && !loggedUserID.equals("admin")) {
                    throw new AccessControlException("Cannot update selected Experiment. Current user has not privileges over this Experiment.");
                }

                //UPDATE THE INFORMATION FOR DATA DIR (REMOVE UNNECESARY DATA)
                if ("local_directory".equalsIgnoreCase(experiment.getDataDirectoryType()) || "none".equalsIgnoreCase(experiment.getDataDirectoryType())) {
                    experiment.setDataDirectoryHost("");
                    experiment.setDataDirectoryPort("");
                    experiment.setDataDirectoryUser("");
                    experiment.setDataDirectoryPass("");

                    if ("local_directory".equalsIgnoreCase(experiment.getDataDirectoryType())) {
                        File f = new File(experiment.getDataDirectoryPath() + File.separator + ".stategraems_dir");
                        if (!f.exists()) {
                            warning_message = "Invalid directory. To enable the selected directory, please create a new file called '.stategraems_dir' in the selected path.";
                        }
                    }

                } else if ("".equalsIgnoreCase(experiment.getDataDirectoryPass()) || "dummypassword".equalsIgnoreCase(experiment.getDataDirectoryPass())) {
                    //KEEP PREVIOUS PASS
                    experiment.setDataDirectoryPass(experimentAux.getDataDirectoryPass());
                }

                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                dao_instance.update(experiment);

                /**
                 * *******************************************************
                 * STEP 5 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "update_experiment_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 9b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());

                    if (ROLLBACK_NEEDED) {
                        dao_instance.doRollback();
                    }
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    obj.add("warning_message", new JsonPrimitive(warning_message));
                    response.getWriter().print(obj.toString());
                }
                /**
                 * *******************************************************
                 * STEP 11 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "update_experiment_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void get_all_experiments_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> experimentsList = null;
            try {

                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                String loggedUser = requestData.get("loggedUser").getAsString();
                String sessionToken = requestData.get("sessionToken").getAsString();

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. Please sign in again.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get ALL THE ANALYSIS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                experimentsList = dao_instance.findAll(params);
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "get_all_experiments_handler", e.getMessage());
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
                    String experimentsJSON = "[";

                    for (int i = 0; i < experimentsList.size(); i++) {
                        ((Experiment) experimentsList.get(i)).setDataDirectoryPass("dummypassword");
                        experimentsJSON += ((Experiment) experimentsList.get(i)).toJSON() + ((i < experimentsList.size() - 1) ? "," : "");
                    }
                    experimentsJSON += "]";

                    response.getWriter().print(experimentsJSON);
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
            ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "get_all_experiments_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void get_experiment_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            Experiment experiment = null;
            try {

                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                String loggedUser = requestData.get("loggedUser").getAsString();
                String sessionToken = requestData.get("sessionToken").getAsString();

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
                 * STEP 2 Get ALL THE ANALYSIS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                String experiment_id = requestData.get("experiment_id").getAsString();
                experiment = (Experiment) dao_instance.findByID(experiment_id, params);
                experiment.setDataDirectoryPass("dummypassword");

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "get_experiment_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 4b CATCH ERROR. GO TO STEP 5
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                } else {
                    /**
                     * *******************************************************
                     * STEP 4A WRITE RESPONSE ERROR. GO TO STEP 5
                     * *******************************************************
                     */
                    response.getWriter().print(experiment.toJSON());
                }
                /**
                 * *******************************************************
                 * STEP 5 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "get_experiment_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void lock_experiment_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        boolean alreadyLocked = false;
        String locker_id = "";
        try {
            JsonParser parser = new JsonParser();
            JsonObject requestData = (JsonObject) parser.parse(request.getReader());

            String loggedUser = requestData.get("loggedUser").getAsString();
            String sessionToken = requestData.get("sessionToken").getAsString();

            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP ELSE --> GO
             * TO STEP 2 *******************************************************
             */
            if (!checkAccessPermissions(loggedUser, sessionToken)) {
                throw new AccessControlException("Your session is invalid. User or session token not allowed.");
            }

            /**
             * *******************************************************
             * STEP 2 GET THE OBJECT ID AND TRY TO LOCK IT. IF ERROR --> throws
             * exception, GO TO STEP ELSE --> GO TO STEP 3
             * *******************************************************
             */
            String experimentID = requestData.get("experiment_id").getAsString();
            alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().lockObject(experimentID, loggedUser);
            if (alreadyLocked) {
                locker_id = BlockedElementsManager.getBlockedElementsManager().getLockerID(experimentID);
            }
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "lock_experiment_handler", e.getMessage());
        } finally {
            /**
             * *******************************************************
             * STEP 4b CATCH ERROR. GO TO STEP 5
             * *******************************************************
             */
            if (ServerErrorManager.errorStatus()) {
                response.setStatus(400);
                response.getWriter().print(ServerErrorManager.getErrorResponse());
            } else {
                /**
                 * *******************************************************
                 * STEP 3A WRITE RESPONSE .
                 * *******************************************************
                 */
                JsonObject obj = new JsonObject();
                if (alreadyLocked) {
                    obj.add("success", new JsonPrimitive(false));
                    obj.add("reason", new JsonPrimitive(BlockedElementsManager.getErrorMessage()));
                    obj.add("user_id", new JsonPrimitive(locker_id));
                } else {
                    obj.add("success", new JsonPrimitive(true));
                }
                response.getWriter().print(obj.toString());
            }
        }
    }

    /**
     *
     * @param request
     * @param response
     */
    private void unlock_experiment_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        boolean alreadyLocked = false;
        try {
            JsonParser parser = new JsonParser();
            JsonObject requestData = (JsonObject) parser.parse(request.getReader());

            String loggedUser = requestData.get("loggedUser").getAsString();
            String sessionToken = requestData.get("sessionToken").getAsString();

            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP ELSE --> GO
             * TO STEP 2 *******************************************************
             */
            if (!checkAccessPermissions(loggedUser, sessionToken)) {
                throw new AccessControlException("Your session is invalid. User or session token not allowed.");
            }

            /**
             * *******************************************************
             * STEP 2 GET THE OBJECT ID AND TRY TO LOCK IT. IF ERROR --> throws
             * exception, GO TO STEP ELSE --> GO TO STEP 3
             * *******************************************************
             */
            String experiment_id = requestData.get("experiment_id").getAsString();
            alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().unlockObject(experiment_id, loggedUser);
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "unlock_analysis_handler", e.getMessage());
        } finally {
            /**
             * *******************************************************
             * STEP 4b CATCH ERROR. GO TO STEP 5
             * *******************************************************
             */
            if (ServerErrorManager.errorStatus()) {
                response.setStatus(400);
                response.getWriter().print(ServerErrorManager.getErrorResponse());
            } else {
                /**
                 * *******************************************************
                 * STEP 3A WRITE RESPONSE ERROR.
                 * *******************************************************
                 */
                JsonObject obj = new JsonObject();
                if (alreadyLocked) {
                    obj.add("success", new JsonPrimitive(false));
                    obj.add("reason", new JsonPrimitive(BlockedElementsManager.getErrorMessage()));
                } else {
                    obj.add("success", new JsonPrimitive(true));
                }
                response.getWriter().print(obj.toString());
            }
        }
    }

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void remove_experiment_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;
            String experiment_id = null;
            String loggedUser = "";
            try {
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                loggedUser = requestData.get("loggedUser").getAsString();
                String loggedUserID = requestData.get("loggedUserID").getAsString();
                String sessionToken = requestData.get("sessionToken").getAsString();

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 4b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                experiment_id = requestData.get("experiment_id").getAsString();
                boolean alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().lockObject(experiment_id, loggedUserID);
                if (alreadyLocked) {
                    String locker_id = BlockedElementsManager.getBlockedElementsManager().getLockerID(experiment_id);
                    if (!locker_id.equals(loggedUser)) {
                        throw new Exception("Sorry but this experiment is being edited by other user. Please try later.");
                    }
                }

                /**
                 * *******************************************************
                 * STEP 3 REMOVE THE EXPERIMENT. IF ERROR --> throws MySQL
                 * exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;

                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                Experiment experiment = (Experiment) dao_instance.findByID(experiment_id, params);

                //Check if user is member or owner
                if (experiment.isMember(loggedUserID) && !"admin".equals(loggedUserID)) {
                    //If is a member, remove the entry in the table of ownerships
                    ((Experiment_JDBCDAO) dao_instance).removeOwnership(loggedUserID, experiment_id);
                } else if (experiment.isOwner(loggedUserID) || "admin".equals(loggedUserID)) {
                    if (experiment.getExperimentOwners().length == 1 || "admin".equals(loggedUserID)) {
                        //If is the last owner or the admin, remove the entire experiment
                        dao_instance.remove(experiment_id);
                        /**
                         * *******************************************************
                         * STEP 3 REMOVE THE FOLDER ERROR --> throws ioSQL , GO
                         * TO STEP 4b ELSE --> GO TO STEP 7
                         * ******************************************************
                         */
                        try {
                            FileUtils.deleteDirectory(new File(DATA_LOCATION + File.separator + experiment_id));
                            // Directory creation failed
                        } catch (IOException exception) {
                            throw new Exception("Unable to remove the Experiment folder. Please check if the Tomcat user has read/write permissions over the data application directory.");
                        }
                    } else {
                        //else just remove the entry in the table of ownerships
                        ((Experiment_JDBCDAO) dao_instance).removeOwnership(loggedUserID, experiment_id);
                    }
                }

                /**
                 * *******************************************************
                 * STEP 4 COMMIT CHANGES IN DB. IF ERROR --> throws exception if
                 * not valid session, GO TO STEP 4b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                if (e.getClass().getSimpleName().equals("MySQLIntegrityConstraintViolationException")) {
                    ServerErrorManager.handleException(null, null, null, "Unable to remove the selected Experiment.</br>This Experiment contains one or more Analysis.</br>Remove first those Analysis and try again later.");
                } else if (e.getClass().getSimpleName().equals("AccessControlException")) {
                    ServerErrorManager.handleException(null, null, null, e.getMessage());
                } else {
                    ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "remove_experiment_handler", e.getMessage());
                }
            } finally {
                /**
                 * *******************************************************
                 * STEP 4b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());

                    if (ROLLBACK_NEEDED) {
                        dao_instance.doRollback();
                    }
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    response.getWriter().print(obj.toString());
                }

                BlockedElementsManager.getBlockedElementsManager().unlockObject(experiment_id, loggedUser);

                /**
                 * *******************************************************
                 * STEP 5 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "remove_experiment_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void change_current_experiment_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            boolean valid_experiment = false;
            try {
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                String loggedUser = requestData.get("loggedUser").getAsString();
                String sessionToken = requestData.get("sessionToken").getAsString();

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
                 * STEP 2 Get ALL THE ANALYSIS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                String experiment_id = requestData.get("experiment_id").getAsString();
                String user_id = requestData.get("loggedUserID").getAsString();
                valid_experiment = ((Experiment_JDBCDAO) dao_instance).checkValidExperiment(experiment_id, user_id);

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "change_current_experiment_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 4b CATCH ERROR. GO TO STEP 5
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                } else {
                    /**
                     * *******************************************************
                     * STEP 4A WRITE RESPONSE ERROR. GO TO STEP 5
                     * *******************************************************
                     */
                    JsonObject obj = new JsonObject();
                    obj.add("valid_experiment", new JsonPrimitive(valid_experiment));
                    response.getWriter().print(obj.toString());
                }
                /**
                 * *******************************************************
                 * STEP 5 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "change_current_experiment_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void process_new_membership_request(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO daoInstance = null;
            boolean ROLLBACK_NEEDED = false;

            try {
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

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
                 * STEP 2 Get THE EXperiment Object from DB. IF ERROR --> throws
                 * MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                String experiment_id = requestData.get("experiment_id").getAsString();
                daoInstance = DAOProvider.getDAOByName("Experiment");
                Experiment experiment = (Experiment) daoInstance.findByID(experiment_id, params);

                daoInstance = DAOProvider.getDAOByName("Message");
                daoInstance.disableAutocommit();
                ROLLBACK_NEEDED = true;

                /**
                 * *******************************************************
                 * STEP 4 Add a new message. IF ERROR --> throws SQL Exception,
                 * GO TO STEP 5b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                Message message = new Message();
                message.setType("info");
                message.setSender(loggedUserID);

                for (User user : experiment.getExperimentOwners()) {
                    message.setTo(message.getTo() + user.getUserID());
                }

                message.setTo(message.getTo());
                message.setSubject("New membership request for experiment " + experiment_id);
                message.setContent(
                        "User " + loggedUserID + " (" + loggedUser + ") want to become a member for the experiment \"" + experiment.getTitle() + "\" (" + experiment_id + ").\n"
                        + "As administrator for this experiment you can easily add new members using the tools located at the Experiment form.");

                for (User user : experiment.getExperimentOwners()) {
                    message.setUserID(user.getUserID());
                    daoInstance.insert(message);
                }

                message.setUserID(loggedUserID);
                message.setType("sent");
                daoInstance.insert(message);

                /**
                 * *******************************************************
                 * STEP 4 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5A ELSE --> GO TO
                 * STEP 5B
                 * *******************************************************
                 */
                daoInstance.doCommit();
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "process_new_membership_request", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 4b CATCH ERROR. GO TO STEP 5
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
                     * STEP 4A WRITE RESPONSE ERROR. GO TO STEP 5
                     * *******************************************************
                     */
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    response.getWriter().print(obj.toString());
                }
                /**
                 * *******************************************************
                 * STEP 5 Close connection.
                 * ********************************************************
                 */
                if (daoInstance != null) {
                    daoInstance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "process_new_membership_request", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }
    
    private void export_experiments_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            Experiment experiment = null;
            String tmpFile = "";
            Path tmpDir = null;

            try {
                String format = request.getParameter("format");
                if (format == null) {
                    format = "json";
                }

                Map<String, Cookie> cookies = this.getCookies(request);

                String loggedUser, sessionToken;
                loggedUser = cookies.get("loggedUser").getValue();
                sessionToken = cookies.get("sessionToken").getValue();

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
                dao_instance = DAOProvider.getDAOByName("Experiment");
                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                String experiment_id = request.getParameter("experiment_id");
                experiment = (Experiment) dao_instance.findByID(experiment_id, params);

                tmpDir = Files.createTempDirectory(null);
                tmpFile = experiment.export(tmpDir.toString(), format, this.getServletContext().getRealPath("/data/templates"));

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "export_experiments_handler", e.getMessage());
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
            ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "export_experiments_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }
}
