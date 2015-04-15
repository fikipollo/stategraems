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

import classes.analysis.non_processed_data.IntermediateData;
import classes.analysis.non_processed_data.RAWdata;

/**
 *
 * @author Rafa Hernández de Diego
 */
public abstract class NonProcessedData extends Step implements Comparable<NonProcessedData> {

    public NonProcessedData() {
    }

    public NonProcessedData(String step_id, String type) {
        this.step_id = step_id;
        this.type = type;
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static NonProcessedData fromJSON(String jsonString) {
        NonProcessedData non_process_data = null;
        if (jsonString.contains("\"type\":\"rawdata\"")) {
            non_process_data = RAWdata.fromJSON(jsonString);
        } else if (jsonString.contains("\"type\":\"intermediate_data\"")) {
            non_process_data = IntermediateData.fromJSON(jsonString);
        }

        return non_process_data;
    }

    @Override
    public int compareTo(NonProcessedData anotherInstance) {
        return this.step_number - anotherInstance.step_number;
    }
}
