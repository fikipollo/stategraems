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
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import java.lang.reflect.Type;
import java.util.Arrays;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Analysis {

    private String analysis_id;
    private String analysis_name;
    private String analysis_type;
    private String status = "open";
    private String associated_experiment; //ONLY LOCAL INSTANCES, NOT IN DATABASE
    private NonProcessedData[] non_processed_data;
    private ProcessedData[] processed_data;
    String[] tags;

    public Analysis() {
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Analysis fromJSON(JsonElement jsonString) {
        GsonBuilder gsonBuilder = new GsonBuilder();
        gsonBuilder.registerTypeAdapter(NonProcessedData.class, getNonProcessedDataDeserializerInstance());
        gsonBuilder.registerTypeAdapter(ProcessedData.class, getProcessedDataDeserializerInstance());
        Gson gson = gsonBuilder.create();

        Analysis analysis = gson.fromJson(jsonString, Analysis.class);

        //FINALLY, WE HAVE TO ORDER THE NON PROCESSED DATA BY STEP NUMBER
        Arrays.sort(analysis.getNonProcessedData());

        return analysis;
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
    public String getAnalysisID() {
        return analysis_id;
    }

    public void setAnalysisID(String analysis_id) {
        this.analysis_id = analysis_id;
    }

    public void updateAnalysisID(String newAnalysisID) {
        Step step;
        for (int i = 0; i < this.getNonProcessedData().length; i++) {
            step = this.getNonProcessedData()[i];
            //Update all the step_id for all the steps created in this analysis
            //If some step belongs to another analysis previously created, no changed will be done
            //This function should be only called during new analysis/step creation
            //because the ANALYSIS AND STEP ID MUST NOT be editables.
            step.updateAnalysisID(newAnalysisID);
            //If the update process failed it's because the step is an imported step
        }
        for (int i = 0; i < this.getProcessedData().length; i++) {
            step = this.getProcessedData()[i];
            //Update all the step_id for all the steps created in this analysis
            //If some step belongs to another analysis previously created, no changed will be done
            //This function should be only called during new analysis/step creation
            //because the ANALYSIS AND STEP ID MUST NOT be editables.
            step.updateAnalysisID(newAnalysisID);
            //If the update process failed it's because the step is an imported step
        }

        this.analysis_id = newAnalysisID;
    }

    public String getAnalysisType() {
        return analysis_type;
    }

    public void setAnalysisType(String analysisType) {
        this.analysis_type = analysisType;
    }

    public String getAnalysisName() {
        return analysis_name;
    }

    public void setAnalysisName(String analysis_name) {
        this.analysis_name = analysis_name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public void setTags(String tags) {
        if (tags != null) {
            this.tags = tags.split(", ");
        }
    }

    public NonProcessedData[] getNonProcessedData() {
        //TODO: REPLACE ARRAYS BY ARRAYLIST
        if (this.non_processed_data == null) {
            this.non_processed_data = new NonProcessedData[]{};
        }
        return non_processed_data;
    }

    public void setNonProcessedData(NonProcessedData[] non_processed_data) {
        this.non_processed_data = non_processed_data;
    }

    public ProcessedData[] getProcessedData() {
        //TODO: REPLACE ARRAYS BY ARRAYLIST
        if (this.processed_data == null) {
            this.processed_data = new ProcessedData[]{};
        }
        return processed_data;
    }

    public void setProcessedData(ProcessedData[] processed_data) {
        if (processed_data == null) {
            return;
        }
        this.processed_data = processed_data;
    }

    public String getAssociatedExperiment() {
        return associated_experiment;
    }

    public void setAssociated_experiment(String associated_experiment) {
        this.associated_experiment = associated_experiment;
    }

    public boolean isOwner(String userName) {
        for (Step step : this.getNonProcessedData()) {
            if (step.isOwner(userName)) {
                return true;
            }
        }
        for (Step step : this.getProcessedData()) {
            if (step.isOwner(userName)) {
                return true;
            }
        }
        return false;
    }

    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************
    @Override
    public String toString() {
        return this.toJSON();
    }

    private static NonProcessedDataDeserializer getNonProcessedDataDeserializerInstance() {
        return new Analysis().new NonProcessedDataDeserializer();
    }

    private class NonProcessedDataDeserializer implements JsonDeserializer<NonProcessedData> {

        @Override
        public NonProcessedData deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            String jsonString = json.toString();
            return (jsonString.equals("[]")) ? null : NonProcessedData.fromJSON(jsonString);
        }
    }

    private static Processed_data_deserializer getProcessedDataDeserializerInstance() {
        return new Analysis().new Processed_data_deserializer();
    }

    private class Processed_data_deserializer implements JsonDeserializer<ProcessedData> {

        @Override
        public ProcessedData deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            String jsonString = json.toString();
            return (jsonString.equals("[]")) ? null : ProcessedData.fromJSON(jsonString);
        }
    }
}
