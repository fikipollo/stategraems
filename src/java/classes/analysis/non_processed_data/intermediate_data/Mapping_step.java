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

package classes.analysis.non_processed_data.intermediate_data;

import classes.analysis.non_processed_data.IntermediateData;
import com.google.gson.Gson;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Mapping_step extends IntermediateData {
////  Herited from Non_process_data     
////    private String step_id;
////    private String type;
////  Herited from IntermediateData     
////    protected String intermediate_data_type;//ENUM('preprocessing_step','mapping_step','union_step','smoothing_step', 'max_quant','extract_relevant_features_step')
////    protected int step_number;
////    protected String submission_date;
////    protected String last_edition_date;
////    protected String software;
////    protected String software_version;
////    protected Software_configuration[] software_configuration;
////    protected String motivation;
////    protected String results;
////    protected String files_location;

    private String genome_specie;
    private String genome_version;
    private String genome_source;

    public Mapping_step() {
        super();
        this.intermediate_data_type = "mapping_step";
    }    
    
    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Mapping_step fromJSON(String jsonString) {
        Gson gson = new Gson();
        Mapping_step mapping_step = gson.fromJson(jsonString, Mapping_step.class);

        return mapping_step;
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
//
//
//    public String[] getMapped_data() {
//        return used_data;
//    }
//
//    public void setMapped_data(String[] used_data) {
//        this.used_data = used_data;
//    }
//
//    public void addMapped_data(String used_data_id) {
//        if (this.used_data == null) {
//            this.used_data = new String[1];
//            this.used_data[0] = used_data_id;
//        }else{
//            this.used_data= java.util.Arrays.copyOf(this.used_data, this.used_data.length+1);
//            this.used_data[this.used_data.length - 1] = used_data_id;
//        }
//    }
//
    public String getGenome_specie() {
        return genome_specie;
    }

    public void setGenomeSpecie(String genome_specie) {
        this.genome_specie = genome_specie;
    }

    public String getGenome_version() {
        return genome_version;
    }

    public void setGenomeVersion(String genome_version) {
        this.genome_version = genome_version;
    }

    public String getGenome_source() {
        return genome_source;
    }

    public void setGenomeSource(String genome_source) {
        this.genome_source = genome_source;
    }
//
//    
//    @Override
//    public void updatePreviousStepIDs(String old_analysis_id, String new_analysis_id) {
//        if (this.used_data != null) {
//            for (int i = 0; i < this.used_data.length; i++) {
//                this.used_data[i] = this.used_data[i].replaceAll(old_analysis_id.substring(2), new_analysis_id.substring(2));
//            }
//        }
//    }
    
}
