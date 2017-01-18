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
import bdManager.DAO.samples.AnalyticalReplicate_JDBCDAO;
import bdManager.DAO.samples.Protocol_JDBCDAO;
import classes.samples.Protocol;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import common.BlockedElementsManager;
import common.ServerErrorManager;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.security.AccessControlException;
import java.util.ArrayList;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author Rafa Hernández de Diego
 */
public class Protocols_servlets extends Servlet {

    String SOP_FILES_LOCATION = File.separator + "SOP_documents" + File.separator;

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

        //TODO: CONTROL NEW IDS => AVOID DUPLICATED IDs (e.g. IF AN USER IS CREATING A NEW TREATMENT, THE GIVEN ID MUST BE BLOCKED
        if (request.getServletPath().equals("/get_all_protocols")) {
            get_all_protocols_handler(request, response);
        } else if (request.getServletPath().equals("/get_protocol")) {
            get_protocol_handler(request, response);
        } else if (request.getServletPath().equals("/add_protocol")) {
            add_protocol_handler(request, response);
        } else if (request.getServletPath().equals("/update_protocol")) {
            update_protocol_handler(request, response);
        } else if (request.getServletPath().equals("/lock_protocol")) {
            lock_protocol_handler(request, response);
        } else if (request.getServletPath().equals("/unlock_protocol")) {
            unlock_protocol_handler(request, response);
        } else if (request.getServletPath().equals("/remove_protocol")) {
            remove_protocol_handler(request, response);
        } else if (request.getServletPath().equals("/check_removable_protocol")) {
            check_removable_protocol(request, response);
        } else {
            common.ServerErrorManager.addErrorMessage(3, Protocols_servlets.class.getName(), "doPost", "What are you doing here?.");
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_all_protocols_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> protocolList = null;
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
                 * STEP 2 Get ALL THE Object from DB. IF ERROR --> throws MySQL
                 * exception, GO TO STEP 4b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Protocol");
                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                protocolList = dao_instance.findAll(params);

                /**
                 * *******************************************************
                 * STEP 3 Get ALL THE Object from DB. ELSE --> GO TO STEP 4
                 * *******************************************************
                 */
                for (Object protocol : protocolList) {
                    File file = new File(DATA_LOCATION + SOP_FILES_LOCATION + ((Protocol) protocol).getProtocolID() + "_SOP.pdf");
                    if (file.exists()) {
                        ((Protocol) protocol).setHasSOPFile(true);
                    }
                }

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "get_all_protocols_handler", e.getMessage());
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
                     * STEP 4 WRITE RESPONSE ERROR. GO TO STEP 5
                     * *******************************************************
                     */
                    String protocolsJSON = "[";

                    for (int i = 0; i < protocolList.size(); i++) {
                        protocolsJSON += ((Protocol) protocolList.get(i)).toJSON() + ((i < protocolList.size() - 1) ? "," : "");
                    }
                    protocolsJSON += "]";

                    response.getWriter().print(protocolsJSON);
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
            ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "get_all_protocols_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_protocol_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            Protocol protocol = null;
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
                 * STEP 2 Get ALL THE Object from DB. IF ERROR --> throws MySQL
                 * exception, GO TO STEP 4b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Protocol");
                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                String protocol_id = requestData.get("protocol_id").getAsString();
                protocol = (Protocol) dao_instance.findByID(protocol_id, params);

