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
import classes.analysis.processed_data.region_step.RegionElement;
import com.google.gson.Gson;


public class Quantification_step extends ProcessedData {
////Herited from ProcessedData 
////    protected String analysis_id;
////    protected String type;//ENUM('data_matrix','region_step','calling_step','quantification_step', 'merging_step', 'protID-Q_quantification')
////    protected String software;
////    protected String software_version;
////    protected Software_configuration[] software_configuration;
////    protected String results;
////    protected String files;

    private RegionElement[] reference_region;

    public Quantification_step() {
        this.processed_data_type = "quantification_step";
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Quantification_step fromJSON(String jsonString) {
        Gson gson = new Gson();
        Quantification_step quantification_step = gson.fromJson(jsonString, Quantification_step.class);

        return quantification_step;
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
    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************
    @Override
    public String toString() {
        return this.toJSON();
    }
}
