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
import classes.User;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import common.ServerErrorManager;
import common.UserSessionManager;
import java.security.AccessControlException;
import java.util.ArrayList;
import java.util.Map;
import javax.servlet.http.Cookie;
import resources.SHA1;

/**
 *
 * SERVLET FOR USERS:
 * +----------------------+-----------------------+-------------------+-----------------------------+---------------------+
 * | Resource             |       POST            |    GET            |           PUT               |        DELETE       |
 * +----------------------+-----------------------+-------------------+-----------------------------+---------------------+
 * | /rest/users          | Create a new user     | Get all user      |   Do nothing                | Do nothing          |
 * +----------------------+-----------------------+-------------------+-----------------------------+---------------------+
 * | /rest/users/1234     |    Do nothing         | Show user details |   Updates user information  | Delete user         |
 * +----------------------+-----------------------+-------------------+-----------------------------+---------------------+
 * | /rest/users/session  |       Sign in         | Validate session  |   Do nothing                | Log out             |
 * +----------------------+-----------------------+-------------------+-----------------------------+---------------------+
 *
 */
public class User_servlets extends Servlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");

        //NEW SERVICES
        if (matchService(request.getPathInfo(), "/session")) {
            // POST /rest/user/session
            user_sign_in_handler(request, response);
        } else if (matchService(request.getPathInfo(), "/(.+)")) {
            // POST /rest/user/ebiokit
            //Do nothing
        } else {
            // POST /rest/user
            user_sign_up_handler(request, response);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");

        //NEW SERVICES
        if (matchService(request.getPathInfo(), "/session")) {
            // GET /rest/user/session
            validate_session_handler(request, response);
        } else if (matchService(request.getPathInfo(), "/(.+)")) {
            // GET /rest/user/ebiokit
            get_user_details_handler(request, response);
        } else {
            // GET /rest/user
            get_user_list_handler(request, response);
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");

        //NEW SERVICES
        if (matchService(request.getPathInfo(), "/session")) {
            // PUT /rest/user/session
            //Do nothing
        } else if (matchService(request.getPathInfo(), "/(.+)")) {
            // PUT/rest/user/ebiokit
            update_user_handler(request, response);
        } else {
            // PUT/rest/user
            //Do nothing
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");

        //NEW SERVICES
        if (matchService(request.getPathInfo(), "/session")) {
            // GET /rest/user/session
            user_logout_handler(request, response);
        } else if (matchService(request.getPathInfo(), "/(.+)")) {
            // GET /rest/user/ebiokit
            delete_user_handler(request, response);
        } else {
            // GET /rest/user
            //Do nothing
        }
    }


    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * GET REQUEST HANDLERS                                                                    *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void user_sign_in_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            User user = null;
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

                String email = requestData.get("email").getAsString();
                String password = requestData.get("password").getAsString();
                password = SHA1.getHash(password);

                boolean isEmail = true;
                boolean last_experiment = true;
                Object[] params = {password, last_experiment, isEmail};
                dao_instance = DAOProvider.getDAOByName("User");

                user = (User) ((User_JDBCDAO) dao_instance).findByID(email, params);
                /**
                 * *******************************************************
                 * STEP 2 Check if user exists. IF NOT --> throws Exception, GO
                 * TO STEP 2b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                if (user == null) {
                    throw new AccessControlException("User not found. Please check the username and password.");
                }

                user.setSessionToken(UserSessionManager.getUserSessionManager().registerNewUser(email));

            } catch (Exception e) {
                ServerErrorManager.handleException(e, User_servlets.class.getName(), "userLoginPostHandler", e.getMessage());
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
                    response.setStatus(200);
                    response.getWriter().print(user.toJSON());
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
            ServerErrorManager.handleException(e, User_servlets.class.getName(), "userLoginPostHandler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void user_sign_up_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            User user = null;
            boolean ROLLBACK_NEEDED = false;
            String error = "";
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

                String email = requestData.get("email").getAsString();
                String user_id = requestData.get("user_id").getAsString();
                String password = requestData.get("password").getAsString();
                password = SHA1.getHash(password);

                dao_instance = DAOProvider.getDAOByName("User");
                Object[] params = {null, false, true};
                user = (User) ((User_JDBCDAO) dao_instance).findByID(email, params);
                if (user != null) {
                    throw new AccessControlException("Email already registered.");
                }
                user = (User) ((User_JDBCDAO) dao_instance).findByID(user_id, null);
                if (user != null) {
                    throw new AccessControlException("There is another user with that name. Try with another name.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Create the new user instance.
                 * *******************************************************
                 */
                user = new User(user_id, email);
                user.setPassword(password);
                user.setRandomAPICode();

                /**
                 * *******************************************************
                 * STEP 3 INSERT IN DATABASE. IF ERROR --> throws exception if
                 * not valid session, GO TO STEP 4b ELSE --> GO TO STEP 4
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("User");
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                dao_instance.insert(user);

                /**
                 * *******************************************************
                 * STEP 4 COMMIT CHANGES IN DB. IF ERROR --> throws exception if
                 * not valid session, GO TO STEP 4b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance.doCommit();
            } catch (AccessControlException e) {
                error = e.getMessage();
            } catch (Exception e) {
                ServerErrorManager.handleException(e, User_servlets.class.getName(), "userLoginPostHandler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 3b CATCH ERROR. GO TO STEP 4
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());

                    if (ROLLBACK_NEEDED) {
                        dao_instance.doRollback();
                    }
                } else {
                    /**
                     * *******************************************************
                     * STEP 3A WRITE RESPONSE ERROR. GO TO STEP 4
                     * *******************************************************
                     */
                    if (error.length() > 0) {
                        JsonObject obj = new JsonObject();
                        obj.add("success", new JsonPrimitive(false));
                        obj.add("reason", new JsonPrimitive(error));
                        response.getWriter().print(obj.toString());
                    } else {
                        JsonObject obj = new JsonObject();
                        obj.add("success", new JsonPrimitive(true));
                        response.getWriter().print(obj.toString());
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
            ServerErrorManager.handleException(e, User_servlets.class.getName(), "userSignUpPostHandler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }


    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * PUT REQUEST HANDLERS                                                                    *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void validate_session_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP 4b ELSE -->
             * *******************************************************
             */
            if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                throw new AccessControlException("Your session is invalid. User or session token not allowed.");
            }
        } catch (Exception e) {
            ServerErrorManager.handleException(e, User_servlets.class.getName(), "removeUserPostHandler", e.getMessage());
        } finally {
            /**
             * *******************************************************
             * STEP 4b CATCH ERROR, CLEAN CHANGES. throws SQLException
             * *******************************************************
             */
            if (ServerErrorManager.errorStatus()) {
                response.setStatus(400);
                response.getWriter().print(ServerErrorManager.getErrorResponse());
            } else {
                response.getWriter().print("{success: " + true + "}");
            }
        }
    }

    private void get_user_details_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            User user = null;
            try {
                Map<String, Cookie> cookies = this.getCookies(request);
                String loggedUser = cookies.get("loggedUser").getValue();
                String sessionToken = cookies.get("sessionToken").getValue();
                String userID = request.getPathInfo().replaceAll("/", "");

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 3b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 GET USER. IF ERROR --> throws
                 * exception if not valid session, GO TO STEP 3b ELSE --> GO TO
                 * STEP 2
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("User");
                boolean isEmail = false;
                Object[] params = {null, false, isEmail};
                user = (User) ((User_JDBCDAO) dao_instance).findByID(userID, params);

                if (!loggedUser.equals(user.getEmail()) && !isValidAdminUser(loggedUser)) {
                    throw new Exception("User not allowed for this action.");
                }
                
                if(isValidAdminUser(user.getEmail())){
                    user.setRole("admin");
                }

            } catch (Exception e) {
                ServerErrorManager.handleException(e, User_servlets.class.getName(), "getUserPostHandler", e.getMessage());
            } finally {

                /**
                 * *******************************************************
                 * STEP 3b CATCH ERROR AND WRITE RESPONSE.
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                } else {
                    response.getWriter().print(user.toJSON());
                }
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
        } catch (Exception e) {
            ServerErrorManager.handleException(e, User_servlets.class.getName(), "getUserPostHandler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_user_list_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> userList = null;
            String loggedUser = "";
            try {
                Map<String, Cookie> cookies = this.getCookies(request);
                loggedUser = cookies.get("loggedUser").getValue();
                String sessionToken = cookies.get("sessionToken").getValue();

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 3b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 GET ALL REGISTERED USERS. IF ERROR --> throws
                 * exception if not valid session, GO TO STEP 3b ELSE --> GO TO
                 * STEP 2
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("User");
                userList = dao_instance.findAll(null);
            } catch (Exception e) {
                ServerErrorManager.handleException(e, User_servlets.class.getName(), "getUserListPostHandler", e.getMessage());
            } finally {

                /**
                 * *******************************************************
                 * STEP 3b CATCH ERROR AND WRITE RESPONSE.
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                } else {
                    String usersJSON = "[";
                    for (int i = 0; i < userList.size(); i++) {
                        //TODO: USE FUNCTION IS ADMIN
                        if (isValidAdminUser(loggedUser)) {
                            ((User) userList.get(i)).setLoggedIn(UserSessionManager.getUserSessionManager().isLoggedUser(((User) userList.get(i)).getUserID()));
                        }
                        usersJSON += ((User) userList.get(i)).toJSON() + ((i < userList.size() - 1) ? "," : "");
                    }
                    usersJSON += "]";
                    response.getWriter().print(usersJSON);
                }
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
        } catch (Exception e) {
            ServerErrorManager.handleException(e, User_servlets.class.getName(), "getUserListPostHandler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * POST REQUEST HANDLERS                                                                    *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void update_user_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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
                Map<String, Cookie> cookies = this.getCookies(request);
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                String loggedUser, loggedUserID = null, sessionToken;
                loggedUser = cookies.get("loggedUser").getValue();
                sessionToken = cookies.get("sessionToken").getValue();
                loggedUserID = cookies.get("loggedUserID").getValue();
                String userID = request.getPathInfo().replaceAll("/", "");

                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 PARSE THE JSON DATA AND GET THE NEW OBJECT. IF ERROR
                 * --> throws exception if not valid session, GO TO STEP 4b ELSE
                 * --> GO TO STEP 3
                 * *******************************************************
                 */
                String newpass = requestData.get("newpass").getAsString();
                if (newpass != null) {
                    newpass = new String(java.util.Base64.getDecoder().decode(newpass));
                    newpass = SHA1.getHash(newpass);
                }

                /**
                 * *******************************************************
                 * STEP 3 UPDATE IN DATABASE. IF ERROR --> throws exception if
                 * not valid session, GO TO STEP 4b ELSE --> GO TO STEP 4
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("User");

                boolean isEmail = true;
                Object[] params = {null, false, isEmail};
                User user = (User) ((User_JDBCDAO) dao_instance).findByID(loggedUser, params);

                if (user == null) {
                    throw new Exception("User not valid.");
                }

                if (!userID.equals(user.getUserID()) && !isValidAdminUser(loggedUser)) {
                    throw new Exception("User not allowed for this action.");
                }

                user.setPassword(newpass);

                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                dao_instance.update(user);

                /**
                 * *******************************************************
                 * STEP 4 COMMIT CHANGES IN DB. IF ERROR --> throws exception if
                 * not valid session, GO TO STEP 4b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, User_servlets.class.getName(), "updateUserPostHandler", e.getMessage());
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
            ServerErrorManager.handleException(e, User_servlets.class.getName(), "updateUserPostHandler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * DELETE REQUEST HANDLERS                                                                    *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void user_logout_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Map<String, Cookie> cookies = this.getCookies(request);
        String loggedUser = cookies.get("loggedUser").getValue();
        String sessionToken = cookies.get("sessionToken").getValue();

        UserSessionManager.getUserSessionManager().removeUser(loggedUser, sessionToken);
        //If some errors occurred
        if (ServerErrorManager.errorStatus()) {
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        } else {
            JsonObject obj = new JsonObject();
            obj.add("success", new JsonPrimitive(true));
            response.getWriter().print(obj.toString());
        }
    }

    private void delete_user_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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

                String user_id = request.getParameter("user_id");

                if (UserSessionManager.getUserSessionManager().isLoggedUser(user_id)) {
                    throw new Exception("Unable to remove User " + user_id + ". Reason: The user is currently logged in the application.");
                }

                /**
                 * *******************************************************
                 * STEP 3 UPDATE IN DATABASE. IF ERROR --> throws exception if
                 * not valid session, GO TO STEP 4b ELSE --> GO TO STEP 4
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("User");
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                new User_JDBCDAO().remove(user_id);

                /**
                 * *******************************************************
                 * STEP 4 COMMIT CHANGES IN DB. IF ERROR --> throws exception if
                 * not valid session, GO TO STEP 4b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, User_servlets.class.getName(), "removeUserPostHandler", e.getMessage());
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
                 * STEP 6 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, User_servlets.class.getName(), "removeUserPostHandler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }
}
