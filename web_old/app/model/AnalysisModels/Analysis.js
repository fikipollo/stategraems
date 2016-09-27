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
 * - Analysis
 */
Ext.define('SL.model.AnalysisModels.Analysis', {
    extend: 'Ext.data.Model',
    //Extends the Observable class
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    requires: ['SL.model.AnalysisModels.RAWDataModels.RAWData', 'SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data', 'SL.model.AnalysisModels.Processed_data'],
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        {name: 'analysis_id'},
        {name: 'analysis_name'},
        {name: 'analysis_type'},
        {name: 'status', defaultValue: 'open'}
    ],
    hasMany: [
        {model: 'SL.model.AnalysisModels.Non_processed_data', name: 'non_processed_data'},
        {model: 'SL.model.AnalysisModels.Processed_data', name: 'processed_data'}
    ],
    validations: [
        {type: 'presence', field: 'analysis_type'},
        {type: 'presence', field: 'status'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getID: function () {
        return this.get('analysis_id');
    },
    setID: function (analysis_id) {
        this.set('analysis_id', analysis_id);
        this.setChanged();
    },
    updateID: function (newAnalysisID) {
        var steps = this.getNonProcessedData();

        var previousIDPrefix = this.getID().replace("AN", "ST");
        var newIDPrefix = newAnalysisID.replace("AN", "ST");
        for (var i = 0; i < steps.getCount(); i++) {
            steps.getAt(i).updateIDPrefix(previousIDPrefix, newIDPrefix);
        }
        steps = this.getProcessedData();
        for (var i = 0; i < steps.getCount(); i++) {
            steps.getAt(i).updateIDPrefix(previousIDPrefix, newIDPrefix);
        }
        this.setID(newAnalysisID);
    },
    getName: function () {
        return this.get('analysis_name');
    },
    setName: function (analysis_name) {
        this.set('analysis_name', analysis_name);
        this.setChanged();
    },
    getAnalysisType: function () {
        return this.get('analysis_type');
    },
    setAnalysisType: function (analysis_type) {
        this.set('analysis_type', analysis_type);
        this.setChanged();
    },
    getNonProcessedData: function () {
        return this.non_processed_data();
    },
    getNonProcessedDataByID: function (stepID) {
        var steps = this.getNonProcessedData();
        var step;
        for (var i = 0; i < steps.getCount(); i++) {
            step = steps.getAt(i);
            //UPDATE ONLY NON IMPORTED STEPS
            if (step.getID() === stepID) {
                return step;
            }
        }
        return null;
    },
    addNonProcessedData: function (nonProcessedDataModel) {
        this.non_processed_data().add(nonProcessedDataModel);
        this.setChanged();
    },
    removeNonProcessedData: function (nonProcessedDataModel) {
        this.non_processed_data().remove(nonProcessedDataModel);
        this.setChanged();
    },
    removeRAWData: function (rawDataModel) {
        if (Ext.getClassName(rawDataModel) !== "SL.model.AnalysisModels.RAWDataModels.RAWData") {
            return;
        }

        this.non_processed_data().each(
                function (nonProcessedDataInstance) {
                    if (nonProcessedDataInstance.removePreviousStep !== undefined) {
                        nonProcessedDataInstance.removePreviousStep(rawDataModel.getID());
                    }
                }
        );
        this.processed_data().each(
                function (processedDataInstance) {
                    if (processedDataInstance.removePreviousStep !== undefined) {
                        processedDataInstance.removePreviousStep(rawDataModel.getID());
                    }
                }
        );
        this.setChanged();
    },
    getProcessedData: function () {
        return this.processed_data();
    },
    addProcessedData: function (processed_data_model) {
        this.processed_data().add(processed_data_model);
        this.setChanged();
    },
    removeProcessedData: function (processedDataModel) {
        this.processed_data().remove(processedDataModel);
        this.setChanged();
    },
    getProcessedDataByID: function (stepID) {
        var steps = this.getProcessedData();
        var step;
        for (var i = 0; i < steps.getCount(); i++) {
            step = steps.getAt(i);
            //UPDATE ONLY NON IMPORTED STEPS
            if (step.getID() === stepID) {
                return step;
            }
        }
        return null;
    },
    getStepByID: function (stepID) {
        var step = this.getNonProcessedDataByID(stepID);
        if (step != null) {
            return step;
        }
        return this.getProcessedDataByID(stepID);
    },
    addStep: function (stepModel) {
        if (stepModel instanceof SL.model.AnalysisModels.Processed_data) {
            this.getProcessedData().add(stepModel);
        } else {
            this.getNonProcessedData().add(stepModel);
        }
        this.setChanged();
    },
    removeStep: function (stepModel) {
        if (stepModel instanceof SL.model.AnalysisModels.Processed_data) {
            this.getProcessedData().remove(stepModel);
        } else {
            this.getNonProcessedData().remove(stepModel);
        }
        this.setChanged();
    },
    getNextStepsByID: function (stepID) {
        var nextStepsList = [];

        this.non_processed_data().each(
                function (nonProcessedDataInstance) {
                    if (nonProcessedDataInstance.getPreviousStep !== undefined && nonProcessedDataInstance.getPreviousSteps().indexOf(stepID) !== -1) {
                        nextStepsList.push(nonProcessedDataInstance);
                    }
                }
        );
        this.processed_data().each(
                function (processedDataInstance) {
                    if (processedDataInstance.getPreviousSteps !== undefined && processedDataInstance.getPreviousSteps().indexOf(stepID) !== -1) {
                        nextStepsList.push(processedDataInstance);
                    }
                }
        );
        return nextStepsList;
    },
    setStepsOwner: function (userID) {
        var steps = this.getNonProcessedData();

        var stepsIDPrefix = this.getID().replace("AN", "ST");
        var step;
        for (var i = 0; i < steps.getCount(); i++) {
            step = steps.getAt(i);
            //UPDATE ONLY NON IMPORTED STEPS
            if (step.getID().indexOf(stepsIDPrefix) !== -1) {
                step.setOwners([]);
                step.addOwner(userID);
            }
        }
        steps = this.getProcessedData();
        for (var i = 0; i < steps.getCount(); i++) {
            step = steps.getAt(i);
            //UPDATE ONLY NON IMPORTED STEPS
            if (step.getID().indexOf(stepsIDPrefix) !== -1) {
                step.setOwners([]);
                step.addOwner(userID);
            }
        }
    },
    getMemento: function () {
        var memento = this.toSimpleJSON();
        memento = Ext.encode(memento);
        return memento;
    },
    restoreFromMemento: function (memento) {
        if (memento !== null) {
            memento = Ext.decode(memento);
            this.non_processed_data().removeAll();
            this.processed_data().removeAll();
            SL.model.AnalysisModels.Analysis.loadFromJSON(memento, this);
            this.setChanged();
        }
    },
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    isRemovableStep: function (toBeRemovedModel) {
        var stepNumber = toBeRemovedModel.get('step_number');
        var stepId = toBeRemovedModel.get('step_id');
        var removable = true;
        //CHECK IF THE STEP IS USED BY LATER STEPS
        this.non_processed_data().each(function (step_model) {
            if (step_model.get('step_number') > stepNumber && step_model.getPreviousSteps !== undefined) {
                if (step_model.getPreviousSteps().indexOf(stepId) !== -1) {
                    removable = false;
                    //break the loop
                    return false;
                }
            }
        });
        if (removable === true)
            this.processed_data().each(function (step_model) {
                if (step_model.getPreviousSteps().indexOf(stepId) !== -1) {
                    removable = false;
                    //break the loop
                    return false;
                }
            });
        return removable;
    },
    getRAWdataForTreeView: function () {
        var json_data_raw = [];
        this.non_processed_data().each(
                function (item, index, count) {
                    if (item instanceof SL.model.AnalysisModels.RAWDataModels.RAWData) {
                        json_data_raw.push({text: item.get('raw_data_type'), leaf: true, step_id: item.get('step_id')});
                    }
                }
        );
        return json_data_raw;
    },
    getIntermediateDataForTreeView: function () {
        var getPrettyName = function (intermediate_data_type) {
            switch (intermediate_data_type) {
                case "preprocessing_step":
                    return "Preprocessing step";
                case "mapping_step":
                    return "Mapping step";
                case "union_step":
                    return "Union step";
//                case "maxquant_step":
//                    return "Max Quant step";
                case "smoothing_step":
                    return "Smoothing step";
                default:
                    return intermediate_data_type;
            }
        };
        var json_data_int = [];
        this.non_processed_data().each(
                function (item, index, count) {
                    if (item instanceof SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data) {
                        json_data_int.push({text: getPrettyName(item.get('intermediate_data_type')), leaf: true, step_id: item.get('step_id')});
                    }
                }
        );
        return json_data_int;
    },
    getProcessedDataForTreeView: function () {
        //TODO_ ORDENAR
        var getPrettyName = function (processed_data_type) {
            switch (processed_data_type) {
                case "merging_step":
                    return "Merging";
                case "protID_Q_quantification_step":
                    return "ProtID-Quantification";
                case "calling_step":
                    return "Calling";
                case "quantification_step":
                    return "Quantification";
                case "region_calling_step":
                    return "Region Calling";
                case "region_consolidation_step":
                    return "Region Consolidation";
                case "region_intersection_step":
                    return "Region Intersection";
                default:
                    return processed_data_type;
            }
        };

        //TODO: if analysis can have more than 1 processed data: here we shopuld change the analysis_id field
        var json_data = [];
        this.processed_data().each(
                function (item, index, count) {
                    if (item instanceof SL.model.AnalysisModels.Processed_data) {
                        json_data.push({text: getPrettyName(item.get('processed_data_type')), leaf: true, step_id: item.get('step_id')});
                    }
                }
        );

        return json_data;
    },
    /*************************************************************************************
     * This function convert the Analysis MOdel to JSON format in order to use it in the 
     * graphical workflow.
     * 	1.	First convert each processed_data to JSON format
     * 	2. 	Gets all the Intermediate Steps, order them in DESCENDENT order (by step_number) and
     *		obtains the JSON for each one
     *	3.	Finally generates the JSON for each RAW DATA
     * @return  the Analysis in JSON format
     **************************************************************************************/
    getJSONforGraph: function () {
        var json_data = [];
        this.processed_data().each(function (item) {
            var json_aux = item.getJSONforGraph();
            if (json_aux  instanceof Array) {
                json_data = json_data.concat(json_aux);
            } else {
                json_data.push(json_aux);
            }
        });

        var rawdatas = [];
        var intermediate_steps = [];

        this.non_processed_data().each(
                function (record) {
                    if (record instanceof SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data) {
                        intermediate_steps.push(record);
                    } else if (record instanceof SL.model.AnalysisModels.RAWDataModels.RAWData) {
                        rawdatas.push(record);
                    }
                });
        intermediate_steps.sort(function (a, b) {
            var n1 = a.get('step_number');
            var n2 = b.get('step_number');
            return n2 - n1;
        });
        var intermediate_step;
        for (var i in intermediate_steps) {
            intermediate_step = intermediate_steps[i];
            json_data.push(intermediate_step.getJSONforGraph());
            if (intermediate_step.getAssociatedQualityReport() != null) {
                json_data.push(intermediate_step.getAssociatedQualityReport().getJSONforGraph());
            }
        }

        var rawdata;
        for (var i in rawdatas) {
            rawdata = rawdatas[i];
            json_data.push(rawdata.getJSONforGraph());
            if (rawdata.getAssociatedQualityReport() != null) {
                json_data.push(rawdata.getAssociatedQualityReport().getJSONforGraph());
            }
            if (rawdata.getAnalyticalReplicateID() !== "") {
                json_data.push(
                        {
                            id: rawdata.getAnalyticalReplicateID(),
                            name: rawdata.getAnalyticalReplicateID(),
                            nodeName: "",
                            type: "Analytical Replicate",
                            nodeType: 'AnalyticalReplicate',
                            summary: "TODO",
                            parents_id: ["root"]
                        });
            }

        }
        return json_data;
    },
    toSimpleJSON: function () {
        var JSON_DATA = this.data;
        var non_processed_data_JSON_DATA = [];
        this.non_processed_data().each(function (item) {
            non_processed_data_JSON_DATA.push(item.toSimpleJSON());
        });

        //MERGE THE OBJECT
        if (non_processed_data_JSON_DATA.length > 0) {
            JSON_DATA["non_processed_data"] = non_processed_data_JSON_DATA;
        } else {
            console.warn("Analysis without Non processed data");
        }
        var processed_data_JSON_DATA = [];
        for (var i = 0; i < this.processed_data().getCount(); i++) {
            processed_data_JSON_DATA.push(this.processed_data().getAt(i).toSimpleJSON());
        }

        //MERGE THE OBJECT
        if (processed_data_JSON_DATA.length > 0) {
            JSON_DATA["processed_data"] = processed_data_JSON_DATA;
        } else {
            console.warn("Analysis without Processed data");
        }

        return JSON_DATA;
    },
    statics: {
        /********************************************************************************      
         * This function creates a new Analysis MODEL using the information provided as a JSON
         *  
         * @param jsonData the data for the Analysis model in JSON format
         * @param model if we want to load the data in an already created model 
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function (jsonData, model) {
            if (model === undefined) {
                model = Ext.create("SL.model.AnalysisModels.Analysis");
            }

            var non_processed_data = [];
            if (jsonData['non_processed_data'] != null && jsonData['non_processed_data'].length > 0) {
                var non_processed_data_JSON_list = jsonData['non_processed_data'];
                delete jsonData['non_processed_data'];

                for (var i in non_processed_data_JSON_list) {
                    non_processed_data.push(SL.model.AnalysisModels.Non_processed_data.loadFromJSON(non_processed_data_JSON_list[i]));
                }
            }

            var processed_data = [];
            if (jsonData['processed_data'] != null && jsonData['processed_data'].length > 0) {
                //TODO: if an analysis can  have more than 1 processed, this code must be changed
                var processed_data_JSON_list = jsonData['processed_data'];
                delete jsonData['processed_data'];

                for (var i in processed_data_JSON_list) {
                    processed_data.push(SL.model.AnalysisModels.Processed_data.loadFromJSON(processed_data_JSON_list[i]));
                }
            }

            model.set(jsonData);
            model.non_processed_data().add(non_processed_data);
            model.processed_data().add(processed_data);

            return model;
        }
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
        newInstance = SL.model.AnalysisModels.Analysis.loadFromJSON(newInstance);
        return newInstance;
    },
    isValid: function () {
        /*************************************************************************************
         * This function check if the Analysis model is valid:
         * 1. If all the associated steps are valid.
         * 2. 
         * @return  True is everithing is OK, an  String with the error message in other case.
         **************************************************************************************/
        var ERROR_MESSAGE = "";
        var errors = this.validate();

        if (!errors.isValid()) {
            errors.each(function (item) {
                ERROR_MESSAGE += "</br>-  Analysis metadata error:  Field " + item.field + " " + item.message;
            });
        }

        var isValid_sub = null;
        for (var i = 0; i < this.non_processed_data().getCount(); i++) {
            isValid_sub = this.non_processed_data().getAt(i).isValid();
            if (isValid_sub !== true) {
                ERROR_MESSAGE += isValid_sub;
            }
        }

        for (var i = 0; i < this.processed_data().getCount(); i++) {
            isValid_sub = this.processed_data().getAt(i).isValid();
            if (isValid_sub !== true) {
                ERROR_MESSAGE += isValid_sub;
            }
        }
        return (ERROR_MESSAGE === "" ? true : ERROR_MESSAGE);
    },
    getNextFakeStepID: function () {
        var nextNPDFakeID = this.non_processed_data().max('step_id');
        var nextPDFakeID = this.processed_data().max('step_id');
        var nextFakeID;
        if (nextNPDFakeID == null && nextPDFakeID == null) {
            nextFakeID = "001";
        } else {
            nextNPDFakeID = (nextNPDFakeID == null) ? 0 : "" + (parseInt(nextNPDFakeID.substr(-3)) + 1);
            nextPDFakeID = (nextPDFakeID == null) ? 0 : "" + (parseInt(nextPDFakeID.substr(-3)) + 1);

            nextFakeID = "" + Math.max(nextNPDFakeID, nextPDFakeID);

            var minNumberLength = 3;
            while (nextFakeID.length < minNumberLength) {
                nextFakeID = '0' + nextFakeID;
            }
        }
        nextFakeID = "ST" + this.get('analysis_id').substr(2) + "." + nextFakeID;
        return nextFakeID;
    }
});