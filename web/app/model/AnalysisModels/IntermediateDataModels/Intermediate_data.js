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
 *   - Intermediate_data model
 *   - Extract_relevant_features_step model (EXTENDS Intermediate_data)
 *   - Maxquant_step model (EXTENDS Intermediate_data)
 *   - Smoothing_step model (EXTENDS Intermediate_data)
 *   - Union_step model (EXTENDS Intermediate_data)
 *   - Preprocessing_step model (EXTENDS Intermediate_data)
 *   - Mapping_step model (EXTENDS Intermediate_data)
 *   - 
 */
Ext.define('SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data', {
    extend: 'SL.model.AnalysisModels.Non_processed_data',
    requires: ['SL.model.AnalysisModels.QualityReport'],
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        {name: 'type', defaultValue: 'intermediate_data'},
        {name: 'intermediate_data_type'},
        {name: 'software'},
        {name: 'software_version'},
        {name: 'software_configuration'},
        {name: 'motivation'},
        {name: 'results'}
    ],
//    used_data: null,
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getIntermediateDataType: function () {
        return this.get('intermediate_data_type');
    },
    setIntermediateDataType: function (intermediateDataType) {
        this.set('intermediate_data_type', intermediateDataType);
        this.setChanged();
    },
    getSoftware: function () {
        return this.get('software');
    },
    setSoftware: function (software) {
        this.set('software', software);
        this.setChanged();
    },
    getSoftwareVersion: function () {
        return this.get('software_version');
    },
    setSoftwareVersion: function (software_version) {
        this.set('software_version', software_version);
        this.setChanged();
    },
    getSoftwareConfiguration: function () {
        return this.get('software_configuration');
    },
    setSoftwareConfiguration: function (software_configuration) {
        this.set('software_configuration', software_configuration);
        this.setChanged();
    },
    getMotivation: function () {
        return this.get('motivation');
    },
    setMotivation: function (motivation) {
        this.set('motivation', motivation);
        this.setChanged();
    },
    getResults: function () {
        return this.get('results');
    },
    setResults: function (results) {
        this.set('results', results);
        this.setChanged();
    },
    getPreviousSteps: function () {
        if (this.used_data == null) {
            this.used_data = [];
        }
        return this.used_data;
    },
    setPreviousSteps: function (stepList) {
        this.clearPreviousSteps();
        var me = this;
        Ext.Array.each(stepList, function (item) {
            me.addPreviousStep(item);
        });
        this.setChanged();
    },
    setPreviousStepsIDs: function (stepIDList) {
        this.clearPreviousSteps();
        for (var i in stepIDList) {
            this.getPreviousSteps().push(stepIDList[i]);
        }
        this.setChanged();
    },
    addPreviousStep: function (previousStep) {
        if (Ext.Array.indexOf(this.getPreviousSteps(), previousStep.get('step_id')) === -1) {
            this.getPreviousSteps().push(previousStep.get('step_id'));
        }
        var maxStep = Math.max(previousStep.get('step_number'), this.get('step_number'));
        maxStep = (isNaN(maxStep)) ? 1 : maxStep + 1;

        this.set('step_number', maxStep);
        this.setChanged();
    },
    removePreviousStep: function (previousStepID) {
        var pos = this.getPreviousSteps().indexOf(previousStepID);
        if (pos !== -1) {
            this.used_data.splice(pos, 1);
            this.setChanged();
        }
    },
    clearPreviousSteps: function () {
        if (this.used_data == null) {
            this.used_data = [];
        } else {
            this.used_data.length = 0;
        }
        this.setChanged();
        return this.used_data;
    },
    /**********************************************************************
     **
     **OTHER METHODS
     **
     *********************************************************************/
    statics: {
        loadFromJSON: function (jsonData) {
            /********************************************************************************      
             * This static function creates a new Intermediate_data MODEL using the information 
             * provided as a JSON
             *  
             * @param jsonData, the data for the Intermediate_data model in JSON format
             * @return the model with the loaded data    
             ********************************************************************************/
            switch (jsonData['intermediate_data_type'])
            {
                case 'preprocessing_step':
                    return SL.model.AnalysisModels.IntermediateDataModels.Preprocessing_step.loadFromJSON(jsonData);
                    break;
                case 'mapping_step':
                    return SL.model.AnalysisModels.IntermediateDataModels.Mapping_step.loadFromJSON(jsonData);
                    break;
                case 'union_step':
                    return SL.model.AnalysisModels.IntermediateDataModels.Union_step.loadFromJSON(jsonData);
                    break;
                case 'smoothing_step':
                    return SL.model.AnalysisModels.IntermediateDataModels.Smoothing_step.loadFromJSON(jsonData);
                    break;
                case 'extract_relevant_features_step':
                    return SL.model.AnalysisModels.IntermediateDataModels.Extract_relevant_features_step.loadFromJSON(jsonData);
                    break;
//                case 'max_quant':
//                    return SL.model.AnalysisModels.IntermediateDataModels.Maxquant_step.loadFromJSON(jsonData);
//                    break;
                default:
                    return null;
                    break;
            }
        }
    },
    /**BC********************************************************************
     * This function...
     *  
     * @return 
     *EC********************************************************************/
    getJSONforGraph: function () {
        var _parents_id = this.getPreviousSteps();
        var json_data =
                {
                    id: this.get('step_id'),
                    name: (this.getName() != null ? this.getName() : ""),
                    type: this.get('intermediate_data_type'),
                    nodeType: 'Intermediate_step',
                    summary: "TODO",
                    parents_id: _parents_id
                };

        return json_data;
    },
    toSimpleJSON: function () {
        var JSON_DATA = this.data;
        //MERGE THE OBJECT
        JSON_DATA["used_data"] = this.getPreviousSteps();
        if (this.getAssociatedQualityReport() != null) {
            JSON_DATA['associatedQualityReport'] = this.getAssociatedQualityReport().toSimpleJSON();
        } else {
            delete JSON_DATA['associatedQualityReport'];
        }
        var owners_JSON_DATA = [];
        var owners = this.getOwners();
        for (var i in owners) {
            owners_JSON_DATA.push(owners[i].toSimpleJSON());
        }
        //MERGE THE OBJECT
        if (owners_JSON_DATA.length > 0) {
            JSON_DATA["step_owners"] = owners_JSON_DATA;
        }

        return JSON_DATA;
    },
    /**BC********************************************************************
     * This function check if the Analysis model is valid:
     * 1. If all the associated steps are valid.
     * 2. 
     * @return  True is everithing is OK, an  String with the error message in other case.
     *EC********************************************************************/
    isValid: function () {
        var ERROR_MESSAGE = "";

        var errors = this.validate();

        if (!errors.isValid()) {
            errors.each(function (item) {
                ERROR_MESSAGE += "</br>-  Intermediate step metadata error:   Field " + item.field + " " + item.message;
            });
        }
        if (this.getPreviousSteps().length === 0) {
            ERROR_MESSAGE += "</br> Intermediate steps MUST have 1 or more associated previous steps.";
        }
        return (ERROR_MESSAGE === "" ? true : ERROR_MESSAGE);
    }
});

