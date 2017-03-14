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
import classes.Message;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import common.ServerErrorManager;
import java.security.AccessControlException;
import java.util.ArrayList;

import java.util.Map;
import javax.servlet.http.Cookie;

/**
 *
 * SERVLET FOR MESSAGES:
 * +----------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 * | Resource             |       POST            |     GET       |                       PUT                            |      DELETE         |
 * +----------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 * | /rest/messages       | Create a new message  | List messages | Replace messages list with new messages(Bulk update) | Delete all messages |
 * +----------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 * | /rest/messages/1234  |       Error           | Show message  |        If exist update message else ERROR            | Delete message      |
 * +----------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 *
 */
public class Message_servlets extends Servlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            //Do nothing
        } else {
            add_new_message_handler(request, response);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            get_message_handler(request, response);
        } else {
            get_all_messages_handler(request, response);
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            update_message_handler(request, response);
        } else {
            update_all_messages_handler(request, response);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            delete_message_handler(request, response);
        } else {
            delete_all_messages_handler(request, response);
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * POST REQUEST HANDLERS                                                                    *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void add_new_message_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            boolean ROLLBACK_NEEDED = false;
            DAO daoInstance = null;
            Message message = null;

            try {

                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                Map<String, Cookie> cookies = this.getCookies(request);
                String loggedUser = cookies.get("loggedUser").getValue();
                String sessionToken = cookies.get("sessionToken").getValue();

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
                 * STEP 2 Get the new ID for the ANALYSIS. IF ERROR --> throws
                 * SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("Message");

                /**
                 * *******************************************************
                 * STEP 3 Get the ANALYSIS Object by parsing the JSON data. IF
                 * ERROR --> throws JsonParseException, GO TO STEP 5b ELSE -->
                 * GO TO STEP 4
                 * *******************************************************
                 */
                //Get parameters
                message = Message.fromJSON(requestData.get("message_json_data"));
                message.setDate("now");
                message.setRead(false);

                /**
                 * *******************************************************
                 * STEP 4 Add the new ANALYSIS Object in the DATABASE. IF ERROR
                 * --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                daoInstance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                daoInstance.insert(message);

                /**
                 * *******************************************************
                 * STEP 5 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                daoInstance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Message_servlets.class.getName(), "add_new_message_handler", e.getMessage());
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
                        daoInstance.doRollback();
                    }
                } else {
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
            ServerErrorManager.handleException(e, Message_servlets.class.getName(), "add_new_message_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * GET REQUEST HANDLERS                                                                     *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void get_all_messages_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> messageList = null;
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
                    throw new AccessControlException("Your session is invalid. Please sign in again.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get ALL THE ANALYSIS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                Object[] params = {loggedUserID};
                dao_instance = DAOProvider.getDAOByName("Message");
                messageList = dao_instance.findAll(params);
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Message_servlets.class.getName(), "get_all_messages_handler", e.getMessage());
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
                    String analysisJSON = "[";
                    for (int i = 0; i < messageList.size(); i++) {
                        analysisJSON += ((Message) messageList.get(i)).toJSON() + ((i < messageList.size() - 1) ? "," : "");
                    }
                    analysisJSON += "]";

                    response.getWriter().print(analysisJSON);
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
            ServerErrorManager.handleException(e, Message_servlets.class.getName(), "get_all_messages_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_message_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
                ServerErrorManager.handleException(e, Message_servlets.class.getName(), "get_message_handler", e.getMessage());
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
            ServerErrorManager.handleException(e, Message_servlets.class.getName(), "get_message_handler", e.getMessage());
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

    private void update_message_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
                    ServerErrorManager.handleException(e, Message_servlets.class.getName(), "update_message_handler", e.getMessage());
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
            ServerErrorManager.handleException(e, Message_servlets.class.getName(), "update_message_handler", e.getMessage());
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

    private void delete_message_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
                ServerErrorManager.handleException(e, Message_servlets.class.getName(), "delete_message_handler", e.getMessage());
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
            ServerErrorManager.handleException(e, Message_servlets.class.getName(), "delete_message_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

}
