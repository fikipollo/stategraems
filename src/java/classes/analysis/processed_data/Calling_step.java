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
public class Calling_step extends ProcessedData {
////Herited from ProcessedData 
////    protected String analysis_id;
////    protected String type;//ENUM('data_matrix','region_step','calling_step','quantification_step')
////    protected String software;
////    protected String software_version;
////    protected Software_configuration[] software_configuration;
////    protected String results;
////    protected String files;
    
    public Calling_step() {
        super();
        this.processed_data_type = "calling_step";
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Calling_step fromJSON(String jsonString) {
        Gson gson = new Gson();
        Calling_step calling_step = gson.fromJson(jsonString, Calling_step.class);

        return calling_step;
    }

    @Override
    public String toJSON() {
        Gson gson = new Gson();
        String jsonString = gson.toJson(this);

        return jsonString;
    }
}
