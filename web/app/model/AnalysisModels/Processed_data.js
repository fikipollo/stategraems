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
 *   - Processed_data model
 *   - Calling_step model (EXTENDS Processed_data)
 *   - Data_matrix_step model (EXTENDS Processed_data)
 *   - Merging_step model (EXTENDS Processed_data)
 *   - Quantification_step model (EXTENDS Processed_data)
 *   - Region_step model (EXTENDS Processed_data)
 *   - Region_calling_step model (EXTENDS Region_step)
 *   - Region_consolidation_step model (EXTENDS Region_step)
 *   - Region_intersection_step model (EXTENDS Region_step)
 *   - 
 */
Ext.define('SL.model.AnalysisModels.Processed_data', {
    extend: 'Ext.data.Model',
    //Extends the Observable class
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        {name: 'step_id'},
        {name: 'step_name'},
        {name: 'analysis_type'},
        {name: 'processed_data_type'},
        {name: 'software'},
        {name: 'software_version'},
        {name: 'software_configuration'},
        {name: 'results'},
        {name: 'files_location'},
        {name: 'submission_date', convert: function (v, rec) {
                return rec.dateConversion(v);
            }},
        {name: 'last_edition_date', convert: function (v, rec) {
                return rec.dateConversion(v);
            }}
    ],
    step_owners: null,
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getID: function () {
        return this.get('step_id');
    },
    setID: function (step_id) {
        this.set('step_id', step_id);
        this.setChanged();
    },
    getName: function () {
        return this.get('step_name');
    },
    setName: function (stepName) {
        this.set('step_name', stepName);
        this.setChanged();
    },
    getAnalysisType: function () {
        return this.get('analysis_type');
    },
    setAnalysisType: function (analysis_type) {
        this.set('analysis_type', analysis_type);
        this.setChanged();
    },
    getType: function () {
        return "processed_data";
    },
    setType: function (analysis_type) {
        this.set('analysis_type', analysis_type);
        this.setChanged();
    },
    getProcessedDataType: function () {
        return this.get('processed_data_type');
    },
    setProcessedDataType: function (processedDataType) {
        this.set('processed_data_type', processedDataType);
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
    getResults: function () {
        return this.get('results');
    },
    setResults: function (results) {
        this.set('results', results);
        this.setChanged();
    },
    getFileLocation: function () {
        return this.get('files_location');
    },
    setFileLocation: function (fileLocation) {
        this.set('files_location', fileLocation);
        this.setChanged();
    },
    getSubmissionDate: function () {
        return this.get('submission_date');
    },
    setSubmissionDate: function (submission_date) {
        this.set('submission_date', submission_date);
        this.setChanged();
    },
    getLastEditionDate: function () {
        return this.get('last_edition_date');
    },
    setLastEditionDate: function (last_edition_date) {
        this.set('last_edition_date', last_edition_date);
        this.setChanged();
    },
    getOwners: function () {
        if (this.step_owners == null) {
            this.step_owners = [];
        }
        return this.step_owners;
    },
    setOwners: function (step_owners) {
        this.step_owners = step_owners;
        this.setChanged();
    },
    addOwner: function (newOwner) {
        if (typeof newOwner === "string") {
            var newOwnerID = newOwner;
            newOwner = Ext.create('SL.model.User');
            newOwner.setID(newOwnerID);
        }
        this.getOwners().push(newOwner);
        this.setChanged();
    },
    isOwner: function (anUser) {
        if (typeof anUser === "string") {
            var owners = this.getOwners();
            for (var i in owners) {
                if (owners[i].getID() === anUser) {
                    return true;
                }
            }
            return false;
        } else {
            //TODO: WORKS?
            return this.getOwners().indexOf(anUser) !== -1;
        }
    },
    getPreviousSteps: function () {
        if (this.used_data == null) {
            this.used_data = [];
        }
        return this.used_data;
    },
    setPreviousSteps: function (step_list) {
        this.clearPreviousSteps();
        var me = this;
        Ext.Array.each(step_list, function (item) {
            me.addPreviousStep(item);
        });
        this.setChanged();
    },
    setPreviousStepsIDs: function (stepID_list) {
        this.clearPreviousSteps();
        for (var i in stepID_list) {
            this.getPreviousSteps().push(stepID_list[i]);
        }
        this.setChanged();
    },
    addPreviousStep: function (previous_step) {
        if (Ext.Array.indexOf(this.getPreviousSteps(), previous_step.get('step_id')) === -1) {
            this.getPreviousSteps().push(previous_step.get('step_id'));
        }
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
    updateIDPrefix: function (previousIDPrefix, newIDPrefix) {
        this.setID(this.getID().replace(previousIDPrefix, newIDPrefix));
        //UPDATE THE ID FOR ALL THE USED STEPS
        if (this.getPreviousSteps !== undefined) {
            var previousSteps = this.getPreviousSteps();
            var newPreviousSteps = [];
            for (var i = 0; i < previousSteps.length; i++) {
                newPreviousSteps.push(previousSteps[i].replace(previousIDPrefix, newIDPrefix));
            }
            this.setPreviousStepsIDs(newPreviousSteps);
        }

        var qualityReport = this.getAssociatedQualityReport();
        if (qualityReport != null) {
            qualityReport.setStudiedStepID(this.getID());
        }
    },
    getAssociatedQualityReport: function () {
        return this.qualityReport;
    },
    setAssociatedQualityReport: function (qualityReport) {
        if (qualityReport == null) {
            return;
        }
        this.qualityReport = qualityReport;
        qualityReport.set('studied_step_id', this.get('step_id'));
    },
    isRegionDefinitionStep: function () {
        return (this instanceof SL.model.AnalysisModels.Region_consolidation_step) || (this instanceof SL.model.AnalysisModels.Region_intersection_step);
    },
    isQuantificationStep: function () {
        return (this instanceof SL.model.AnalysisModels.Quantification_step);
    },
    isRegionCallingStep: function () {
        return (this instanceof SL.model.AnalysisModels.Region_calling_step);
    },
    /**
     *  This function clones this object.
     *  First convert the current object to JSON string and then return the new instance
     *  using the loadFromJSON function (the object is converted first to String because
     *  if not, all the arrays should be cloned and code becomes hard, this a trick).
     *  
     *  @return a copy for the current object.
     */
    clone: function () {
        var newInstance = this.toSimpleJSON();
        //THIS IS NECCESSARY TO BE SURE THAT ALL THE ARRAYS ARE NEW OBJECTS 
        //IF NOT, THE USED DATA ARRAY IN INTERMEDIATE STEPS IS SHARED BETWEEN OBJECTS
        newInstance = Ext.encode(newInstance);
        newInstance = Ext.decode(newInstance);
        newInstance = SL.model.AnalysisModels.Processed_data.loadFromJSON(newInstance);
        return newInstance;
    },
    statics: {
        /********************************************************************************      
         * This static function creates a new Processed_data MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the Processed_data model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function (jsonData) {
            var model = null;
            switch (jsonData['processed_data_type'])
            {
                case 'merging_step':
                    model = SL.model.AnalysisModels.Merging_step.loadFromJSON(jsonData);
                    break;
                case 'proteomics_msquantification_step':
                    model = SL.model.AnalysisModels.Proteomics_msquantification_step.loadFromJSON(jsonData);
                    break;
                case 'calling_step':
                    model = SL.model.AnalysisModels.Calling_step.loadFromJSON(jsonData);
                    break;
                case 'quantification_step':
                    model = SL.model.AnalysisModels.Quantification_step.loadFromJSON(jsonData);
                    break;
                case 'region_calling_step':
                    model = SL.model.AnalysisModels.Region_calling_step.loadFromJSON(jsonData);
                    break;
                case 'region_consolidation_step':
                    model = SL.model.AnalysisModels.Region_consolidation_step.loadFromJSON(jsonData);
                    break;
                case 'region_intersection_step':
                    model = SL.model.AnalysisModels.Region_intersection_step.loadFromJSON(jsonData);
                    break;
                default:
                    return null;
                    break;
            }

            if (jsonData['step_owners'] != null) {
                var owners = [];
                var owners_JSON_list = jsonData['step_owners'];
                delete jsonData['step_owners'];

                for (var i in owners_JSON_list) {
                    owners.push(Ext.create('SL.model.User', owners_JSON_list[i]));
                }
                model.setOwners(owners);
            }

            return model;
        }
    },
    getJSONforGraph: function () {
        var _parents_id = this.getPreviousSteps();


        var json_data = {
            id: this.get('step_id'),
            name: (this.getName() != null ? this.getName() : ""),
            type: this.get('processed_data_type'),
            nodeType: 'Processed_data',
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
    /********************************************************************************  
     * This function check if the Processed_data model is valid:
     * @return  True is everything is OK, an  String with the error message in other case.
     *********************************************************************************/
    isValid: function () {
        var ERROR_MESSAGE = "";
        var errors = this.validate();
        if (!errors.isValid()) {
            errors.each(function (item) {
                ERROR_MESSAGE += "</br>-  Processed data step metadata error:   Field " + item.field + " " + item.message;
            });
        };
        if (this.getPreviousSteps().length === 0) {
            ERROR_MESSAGE += "</br> Processed data MUST have 1 or more associated previous steps.";
        }
        return (ERROR_MESSAGE === "" ? true : ERROR_MESSAGE);
    },
    dateConversion: function (v) {
        if (v == null || v.length < 8) {
            return "";
        }
        if (v instanceof Date) {
            var formatNumber = function (number, length) {
                var str = '' + number;
                while (str.length < length) {
                    str = '0' + str;
                }
                return str;
            };
            v = v.getFullYear() + "/" + (formatNumber(v.getMonth() + 1, 2)) + "/" + formatNumber(v.getDate(), 2);
            return v;
        }
        if (v.indexOf("/") === -1)
            return v.slice(0, 4) + "/" + v.slice(4, 6) + "/" + v.slice(6, 8);
        else
            return v;
    }
});

Ext.define('SL.model.AnalysisModels.Calling_step', {
    extend: 'SL.model.AnalysisModels.Processed_data',
    fields: [
        //Inherited from Processed_data
        // step_id, step_name, analysis_type, processed_data_type, software, 
        // software_version, software_configuration, results, files_location, 
        // submission_date, last_edition_date
        {name: 'processed_data_type', defaultValue: 'calling_step'}],
    statics: {
        /********************************************************************************      
         * This static function creates a new Processed_data MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the Processed_data step model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.Calling_step');
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
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/

    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    isValidPreviousStepType: function (previous_step) {
        var currentType = "Features calling steps";
        var acceptedTypes = "Mapping steps";
        var acceptedTypes_aliases = ["mapping_step"];

        if (previous_step instanceof SL.model.AnalysisModels.Processed_data) {
            return "</br>   -	<i>Processed Data</i> can not be used for <i>" + currentType + "</i>.</br> <i>" + currentType + "</i> need a previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        }

        var type = previous_step.get('type');
        var subtype = previous_step.get('intermediate_data_type');

        if (type === "rawdata") {
            return "</br>   -	<i>Raw data</i> can not be used for <i>" + currentType + "</i>directly.</br> <i>" + currentType + "</i> need a previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        } else if (acceptedTypes_aliases.indexOf(subtype) === -1 && previous_step.get('intermediate_data_type') !== "preprocessing_step") {
            return "</br>   -	<i>" + currentType + "</i> can be only carried out over previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        } else if (previous_step.get('intermediate_data_type') === "preprocessing_step") {/* TODO:CHECK THIS*/
        }
        return true;
    },
//    getJSONforGraph: function () {
//        var _parents_id = this.getPreviousSteps();
//        //TODO: IF WE WILL HAVE MORE THAN 1 PROCESSED DATA THE PROCESSED DATA ID WILL NOT BE step_id 
//        var json_data =
//                {
//                    id: this.getID(),
//                    title: "Calling" + (this.getName() != null ? "\n" + this.getName().substring(0, 20) + (this.getName().length > 21 ? "..." : "") : ""),
//                    nodeType: "Processed_data",
//                    summary: "TODO",
//                    parents_id: _parents_id
//                };
//        return json_data;
//    }
});

Ext.define('SL.model.AnalysisModels.Data_matrix_step', {
    extend: 'SL.model.AnalysisModels.Processed_data',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from Processed_data
        // step_id, step_name, analysis_type, processed_data_type, software, 
        // software_version, software_configuration, results, files_location, 
        // submission_date, last_edition_date
        {name: 'processed_data_type', defaultValue: 'data_matrix'}],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getPreviousSteps: function () {
        if (this.unified_data == null) {
            this.unified_data = [];
        }
        return this.unified_data;
    },
    clearPreviousSteps: function () {
        if (this.unified_data == null) {
            this.unified_data = [];
        } else {
            this.unified_data.length = 0;
        }
        this.setChanged();
        return this.unified_data;
    },
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    statics: {
        /********************************************************************************      
         * This static function creates a new Processed_data MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the Processed_data step model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.Data_matrix_step');

            if (jsonData['unified_data']) {
                var used_data_JSON_list = jsonData['unified_data'];
                delete jsonData['unified_data'];
                model.unified_data = used_data_JSON_list;
            }
            model.set(jsonData);
            return model;
        }
    },
//    getJSONforGraph: function () {
//        var _parents_id = this.getPreviousSteps();
//        var json_data =
//                {
//                    id: this.getID(),
//                    title: "Data Matrix" + (this.getName() != null ? "\n" + this.getName().substring(0, 20) + (this.getName().length > 21 ? "..." : "") : ""),
//                    nodeType: "Processed_data",
//                    summary: "TODO",
//                    parents_id: _parents_id
//                };
//
//        return json_data;
//    },
    toSimpleJSON: function () {
        var JSON_DATA = this.data;
        //MERGE THE OBJECT
        JSON_DATA["unified_data"] = this.getPreviousSteps();
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
    }

});

Ext.define('SL.model.AnalysisModels.Merging_step', {
    extend: 'SL.model.AnalysisModels.Processed_data',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from Processed_data
        // step_id, step_name, analysis_type, processed_data_type, software, 
        // software_version, software_configuration, results, files_location, 
        // submission_date, last_edition_date
        {name: 'processed_data_type', defaultValue: 'merging_step'}],
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
        /********************************************************************************      
         * This static function creates a new Processed_data MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the Processed_data step model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.Merging_step');
            if (jsonData['used_data']) {
                var used_data_JSON_list = jsonData['used_data'];
                delete jsonData['used_data'];
                model.used_data = used_data_JSON_list;
            }
            model.set(jsonData);
            return model;
        }
    },
    isValidPreviousStepType: function (previous_step) {
        var currentType = "Merging steps";
        var acceptedTypes = "Relevant Features Extraction steps";
        var acceptedTypes_aliases = ["extract_relevant_features_step"];
        if (previous_step instanceof SL.model.AnalysisModels.Processed_data) {
            return "</br>   -	<i>Processed Data</i> can not be used for <i>" + currentType + "</i>.</br> <i>" + currentType + "</i> need a previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        }

        var type = previous_step.get('type');
        var subtype = previous_step.get('intermediate_data_type');

        if (type === "rawdata") {
            return "</br>   -	<i>Raw data</i> can not be used for <i>" + currentType + "</i>directly.</br> <i>" + currentType + "</i> need a previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        } else if (acceptedTypes_aliases.indexOf(subtype) === -1 && previous_step.get('intermediate_data_type') !== "preprocessing_step") {
            return "</br>   -	<i>" + currentType + "</i> can be only carried out over previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        } else if (previous_step.get('intermediate_data_type') === "preprocessing_step")
        {/* TODO:CHECK THIS*/
        }
        return true;
    }
//    getJSONforGraph: function () {
//        var _parents_id = this.getPreviousSteps();
//        var json_data =
//                {
//                    id: this.getID(),
//                    title: "Merging" + (this.getName() != null ? "\n" + this.getName().substring(0, 20) + (this.getName().length > 21 ? "..." : "") : ""),
//                    nodeType: "Processed_data",
//                    summary: "TODO",
//                    parents_id: _parents_id
//                };
//
//        return json_data;
//    }
});

