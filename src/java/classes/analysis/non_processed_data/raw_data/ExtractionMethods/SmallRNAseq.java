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
public class SmallRNAseq extends Sequencing {

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
    
    private String extracted_molecule;
    private String rna_type;
    private String strand_specificity;
    private String selection;

    public SmallRNAseq() {
        super();
    }

    public SmallRNAseq(String rawdata_id) {
        super(rawdata_id);
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static SmallRNAseq fromJSON(String jsonString) {
        Gson gson = new Gson();
        SmallRNAseq smallRNAseq_rawdata = gson.fromJson(jsonString, SmallRNAseq.class);

        return smallRNAseq_rawdata;
    }

    //**********************************************************************
    //* GETTERS AND SETTERS ************************************************
    //**********************************************************************
    public String getExtractedMolecule() {
        return extracted_molecule;
    }

    public void setExtracted_molecule(String extracted_molecule) {
        this.extracted_molecule = extracted_molecule;
    }

    public String getRNAtype() {
        return rna_type;
    }

    public void setRNAType(String rna_type) {
        this.rna_type = rna_type;
    }

    public String getStrandSpecificity() {
        return strand_specificity;
    }

    public void setStrandSpecificity(String strand_specificity) {
        this.strand_specificity = strand_specificity;
    }

    public String getSelection() {
        return selection;
    }

    public void setSelection(String selection) {
        this.selection = selection;
    }  
}


