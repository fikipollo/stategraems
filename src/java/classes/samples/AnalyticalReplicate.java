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

import com.google.gson.Gson;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class AnalyticalReplicate {

    private String analytical_rep_id;
    private String analytical_rep_name;
    private String bioreplicate_id;
    private String treatment_id;

    /**
     *
     */
    public AnalyticalReplicate() {
    }

    /**
     *
     * @param analytical_rep_id
     * @param bioreplicate_id
     * @param biocondition_id
     * @param treatment_id
     */
    public AnalyticalReplicate(String analytical_rep_id, String analytical_rep_name, String bioreplicate_id, String treatment_id) {
        this.analytical_rep_id = analytical_rep_id;
        this.analytical_rep_name = analytical_rep_name;
        this.bioreplicate_id = bioreplicate_id;
        this.treatment_id = treatment_id;
    }

    /**
     * This static function returns a new AnalyticalReplicate object using the
     * data contained in the given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static AnalyticalReplicate fromJSON(String jsonString) {
        Gson gson = new Gson();
        AnalyticalReplicate analyticalReplicate = gson.fromJson(jsonString, AnalyticalReplicate.class);

        return analyticalReplicate;
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

    //**********************************************************************
    //* GETTERS AND SETTERS ************************************************
    //**********************************************************************
    public String getAnalytical_rep_id() {
        return analytical_rep_id;
    }

    public void setAnalyticalReplicateID(String bioreplicate_id, int nAnalyticalRep) {
        this.bioreplicate_id = bioreplicate_id;
        this.analytical_rep_id = "AR" + bioreplicate_id.substring(2) + "." + String.format("%03d", nAnalyticalRep);
    }

    public void setAnalyticalReplicateID(String analytical_rep_id) {
        this.analytical_rep_id = analytical_rep_id;
    }

    public String getAnalyticalReplicateName() {
        return analytical_rep_name;
    }

    public void setAnalyticalReplicateName(String analytical_rep_name) {
        this.analytical_rep_name = analytical_rep_name;
    }
    
    public String getBioreplicate_id() {
        return bioreplicate_id;
    }

    public void setBioreplicate_id(String bioreplicate_id) {
        this.bioreplicate_id = bioreplicate_id;
    }

    public String getTreatment_id() {
        return treatment_id;
    }

    public void setTreatment_id(String treatment_id) {
        this.treatment_id = treatment_id;
    }

    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************
    @Override
    public String toString() {
        return this.toJSON();
    }
}
