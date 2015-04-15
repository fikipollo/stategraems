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
import bdManager.DAO.samples.Bioreplicate_JDBCDAO;
import classes.User;
import classes.samples.Batch;
import common.BlockedElementsManager;
import common.ServerErrorManager;
import java.io.IOException;
import java.security.AccessControlException;
import java.util.ArrayList;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/*
 * @author Rafa Hernández de Diego
 */
@MultipartConfig
public class Batch_servlets extends Servlet {

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

        if (request.getServletPath().equals("/get_all_batchs")) {
            get_all_batch_handler(request, response);
        } else if (request.getServletPath().equals("/get_batch")) {
            get_batch_handler(request, response);
        } else if (request.getServletPath().equals("/add_batch")) {
            add_batch_handler(request, response);
        } else if (request.getServletPath().equals("/update_batch")) {
            update_batch_handler(request, response);
        } else if (request.getServletPath().equals("/remove_batch")) {
            remove_batch_handler(request, response);
        } else if (request.getServletPath().equals("/check_removable_batch")) {
            check_removable_batch(request, response);
        } else {
            common.ServerErrorManager.addErrorMessage(3, Batch_servlets.class.getName(), "doPost", "What are you doing here?.");
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_all_batch_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> batchList = null;
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
                dao_instance = DAOProvider.getDAOByName("Batch");
                batchList = dao_instance.findAll(null);

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Batch_servlets.class.getName(), "get_all_batch_handler", e.getMessage());
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
                    String batchJSON = "batchList : [";

                    for (Object batch : batchList) {
                        batchJSON += ((Batch) batch).toJSON() + ", ";
                    }
                    batchJSON += "]";

                    response.getWriter().print("{success: " + true + ", " + batchJSON + " }");
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
            ServerErrorManager.handleException(e, Batch_servlets.class.getName(), "get_all_batch_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_batch_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            Batch batch = null;
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
                dao_instance = DAOProvider.getDAOByName("Batch");
                String batch_id = request.getParameter("batch_id");
                batch = (Batch) dao_instance.findByID(batch_id, null);

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Batch_servlets.class.getName(), "get_batch_handler", e.getMessage());
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
                    String batchJSON = "batchList : [";
                    batchJSON += batch.toJSON() + ", ";
                    batchJSON += "]";

