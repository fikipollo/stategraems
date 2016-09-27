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
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import common.ServerErrorManager;
import common.UserSessionManager;
import java.security.AccessControlException;
import java.util.ArrayList;
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
//@WebServlet(name = "user_servlets", urlPatterns = {"/login", "/logout", "/get_user_list", "/get_user", "/add_user", "/update_user","/remove_user"})
public class User_servlets extends Servlet {

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

        if (request.getServletPath().equals("/login")) {
            userLoginPostHandler(request, response);
        } else if (request.getServletPath().equals("/logout")) {
            userLogoutPostHandler(request, response);
        } else if (request.getServletPath().equals("/get_user_list")) {
            getUserListPostHandler(request, response);
        } else if (request.getServletPath().equals("/get_user")) {
            getUserPostHandler(request, response);
        } else if (request.getServletPath().equals("/add_user")) {
            addUserPostHandler(request, response);
        } else if (request.getServletPath().equals("/update_user")) {
            updateUserPostHandler(request, response);
        } else if (request.getServletPath().equals("/remove_user")) {
            removeUserPostHandler(request, response);
        } else if (request.getServletPath().equals("/validate_session")) {
            validateSessionPostHandler(request, response);
        } else {
            common.ServerErrorManager.addErrorMessage(3, User_servlets.class.getName(), "doPost", "What are you doing here?.");
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
    private void userLoginPostHandler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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
                
                String user_id = requestData.get("user_id").getAsString();
                String password = requestData.get("password").getAsString();
                
                password = SHA1.getHash(password);
                boolean last_experiment = true;
                Object[] params = {password, last_experiment};
                dao_instance = DAOProvider.getDAOByName("User");
                user = (User) dao_instance.findByID(user_id, params);
                /**
                 * *******************************************************
                 * STEP 2 Check if user exists. IF NOT --> throws Exception, GO
                 * TO STEP 2b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                if (user == null) {
                    throw new Exception("User not found. Please check the username and password.");
                } else {
                }
                user.setSessionToken(UserSessionManager.getUserSessionManager().registerNewUser(user_id));

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

    /**
     * **************************************************************************
     ****************************************************************************
     * USER LOG-OUT HANDLER
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
    private void userLogoutPostHandler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String user_id = request.getParameter("loggedUser");
        String sessionToken = request.getParameter("sessionToken");

        UserSessionManager.getUserSessionManager().removeUser(user_id, sessionToken);
        //If some errors occurred
        if (ServerErrorManager.errorStatus()) {
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        } else {
            response.getWriter().print("{success: " + true + " }");
        }
    }

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void getUserListPostHandler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> userList = null;
            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 3b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
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
                    String usersJSON = "userList : [";
                    for (Object user : userList) {
                        if (request.getParameter("loggedUser").equals("admin")) {
                            ((User) user).setLoggedIn(UserSessionManager.getUserSessionManager().isLoggedUser(((User) user).getUserID()));
                        }
                        usersJSON += ((User) user).toJSON() + ", ";
                    }
                    usersJSON += "]";
                    response.getWriter().print("{success: " + true + ", " + usersJSON + " }");
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

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void getUserPostHandler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            User user = null;
            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 3b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
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
                String userID = request.getParameter("user_id");
                user = (User) dao_instance.findByID(userID, null);
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
                    String usersJSON = "userList : [";
                    usersJSON += user.toJSON();
                    usersJSON += "]";
                    response.getWriter().print("{success: " + true + ", " + usersJSON + " }");
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

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void addUserPostHandler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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

                /**
                 * *******************************************************
                 * STEP 2 PARSE THE JSON DATA AND GET THE NEW OBJECT. IF ERROR
                 * --> throws exception if not valid session, GO TO STEP 4b ELSE
                 * --> GO TO STEP 3
                 * *******************************************************
                 */
                String user_json_data = request.getParameter("user_json_data");
                User user = User.fromJSON(user_json_data);
                String password = user.getPassword();
                password = SHA1.getHash(password);
                user.setPassword(password);

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

            } catch (Exception e) {
                ServerErrorManager.handleException(e, User_servlets.class.getName(), "addUserPostHandler", e.getMessage());
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
            ServerErrorManager.handleException(e, User_servlets.class.getName(), "addUserPostHandler", e.getMessage());
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
    private void updateUserPostHandler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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

                /**
                 * *******************************************************
                 * STEP 2 PARSE THE JSON DATA AND GET THE NEW OBJECT. IF ERROR
                 * --> throws exception if not valid session, GO TO STEP 4b ELSE
                 * --> GO TO STEP 3
                 * *******************************************************
                 */
                String user_json_data = request.getParameter("user_json_data");
                User user = User.fromJSON(user_json_data);
                if (user.getPassword() != null) {
                    String password = user.getPassword();
                    password = SHA1.getHash(password);
                    user.setPassword(password);
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
            ServerErrorManager.handleException(e, User_servlets.class.getName(), "updateUserPostHandler", e.getMessage());
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
    private void validateSessionPostHandler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void removeUserPostHandler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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
