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
import bdManager.DBConnectionManager;
import classes.Experiment;
import common.BlockedElementsManager;
import common.ServerErrorManager;
import common.UserSessionManager;
import java.io.File;
import java.io.IOException;
import java.security.AccessControlException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import javax.servlet.ServletException;
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
        response.setContentType("text/html");
//        response.setContentType("application/json");

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
        } else if (request.getServletPath().equals("/dump_database")) {
            dump_database_handler(request, response);
        } else if (request.getServletPath().equals("/get_experiment_directory_content")) {
            get_experiment_directory_content_handler(request, response);
        } else {
            common.ServerErrorManager.addErrorMessage(3, Experiment_servlets.class.getName(), "doPost", "What are you doing here?.");
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
    private void add_experiment_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {

            String BLOCKED_ID = null;
            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;

            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 6b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
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
                BLOCKED_ID = newID;

                /**
                 * *******************************************************
                 * STEP 3 Get the Object by parsing the JSON data. IF ERROR -->
                 * throws JsonParseException, GO TO STEP 6b ELSE --> GO TO STEP
                 * 4 *******************************************************
                 */
                String experiment_json_data = request.getParameter("experiment_json_data");
                Experiment experiment = null;
                experiment = Experiment.fromJSON(experiment_json_data);

                /**
                 * *******************************************************
                 * STEP 4 Set the object ID. IF ERROR --> GO TO STEP 6b ELSE -->
                 * GO TO STEP 5
                 * *******************************************************
                 */
                experiment.setExperimentID(newID);

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
                boolean success = (new File(DATA_LOCATION + File.separator + newID + File.separator + "analysis_images")).mkdirs();
                if (!success) {
                    // Directory creation failed
                    throw new Exception("Unable to create the new Experiment folder. Please check if the Tomcat user has read/write permissions over the data application directory.");
                }
                success = (new File(DATA_LOCATION + File.separator + newID + File.separator + "experimentDataDirectoryContent.txt")).createNewFile();
                if (!success) {
                    // Directory creation failed
                    throw new Exception("Unable to create the new Experiment folder. Please check if the Tomcat user has read/write permissions over the data application directory.");
                }

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
                    response.getWriter().print("{success: " + true + ", newID : '" + BLOCKED_ID + "' }");
                }

                if (BLOCKED_ID != null) {
                    BlockedElementsManager.getBlockedElementsManager().unlockID(BLOCKED_ID);
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

            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 6b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 READ ALL PARAMETERS --> ARRAYS WITH ALL TASKS. ELSE
                 * --> GO TO STEP 3
                 * *******************************************************
                 */
                String experiment_json_data = request.getParameter("experiment_json_data");

                /**
                 * *******************************************************
                 * STEP 3 Get the EXPERIMENT Object by parsing the JSON data. IF
                 * ERROR --> throws JsonParseException, GO TO STEP ? ELSE --> GO
                 * TO STEP 4
                 * *******************************************************
                 */
                Experiment experiment = Experiment.fromJSON(experiment_json_data);

                /**
                 * *******************************************************
                 * STEP 4 UPDATE THE EXPERIMENT IN DATABASE. IF ERROR --> throws
                 * SQL Exception, GO TO STEP ? ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
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
                    response.getWriter().print("{success: " + true + " }");
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

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get ALL THE ANALYSIS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                boolean loadRecursive = false;
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
                    String experimentsJSON = "experimentList : [";

                    for (Object experiment : experimentsList) {
                        experimentsJSON += ((Experiment) experiment).toJSON() + ", ";
                    }
                    experimentsJSON += "]";

                    response.getWriter().print("{success: " + true + ", " + experimentsJSON + " }");
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

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
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
                String experiment_id = request.getParameter("experiment_id");
                experiment = (Experiment) dao_instance.findByID(experiment_id, params);

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
                    String experimentJSON = "experimentList : [";
                    experimentJSON += experiment.toJSON() + ", ";
                    experimentJSON += "]";

                    response.getWriter().print("{success: " + true + ", " + experimentJSON + " }");
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
        try {
            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP ELSE --> GO
             * TO STEP 2 *******************************************************
             */
            String loggedUser = request.getParameter("loggedUser");
            if (!checkAccessPermissions(loggedUser, request.getParameter("sessionToken"))) {
                throw new AccessControlException("Your session is invalid. User or session token not allowed.");
            }

            /**
             * *******************************************************
             * STEP 2 GET THE OBJECT ID AND TRY TO LOCK IT. IF ERROR --> throws
             * exception, GO TO STEP ELSE --> GO TO STEP 3
             * *******************************************************
             */
            String experimentID = request.getParameter("experiment_id");
            alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().lockObject(experimentID, loggedUser);
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
                 * STEP 3A WRITE RESPONSE ERROR.
                 * *******************************************************
                 */
                if (alreadyLocked) {
                    response.getWriter().print("{success: " + false + ", reason: '" + BlockedElementsManager.getErrorMessage() + "'}");
                } else {
                    response.getWriter().print("{success: " + true + " }");
                }
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
            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP ELSE --> GO
             * TO STEP 2 *******************************************************
             */
            if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                throw new AccessControlException("Your session is invalid. User or session token not allowed.");
            }

            /**
             * *******************************************************
             * STEP 2 GET THE OBJECT ID AND TRY TO LOCK IT. IF ERROR --> throws
             * exception, GO TO STEP ELSE --> GO TO STEP 3
             * *******************************************************
             */
            String experiment_id = request.getParameter("experiment_id");
            alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().unlockObject(experiment_id);
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "lock_analysis_handler", e.getMessage());
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
                if (alreadyLocked) {
                    response.getWriter().print("{success: " + false + ", reason: '" + BlockedElementsManager.getErrorMessage() + "'}");
                } else {
                    response.getWriter().print("{success: " + true + " }");
                }
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

            try {
                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 4b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                if (!"admin".equals(request.getParameter("loggedUser"))) {
                    throw new AccessControlException(request.getParameter("loggedUser") + " is no allowed for this operation.");
                }

                String experiment_id = request.getParameter("experiment_id");

                if (UserSessionManager.getUserSessionManager().getLoggedUsersCount() > 1) {
                    throw new Exception("Unable to remove Experiment " + experiment_id + ". Reason: All users must be disconnected before experiment removing.");
                }

                /**
                 * *******************************************************
                 * STEP 2 UPDATE IN DATABASE. IF ERROR --> throws exception if
                 * not valid session, GO TO STEP 4b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                new Experiment_JDBCDAO().remove(experiment_id);

                /**
                 * *******************************************************
                 * STEP 3 REMOVE THE FOLDER ERROR --> throws ioSQL , GO TO STEP
                 * 4b ELSE --> GO TO STEP 7
                 * ******************************************************
                 */
                try {
                    FileUtils.deleteDirectory(new File(DATA_LOCATION + File.separator + experiment_id));
                    // Directory creation failed
                } catch (IOException exception) {
                    throw new Exception("Unable to remove the Experiment folder. Please check if the Tomcat user has read/write permissions over the data application directory.");
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
                    response.getWriter().print("{success: " + true + "}");
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

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get ALL THE ANALYSIS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                String experiment_id = request.getParameter("experiment_id");
                String user_id = request.getParameter("loggedUser");
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
                    response.getWriter().print("{success: " + true + ", valid_experiment: " + valid_experiment + " }");
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

    private void dump_database_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String backup_file_location = DATA_LOCATION + "/STATegraDB_content_backup_" + new SimpleDateFormat("yyyyMMdd_HHmm").format(new Date()) + ".sql";

        try {
            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP 4b ELSE -->
             * GO TO STEP 2
             * *******************************************************
             */
            if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                throw new AccessControlException("Your session is invalid. User or session token not allowed.");
            }

            if (!"admin".equals(request.getParameter("loggedUser"))) {
                throw new AccessControlException(request.getParameter("loggedUser") + " is no allowed for this operation.");
            }

            /**
             * *******************************************************
             * STEP 2 EXECUTE THE DUMP SCRIPT. IF ERROR --> throws exception if
             * failed dump, GO TO STEP 3b ELSE --> GO TO STEP 3
             * *******************************************************
             */
            DBConnectionManager.getConnectionManager().doDatabaseDump(backup_file_location);
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Experiment_servlets.class.getName(), "dump_database_handler", e.getMessage());
        } finally {
            /**
             * *******************************************************
             * STEP 3b CATCH ERROR. GO TO STEP 5
             * *******************************************************
             */
            if (ServerErrorManager.errorStatus()) {
                response.setStatus(400);
                response.getWriter().print(ServerErrorManager.getErrorResponse());

                File file = new File(backup_file_location);
                if (file.exists()) {
                    file.delete();
                }
            } else {
                /**
                 * *******************************************************
                 * STEP 3A WRITE RESPONSE ERROR.
                 * *******************************************************
                 */
                response.getWriter().print("{success: " + true + ", location: '" + backup_file_location + "' }");
            }
        }
    }

    private void get_experiment_directory_content_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            String directoryContent = "";
            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get ALL THE ANALYSIS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                String experiment_id = request.getParameter("currentExperimentID");

                /**
                 * *******************************************************
                 * STEP 2 Get ALL THE ANALYSIS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Experiment");
                Experiment experiment = (Experiment) dao_instance.findByID(experiment_id, null);
                directoryContent = experiment.getExperimentDataDirectoryContent(DATA_LOCATION);
                
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "get_all_analysis_handler", e.getMessage());
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
                    response.getWriter().print("{success: " + true + ", directoryContent : " + directoryContent + " }");
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
            ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "get_experiment_directory_content", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

}
