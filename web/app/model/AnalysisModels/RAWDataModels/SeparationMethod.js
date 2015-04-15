/*
 * (C) Copyright 2014 The Genomics of Gene Expression Lab, CIPF 
 * (http://bioinfo.cipf.es/aconesawp) and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 3 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * Contributors:
 *     Rafael Hernandez de Diego, rhernandez@cipf.es
 *     Ana Conesa Cegarra, aconesa@cipf.es
 *     
 * THIS FILE CONTAINS THE FOLLOWING COMPONENT DECLARATION
 *   - SeparationMethod model
 *   - Chromatography model (EXTENDS SeparationMethod)
 *   - ColumnChromatography model (EXTENDS Chromatography)
 *   - GasChromatography model (EXTENDS ColumnChromatography)
 *   - LiquidChromatography model (EXTENDS ColumnChromatography)
 *   - CapillaryElectrophoresis model (EXTENDS SeparationMethod)
 *   - MobilePhase model
 */
Ext.define('SL.model.AnalysisModels.RAWDataModels.SeparationMethod', {
    extend: 'Ext.data.Model',
    //Extends the Observable class
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [{name: "rawdata_id"}]
});

Ext.define('SL.model.AnalysisModels.RAWDataModels.Chromatography', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.SeparationMethod',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from SeparationMethod
        // rawdata_id
        {name: 'cc_sample_description'},
        {name: 'cc_sample_processing'},
        {name: 'cc_sample_injection'}
    ]
});

Ext.define('SL.model.AnalysisModels.RAWDataModels.ColumnChromatography', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.Chromatography',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from SeparationMethod
        // rawdata_id
        //Inherited from Chromatography
        // sample_description
        // sample_processing
        // sample_injection'    
        {name: 'separation_method_type', defaultValue: 'ColumnChromatography'},
        {name: 'column_chromatography_type'},
        {name: 'column_manufacturer'},
        {name: 'column_model'},
        {name: 'separation_mode'},
        {name: 'dimensions'},
        {name: 'description_of_stationary_phase'},
        {name: 'additional_accessories'},
        {name: 'combined_unit_manufacturer'},
        {name: 'combined_unit_model'},
        {name: 'time'},
        {name: 'gradient'},
        {name: 'flow_rate'},
        {name: 'temperature'},
        {name: 'pre_run_process_type'},
        {name: 'pre_run_process_substance'},
        {name: 'pre_run_process_time'},
        {name: 'pre_run_process_flowrate'},
        {name: 'detection_equipment'},
        {name: 'detection_type'},
        {name: 'detection_equipment_settings'},
        {name: 'detection_timescale'},
        {name: 'detection_trace'}
    ],
    mobile_phases: null,
    fractions: null,
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getMobilePhases: function() {
        if (this.mobile_phases == null) {
            this.mobile_phases = [];
        }
        return this.mobile_phases;
    },
    setMobilePhases: function(mobile_phases) {
        this.mobile_phases = mobile_phases;
    },
    addMobilePhase: function(mobile_phases) {
        this.getMobilePhases().push(mobile_phases);
    },
    getFractions: function() {
        if (this.fractions == null) {
            this.fractions = [];
        }
        return this.fractions;
    },
    setFractions: function(fractions) {
        this.fractions = fractions;
    },
    addFraction: function(fraction) {
        this.getFractions().push(fraction);
    },
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    statics: {
        /**BC********************************************************************
         * This static function creates a new RAWData MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData the data for the RAWData model in JSON format
         * @return the model with the loaded data    
         *EC********************************************************************/
        loadFromJSON: function(jsonData) {
            var column_chromatography_type = jsonData['column_chromatography_type'];
            var newModel = null;
            switch (column_chromatography_type) {
                case 'GasChromatography':
                    newModel = Ext.create('SL.model.AnalysisModels.RAWDataModels.GasChromatography');
                    break;
                case 'LiquidChromatography':
                    newModel = Ext.create('SL.model.AnalysisModels.RAWDataModels.LiquidChromatography');
                    break;
            }

            var mobilePhasesJSONData = jsonData['mobile_phases'];
            delete jsonData['mobile_phases'];
            var mobilePhase;
            for (var i in mobilePhasesJSONData) {
                mobilePhase = new MobilePhase();
                mobilePhase.loadFromJSON(mobilePhasesJSONData[i]);
                newModel.addMobilePhase(mobilePhase);
            }
            var fractionsJSONData = jsonData['fractions'];
            delete jsonData['fractions'];
            var fraction;
            for (var i in fractionsJSONData) {
                fraction = new Fraction();
                fraction.loadFromJSON(fractionsJSONData[i]);
                newModel.addFraction(fraction);
            }
            newModel.set(jsonData);
            return newModel;
        }
    },
    /**BC********************************************************************
     * This function...
     *  
     * @return 
     *EC********************************************************************/
    toSimpleJSON: function() {
        var JSON_DATA = this.data;
        JSON_DATA['mobile_phases'] = [];
        var mobile_phases = this.getMobilePhases();
        for (var i in mobile_phases) {
            JSON_DATA['mobile_phases'].push(mobile_phases[i].toSimpleJSON());
        }
        JSON_DATA['fractions'] = [];
        var fractions = this.getFractions();
        for (var i in fractions) {
            JSON_DATA['fractions'].push(fractions[i].toSimpleJSON());
        }
        return JSON_DATA;
    }
});

