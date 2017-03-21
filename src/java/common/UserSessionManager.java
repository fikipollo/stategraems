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
package common;

import bdManager.DAO.DAO;
import bdManager.DAO.DAOProvider;
import bdManager.DAO.User_JDBCDAO;
import classes.User;
import java.util.HashMap;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class UserSessionManager {

    private static UserSessionManager INSTANCE = null;
    //USER_ID, assigned TOKEN
    private HashMap<String, String> logged_users;

    // Private constructor suppresses 
    private UserSessionManager() {
        logged_users = new HashMap<String, String>();
    }

    // creador sincronizado para protegerse de posibles problemas  multi-hilo
    // otra prueba para evitar instanciación múltiple 
    private synchronized static void initializesUserSessionManager() {
        if (INSTANCE == null) {
            // Sólo se accede a la zona sincronizada
            // cuando la instancia no está creada
            synchronized (UserSessionManager.class) {
                // En la zona sincronizada sería necesario volver
                // a comprobar que no se ha creado la instancia
                if (INSTANCE == null) {
                    INSTANCE = new UserSessionManager();
                }
            }
        }
    }

    public static UserSessionManager getUserSessionManager() {
        if (INSTANCE == null) {
            initializesUserSessionManager();
        }
        return INSTANCE;
    }

    public String registerNewUser(String email) {

        //IF USER IS ALREADY LOGGED (MAYBE BECAUSE LAST TIME HE USED THE APP HE DIDN'T LOG OUT) UPDATE SESSION TOKEN
        //TODO: MAYBE WARNING THE USER?
//        if(INSTANCE.logged_users.containsKey(user_id)){
//           INSTANCE.logged_users.put(user_id, sessionToken);
//        }
        String sessionToken = Long.toHexString(Double.doubleToLongBits(Math.random()));
        INSTANCE.logged_users.put(email, sessionToken);
        return sessionToken;
    }

    public boolean removeUser(String email, String sessionToken) {
//        if (INSTANCE == null) {
//        IMPOSSIBLE CASE
//            ServerErrorManager.addErrorMessage(3, UserSessionManager.class.getName(), "removeUser", "Your session is not initialized");
//            //TODO: ERROR BECAUSE NO SESSION MANAGER WAS INITIALIZATED?
//            return false;
//        }

        String assignedSessionToken = INSTANCE.logged_users.get(email);

        if (assignedSessionToken != null && assignedSessionToken.equals(sessionToken)) {
            INSTANCE.logged_users.remove(email);
            return true;
        }

        ServerErrorManager.addErrorMessage(3, UserSessionManager.class.getName(), "removeUser", "Session closed previously or not initialized");
        return false;

    }

    public boolean isValidUser(String user, String sessionToken) {
        if (user == null | sessionToken == null) {
            return false;
        }

        return sessionToken.equals(getUserSessionManager().logged_users.get(user));
    }

    public boolean isValidAdminUser(String username) {

        try {
            DAO dao_instance = DAOProvider.getDAOByName("User");
            Object[] params = {null, false, true};
            User user = (User) ((User_JDBCDAO) dao_instance).findByID(username, params);
            return "admin".equals(user.getRole()) || "admin".equals(user.getUserID());
        } catch (Exception e) {
            return false;
        }
    }

    public int getLoggedUsersCount() {
        return getUserSessionManager().logged_users.size();
    }

    public boolean isLoggedUser(String user) {
        if (user == null) {
            return false;
        }

        return getUserSessionManager().logged_users.get(user) != null;
    }
}
