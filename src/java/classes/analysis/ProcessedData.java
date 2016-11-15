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
package classes.analysis;

import com.google.gson.Gson;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class ProcessedData extends Step {

    protected String processed_data_type;//ENUM('data_matrix','region_step','calling_step','quantification_step', 'merging_step', 'protID-Q_quantification')
    protected String software;
    protected String software_version;
    protected String software_configuration;
    protected String motivation;
    protected String results;
    private String[] used_data;
    private String[] reference_data;

    public ProcessedData() {
        this.type = "processed_data";
    }

    public ProcessedData(String step_id) {
        super(step_id, "intermediate_data");
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static ProcessedData fromJSON(String jsonString) {
        Gson gson = new Gson();
        ProcessedData step = gson.fromJson(jsonString, ProcessedData.class);
        step.adaptDates();

        return step;
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
    public String getProcessedDataType() {
        return processed_data_type;
    }

    public void setProcessedDataType(String processed_data_type) {
        this.processed_data_type = processed_data_type;
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

    public void setFiles_location(String[] files_location) {
        this.files_location = files_location;
    }

    public String[] getUsedData() {
        return used_data;
    }

    public void setUsedData(String[] used_data) {
        this.used_data = used_data;
    }

    public String[] getReferenceData() {
        return reference_data;
    }

    public void setReferenceData(String[] reference_data) {
        this.reference_data = reference_data;
    }

    @Override
    public void updatePreviousStepIDs(String old_analysis_id, String new_analysis_id) {
        if (this.used_data != null) {
            for (int i = 0; i < this.used_data.length; i++) {
                this.used_data[i] = this.used_data[i].replaceAll(old_analysis_id.substring(2), new_analysis_id.substring(2));
            }
        }
    }

    @Override
    public boolean updateAnalysisID(String new_analysis_id) {
        //IF THE ANALYSIS ID IS DIFFERENT THAT THE TO-BE-CREATED ID, IT MEANS THAT 
        //THE STEP IS AN IMPORTED STEP.
        String analysis_id = this.getAnalysisID();

        if (!"ANxxxx".equals(analysis_id)) {
            return false;
        }

        this.setStepID(this.step_id.replaceFirst(analysis_id.substring(2), new_analysis_id.substring(2)));
        this.updatePreviousStepIDs(analysis_id, new_analysis_id);
        if (this.associatedQualityReport != null) {
            this.associatedQualityReport.setStudiedStepID(this.step_id);
        }
        return true;
    }

    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************
    @Override
    public String toString() {
        return this.toJSON();
    }
}
