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
import classes.analysis.non_processed_data.raw_data.ExtractionMethod;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import java.lang.reflect.Type;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class RAWdata extends NonProcessedData {

//  Herited from Non_process_data     
//    private String step_id;
//    private String type;
    protected String analyticalReplicate_id;
//    protected String technical_rep_set_id;
    protected String raw_data_type;//ENUM('mRNA-seq', 'smallRNA-seq', 'ChIP-seq', 'Methyl-seq', 'DNase-seq', 'Proteomics','Metabolomics')
    protected ExtractionMethod extractionMethod;

    public RAWdata() {
        super();
        this.type = "rawdata";
        this.step_number = 0;
    }

    public RAWdata(String rawdata_id) {
        super(rawdata_id, "rawdata");
        this.step_number = 0;
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static RAWdata fromJSON(String jsonString) {
        GsonBuilder gsonBuilder = new GsonBuilder();
        gsonBuilder.registerTypeAdapter(ExtractionMethod.class, getExtractionMethodDeserializerInstance());
        Gson gson = gsonBuilder.create();
        RAWdata rawdata = gson.fromJson(jsonString, RAWdata.class);

        return rawdata;
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
    public String getRAWdataID() {
        return super.getStepID();
    }

    public void setRAWdata_id(String rawdata_id) {
        super.setStepID(rawdata_id);
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

        if (this.extractionMethod != null) {
            this.extractionMethod.setRawdataID(this.step_id);
        }
        return true;
    }

    public String getAnalyticalReplicate_id() {
        return analyticalReplicate_id;
    }

    public void setAnalyticalSampleID(String analyticalReplicate_id) {
        this.analyticalReplicate_id = analyticalReplicate_id;
    }

//    public String get_technical_rep_set_id() {
//        return technical_rep_set_id;
//    }
//    public void setTechnical_rep_set_id(String technical_rep_set_id) {
//        this.technical_rep_set_id = technical_rep_set_id;
//    }
    public String getRAWdataType() {
        return raw_data_type;
    }

    public void setRawDataType(String raw_data_type) {
        this.raw_data_type = raw_data_type;
    }

    public ExtractionMethod getExtractionMethod() {
        return extractionMethod;
    }

    public void setExtractionMethod(ExtractionMethod extractionMethod) {
        this.extractionMethod = extractionMethod;
    }

    @Override
    public void updatePreviousStepIDs(String old_analysis_id, String new_analysis_id) {
    }

    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************
    @Override
    public String toString() {
        return this.toJSON();
    }

    private static ExtractionMethodDeserializer getExtractionMethodDeserializerInstance() {
        return new ExtractionMethodDeserializer();
    }

    private static class ExtractionMethodDeserializer implements JsonDeserializer<ExtractionMethod> {

        @Override
        public ExtractionMethod deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            String jsonString = json.toString();
            return ExtractionMethod.fromJSON(jsonString);
        }
    }
}
