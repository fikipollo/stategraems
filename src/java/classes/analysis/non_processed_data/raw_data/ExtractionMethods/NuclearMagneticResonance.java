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
import classes.analysis.non_processed_data.raw_data.SeparationMethods.SeparationMethod;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import java.lang.reflect.Type;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class NuclearMagneticResonance extends ExtractionMethod {

    String separation_method_type;
    String instrument_manufacturer;
    String instrument_model;
    String strength;
    String console_description;
    String vt_control;
    String pulsed_field_strength;
    String max_gradient_strength;
    int n_shims;
    int n_channels;
    String probe_type;
    String sample_state;
    String operation_mode;
    String tune_mode;
    String probe_gas;
    String volume;
    String final_sample_status;
    String nmr_tube_type;
    String pH;
    String solvent;
    String buffer;
    String resonant_frequency;
    String acquisition_description;
    SeparationMethod separationMethod;

    public NuclearMagneticResonance() {
        super();
        this.extraction_method_type = "NuclearMagneticResonance";
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static NuclearMagneticResonance fromJSON(String jsonString) {
        GsonBuilder gsonBuilder = new GsonBuilder();
        gsonBuilder.registerTypeAdapter(SeparationMethod.class, getSeparationMethodDeserializerInstance());
        Gson gson = gsonBuilder.create();
        NuclearMagneticResonance nuclearMagneticResonance = gson.fromJson(jsonString, NuclearMagneticResonance.class);

        return nuclearMagneticResonance;
    }

    @Override
    public void setRawdataID(String rawdata_id) {
        this.rawdata_id = rawdata_id;
        if (this.separationMethod != null) {
            this.separationMethod.setRawdataID(this.rawdata_id);
        }
    }

    public String getSeparationMethodType() {
        return separation_method_type;
    }

    public void setSeparationMethodType(String separation_method_type) {
        this.separation_method_type = separation_method_type;
    }

    public String getInstrumentManufacturer() {
        return instrument_manufacturer;
    }

    public void setInstrumentManufacturer(String instrument_manufacturer) {
        this.instrument_manufacturer = instrument_manufacturer;
    }

    public String getInstrumentModel() {
        return instrument_model;
    }

    public void setInstrumentModel(String instrument_model) {
        this.instrument_model = instrument_model;
    }

    public String getStrength() {
        return strength;
    }

    public void setStrength(String strength) {
        this.strength = strength;
    }

    public String getConsoleDescription() {
        return console_description;
    }

    public void setConsoleDescription(String console_description) {
        this.console_description = console_description;
    }

    public String getVtControl() {
        return vt_control;
    }

    public void setVtControl(String vt_control) {
        this.vt_control = vt_control;
    }

    public String getPulsedFieldStrength() {
        return pulsed_field_strength;
    }

    public void setPulsedFieldStrength(String pulsed_field_strength) {
        this.pulsed_field_strength = pulsed_field_strength;
    }

    public String getMaxGradientStrength() {
        return max_gradient_strength;
    }

    public void setMaxGradientStrength(String max_gradient_strength) {
        this.max_gradient_strength = max_gradient_strength;
    }

    public int getNshims() {
        return n_shims;
    }

    public void setNshims(int n_shims) {
        this.n_shims = n_shims;
    }

    public int getNchannels() {
        return n_channels;
    }

    public void setNchannels(int n_channels) {
        this.n_channels = n_channels;
    }

    public String getProbeType() {
        return probe_type;
    }

    public void setProbeType(String probe_type) {
        this.probe_type = probe_type;
    }

    public String getSampleState() {
        return sample_state;
    }

    public void setSampleState(String sample_state) {
        this.sample_state = sample_state;
    }

    public String getOperationMode() {
        return operation_mode;
    }

    public void setOperationMode(String operation_mode) {
        this.operation_mode = operation_mode;
    }

    public String getTuneMode() {
        return tune_mode;
    }

    public void setTuneMode(String tune_mode) {
        this.tune_mode = tune_mode;
    }

    public String getProbeGas() {
        return probe_gas;
    }

    public void setProbeGas(String probe_gas) {
        this.probe_gas = probe_gas;
    }

    public String getVolume() {
        return volume;
    }

    public void setVolume(String volume) {
        this.volume = volume;
    }

    public String getFinalSampleStatus() {
        return final_sample_status;
    }

    public void setFinalSampleStatus(String final_sample_status) {
        this.final_sample_status = final_sample_status;
    }

    public String getNMRtubeType() {
        return nmr_tube_type;
    }

    public void setNMRtubeType(String nmr_tube_type) {
        this.nmr_tube_type = nmr_tube_type;
    }

    public String getpH() {
        return pH;
    }

    public void setpH(String pH) {
        this.pH = pH;
    }

    public String getSolvent() {
        return solvent;
    }

    public void setSolvent(String solvent) {
        this.solvent = solvent;
    }

    public String getBuffer() {
        return buffer;
    }

    public void setBuffer(String buffer) {
        this.buffer = buffer;
    }

    public String getResonantFrequency() {
        return resonant_frequency;
    }

    public void setResonantFrequency(String resonant_frequency) {
        this.resonant_frequency = resonant_frequency;
    }

    public String getAcquisitionDescription() {
        return acquisition_description;
    }

    public void setAcquisitionDescription(String acquisition_description) {
        this.acquisition_description = acquisition_description;
    }

    public SeparationMethod getSeparationMethod() {
        return separationMethod;
    }

    public void setSeparationMethod(SeparationMethod separationMethod) {
        this.separationMethod = separationMethod;
    }

    private static SeparationMethodDeserializer getSeparationMethodDeserializerInstance() {
        return new SeparationMethodDeserializer();
    }

    private static class SeparationMethodDeserializer implements JsonDeserializer<SeparationMethod> {

        @Override
        public SeparationMethod deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            String jsonString = json.toString();
            return SeparationMethod.fromJSON(jsonString);
        }
    }
}
