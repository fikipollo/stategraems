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
package classes.analysis.non_processed_data;

import classes.analysis.NonProcessedData;
import com.google.gson.Gson;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class IntermediateData extends NonProcessedData {
//  Herited from Non_process_data     
//    private String step_id;
//    private String type;

    protected String intermediate_data_type;//ENUM('preprocessing_step','mapping_step','union_step','smoothing_step', 'max_quant','extract_relevant_features_step')
    protected String software;
    protected String software_version;
    protected String software_configuration;
    protected String motivation;
    protected String results;
    protected String[] used_data;

    public IntermediateData() {
        super();
        this.type = "intermediate_data";
    }

    public IntermediateData(String step_id) {
        super(step_id, "intermediate_data");
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static IntermediateData fromJSON(String jsonString) {
        Gson gson = new Gson();
        IntermediateData intermediate_data = gson.fromJson(jsonString, IntermediateData.class);

        return intermediate_data;
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
    public String getIntermediateDataType() {
        return intermediate_data_type;
    }

    public void setIntermediateDataType(String intermediate_data_type) {
        this.intermediate_data_type = intermediate_data_type;
    }

    public String getSoftware() {
        return software;
    }

    public void setSoftware(String software) {
        this.software = software;
    }

    public String getSoftwareVersion() {
        return software_version;
    }

    public void setSoftwareVersion(String software_version) {
        this.software_version = software_version;
    }

    public String getSoftwareConfiguration() {
        return software_configuration;
    }

    public void setSoftwareConfiguration(String software_configuration) {
        this.software_configuration = software_configuration;
    }

    public String getMotivation() {
        return motivation;
    }

    public void setMotivation(String motivation) {
        this.motivation = motivation;
    }

    public String getResults() {
        return results;
    }

    public void setResults(String results) {
        this.results = results;
    }

    public String[] getUsedData() {
        return used_data;
    }

    public void setUsedData(String[] used_data) {
        this.used_data = used_data;
    }

    @Override
    public void updatePreviousStepIDs(String old_analysis_id, String new_analysis_id) {
        if (this.used_data != null) {
            for (int i = 0; i < this.used_data.length; i++) {
                this.used_data[i] = this.used_data[i].replaceAll(old_analysis_id.substring(2), new_analysis_id.substring(2)).replace("AN","ST");
            }
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
