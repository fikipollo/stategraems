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

package classes.analysis.processed_data.region_step;

import classes.analysis.processed_data.Region_step;
import com.google.gson.Gson;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Region_calling_step extends Region_step {
////Herited from Processed_data 
////    protected String analysis_id;
////    protected String type;//ENUM('data_matrix','region_step','calling_step','quantification_step')
////    protected String software;
////    protected String software_version;
////    protected Software_configuration[] software_configuration;
////    protected String results;
////    protected String files;

    private RegionElement[] reference_region;

    public Region_calling_step() {
        super();
        this.processed_data_type = "region_calling_step";
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Region_calling_step fromJSON(String jsonString) {
        Gson gson = new Gson();
        Region_calling_step region_calling_step = gson.fromJson(jsonString, Region_calling_step.class);

        return region_calling_step;
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
    public RegionElement[] getReferenceRegion() {
        return reference_region;
    }

    public void setReferenceRegion(RegionElement[] reference_region) {
        this.reference_region = reference_region;
    }

}
