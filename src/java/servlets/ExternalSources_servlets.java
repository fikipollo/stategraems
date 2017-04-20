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
import classes.ExternalSource;
import com.google.gson.JsonElement;
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
 * +-----------------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 * | Resource                    |       POST            |     GET       |                       PUT                            |      DELETE         |
 * +-----------------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 * | /rest/externalsources       | Create a new source   | List sources  | Replace sources list with new sources (Bulk update)  | Delete all sources  |
 * +-----------------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 * | /rest/externalsources/1234  |       Error           | Show source   |        If exist update source else ERROR             | Delete source       |
 * +-----------------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 *
 */
public class ExternalSources_servlets extends Servlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            //Do nothing
        } else {
            add_new_external_source_handler(request, response);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            get_external_source_handler(request, response);
        } else {
            get_all_external_sources_handler(request, response);
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            update_external_source_handler(request, response);
        } else {
            update_all_external_sources_handler(request, response);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            delete_external_source_handler(request, response);
        } else {
            delete_all_external_sources_handler(request, response);
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * POST REQUEST HANDLERS                                                                    *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void add_new_external_source_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            boolean ROLLBACK_NEEDED = false;
            DAO daoInstance = null;
            ExternalSource externalSource = null;

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
                if (!isValidAdminUser(loggedUser)) {
                    throw new AccessControlException("User not allowed for this action.");
                }
                /**
                 * *******************************************************
                 * STEP 2 Get the new ID for the ANALYSIS. IF ERROR --> throws
                 * SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("ExternalSource");

                /**
                 * *******************************************************
                 * STEP 3 Get the ANALYSIS Object by parsing the JSON data. IF
                 * ERROR --> throws JsonParseException, GO TO STEP 5b ELSE -->
                 * GO TO STEP 4
                 * *******************************************************
                 */
                //Get parameters
                externalSource = ExternalSource.fromJSON(requestData.get("external_source_json_data"));

                /**
                 * *******************************************************
                 * STEP 4 Add the new ANALYSIS Object in the DATABASE. IF ERROR
                 * --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                daoInstance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                daoInstance.insert(externalSource);

                /**
                 * *******************************************************
                 * STEP 5 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                daoInstance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, ExternalSources_servlets.class.getName(), "add_new_external_source_handler", e.getMessage());
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
            ServerErrorManager.handleException(e, ExternalSources_servlets.class.getName(), "add_new_external_source_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * GET REQUEST HANDLERS                                                                     *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void get_all_external_sources_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> externalSourceList = null;
            try {
                Map<String, Cookie> cookies = this.getCookies(request);
                String loggedUser = cookies.get("loggedUser").getValue();
                String sessionToken = cookies.get("sessionToken").getValue();

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
                JsonElement requestData = (JsonElement) new JsonParser().parse(request.getReader());
                String type = request.getParameter("type");
                if (requestData != null && !requestData.isJsonNull()) {
                    type = ((JsonObject) requestData).get("type").getAsString();
                }
                
                Object[] params = {type};
                dao_instance = DAOProvider.getDAOByName("ExternalSource");
                externalSourceList = dao_instance.findAll(params);
            } catch (Exception e) {
                ServerErrorManager.handleException(e, ExternalSources_servlets.class.getName(), "get_all_external_sources_handler", e.getMessage());
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
                    String responseJSON = "";

                    if ("json_options".equals(request.getParameter("format"))) {
                        externalSourceList.add(0, new ExternalSource("Local directory"));
                        externalSourceList.add(0, new ExternalSource("None"));
                        
                        responseJSON = "{\"data_dir_type\": [";
                        ExternalSource aux;
                        for (int i = 0; i < externalSourceList.size(); i++) {
                            aux = ((ExternalSource) externalSourceList.get(i));
                            if(aux.isEnabled()){
                                responseJSON += aux.toOptionJSON() + ",";
                            }
                        }
                        responseJSON = responseJSON.replaceAll(",$", "");
                        responseJSON += "]}";
                        
                    } else {
                        responseJSON = "[";

                        for (int i = 0; i < externalSourceList.size(); i++) {
                            responseJSON += ((ExternalSource) externalSourceList.get(i)).toJSON() + ((i < externalSourceList.size() - 1) ? "," : "");
                        }
                        responseJSON += "]";
                    }

                    response.getWriter().print(responseJSON);
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
            ServerErrorManager.handleException(e, ExternalSources_servlets.class.getName(), "get_all_external_sources_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_external_source_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            ExternalSource externalSource = null;
            try {
                Map<String, Cookie> cookies = this.getCookies(request);
                String loggedUser = cookies.get("loggedUser").getValue();
                String sessionToken = cookies.get("sessionToken").getValue();
                String externalSourceID = request.getPathInfo().replaceAll("/", "");

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
                dao_instance = DAOProvider.getDAOByName("ExternalSource");
                externalSource = (ExternalSource) dao_instance.findByID(externalSourceID, null);
            } catch (Exception e) {
                ServerErrorManager.handleException(e, ExternalSources_servlets.class.getName(), "get_external_source_handler", e.getMessage());
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
                    if (externalSource != null) {
                        response.getWriter().print(externalSource.toJSON());
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
            ServerErrorManager.handleException(e, ExternalSources_servlets.class.getName(), "get_external_source_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * PUT REQUEST HANDLERS                                                                     *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void update_all_external_sources_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    private void update_external_source_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
                String externalSourceID = request.getPathInfo().replaceAll("/", "");

                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }
                if (!isValidAdminUser(loggedUser)) {
                    throw new AccessControlException("User not allowed for this action.");
                }
                /**
                 * *******************************************************
                 * STEP 2 Get the Object by parsing the JSON data. IF ERROR -->
                 * throws JsonParseException, GO TO STEP 5A ELSE --> GO TO STEP
                 * 3 *******************************************************
                 */
                ExternalSource externalSource = ExternalSource.fromJSON(requestData.get("external_source_json_data"));
                externalSource.setSourceID(externalSourceID);

                /**
                 * *******************************************************
                 * STEP 3 UPDATE the externalSource in DATABASE. IF ERROR --> throws
                 * SQL Exception, GO TO STEP 5A ELSE --> GO TO STEP 4
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("ExternalSource");
                daoInstance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                daoInstance.update(externalSource);

                /**
                 * *******************************************************
                 * STEP 4 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5A ELSE --> GO TO
                 * STEP 5B
                 * *******************************************************
                 */
                daoInstance.doCommit();
            } catch (Exception e) {
                ServerErrorManager.handleException(e, ExternalSources_servlets.class.getName(), "update_externalSource_handler", e.getMessage());
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
            ServerErrorManager.handleException(e, ExternalSources_servlets.class.getName(), "update_external_source_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * DELETE REQUEST HANDLERS                                                                  *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void delete_all_external_sources_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
    }

    private void delete_external_source_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
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

                String externalSourceID = request.getPathInfo().replaceAll("/", "");

                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }
                if (!isValidAdminUser(loggedUser)) {
                    throw new AccessControlException("User not allowed for this action.");
                }
                /**
                 * *******************************************************
                 * STEP 3 Remove the externalSource
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("ExternalSource");
                daoInstance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                daoInstance.remove(externalSourceID);

                /**
                 * *******************************************************
                 * STEP 5 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                daoInstance.doCommit();
            } catch (Exception e) {
                ServerErrorManager.handleException(e, ExternalSources_servlets.class.getName(), "delete_external_source_handler", e.getMessage());
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
            ServerErrorManager.handleException(e, ExternalSources_servlets.class.getName(), "delete_external_source_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }
}
