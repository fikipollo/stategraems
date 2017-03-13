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

package classes.analysis.non_processed_data.raw_data.SeparationMethods;

import com.google.gson.Gson;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class CapillaryElectrophoresis extends SeparationMethod{

    ////  Herited from SeparationMethod     
    //    protected String rawdata_id;
    String experiment_type;
    String experiment_aim;
    String ce_sample_description;
    String ce_sample_solution;
    String ce_sample_preparation;
    String capillary_description;
    String capillary_source;
    String capillary_dimensions;
    String ce_temperature;
    String auxiliary_data_channels;
    String duration;
    String run_description;

    public CapillaryElectrophoresis() {
        super();
        separation_method_type = "CapillaryElectrophoresis";
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static CapillaryElectrophoresis fromJSON(String jsonString) {
        Gson gson = new Gson();
        CapillaryElectrophoresis capillaryElectrophoresis = gson.fromJson(jsonString, CapillaryElectrophoresis.class);

        return capillaryElectrophoresis;
    }

    public String getExperimentType() {
        return experiment_type;
    }

    public void setExperimentType(String experiment_type) {
        this.experiment_type = experiment_type;
    }

    public String getExperimentAim() {
        return experiment_aim;
    }

    public void setExperimentAim(String experiment_aim) {
        this.experiment_aim = experiment_aim;
    }

    public String getSampleDescription() {
        return ce_sample_description;
    }

    public void setSampleDescription(String sample_description) {
        this.ce_sample_description = sample_description;
    }

    public String getSampleSolution() {
        return ce_sample_solution;
    }

    public void setSampleSolution(String sample_solution) {
        this.ce_sample_solution = sample_solution;
    }

    public String getSamplePreparation() {
        return ce_sample_preparation;
    }

    public void setSamplepreparation(String sample_preparation) {
        this.ce_sample_preparation = sample_preparation;
    }

    public String getCapillaryDescription() {
        return capillary_description;
    }

    public void setCapillaryDescription(String capillary_description) {
        this.capillary_description = capillary_description;
    }

    public String getCapillarySource() {
        return capillary_source;
    }

    public void setCapillarySource(String capillary_source) {
        this.capillary_source = capillary_source;
    }

    public String getCapillaryDimensions() {
        return capillary_dimensions;
    }

    public void setCapillaryDimensions(String capillary_dimensions) {
        this.capillary_dimensions = capillary_dimensions;
    }

    public String getCEtemperature() {
        return ce_temperature;
    }

    public void setCEtemperature(String ce_temperature) {
        this.ce_temperature = ce_temperature;
    }

    public String getAuxiliaryDataChannels() {
        return auxiliary_data_channels;
    }

    public void setAuxiliaryDataChannels(String auxiliary_data_channels) {
        this.auxiliary_data_channels = auxiliary_data_channels;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getRunDescription() {
        return run_description;
    }

    public void setRunDescription(String run_description) {
        this.run_description = run_description;
    }

}
