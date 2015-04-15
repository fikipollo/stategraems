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
 * - AnalysisController
 * 
 * THIS CONTROLLER CONTAINS THE FOLLOWING HANDLERS
 * - browseAnalysisButtonClickHandler
 * - createNewAnalysisButtonClickHandler
 * - showAnalysisDetailsHandler
 * - copyAnalysisButtonClickHandler
 * - deleteAnalysisButtonClickHandler
 * - deleteStepButtonHandler
 * - importStepButtonHandler
 * - analysisStepSelectorPanelTabChangeHandler
 * - acceptButtonPressedHandler
 * - cancelButtonPressedHandler
 * - editButtonPressedHandler
 * - nextButtonPressedHandler
 * - backButtonPressedHandler
 * - workflowNodeClickHandler
 * - clean_task_queue
 * - execute_tasks
 * - sendCreateAnalysis
 * - sendAnalysisImage
 * - send_update_analysis
 * - send_unblock_analysis
 * - getMoreTimeButtonHandler
 * - loadAllAnalysisHandler
 * - loadAnalysisHandler
 * - openAnalysisWizardButtonHandler
 * - analysisWizardAddNewAnalysisButtonClickHandler
 * - analysisWizardApplyChangesButtonClickHandler
 * - analysisWizardNextButtonClickHandler
 * - analysisWizardBackButtonClickHandler
 * - analysisWizardCancelButtonClickHandler
 * - analysisWizardFinishButtonClickHandler
 * - sendCreateAnalysisWizard
 * - getCredentialsParams
 * 
 */
