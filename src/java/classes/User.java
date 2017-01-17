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
package classes;

import com.google.gson.Gson;
import java.math.BigInteger;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class User {

    private String user_id;
    private String email;
    private String sessionToken;
    private String password;
    private String role;
    private String apicode;
    private String apicode_date;
    private String last_experiment_id;
    private String last_experiment_name;
    private boolean loggedIn;

    public User(String user_id, String email) {
        this.user_id = user_id;
        this.email = email;
    }

    /**
     * This static function returns a new Treatment object using the data
     * contained in the given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static User fromJSON(String jsonString) {
        Gson gson = new Gson();
        User user = gson.fromJson(jsonString, User.class);

        return user;
    }

    /**
     * This function returns the object as a JSON format string.
     *
     * @return the object as JSON String
     */
    public String toJSON() {
        Gson gson = new Gson();
        String jsonString = gson.toJson(this);

        return jsonString;
    }

    public String getUserID() {
        return user_id;
    }

    public String getUser_id() {
        return user_id;
    }

    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getLastExperimentID() {
        return last_experiment_id;
    }

    public String getLast_experiment_id() {
        return last_experiment_id;
    }

    public void setLast_experiment_id(String last_experiment_id) {
        this.last_experiment_id = last_experiment_id;
    }

    public void setLastExperimentID(String last_experiment_id) {
        this.last_experiment_id = last_experiment_id;
    }

    public String getLastExperimentName() {
        return last_experiment_name;
    }

    public void setLastExperimentName(String last_experiment_name) {
        this.last_experiment_name = last_experiment_name;
    }

    public boolean isLoggedIn() {
        return loggedIn;
    }

    public void setLoggedIn(boolean loggedIn) {
        this.loggedIn = loggedIn;
    }

    public String getApiCode() {
        return apicode;
    }

    public void setApiCode(String apicode) {
        this.apicode = apicode;
    }

    public String getApiCodeDate() {
        return apicode_date;
    }

    public void setApiCodeDate(String apicode_date) {
        this.apicode_date = apicode_date;
    }

    @Override
    public String toString() {
        return this.toJSON();
    }

    public String setRandomAPICode() {
        this.apicode = new BigInteger(130, new SecureRandom()).toString(30);
        this.apicode_date = new SimpleDateFormat("yyyyMMdd").format(new Date());
        return this.apicode;
    }
}
