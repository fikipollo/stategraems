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
public class ExternalData extends NonProcessedData {
//  Herited from Non_process_data     
//    private String step_id;
//    private String type;

    public ExternalData() {
        super();
        this.type = "external_data";
    }

    public ExternalData(String step_id) {
        super(step_id, "external_data");
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

    @Override
    public boolean updateAnalysisID(String new_analysis_id) {
        //IF THE ANALYSIS ID IS DIFFERENT THAT THE TO-BE-CREATED ID, IT MEANS THAT 
        //THE STEP IS AN IMPORTED STEP.
        String analysis_id = this.getAnalysisID();

        if (!"ANxxxx".equals(analysis_id)) {
            return false;
        }

        this.setStepID(this.step_id.replaceFirst(analysis_id.substring(2), new_analysis_id.substring(2)));
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

    @Override
    public void updatePreviousStepIDs(String old_analysis_id, String new_analysis_id) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
