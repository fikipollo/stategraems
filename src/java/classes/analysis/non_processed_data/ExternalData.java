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

import classes.User;
import classes.analysis.NonProcessedData;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class ExternalData extends NonProcessedData {
//  Herited from Non_process_data     
//    private String step_id;
//    private String type;

    public ExternalData() {
        super();
        this.type = "external_source";
    }

    public ExternalData(String step_id) {
        super(step_id, "external_source");
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static ExternalData fromJSON(String jsonString) {
        Gson gson = new Gson();
        ExternalData step = gson.fromJson(jsonString, ExternalData.class);

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
    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************
    @Override
    public String toString() {
        return this.toJSON();
    }

    @Override
    public void updatePreviousStepIDs(String old_analysis_id, String new_analysis_id) {
        //Do nothing
    }

    public static ExternalData parseStepGalaxyData(JsonObject step_json_object, JsonObject analysisData, String emsuser) {
        ExternalData step = new ExternalData("STxxxx." + step_json_object.get("id").getAsString());
        
        String prefix = analysisData.get("experiment_id").getAsString() + "/" + analysisData.get("analysis_id").getAsString() + "/";
        ArrayList<String> outputs = new ArrayList<String>();
        for(JsonElement output : step_json_object.get("outputs").getAsJsonArray()){
            outputs.add(prefix + output.getAsJsonObject().get("file").getAsString().replaceAll(" ", "_") + "." + output.getAsJsonObject().get("extension").getAsString());
        }
        step.setFilesLocation(outputs.toArray(new String[]{}));
        
        Date dateNow = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");
        step.setSubmissionDate(dateFormat.format(dateNow));
        step.setLastEditionDate(dateFormat.format(dateNow));
        step.addOwner(new User(emsuser, ""));
        step.setStepName(step_json_object.get("tool_id").getAsString());
        step.setStepNumber(step_json_object.get("id").getAsInt());

        return step;
    }

}
