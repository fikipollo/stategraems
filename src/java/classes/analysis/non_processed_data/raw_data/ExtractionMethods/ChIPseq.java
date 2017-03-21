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
public class ChIPseq extends Sequencing {
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
    
    private boolean is_control_sample;
    private String antibody_target;
    private String antibody_target_type;
    private String antibody_manufacturer;

    public ChIPseq() {
        super();
        this.extraction_method_type = "ChIP-seq";
    }

    public ChIPseq(String rawdata_id) {
        super(rawdata_id);
        this.extraction_method_type = "ChIP-seq";
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static ChIPseq fromJSON(String jsonString) {
        Gson gson = new Gson();
        ChIPseq chIPseq_rawdata = gson.fromJson(jsonString, ChIPseq.class);

        return chIPseq_rawdata;
    }

    //**********************************************************************
    //* GETTERS AND SETTERS ************************************************
    //**********************************************************************
    public boolean is_control_sample() {
        return is_control_sample;
    }

    public void setIsControlSample(boolean is_control_sample) {
        this.is_control_sample = is_control_sample;
    }

    public String getAntibody_target() {
        return antibody_target;
    }

    public void setAntibodyTarget(String antibody_target) {
        this.antibody_target = antibody_target;
    }

    public String getAntibody_target_type() {
        return antibody_target_type;
    }

    public void setAntibodyTargetType(String antibody_target_type) {
        this.antibody_target_type = antibody_target_type;
    }

    public String getAntibody_manufacturer() {
        return antibody_manufacturer;
    }

    public void setAntibodyManufacturer(String antibody_manufacturer) {
        this.antibody_manufacturer = antibody_manufacturer;
    }
}
