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
public class QualityReport {

    private String studied_step_id;
    private String software;
    private String software_version;
    private String software_configuration;
    private String results;
    private String files_location;
    private String submission_date;

    public QualityReport(String studied_step_id, String software, String software_version, String software_configuration, String results, String files_location,String submission_date) {
        this.studied_step_id = studied_step_id;
        this.software = software;
        this.software_version = software_version;
        this.software_configuration = software_configuration;
        this.results = results;
        this.files_location = files_location;
        this.submission_date = submission_date;
    }
    
    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static QualityReport fromJSON(String jsonString) {
        Gson gson = new Gson();
        QualityReport quality_report = gson.fromJson(jsonString, QualityReport.class);

        return quality_report;
    }

    public String toJSON() {
        Gson gson = new Gson();
        String jsonString = gson.toJson(this);

        return jsonString;
    }

    
    //**********************************************************************
    //* GETTERS AND SETTERS ************************************************
    //**********************************************************************
    
    public String getStudied_step_id() {
        return studied_step_id;
    }

    public void setStudiedStepID(String studied_step_id) {
        this.studied_step_id = studied_step_id;
    }

    public String getSoftware() {
        return software;
    }

    public void setSoftware(String software) {
        this.software = software;
    }

    public String getSoftware_version() {
        return software_version;
    }

    public void setSoftware_version(String software_version) {
        this.software_version = software_version;
    }

    public String getResults() {
        return results;
    }

    public void setResults(String results) {
        this.results = results;
    }

    public String getFiles_location() {
        return files_location;
    }

    public void setFiles_location(String files_location) {
        this.files_location = files_location;
    }

    public String getSoftware_configuration() {
        return software_configuration;
    }

    public void setSoftware_configuration(String software_configuration) {
        this.software_configuration = software_configuration;
    }

    public String getSubmissionDate() {
        return submission_date;
    }

    public void setSubmissionDate(String submission_date) {
        this.submission_date = submission_date;
    }

    
    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************
    
    @Override
    public String toString() {
        return this.toJSON();
    }
    
}
