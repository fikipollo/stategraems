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
 * - RAWDataController
 * 
 * THIS CONTROLLER CONTAINS THE FOLLOWING HANDLERS
* - showRAWDataCreationDialogHandler
* - inspectAnalyticalReplicateButtonClick
* - showRAWDataCreationAcceptButtonClickHandler
* - showRAWDataEditionDialogHandler
* - showRAWDataEditionAcceptButtonClickHandler
* - showRAWDataCloningDialogHandler
* - extractionMethodTypeComboboxChangeHandler
* - searchAnalyticalReplicateButtonClick
 * 
 */
Ext.define('SL.controller.RAWDataController', {
    extend: 'Ext.app.Controller',
    /**
     * This function handles the event fires when the button "Add step" is pressed when a Raw data step
     * is selected.
     * 
     * @param {type} analysisView
     * @param {type} newRawDataModel
     * @returns {undefined}
     */
    showRAWDataCreationDialogHandler: function (analysisView, newRawDataModel) {
        var theController = this;
        analysisView.setLoading(true);
        //1.Create the edition window
        var creationWindow = Ext.create('Ext.window.Window', {
            title: 'Raw data annotation', bodyPadding: '30 50 30 50', bodyStyle: {'background': "white"},
            layout: {type: 'vbox', align: 'stretch'}, closable: false, modal: true, autoScroll: true,
            previousPanel: null,
            parent: analysisView,
            items: [],
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', handler: theController.showRAWDataCreationAcceptButtonClickHandler},
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function () {
                        this.up('window').close()
                    }
                }
            ]
        });
        //2.Create the new model
        var analysisModel = analysisView.getModel();
        var fakeStepID = analysisModel.getNextFakeStepID();

        if (newRawDataModel == null) {
            newRawDataModel = Ext.create('SL.model.AnalysisModels.RAWDataModels.RAWData');
        }

        newRawDataModel.setID(fakeStepID);
        newRawDataModel.setSubmissionDate(new Date());
        newRawDataModel.setLastEditionDate(new Date());
        newRawDataModel.addOwner(Ext.util.Cookies.get('loggedUser'));

        var rawDataView = Ext.create('SL.view.AnalysisViews.RAWDataViews.RAWDataView');
        rawDataView.parent = analysisView;
        newRawDataModel.addObserver(rawDataView);
        rawDataView.loadModel(newRawDataModel);

        rawDataView.setViewMode("creation", {inWizardMode: analysisView.isInWizardMode()});

        rawDataView.addNewTask("add_new_step", newRawDataModel);

        creationWindow.add(rawDataView);
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
    inspectAnalyticalReplicateButtonClick: function (elementSelectorField) {
        var analyticalSampleID = elementSelectorField.getValue();
        if (analyticalSampleID === "") {
            return;
        }
        var bioconditionID = analyticalSampleID.split(".")[0].replace("AR", "BC");
        this.getController('BioConditionController').showBiologicalConditionDetailsWindow(bioconditionID);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} button
     * @returns {undefined}
     */
    showRAWDataCreationAcceptButtonClickHandler: function (button) {
        //GET THE BIOREPLICATEVIEW PANEL
        var rawDataView = button.up('window').down('RAWDataView');
        rawDataView.setLoading(true);
        //GET THE ANALYSISVIEW PANEL OWNER OF THIS WINDOW   
        var analysisView = button.up('window').parent;
        //GET THE ANALYSIS MODEL ASSOCIATED TO THE BioConditionVIEW OWNER PANEL
        var analysisModel = analysisView.getModel();

        // make sure the form contains valid data before submitting
        if (!rawDataView.validateContent()) {
            rawDataView.setLoading(false);
            console.error((new Date()).toLocaleString() + "ADDING NEW STEP ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            showErrorMessage('Invalid Data. Please correct form errors.');
            return;
        }

        //Update the model
        var rawDataModel = rawDataView.getModel();
        //UPDATE NON PROCESSED DATA FIELDS
        rawDataModel.setName(rawDataView.getName());
        rawDataModel.setFileLocation(rawDataView.getFileLocation());
        rawDataModel.setSubmissionDate(rawDataView.getSubmissionDate());
        rawDataModel.setLastEditionDate(rawDataView.getLastEditionDate());
        rawDataModel.setOwners([]);
        var owners = rawDataView.getOwners();
        for (var i in owners) {
            rawDataModel.addOwner(owners[i]);
        }

        //UPDATE RAW DATA FIELDS
        rawDataModel.setAnalyticalReplicateID(rawDataView.getAnalyticalReplicateID());
        rawDataModel.setRawDataType(rawDataView.getExtractionMethodType());
        rawDataModel.setExtractionMethod(rawDataView.getExtractionMethod());

        //UPDATE SPECIFIC EXTRACTION METHOD ATTRIBUTES
        //TODO: change this code?
        var fields = rawDataView.queryById('specificDetailsPanel').query('field');
        var fieldName, fieldValue;
        var extractionMethodModel = rawDataModel.getExtractionMethod();
        for (var i in fields) {
            fieldName = fields[i].getName();
            if (fieldName != null) {
                fieldValue = fields[i].getValue();
                if (fieldValue != null) {
                    extractionMethodModel.set(fieldName, fieldValue);
                }
            }
        }

        //UPDATE SPECIFIC SEPARATION METHOD ATTRIBUTES
        //TODO: change this code?
        if (rawDataView.getSeparationMethodType() != null && rawDataView.getSeparationMethodType() != "None") {
            extractionMethodModel.setSeparationMethod(rawDataView.getSeparationMethod());

            fields = rawDataView.queryById('separationMethodView').query('field');
            var separationMethodModel = extractionMethodModel.getSeparationMethod();
            for (var i in fields) {
                fieldName = fields[i].getName();
                if (fieldName != null) {
                    fieldValue = fields[i].getValue();
                    if (fieldValue != null) {
                        separationMethodModel.set(fieldName, fieldValue);
                    }
                }
            }

            if (separationMethodModel.setMobilePhases !== undefined) {
                var mobilePhaseViews = rawDataView.query('MobilePhaseView');
                var mobilePhases = [];
                var mobilePhaseAux;
                for (var i in mobilePhaseViews) {
                    mobilePhaseAux = new MobilePhase("", "");
                    mobilePhaseAux.setName(mobilePhaseViews[i].getName());
                    mobilePhaseAux.setDescription(mobilePhaseViews[i].getDescription());
                    mobilePhases.push(mobilePhaseAux);
                }
                separationMethodModel.setMobilePhases(mobilePhases);
            }

            if (separationMethodModel.setFractions !== undefined) {
                var fractionViews = rawDataView.query('FractionView');
                var fractions = [];
                var fractionAux;
                for (var i in fractionViews) {
                    fractionAux = new Fraction("", "");
                    fractionAux.setName(fractionViews[i].getName());
                    fractionAux.setDescription(fractionViews[i].getDescription());
                    fractions.push(fractionAux);
                }
                separationMethodModel.setFractions(fractions);
            }
        }

        //UPDATE THE QUALITY REPORT ATTRIBUTES
        var qualityReportField = rawDataView.getAssociatedQualityReportField();
        var qualityReportModel = Ext.create('SL.model.AnalysisModels.QualityReport');
        qualityReportModel.setSoftware(qualityReportField.getSoftware());
        qualityReportModel.setSoftwareVersion(qualityReportField.getSoftwareVersion());
        qualityReportModel.setSoftwareConfiguration(qualityReportField.getSoftwareConfiguration());
        qualityReportModel.setResults(qualityReportField.getResults());
        qualityReportModel.setFileLocation(qualityReportField.getFileLocation());
        qualityReportModel.setSubmissionDate(qualityReportField.getSubmissionDate());
        qualityReportModel = (qualityReportModel.isEmpty()) ? null : qualityReportModel;

        rawDataModel.setAssociatedQualityReport(qualityReportModel);

        //ADD THE NEW STEP MODEL TO THE ANALYISI MODEL
        analysisModel.addNonProcessedData(rawDataModel);

        //ADD THE TASK TO CREATE THE NEW STEP IN THE SERVER SIDE
        for (var task in rawDataView.getTaskQueue()) {
            analysisView.addNewTask(rawDataView.getTaskQueue()[task].command, rawDataView.getTaskQueue()[task].object);
        }

        //REFRESH THE BioCondition VIEW PANEL WITH THE NEW CONTENT
        analysisView.setUpdateNeededWorkflowPanel(true);
        analysisView.updateWorkflowPanel();
        rawDataView.setLoading(false);
        //CLOSE THE WINDOW
        button.up('window').close();
    },
    /**
     * This function handles the event fires when the button "Edit step" is pressed when a Raw data step
     * is selected.
     * 
     * @param {type} analysisView
     * @param {type} rawDataModel
     * @returns {undefined}
     */
    showRAWDataEditionDialogHandler: function (analysisView, rawDataModel) {
        var theController = this;

        //1. Check if user can edit the step
        var current_user_id = '' + Ext.util.Cookies.get('loggedUser');
        if (rawDataModel.isOwner(current_user_id) === false && current_user_id !== "admin") {
            console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over this step.");
            showErrorMessage("User " + current_user_id + " has not Edition privileges over the selected step.</br>Only Owners can edit this information. Please, contact with listed owners or with EMS's administrator to get more privileges.", '');
            return;
        }
        analysisView.setLoading(true);

        //2.Create the edition window
        var editionWindow = Ext.create('Ext.window.Window', {
            title: 'Raw data edition',
            layout: {type: 'vbox', align: 'stretch'}, closable: false, modal: true, autoScroll: true,
            previousPanel: null, bodyPadding: '30 50 30 50', bodyStyle: {'background': "white"},
            parent: analysisView,
            items: [],
            buttons: [
                {text: '<i class="fa fa-accept"></i> Accept', cls: 'acceptButton', handler: theController.showRAWDataEditionAcceptButtonClickHandler},
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function () {
                        this.up('window').close();
                    }
                }
            ]
        });

        var rawDataView = Ext.create('SL.view.AnalysisViews.RAWDataViews.RAWDataView');
        rawDataView.parent = analysisView;
        rawDataModel.addObserver(rawDataView);
//       TODO:  rawDataView.memento = rawDataModel.getMemento();
        rawDataView.setViewMode("edition", {inWizardMode: analysisView.isInWizardMode()});
        rawDataView.loadModel(rawDataModel);
        rawDataView.setLastEditionDate(new Date());

        rawDataView.addNewTask("edit_step", rawDataModel);

        editionWindow.add(rawDataView);
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
    showRAWDataEditionAcceptButtonClickHandler: function (button) {
        //GET THE BIOREPLICATEVIEW PANEL
        var rawDataView = button.up('window').down('RAWDataView');
        rawDataView.setLoading(true);
        //GET THE ANALYSISVIEW PANEL OWNER OF THIS WINDOW   
        var analysisView = button.up('window').parent;

        // make sure the form contains valid data before submitting
        if (!rawDataView.validateContent()) {
            rawDataView.setLoading(false);
            console.error((new Date()).toLocaleString() + "ADDING NEW STEP ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            showErrorMessage('Invalid Data. Please correct form errors.');
            return;
        }

        //Update the model
        var rawDataModel = rawDataView.getModel();
        //UPDATE NON PROCESSED DATA FIELDS
        rawDataModel.setName(rawDataView.getName());
        rawDataModel.setFileLocation(rawDataView.getFileLocation());
        rawDataModel.setLastEditionDate(rawDataView.getLastEditionDate());
        rawDataModel.setOwners([]);
        var owners = rawDataView.getOwners();
        for (var i in owners) {
            rawDataModel.addOwner(owners[i]);
        }

        //UPDATE RAW DATA FIELDS
        rawDataModel.setAnalyticalReplicateID(rawDataView.getAnalyticalReplicateID());
        rawDataModel.setRawDataType(rawDataView.getExtractionMethodType());
        rawDataModel.setExtractionMethod(rawDataView.getExtractionMethod());

        //UPDATE SPECIFIC EXTRACTION METHOD ATTRIBUTES
        //TODO PENSAR MEJOR
        var fields = rawDataView.queryById('specificDetailsPanel').query('field');
        var fieldName, fieldValue;
        var extractionMethodModel = rawDataModel.getExtractionMethod();
        for (var i in fields) {
            fieldName = fields[i].getName();
            if (fieldName != null) {
                fieldValue = fields[i].getValue();
                if (fieldValue != null) {
                    extractionMethodModel.set(fieldName, fieldValue);
                }
            }
        }

        //UPDATE SPECIFIC SEPARATION METHOD ATTRIBUTES
        //TODO: change this code?
        if (rawDataView.getSeparationMethodType() != null && rawDataView.getSeparationMethodType() != "None") {
            extractionMethodModel.setSeparationMethod(rawDataView.getSeparationMethod());

            fields = rawDataView.queryById('separationMethodView').query('field');
            var separationMethodModel = extractionMethodModel.getSeparationMethod();
            for (var i in fields) {
                fieldName = fields[i].getName();
                if (fieldName != null) {
                    fieldValue = fields[i].getValue();
                    if (fieldValue != null) {
                        separationMethodModel.set(fieldName, fieldValue);
                    }
                }
            }

            if (separationMethodModel.setMobilePhases !== undefined) {
                var mobilePhaseViews = rawDataView.query('MobilePhaseView');
                var mobilePhases = [];
                var mobilePhaseAux;
                for (var i in mobilePhaseViews) {
                    mobilePhaseAux = new MobilePhase("", "");
                    mobilePhaseAux.setName(mobilePhaseViews[i].getName());
                    mobilePhaseAux.setDescription(mobilePhaseViews[i].getDescription());
                    mobilePhases.push(mobilePhaseAux);
                }
                separationMethodModel.setMobilePhases(mobilePhases);
            }

            if (separationMethodModel.setFractions !== undefined) {
                var fractionViews = rawDataView.query('FractionView');
                var fractions = [];
                var fractionAux;
                for (var i in fractionViews) {
                    fractionAux = new Fraction("", "");
                    fractionAux.setName(fractionViews[i].getName());
                    fractionAux.setDescription(fractionViews[i].getDescription());
                    fractions.push(fractionAux);
                }
                separationMethodModel.setFractions(fractions);
            }
        }


        //UPDATE THE QUALITY REPORT ATTRIBUTES
        var qualityReportField = rawDataView.getAssociatedQualityReportField();
        var qualityReportModel = rawDataModel.getAssociatedQualityReport();
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

        rawDataModel.setAssociatedQualityReport(qualityReportModel);

        //ADD THE TASK TO REPLICATE CHANGES IN THE STEP IN THE SERVER SIDE
        for (var task in rawDataView.getTaskQueue()) {
            analysisView.addNewTask(rawDataView.getTaskQueue()[task].command, rawDataView.getTaskQueue()[task].object);
        }

        analysisView.getModel().setChanged();
        analysisView.setUpdateNeededWorkflowPanel(true);
        analysisView.updateWorkflowPanel();
        rawDataModel.notifyObservers();
        rawDataView.setLoading(false);
        //CLOSE THE WINDOW
        button.up('window').close();
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} analysisView
     * @param {type} rawDataModel
     * @returns {undefined}
     */
    showRAWDataCloningDialogHandler: function (analysisView, rawDataModel) {
        var newInstance = rawDataModel.clone();
        this.showRAWDataCreationDialogHandler(analysisView, newInstance);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} rawDataView
     * @param {type} newExtractionMethodType
     * @returns {undefined}
     */
    extractionMethodTypeComboboxChangeHandler: function (rawDataView, newExtractionMethodType) {
        var type = newExtractionMethodType.replace("-", "");

        //CHECKL IF THE NEW EXTRACTION METHOD HAS A SEPARATION METHOD SPECIFIED BY DEFAULT
        var separationMethodType = null;
        if (type === "GCMS") {
            type = "MassSpectrometry";
            separationMethodType = "GasChromatography";
        } else if (type === "LCMS") {
            type = "MassSpectrometry";
            separationMethodType = "LiquidChromatography";
        } else if (type === "CEMS") {
            type = "MassSpectrometry";
            separationMethodType = "CapillaryElectrophoresis";
        }
        var newExtractionMethodModel = Ext.create('SL.model.AnalysisModels.RAWDataModels.' + type);

        if (separationMethodType != null) {
            var separationMethodTypeModel = Ext.create('SL.model.AnalysisModels.RAWDataModels.' + separationMethodType);
            newExtractionMethodModel.setSeparationMethod(separationMethodTypeModel);
            newExtractionMethodModel.set('separation_method_type', separationMethodType);
        }

        var rawDataModel = rawDataView.getModel();
        //SET THE VALUES OF THE OTHER FIELDS (TO AVOID LOSE THEM)
        //UPDATE NON PROCESSED DATA FIELDS
        rawDataModel.setName(rawDataView.getName());
        rawDataModel.setFileLocation(rawDataView.getFileLocation());
        rawDataModel.setSubmissionDate(rawDataView.getSubmissionDate());
        rawDataModel.setLastEditionDate(rawDataView.getLastEditionDate());
        rawDataModel.setOwners([]);
        var owners = rawDataView.getOwners();
        for (var i in owners) {
            rawDataModel.addOwner(owners[i]);
        }

        //UPDATE RAW DATA FIELDS
        rawDataModel.setAnalyticalReplicateID(rawDataView.getAnalyticalReplicateID());
        rawDataModel.setExtractionMethod(newExtractionMethodModel);
        rawDataModel.setRawDataType(newExtractionMethodType);

        rawDataView.getModel().notifyObservers();
    },
    /********************************************************************************      
     * This function manages the event fires when the button "Search Analytical Replicate" 
     * is pressed during the RAW data creation.
     * Briefly the way of work is :
     *	1.	Creates a new dialog with a AnalyticalReplicateSelector panel inside and 4 buttons:
     *		Accept, Cancel, Next and Back.
     *	2.	Next and Back buttons change between BioCondition selection and Analytical Replicate selection.
     *		When Next is pressed and the Analytical replicate selection panel is showed, the afterrender event
     *		is fired and the information for the selected BioCondition is downloaded.
     *	3.	Cancel buttons closee the window.
     *	4.	Accept takes the selected Analytical Replicate and put the ID in the textfields of the 
     *		AnalyiticalReplicateSelector field.
     *
     * @param  elementSelectorField the ElementSelectorField which fired the event
     * @return   
     ********************************************************************************/
    searchAnalyticalReplicateButtonClick: function (elementSelectorField) {
        var selectionWindow = Ext.widget('AnalyticalReplicateSelectorWindow', {
            callBackFn: function (selectedAnalyticalReplicates) {
                var selectedAnalyticalReplicate = selectedAnalyticalReplicates[0];
                if (selectedAnalyticalReplicate != null) {
                    elementSelectorField.setValue(selectedAnalyticalReplicate.analytical_rep_id);
                    //TODO:mostrar el nombre siempre (ahora solo cuando se elige)
                    elementSelectorField.setDisplayedValue(selectedAnalyticalReplicate.analytical_rep_name);
                }
            }
        });
        selectionWindow.setHeight(Ext.getBody().getViewSize().height * 0.75);
        selectionWindow.setWidth(Ext.getBody().getViewSize().width * 0.6);

        selectionWindow.show();
    }
}); 