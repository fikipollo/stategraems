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

import classes.analysis.non_processed_data.raw_data.ExtractionMethod;

/**
 *
 * @author Rafa Hernández de Diego
 */
public abstract class Sequencing extends ExtractionMethod {
    protected String layout;
    protected String orientation;
    protected int nominal_length;
    protected int nominal_length_stdev;
    protected int avg_sequence_length;
    protected double avg_sequencing_depth;
    protected String platform_family;
    protected String platform_model;
    protected String base_calls;
    protected String pooling_strategy;
    protected String pooling_strategy_description;
    protected String slide_id;
    protected String lane_number;
    protected String library_construction_protocol;

    public Sequencing() {
    }

    public Sequencing(String rawdata_id) {
        this.rawdata_id = rawdata_id;
    }

    public String getRAWdataID() {
        return rawdata_id;
    }

    public void setRAWdataID(String rawdata_id) {
        this.rawdata_id = rawdata_id;
    }
    
    public String getLayout() {
        return layout;
    }

    public void setLayout(String layout) {
        this.layout = layout;
    }

    public String getOrientation() {
        return orientation;
    }

    public void setOrientation(String orientation) {
        this.orientation = orientation;
    }

    public int getNominal_length() {
        return nominal_length;
    }

    public void setNominal_length(int nominal_length) {
        this.nominal_length = nominal_length;
    }

    public int getNominal_length_stdev() {
        return nominal_length_stdev;
    }

    public void setNominal_length_stdev(int nominal_length_stdev) {
        this.nominal_length_stdev = nominal_length_stdev;
    }

    public int getAvg_sequence_length() {
        return avg_sequence_length;
    }

    public void setAvg_sequence_length(int avg_sequence_length) {
        this.avg_sequence_length = avg_sequence_length;
    }

    public double getAvg_sequencing_depth() {
        return avg_sequencing_depth;
    }

    public void setAvg_sequencing_depth(double avg_sequencing_depth) {
        this.avg_sequencing_depth = avg_sequencing_depth;
    }

    public String getPlatform_family() {
        return platform_family;
    }

    public void setPlatformFamily(String platform_family) {
        this.platform_family = platform_family;
    }

    public String getPlatform_model() {
        return platform_model;
    }

    public void setPlatformModel(String platform_model) {
        this.platform_model = platform_model;
    }

    public String getBase_calls() {
        return base_calls;
    }

    public void setBaseCalls(String base_calls) {
        this.base_calls = base_calls;
    }

    public String getPooling_strategy() {
        return pooling_strategy;
    }

    public void setPoolingStrategy(String pooling_strategy) {
        this.pooling_strategy = pooling_strategy;
    }

    public String getPooling_strategy_description() {
        return pooling_strategy_description;
    }

    public void setPoolingStrategyDescription(String pooling_strategy_description) {
        this.pooling_strategy_description = pooling_strategy_description;
    }

    public String getSlide_id() {
        return slide_id;
    }

    public void setSlideID(String slide_id) {
        this.slide_id = slide_id;
    }

    public String getLane_number() {
        return lane_number;
    }

    public void setLane_number(String lane_number) {
        this.lane_number = lane_number;
    }

    public String getLibrary_construction_protocol() {
        return library_construction_protocol;
    }

    public void setLibrary_construction_protocol(String library_construction_protocol) {
        this.library_construction_protocol = library_construction_protocol;
    }
}
