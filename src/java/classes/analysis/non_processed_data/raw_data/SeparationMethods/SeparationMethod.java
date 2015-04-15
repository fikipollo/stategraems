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

package classes.analysis.non_processed_data.raw_data.SeparationMethods;

import com.google.gson.Gson;

/**
 *
 * @author Rafa Hernández de Diego
 */
public abstract class SeparationMethod {

    protected String rawdata_id;

    public static SeparationMethod fromJSON(String jsonString) {
        SeparationMethod separationMethod = null;
        if (jsonString.contains("\"separation_method_type\":\"ColumnChromatography\"")) {
            separationMethod = ColumnChromatography.fromJSON(jsonString);
        } else if (jsonString.contains("\"separation_method_type\":\"CapillaryElectrophoresis\"")) {
            separationMethod = CapillaryElectrophoresis.fromJSON(jsonString);
        }
        return separationMethod;
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

    public String getRAWdataID() {
        return rawdata_id;
    }

    public void setRawdataID(String rawdata_id) {
        this.rawdata_id = rawdata_id;
    }
}
