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
public class MassSpectrometry extends ExtractionMethod {

    String separation_method_type;
    String mass_spectrometer_manufacturer;
    String customizations;
    String ionization_source;
    String supply_type;
    String interface_manufacturer_and_model;
    String sprayer_type_manufacturer_and_model;
    String other_electrospray_ionisation;
    String plate_composition;
    String matrix_composition;
    String psd_summary;
    String laser_type_and_wavelength;
    String other_maldi;
    String other_ionization_description;
    String mass_analyzer_type;
    String reflectron_status;
    String activation_location;
    String gas_type;
    String activation_type;
    String acquisition_software;
    String acquisition_parameters;
    String analysis_software;
    String analysis_parameters;
    String intensity_values;
    String ms_level;
    String ion_mode;
    String additional_info;
    SeparationMethod separationMethod;

    public MassSpectrometry() {
        super();
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static MassSpectrometry fromJSON(String jsonString) {
        GsonBuilder gsonBuilder = new GsonBuilder();
        gsonBuilder.registerTypeAdapter(SeparationMethod.class, getSeparationMethodDeserializerInstance());
        Gson gson = gsonBuilder.create();
        MassSpectrometry massSpectrometry = gson.fromJson(jsonString, MassSpectrometry.class);

        return massSpectrometry;
    }

    @Override
    public void setRawdataID(String rawdata_id) {
        this.rawdata_id = rawdata_id;
        if (this.separationMethod != null) {
            this.separationMethod.setRawdataID(this.rawdata_id);
        }
    }

    public String getMassSpectrometerManufacturer() {
        return mass_spectrometer_manufacturer;
    }

    public void setMassSpectrometerManufacturer(String mass_spectrometer_manufacturer) {
        this.mass_spectrometer_manufacturer = mass_spectrometer_manufacturer;
    }

    public String getCustomizations() {
        return customizations;
    }

    public void setCustomizations(String customizations) {
        this.customizations = customizations;
    }

    public String getIonizationSource() {
        return ionization_source;
    }

    public void setIonizationSource(String ionization_source) {
        this.ionization_source = ionization_source;
    }

    public String getSupplyType() {
        return supply_type;
    }

    public void setSupplyType(String supply_type) {
        this.supply_type = supply_type;
    }

    public String getInterfaceManufacturerAndModel() {
        return interface_manufacturer_and_model;
    }

    public void setInterfaceManufacturerAndModel(String interface_manufacturer_and_model) {
        this.interface_manufacturer_and_model = interface_manufacturer_and_model;
    }

    public String getSprayerTypeManufacturerAndModel() {
        return sprayer_type_manufacturer_and_model;
    }

    public void setSprayerTypeManufacturerAndModel(String sprayer_type_manufacturer_and_model) {
        this.sprayer_type_manufacturer_and_model = sprayer_type_manufacturer_and_model;
    }

    public String getOtherElectrosprayIonisation() {
        return other_electrospray_ionisation;
    }

    public void setOtherElectrosprayIonisation(String other_electrospray_ionisation) {
        this.other_electrospray_ionisation = other_electrospray_ionisation;
    }

    public String getPlateComposition() {
        return plate_composition;
    }

    public void setPlateComposition(String plate_composition) {
        this.plate_composition = plate_composition;
    }

    public String getMatrixComposition() {
        return matrix_composition;
    }

    public void setMatrixComposition(String matrix_composition) {
        this.matrix_composition = matrix_composition;
    }

    public String getPSDsummary() {
        return psd_summary;
    }

    public void setPsdSummary(String psd_summary) {
        this.psd_summary = psd_summary;
    }

    public String getLaserTypeAndWavelength() {
        return laser_type_and_wavelength;
    }

    public void setLaserTypeAndWavelength(String laser_type_and_wavelength) {
        this.laser_type_and_wavelength = laser_type_and_wavelength;
    }

    public String getOtherMALDI() {
        return other_maldi;
    }

    public void setOtherMALDI(String other_maldi) {
        this.other_maldi = other_maldi;
    }

    public String getOtherIonizationDescription() {
        return other_ionization_description;
    }

    public void setOtherIonizationDescription(String other_ionization_description) {
        this.other_ionization_description = other_ionization_description;
    }

    public String getMassAnalyzerType() {
        return mass_analyzer_type;
    }

    public void setMassAnalyzerType(String mass_analyzer_type) {
        this.mass_analyzer_type = mass_analyzer_type;
    }

    public String getReflectronStatus() {
        return reflectron_status;
    }

    public void setReflectronStatus(String reflectron_status) {
        this.reflectron_status = reflectron_status;
    }

    public String getActivationLocation() {
        return activation_location;
    }

    public void setActivationLocation(String activation_location) {
        this.activation_location = activation_location;
    }

    public String getGasType() {
        return gas_type;
    }

    public void setGasType(String gas_type) {
        this.gas_type = gas_type;
    }

    public String getActivationType() {
        return activation_type;
    }

    public void setActivationType(String activation_type) {
        this.activation_type = activation_type;
    }

    public String getAcquisitionSoftware() {
        return acquisition_software;
    }

    public void setAcquisitionSoftware(String acquisition_software) {
        this.acquisition_software = acquisition_software;
    }

    public String getAcquisitionParameters() {
        return acquisition_parameters;
    }

    public void setAcquisitionParameters(String acquisition_parameters) {
        this.acquisition_parameters = acquisition_parameters;
    }

    public String getAnalysisSoftware() {
        return analysis_software;
    }

    public void setAnalysisSoftware(String analysis_software) {
        this.analysis_software = analysis_software;
    }

    public String getAnalysisParameters() {
        return analysis_parameters;
    }

    public void setAnalysisParameters(String analysis_parameters) {
        this.analysis_parameters = analysis_parameters;
    }

    public String getIntensityValues() {
        return intensity_values;
    }

    public void setIntensityValues(String intensity_values) {
        this.intensity_values = intensity_values;
    }

    public String getMSlevel() {
        return ms_level;
    }

    public void setMSlevel(String ms_level) {
        this.ms_level = ms_level;
    }

    public String getIonMode() {
        return ion_mode;
    }

    public void setIonMode(String ion_mode) {
        this.ion_mode = ion_mode;
    }

    public String getAdditionalInfo() {
        return additional_info;
    }

    public void setAdditionalInfo(String additional_info) {
        this.additional_info = additional_info;
    }
    
    
    public String getSeparationMethodType() {
        return separation_method_type;
    }

    public void setSeparationMethodType(String separation_method_type) {
        this.separation_method_type = separation_method_type;
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
