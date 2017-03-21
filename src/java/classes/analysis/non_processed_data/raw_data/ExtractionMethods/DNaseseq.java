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

package classes.analysis.non_processed_data.raw_data.ExtractionMethods;

import com.google.gson.Gson;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class DNaseseq extends Sequencing {
////  Herited from Sequencing     
////    protected String layout;
////    protected String orientation;
////    protected int nominal_length;
////    protected int nominal_length_stdev;
////    protected int avg_sequence_length;
////    protected int avg_sequencing_depth;
////    protected String platform_family;
////    protected String platform_model;
////    protected String base_calls;
////    protected String pooling_strategy;
////    protected String pooling_strategy_description;
////    protected String slide_ID;
////    protected String lane_number;
////    protected String library_construction_protocol;
////    protected String files_location;
    
    private boolean is_for_footprinting ;
    private String restriction_enzyme;

    public DNaseseq() {
        super();
        this.extraction_method_type = "DNase-seq";
    }

    public DNaseseq(String rawdata_id) {
        super(rawdata_id);
        this.extraction_method_type = "DNase-seq";
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static DNaseseq fromJSON(String jsonString) {
        Gson gson = new Gson();
        DNaseseq dnaseseq_rawdata = gson.fromJson(jsonString, DNaseseq.class);

        return dnaseseq_rawdata;
    }

    //**********************************************************************
    //* GETTERS AND SETTERS ************************************************
    //**********************************************************************
    public boolean isForFootprinting() {
        return is_for_footprinting;
    }

    public void setIsForFootprinting(boolean is_for_footprinting) {
        this.is_for_footprinting = is_for_footprinting;
    }

    public String getRestrictionEnzyme() {
        return restriction_enzyme;
    }

    public void setRestrictionEnzyme(String restriction_enzyme) {
        this.restriction_enzyme = restriction_enzyme;
    }
}