                    response.getWriter().print("{success: " + true + ", " + batchJSON + " }");
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
            ServerErrorManager.handleException(e, Batch_servlets.class.getName(), "get_batch_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     *
     * <p/>
     * @param request
     * @param response
     * @throws IOException
     * @throws ServletException
     */
    private void add_batch_handler(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        try {
            String LOCKED_ID = null;
            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;
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
                 * STEP 2 Get the new ID for the object. IF ERROR --> throws SQL
                 * Exception, GO TO STEP 5b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Batch");
                String newID = dao_instance.getNextObjectID(null);
                LOCKED_ID = newID;

                /**
                 * *******************************************************
                 * STEP 3 Get the object DTO by parsing the JSON data. IF ERROR
                 * --> throws JsonParseException, GO TO STEP 5b ELSE --> GO TO
                 * STEP 4
                 * *******************************************************
                 */
                //Get parameters
                String batch_name = request.getParameter("batch_name");
                String batch_creation_date = request.getParameter("batch_creation_date");
                String description = request.getParameter("description");
                String[] owners_ids = request.getParameter("owners").split(",");

                Batch batch = new Batch();
                batch.setBatchID(newID);
                batch.setBatchName(batch_name);
                batch.setBatchCreationDate(batch_creation_date);
                batch.setDescription(description);
                batch.setOwners(owners_ids);

                /**
                 * *******************************************************
                 * STEP 4 Add the new ANALYSIS Object in the DATABASE. IF ERROR
                 * --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                dao_instance.insert(batch);

                /**
                 * *******************************************************
                 * STEP 5 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Batch_servlets.class.getName(), "add_batch_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 5b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());

                    if (ROLLBACK_NEEDED) {
                        dao_instance.doRollback();
                    }
                } else {
                    response.getWriter().print("{success: " + true + ", newID : '" + LOCKED_ID + "' }");
                }

                if (LOCKED_ID != null) {
                    BlockedElementsManager.getBlockedElementsManager().unlockID(LOCKED_ID);
                }
                /**
                 * *******************************************************
                 * STEP 6 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Batch_servlets.class.getName(), "add_batch_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     *
     * <p/>
     * @param request
     * @param response
     * @throws IOException
     * @throws ServletException
     */
    private void update_batch_handler(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        try {
            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;
            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                String loggedUser = request.getParameter("loggedUser");
                if (!checkAccessPermissions(loggedUser, request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                String batch_id = request.getParameter("batch_id");
                dao_instance = DAOProvider.getDAOByName("Batch");

                //CHECK IF THE USER IS IN THE LIST OF OWNERS, AS WE ALREADY CHECKED THAT SESSION IS VALID
                //AND OWNERSHIP SHOULD BE CHECKED FIRST AT CLIENT LEVEL
                //SO IF WE FAIL NOW, WE SHOULD SUPPOSE THAT USER IS TRYING TO HACK THE CODE, SO LET'S KILL HIS SESSION
                Batch batch_aux = (Batch) dao_instance.findByID(batch_id, null);
                boolean valid_user = false;
                for (User owner : batch_aux.getOwners()) {
                    if (loggedUser.equals(owner.getUserID()) || loggedUser.equals("admin")) {
                        valid_user = true;
                        break;
                    }
                }
                if (!valid_user && !loggedUser.equals("admin")) {
                    throw new AccessControlException("User " + loggedUser + " can not edit the selected batch because of is not in the owners list.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get the object DTO by parsing the JSON data. IF ERROR
                 * --> throws JsonParseException, GO TO STEP 5b ELSE --> GO TO
                 * STEP 3
                 * *******************************************************
                 */
                //Get parameters
                String batch_name = request.getParameter("batch_name");
                String batch_creation_date = request.getParameter("batch_creation_date");
                String description = request.getParameter("description");
                String[] owners_ids = request.getParameter("owners").split(",");

                Batch batch = new Batch();
                batch.setBatchID(batch_id);
                batch.setBatchName(batch_name);
                batch.setBatchCreationDate(batch_creation_date);
                batch.setDescription(description);
                batch.setOwners(owners_ids);
                /**
                 * *******************************************************
                 * STEP 4 Add the new batch Object in the DATABASE. IF ERROR -->
                 * throws SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;

                dao_instance.update(batch);

                /**
                 * *******************************************************
                 * STEP 5 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Batch_servlets.class.getName(), "update_batch_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 5b CATCH ERROR, CLEAN CHANGES. throws SQLException
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
                 * STEP 6 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Batch_servlets.class.getName(), "update_batch_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void remove_batch_handler(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        try {
            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;
            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                String loggedUser = request.getParameter("loggedUser");
                if (!checkAccessPermissions(loggedUser, request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }
                
                
                /**
                 * *******************************************************
                 * STEP 2 Get the object DTO by parsing the JSON data. IF ERROR
                 * --> throws JsonParseException, GO TO STEP 5b ELSE --> GO TO
                 * STEP 3
                 * *******************************************************
                 */
                //Get parameters
                String batch_id = request.getParameter("batch_id");
                dao_instance = DAOProvider.getDAOByName("Batch");

                //CHECK IF THE USER IS IN THE LIST OF OWNERS, AS WE ALREADY CHECKED THAT SESSION IS VALID
                //AND OWNERSHIP SHOULD BE CHECKED FIRST AT CLIENT LEVEL
                //SO IF WE FAIL NOW, WE SHOULD SUPPOSE THAT USER IS TRYING TO HACK THE CODE, SO LET'S KILL HIS SESSION
                Batch batch_aux = (Batch) dao_instance.findByID(batch_id, null);
                boolean valid_user = false;
                for (User owner : batch_aux.getOwners()) {
                    if (loggedUser.equals(owner.getUserID()) || loggedUser.equals("admin")) {
                        valid_user = true;
                        break;
                    }
                }
                if (!valid_user && !loggedUser.equals("admin")) {
                    throw new AccessControlException("User " + loggedUser + " can not edit the selected batch because of is not in the owners list.");
                }



                /**
                 * *******************************************************
                 * STEP 3 Check if the logged user is in the owner list of the
                 * batch Object. If so, check if the batch is no being used by
                 * any analytical replicates. If not, remove the batch. IF ERROR
                 * --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;

                dao_instance.remove(batch_id);

                /**
                 * *******************************************************
                 * STEP 5 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                //CHECK IF IS A FOREIGN KEY CONSTRAIT EXCEPTION
                if (e.getClass().getSimpleName().equals("MySQLIntegrityConstraintViolationException")) {
                    ServerErrorManager.handleException(null, null, null, "Unable to remove the selected batch.</br>One or more Biological replicates are associated with selected batch.</br>Remove first those Biological replicates or change the associated batch and try again later.");
                } else if (e.getClass().getSimpleName().equals("AccessControlException")) {
                    ServerErrorManager.handleException(null, null, null, e.getMessage());
                } else {
                    ServerErrorManager.handleException(e, Batch_servlets.class.getName(), "remove_batch_handler", e.getMessage());
                }
            } finally {
                /**
                 * *******************************************************
                 * STEP 5b CATCH ERROR, CLEAN CHANGES. throws SQLException
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
                 * STEP 6 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Batch_servlets.class.getName(), "remove_batch_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    //************************************************************************************
    //*****OTHER SERVLET HANDLERS ********************************************************
    //************************************************************************************
    /**
     * This function checks if a given object is removable or other items depend
     * on this instance
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void check_removable_batch(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //FIRST CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP.
        if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
            return;
        }
        DAO dao_instance = null;
        ArrayList<String> biologicalSampleIds = null;
        try {
            try {
                String object_id = request.getParameter("object_id");
                String object_type = request.getParameter("object_type");

                if (!"batch".equalsIgnoreCase(object_type)) {
                    return;
                }

                dao_instance = DAOProvider.getDAOByName("Bioreplicate");

                String[] fieldNames = {"batch_id"};
                String[] fieldValues = {object_id};

                biologicalSampleIds = ((Bioreplicate_JDBCDAO) dao_instance).findBy(fieldNames, fieldValues);
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Batch_servlets.class.getName(), "check_removable", e.getMessage());
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
                    String biologicalSampleIdsJSON = "biologicalSampleIds : [";

                    if (biologicalSampleIds != null) {
                        for (String id : biologicalSampleIds) {
                            biologicalSampleIdsJSON += ",\"" + id + "\"";
                        }
                    }
                    biologicalSampleIdsJSON = biologicalSampleIdsJSON.replaceFirst(",", "");
                    biologicalSampleIdsJSON += "]";

                    response.getWriter().print("{success: " + (biologicalSampleIds == null || biologicalSampleIds.isEmpty()) + ", " + biologicalSampleIdsJSON + " }");
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
        } catch (Exception e) {
            ServerErrorManager.addErrorMessage(4, Batch_servlets.class.getName(), "check_removable", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }
}
