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

package classes.analysis.processed_data;

import classes.analysis.ProcessedData;
import com.google.gson.Gson;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Data_matrix_step extends ProcessedData {
////Herited from ProcessedData 
////    protected String analysis_id;
////    protected String type;//ENUM('data_matrix','region_step','calling_step','quantification_step')
////    protected String software;
////    protected String software_version;
////    protected Software_configuration[] software_configuration;
////    protected String results;
////    protected String files;

    private String[] unified_data;

    public Data_matrix_step() {
        processed_data_type = "data_matrix";
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Data_matrix_step fromJSON(String jsonString) {
        Gson gson = new Gson();
        Data_matrix_step data_matrix_step = gson.fromJson(jsonString, Data_matrix_step.class);

        return data_matrix_step;
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
    public String[] getUnified_data() {
        if (this.unified_data == null) {
            this.unified_data = new String[0];
        }
        return unified_data;
    }

    public void setUnified_data(String[] unified_data) {
        this.unified_data = unified_data;
    }

    public void addUnifiedData(String unified_data_id) {
        if (this.unified_data == null) {
            this.unified_data = new String[1];
            this.unified_data[0] = unified_data_id;
        } else {
            this.unified_data = java.util.Arrays.copyOf(this.unified_data, this.unified_data.length + 1);
            this.unified_data[this.unified_data.length - 1] = unified_data_id;
        }
    }

    @Override
    public void updatePreviousStepIDs(String old_analysis_id, String new_analysis_id) {
        if (this.unified_data != null) {
            for (int i = 0; i < this.unified_data.length; i++) {
                this.unified_data[i] = this.unified_data[i].replaceAll(old_analysis_id.substring(2), new_analysis_id.substring(2));
            }
        }
    }
}
