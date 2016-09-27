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
 *   - ExtractionMethod model
 *   - Sequencing_rawdata model (EXTENDS ExtractionMethod)
 *   - ChIPseq model (EXTENDS Sequencing_rawdata)
 *   - DNaseseq model (EXTENDS Sequencing_rawdata)
 *   - Methylseq model (EXTENDS Sequencing_rawdata)
 *   - smallRNAseq model (EXTENDS Sequencing_rawdata)
 *   - mRNAseq model (EXTENDS Sequencing_rawdata)
 *   - NuclearMagneticResonance model (EXTENDS ExtractionMethod)
 *   - MassSpectrometry model (EXTENDS ExtractionMethod)
 *   - 
 */

Ext.define('SL.model.AnalysisModels.RAWDataModels.ExtractionMethod', {
    extend: 'Ext.data.Model',
    //Extends the Observable class
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [{name: "rawdata_id"}],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/

    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/

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

Ext.define('SL.model.AnalysisModels.RAWDataModels.Sequencing_rawdata', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.ExtractionMethod',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from Intermediate_data     
        // rawdata_id
        {name: 'layout'},
        {name: 'orientation'},
        {name: 'nominal_length', type: 'int', defaultValue: 0},
        {name: 'nominal_length_stdev', type: 'int', defaultValue: 0},
        {name: 'avg_sequence_length', type: 'int', defaultValue: 0},
        {name: 'avg_sequencing_depth', type: 'double', defaultValue: 0},
        {name: 'platform_family'},
        {name: 'platform_model'},
        {name: 'base_calls'},
        {name: 'pooling_strategy'},
        {name: 'pooling_strategy_description'},
        {name: 'slide_id'},
        {name: 'lane_number'},
        {name: 'slide_ID'},
        {name: 'library_construction_protocol'}
    ]
});

Ext.define('SL.model.AnalysisModels.RAWDataModels.ChIPseq', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.Sequencing_rawdata',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from ExtractionMethod 
        // rawdata_id
        //Inherited from Sequencing_rawdata
        // layout, orientation, nominal_length, nominal_length_stdev, avg_sequence_length, 
        // avg_sequencing_depth, platform_family, platform_model, base_calls, pooling_strategy, 
        // pooling_strategy_description, slide_ID, lane_number, library_construction_protocol;
        {name: 'extraction_method_type', defaultValue: 'ChIP-seq'},
        {name: 'is_control_sample'},
        {name: 'antibody_target'},
        {name: 'antibody_target_type'},
        {name: 'antibody_manufacturer'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/

    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    statics: {
        /**BC********************************************************************
         *  @Override
         * This static function creates a new RAWData MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the RAWData model in JSON format
         * @return the model with the loaded data    
         *EC********************************************************************/
        loadFromJSON: function(jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.RAWDataModels.ChIPseq');
            model.set(jsonData);
            return model;
        }
    }
});

Ext.define('SL.model.AnalysisModels.RAWDataModels.DNaseseq', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.Sequencing_rawdata',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from ExtractionMethod 
        // rawdata_id
        //Inherited from Sequencing_rawdata
        // layout, orientation, nominal_length, nominal_length_stdev, avg_sequence_length, 
        // avg_sequencing_depth, platform_family, platform_model, base_calls, pooling_strategy, 
        // pooling_strategy_description, slide_ID, lane_number, library_construction_protocol;
        {name: 'extraction_method_type', defaultValue: 'DNase-seq'},
        {name: 'is_for_footprinting'},
        {name: 'restriction_enzyme'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/

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
            var model = Ext.create('SL.model.AnalysisModels.RAWDataModels.DNaseseq');
            model.set(jsonData);
            return model;
        }
    }
});

Ext.define('SL.model.AnalysisModels.RAWDataModels.Methylseq', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.Sequencing_rawdata',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from ExtractionMethod 
        // rawdata_id
        //Inherited from Sequencing_rawdata
        // layout, orientation, nominal_length, nominal_length_stdev, avg_sequence_length, 
        // avg_sequencing_depth, platform_family, platform_model, base_calls, pooling_strategy, 
        // pooling_strategy_description, slide_ID, lane_number, library_construction_protocol;
        {name: 'extraction_method_type', defaultValue: 'Methyl-seq'},
        {name: 'protocol'},
        {name: 'strand_specificity'},
        {name: 'selection'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/

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
            var model = Ext.create('SL.model.AnalysisModels.RAWDataModels.Methylseq');
            model.set(jsonData);
            return model;
        }
    }
});