Ext.define('SL.model.AnalysisModels.Quantification_step', {
    extend: 'SL.model.AnalysisModels.Processed_data',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from Processed_data
        // step_id, step_name, analysis_type, processed_data_type, software, 
        // software_version, software_configuration, results, files_location, 
        // submission_date, last_edition_date
        {name: 'processed_data_type', defaultValue: 'quantification_step'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getPreviousSteps: function () {
        if (this.used_data == null) {
            this.used_data = [];
        } else {
            //TODO: TEMPORAL CODE TO SOLVE A UNKNOWN PROBLEM WITH QUANTIFICATION STEPS -> THE REGIONS ARE ADDED AS USED FILES
            for (var i = this.used_data.length - 1; i >= 0; i--) {
                if (this.used_data[i].indexOf("ST") === -1) {
                    this.used_data.splice(i, 1);
                }
            }
        }
        return this.used_data;
    },
    addReferenceRegion: function (reference_region) {
        this.getReferenceRegions().push(reference_region);
        this.setChanged();
    },
    getReferenceRegions: function () {
        if (this.reference_region == null) {
            this.reference_region = [];
        }
        return this.reference_region;
    },
    clearReferenceRegions: function () {
        if (this.reference_region == null) {
            this.reference_region = [];
        } else {
            this.reference_region.length = 0;
        }
        this.setChanged();
        return this.reference_region;
    },
    setReferenceRegions: function (reference_region_list) {
        this.reference_region = reference_region_list;
        this.setChanged();
    },
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    statics: {
        /**BC********************************************************************
         * This static function creates a new Processed_data MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the Processed_data step model in JSON format
         * @return the model with the loaded data    
         *EC********************************************************************/
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.Quantification_step');
            if (jsonData['used_data']) {
                var used_data_JSON_list = jsonData['used_data'];
                delete jsonData['used_data'];
                model.used_data = used_data_JSON_list;
            }

            if (jsonData['reference_region']) {
                var used_data_JSON_list = jsonData['reference_region'];
                delete jsonData['reference_region'];
                model.reference_region = used_data_JSON_list;
            }
            model.set(jsonData);
            return model;
        }
    },
    isValidPreviousStepType: function (previous_step) {
        var currentType = "Quantification steps";
        var acceptedTypes = "Mapping steps";
        var acceptedTypes_aliases = ["mapping_step"];

        if (previous_step instanceof SL.model.AnalysisModels.Processed_data) {
            return "</br>   -	<i>Processed Data</i> can not be used for <i>" + currentType + "</i>.</br> <i>" + currentType + "</i> need a previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        }

        var type = previous_step.get('type');
        var subtype = previous_step.get('intermediate_data_type');

        if (type === "rawdata") {
            return "</br>   -	<i>Raw data</i> can not be used for <i>" + currentType + "</i>directly.</br> <i>" + currentType + "</i> need a previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        } else if (acceptedTypes_aliases.indexOf(subtype) === -1 && previous_step.get('intermediate_data_type') !== "preprocessing_step") {
            return "</br>   -	<i>" + currentType + "</i> can be only carried out over previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        } else if (previous_step.get('intermediate_data_type') === "preprocessing_step") {/* TODO:CHECK THIS*/
        }

        return true;
    },
    getJSONforGraph: function () {
        var _parents_id = [].concat(this.getPreviousSteps());

        var json_data = [];
        var reference_regions = this.getReferenceRegions();
        for (var i in reference_regions) {
            var title = "";
            var nodeType = "";
            if (reference_regions[i].region_step_id != null) {
                title = "Resulting regions </br>from Analysis " + reference_regions[i].region_step_id;
                nodeType = "other_processed_data";
            } else {
                title = "External regions file" + (reference_regions[i].region_name != null ? "\n" + reference_regions[i].region_name.substring(0, 20) + (reference_regions[i].region_name.length > 21 ? "..." : "") : "");
                nodeType = "external_source";
            }

            json_data.push({
                id: this.getID().replace("ST", "R") + "#" + i,
                name: title,
                type: "Reference region",
                nodeType: nodeType,
                summary: "TODO",
                parents_id: []
            });
            _parents_id.push(this.getID().replace("ST", "R") + "#" + i);
        }

        json_data.push({
            id: this.get('step_id'),
            name: (this.getName() != null ? this.getName() : ""),
            type: this.get('processed_data_type'),
            nodeType: 'Processed_data',
            summary: "TODO",
            parents_id: _parents_id
        });

        return json_data;
    },
    toSimpleJSON: function () {
        var JSON_DATA = this.data;
        //MERGE THE OBJECT
        JSON_DATA["used_data"] = this.getPreviousSteps();
        JSON_DATA["reference_region"] = this.getReferenceRegions();
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
    }
});

Ext.define('SL.model.AnalysisModels.Region_step', {
    extend: 'SL.model.AnalysisModels.Processed_data'
});

Ext.define('SL.model.AnalysisModels.Region_calling_step', {
    extend: 'SL.model.AnalysisModels.Region_step',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from Processed_data
        // step_id, step_name, analysis_type, processed_data_type, software, 
        // software_version, software_configuration, results, files_location, 
        // submission_date, last_edition_date
        {name: 'processed_data_type', defaultValue: 'region_calling_step'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    addReferenceRegion: function (reference_region) {
        this.getReferenceRegions().push(reference_region);
    },
    getReferenceRegions: function () {
        if (this.reference_region == null) {
            this.reference_region = [];
        }
        this.setChanged();
        return this.reference_region;
    },
    clearReferenceRegions: function () {
        if (this.reference_region == null) {
            this.reference_region = [];
        } else {
            this.reference_region.length = 0;
        }
        this.setChanged();
        return this.reference_region;
    },
    setReferenceRegions: function (reference_region_list) {
        this.reference_region = reference_region_list;
        this.setChanged();
    },
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    statics: {
        /********************************************************************************      
         * This static function creates a new Processed_data MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the Processed_data step model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.Region_calling_step');
            if (jsonData['used_data']) {
                var used_data_JSON_list = jsonData['used_data'];
                delete jsonData['used_data'];
                model.used_data = used_data_JSON_list;
            }

            if (jsonData['reference_region']) {
                var used_data_JSON_list = jsonData['reference_region'];
                delete jsonData['reference_region'];
                model.reference_region = used_data_JSON_list;
            }

            model.set(jsonData);
            return model;
        }
    },
    isValidPreviousStepType: function (previous_step) {
        var currentType = "Region Calling steps";
        var acceptedTypes = "Mapping steps or Smoothing steps";
        var acceptedTypes_aliases = ["mapping_step", "smoothing_step"];

        if (previous_step instanceof SL.model.AnalysisModels.Processed_data) {
            return "</br>   -	<i>Processed Data</i> can not be used for <i>" + currentType + "</i>.</br> <i>" + currentType + "</i> need a previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        }

        var type = previous_step.get('type');
        var subtype = previous_step.get('intermediate_data_type');

        if (type === "rawdata") {
            return "</br>   -	<i>Raw data</i> can not be used for <i>" + currentType + "</i>directly.</br> <i>" + currentType + "</i> need a previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        } else if (acceptedTypes_aliases.indexOf(subtype) === -1 && previous_step.get('intermediate_data_type') !== "preprocessing_step") {
            return "</br>   -	<i>" + currentType + "</i> can be only carried out over previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        } else if (previous_step.get('intermediate_data_type') === "preprocessing_step") {/* TODO:CHECK THIS*/
        }

        return true;

    },
    getJSONforGraph: function () {
        var _parents_id = [].concat(this.getPreviousSteps());

        var json_data = [];
        var reference_regions = this.getReferenceRegions();
        for (var i in reference_regions) {
            var title = "";
            var nodeType = "";
            if (reference_regions[i].region_step_id != null) {
                title = "Resulting regions \nfrom Analysis " + reference_regions[i].region_step_id;
                nodeType = "other_processed_data";
            } else {
                title = "External regions file" + (reference_regions[i].region_name != null ? "\n" + reference_regions[i].region_name.substring(0, 20) + (reference_regions[i].region_name.length > 21 ? "..." : "") : "");
                nodeType = "external_source";
            }
            json_data.push({
                id: this.getID().replace("ST", "R") + "#" + i,
                name: title,
                type: "Region",
                nodeType: nodeType,
                summary: "TODO",
                parents_id: []
            });
            _parents_id.push(this.getID().replace("ST", "R") + "#" + i);
        }

        json_data.push({
            id: this.get('step_id'),
            name: (this.getName() != null ? this.getName() : ""),
            type: this.get('processed_data_type'),
            nodeType: 'Processed_data',
            summary: "TODO",
            parents_id: _parents_id
        });
        return json_data;
    },
    toSimpleJSON: function () {
        var JSON_DATA = this.data;
        //MERGE THE OBJECT
        JSON_DATA["used_data"] = this.getPreviousSteps();
        JSON_DATA["reference_region"] = this.getReferenceRegions();
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
    }

});

Ext.define('SL.model.AnalysisModels.Region_consolidation_step', {
    extend: 'SL.model.AnalysisModels.Region_step',
    fields: [
        //Inherited from Processed_data
        // step_id, step_name, analysis_type, processed_data_type, software, 
        // software_version, software_configuration, results, files_location, 
        // submission_date, last_edition_date
        {name: 'processed_data_type', defaultValue: 'region_consolidation_step'},
        {name: 'motivation'}
    ],
    statics: {
        /********************************************************************************      
         * This static function creates a new Processed_data MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the Processed_data step model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.Region_consolidation_step');

            if (jsonData['consolidated_data']) {
                var used_data_JSON_list = jsonData['consolidated_data'];
                delete jsonData['consolidated_data'];
                model.consolidated_data = used_data_JSON_list;
            }
            model.set(jsonData);
            return model;
        }
    },
    addPreviousStep: function (previous_step) {
        this.getPreviousSteps().push(previous_step);
        this.setChanged();
    },
    getPreviousSteps: function () {
        if (this.consolidated_data == null) {
            this.consolidated_data = [];
        }
        return this.consolidated_data;
    },
    clearPreviousSteps: function () {
        if (this.consolidated_data == null) {
            this.consolidated_data = [];
        } else {
            this.consolidated_data.length = 0;
        }
        this.setChanged();
        return this.consolidated_data;
    },
    setPreviousSteps: function (previous_step_list) {
        this.consolidated_data = previous_step_list;
        this.setChanged();
    },
    isValidPreviousStepType: function (previous_step) {
        return true;
    },
    getJSONforGraph: function () {
        var json_data = [];
        var _parents_id = [];
        var consolidated_data = this.getPreviousSteps();
        for (var i in consolidated_data) {
            var title = "";
            var nodeType = "";
            if (consolidated_data[i].region_step_id != null) {
                title = "Resulting regions \nfrom Analysis " + consolidated_data[i].region_step_id;
                nodeType = "other_processed_data";
            } else {
                title = "External regions file";
                nodeType = "external_source";
            }
            json_data.push({
                id: this.getID().replace("ST", "R") + "#" + i,
                name: title,
                type: "Region",
                nodeType: nodeType,
                summary: "TODO",
                parents_id: []
            });
            _parents_id.push(this.getID().replace("ST", "R") + "#" + i);
        }

        json_data.push({
            id: this.get('step_id'),
            name: (this.getName() != null ? this.getName() : ""),
            type: this.get('processed_data_type'),
            nodeType: 'Processed_data',
            summary: "TODO",
            parents_id: _parents_id
        });
        return json_data;
    },
    toSimpleJSON: function () {
        var JSON_DATA = this.data;
        //MERGE THE OBJECT
        JSON_DATA["consolidated_data"] = this.getPreviousSteps();
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
    }

});

Ext.define('SL.model.AnalysisModels.Region_intersection_step', {
    extend: 'SL.model.AnalysisModels.Region_step',
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        //Inherited from Processed_data
        // step_id, step_name, analysis_type, processed_data_type, software, 
        // software_version, software_configuration, results, files_location, 
        // submission_date, last_edition_date
        {name: 'processed_data_type', defaultValue: 'region_intersection_step'},
        {name: 'motivation'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    addPreviousStep: function (previous_step) {
        this.getPreviousSteps().push(previous_step);
        this.setChanged();
    },
    getPreviousSteps: function () {
        if (this.intersected_data == null) {
            this.intersected_data = [];
        }
        return this.intersected_data;
    },
    clearPreviousSteps: function () {
        if (this.consolidated_data == null) {
            this.consolidated_data = [];
        } else {
            this.consolidated_data.length = 0;
        }
        this.setChanged();
        return this.consolidated_data;
    },
    setPreviousSteps: function (previous_step_list) {
        this.intersected_data = previous_step_list;
        this.setChanged();
    },
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    statics: {
        /********************************************************************************      
         * This static function creates a new Processed_data MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the Processed_data step model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.Region_intersection_step');

            if (jsonData['intersected_data']) {
                var used_data_JSON_list = jsonData['intersected_data'];
                delete jsonData['intersected_data'];
                model.intersected_data = used_data_JSON_list;
            }
            model.set(jsonData);
            return model;
        }
    },
    isValidPreviousStepType: function (previous_step) {
        return true;
    },
    getJSONforGraph: function () {
        var json_data = [];
        var _parents_id = [];
        var intersected_data = this.getPreviousSteps();
        for (var i in intersected_data) {
            var title = "";
            var nodeType = "";
            if (intersected_data[i].region_step_id != null) {
                title = "Resulting regions \nfrom Analysis " + intersected_data[i].region_step_id;
                nodeType = "other_processed_data";
            } else {
                title = "External regions file";
                nodeType = "external_source";
            }
            json_data.push({
                id: this.getID().replace("ST", "R") + "#" + i,
                name: title,
                type: "Region",
                nodeType: nodeType,
                summary: "TODO",
                parents_id: []
            });
            _parents_id.push(this.getID().replace("ST", "R") + "#" + i);
//            
//            json_data.push({
//                id: i,
//                title: title,
//                nodeType: nodeType,
//                summary: "TODO",
//                parents_id: []
//            });
//            _parents_id.push(i);
        }

        json_data.push({
            id: this.get('step_id'),
            name: (this.getName() != null ? this.getName() : ""),
            type: this.get('processed_data_type'),
            nodeType: 'Processed_data',
            summary: "TODO",
            parents_id: _parents_id
        });
        return json_data;
    },
    toSimpleJSON: function () {
        var JSON_DATA = this.data;
        JSON_DATA["intersected_data"] = this.getPreviousSteps();
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
    }
});

Ext.define('SL.model.AnalysisModels.Proteomics_msquantification_step', {
    extend: 'SL.model.AnalysisModels.Processed_data',
    fields: [
        //Inherited from Processed_data
        // step_id, step_name, analysis_type, processed_data_type, files_location, 
        // submission_date, last_edition_date
        //Inherited from Processed_data  NOT USED
        // software, software_version, software_configuration, results, 
        {name: 'processed_data_type', defaultValue: 'proteomics_msquantification_step'},
        //MIAPE MS QUANTIFICATION FIELDS
        {name: 'groups'},
        {name: 'replicates'},
        {name: 'labelling_protocol'},
        {name: 'sample_description'},
        {name: 'sample_name'},
        {name: 'sample_amount'},
        {name: 'sample_labelling'},
        {name: 'replicates_and_groups'},
        {name: 'isotopic_correction_coefficients'},
        {name: 'internal_references'},
        {name: 'input_data_type'},
        {name: 'input_data_format'},
        {name: 'input_data_merging'},
        {name: "quantified_data"},
        {name: 'quantification_software'},
        {name: 'selection_method'},
        {name: 'confidence_filter'},
        {name: 'missing_values'},
        {name: 'quantification_values_calculation'},
        {name: 'replicate_aggregation'},
        {name: 'normalization'},
        {name: 'protein_quantification_values_calculation'},
        {name: 'specific_corrections'},
        {name: 'correctness_estimation_methods'},
        {name: 'curves_calibration'},
        {name: 'primary_extracted_quantification_values'},
        {name: 'primary_extracted_quantification_files_location'},
        {name: 'peptide_quantification_values'},
        {name: 'peptide_quantification_files_location'},
        {name: 'raw_quantification_values'},
        {name: 'raw_quantification_files_location'},
        {name: 'transformed_quantification_values'},
        {name: 'transformed_quantification_files_location'},
        //MIAPE MS INFORMATICS FIELDS
        {name: 'msi_responsible_person'},
        {name: 'msi_software'},
        {name: 'msi_customizations'},
        {name: 'msi_software_availability'},
        {name: 'msi_files_description'},
        {name: 'msi_files_location'},
        {name: 'msi_inputdata_description'},
        {name: 'msi_database_queried'},
        {name: 'msi_taxonomical_restrictions'},
        {name: 'msi_tool_description'},
        {name: 'msi_cleavage_agents'},
        {name: 'msi_missed_cleavages'},
        {name: 'msi_cleavage_additional_params'},
        {name: 'msi_permissible_aminoacids_modifications'},
        {name: 'msi_precursorion_tolerance'},
        {name: 'msi_pmf_mass_tolerance'},
        {name: 'msi_thresholds'},
        {name: 'msi_otherparams'},
        {name: 'msi_accession_code'},
        {name: 'msi_protein_description'},
        {name: 'msi_protein_scores'},
        {name: 'msi_validation_status'},
        {name: 'msi_different_peptide_sequences'},
        {name: 'msi_peptide_coverage'},
        {name: 'msi_pmf_matched_peaks'},
        {name: 'msi_other_additional_info'},
        {name: 'msi_sequence'},
        {name: 'msi_peptide_scores'},
        {name: 'msi_chemical_modifications'},
        {name: 'msi_spectrum_locus'},
        {name: 'msi_charge_assumed'},
        {name: 'msi_quantitation_approach'},
        {name: 'msi_quantitation_measurement'},
        {name: 'msi_quantitation_normalisation'},
        {name: 'msi_quantitation_replicates_number'},
        {name: 'msi_quantitation_acceptance'},
        {name: 'msi_quantitation_error_analysis'},
        {name: 'msi_quantitation_control_results'},
        {name: 'msi_interpretation_assessment'},
        {name: 'msi_interpretation_results'},
        {name: 'msi_interpretation_inclusion'}
    ],
    statics: {
        /********************************************************************************      
         * This static function creates a new Processed_data MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the Processed_data step model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.Proteomics_msquantification_step');
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
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/

    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    isValidPreviousStepType: function (previous_step) {
        var currentType = "Features calling steps";
        var acceptedTypes = "Mapping steps";
        var acceptedTypes_aliases = ["mapping_step"];

        if (previous_step instanceof SL.model.AnalysisModels.Processed_data) {
            return "</br>   -	<i>Processed Data</i> can not be used for <i>" + currentType + "</i>.</br> <i>" + currentType + "</i> need a previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        }

        var type = previous_step.get('type');
        var subtype = previous_step.get('intermediate_data_type');

        if (type === "rawdata") {
            return "</br>   -	<i>Raw data</i> can not be used for <i>" + currentType + "</i>directly.</br> <i>" + currentType + "</i> need a previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        } else if (acceptedTypes_aliases.indexOf(subtype) === -1 && previous_step.get('intermediate_data_type') !== "preprocessing_step") {
            return "</br>   -	<i>" + currentType + "</i> can be only carried out over previous <i>" + acceptedTypes + "</i> (or <i>Preprocessing steps</i> derived from <i>" + acceptedTypes + "</i>).";
        } else if (previous_step.get('intermediate_data_type') === "preprocessing_step") {/* TODO:CHECK THIS*/
        }
        return true;
    },
    getJSONforGraph: function () {
        var _parents_id = this.getPreviousSteps();

        var json_data =
                {
                    id: this.getID(),
                    name: (this.getName() != null ? this.getName() : ""),
                    type: "Peptide MS quantification",
                    nodeType: 'Processed_data',
                    summary: "TODO",
                    parents_id: _parents_id
                };
        return json_data;
    }
});