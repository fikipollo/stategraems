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
public class ColumnChromatography extends Chromatography {
    ////  Herited from SeparationMethod     
    //    protected String rawdata_id;

    String column_chromatography_type;
    String column_manufacturer;
    String column_model;
    String separation_mode;
    String dimensions;
    String description_of_stationary_phase;
    String additional_accessories;
    String combined_unit_manufacturer;
    String combined_unit_model;
    String time;
    String gradient;
    String flow_rate;
    String temperature;
    String pre_run_process_type;
    String pre_run_process_substance;
    String pre_run_process_time;
    String pre_run_process_flowrate;
    String detection_equipment;
    String detection_type;
    String detection_equipment_settings;
    String detection_timescale;
    String detection_trace;
    MobilePhase[] mobile_phases;
    Fraction[] fractions;
    
    public ColumnChromatography() {
        super();
        separation_method_type = "ColumnChromatography";
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static ColumnChromatography fromJSON(String jsonString) {
        Gson gson = new Gson();
        ColumnChromatography columnChromatography = gson.fromJson(jsonString, ColumnChromatography.class);

        return columnChromatography;
    }
    
    public String getColumnChromatographyType() {
        return column_chromatography_type;
    }

    public void setColumnChromatographyType(String column_chromatography_type) {
        this.column_chromatography_type = column_chromatography_type;
    }

    public String getColumnManufacturer() {
        return column_manufacturer;
    }

    public void setColumnManufacturer(String column_manufacturer) {
        this.column_manufacturer = column_manufacturer;
    }

    public String getColumnModel() {
        return column_model;
    }

    public void setColumnModel(String column_model) {
        this.column_model = column_model;
    }

    public String getSeparationMode() {
        return separation_mode;
    }

    public void setSeparationMode(String separation_mode) {
        this.separation_mode = separation_mode;
    }

    public String getDimensions() {
        return dimensions;
    }

    public void setDimensions(String dimensions) {
        this.dimensions = dimensions;
    }

    public String getDescriptionOfStationaryPhase() {
        return description_of_stationary_phase;
    }

    public void setDescriptionOfStationaryPhase(String description_of_stationary_phase) {
        this.description_of_stationary_phase = description_of_stationary_phase;
    }

    public String getAdditionalAccessories() {
        return additional_accessories;
    }

    public void setAdditionalAccessories(String additional_accessories) {
        this.additional_accessories = additional_accessories;
    }

    public String getCombinedUnitManufacturer() {
        return combined_unit_manufacturer;
    }

    public void setCombinedUnitManufacturer(String combined_unit_manufacturer) {
        this.combined_unit_manufacturer = combined_unit_manufacturer;
    }

    public String getCombinedUnitModel() {
        return combined_unit_model;
    }

    public void setCombinedUnitModel(String combined_unit_model) {
        this.combined_unit_model = combined_unit_model;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getGradient() {
        return gradient;
    }

    public void setGradient(String gradient) {
        this.gradient = gradient;
    }

    public String getFlowRate() {
        return flow_rate;
    }

    public void setFlowRate(String flow_rate) {
        this.flow_rate = flow_rate;
    }

    public String getTemperature() {
        return temperature;
    }

    public void setTemperature(String temperature) {
        this.temperature = temperature;
    }

    public String getPreRunProcessType() {
        return pre_run_process_type;
    }

    public void setPreRunProcessType(String pre_run_process_type) {
        this.pre_run_process_type = pre_run_process_type;
    }

    public String getPreRunProcessSubstance() {
        return pre_run_process_substance;
    }

    public void setPreRunProcessSubstance(String pre_run_process_substance) {
        this.pre_run_process_substance = pre_run_process_substance;
    }

    public String getPreRunProcessTime() {
        return pre_run_process_time;
    }

    public void setPreRunProcessTime(String pre_run_process_time) {
        this.pre_run_process_time = pre_run_process_time;
    }

    public String getPreRunProcessFlowrate() {
        return pre_run_process_flowrate;
    }

    public void setPreRunProcessFlowrate(String pre_run_process_flowrate) {
        this.pre_run_process_flowrate = pre_run_process_flowrate;
    }

    public String getDetectionEquipment() {
        return detection_equipment;
    }

    public void setDetectionEquipment(String detection_equipment) {
        this.detection_equipment = detection_equipment;
    }

    public String getDetectionType() {
        return detection_type;
    }

    public void setDetectionType(String detection_type) {
        this.detection_type = detection_type;
    }

    public String getDetectionEquipmentSettings() {
        return detection_equipment_settings;
    }

    public void setDetectionEquipmentSettings(String detection_equipment_settings) {
        this.detection_equipment_settings = detection_equipment_settings;
    }

    public String getDetectionTimescale() {
        return detection_timescale;
    }

    public void setDetectionTimescale(String detection_timescale) {
        this.detection_timescale = detection_timescale;
    }

    public String getDetectionTrace() {
        return detection_trace;
    }

    public void setDetectionTrace(String detection_trace) {
        this.detection_trace = detection_trace;
    }

    public MobilePhase[] getMobilePhases() {
        return mobile_phases;
    }

    public void setMobilePhases(MobilePhase[] mobile_phases) {
        this.mobile_phases = mobile_phases;
    }

    public MobilePhase getNewMobilePhase() {
        return new MobilePhase();
    }
    
    public void addMobilePhase(MobilePhase mobilePhase) {
        if (this.mobile_phases == null) {
            this.mobile_phases = new MobilePhase[1];
            this.mobile_phases[0] = mobilePhase;
        } else {
            this.mobile_phases = java.util.Arrays.copyOf(this.mobile_phases, this.mobile_phases.length + 1);
            this.mobile_phases[this.mobile_phases.length - 1] = mobilePhase;
        }
    }

    public Fraction[] getFractions() {
        return fractions;
    }

    public void setFractions(Fraction[] fractions) {
        this.fractions = fractions;
    }

    public Fraction getNewFraction() {
        return new Fraction();
    }
    
    public void addFraction(Fraction fraction) {
        if (this.fractions == null) {
            this.fractions = new Fraction[1];
            this.fractions[0] = fraction;
        } else {
            this.fractions = java.util.Arrays.copyOf(this.fractions, this.fractions.length + 1);
            this.fractions[this.fractions.length - 1] = fraction;
        }
    }
    
    public class MobilePhase{
        String name;
        String description;

        public MobilePhase() {
        }

        public MobilePhase(String mp_name, String mp_description) {
            this.name = mp_name;
            this.description = mp_description;
        }
        
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
    public class Fraction{
        String name;
        String description;

        public Fraction() {
        }

        public Fraction(String fr_name, String fr_description) {
            this.name = fr_name;
            this.description = fr_description;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
    
}
