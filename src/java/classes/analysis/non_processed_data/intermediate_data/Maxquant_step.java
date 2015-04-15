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
public class Maxquant_step extends IntermediateData {
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

    private String path_mqpar_file;
    private String protein_group_table_id;

    public Maxquant_step() {
        super();
    }

    public Maxquant_step(String step_id) {
        super(step_id);
    }

//    public Maxquant_step(String step_id, int step_number, String submission_date, String last_edition_date, String software, String software_version,String software_configuration,  String motivation, String results, String files_location, String path_mqpar_file, String protein_group_table_id) {
//        super(step_id, "max_quant", step_number, submission_date, last_edition_date, software, software_version, software_configuration, motivation, results, files_location);
//        this.path_mqpar_file = path_mqpar_file;
//        this.protein_group_table_id = protein_group_table_id;
//    }
    
    
    
    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Maxquant_step fromJSON(String jsonString) {
        Gson gson = new Gson();
        Maxquant_step maxquant_step = gson.fromJson(jsonString, Maxquant_step.class);

        return maxquant_step;
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
//    public String[] getQuantified_data() {
//        return used_data;
//    }
//
//    public void setQuantified_data(String[] used_data) {
//        this.used_data = used_data;
//    }
//
//    
//    public void addQuantified_data(String used_data_id) {
//        if (this.used_data == null) {
//            this.used_data = new String[1];
//            this.used_data[0] = used_data_id;
//        }else{
//            this.used_data= java.util.Arrays.copyOf(this.used_data, this.used_data.length+1);
//            this.used_data[this.used_data.length - 1] = used_data_id;
//        }
//    }
//
//    public String getPath_mqpar_file() {
//        return path_mqpar_file;
//    }
//
//    public void setPath_mqpar_file(String path_mqpar_file) {
//        this.path_mqpar_file = path_mqpar_file;
//    }
//
//    public String getProtein_group_table_id() {
//        return protein_group_table_id;
//    }
//
//    public void setProtein_group_table_id(String protein_group_table_id) {
//        this.protein_group_table_id = protein_group_table_id;
//    }
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
