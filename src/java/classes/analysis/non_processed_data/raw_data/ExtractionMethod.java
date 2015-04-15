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

package classes.analysis.non_processed_data.raw_data;

import classes.analysis.non_processed_data.raw_data.ExtractionMethods.*;
import com.google.gson.Gson;

public abstract class ExtractionMethod {

    protected String rawdata_id;
    protected String extraction_method_type;

    public static ExtractionMethod fromJSON(String jsonString) {
        ExtractionMethod raw_data = null;
        if (jsonString.contains("\"extraction_method_type\":\"mRNA-seq\"")) {
            raw_data = MRNAseq.fromJSON(jsonString);
        } else if (jsonString.contains("\"extraction_method_type\":\"smallRNA-seq\"")) {
            raw_data = SmallRNAseq.fromJSON(jsonString);
        } else if (jsonString.contains("\"extraction_method_type\":\"ChIP-seq\"")) {
            raw_data = ChIPseq.fromJSON(jsonString);
        } else if (jsonString.contains("\"extraction_method_type\":\"Methyl-seq\"")) {
            raw_data = Methylseq.fromJSON(jsonString);
        } else if (jsonString.contains("\"extraction_method_type\":\"DNase-seq\"")) {
            raw_data = DNaseseq.fromJSON(jsonString);
        } else if (jsonString.contains("\"extraction_method_type\":\"NuclearMagneticResonance\"")) {
            raw_data = NuclearMagneticResonance.fromJSON(jsonString);
        } else if (jsonString.contains("\"extraction_method_type\":\"MassSpectrometry\"")) {
            raw_data = MassSpectrometry.fromJSON(jsonString);
        }
        return raw_data;
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

    public String getExtraction_method_type() {
        return extraction_method_type;
    }

    public void setExtraction_method_type(String extraction_method_type) {
        this.extraction_method_type = extraction_method_type;
    }

    @Override
    public String toString() {
        return this.toJSON();
    }
}
