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
 * - IntermediateDataController
 * 
 * THIS CONTROLLER CONTAINS THE FOLLOWING HANDLERS
* - showIntermediateDataCreationDialogHandler
* - showIntermediateDataCreationAcceptButtonClickHandler
* - showIntermediateDataEditionDialogHandler
* - showIntermediateDataEditionAcceptButtonClickHandler
* - showIntermediateDataCloningDialogHandler
* - intermediateDataTypeComboboxChangeHandler
* 
*/
Ext.define('SL.controller.IntermediateDataController', {
    extend: 'Ext.app.Controller',
    /**
     * This function handles the event fires when the button "Add step" is pressed when a Intermediate data step
     * is selected.
     * 
     * @param {type} analysisView
     * @param {type} newIntermediateStepModel
     * @param {type} previousStepIDs
     * @returns {undefined}
     */
    showIntermediateDataCreationDialogHandler: function(analysisView, newIntermediateStepModel, previousStepIDs) {
        var theController = this;
        analysisView.setLoading(true);
        //1.Create the edition window
        var creationWindow = Ext.create('Ext.window.Window', {
            title: 'Intermediate step annotation', bodyPadding: '30 50 30 50', bodyStyle: {'background': "white"},
            layout: {type: 'vbox', align: 'stretch'}, closable: false, modal: true, autoScroll: true,
            previousPanel: null,
            parent: analysisView,
            items: [],
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', handler: theController.showIntermediateDataCreationAcceptButtonClickHandler},
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function() {
                        this.up('window').close();
                    }
                }
            ]
        });
        //2.Create the new model
        var analysisModel = analysisView.getModel();
        var fakeStepID = analysisModel.getNextFakeStepID();
        if (newIntermediateStepModel == null) {
            newIntermediateStepModel = Ext.create('SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data');
        }

        newIntermediateStepModel.setID(fakeStepID);
        newIntermediateStepModel.setSubmissionDate(new Date());
        newIntermediateStepModel.setLastEditionDate(new Date());
        newIntermediateStepModel.addOwner(Ext.util.Cookies.get('loggedUser'));

        if (previousStepIDs != null) {
            var previousStepModel, previousStepID;
            for (var i in previousStepIDs) {
                previousStepID = previousStepIDs[i];
                previousStepModel = analysisModel.getNonProcessedDataByID(previousStepID);
                newIntermediateStepModel.addPreviousStep(previousStepModel);
            }
        }

        var intermediateDataView = Ext.create('SL.view.AnalysisViews.IntermediateDataViews.IntermediateDataView');
        intermediateDataView.parent = analysisView;
        newIntermediateStepModel.addObserver(intermediateDataView);
        intermediateDataView.setViewMode("creation", {inWizardMode : analysisView.isInWizardMode()});
        intermediateDataView.loadModel(newIntermediateStepModel);

        creationWindow.add(intermediateDataView);
        creationWindow.setHeight(Ext.getBody().getViewSize().height * 0.9);
        creationWindow.setWidth(Ext.getBody().getViewSize().width * 0.8);
        creationWindow.center();
        creationWindow.show();
        analysisView.setLoading(false);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} button
     * @returns {undefined}
     */
    showIntermediateDataCreationAcceptButtonClickHandler: function(button) {
        //GET THE BIOREPLICATEVIEW PANEL
        var intermediateDataView = button.up('window').down('IntermediateDataView');
        intermediateDataView.setLoading(true);
        //GET THE ANALYSISVIEW PANEL OWNER OF THIS WINDOW   
        var analysisView = button.up('window').parent;
        //GET THE ANALYSIS MODEL ASSOCIATED TO THE BioConditionVIEW OWNER PANEL
        var analysisModel = analysisView.getModel();

        // make sure the form contains valid data before submitting
        if (!intermediateDataView.validateContent()) {
            intermediateDataView.setLoading(false);
            console.error((new Date()).toLocaleString() + "ADDING NEW STEP ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            showErrorMessage('Invalid Data. Please correct form errors.');
            return;
        }

        //Update the model
        var intermediateDataModel = intermediateDataView.getModel();
        //UPDATE NON PROCESSED DATA FIELDS
        intermediateDataModel.setName(intermediateDataView.getName());
        intermediateDataModel.setFileLocation(intermediateDataView.getFileLocation());
        intermediateDataModel.setSubmissionDate(intermediateDataView.getSubmissionDate());
        intermediateDataModel.setLastEditionDate(intermediateDataView.getLastEditionDate());
        intermediateDataModel.setOwners([]);
        var owners = intermediateDataView.getOwners();
        for (var i in owners) {
            intermediateDataModel.addOwner(owners[i]);
        }
        //UPDATE THE INTERMEDIATE DATA FIELDS
        intermediateDataModel.setIntermediateDataType(intermediateDataView.getIntermediateDataType());
        intermediateDataModel.setSoftware(intermediateDataView.getSoftware());
        intermediateDataModel.setSoftwareVersion(intermediateDataView.getSoftwareVersion());
        intermediateDataModel.setSoftwareConfiguration(intermediateDataView.getSoftwareConfiguration());
        intermediateDataModel.setMotivation(intermediateDataView.getMotivation());
        intermediateDataModel.setResults(intermediateDataView.getResults());

        intermediateDataModel.setPreviousSteps(intermediateDataView.getPreviousSteps());

        //UPDATE SPECIFIC ATTRIBUTES
        //TODO PENSAR MEJOR
        var fields = intermediateDataView.queryById('specificFields').query('field');
        var fieldName, fieldValue;
        for (var i in fields) {
            fieldName = fields[i].getName();
            if (fieldName != null) {
                fieldValue = fields[i].getValue();
                if (fieldValue != null) {
                    intermediateDataModel.set(fieldName, fieldValue);
                }
            }
        }

        //UPDATE THE QUALITY REPORT ATTRIBUTES
        var qualityReportField = intermediateDataView.getAssociatedQualityReportField();
        var qualityReportModel = Ext.create('SL.model.AnalysisModels.QualityReport');
        qualityReportModel.setSoftware(qualityReportField.getSoftware());
        qualityReportModel.setSoftwareVersion(qualityReportField.getSoftwareVersion());
        qualityReportModel.setSoftwareConfiguration(qualityReportField.getSoftwareConfiguration());
        qualityReportModel.setResults(qualityReportField.getResults());
        qualityReportModel.setFileLocation(qualityReportField.getFileLocation());
        qualityReportModel.setSubmissionDate(qualityReportField.getSubmissionDate());
        qualityReportModel = (qualityReportModel.isEmpty()) ? null : qualityReportModel;

        intermediateDataModel.setAssociatedQualityReport(qualityReportModel);

        //ADD THE NEW STEP MODEL TO THE ANALYISI MODEL
        analysisModel.addNonProcessedData(intermediateDataModel);

        //ADD THE TASK TO CREATE THE NEW BIOREPLICATE IN THE SERVER SIDE
        intermediateDataView.addNewTask("add_new_step", intermediateDataModel);
        for (var task in intermediateDataView.getTaskQueue()) {
            analysisView.addNewTask(intermediateDataView.getTaskQueue()[task].command, intermediateDataView.getTaskQueue()[task].object);
        }

        analysisView.setUpdateNeededWorkflowPanel(true);
        analysisView.updateWorkflowPanel();
        intermediateDataView.setLoading(false);
        //CLOSE THE WINDOW
        button.up('window').close();
    },
    /**
     * This function handles the event fires when the button "Ass step" is pressed when a Intermediate data step
     * is selected.
     * 
     * @param {type} analysisView
     * @param {type} intermediateDataModel
     * @returns {undefined}
     */
    showIntermediateDataEditionDialogHandler: function(analysisView, intermediateDataModel) {
        var theController = this;

        //1. Check if user can edit the step
        var current_user_id = '' + Ext.util.Cookies.get('loggedUser');
        if (intermediateDataModel.isOwner(current_user_id) === false && current_user_id !== "admin") {
            console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over this step.");
            showErrorMessage("User " + current_user_id + " has not Edition privileges over the selected step.</br>Only Owners can edit this information. Please, contact with listed owners or with EMS's administrator to get more privileges.", '');
            return;
        }
        analysisView.setLoading(true);

        //2.Create the edition window
        var editionWindow = Ext.create('Ext.window.Window', {
            title: 'Intermediate step edition', bodyPadding: '30 50 30 50', bodyStyle: {'background': "white"},
            layout: {type: 'vbox', align: 'stretch'}, closable: false, modal: true, autoScroll: true,
            previousPanel: null,
            parent: analysisView,
            items: [],
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', handler: theController.showIntermediateDataEditionAcceptButtonClickHandler},
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function() {
                        //analysis_view.queryById('analysisWorkflowPanel').updateNeccesary=true;
                        //analysis_view.onAnalysisWorkflowPanelShow(analysis_view.queryById('analysisWorkflowPanel'));
                        this.up('window').close();
                    }
                }
            ]
        });

        var intermediateDataView = Ext.create('SL.view.AnalysisViews.IntermediateDataViews.IntermediateDataView');
        intermediateDataView.parent = analysisView;
        intermediateDataModel.addObserver(intermediateDataView);
        //       TODO:  intermediateDataView.memento = intermediateDataModel.getMemento();
        intermediateDataView.setViewMode("edition", {inWizardMode : analysisView.isInWizardMode()});
        intermediateDataView.loadModel(intermediateDataModel);
        intermediateDataView.setLastEditionDate(new Date());

        intermediateDataView.addNewTask("edit_step", intermediateDataModel);

        editionWindow.add(intermediateDataView);
        editionWindow.setHeight(Ext.getBody().getViewSize().height * 0.9);
        editionWindow.setWidth(Ext.getBody().getViewSize().width * 0.8);
        editionWindow.center();
        editionWindow.show();
        analysisView.setLoading(false);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} button
     * @returns {undefined}
     */
    showIntermediateDataEditionAcceptButtonClickHandler: function(button) {
        //GET THE BIOREPLICATEVIEW PANEL
        var intermediateDataView = button.up('window').down('IntermediateDataView');
        intermediateDataView.setLoading(true);
        //GET THE ANALYSISVIEW PANEL OWNER OF THIS WINDOW   
        var analysisView = button.up('window').parent;

        // make sure the form contains valid data before submitting
        if (!intermediateDataView.validateContent()) {
            intermediateDataView.setLoading(false);
            console.error((new Date()).toLocaleString() + "ADDING NEW STEP ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            showErrorMessage('Invalid Data. Please correct form errors.');
            return;
        }

        //Update the model
        var intermediateDataModel = intermediateDataView.getModel();
        //UPDATE NON PROCESSED DATA FIELDS
        intermediateDataModel.setName(intermediateDataView.getName());
        intermediateDataModel.setFileLocation(intermediateDataView.getFileLocation());
        intermediateDataModel.setLastEditionDate(intermediateDataView.getLastEditionDate());
        intermediateDataModel.setOwners([]);
        var owners = intermediateDataView.getOwners();
        for (var i in owners) {
            intermediateDataModel.addOwner(owners[i]);
        }
        //UPDATE THE INTERMEDIATE DATA FIELDS
        intermediateDataModel.setIntermediateDataType(intermediateDataView.getIntermediateDataType());
        intermediateDataModel.setSoftware(intermediateDataView.getSoftware());
        intermediateDataModel.setSoftwareVersion(intermediateDataView.getSoftwareVersion());
        intermediateDataModel.setSoftwareConfiguration(intermediateDataView.getSoftwareConfiguration());
        intermediateDataModel.setMotivation(intermediateDataView.getMotivation());
        intermediateDataModel.setResults(intermediateDataView.getResults());

        intermediateDataModel.setPreviousSteps(intermediateDataView.getPreviousSteps());

        //UPDATE SPECIFIC ATTRIBUTES
        //TODO PENSAR MEJOR
        var fields = intermediateDataView.queryById('specificFields').query('field');
        var fieldName, fieldValue;
        for (var i in fields) {
            fieldName = fields[i].getName();
            if (fieldName != null) {
                fieldValue = fields[i].getValue();
                if (fieldValue != null) {
                    intermediateDataModel.set(fieldName, fieldValue);
                }
            }
        }

        //UPDATE THE QUALITY REPORT ATTRIBUTES
        var qualityReportField = intermediateDataView.getAssociatedQualityReportField();
        var qualityReportModel = intermediateDataModel.getAssociatedQualityReport();
        if (qualityReportModel == null) {
            qualityReportModel = Ext.create('SL.model.AnalysisModels.QualityReport');
        }
        qualityReportModel.setSoftware(qualityReportField.getSoftware());
        qualityReportModel.setSoftwareVersion(qualityReportField.getSoftwareVersion());
        qualityReportModel.setSoftwareConfiguration(qualityReportField.getSoftwareConfiguration());
        qualityReportModel.setResults(qualityReportField.getResults());
        qualityReportModel.setFileLocation(qualityReportField.getFileLocation());
        qualityReportModel.setSubmissionDate(qualityReportField.getSubmissionDate());
        qualityReportModel = (qualityReportModel.isEmpty()) ? null : qualityReportModel;

        intermediateDataModel.setAssociatedQualityReport(qualityReportModel);

        //ADD THE TASK TO REPLICATE CHANGES IN THE STEP IN THE SERVER SIDE
        for (var task in intermediateDataView.getTaskQueue()) {
            analysisView.addNewTask(intermediateDataView.getTaskQueue()[task].command, intermediateDataView.getTaskQueue()[task].object);
        }

        analysisView.getModel().setChanged();
        analysisView.setUpdateNeededWorkflowPanel(true);
        analysisView.updateWorkflowPanel();
        intermediateDataModel.deleteObserver(intermediateDataView);
        intermediateDataModel.notifyObservers();
        intermediateDataView.setLoading(false);
        //CLOSE THE WINDOW
        button.up('window').close();
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} analysisView
     * @param {type} intermediateDataModel
     * @returns {undefined}
     */
    showIntermediateDataCloningDialogHandler: function(analysisView, intermediateDataModel) {
        var newInstance = intermediateDataModel.clone();
        this.showIntermediateDataCreationDialogHandler(analysisView, newInstance);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} intermediateDataView
     * @param {type} newIntermediateDataType
     * @returns {undefined}
     */
    intermediateDataTypeComboboxChangeHandler: function(intermediateDataView, newIntermediateDataType) {
        //Get the name of the new type
        var firstChar = newIntermediateDataType.charAt(0).toUpperCase();
        newIntermediateDataType = firstChar + newIntermediateDataType.substring(1);

        var newIntermediateDataModel = Ext.create('SL.model.AnalysisModels.IntermediateDataModels.' + newIntermediateDataType);
        //UPDATE NON PROCESSED DATA FIELDS
        newIntermediateDataModel.setID(intermediateDataView.getID());
        newIntermediateDataModel.setName(intermediateDataView.getName());
        newIntermediateDataModel.setFileLocation(intermediateDataView.getFileLocation());
        newIntermediateDataModel.setSubmissionDate(intermediateDataView.getSubmissionDate());
        newIntermediateDataModel.setLastEditionDate(intermediateDataView.getLastEditionDate());
        newIntermediateDataModel.setOwners([]);
        var owners = intermediateDataView.getOwners();
        for (var i in owners) {
            newIntermediateDataModel.addOwner(owners[i]);
        }
        //UPDATE THE INTERMEDIATE DATA FIELDS
        newIntermediateDataModel.setIntermediateDataType(newIntermediateDataType.toLowerCase());
        newIntermediateDataModel.setSoftware(intermediateDataView.getSoftware());
        newIntermediateDataModel.setSoftwareVersion(intermediateDataView.getSoftwareVersion());
        newIntermediateDataModel.setSoftwareConfiguration(intermediateDataView.getSoftwareConfiguration());
        newIntermediateDataModel.setMotivation(intermediateDataView.getMotivation());
        newIntermediateDataModel.setResults(intermediateDataView.getResults());
        newIntermediateDataModel.setPreviousStepsIDs(intermediateDataView.getModel().getPreviousSteps());
        newIntermediateDataModel.setStepNumber(intermediateDataView.getModel().getStepNumber());

        intermediateDataView.getModel().deleteObserver(intermediateDataView);
        intermediateDataView.loadModel(newIntermediateDataModel);
        newIntermediateDataModel.addObserver(intermediateDataView);
    }
});