                /**
                 * *******************************************************
                 * STEP 3 Get ALL THE Object from DB. ELSE --> GO TO STEP 4
                 * *******************************************************
                 */
                File file = new File(DATA_LOCATION + SOP_FILES_LOCATION + protocol.getProtocolID() + "_SOP.pdf");
                if (file.exists()) {
                    protocol.setHasSOPFile(true);
                }

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "get_protocol_handler", e.getMessage());
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
                     * STEP 4 WRITE RESPONSE ERROR. GO TO STEP 5
                     * *******************************************************
                     */
                    response.getWriter().print(protocol.toJSON());
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
            ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "get_protocol_handler", e.getMessage());
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
    private void add_protocol_handler(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        try {
            String LOCKED_ID = null;
            boolean ROLLBACK_NEEDED = false;
            boolean REMOVE_FILE_NEEDED = false;
            DAO dao_instance = null;

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
                 * STEP 2 Get the new ID for the protocol. IF ERROR --> throws
                 * SQL Exception, GO TO STEP 6b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Protocol");
                String newID = dao_instance.getNextObjectID(null);
                LOCKED_ID = newID;

                /**
                 * *******************************************************
                 * STEP 3 Get the Object by parsing the JSON data. IF ERROR -->
                 * throws JsonParseException, GO TO STEP 6b ELSE --> GO TO STEP
                 * 4 *******************************************************
                 */
                Protocol protocol = null;
                protocol = Protocol.fromJSON(requestData.get("protocol_json_data"));

                /**
                 * *******************************************************
                 * STEP 4 Set the object ID. IF ERROR --> GO TO STEP 6b ELSE -->
                 * GO TO STEP 5
                 * *******************************************************
                 */
                protocol.setProtocolID(newID);

                /**
                 * *******************************************************
                 * STEP 5 Add the new Object in the DATABASE. IF ERROR -->
                 * throws SQL Exception, GO TO STEP 6b ELSE --> GO TO STEP 6
                 * *******************************************************
                 */
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                dao_instance.insert(protocol);

                /**
                 * *******************************************************
                 * STEP 6 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO
                 * STEP 7
                 * *******************************************************
                 */
                dao_instance.doCommit();
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "add_protocol_handler", e.getMessage());
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
                    response.getWriter().print(obj.toString());
                }

                //Liberate the ID
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
            ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "add_protocol_handler", e.getMessage());
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
    private void update_protocol_handler(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
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
                 * STEP 3 Get the protocol Object by parsing the JSON data. IF
                 * ERROR --> throws JsonParseException, GO TO STEP ? ELSE --> GO
                 * TO STEP 4
                 * *******************************************************
                 */
                Protocol protocol = Protocol.fromJSON(requestData.get("protocol_json_data"));

                /**
                 * *******************************************************
                 * STEP 4 UPDATE THE protocol IN DATABASE. IF ERROR --> throws
                 * SQL Exception, GO TO STEP ? ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Protocol");

                //CHECK IF CURRENT USER IS A VALID OWNER (AVOID HACKING)
                boolean loadRecursive = false;
                Protocol protocolAux = (Protocol) dao_instance.findByID(protocol.getProtocolID(), new Object[]{loadRecursive});
                if (!protocolAux.isOwner(loggedUserID) && !loggedUserID.equals("admin")) {
                    throw new AccessControlException("Cannot update selected Protocol. Current user has not privileges over this Protocol.");
                }

                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                dao_instance.update(protocol);

                /**
                 * *******************************************************
                 * STEP 5 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "update_protocol_handler", e.getMessage());
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
                    obj.add("success", new JsonPrimitive(true));
                    response.getWriter().print(obj.toString());
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
            ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "update_protocol_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void lock_protocol_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
            String protocolID = requestData.get("protocol_id").getAsString();
            alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().lockObject(protocolID, loggedUser);
            if (alreadyLocked) {
                locker_id = BlockedElementsManager.getBlockedElementsManager().getLockerID(protocolID);
            }
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "lock_protocol_handler", e.getMessage());
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
    private void unlock_protocol_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
            String protocol_id = requestData.get("protocol_id").getAsString();
            alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().unlockObject(protocol_id, loggedUser);
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "unlock_protocol_handler", e.getMessage());
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

    private void remove_protocol_handler(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        try {
            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;
            String protocol_id = null;
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

                protocol_id = requestData.get("protocol_id").getAsString();
                boolean alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().lockObject(protocol_id, loggedUserID);
                if (alreadyLocked) {
                    String locker_id = BlockedElementsManager.getBlockedElementsManager().getLockerID(protocol_id);
                    if (!locker_id.equals(loggedUser)) {
                        throw new Exception("Sorry but this protocol is being edited by other user. Please try later.");
                    }
                }

                /**
                 * *******************************************************
                 * STEP 3 REMOVE THE EXPERIMENT. IF ERROR --> throws MySQL
                 * exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Protocol");
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;

                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                Protocol protocol = (Protocol) dao_instance.findByID(protocol_id, params);

                //Check if user is owner
                if (protocol.isOwner(loggedUserID) || "admin".equals(loggedUserID)) {
                    if (protocol.getOwners().length == 1 || "admin".equals(loggedUserID)) {
                        //If is the last owner or the admin, remove the entire experiment
                        dao_instance.remove(protocol_id);
                        /**
                         * *******************************************************
                         * STEP 3 REMOVE THE SOP DOCUMENT ERROR --> throws ioSQL
                         * , GO TO STEP 4b ELSE --> GO TO STEP 7
                         * ******************************************************
                         */
                        File file = new File(DATA_LOCATION + SOP_FILES_LOCATION + protocol_id + "_SOP.pdf");
                        if (file.exists()) {
                            file.delete();
                        }
                    } else {
                        //else just remove the entry in the table of ownerships
                        ((Protocol_JDBCDAO) dao_instance).removeOwnership(loggedUserID, protocol_id);
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
                //CHECK IF IS A FOREIGN KEY CONSTRAIT EXCEPTION
                if (e.getClass().getSimpleName().equals("MySQLIntegrityConstraintViolationException")) {
                    ServerErrorManager.handleException(null, null, null, "Unable to remove the selected protocol.</br>One or more Analytical samples are associated with selected protocol.</br>Remove first those Analytical samples or change the associated protocol and try again later.");
                } else if (e.getClass().getSimpleName().equals("AccessControlException")) {
                    ServerErrorManager.handleException(null, null, null, e.getMessage());
                } else {
                    ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "remove_protocol_handler", e.getMessage());
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
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    response.getWriter().print(obj.toString());
                }

                BlockedElementsManager.getBlockedElementsManager().unlockObject(protocol_id, loggedUser);

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
            ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "remove_protocol_handler", e.getMessage());
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
    private void check_removable_protocol(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //FIRST CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP.
        if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
            return;
        }
        DAO dao_instance = null;
        ArrayList<String> analyticalSampleIds = null;
        try {
            try {
                String object_id = request.getParameter("object_id");
                String object_type = request.getParameter("object_type");

                if (!"protocol".equalsIgnoreCase(object_type)) {
                    return;
                }

                dao_instance = DAOProvider.getDAOByName("AnalyticalReplicate");

                String[] fieldNames = {"protocol_id"};
                String[] fieldValues = {object_id};

                analyticalSampleIds = ((AnalyticalReplicate_JDBCDAO) dao_instance).findBy(fieldNames, fieldValues);
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Protocols_servlets.class.getName(), "check_removable", e.getMessage());
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
                    String analyticalSampleIdsJSON = "analyticalSampleIds : [";

                    if (analyticalSampleIds != null) {
                        for (String id : analyticalSampleIds) {
                            analyticalSampleIdsJSON += ",\"" + id + "\"";
                        }
                    }
                    analyticalSampleIdsJSON = analyticalSampleIdsJSON.replaceFirst(",", "");
                    analyticalSampleIdsJSON += "]";

                    response.getWriter().print("{success: " + (analyticalSampleIds == null || analyticalSampleIds.isEmpty()) + ", " + analyticalSampleIdsJSON + " }");
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
            ServerErrorManager.addErrorMessage(4, Protocols_servlets.class.getName(), "check_removable", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");

        if (request.getServletPath().equals("/get_sop_file")) {
            get_SOP_file_handler(request, response);
        } else {
            common.ServerErrorManager.addErrorMessage(3, Protocols_servlets.class.getName(), "doGet", "What are you doing here?.");
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_SOP_file_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String protocol_id = request.getParameter("protocol_id");

        try {
            File file = new File(DATA_LOCATION + SOP_FILES_LOCATION + protocol_id + "_SOP.pdf");

            if (file.exists()) {
                response.reset();
                response.addHeader("Access-Control-Allow-Origin", "*");

                response.setContentType("application/pdf");
                response.addHeader("Content-Disposition", "attachment; filename=" + protocol_id + "_SOP.pdf");
                response.setContentLength((int) file.length());

                FileInputStream fileInputStream = new FileInputStream(file);
                OutputStream responseOutputStream = response.getOutputStream();
                int bytes;
                while ((bytes = fileInputStream.read()) != -1) {
                    responseOutputStream.write(bytes);
                }
                responseOutputStream.close();
            }
        } catch (Exception e) {
            ServerErrorManager.addErrorMessage(4, Protocols_servlets.class.getName(), "get_SOP_file_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }
}