Ext.define('SL.model.AnalysisModels.IntermediateDataModels.Extract_relevant_features_step', {
    extend: 'SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from Intermediate_data     
        // step_id, , type, intermediate_data_type, step_number, submission_date, 
        // last_edition_date, software, software_version, software_configuration, 
        // motivation, results, files_location
        {name: 'intermediate_data_type', defaultValue: 'extract_relevant_features_step'},
        {name: 'feature_type'},
        {name: 'files_description'},
        {name: 'reference_files'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getFeatureType: function () {
        return this.get('feature_type');
    },
    setFeatureType: function (feature_type) {
        this.set('feature_type', feature_type);
        this.setChanged();
    },
    getFilesDescription: function () {
        return this.get('files_description');
    },
    setFilesDescription: function (filesDescription) {
        this.set('files_description', filesDescription);
        this.setChanged();
    },
    getReferenceFiles: function () {
        return this.get('reference_files');
    },
    setReferenceFiles: function (referenceFiles) {
        this.set('reference_files', referenceFiles);
        this.setChanged();
    },
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    statics: {
        /********************************************************************************      
         * @override
         * This static function creates a new Intermediate step MODEL using the information 
         * provided as a JSON
         * @param jsonData, the data for the Intermediate step model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.IntermediateDataModels.Extract_relevant_features_step');
            if (jsonData['used_data']) {
                var used_data_JSON_list = jsonData['used_data'];
                delete jsonData['used_data'];
                model.used_data = used_data_JSON_list;
            }
            model.set(jsonData);
            return model;
        }
    },
    /********************************************************************************      
     * This function...
     * @return 
     ********************************************************************************/
//    getJSONforGraph: function() {
//        var _parents_id = this.getPreviousSteps();
//        var json_data =
//                {
//                    id: this.get('step_id'),
//                    title: "Relevant features extraction step" + (this.getName() != null ? "\n" + this.getName().substring(0, 20) + (this.getName().length > 21 ? "..." : "") : ""),
//                    nodeType: "Intermediate_step",
//                    summary: "TODO",
//                    parents_id: _parents_id
//                };
//        return json_data;
//    },
    /********************************************************************************      
     * This function...
     * @param previous_step
     * @return 
     ********************************************************************************/
    isValidPreviousStepType: function (previous_step) {
    }
});


Ext.define('SL.model.AnalysisModels.IntermediateDataModels.Mapping_step', {
    extend: 'SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from Intermediate_data     
        // step_id, , type, intermediate_data_type, step_number, submission_date, 
        // last_edition_date, software, software_version, software_configuration, 
        // motivation, results, files_location
        {name: 'intermediate_data_type', defaultValue: 'mapping_step'},
        {name: 'genome_specie'},
        {name: 'genome_version'},
        {name: 'genome_source'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getGenomeSpecie: function () {
        return this.get('genome_specie');
    },
    setGenomeSpecie: function (genome_specie) {
        this.set('genome_specie', genome_specie);
        this.setChanged();
    },
    getGenomeVersion: function () {
        return this.get('genome_version');
    },
    setGenomeVersion: function (genome_version) {
        this.set('genome_version', genome_version);
        this.setChanged();
    },
    getGenomeSource: function () {
        return this.get('genome_source');
    },
    setGenomeSource: function (genome_source) {
        this.set('genome_source', genome_source);
        this.setChanged();
    },
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    statics: {
        /**BC********************************************************************
         * @Override
         * This static function creates a new Intermediate step MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData the data for the Intermediate step model in JSON format
         * @return the model with the loaded data    
         *EC********************************************************************/
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.IntermediateDataModels.Mapping_step');
            if (jsonData['used_data']) {
                var used_data_JSON_list = jsonData['used_data'];
                delete jsonData['used_data'];
                model.used_data = used_data_JSON_list;
            }
            model.set(jsonData);
            return model;
        }
    },
    /**BC********************************************************************
     * This function...
     *  
     * @return 
     ********************************************************************************/
//    getJSONforGraph: function() {
//        var _parents_id = this.getPreviousSteps();
//        var json_data =
//                {
//                    id: this.get('step_id'),
//                    title: "Mapping step" + (this.getName() != null ? "\n" + this.getName().substring(0, 20) + (this.getName().length > 21 ? "..." : "") : ""),
//                    nodeType: "Intermediate_step",
//                    summary: "TODO",
//                    parents_id: _parents_id
//                };
//
//        return json_data;
//    },
    /**BC********************************************************************
     * This function...
     *  
     * @param  previous_step
     * @return 
     *EC********************************************************************/
    isValidPreviousStepType: function (previous_step) {
    }
});


Ext.define('SL.model.AnalysisModels.IntermediateDataModels.Preprocessing_step', {
    extend: 'SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from Intermediate_data     
        // step_id, , type, intermediate_data_type, step_number, submission_date, 
        // last_edition_date, software, software_version, software_configuration, 
        // motivation, results, files_location
        {name: 'intermediate_data_type', defaultValue: 'preprocessing_step'},
        {name: 'preprocessing_type'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getPreprocessingType: function () {
        return this.get('preprocessing_type');
    },
    setPreprocessingType: function (preprocessing_type) {
        this.set('preprocessing_type', preprocessing_type);
        this.setChanged();
    },
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    statics: {
        /**BC********************************************************************
         * @Override
         * This static function creates a new Intermediate step MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData the data for the Intermediate step model in JSON format
         * @return the model with the loaded data    
         *EC********************************************************************/
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.IntermediateDataModels.Preprocessing_step');
            if (jsonData['used_data']) {
                var used_data_JSON_list = jsonData['used_data'];
                delete jsonData['used_data'];
                model.used_data = used_data_JSON_list;
            }
            model.set(jsonData);
            return model;
        }
    },
    /**BC********************************************************************
     * This function...
     *  
     * @return 
     *EC********************************************************************/
//    getJSONforGraph: function() {
//        var _parents_id = this.getPreviousSteps();
//        var json_data =
//                {
//                    id: this.get('step_id'),
//                    title: "Preprocessing step" + (this.getName() != null ? "\n" + this.getName().substring(0, 20) + (this.getName().length > 21 ? "..." : "") : ""),
//                    nodeType: "Intermediate_step",
//                    summary: "TODO",
//                    parents_id: _parents_id
//                };
//        return json_data;
//    },
    /**BC********************************************************************
     * This function...
     *  
     * @param  previous_step
     * @return 
     *EC********************************************************************/
    isValidPreviousStepType: function (previous_step) {
    }
});

Ext.define('SL.model.AnalysisModels.IntermediateDataModels.Smoothing_step', {
    extend: 'SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from Intermediate_data     
        // step_id, , type, intermediate_data_type, step_number, submission_date, 
        // last_edition_date, software, software_version, software_configuration, 
        // motivation, results, files_location
        {name: 'intermediate_data_type', defaultValue: 'smoothing_step'},
        {name: 'sliding_window_length'},
        {name: 'steps_length'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getSlidingWindowLength: function () {
        return this.get('sliding_window_length');
    },
    setSlidingWindowLength: function (sliding_window_length) {
        this.set('sliding_window_length', sliding_window_length);
        this.setChanged();
    },
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    statics: {
        /**BC********************************************************************
         * @Override
         * This static function creates a new Intermediate step MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the Intermediate step model in JSON format
         * @return the model with the loaded data    
         *EC********************************************************************/
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.IntermediateDataModels.Smoothing_step');
            if (jsonData['used_data']) {
                var used_data_JSON_list = jsonData['used_data'];
                delete jsonData['used_data'];
                model.used_data = used_data_JSON_list;
            }
            model.set(jsonData);
            return model;
        }
    },
    /**BC********************************************************************
     * This function...
     *  
     * @return 
     *EC********************************************************************/
//    getJSONforGraph: function() {
//        var _parents_id = this.getPreviousSteps();
//        var json_data =
//                {
//                    id: this.get('step_id'),
//                    title: "Smoothing step" + (this.getName() != null ? "\n" + this.getName().substring(0, 20) + (this.getName().length > 21 ? "..." : "") : ""),
//                    nodeType: "Intermediate_step",
//                    summary: "TODO",
//                    parents_id: _parents_id
//                };
//        return json_data;
//    },
    /**BC********************************************************************
     * This function...
     *  
     * @param  previous_step
     * @return 
     *EC********************************************************************/
    isValidPreviousStepType: function (previous_step) {
    }
});


Ext.define('SL.model.AnalysisModels.IntermediateDataModels.Union_step', {
    extend: 'SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from Intermediate_data     
        // step_id, , type, intermediate_data_type, step_number, submission_date, 
        // last_edition_date, software, software_version, software_configuration, 
        // motivation, results, files_location
        {name: 'intermediate_data_type', defaultValue: 'union_step'}
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
        loadFromJSON: function (jsonData) {
            /**BC********************************************************************
             * @Override
             * This static function creates a new Intermediate step MODEL using the information 
             * provided as a JSON
             *  
             * @param jsonData, the data for the Intermediate step model in JSON format
             * @return the model with the loaded data    
             *EC********************************************************************/
            var model = Ext.create('SL.model.AnalysisModels.IntermediateDataModels.Union_step');
            if (jsonData['used_data']) {
                var used_data_JSON_list = jsonData['used_data'];
                delete jsonData['used_data'];
                model.used_data = used_data_JSON_list;
            }
            model.set(jsonData);
            return model;
        }
    },
    /**BC********************************************************************
     * This function...
     *  
     * @return 
     *EC********************************************************************/
//    getJSONforGraph: function() {
//        var _parents_id = this.getPreviousSteps();
//        var json_data =
//                {
//                    id: this.get('step_id'),
//                    title: "Union step" + (this.getName() != null ? "\n" + this.getName().substring(0, 20) + (this.getName().length > 21 ? "..." : "") : ""),
//                    nodeType: "Intermediate_step",
//                    summary: "TODO",
//                    parents_id: _parents_id
//                };
//
//        return json_data;
//    },
    /**BC********************************************************************
     * This function...
     *  
     * @param  previous_step
     * @return 
     *EC********************************************************************/
    isValidPreviousStepType: function (previous_step) {
    }

});