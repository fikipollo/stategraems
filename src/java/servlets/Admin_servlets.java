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

import bdManager.DBConnectionManager;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import common.ServerErrorManager;
import java.io.File;
import java.security.AccessControlException;
import java.text.SimpleDateFormat;
import java.util.Date;

import java.util.Map;
import javax.servlet.http.Cookie;
import org.apache.commons.io.FileUtils;

/**
 *
 * SERVLET FOR MESSAGES:
 * +----------------------+-----------------------+---------------+---------------+---------------------+
 * | Resource             | POST                  | GET           |  PUT          | DELETE              |
 * +----------------------+-----------------------+---------------+---------------+---------------------+
 * | /rest/admin          | Do nothing            | Do nothing    | Do nothing    |  Do nothing         |
 * +----------------------+-----------------------+---------------+---------------+---------------------+
 * | /rest/admin/backup   | Backup databases      | Do nothing    | Do nothing    |  Do nothing         |
 * +----------------------+-----------------------+---------------+---------------+---------------------+
 *
 */
public class Admin_servlets extends Servlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/backup")) {
            backup_datadatabases(request, response);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * POST REQUEST HANDLERS                                                                    *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void backup_datadatabases(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String filename = "STATegraDB_content_backup_" + new SimpleDateFormat("yyyyMMdd_HHmm").format(new Date()) + ".sql";
        String backup_file_location = DATA_LOCATION + "/" + filename;

        try {
            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP 4b ELSE -->
             * GO TO STEP 2
             * *******************************************************
             */
            Map<String, Cookie> cookies = this.getCookies(request);
            String loggedUser = cookies.get("loggedUser").getValue();
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
            if (!isValidAdminUser(loggedUser)) {
                throw new AccessControlException("User not allowed for this action.");
            }

            /**
             * *******************************************************
             * STEP 2 EXECUTE THE DUMP SCRIPT. IF ERROR --> throws exception if
             * failed dump, GO TO STEP 3b ELSE --> GO TO STEP 3
             * *******************************************************
             */
            DBConnectionManager.getConnectionManager().doDatabaseDump(backup_file_location);

        } catch (Exception e) {
            ServerErrorManager.handleException(e, Admin_servlets.class.getName(), "backup_datadatabases", e.getMessage());
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
                response.setContentType("application/octet-stream");
                response.setHeader("Content-Disposition", "filename=\"" + filename + "\"");
                File srcFile = new File(backup_file_location);
                FileUtils.copyFile(srcFile, response.getOutputStream());

//                /**
//                 * *******************************************************
//                 * STEP 3A WRITE RESPONSE ERROR.
//                 * *******************************************************
//                 */
//                JsonObject obj = new JsonObject();
//                obj.add("success", new JsonPrimitive(true));
//                response.getWriter().print(obj.toString());
            }
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * GET REQUEST HANDLERS                                                                     *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
 /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * PUT REQUEST HANDLERS                                                                     *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
 /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * DELETE REQUEST HANDLERS                                                                  *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
 /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * AUXILIAR FUNCTIONS                                                                       *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
}