Ext.define('SL.model.AnalysisModels.RAWDataModels.GasChromatography', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.ColumnChromatography',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from SeparationMethod
        // rawdata_id
        //Inherited from Chromatography
        // sample_description
        // sample_processing
        // sample_injection' 
        //Inherited from ColumnChromatography
        //separation_method_type,column_chromatography_type,column_manufacturer,
        //column_model,separation_mode,dimensions,description_of_stationary_phase,
        //additional_accessories,time,gradient,flow_rate,temperature,
        //pre_run_process_description,post_run_process_description'}
        {name: 'column_chromatography_type', defaultValue: 'GasChromatography'}]
});

Ext.define('SL.model.AnalysisModels.RAWDataModels.LiquidChromatography', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.ColumnChromatography',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from SeparationMethod
        // rawdata_id
        //Inherited from Chromatography
        // sample_description
        // sample_processing
        // sample_injection' 
        // Inherited from ColumnChromatography
        //separation_method_type,column_chromatography_type,column_manufacturer,
        //column_model,separation_mode,dimensions,description_of_stationary_phase,
        //additional_accessories,time,gradient,flow_rate,temperature,
        //pre_run_process_description,post_run_process_description'}
        {name: 'column_chromatography_type', defaultValue: 'LiquidChromatography'}]
});

Ext.define('SL.model.AnalysisModels.RAWDataModels.CapillaryElectrophoresis', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.SeparationMethod',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from SeparationMethod
        // rawdata_id
        {name: 'separation_method_type', defaultValue: 'CapillaryElectrophoresis'},
        {name: 'experiment_type'},
        {name: 'experiment_aim'},
        {name: 'ce_sample_description'},
        {name: 'ce_sample_solution'},
        {name: 'ce_sample_preparation'},
        {name: 'capillary_description'},
        {name: 'capillary_source'},
        {name: 'capillary_dimensions'},
        {name: 'ce_temperature'},
        {name: 'auxiliary_data_channels'},
        {name: 'duration'},
        {name: 'run_description'}
    ],
    statics: {
        /**BC********************************************************************
         * This static function creates a new RAWData MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData the data for the RAWData model in JSON format
         * @return the model with the loaded data    
         *EC********************************************************************/
        loadFromJSON: function(jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.RAWDataModels.CapillaryElectrophoresis');
            model.set(jsonData);
            return model;
        }
    },
    /**BC********************************************************************
     * This function...
     *  
     * @return 
     *EC********************************************************************/
    toSimpleJSON: function() {
        var JSON_DATA = this.data;
        return JSON_DATA;
    }
});

function MobilePhase(name, description) {
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    this.mp_name = name;
    this.mp_description = description;
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    this.getName = function() {
        return this.mp_name;
    };
    this.setName = function(name) {
        this.mp_name = name;
    };
    this.getDescription = function() {
        return this.mp_description;
    };
    this.setDescription = function(description) {
        this.mp_description = description;
    };
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    //FUNCTIONS
    this.toSimpleJSON = function() {
        var JSON_DATA = {mp_name: this.mp_name, mp_description: this.mp_description};
        return JSON_DATA;
    };
    this.loadFromJSON = function(jsonData) {
        this.mp_name = jsonData['mp_name'];
        this.mp_description = jsonData['mp_description'];
    };
}
function Fraction(name, description) {
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    this.fr_name = name;
    this.fr_description = description;
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    this.getName = function() {
        return this.fr_name;
    };
    this.setName = function(name) {
        this.fr_name = name;
    };
    this.getDescription = function() {
        return this.fr_description;
    };
    this.setDescription = function(description) {
        this.fr_description = description;
    };
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    //FUNCTIONS
    this.toSimpleJSON = function() {
        var JSON_DATA = {fr_name: this.fr_name, fr_description: this.fr_description};
        return JSON_DATA;
    };
    this.loadFromJSON = function(jsonData) {
        this.fr_name = jsonData['fr_name'];
        this.fr_description = jsonData['fr_description'];
    };
}