Ext.define('SL.model.AnalysisModels.RAWDataModels.smallRNAseq', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.Sequencing_rawdata',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from ExtractionMethod 
        // rawdata_id
        //Inherited from Sequencing_rawdata
        // layout, orientation, nominal_length, nominal_length_stdev, avg_sequence_length, 
        // avg_sequencing_depth, platform_family, platform_model, base_calls, pooling_strategy, 
        // pooling_strategy_description, slide_ID, lane_number, library_construction_protocol;
        {name: 'extraction_method_type', defaultValue: 'smallRNA-seq'},
        {name: 'extracted_molecule'},
        {name: 'rna_type'},
        {name: 'strand_specificity'},
        {name: 'selection'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/

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
            var model = Ext.create('SL.model.AnalysisModels.RAWDataModels.smallRNAseq');
            model.set(jsonData);
            return model;
        }
    }
});

Ext.define('SL.model.AnalysisModels.RAWDataModels.mRNAseq', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.Sequencing_rawdata',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from ExtractionMethod 
        // rawdata_id
        //Inherited from Sequencing_rawdata
        // layout, orientation, nominal_length, nominal_length_stdev, avg_sequence_length, 
        // avg_sequencing_depth, platform_family, platform_model, base_calls, pooling_strategy, 
        // pooling_strategy_description, slide_ID, lane_number, library_construction_protocol;
        {name: 'extraction_method_type', defaultValue: 'mRNA-seq'},
        {name: 'extracted_molecule'},
        {name: 'rna_type'},
        {name: 'strand_specificity'},
        {name: 'selection'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/

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
            var model = Ext.create('SL.model.AnalysisModels.RAWDataModels.mRNAseq');
            model.set(jsonData);
            return model;
        }
    }
});

Ext.define('SL.model.AnalysisModels.RAWDataModels.NuclearMagneticResonance', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.ExtractionMethod',
    requires: ['SL.model.AnalysisModels.RAWDataModels.SeparationMethod'],
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from ExtractionMethod 
        // rawdata_id
        {name: 'separation_method_type', defaultValue: 'None'},
        {name: 'extraction_method_type', defaultValue: 'NuclearMagneticResonance'},
        {name: 'instrument_manufacturer'},
        {name: 'instrument_model'},
        {name: 'strength'},
        {name: 'console_description'},
        {name: 'vt_control'},
        {name: 'pulsed_field_strength'},
        {name: 'max_gradient_strength'},
        {name: 'n_shims'},
        {name: 'n_channels'},
        {name: 'probe_type'},
        {name: 'sample_state'},
        {name: 'operation_mode'},
        {name: 'tune_mode'},
        {name: 'probe_gas'},
        {name: 'volume'},
        {name: 'final_sample_status'},
        {name: 'nmr_tube_type'},
        {name: 'pH'},
        {name: 'solvent'},
        {name: 'buffer'},
        {name: 'resonant_frequency'},
        {name: 'acquisition_description'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getSeparationMethod: function() {
        return this.separationMethod;
    },
    setSeparationMethod: function(separationMethod) {
        if (separationMethod == null) {
            return;
        }
        separationMethod.set('rawdata_id', this.get('rawdata_id'));
        this.separationMethod = separationMethod;
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
            var model = Ext.create('SL.model.AnalysisModels.RAWDataModels.NuclearMagneticResonance');

            var separationMethodJSONdata = jsonData['separationMethod'];
            delete jsonData['separationMethod'];
            var separationMethod;

            switch (jsonData['separation_method_type'])
            {
                case 'GasChromatography':
                    separationMethod = SL.model.AnalysisModels.RAWDataModels.ColumnChromatography.loadFromJSON(separationMethodJSONdata);
                    break;
                case 'LiquidChromatography':
                    separationMethod = SL.model.AnalysisModels.RAWDataModels.ColumnChromatography.loadFromJSON(separationMethodJSONdata);
                    break;
                case 'CapillaryElectrophoresis':
                    separationMethod = SL.model.AnalysisModels.RAWDataModels.CapillaryElectrophoresis.loadFromJSON(separationMethodJSONdata);
                    break;
                case 'None':
                    break;
                default:
                    throw "Unknown Extraction method type.";
                    break;
            }
            model.setSeparationMethod(separationMethod);
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
        if (this.getSeparationMethod() != null) {
            JSON_DATA['separationMethod'] = this.getSeparationMethod().toSimpleJSON();
        }
        JSON_DATA["step_owners"] = this.getOwners();
        return JSON_DATA;
    }
});

