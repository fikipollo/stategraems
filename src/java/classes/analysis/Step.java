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

import classes.ExtraField;
import classes.User;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.util.Map;

/**
 *
 * @author Rafa Hernández de Diego
 */
public abstract class Step implements Comparable<Step> {

    protected String step_id;
    protected int step_number;
    protected String step_name;
    protected String type;
    protected String submission_date;
    protected String last_edition_date;
    protected String[] files_location;
    protected String status = null;
    protected User[] step_owners;
    protected QualityReport associatedQualityReport;
    protected Map<String, String> other_fields;
    protected ExtraField[] extra;

    public Step() {
    }

    public Step(String step_id, String type) {
        this.step_id = step_id;
        this.type = type;
    }

    /**
     * This function returns the object as a JSON format string.
     *
     * @return the object as JSON String
     */
    public abstract String toJSON();

    //**********************************************************************
    //* GETTERS AND SETTERS ************************************************
    //**********************************************************************
    public String getAnalysisID() {
        return "AN" + this.getStepID().substring(2).split("\\.")[0];
    }

//    public void setAnalysis_id(String new_analysis_id) {
//        this.analysis_id = new_analysis_id;
//    }
    public boolean updateAnalysisID(String new_analysis_id) {
        //IF THE ANALYSIS ID IS DIFFERENT THAT THE TO-BE-CREATED ID, IT MEANS THAT 
        //THE STEP IS AN IMPORTED STEP.
        String analysis_id = this.getAnalysisID();
        if (!"ANxxxx".equals(analysis_id)) {
            return false;
        }

        this.setStepID(this.step_id.replaceFirst(analysis_id.substring(2), new_analysis_id.substring(2)).replace("AN", "ST"));
        this.updatePreviousStepIDs(analysis_id, new_analysis_id);
        if (this.associatedQualityReport != null) {
            this.associatedQualityReport.setStudiedStepID(this.step_id);
        }
        return true;
    }

    public String getStepID() {
        return step_id;
    }

    public void setStepID(String step_id) {
        this.step_id = step_id;
    }

    public int getStepNumber() {
        return step_number;
    }

    public void setStepNumber(int step_number) {
        this.step_number = step_number;
    }

    public String getStepName() {
        return step_name;
    }

    public void setStepName(String step_name) {
        this.step_name = step_name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSubmissionDate() {
        return submission_date;
    }

    public void setSubmissionDate(String submission_date) {
        this.submission_date = submission_date;
    }

    public String getLastEditionDate() {
        return last_edition_date;
    }

    public void setLastEditionDate(String last_edition_date) {
        this.last_edition_date = last_edition_date;
    }

    public void adaptDates() {
        if (this.submission_date.contains("-")) {
            String[] aux = this.submission_date.split("T");
            this.submission_date = aux[0].replaceAll("-", "");
        }
        if (this.last_edition_date.contains("-")) {
            String[] aux = this.last_edition_date.split("T");
            this.last_edition_date = aux[0].replaceAll("-", "");
        }
    }

    public String[] getFilesLocation() {
        return files_location;
    }

    public void setFilesLocation(String[] files_location) {
        this.files_location = files_location;
    }

    public abstract void updatePreviousStepIDs(String old_analysis_id, String new_analysis_id);

    public User[] getStepOwners() {
        return step_owners;
    }

    public void setStepOwners(User[] step_owners) {
        this.step_owners = step_owners;
    }

    public void addOwner(User owner) {
        if (this.step_owners == null) {
            this.step_owners = new User[1];
            this.step_owners[0] = owner;
        } else {
            this.step_owners = java.util.Arrays.copyOf(this.step_owners, this.step_owners.length + 1);
            this.step_owners[this.step_owners.length - 1] = owner;
        }
    }

    public boolean isOwner(String userName) {
        for (User user : this.getStepOwners()) {
            if (user.getUserID().equals(userName)) {
                return true;
            }
        }
        return false;
    }

    public QualityReport getAssociatedQualityReport() {
        return associatedQualityReport;
    }

    public void setAssociatedQualityReport(QualityReport quality_report) {
        this.associatedQualityReport = quality_report;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Map<String, String> getOtherFields() {
        return other_fields;
    }

    public void setOtherFields(Map<String, String> other_fields) {
        this.other_fields = other_fields;
    }

    public ExtraField[] getExtra() {
        return extra;
    }

    public void setExtra(ExtraField[] extra) {
        this.extra = extra;
    }

    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************
    @Override
    public String toString() {
        return this.toJSON();
    }

    @Override
    public int compareTo(Step anotherInstance) {
        return this.step_number - anotherInstance.step_number;
    }

    protected static String getParameterDescription(JsonElement parameter, int level) {
        if (parameter.isJsonPrimitive()) {
            return parameter.getAsString() + "\n";
        }

        if (parameter.isJsonArray()) {
            String description = "";
            String prefix = "";
            for (int i = 0; i < level; i++) {
                prefix += "  ";
            }

            for (JsonElement element : parameter.getAsJsonArray()) {
                description += prefix + Step.getParameterDescription(element, level + 1);
            }

            return description;
        }

        if (parameter.isJsonObject()) {
            String description = "";
            String prefix = "";
            for (int i = 0; i < level; i++) {
                prefix += "  ";
            }

            for (Map.Entry<String, JsonElement> member : parameter.getAsJsonObject().entrySet()) {
                description += prefix + "- " + member.getKey() + ": " + Step.getParameterDescription(member.getValue(), level + 1);
            }
            return description;
        }

        return "";
    }
}
