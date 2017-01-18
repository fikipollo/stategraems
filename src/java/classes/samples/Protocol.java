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
package classes.samples;

import classes.User;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Protocol {

    private String protocol_id;
    private String protocol_name;
    private String description = "";
    private String biomolecule = "";
    private boolean hasSOPFile = false;
    private User[] owners;

    /**
     *
     */
    public Protocol() {
    }

    /**
     * 
     * @param protocol_id
     * @param protocol_name
     * @param biomolecule
     * @param description 
     */
    public Protocol(String protocol_id, String protocol_name, String biomolecule, String description) {
        this.protocol_id = protocol_id;
        this.protocol_name = protocol_name;
        this.description = description;
        this.biomolecule = biomolecule;
    }

    /**
     * This static function returns a new Protocol object using the
     * data contained in the given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Protocol fromJSON(JsonElement jsonString) {
        Gson gson = new Gson();
        Protocol protocol = gson.fromJson(jsonString, Protocol.class);

        return protocol;
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

    public String getProtocolID() {
        return protocol_id;
    }

    public void setProtocolID(String protocol_id) {
        this.protocol_id = protocol_id;
    }

    public String getProtocolName() {
        return protocol_name;
    }

    public void setProtocolName(String protocol_name) {
        this.protocol_name = protocol_name;
    }

    public String getBiomolecule() {
        return biomolecule;
    }

    public void setBiomolecule(String biomolecule) {
        this.biomolecule = biomolecule;
    }
    
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isHasSOPFile() {
        return hasSOPFile;
    }

    public void setHasSOPFile(boolean hasSOPFile) {
        this.hasSOPFile = hasSOPFile;
    }

    public User[] getOwners() {
        return owners;
    }

    public void setOwners(User[] owners) {
        this.owners = owners;
    }

    public void setOwners(String[] owner_ids) {
        ArrayList<User> owners_aux = new ArrayList<User>();

        for(String owner_id : owner_ids){
            owners_aux.add(new User(owner_id, ""));
        }
        this.owners = owners_aux.toArray(new User[]{});
    }
    
    
    public boolean isOwner(String userName) {
        for (int i = 0; i < this.owners.length; i++) {
            if (this.owners[i].getUserID().equals(userName)) {
                return true;
            }
        }
        return false;
    }

    public void addOwner(User owner) {
        if (this.owners == null) {
            this.owners = new User[1];
            this.owners[0] = owner;
        } else {
            this.owners = java.util.Arrays.copyOf(this.owners, this.owners.length + 1);
            this.owners[this.owners.length - 1] = owner;
        }
    }

    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************

    @Override
    public String toString() {
        return this.toJSON();
    }
}
