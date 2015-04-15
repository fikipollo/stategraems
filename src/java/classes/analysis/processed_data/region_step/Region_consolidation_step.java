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

package classes.analysis.processed_data.region_step;

import classes.analysis.processed_data.*;
import com.google.gson.Gson;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Region_consolidation_step extends Region_step {
////Herited from Processed_data 
////    protected String analysis_id;
////    protected String type;//ENUM('data_matrix','region_step','calling_step','quantification_step')
////    protected String software;
////    protected String software_version;
////    protected Software_configuration[] software_configuration;
////    protected String results;
////    protected String files;

    private RegionElement[] consolidated_data;
    private String motivation;

    public Region_consolidation_step() {
        this.processed_data_type = "region_consolidation_step";
    }


    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Region_consolidation_step fromJSON(String jsonString) {
        Gson gson = new Gson();
        Region_consolidation_step region_consolidation_step = gson.fromJson(jsonString, Region_consolidation_step.class);

        return region_consolidation_step;
    }

    @Override
    public String toJSON() {
        Gson gson = new Gson();
        String jsonString = gson.toJson(this);

        return jsonString;
    }

    //**********************************************************************
    //* GETTERS AND SETTERS ************************************************
    //**********************************************************************
    public RegionElement[] getConsolidated_data() {
        if (this.consolidated_data == null) {
            this.consolidated_data = new RegionElement[0];
        }
        return consolidated_data;
    }

    public void setConsolidated_data(RegionElement[] called_data) {
        this.consolidated_data = called_data;
    }

    public void addConsolidated_data(RegionElement consolidated_element) {
        if (this.consolidated_data == null) {
            this.consolidated_data = new RegionElement[1];
            this.consolidated_data[0] = consolidated_element;
        } else {
            this.consolidated_data = java.util.Arrays.copyOf(this.consolidated_data, this.consolidated_data.length + 1);
            this.consolidated_data[this.consolidated_data.length - 1] = consolidated_element;
        }
    }

    @Override
    public void updatePreviousStepIDs(String old_analysis_id, String new_analysis_id) {
    }

    public String getMotivation() {
        return motivation;
    }

    public void setMotivation(String motivation) {
        this.motivation = motivation;
    }
}
