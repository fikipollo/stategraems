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
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Batch {

    private String batch_id;
    private String batch_name;
    private String batch_creation_date;
    private String description;
    private User[] owners;

    public Batch() {
    }

    /**
     * This static function returns a new Batch object using the
     * data contained in the given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Batch fromJSON(String jsonString) {
        Gson gson = new Gson();
        Batch batch = gson.fromJson(jsonString, Batch.class);

        return batch;
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

    //***********************************************************************
    //* GETTER AND SETTER ***************************************************
    //***********************************************************************
    public String getBatchID() {
        return batch_id;
    }

    public void setBatchID(String batch_id) {
        this.batch_id = batch_id;
    }

    public String getBatch_name() {
        return batch_name;
    }

    public void setBatchName(String batch_name) {
        this.batch_name = batch_name;
    }

    public String getBatch_creation_date() {
        return batch_creation_date;
    }

    public void setBatchCreationDate(String batch_creation_date) {
        this.batch_creation_date = batch_creation_date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
