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

import classes.analysis.processed_data.Calling_step;
import classes.analysis.processed_data.Data_matrix_step;
import classes.analysis.processed_data.Merging_step;
import classes.analysis.processed_data.Proteomics_msquantification_step;
import classes.analysis.processed_data.Quantification_step;
import classes.analysis.processed_data.Region_step;

/**
 *
 * @author Rafa Hernández de Diego
 */
public abstract class ProcessedData extends Step {

    protected String analysis_type;
    protected String processed_data_type;//ENUM('data_matrix','region_step','calling_step','quantification_step', 'merging_step', 'protID-Q_quantification')
    protected String software;
    protected String software_version;
    protected String software_configuration;
    protected String results;
    private String[] used_data;

    public ProcessedData() {
        this.type = "processed_data";
    }

    public ProcessedData(String step_id, String processed_data_type, String software, String software_version, String software_configuration, String results, String files_location, String submission_date, String last_edition_date) {
        this.step_id = step_id;
        this.type = "processed_data";
        this.processed_data_type = processed_data_type;
        this.software = software;
        this.software_version = software_version;
        this.software_configuration = software_configuration;
        this.results = results;
        this.files_location = files_location;
        this.submission_date = submission_date;
        this.last_edition_date = last_edition_date;
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static ProcessedData fromJSON(String jsonString) {
        ProcessedData processed_data = null;
        if (jsonString.contains("\"processed_data_type\":\"data_matrix\"")) {
            processed_data = Data_matrix_step.fromJSON(jsonString);
        } else if (jsonString.matches(".*(\"processed_data_type\":\"region_)(.*)(step\")(.*)")) {
            processed_data = Region_step.fromJSON(jsonString);
        } else if (jsonString.contains("\"processed_data_type\":\"calling_step\"")) {
            processed_data = Calling_step.fromJSON(jsonString);
        } else if (jsonString.contains("\"processed_data_type\":\"quantification_step\"")) {
            processed_data = Quantification_step.fromJSON(jsonString);
        } else if (jsonString.contains("\"processed_data_type\":\"merging_step\"")) {
            processed_data = Merging_step.fromJSON(jsonString);
        } else if (jsonString.contains("\"processed_data_type\":\"proteomics_msquantification_step\"")) {
            processed_data = Proteomics_msquantification_step.fromJSON(jsonString);
        }

        return processed_data;
    }

    //**********************************************************************
    //* GETTERS AND SETTERS ************************************************
    //**********************************************************************
    public String getAnalysis_type() {
        return analysis_type;
    }

    public void setAnalysisType(String analysis_type) {
        this.analysis_type = analysis_type;
    }

    public String getProcessedDataType() {
        return processed_data_type;
    }

    public void setProcessed_data_type(String processed_data_type) {
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

    public void setSoftware_version(String software_version) {
        this.software_version = software_version;
    }

    public String getSoftwareConfiguration() {
        return software_configuration;
    }

    public void setSoftware_configuration(String software_configuration) {
        this.software_configuration = software_configuration;
    }

    public String getResults() {
        return results;
    }

    public void setResults(String results) {
        this.results = results;
    }

    public void setFiles_location(String files_location) {
        this.files_location = files_location;
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
                this.used_data[i] = this.used_data[i].replaceAll(old_analysis_id.substring(2), new_analysis_id.substring(2));
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
