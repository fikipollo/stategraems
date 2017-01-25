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
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Message {

    private String user_id;
    private String message_id;
    private String type; //alert, info, 
    private String subject;
    private String content;
    private String date;
    private boolean read;

    public Message() {
        this.date = new SimpleDateFormat("yyyyMMdd").format(new Date());
        this.read = false;
    }

    public Message(String user_id, String message_id, String type, String subject, String content) {
        this.user_id = user_id;
        this.message_id = message_id;
        this.type = type;
        this.subject = subject;
        this.content = content;
        this.date = new SimpleDateFormat("yyyyMMdd").format(new Date());
        this.read = false;
    }

    /**
     * This static function returns a new user object using the data contained
     * in the given JSON object (as String).
     *
     * @param jsonElement the JSON object
     * @return the new Object.
     */
    public static Message fromJSON(JsonElement jsonElement) {
        Gson gson = new Gson();
        Message message = gson.fromJson(jsonElement, Message.class);

        return message;
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

    public void setUserID(String user_id) {
        this.user_id = user_id;
    }

    public String getMessageID() {
        return message_id;
    }

    public void setMessageID(String message_id) {
        this.message_id = message_id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    @Override
    public String toString() {
        return this.toJSON();
    }
}
