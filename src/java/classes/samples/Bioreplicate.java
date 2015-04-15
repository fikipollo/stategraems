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
public class Bioreplicate {

    private String biocondition_id;
    private String bioreplicate_id;
    private String bioreplicate_name;
    private AnalyticalReplicate[] associatedAnalyticalReplicates;
    private Batch associatedBatch;

    public Bioreplicate() {
    }

    public Bioreplicate(String biocondition_id, String bioreplicate_id, String bioreplicate_name) {
        this.biocondition_id = biocondition_id;
        this.bioreplicate_id = bioreplicate_id;
        this.bioreplicate_name = bioreplicate_name;
    }

    /**
     * This static function returns a new Bioreplicate object using the data
     * contained in the given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Bioreplicate fromJSON(String jsonString) {
        Gson gson = new Gson();
        Bioreplicate bioreplicate = gson.fromJson(jsonString, Bioreplicate.class);

        return bioreplicate;
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
    public String getBioConditionID() {
        return biocondition_id;
    }

    public void setBioConditionID(String biocondition_id) {
        this.biocondition_id = biocondition_id;
    }

    public String getBioreplicateID() {
        return bioreplicate_id;
    }

    public void setBioreplicateID(String biocondition_id, int nBioReplicate) {
        this.biocondition_id = biocondition_id;
        this.bioreplicate_id = "BR" + biocondition_id.substring(2) + "." + String.format("%03d", nBioReplicate);

        if (this.associatedAnalyticalReplicates != null) {
            int nAnalyticalRep = 1;
            for (AnalyticalReplicate analyticalReplicate : this.associatedAnalyticalReplicates) {
                analyticalReplicate.setAnalyticalReplicateID(this.bioreplicate_id, nAnalyticalRep);
                nAnalyticalRep++;
            }
        }
    }

    public void setBioreplicate_id(String bioreplicate_id) {
        this.bioreplicate_id = bioreplicate_id;

        if (this.associatedAnalyticalReplicates != null) {
            int nAnalyticalRep = 1;
            for (AnalyticalReplicate analyticalReplicate : this.associatedAnalyticalReplicates) {
                analyticalReplicate.setAnalyticalReplicateID(this.bioreplicate_id, nAnalyticalRep);
                nAnalyticalRep++;
            }
        }
    }

    public String getBioreplicate_name() {
        return bioreplicate_name;
    }

    public void setBioreplicate_name(String bioreplicate_name) {
        this.bioreplicate_id = bioreplicate_name;
    }

    public AnalyticalReplicate[] getAssociatedAnalyticalReplicates() {
        return associatedAnalyticalReplicates;
    }

    public void setAssociatedAnalyticalReplicates(AnalyticalReplicate[] analyticalReplicates) {
        this.associatedAnalyticalReplicates = analyticalReplicates;
    }

    public void addAssociatedAnalyticalReplicate(AnalyticalReplicate analyticalReplicate) {
        if (this.associatedAnalyticalReplicates == null) {
            this.associatedAnalyticalReplicates = new AnalyticalReplicate[1];
            this.associatedAnalyticalReplicates[0] = analyticalReplicate;
        } else {
            this.associatedAnalyticalReplicates = java.util.Arrays.copyOf(this.associatedAnalyticalReplicates, this.associatedAnalyticalReplicates.length + 1);
            this.associatedAnalyticalReplicates[this.associatedAnalyticalReplicates.length - 1] = analyticalReplicate;
        }
    }

    public Batch getAssociatedBatch() {
        return this.associatedBatch;
    }

    public String getAssociatedBatchID() {
        return (this.associatedBatch == null) ? null : this.associatedBatch.getBatchID();
    }

    public void setAssociatedBatch(Batch associatedBatch) {
        this.associatedBatch = associatedBatch;
    }

    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************
    @Override
    public String toString() {
        return super.toString(); //To change body of generated methods, choose Tools | Templates.
    }
}
