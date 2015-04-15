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
import classes.analysis.processed_data.region_step.Region_calling_step;
import classes.analysis.processed_data.region_step.Region_consolidation_step;
import classes.analysis.processed_data.region_step.Region_intersection_step;

/**
 *
 * @author Rafa Hernández de Diego
 */
public abstract class Region_step extends ProcessedData {
////Herited from ProcessedData 
////    protected String analysis_id;
////    protected String region_step_type;//ENUM('data_matrix','region_step','calling_step','quantification_step')
////    protected String software;
////    protected String software_version;
////    protected Software_configuration[] software_configuration;
////    protected String results;
////    protected String files;

    public Region_step() {
        super();
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Region_step fromJSON(String jsonString) {
        Region_step region_step = null;
        if (jsonString.contains("\"processed_data_type\":\"region_calling_step\"")) {
            region_step = Region_calling_step.fromJSON(jsonString);
        } else if (jsonString.contains("\"processed_data_type\":\"region_consolidation_step\"")) {
            region_step = Region_consolidation_step.fromJSON(jsonString);
        } else if (jsonString.contains("\"processed_data_type\":\"region_intersection_step\"")) {
            region_step = Region_intersection_step.fromJSON(jsonString);
        }

        return region_step;
    }
    //**********************************************************************
    //* GETTERS AND SETTERS ************************************************
    //**********************************************************************
    
    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************
}