Ext.define('SL.model.AnalysisModels.RAWDataModels.MassSpectrometry', {
    extend: 'SL.model.AnalysisModels.RAWDataModels.ExtractionMethod',
    requires: ['SL.model.AnalysisModels.RAWDataModels.SeparationMethod'],
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from ExtractionMethod 
        // rawdata_id
        {name: 'separation_method_type', defaultValue: 'None'},
        {name: 'extraction_method_type', defaultValue: 'MassSpectrometry'},
        //Equipment details
        {name: 'mass_spectrometer_manufacturer'},
        {name: 'customizations'},
        {name: 'ionization_source'},
        //Electrospray Ionisation (ESI) details
        {name: 'supply_type'},
        {name: 'interface_manufacturer_and_model'},
        {name: 'sprayer_type_manufacturer_and_model'},
        {name: 'other_electrospray_ionisation'},
        //MALDI details
        {name: 'plate_composition'},
        {name: 'matrix_composition'},
        {name: 'psd_summary'},
        {name: 'laser_type_and_wavelength'},
        {name: 'other_maldi'},
        {name: 'other_ionization_description'},
        //Post source component details
        {name: 'mass_analyzer_type'},
        {name: 'reflectron_status'},
        {name: 'activation_location'},
        {name: 'gas_type'},
        {name: 'activation_type'},
        //Spectrum and peak list generation and annotation (data acquisition)
        {name: 'acquisition_software'},
        {name: 'acquisition_parameters'},
        //Spectrum and peak list generation and annotation (data analysis)
        {name: 'analysis_software'},
        {name: 'analysis_parameters'},
        //Spectrum and peak list generation and annotation (resulting data)
        //Location of source
        {name: 'intensity_values'},
        {name: 'ms_level'},
        {name: 'ion_mode'},
        {name: 'additional_info'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    /**BC********************************************************************
     * This function...
     *  
     * @return 
     *EC********************************************************************/
    getSeparationMethod: function() {
        return this.separationMethod;
    },
    /**BC********************************************************************
     * This function...
     *  
     * @param separationMethod
     * @return 
     *EC********************************************************************/
    setSeparationMethod: function(separationMethod) {
        if (separationMethod == null) {
            return;
        }
        separationMethod.set('rawdata_id', this.get('rawdata_id'));
        this.separationMethod = separationMethod;
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
            var model = Ext.create('SL.model.AnalysisModels.RAWDataModels.MassSpectrometry');

            var separationMethodJSONdata = jsonData['separationMethod'];
            delete jsonData['separationMethod'];
            var separationMethod;

            switch (jsonData['separation_method_type'])
            {
                case 'GasChromatography':
                    separationMethod = SL.model.AnalysisModels.RAWDataModels.ColumnChromatography.loadFromJSON(separationMethodJSONdata);
                    break;
                case 'LiquidChromatography':
                    separationMethod = SL.model.AnalysisModels.RAWDataModels.ColumnChromatography.loadFromJSON(separationMethodJSONdata);
                    break;
                case 'CapillaryElectrophoresis':
                    separationMethod = SL.model.AnalysisModels.RAWDataModels.CapillaryElectrophoresis.loadFromJSON(separationMethodJSONdata);
                    break;
                case 'None':
                    break;
                default:
                    throw "Unknown Extraction method type.";
                    break;
            }

            model.setSeparationMethod(separationMethod);
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
        if (this.getSeparationMethod() != null) {
            JSON_DATA['separationMethod'] = this.getSeparationMethod().toSimpleJSON();
        }
        return JSON_DATA;
    }
}); 