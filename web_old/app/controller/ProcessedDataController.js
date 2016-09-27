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
 * - ProcessedDataController
 * 
 * THIS CONTROLLER CONTAINS THE FOLLOWING HANDLERS
 * - showProcessedDataCreationDialogHandler
 * - showProcessedDataCreationAcceptButtonClickHandler
 * - showProcessedDataEditionDialogHandler
 * - showProcessedEditionAcceptButtonClickHandler
 * - showProcessedDataCloningDialogHandler
 * - processedDataTypeComboboxChangeHandler
 * - addNewPreviousStepButtonHandler
 * - loadAllRegionDefinitionSteps
 * 
 */
Ext.define('SL.controller.ProcessedDataController', {
    extend: 'Ext.app.Controller',
    init: function () {
        this.control({
            "ProcessedDataView AnalysisStepSelectorField button[action=addPreviousStep]": {
                click: this.addNewPreviousStepButtonHandler
            }
        });
    },
    /**
     * This function handles the event fires when the button "Ass step" is pressed when a Intermediate data step
     * is selected.
     * 
     * @param {type} analysisView
     * @param {type} newProcessedDataStepModel
     * @param {type} previousStepIDs
     * @returns {undefined}
     */
    showProcessedDataCreationDialogHandler: function (analysisView, newProcessedDataStepModel, previousStepIDs) {
        var theController = this;
        analysisView.setLoading(true);
        //1.Create the creation window
        var creationWindow = Ext.create('Ext.window.Window', {
            title: 'Processed data step annotation', bodyPadding: '30 50 30 50', bodyStyle: {'background': "white"},
            layout: {type: 'vbox', align: 'stretch'}, closable: false, modal: true, autoScroll: true,
            previousPanel: null,
            parent: analysisView,
            items: [],
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', handler: theController.showProcessedDataCreationAcceptButtonClickHandler},
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function () {
                        this.up('window').close();
                    }
                }
            ]
        });
        //2.Create the new model
        var analysisModel = analysisView.getModel();
//        var fakeStepID = analysisModel.getID();
        var fakeStepID = analysisModel.getNextFakeStepID();
        if (newProcessedDataStepModel == null) {
            newProcessedDataStepModel = Ext.create('SL.model.AnalysisModels.Processed_data');
        }
        newProcessedDataStepModel.setID(fakeStepID);
        newProcessedDataStepModel.setSubmissionDate(new Date());
        newProcessedDataStepModel.setLastEditionDate(new Date());
        newProcessedDataStepModel.addOwner(Ext.util.Cookies.get('loggedUser'));

        if (previousStepIDs != null) {
            var previousStepModel, previousStepID;
            for (var i in previousStepIDs) {
                previousStepID = previousStepIDs[i];
                previousStepModel = analysisModel.getNonProcessedDataByID(previousStepID);
                if (previousStepModel == null) {
                    previousStepModel = analysisModel.getProcessedDataByID(previousStepID);
                }
                //IF STILL BEING NULL...
                if (previousStepModel == null) {
                    showWarningMessage("Step " + previousStepID + "not found in current analysis, ignoring...");
                    continue;
                }
                newProcessedDataStepModel.addPreviousStep(previousStepModel);
            }
        }

        var processedDataView = Ext.create('SL.view.AnalysisViews.ProcessedDataViews.ProcessedDataView');
        processedDataView.parent = analysisView;
        newProcessedDataStepModel.addObserver(processedDataView);

        //IF THERE IS NOT ANY NON PROCESSED DATA ALREADY ANNOTATED.
        if (analysisModel.getNonProcessedData().count() < 1) {
            //ONLY NON REGION DEFINITION DATA CAN BE ADDED
            processedDataView.regionStep = true;
        }

        processedDataView.loadModel(newProcessedDataStepModel);

        creationWindow.add(processedDataView);
        creationWindow.setHeight(Ext.getBody().getViewSize().height * 0.9);
        creationWindow.setWidth(Ext.getBody().getViewSize().width * 0.8);
        creationWindow.center();
        creationWindow.show();
        processedDataView.setViewMode("creation", {inWizardMode: analysisView.isInWizardMode()});
        
        if (processedDataView.queryById('analysisStepSelectorField') != null) {
            processedDataView.queryById('analysisStepSelectorField').setVisible(true);
        }
        if (processedDataView.queryById('reference_region_selector') != null) {
            processedDataView.queryById('reference_region_selector').setVisible(true);
        }
        analysisView.setLoading(false);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} button
     * @returns {undefined}
     */
    showProcessedDataCreationAcceptButtonClickHandler: function (button) {
        //GET THE BIOREPLICATEVIEW PANEL
        var processedDataView = button.up('window').down('ProcessedDataView');
        processedDataView.setLoading(true);
        //GET THE ANALYSISVIEW PANEL OWNER OF THIS WINDOW   
        var analysisView = button.up('window').parent;
        //GET THE ANALYSIS MODEL ASSOCIATED TO THE BioConditionVIEW OWNER PANEL
        var analysisModel = analysisView.getModel();

        // make sure the form contains valid data before submitting
        if (!processedDataView.validateContent()) {
            processedDataView.setLoading(false);
            console.error((new Date()).toLocaleString() + "ADDING NEW STEP ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            showErrorMessage('Invalid Data. Please correct form errors.');
            return;
        }

        //Update the model
        var processedDataModel = processedDataView.getModel();
        //UPDATE PROCESSED DATA FIELDS
        processedDataModel.setName(processedDataView.getName());
        processedDataModel.setProcessedDataType(processedDataView.getProcessedDataType());
        processedDataModel.setSoftware(processedDataView.getSoftware());
        processedDataModel.setSoftwareVersion(processedDataView.getSoftwareVersion());
        processedDataModel.setSoftwareConfiguration(processedDataView.getSoftwareConfiguration());
        processedDataModel.setResults(processedDataView.getResults());
//        processedDataModel.setFileLocation(processedDataView.getFileLocation());
        processedDataModel.setSubmissionDate(processedDataView.getSubmissionDate());
        processedDataModel.setLastEditionDate(processedDataView.getLastEditionDate());
        processedDataModel.setOwners([]);
        var owners = processedDataView.getOwners();
        for (var i in owners) {
            processedDataModel.addOwner(owners[i]);
        }

        //ADD A ELEMENT FOR EACH ASSOCIATED PREVIOUS STEP
        processedDataModel.setPreviousSteps(processedDataView.getPreviousSteps());

        if (processedDataModel.isQuantificationStep() || processedDataModel.isRegionCallingStep()) {
            processedDataModel.setReferenceRegions(processedDataView.queryById('reference_region_selector').getModels());
        }

        //processedDataModel.setAssociatedQualityReport(processedDataView.getAssociatedQualityReport())

        //UPDATE SPECIFIC ATTRIBUTES
        //Save the file location info
        //TODO PENSAR MEJOR
        var fields = processedDataView.query('FileLocationSelectorField');
        var fieldName, fieldValue;
        for (var i in fields) {
            fieldName = fields[i].getName();
            if (fieldName != null) {
                fieldValue = fields[i].getValue();
                if (fieldValue != null) {
                    processedDataModel.set(fieldName, fieldValue);
                }
            }
        }

        //TODO PENSAR MEJOR
        var fields = processedDataView.queryById('specificDetailsPanel').query('field');
        var fieldName, fieldValue;
        for (var i in fields) {
            fieldName = fields[i].getName();
            if (fieldName != null) {
                fieldValue = fields[i].getValue();
                if (fieldValue != null) {
                    processedDataModel.set(fieldName, fieldValue);
                }
            }
        }

        //ADD THE NEW STEP MODEL TO THE ANALYISI MODEL
        analysisModel.addProcessedData(processedDataModel);

        //ADD THE TASK TO CREATE THE NEW BIOREPLICATE IN THE SERVER SIDE
        processedDataView.addNewTask("add_new_processed_data", processedDataModel);
        for (var task in processedDataView.getTaskQueue()) {
            analysisView.addNewTask(processedDataView.getTaskQueue()[task].command, processedDataView.getTaskQueue()[task].object);
        }

        analysisView.setUpdateNeededWorkflowPanel(true);
        analysisView.updateWorkflowPanel();
        processedDataView.setLoading(false);
        //CLOSE THE WINDOW
        button.up('window').close();
    },
    /**
     * This function handles the event fires when the button "Ass step" is pressed when a Intermediate data step
     * is selected.
     * 
     * @param {type} analysisView
     * @param {type} processedDataModel
     * @returns {undefined}
     */
    showProcessedDataEditionDialogHandler: function (analysisView, processedDataModel) {
        var theController = this;

        //1. Check if user can edit the step
        var current_user_id = '' + Ext.util.Cookies.get('loggedUser');
        if (processedDataModel.isOwner(current_user_id) === false && current_user_id !== "admin") {
            console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over this step.");
            showErrorMessage("User " + current_user_id + " has not Edition privileges over the selected step.</br>Only Owners can edit this information. Please, contact with listed owners or with EMS's administrator to get more privileges.", '');
            return;
        }
        analysisView.setLoading(true);

        //2.Create the edition window
        var editionWindow = Ext.create('Ext.window.Window', {
            title: 'Processed data step edition', bodyPadding: '30 50 30 50', bodyStyle: {'background': "white"},
            layout: {type: 'vbox', align: 'stretch'}, closable: false, modal: true, autoScroll: true,
            previousPanel: null,
            parent: analysisView,
            items: [],
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', handler: theController.showProcessedEditionAcceptButtonClickHandler},
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function () {
                        this.up('window').close();
                    }
                }
            ]
        });

        var processedDataView = Ext.create('SL.view.AnalysisViews.ProcessedDataViews.ProcessedDataView');
        processedDataView.parent = analysisView;
        processedDataModel.addObserver(processedDataView);
        //       TODO:  processedDataView.memento = processedDataModel.getMemento();
        processedDataView.loadModel(processedDataModel);
        processedDataView.setLastEditionDate(new Date());

        processedDataView.addNewTask("edit_processed_data", processedDataModel);

        editionWindow.add(processedDataView);
        editionWindow.setHeight(Ext.getBody().getViewSize().height * 0.9);
        editionWindow.setWidth(Ext.getBody().getViewSize().width * 0.8);
        editionWindow.center();
        editionWindow.show();
        processedDataView.setViewMode("edition", {inWizardMode: analysisView.isInWizardMode()});
        if (processedDataView.queryById('analysisStepSelectorField') != null) {
            processedDataView.queryById('analysisStepSelectorField').setVisible(true);
        }
        if (processedDataView.queryById('reference_region_selector') != null) {
            processedDataView.queryById('reference_region_selector').setVisible(true);
        }
        analysisView.setLoading(false);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} button
     * @returns {undefined}
     */
    showProcessedEditionAcceptButtonClickHandler: function (button) {
        //GET THE BIOREPLICATEVIEW PANEL
        var processedDataView = button.up('window').down('ProcessedDataView');
        processedDataView.setLoading(true);
        //GET THE ANALYSISVIEW PANEL OWNER OF THIS WINDOW   
        var analysisView = button.up('window').parent;

        // make sure the form contains valid data before submitting
        if (!processedDataView.validateContent()) {
            processedDataView.setLoading(false);
            console.error((new Date()).toLocaleString() + "ADDING NEW STEP ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            showErrorMessage('Invalid Data. Please correct form errors.');
            return;
        }

        //Update the model
        var processedDataModel = processedDataView.getModel();
        //UPDATE PROCESSED DATA FIELDS
        processedDataModel.setName(processedDataView.getName());
        processedDataModel.setProcessedDataType(processedDataView.getProcessedDataType());
        processedDataModel.setSoftware(processedDataView.getSoftware());
        processedDataModel.setSoftwareVersion(processedDataView.getSoftwareVersion());
        processedDataModel.setSoftwareConfiguration(processedDataView.getSoftwareConfiguration());
        processedDataModel.setResults(processedDataView.getResults());
        processedDataModel.setFileLocation(processedDataView.getFileLocation());
        processedDataModel.setSubmissionDate(processedDataView.getSubmissionDate());
        processedDataModel.setLastEditionDate(processedDataView.getLastEditionDate());
        processedDataModel.setOwners([]);
        var owners = processedDataView.getOwners();
        for (var i in owners) {
            processedDataModel.addOwner(owners[i]);
        }

        processedDataModel.setPreviousSteps(processedDataView.getPreviousSteps());

        if (processedDataModel.isQuantificationStep() || processedDataModel.isRegionCallingStep()) {
            processedDataModel.setReferenceRegions(processedDataView.queryById('reference_region_selector').getModels());
        }

        //TODO
        //processedDataModel.setAssociatedQualityReport(processedDataView.getAssociatedQualityReport())

        //UPDATE SPECIFIC ATTRIBUTES
        //Save the file location info
        //TODO PENSAR MEJOR
        var fields = processedDataView.query('FileLocationSelectorField');
        var fieldName, fieldValue;
        for (var i in fields) {
            fieldName = fields[i].getName();
            if (fieldName != null) {
                fieldValue = fields[i].getValue();
                if (fieldValue != null) {
                    processedDataModel.set(fieldName, fieldValue);
                }
            }
        }

        //TODO PENSAR MEJOR
        var fields = processedDataView.queryById('specificDetailsPanel').query('field');
        var fieldName, fieldValue;
        for (var i in fields) {
            fieldName = fields[i].getName();
            if (fieldName != null) {
                fieldValue = fields[i].getValue();
                if (fieldValue != null) {
                    processedDataModel.set(fieldName, fieldValue);
                }
            }
        }

        //ADD THE TASK TO REPLICATE CHANGES IN THE STEP IN THE SERVER SIDE
        for (var task in processedDataView.getTaskQueue()) {
            analysisView.addNewTask(processedDataView.getTaskQueue()[task].command, processedDataView.getTaskQueue()[task].object);
        }

        analysisView.getModel().setChanged();
        analysisView.setUpdateNeededWorkflowPanel(true);
        analysisView.updateWorkflowPanel();
        processedDataModel.deleteObserver(processedDataView);
        processedDataModel.notifyObservers();

        processedDataView.setLoading(false);
        //CLOSE THE WINDOW
        button.up('window').close();
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} analysisView
     * @param {type} processedDataModel
     * @returns {undefined}
     */
    showProcessedDataCloningDialogHandler: function (analysisView, processedDataModel) {
        var newInstance = processedDataModel.clone();
        this.showProcessedDataCreationDialogHandler(analysisView, newInstance);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} processedDataView
     * @param {type} newProcessedDataType
     * @returns {undefined}
     */
    processedDataTypeComboboxChangeHandler: function (processedDataView, newProcessedDataType) {
        //Get the name of the new type
        var firstChar = newProcessedDataType.charAt(0).toUpperCase();
        newProcessedDataType = firstChar + newProcessedDataType.substring(1);

        var newProcessedDataModel = Ext.create('SL.model.AnalysisModels.' + newProcessedDataType);
        //UPDATE PROCESSED DATA FIELDS
        newProcessedDataModel.setID(processedDataView.getID());
        newProcessedDataModel.setName(processedDataView.getName());
        newProcessedDataModel.setProcessedDataType(newProcessedDataType.toLowerCase());
        newProcessedDataModel.setSoftware(processedDataView.getSoftware());
        newProcessedDataModel.setSoftwareVersion(processedDataView.getSoftwareVersion());
        newProcessedDataModel.setSoftwareConfiguration(processedDataView.getSoftwareConfiguration());
        newProcessedDataModel.setResults(processedDataView.getResults());
        newProcessedDataModel.setFileLocation(processedDataView.getFileLocation());
        newProcessedDataModel.setSubmissionDate(processedDataView.getSubmissionDate());
        newProcessedDataModel.setLastEditionDate(processedDataView.getLastEditionDate());
        newProcessedDataModel.setOwners([]);
        var owners = processedDataView.getOwners();
        for (var i in owners) {
            newProcessedDataModel.addOwner(owners[i]);
        }
        newProcessedDataModel.setPreviousStepsIDs(processedDataView.getModel().getPreviousSteps());

        processedDataView.getModel().deleteObserver(processedDataView);
        processedDataView.loadModel(newProcessedDataModel);
        newProcessedDataModel.addObserver(processedDataView);

        var panelAux = processedDataView.queryById('analysisStepSelectorField');
        if (panelAux != null) {
            panelAux.setVisible(true);
        }
        panelAux = processedDataView.queryById('reference_region_selector');
        if (panelAux != null) {
            panelAux.setEditable(true);
        }
    },
    /**
     * This function handles the event fires when the button "Add previous step" is clicked during a 
     * Processed_step creation/edition.
     * First opens a new Dialog with the current Analysis workflow
     * When the Accept button is pressed, the selected steps are taken from the Cytoscape graph
     * Then, for each node, the associadted Non_processed_data object is obtained from the Analysis
     * model and, if the selected object is an Non_processed_data object, the association is added to the
     * to-be-created/to-be-edited Intermediate_step object. 
     * After that, the step_number field of the to-be-created/to-be-edited Intermediate_step object 
     * is updated with the max of the step_number of the previous steps.
     * Finally, the IntermediateDataView is updated.
     *
     * TODO: IF THE STEP IS BEING EDITED AND IT IS ASSOCIATED TO SOME LATER STEPS, THEN WE 
     *		SHOULD UPDATE THE LATER STEPS step_number FIELD. By the moment during step edition
     *		we can not add new associated steps.
     *		
     * @param {type} button
     * @returns {undefined}
     */
    addNewPreviousStepButtonHandler: function (button) {
        var me = button.up('AnalysisStepSelectorField');

        var selectionWindow = Ext.create('Ext.window.Window', {
            title: 'Please select the previous steps',
            height: 400, width: 600, layout: 'border',
            closable: false, modal: true,
            previousPanel: null, cytoscape_graph: null,
            selectedSteps: [],
            items: [
                {xtype: 'panel', region: 'north',
                    html: '<h2>Please, select the previous steps whose resulting data are used by the new step.</h2></br><i>For multiselection, keep pressed SHIFT key</i>'
                },
                {xtype: 'panel', region: 'center', itemId: 'panelWorkflow',
                    html: '<div  class="cytoscapewebPanel" id="cytoscapeweb_stepSelector">Cytoscape Web will replace the contents of this div with your graph.</div><div id="note"></div>'
                }
            ],
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton',
                    handler: function () {
                        selectionWindow.selectedSteps = selectionWindow.cytoscape_graph.selected();

                        var analysis_model = null;
                        if (me.up('AnalysisDetailsView') == null) {
                            analysis_model = me.up('window').parent.getModel();
                        } else {
                            analysis_model = me.up('AnalysisDetailsView').getModel();
                        }
                        //GET THE ANALYSIS MODEL IN ORDER TO LOOK FOR THE STEP OBJECT
                        var new_model = me.up('ProcessedDataView').getModel();

                        var errorMessage = "";
                        for (var i in selectionWindow.selectedSteps) {
                            var nodeData = selectionWindow.selectedSteps[i].data;
                            var previousStepModel = null;
                            if (nodeData.type === "RAWData" || nodeData.type === "Intermediate_step") {
                                previousStepModel = analysis_model.non_processed_data().findRecord('step_id', nodeData.id);
                            } else if (nodeData.type === "Processed_data") {
                                previousStepModel = analysis_model.processed_data().findRecord('step_id', nodeData.id);
                            }
                            var isValid = new_model.isValidPreviousStepType(previousStepModel);
                            if (isValid === true) {
                                new_model.addPreviousStep(previousStepModel);
                            } else {
                                errorMessage += isValid;
                            }
                        }

                        if (errorMessage !== "") {
                            showErrorMessage('Some selected steps could not be added:' + errorMessage, '');
                        }
                        me.up('ProcessedDataView').updateModel();
                        me.up('ProcessedDataView').loadModel(new_model);
                        selectionWindow.close();
                    }
                },
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function () {
                        selectionWindow.close();
                    }}
            ],
            listeners: {
                show: function () {
                    this.setLoading(true);
                    //SHOW THE GRAPH
                    var json_data = Ext.getCmp('analysisViewPanel').getModel().getJSONforGraph();
                    this.cytoscape_graph = configureCytoscapeAnalysisGraph(this.queryById('panelWorkflow'), 'cytoscapeweb_stepSelector', json_data, {showMenu: false});
                    //OVERRIDE THE SELECT EVENT
                    this.cytoscape_graph.removeListener("select", "nodes");
                    this.cytoscape_graph.removeListener("dblclick", "nodes");

                    this.updateNeccesary = false;
                    this.setLoading(false);
                }
            }
        }).show();
    },
    /**
     * This function handles the event fires when...
     * 
     * @param {type} aView
     * @returns {undefined}
     */
    loadAllRegionDefinitionSteps: function (aView) {
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_ALL_REGION_STEPS,
            method: 'POST',
            params: {sessionToken: Ext.util.Cookies.get('sessionToken'), loggedUser: Ext.util.Cookies.get('loggedUser')},
            success: function (response) {
                // responseText should be in json format
                try {
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    var regionStepsList = jsonResponse['regionStepsList'];

                    if (regionStepsList.length < 1) {
                        showWarningMessage("No previously defined Regions were found in database.</br>Please register first a <i>Region definition</i> analysis.", {soft: true});
                    } else {
                        aView.setData(regionStepsList);
                    }
                } catch (error) {
                    showErrorMessage('Parsing Error at <i>' + 'ProcessedDataController:loadAllRegionDefinitionSteps:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', {"soft": false});
                }
                aView.setLoading(false);

            },
            failure: function (response) {
                ajaxErrorHandler("ProcessedDataController", "loadAllRegionDefinitionSteps", response);
            }
        });
    }
});
