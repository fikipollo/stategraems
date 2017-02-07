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
import common.UserSessionManager;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author Rafa Hernández de Diego
 */
public abstract class Servlet extends HttpServlet {

    String DATA_LOCATION = "";
    //TODO: REMOVE THIS CODE
    boolean DEBUGGING_MODE = false;

    @Override
    public void init(ServletConfig config) throws ServletException {
        try {
            super.init(config);
            Properties properties = new Properties();
            properties.load(DBConnectionManager.class.getResourceAsStream("/conf/data_location.properties"));
            String data_location = properties.getProperty("data_location");
            this.DATA_LOCATION = data_location;
            if (DBConnectionManager.getDataLocation() == null) {
                DBConnectionManager.setDataLocation(DATA_LOCATION);
            }

            //TODO: REMOVE THIS CODE
            String debugging_mode = properties.getProperty("debugging_mode");
            if (debugging_mode != null) {
                try {
                    this.DEBUGGING_MODE = Boolean.parseBoolean(debugging_mode);
                } catch (Exception e) {
                }
                if (DEBUGGING_MODE) {
                    System.out.println(String.format("%tc", new Date()) + " STATEGRAEMS LOG > WARNING!! Debugging mode is ON");
                }
            }

        } catch (IOException ex) {
            throw new ServletException("Unable to read the DATA LOCATION settings files.");
        }
    }

    /**
     * Handles the HTTP options request OPTIONS is usually send before the POST
     * sending in some browsers such as Google Chrome
     *
     *
     * @param request servlet request
     * @param response servlet response
     *
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.addHeader("Access-Control-Allow-Headers", "Content-Type");
        response.addHeader("Access-Control-Allow-Credentials", "true");
        response.addHeader("Content-Type", "text/plain");
        response.getWriter().print("");
    }

    protected boolean checkAccessPermissions(String loggedUser, String sessionToken) {
        //TODO: REMOVE THIS CODE
        if (DEBUGGING_MODE) {
            System.out.println(String.format("%tc", new Date()) + " STATEGRAEMS LOG > WARNING!! User permissions were not check. Reason: Debugging mode is ON");
            return true;
        }

        if (loggedUser == null || "".equals(loggedUser) || sessionToken == null || "".equals(sessionToken)) {
            return false;
        }

        if (!UserSessionManager.getUserSessionManager().isValidUser(loggedUser, sessionToken)) {
            return false;
        }
        return true;
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * OTHER FUNCTIONS                                                                          *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    protected boolean matchService(String request, String service) {
        if (request == null) {
            return false;
        }
        // Create a Pattern object
        Pattern r = Pattern.compile(service);
        // Now create matcher object.
        Matcher m = r.matcher(request);
        return m.find();
        //m.group(0)
    }

    protected Map<String, Cookie> getCookies(HttpServletRequest request) {
        HashMap<String, Cookie> cookies = null;
        if (request.getCookies() != null) {
            cookies = new HashMap<String, Cookie>();
            for (Cookie cookie : request.getCookies()) {
                cookies.put(cookie.getName(), cookie);
            }
        }
        return cookies;
    }
}