Ext.define('SL.controller.AnalysisController', {
    extend: 'Ext.app.Controller',
    /**
     * This function handles the event fires when the button "Browse Analysis" is clicked.
     * First creates a new ElementListSelector listing all the Analysis stored in the server.
     * When an Analysis is selected to be inspected (double click or button Inspect), a new 
     * BioConditionDetailsView is created and opened.
     * 
     * @returns {undefined}
     */
    browseAnalysisButtonClickHandler: function () {
        application.mainView.changeMainView("AnalysisListView").updateContent();
    },
    /**
     * This function handles the event fires when
     * 
     * @returns {undefined}
     */
    createNewAnalysisButtonClickHandler: function () {
        var analysisTypeDialog = Ext.create('Ext.window.Window', {
            title: 'Please, choose the type for the new Analysis',
            height: 180, width: 400, layout: 'fit',
            closable: false, modal: true,
            items: [
                {xtype: 'panel',
                    border: false, layout: {type: 'vbox', align: 'stretch', pack: 'center'},
                    padding: 10, style: {'background': 'white'},
                    items: [
                        {xtype: 'combobox', cls: 'combobox', fieldLabel: 'Analysis type',
                            editable: false,
                            displayField: 'value', valueField: 'value',
                            store: ['ChIP-seq', 'DNase-seq', 'Methyl-seq', 'mRNA-seq', 'smallRNA-seq', 'Metabolomics', 'Proteomics'],
                            value: "Metabolomics"
                        }]
                }],
            buttons: [{
                    text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton',
                    handler: function () {
                        var analysisType = this.up('window').down('combobox').getValue();
                        if (analysisType == null) {
                            return;
                        }

                        //1. Create the new model
                        var newModel = Ext.create('SL.model.AnalysisModels.Analysis');
                        newModel.setID("ANxxxx");
                        newModel.setAnalysisType(analysisType);

                        //2. Create the new view
                        var mainView = application.mainView;
                        var analysisView = mainView.changeMainView("AnalysisDetailsView");

                        //4.Load the information
                        analysisView.setLoading(true);
                        analysisView.loadModel(newModel);
                        newModel.addObserver(analysisView);
                        analysisView.setViewMode('creation');
                        analysisView.updateWorkflowPanel(true);
                        analysisView.setLoading(false);
                        this.up('window').close();
                    }
                },
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton',
                    handler: function () {
                        this.up('window').close();
                    }
                }]
        });
        analysisTypeDialog.show();
    },
    /**
     * This function handles the event fires when the button "Inspect selected Analysis" is clicked.
     * 
     * @returns {undefined}
     */
    showAnalysisDetailsHandler: function () {
        var mainView = application.mainView;

        var analysisListView = mainView.getView('AnalysisListView');
        var grid = analysisListView.queryById('analysisContainer');
        var selected, selectedStepId;
        //GET THE SELECTED ANALYSIS ID
        if (grid.isVisible()) {
            selected = analysisListView.queryById('analysisContainer').getSelectionModel().getSelection()[0];
        } else {
            selected = analysisListView.queryById('stepsContainer').getSelectionModel().getSelection()[0];
            if (selected == null) {
                return;
            }
            selectedStepId = selected.get('step_id');
        }

        //LOAD THE ANALYSIS
        if (selected != null) {
            var analysis_id = selected.get('analysis_id');
            //1. Create a new view
            var analysisView = mainView.changeMainView("AnalysisDetailsView");
            console.info((new Date()).toLocaleString() + " OPENING ANALYSIS " + analysis_id + " FOR INSPECT");

            var doAfterLoading = function () {
                analysisView.setViewMode('inspect');
                analysisView.updateWorkflowPanel(true);
                analysisView.setLoading(false);
            };
            analysisView.setLoading(true);
            this.loadAnalysisHandler(analysis_id, analysisView, selectedStepId, doAfterLoading);
        }
    },
    /**
     * This function handles the event fires when
     * 
     * @returns {undefined}
     */
    copyAnalysisButtonClickHandler: function () {
        var mainView = application.mainView;

        var analysisListView = mainView.getView('AnalysisListView');
        var grid = analysisListView.queryById('analysisContainer');
        var selected, selectedStepId;
        //GET THE SELECTED ANALYSIS ID
        if (grid.isVisible()) {
            selected = analysisListView.queryById('analysisContainer').getSelectionModel().getSelection()[0];
        } else {
            selected = analysisListView.queryById('stepsContainer').getSelectionModel().getSelection()[0];
            selectedStepId = selected.get('step_id');
        }

        //LOAD THE ANALYSIS
        if (selected != null) {
            var analysis_id = selected.get('analysis_id');
            var analysisView = mainView.changeMainView("AnalysisDetailsView");
            console.info((new Date()).toLocaleString() + " OPENING ANALYSIS " + analysis_id + " FOR CLONING");

            //2.Load all the information for the selected biocondition (including bioreplicates) and load it in the new view
            var doAfterLoading = function () {
                var analysisModel = analysisView.getModel();
                analysisModel.updateID("ANxxxx");
                analysisModel.setStepsOwner(Ext.util.Cookies.get('loggedUser'));
                analysisView.setViewMode('creation');
                analysisView.updateWorkflowPanel(true);
                analysisView.setLoading(false);
            };
            analysisView.setLoading(true);
            this.loadAnalysisHandler(analysis_id, analysisView, selectedStepId, doAfterLoading);
        }
    },
    /**
     * This function handles the event fires when...
     * 
     * @returns {undefined}
     */
    deleteAnalysisButtonClickHandler: function () {
        var me = this;
        var askToContinue = function (buttonId, text, opt) {
            if (buttonId === "yes") {
                var mainView = application.mainView;
                mainView.setLoading(true);
                var analysisListView = mainView.getView('AnalysisListView');
                var grid = analysisListView.queryById('analysisContainer');
                var selected, selectedStepId;
                //GET THE SELECTED ANALYSIS ID
                if (grid.isVisible()) {
                    selected = analysisListView.queryById('analysisContainer').getSelectionModel().getSelection()[0];
                } else {
                    selected = analysisListView.queryById('stepsContainer').getSelectionModel().getSelection()[0];
                    selectedStepId = selected.get('step_id');
                }

                //LOAD THE ANALYSIS
                if (selected != null) {
                    var analysis_id = selected.get('analysis_id');
                    console.info((new Date()).toLocaleString() + "SENDING EDIT REQUEST FOR ANALYSIS " + analysis_id + " TO SERVER");
                    Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
                    Ext.Ajax.request({
                        url: SERVER_URL + SERVER_PORT + SERVER_URL_REMOVE_ANALYSIS,
                        method: 'POST',
                        params: me.getCredentialsParams({'analysis_id': analysis_id}),
                        success: function (response) {
                            //UPDATE THE LIST OF BIOCONDITIONS
                            analysisListView.updateContent();
                            showSuccessMessage('Analysis ' + analysis_id + ' removed successfully', {soft: true});
                            mainView.setLoading(false);
                        },
                        failure: function (response) {
                            ajaxErrorHandler("AnalysisController", "loadAnalysisHandler", response);
                            mainView.setLoading(false);
                        }
                    });
                    console.info((new Date()).toLocaleString() + "EDIT REQUEST FOR ANALYSIS " + analysis_id + " SENT TO SERVER");
                }
            }
        };
        Ext.MessageBox.show({
            title: 'Remove the selected analysis?',
            msg: 'This action can not be undone.<br/>Would you like to continue?',
            buttons: Ext.MessageBox.YESNO,
            fn: askToContinue,
            icon: Ext.MessageBox.QUESTION
        });
    },
    /**
     * This function handles the event fires when the button Delete Step is pressed at the AnalysisView.
     * 
     * @param {AnalysisView} analysisView
     * @param {String} toBeRemovedModelID
     * @returns {undefined}
     */
    deleteStepButtonHandler: function (analysisView, toBeRemovedModelID) {
        var analysisModel = analysisView.getModel();
        var toBeRemovedModel = analysisModel.getStepByID(toBeRemovedModelID);
        if (toBeRemovedModel != null) {
            //1. Check if user can edit the step
            var current_user_id = '' + Ext.util.Cookies.get('loggedUser');
            if (toBeRemovedModel.isOwner(current_user_id) === false && current_user_id !== "admin") {
                console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over this step.");
                showErrorMessage("User " + current_user_id + " has not Edition privileges over the selected step.</br>Only Owners can edit this information. Please, contact with listed owners or with EMS's administrator to get more privileges.", '');
                return;
            }

            //FIRST WE HAVE TO CHECK IF THE STEP CAN BE REMOVED (ie. IF THERE IS NOT ALTER STEPS USING THIS STEP).
            var nextStepsList = analysisView.getModel().getNextStepsByID(toBeRemovedModelID);
            analysisView.getModel().removeStep(toBeRemovedModel);
            //CHECK IF THE STEP WAS IMPORTED FROM OTHER ANALYSIS
            var currentAnalysisID = analysisModel.getID();
            var owner_analysis_id = "AN" + toBeRemovedModel.getID().slice(2).split(".")[0];
            if (currentAnalysisID === owner_analysis_id) {
                analysisView.addNewTask("remove_step", toBeRemovedModel);
            } else {
                analysisView.addNewTask("remove_association", toBeRemovedModel);
            }
            for (var i in nextStepsList) {
                nextStepsList[i].removePreviousStep(toBeRemovedModelID);
            }

            //REFRESH THE ANALYSIS VIEW PANEL WITH THE NEW CONTENT
            analysisView.setLoading(true);
            var analysisDataContainer = analysisView.queryById('analysisDataContainer');
            var stepPanel = analysisDataContainer.getInnerPanel();
            if (stepPanel !== null && stepPanel.getModel().getID() === toBeRemovedModelID) {
                analysisDataContainer.setInnerPanel(null);
            }
            analysisView.removeStepView(toBeRemovedModelID);
            analysisView.setUpdateNeededWorkflowPanel(true);
            analysisView.updateWorkflowPanel();
            analysisView.setLoading(false);
        }
    },
    /**
     * This function handles the event fires when the button "Import step" located in AnalysisDetailsView
     * is clicked.
     * First, shows a List of all the experiments in which user is owner or member.
     * When an experiment is selected, then list all the analysis contained in the select experiment.
     * When an analysis is selected, a new panel with the analysis workflow is shown.
     * User can select the steps to import clicking on the desired step. All previous steps will be importe too.
     * 
     * @param {AnalysisView} analysisView
     * @returns {undefined}
     */
    importStepButtonHandler: function (analysisView) {
        Ext.require(['SL.view.AnalysisViews.AnalysisStepSelectorWindow', 'SL.model.Experiment'], function () {
            var analysisModel = analysisView.getModel();
            var callBackFn = function (importedSteps) {
                for (var i in importedSteps) {
                    //Avoid to import already imported steps
                    if (analysisModel.getStepByID(importedSteps[i].getID()) !== null) {
                        continue;
                    }
                    //TODO: CHANGE THIS CODE AND USE SETTERS
                    importedSteps[i].set('analysis_id', importWindow.down('tabpanel').selectedAnalysisID);
                    analysisModel.addStep(importedSteps[i]);
                    analysisView.addNewTask("import_step", importedSteps[i]);
                }
                //REFRESH THE ANALYSIS VIEW PANEL WITH THE NEW CONTENT
                analysisView.getModel().setChanged();
                analysisView.setUpdateNeededWorkflowPanel(true);
                analysisView.updateWorkflowPanel();
            };
            var importWindow = Ext.create('SL.view.AnalysisViews.AnalysisStepSelectorWindow');
            importWindow.callBackFn = callBackFn;
            importWindow.currentAnalysisID = analysisModel.getID();
            importWindow.setHeight(Ext.getBody().getViewSize().height * 0.9);
            importWindow.setWidth(Ext.getBody().getViewSize().width * 0.8);
            importWindow.show();
        });
    },
    /**
     * This function handles the event fires when ...
     * 
     * @param {type} tabPanel
     * @param {type} newCard
     * @returns {undefined}
     */
    analysisStepSelectorPanelTabChangeHandler: function (tabPanel, newCard) {
        tabPanel.setLoading(true);
        if (newCard.itemId === "experimentSelectorPanel") {
            this.getController('ExperimentController').loadAllExperimentsHandler(newCard);
        } else if (newCard.itemId === "analysisSelectorPanel") {
            this.loadAllAnalysisHandler(newCard, tabPanel.selectedExperimentID);
        } else if (newCard.itemId === "stepSelectorPanel") {
            this.loadAnalysisHandler(tabPanel.selectedAnalysisID, newCard);
        }
        tabPanel.setLoading(false);
    },
    /**BC*********************************************************************************************************
     * This function handles the event accept_button_pressed fires in other Controller (eg. ApplicationController)
     * when a button Accept is pressed.
     * First cleans the AnalysisDetailsView tasks queue (removing all unneccessary tasks) and then starts with task
     * execution.
     *  
     * @param  analysisView
     /**EC*********************************************************************************************************/
    acceptButtonPressedHandler: function (analysisView) {
        if (analysisView.isXType("AnalysisDetailsView")) {
            analysisView.setTaskQueue(this.clean_task_queue(analysisView.getTaskQueue()));
            this.execute_tasks(analysisView, true);
        } else if (analysisView.isXType("AnalysisWizardViewPanel")) {
            this.analysisWizardFinishButtonClickHandler(analysisView);
        } else {
            console.error("AnalysisController:acceptButtonPressedHandler: Not implemented for " + analysisView.$className);
        }
    },
    /**
     *  This function handles the cancelButtonPressed thown by the Application Controller
     * when the Cancel button located in mainView is pressed and the inner panel is an
     * AnalysisDetailsView panel.
     * Asks the user if close without save changes. If user selects "Yes", the panel is closed.
     * if the panel was in a "Editing mode" (if the panel has a timer id), then sends a signal to the server in order to unblock
     * the Analysis in the list of blocked elements.
     *
     * @param {AnalysisView} analysisView
     * @param {boolean} force
     * @returns {undefined}
     */
    cancelButtonPressedHandler: function (analysisView, force) {
        if (analysisView.isXType("AnalysisWizardViewPanel")) {
            this.analysisWizardCancelButtonClickHandler(analysisView);
        } else if (analysisView.isXType("AnalysisDetailsView")) {
            var me = this;
            if (analysisView.isInEditionMode()) {

                var doClose = function () {
                    analysisView.setLoading(true);

                    analysisView.cleanCountdownDialogs();
                    me.send_unblock_analysis(analysisView, null, null);

                    if (analysisView.getModel().hasChanged()) {
                        analysisView.getModel().restoreFromMemento(analysisView.memento);
                        analysisView.getModel().notifyObservers();
                    }
                    //Remove the memento
                    analysisView.memento = null;

                    analysisView.setViewMode("inspect");
                    analysisView.updateWorkflowPanel(true);
                    analysisView.clearTaskQueue();
                    analysisView.setLoading(false);
                };
                if (force === true) {
                    doClose();
                } else {
                    var askToContinue = function (buttonId, text, opt) {
                        if (buttonId === "yes") {
                            doClose();
                        }
                    };
                    Ext.MessageBox.show({
                        title: 'Exit without save?',
                        msg: 'You are closing the form before save changes. <br/>Would you like to continue?',
                        buttons: Ext.MessageBox.YESNO,
                        fn: askToContinue,
                        icon: Ext.MessageBox.QUESTION
                    });
                }
            } else {
                var mainView = application.mainView;
                mainView.setButtonsStatus(false);
                mainView.changeMainView("AnalysisListView").updateContent();
            }
        } else {
            console.error("AnalysisController:cancelButtonPressedHandler: Not implemented for " + analysisView.$className);
        }
    },
    /**
     * This function send a Edition request to the server in order to block and Analysis
     * avoiding that other users edit it before the user saves the changes.
     * Each user has 30 minutes max. to edit an analysis, after that the user will be 
     * ask again, if no answer is given, the analysis is unblocked and changes will be  
     * lost.
     * This is neccessary because if the user leaves the application without save or close the panel,
     * the server MUST free the blocked object in order to let other users edit it.
     * After LOCKED_TIME minutes, the server automatically frees the blocked object, so the user
     * will be asked 1 minute before the liberation takes place.
     *
     * TODO: ASK FOR MORE TIME	
     * TODO: ANALYSIS OWNERS?
     *
     * @param {AnalysisView} analysisView
     * @returns {undefined}
     */
    editButtonPressedHandler: function (analysisView) {
        //TODO: CHECK IF THE USER HAS EDITING PRIVILEGES OVER THE ANALYSIS (ONLY OWNERS)
        var me = this;
        analysisView.setLoading(true);
        console.info((new Date()).toLocaleString() + "SENDING EDIT REQUEST FOR ANALYSIS " + analysisView.getAnalysisID() + " TO SERVER");
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_LOCK_ANALYSIS,
            method: 'POST',
            params: me.getCredentialsParams({'analysis_id': analysisView.getAnalysisID()}),
            success: function (response) {
                /*responseText should be in json format*/
                try {
                    /*IF THE REQUEST WAS SENT SUCCESSFULLY*/
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    //IF SUCCESS == TRUE, IT MEANS THAT THE OBJECT WAS BLOCKED SUCCESSFULLY, SO WE CAN EDIT IT
                    if (jsonResponse['success']) {
                        console.info((new Date()).toLocaleString() + "EDITION ALLOWED FOR ANALYSIS " + analysisView.getAnalysisID());
                        analysisView.initializeCountdownDialogs();
                        analysisView.setLoading(false);
                        analysisView.setViewMode("edition");
                        analysisView.memento = analysisView.getModel().getMemento();
                        //analysisView.setLoading(false);
                    } else {
                        console.info((new Date()).toLocaleString() + " EDITION NOT ALLOWED FOR ANALYSIS " + analysisView.getAnalysisID());
                        showErrorMessage('Apparently another user opens this object for editing. </br>Please, try again later. If the problem persists, please contact with tecnical support.', '');
                    }
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'AnalysisController:editAnalysisButtonHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
                analysisView.setLoading(false);
            },
            failure: function (response) {
                ajaxErrorHandler("AnalysisController", "editAnalysisButtonHandler", response);
            }
        });
        console.info((new Date()).toLocaleString() + "EDIT REQUEST FOR ANALYSIS " + analysisView.getAnalysisID() + " SENT TO SERVER");
    },
    /*
     * This function...
     * 
     * @param {type} analysisView
     * @returns {undefined}
     */
    nextButtonPressedHandler: function (analysisView) {
        if (analysisView.isXType("AnalysisWizardViewPanel")) {
            this.analysisWizardNextButtonClickHandler(analysisView);
        } else {
            console.error("AnalysisController:nextButtonPressedHandler: Not implemented for " + analysisView.$className);
        }
    },
    /*
     * This function...
     * 
     * @param {type} analysisView
     * @returns {undefined}
     */
    backButtonPressedHandler: function (analysisView) {
        if (analysisView.isXType("AnalysisWizardViewPanel")) {
            this.analysisWizardBackButtonClickHandler(analysisView);
        } else {
            console.error("AnalysisController:backButtonPressedHandler: Not implemented for " + analysisView.$className);
        }
    },
    /**
     * This function handles the event fires when a node in the Analysis workflow diagram is clicked
     * 
     * @param {AnalysisView} analysisView
     * @param {String} stepType
     * @param {String} stepID
     * @returns {undefined}
     */
    workflowNodeClickHandler: function (analysisView, stepType, stepID) {
        //First check if the step view is already created (improve performance)
        application.mainView.setLoading(true);
        stepType = stepType.toLowerCase();
        var nodeView = null;
        if (stepType === "analyticalreplicate") {
            var bioconditionID = stepID.split(".")[0].replace("AR", "BC");
            nodeView = analysisView.getSampleView(bioconditionID);
        } else {
            nodeView = analysisView.getStepView(stepID);
        }
        if (nodeView == null) {
            var stepModel = null;
            var viewType;
            if (stepType === "rawdata") {
                stepModel = analysisView.getModel().non_processed_data().findRecord('step_id', stepID);
                viewType = 'SL.view.AnalysisViews.RAWDataViews.RAWDataView';
            } else if (stepType === "intermediate_step" || stepType === "intermediate_data") {
                stepModel = analysisView.getModel().non_processed_data().findRecord('step_id', stepID);
                viewType = 'SL.view.AnalysisViews.IntermediateDataViews.IntermediateDataView';
            } else if (stepType === "processed_data") {
                //TODO: if an analysis can have more that 1 processed data then we should change the analysis_id field
                stepModel = analysisView.getModel().processed_data().findRecord('step_id', stepID);
                viewType = 'SL.view.AnalysisViews.ProcessedDataViews.ProcessedDataView';
            } else if (stepType === "analyticalreplicate") {
                //TODO: lanzar evento en vez de llamar al controlador directamente?
                var bioconditionID = stepID.split(".")[0].replace("AR", "BC");
                var analysisDataContainer = analysisView.queryById('analysisDataContainer');
                var bioconditionView;
                var doAfterLoading = function () {
                    bioconditionView.parent = analysisView;
                    analysisDataContainer.setInnerPanel(bioconditionView, true);
                    analysisView.addSampleView(bioconditionID, bioconditionView);
                    bioconditionView.updateWorkflowPanel();
                    application.mainView.setLoading(false);
//                    analysisView.doLayout();
                };
                bioconditionView = this.getController('BioConditionController').getBiologicalConditionDetailsPanel(bioconditionID, doAfterLoading);
            } else {
                application.mainView.setLoading(false);
                return;
            }

            //LOAD DEPENDENCIES
            Ext.require([viewType], function () {
                if (stepModel != null) {
                    nodeView = Ext.create(viewType);
                    //Save the current status for the model before change anything.
                    //  bioReplicateView.memento = bioreplicateModel.getMemento();
                    if (stepType === "processed_data") {
                        if (stepModel instanceof SL.model.AnalysisModels.Region_intersection_step) {
                            nodeView.regionStep = true;
                        } else if (stepModel instanceof SL.model.AnalysisModels.Region_consolidation_step) {
                            nodeView.regionStep = true;
                        } else if (stepModel instanceof SL.model.AnalysisModels.Data_matrix_step) {
                            nodeView.unificationStep = true;
                        }
                    }

                    nodeView.parent = analysisView;
                    nodeView.setLoading(true);
                    nodeView.loadModel(stepModel);
                    stepModel.addObserver(nodeView);
                    nodeView.setViewMode('inspect');
                    nodeView.setLoading(false);
                    var analysisDataContainer = analysisView.queryById('analysisDataContainer');
                    analysisDataContainer.setInnerPanel(nodeView, true);
                    analysisView.addStepView(stepID, nodeView);
                    application.mainView.setLoading(false);
                }
            });
        } else {
            var analysisDataContainer = analysisView.queryById('analysisDataContainer');
            if (analysisDataContainer.getInnerPanel() === nodeView) {
                application.mainView.setLoading(false);
                return;
            }
            analysisDataContainer.setInnerPanel(nodeView);
            application.mainView.setLoading(false);
        }
    },
    /*
     * This function...
     * @param {type} tasks_queue
     * @returns {Array}
     */
    clean_task_queue: function (tasks_queue) {
        console.info((new Date()).toLocaleString() + "CLEANING TASK QUEUE");
        try {
            if (tasks_queue.length === 0) {
                return tasks_queue;
            }
            //IF THE QUEUE INCLUDES A CREATION TASK
            //The create_new_analysis task must be always in the first position (if we are creating a new biocondition)
            if (tasks_queue[0].command === "create_new_analysis") {
                //The Analysis creation send all the information (Analysis, steps, ... )to the server in only one step 
                //So it's neccessary to remove all the tasks related with steps insertion.
                //After that only "create_new_analysis" and others tasks like "send_analysis_image" should be in the queue
                for (var i = tasks_queue.length - 1; i > 0; i--) {
                    if (["send_analysis_image"].indexOf(tasks_queue[i].command) === -1) {
                        tasks_queue.splice(i, 1);
                    }
                }
                return tasks_queue;
            }
            //IF NOT, we need to "clean" the queue removing pairs of "create obj1, remove obj1" and "edit obj1, remove obj1" tasks 
            //and merge the "create obj1, edit obj1" pairs
            var tasks = {
                to_be_created_NPD: {},
                to_be_created_PD: {},
                to_be_edited_NPD: {},
                to_be_edited_PD: {},
                to_be_imported_NPD: [],
                to_be_disassociated_NPD: [],
                to_be_deleted_NPD: [],
                to_be_deleted_PD: []
            };
            var send_analysis_image = false;
            var clear_blocked_status = false;
            var other_tasks = [];
            var tasks_queue_temp = [];
            for (var i = 0; i < tasks_queue.length; i++) {
                switch (tasks_queue[i].command) {
                    case "send_analysis_image":
                        send_analysis_image = true;
                        break;
                    case "clear_blocked_status":
                        clear_blocked_status = true;
                        break;
                        //add_new_step IS ADDED WHEN A NEW STEP IS CREATED AND ADDED TO AN ANALYSIS
                    case "add_new_step":
                        //Due to the step id is unique in the same BioCondition,
                        //We add a new entry in the temporal array indexed by the STEP id, saving the position
                        var objectId = tasks_queue[i].object.get('step_id');
                        tasks.to_be_created_NPD[objectId] = tasks_queue[i].object;
                        break;
                        //add_new_step IS ADDED WHEN A NEW STEP IS CREATED AND ADDED TO AN ANALYSIS
                    case "import_step":
                        //Due to the step id is unique in the system,
                        //We add a new entry in the temporal array indexed by the STEP id, saving the position
                        var objectId = tasks_queue[i].object.get('step_id');
                        tasks.to_be_imported_NPD.push(objectId);
                        break;
                    case "remove_association":
                        var objectId = tasks_queue[i].object.get('step_id');
                        //If we find a previous "addition" or "editiion" task for the same step, we should remove the both task
                        //If the NPD was a TO-BE-CREATED NPD, there is not more related tasks added
                        //so remove the addition task and not add the remove
                        var pos = tasks.to_be_imported_NPD.indexOf(objectId);
                        if (pos !== -1) {
                            tasks.to_be_imported_NPD.splice(pos, 1);
                        } else {
                            tasks.to_be_disassociated_NPD.push(objectId);
                        }
                        break;
                        //add_new_processed_data IS ADDED WHEN A NEW PROCESSED DATA IS ADDED TO THE EXISTING ANALYSIS
                    case "add_new_processed_data":
                        //Due to the step id is unique in the same BioCondition,
                        //We add a new entry in the temporal array indexed by the STEP id, saving the position
                        var objectId = tasks_queue[i].object.get('step_id');
                        tasks.to_be_created_PD[objectId] = tasks_queue[i].object;
                        break;
                        //edit_step IS ADDED WHEN AN STEP IS EDITED
                    case "edit_step":
                        //Due to the step id is unique in the same analysis,
                        //We add a new entry in the temporal array indexed by the STEP id, saving the position
                        //BUt only if the STEP is not a TO-BE-CREATED NPD
                        var objectId = tasks_queue[i].object.get('step_id');
                        if (tasks.to_be_created_NPD[objectId] == null) {
                            tasks.to_be_edited_NPD[objectId] = tasks_queue[i].object;
                        }
                        break;
                        //edit_processed_data IS ADDED WHEN A PROCESSED DATA IS EDITED
                    case "edit_processed_data":
                        //Only if the PD is not a TO-BE-CREATED PD
                        var objectId = tasks_queue[i].object.get('analysis_id');
                        if (tasks.to_be_created_PD[objectId] == null) {
                            tasks.to_be_edited_PD[objectId] = tasks_queue[i].object;
                        }
                        break;
                    case "remove_step":
                        var objectId = tasks_queue[i].object.get('step_id');
                        //If we find a previous "addition" or "editiion" task for the same step, we should remove the both task
                        //If the NPD was a TO-BE-CREATED NPD, there is not more related tasks added
                        //so remove the addition task and not add the remove
                        if (tasks.to_be_created_NPD[objectId] != null) {
                            delete tasks.to_be_created_NPD[objectId];
                        } else {
                            //Else if the NPD was previosly added
                            //we could have an Edition task over the NPD
                            if (tasks.to_be_edited_NPD[objectId] != null) {
                                delete tasks.to_be_edited_NPD[objectId];
                            }

                            tasks.to_be_deleted_NPD.push(objectId);
                        }
                        break;
                        //"remove_processed_data" IS ADDED WHEN A processed_data STEP IS REMOVED
                    case "remove_processed_data":
                        var objectId = tasks_queue[i].object.get('analysis_id');
                        //If we find a previous "addition" or "editiion" task for the same step, we should remove the both task
                        //If the NPD was a TO-BE-CREATED NPD, there is not more related tasks added
                        //so remove the addition task and not add the remove
                        if (tasks.to_be_created_PD[objectId] != null) {
                            delete tasks.to_be_created_PD[objectId];
                        } else {
                            //Else if the NPD was previosly added
                            //we could have an Edition task over the NPD
                            if (tasks.to_be_edited_PD[objectId] != null) {
                                delete tasks.to_be_edited_PD[objectId];
                            }
                            tasks.to_be_deleted_PD.push(objectId);
                        }
                        break;
                    case "update_analysis":
                        tasks_queue_temp.push(tasks_queue[i]);
                        break;
                    default:
                        other_tasks.push(tasks_queue[i]);
                        break;
                }
            }
            tasks_queue_temp.push({
                command: "update_analysis",
                object: tasks
            });
            if (send_analysis_image) {
                tasks_queue_temp.push({
                    command: "send_analysis_image",
                    object: null
                });
            }
            tasks_queue_temp = tasks_queue_temp.concat(other_tasks);
            if (clear_blocked_status) {
                tasks_queue_temp.push({
                    command: "clear_blocked_status",
                    object: null
                });
            }
            return tasks_queue_temp;
        } catch (error) {
            showErrorMessage('ERROR CLEANING TASK QUEUE: ' + error, {
                soft: false
            });
            return tasks_queue;
        }
    },
    /**
     * This function handles the tasks execution for a given analysisView and should be only called after 
     * ANALYSIS creation/edition.
     *
     * ACCEPT BUTTON should be only visible during new OBJECTS creation/edition (eg. during a ANALYSIS creation/edition) 
     *
     * Briefly, the way of work of this function is:
     * 	1. 	Get the next task that should be carried out.
     *
     *	2.	If the next task is defined and no previous errors were thrown, we should call to the specified function in the task
     *		in order to change the SERVER information. In the specified function call, we should add the callback function that will be
     *		call after the AJAX success/fail event.
     *        
     *	3.	If an error is thrown during the function call, the error is catched in this function and the task re-added to the queue.
     *	4. 	If no more task and the status is "successfull" (~TRUE), then the panel is closed and a SUCCESS message showed.
     * 
     * @param {AnalysisView} analysisView
     * @param {boolean} status
     * @returns {undefined}
     */
    execute_tasks: function (analysisView, status) {
        var error_message = "";
        //GET THE NEXT TASK IN THE QUEUE
        var current_task = analysisView.getTaskQueue().shift();
        //IF THERE IS A NEXT TASK AND NO PREVIOUS ERROR
        if (current_task != null && status) {
            try {
                switch (current_task.command) {
                    case "create_new_analysis":
                        console.info((new Date()).toLocaleString() + "SENDING SAVE NEW ANALYSIS REQUEST TO SERVER");
                        this.sendCreateAnalysis(analysisView, this, "execute_tasks");
                        console.info((new Date()).toLocaleString() + "SAVE NEW ANALYSIS REQUEST SENT TO SERVER");
                        break;
                    case "send_analysis_image":
                        console.info((new Date()).toLocaleString() + "SENDING SEND ANALYSIS IMAGE REQUEST TO SERVER");
                        this.sendAnalysisImage(analysisView, this, "execute_tasks");
                        console.info((new Date()).toLocaleString() + "SAVE ANALYSIS IMAGE REQUEST SENT TO SERVER");
                        break;
                    case "update_analysis":
                        console.info((new Date()).toLocaleString() + "SENDING UPDATE ANALYSIS REQUEST TO SERVER");
                        this.send_update_analysis(analysisView, current_task.object, this, "execute_tasks");
                        console.info((new Date()).toLocaleString() + "UPDATE ANALYSIS REQUEST SENT TO SERVER");
                        break;
                    case "clear_blocked_status":
                        console.info(new Date().toLocaleString() + "SENDING UNBLOCK ANALYSIS " + analysisView.getAnalysisID() + " REQUEST TO SERVER");
                        this.send_unblock_analysis(analysisView, this, "execute_tasks");
                        console.info(new Date().toLocaleString() + "UNBLOCK ANALYSIS " + analysisView.getAnalysisID() + " REQUEST SENT TO SERVER");
                        break;
                    case "void_action":
                        this.execute_tasks(analysisView, true);
                        break;
                    default:
                        status = false;
                        break;
                }
            } catch (error) {
                error_message = error;
                status = false;
                analysisView.taskQueue.unshift(current_task);
                analysisView.setLoading(false);
            }

            if (!status) {
                showErrorMessage('Failed trying to saved the changes.</br>Please try again.</br>Error: ' + error_message);
            }
        }
        //IF NO MORE TASKS AND EVERYTHING GOES WELL
        else if (status) {
            console.info(new Date().toLocaleString() + "Analysis " + analysisView.getAnalysisID() + " saved successfully");
            analysisView.cleanCountdownDialogs();
            analysisView.updateWorkflowPanel(true);
            analysisView.setViewMode("inspect");

            analysisView.setLoading(false);
            analysisView.doLayout();
            showSuccessMessage('Analysis ' + analysisView.getModel().getID() + ' saved successfully', {soft: true});
            //UPDATE THE LIST OF BIOCONDITIONS
//                this.loadAllAnalysisHandler()(bioconditionView.getModel().getID(), bioconditionView, doAfterLoading);
        } else {
            status = false;
            analysisView.taskQueue.unshift(current_task);
            analysisView.setLoading(false);
        }
    },
    /**
     * This function send the Analysis information contained in a given analysis_view 
     * to the SERVER in order to save a NEW ANALYSIS in the database.
     * Briefly the way of work is :
     *	1.	Check if the analysis model content is valid. If not, throws an error that should 
     *		catched in the caller function.
     *
     *	2.	If all fields are correct, then the ANALYSIS model is converted from JSON to a 
     *		JSON format STRING and sent to the server using POST. After that the function finished.
     *	
     *	3.	After a while, the server returns a RESPONSE catched inside this function. 
     *		The response has 2 possible status: SUCCESS and FAILURE.
     *		a.	If SUCCESS, then the new analysis identifier is set in the analysis_view. 
     *			After that,  isthe callback function is called, in this case the 
     *       	callback function is the "execute_task" function that will execute the next
     *           task in the TASK QUEUE of the given ANALYSIS VIEW panel. This function is called
     *           with the status flag sets to TRUE (~ success).
     *		b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *       	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *           the current task is re-added to the TASK QUEUE and an error message is showed.
     *           The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     * @param  analysisView the AnalysisDetailsView panel which fires the create action and contains the TASK QUEUE and the analysis model. Needed for the callback function.
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @returns {undefined}
     */
    sendCreateAnalysis: function (analysisView, callback_caller, callback_function) {
        var isValid = analysisView.getModel().isValid();
        if (isValid === true) {
            //Get the ANALYSIS model as a Simple JSON
            var JSON_DATA = analysisView.getModel().toSimpleJSON();
            //Convert the JSON object to STRING
            JSON_DATA = Ext.encode(JSON_DATA);
            var me = this;
            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
            Ext.Ajax.request({
                url: SERVER_URL + SERVER_PORT + SERVER_URL_ADD_ANALYSIS,
                method: 'POST',
                params: me.getCredentialsParams({'analysis_json_data': JSON_DATA}),
                success: function (response) {
                    // responseText should be in json format
                    try {
                        analysisView.setLoading(true);
                        //1.DECODE THE JSON STRING AND CREATE A JSON OBJECT
                        var jsonResponse = Ext.JSON.decode(response.responseText);
                        var analysisList = jsonResponse['analysisList'];
                        var analysisJSONData = analysisList[0];
                        analysisView.getModel().deleteObserver(analysisView);
                        //2.CREATE A NEW OBJECT USING THE JSON DATA
                        var newModel = SL.model.AnalysisModels.Analysis.loadFromJSON(analysisJSONData);
                        //3.Load in the new view and add as it as observer
                        analysisView.loadModel(newModel);
                        newModel.addObserver(analysisView);

                        //TODO: RESTAURAR LA QUEUE DE TAREAS
                        analysisView.addNewTask("send_analysis_image");

                        console.info((new Date()).toLocaleString() + "ANALYSIS " + newModel.getID() + " SAVED IN SERVER SUCCESSFULLY");
                    } catch (error) {
                        showErrorMessage('An error ocurred trying to get the new ID of the Analysis.</br>Please contact with the technical support.', '');
                        console.info((new Date()).toLocaleString() + "ANALYSIS SAVED IN SERVER SUCCESSFULLY BUT RESPONSE DOES NOT INCLUDE THE ASSIGNED ID");
                    }
                    callback_caller[callback_function](analysisView, true);
                },
                failure: function (response) {
                    ajaxErrorHandler("AnalysisController", "sendCreateAnalysis", response);
                    //Undo the task shift in the queue 
                    analysisView.taskQueue.unshift({
                        command: "create_new_analysis",
                        object: null
                    });
                    callback_caller[callback_function](analysisView, false);
                }
            });
        } else { // display error alert if the data is invalid
            console.info((new Date()).toLocaleString() + "SAVING ANALYSIS REQUEST ABORTED DUE TO LOCAL ERRORS (ANALYSIS MODEL NOT VALID)");
            throw new Error('Invalid Data. Please check the Analysis content for errors: ' + isValid);
        }
    },
    /**
     *      * This function send the Analysis workflow overview image
     * to the SERVER in order to save the current Analysis workflow image.
     * Briefly the way of work is :
     *	1.	Obtains the workflow as a PNG image.
     *
     *	2.	And send to the server using POST. After that the function finished.
     *	
     *	3.	After a while, the server returns a RESPONSE catched inside this function. 
     *		The response has 2 possible status: SUCCESS and FAILURE.
     *		a.	If SUCCESS, then the new analysis identifier is set in the analysis_view. 
     *			After that the "execute_task" function that will execute the next
     *           task in the TASK QUEUE of the given ANALYSIS VIEW panel. This function is called
     *           with the status flag sets to TRUE (~ success).
     *		b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *       	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *           the current task is re-added to the TASK QUEUE and an error message is showed.
     *           The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     * @param  analysisView the AnalysisDetailsView panel which fires the add image action and contains the TASK QUEUE and the analysis model. Needed for the callback function.
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @returns {undefined}
     */
    sendAnalysisImage: function (analysisView, callback_caller, callback_function) {
        //Prepare the workflow graph to the png image generation
//        analysisView.queryById('analysisWorkflowPanel').graph.deselect();
        analysisView.queryById('analysisWorkflowPanel').graph.layout();
//        analysisView.queryById('analysisWorkflowPanel').graph.zoomToFit();
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_SAVE_ANALYSIS_IMAGE,
            method: 'POST',
            params: me.getCredentialsParams({
                'analysis_id': analysisView.getModel().getID(),
                'analysis_image': analysisView.queryById('analysisWorkflowPanel').graph.png({bg: "#fff"}).replace("data:image/png;base64,", "")
            }),
            success: function (response) {
                callback_caller[callback_function](analysisView, true);
            },
            failure: function (response) {
                ajaxErrorHandler("AnalysisController", "sendAnalysisImage", response);
                //Undo the task shift in the queue 
                analysisView.taskQueue.unshift({
                    command: "send_analysis_image",
                    object: null
                });
                callback_caller[callback_function](analysisView, false);
            }
        });
    },
    /*
     * This function send the BioReplicatess information of the given biorepicate_model 
     * to the SERVER in order to save a NEW BIOREPLICATE in the database associated to the 
     * biocondition given by the BioCondition_view.
     *
     * Briefly the way of work is :
     *
     *	1.	Convert the BioReplicate model from Object to JSON format String.
     *
     *	2.	If all fields are correct, then sends the information to the server using POST 
     *		and finishes the execution.
     *	
     *	3.	After a while, the server returns a RESPONSE catched inside this function. 
     *		The response has 2 possible status: SUCCESS and FAILURE.
     *		a.	If SUCCESS, then the callback function is called, in this case the 
     *        	callback function is the "execute_task" function that will execute the next
     *           task in the TASK QUEUE of the given BioConditionVIEW panel. This function is called
     *           with the status flag sets to TRUE (~ success).
     *		b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *       	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *           the current task is re-added to the TASK QUEUE and an error message is showed.
     *           The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     *  
     * @param  analysisView the BioConditionDetailsView panel which fires the create action and contains the TASK QUEUE. Needed for the callback function.
     * @param  to_be_arrays the to-be-added bioreplicate_model array
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @returns {undefined}
     */
    send_update_analysis: function (analysisView, to_be_arrays, callback_caller, callback_function) {
        var isValid = analysisView.getModel().isValid();
        if (isValid === true) {
            var requestParams = {};
            requestParams.analysis_id = analysisView.getModel().get("analysis_id");
            //GET ALL THE BIOREPLICATE MODEL AS JSON OBJECT
            var array_names = Object.keys(to_be_arrays);
            var JSON_DATA = "";
            var all_json_data;
            var current_array;
            //FOR EACH "to-be-" array (eg. to-be-created-AR, to-be-updated-AR,...) 
            for (var i in array_names) {
                if (array_names[i].indexOf("delete") !== -1 || array_names[i].indexOf("disassociated") !== -1 || array_names[i].indexOf("import") !== -1) {
                    requestParams[array_names[i]] = to_be_arrays[array_names[i]];
                    continue;
                }
                current_array = to_be_arrays[array_names[i]];
                all_json_data = [];
                //FOR EACH OBJECT IN THE CURRENT ARRAY
                for (var j in current_array) {
                    JSON_DATA = current_array[j].toSimpleJSON();
                    JSON_DATA = Ext.encode(JSON_DATA);
                    all_json_data.push(JSON_DATA);
                }
                requestParams[array_names[i]] = all_json_data;
            }

            var me = this;
            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'
            };
            Ext.Ajax.request({
                url: SERVER_URL + SERVER_PORT + SERVER_URL_UPDATE_ANALYSIS,
                method: 'POST',
                params: me.getCredentialsParams(requestParams),
                success: function () {                     // responseText should be in json format
                    console.info((new Date()).toLocaleString() + "ANALYSIS UPDATED SUCCESSFULLY IN SERVER");
                    callback_caller[callback_function](analysisView, true);
                },
                failure: function (response) {
                    ajaxErrorHandler("AnalysisController", "send_update_analysis", response);
                    //Undo the task shift in the queue 
                    analysisView.taskQueue.unshift({command: "update_analysis", object: to_be_arrays});
                    callback_caller[callback_function](analysisView, false);
                }
            });
        } else { // display error alert if the data is invalid
            console.error((new Date()).toLocaleString() + "UPDATE ANALYSIS REQUEST ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            throw new Error('Invalid Data. Please correct form errors.');
        }
    },
    /**
     * This function send to the server a signal to unblock the given Analysis which was blocked when the 
     * edition step started.
     * 	a.	If SUCCESS, the callback function is called, in this case the 
     *      	callback function is the "execute_task" function that will execute the next
     *       task in the TASK QUEUE of the given ANALYSISVIEW panel. This function is called
     *       with the status flag sets to TRUE (~ success).
     *	b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *     	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *       the current task is re-added to the TASK QUEUE and an error message is showed.
     *       The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     * @param  analysisView the AnalysisDetailsView panel which fires the unblock action and contains the TASK QUEUE. Needed for the callback function.
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @returns {undefined}
     */
    send_unblock_analysis: function (analysisView, callback_caller, callback_function) {
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_UNLOCK_ANALYSIS,
            method: 'POST',
            params: me.getCredentialsParams({'analysis_id': analysisView.getAnalysisID()}),
            success: function (response) {                 //if we are here, the server liberated successfully the analysis
                //Remove the timeOut for the local blocking time
                console.info((new Date()).toLocaleString() + " ANALYSIS " + analysisView.getAnalysisID() + " UNBLOCKED SUCCESSFULLY");
                if (callback_caller != null) {
                    callback_caller[callback_function](analysisView, true);
                }
            },
            failure: function (response) {
                ajaxErrorHandler("AnalysisController", "send_unblock_analysis", response);
                //Undo the task shift in the queue 
                analysisView.getTaskQueue().unshift({
                    command: "clear_blocked_status",
                    object: null
                });
                if (callback_caller != null) {
                    callback_caller[callback_function](analysisView, false);
                }
                //TODO: error messages
            }
        });
    },
    getMoreTimeButtonHandler: function (analysisView) {
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_LOCK_ANALYSIS,
            method: 'POST',
            params: me.getCredentialsParams({'analysis_id': analysisView.getAnalysisID()}),
            success: function (response) {
                // responseText should be in json format
                try {
                    //IF THE REQUEST WAS SENT SUCCESSFULLY
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    //IF SUCCESS == TRUE, IT MEANS THAT THE OBJECT WAS BLOCKED SUCCESSFULLY, SO WE CAN EDIT IT
                    if (jsonResponse.success === true) {
                        console.info((new Date()).toLocaleString() + "ANALYSIS " + analysisView.getAnalysisID() + " LOCKED DURING 30 MINUTES MORE");
                        showWarningMessage('Analysis locked successfully for edition during 30 minutes more.', {soft: true});
                        analysisView.cleanCountdownDialogs();
                        analysisView.initializeCountdownDialogs();
                    } else {
                        console.info((new Date()).toLocaleString() + "UNABLE TO LOCK ANALYSIS " + analysisView.getAnalysisID() + " DURING 30 MINUTES MORE");
                        showErrorMessage('Unable to get extra time for Analysis edition.</br>Please save changes and try to edit again.', {soft: true});
                    }
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'AnalysisController:getMoreTimeButtonHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
                analysisView.setLoading(false);
            },
            failure: function (response) {
                ajaxErrorHandler("AnalysisController", "getMoreTimeButtonHandler", response);
            }
        });
    },
    loadAllAnalysisHandler: function (aView, experimentID, loadRecursive) {
        var me = this;
        aView.setLoading(true);
        var credentials = me.getCredentialsParams({'experimentID': experimentID});
        if (loadRecursive !== undefined) {
            credentials['loadRecursive'] = loadRecursive;
        }

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_ALL_ANALYSIS,
            method: 'POST',
            params: credentials,
            success: function (response) {                 // responseText should be in json format
                try {
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    var analysisList = jsonResponse['analysisList'];
                    var analysis = [];
                    if (analysisList.length < 1) {
                        showWarningMessage("No Analysis found in databases.</br>Please add New Analysis first.", {"soft": true});
                    } else {
                        for (var i in analysisList) {
                            var newModel = SL.model.AnalysisModels.Analysis.loadFromJSON(analysisList[i]);
                            analysis.push(newModel);
                        }
                    }
                    aView.setData(analysis);
                    aView.setLoading(false);
                } catch (error) {
                    showErrorMessage('Parsing Error at <i>' + 'AnalysisController:loadAllAnalysisHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>');
                }
            },
            failure: function (response) {
                ajaxErrorHandler("AnalysisController", "loadAllAnalysisHandler", response);
            }
        });
    },
    loadAnalysisHandler: function (analysisID, analysisView, stepID, callback) {
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_ANALYSIS,
            method: 'POST',
            params: me.getCredentialsParams({analysis_id: analysisID}),
            success: function (response) {                 // responseText should be in json format
                try {
                    //1.DECODE THE JSON STRING AND CREATE A JSON OBJECT
                    application.mainView.setLoading(true);
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    var analysisList = jsonResponse['analysisList'];
                    var analysisJSONData = analysisList[0];
                    //2.CREATE A NEW OBJECT USING THE JSON DATA
                    var newModel = SL.model.AnalysisModels.Analysis.loadFromJSON(analysisJSONData);
                    //3.Load in the new view and add as it as observer
                    analysisView.loadModel(newModel);
                    newModel.addObserver(analysisView);
                    //If an step was specified to be opened when the analysis view is shown.
                    if (stepID != null && analysisView.showStepInformation !== undefined) {
                        analysisView.showStepInformation(stepID);
                    }

                    //4.If a callback function was specified, execute it
                    if (callback !== undefined) {
                        callback();
                    }

                    application.mainView.setLoading(false);
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'AnalysisController:loadAnalysisHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                    application.mainView.setLoading(false);
                }
            },
            failure: function (response) {
                ajaxErrorHandler("AnalysisController", "loadAnalysisHandler", response);
                application.mainView.setLoading(false);
                this.browseAnalysisButtonClickHandler();
            }
        });
    },
    /**BC*********************************************************************************************************
     * This function handles the event fires when
     * 
     * @return 
     /**EC*********************************************************************************************************/
    openAnalysisWizardButtonHandler: function () {
        var analysisTypeDialog = Ext.create('Ext.window.Window', {
            title: 'Please, choose the omic family for the new Analysis',
            height: 180, width: 400, layout: 'fit',
            closable: false, modal: true,
            items: [
                {xtype: 'panel',
                    border: false, layout: {type: 'vbox', align: 'stretch', pack: 'center'},
                    padding: 10, style: {'background': 'white'},
                    items: [
                        {xtype: 'combobox', cls: 'combobox', fieldLabel: 'Analysis type',
                            emptyText: "Choose the type for the new Analysis", editable: false,
                            displayField: 'value', valueField: 'value',
                            store: ['ChIP-seq', 'DNase-seq', 'Methyl-seq', 'mRNA-seq', 'smallRNA-seq', 'Metabolomics', 'Proteomics'],
                            value: "Metabolomics"
                        }]
                }],
            buttons: [{
                    text: "<i class='fa fa-check'></i> Accept", cls: 'acceptButton',
                    handler: function () {
                        var analysisType = this.up('window').down('combobox').getValue();
                        if (analysisType == null) {
                            return;
                        }
//                        Ext.require(['SL.view.AnalysisViews.AnalysisWizardViewPanel'], function () {
                        //1. Create the new model
                        var newModel = Ext.create('SL.model.AnalysisModels.Analysis');
                        newModel.setID("ANxxxx");
                        newModel.setAnalysisType("ChIP-seq");
                        newModel.setAnalysisType(analysisType);

                        //2. Create the new view
                        console.info((new Date()).toLocaleString() + " OPENING ANALYSIS WIZARD");
                        var mainView = application.mainView;
                        var analysisWizardWindow = mainView.changeMainView("AnalysisWizardViewPanel");
                        analysisWizardWindow.parent = mainView;

                        analysisWizardWindow.setLoading(true);
                        analysisWizardWindow.loadModel(newModel);
                        analysisWizardWindow.showCurrentStepView();
                        analysisWizardWindow.setLoading(false);
                        this.up('window').close();
//                        });
                    }
                },
                {text: "<i class='fa fa-remove'></i> Cancel", cls: 'cancelButton',
                    handler: function () {
                        this.up('window').close();
                    }
                }]
        });
        analysisTypeDialog.show();
    },
    /**BC*********************************************************************************************************
     * This function handles ...
     *  
     * @param  analysisWizardView
     /**EC*********************************************************************************************************/
    analysisWizardAddNewAnalysisButtonClickHandler: function (analysisWizardView) {
        var newModel = analysisWizardView.getAnalysisTemplateModel().clone();
        newModel.setName(Ext.util.Cookies.get('currentExperimentName') + "_" + newModel.getAnalysisType() + "_analysis");
        //ADD SOME CUSTOM ATTRIBUTES AND FUNCTIONS FOR THE WIZARD
        newModel.usedSamples = [];
        newModel.setUsedSamples = function (usedSamples) {
            this.usedSamples = usedSamples;
        };
        newModel.getUsedSamples = function () {
            return this.usedSamples;
        };
        newModel.checkIsValid = function (stepNumber) {
            if (stepNumber === 2) {
                return (this.getName() !== "") && (this.getUsedSamples().length > 0);
            } else if (stepNumber === 3) {
                //FIRST ADD THE NON PROCESSED DATA
                var steps = this.getNonProcessedData();
                var stepModel;
                for (var i = 0; i < steps.getCount(); i++) {
                    stepModel = steps.getAt(i);
                    var isValid = (stepModel.getName() !== "")
                            && ((stepModel.getType() === "intermediate_data")
                                    || (stepModel.getType() === "rawdata" && stepModel.getFileLocation() !== "" && stepModel.getAnalyticalReplicateID() !== ""));
                    if (!isValid) {
                        return false;
                    }
                }

                steps = this.getProcessedData();
                for (var i = 0; i < steps.getCount(); i++) {
                    stepModel = steps.getAt(i);
                    var isValid = (stepModel.getName() !== "" && stepModel.getFileLocation() !== "");
                    if (!isValid) {
                        return false;
                    }
                }
            }
            return this.validate();
        };
        analysisWizardView.addNewAnalysisModel(newModel);
        analysisWizardView.showAnalysisDetails("last");
    },
    /**
     * 
     * @param {type} analysisView
     * @param {type} stepNumber
     * @returns {undefined}
     */
    analysisWizardApplyChangesButtonClickHandler: function (analysisView, stepNumber) {
        if (stepNumber === 2) {
            //TODO: MOVER CODIGO AL CONTROLLER
            analysisView.model.setName(analysisView.queryById("analysisNameField").getValue());
            var samples = [];
            var gridStore = analysisView.queryById("selectedSamplesGrid").getStore();
            for (var i = 0; i < gridStore.getCount(); i++) {
                samples.push(gridStore.getAt(i).raw);
            }
            analysisView.model.setUsedSamples(samples);
        } else if (stepNumber === 3) {
            var stepsPanels = analysisView.query("AnalysisWizardStep3StepView");
            var stepView, stepModel;
            for (var i in stepsPanels) {
                stepView = stepsPanels[i];
                stepModel = stepView.getModel();
                stepModel.setName(stepView.getName());
                stepModel.setFileLocation(stepView.getFileLocation());

                if (stepModel.getType() === "rawdata") {
                    stepModel.setAnalyticalReplicateID(stepView.getAnalyticalReplicateID());
                    stepModel.setAnalyticalReplicateName(stepView.getAnalyticalReplicateName());
                }
            }
        }
        analysisView.validate();
        analysisView.up("AnalysisWizardViewPanel").updateAnalysisListView();
    },
    /**
     * 
     * @param {type} analysisView
     * @returns {undefined}
     */
    analysisWizardNextButtonClickHandler: function (analysisView) {
        var isValid = true;
        if (analysisView.stepNumber > 1) {
            isValid = analysisView.queryById("analysisListContainer").getStore().getCount() > 0 && analysisView.queryById("analysisListContainer").getStore().findRecord("is_valid", false) === null;
        }
        if (isValid === true) {
            analysisView.stepNumber++;
            analysisView.parent.queryById("backButton").setVisible(true);
            analysisView.parent.queryById("nextButton").setVisible(analysisView.stepNumber !== 4);
            analysisView.parent.queryById("acceptButton").setVisible(analysisView.stepNumber === 4);

            analysisView.showCurrentStepView();
        } else {
            showErrorMessage("Some analysis contains empty required fields.</br>Please check the validity of all analysis before continue.");
        }
    },
    /**
     * 
     * @param {type} analysisView
     * @returns {undefined}
     */
    analysisWizardBackButtonClickHandler: function (analysisView) {
        var me = analysisView;
        var doBack = function () {
            me.stepNumber--;
            me.parent.queryById("backButton").setVisible(me.stepNumber !== 1);
            me.parent.queryById("nextButton").setVisible(me.stepNumber !== 4);
            me.parent.queryById("acceptButton").setVisible(me.stepNumber === 4);
            me.showCurrentStepView();
        };

        if (analysisView.stepNumber === 2 && analysisView.analysisModels.length > 0) {
            var askToContinue = function (buttonId, text, opt) {
                if (buttonId === "yes") {
                    doBack();
                }
            };
            Ext.MessageBox.show({
                title: 'Continue?',
                msg: 'This will invalidate all the Analysis created from current template.</br>Do you want to continue?',
                buttons: Ext.MessageBox.YESNO,
                fn: askToContinue,
                icon: Ext.MessageBox.QUESTION
            });
        } else {
            doBack();
        }
    },
    /**
     * 
     * @returns {undefined}
     */
    analysisWizardCancelButtonClickHandler: function () {
        var askToContinue = function (buttonId) {
            if (buttonId === "yes") {
                var mainView = application.mainView;
                mainView.setButtonsStatus(false);
                mainView.changeMainView("AnalysisListView").updateContent();
            }
        };
        Ext.MessageBox.show({
            title: 'Exit without save?',
            msg: 'You are closing the before save changes. <br/>Would you like to continue?',
            buttons: Ext.MessageBox.YESNO,
            fn: askToContinue,
            icon: Ext.MessageBox.QUESTION
        });
    },
    /**
     * 
     * @param {type} analysisView
     * @returns {undefined}
     */
    analysisWizardFinishButtonClickHandler: function (analysisView) {
        var dialog = Ext.widget("AnalysisWizardCreationDialog");
        dialog.parent = analysisView;
        dialog.loadModels(analysisView.getAnalysisModels());
        dialog.show(null, this.sendCreateAnalysisWizard(dialog, 0));
    },
    /**
     * 
     * @param {type} dialog
     * @param {type} analysisNumber
     * @returns {undefined}
     */
    sendCreateAnalysisWizard: function (dialog, analysisNumber) {
        //IF THERE IS NO MORE ANALYSIS
        if (analysisNumber > dialog.getAnalysisCount() - 1) {
            var isValid = dialog.queryById("analysisListContainer").getStore().findRecord("status", "error") === null;

            if (isValid) {
                showSuccessMessage("All the analysis were saved successfully.", {soft: true});
            } else {
                showErrorMessage("Ooops, some of the Analysis were not created correctly.");
            }
            this.browseAnalysisButtonClickHandler();
            dialog.queryById("closeButton").setVisible(true);
        } else {
            var analysisModel = dialog.getAnalysisModel(analysisNumber);

            dialog.changeStatus(analysisNumber, "sending");

            var isValid = analysisModel.isValid();
            if (isValid === true) {
                //Get the ANALYSIS model as a Simple JSON
                var JSON_DATA = analysisModel.toSimpleJSON();
                //Convert the JSON object to STRING
                JSON_DATA = Ext.encode(JSON_DATA);
                var me = this;
                Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
                Ext.Ajax.request({
                    url: SERVER_URL + SERVER_PORT + SERVER_URL_ADD_ANALYSIS,
                    method: 'POST',
                    params: me.getCredentialsParams({'analysis_json_data': JSON_DATA}),
                    success: function (response) {
                        dialog.changeStatus(analysisNumber, "done");
                        console.info((new Date()).toLocaleString() + "ANALYSIS " + analysisModel.getName() + " SAVED IN SERVER SUCCESSFULLY");
                        analysisNumber++;
                        me.sendCreateAnalysisWizard(dialog, analysisNumber);
                        console.info((new Date()).toLocaleString() + "ANALYSIS " + analysisModel.getName() + " SAVED IN SERVER SUCCESSFULLY");
                        analysisNumber++;
                        me.sendCreateAnalysisWizard(dialog, analysisNumber);
                    },
                    failure: function (response) {
                        dialog.changeStatus(analysisNumber, "error");
                        console.error((new Date()).toLocaleString() + "ANALYSIS " + analysisModel.getName() + " NOTE SAVED IN SERVER");
                        analysisNumber++;
                        me.sendCreateAnalysisWizard(dialog, analysisNumber);
                    }
                });
            } else {
                dialog.changeStatus(analysisNumber, "error");
                console.error((new Date()).toLocaleString() + "ANALYSIS " + analysisModel.getName() + " NOTE SAVED IN SERVER");
                analysisNumber++;
                me.sendCreateAnalysisWizard(dialog, analysisNumber);
            }
        }
    },
    /**
     * 
     * @param {type} request_params
     * @returns {AnalysisControllerAnonym$0.getCredentialsParams.credentials}
     */
    getCredentialsParams: function (request_params) {
        var credentials = {};
        if (request_params != null) {
            credentials = request_params;
        }

        credentials['sessionToken'] = Ext.util.Cookies.get('sessionToken');
        credentials['loggedUser'] = Ext.util.Cookies.get('loggedUser');
        credentials['currentExperimentID'] = Ext.util.Cookies.get('currentExperimentID');
        return credentials;
    }
}); 