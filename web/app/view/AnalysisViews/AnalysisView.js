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
 * THIS FILE CONTAINS THE FOLLOWING COMPONENT DECLARATION
 * - AnalysisView
 * - AnalysisDetailsView
 * - AnalysisListView
 * - AnalysisListElement
 * 
 */
Ext.define('SL.view.AnalysisViews.AnalysisView', {
    requires: ['SL.model.AnalysisModels.Analysis'],
    mixins: {
        //Extends the Observer class
        View: 'SL.view.senchaExtensions.View',
        //Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer',
        //Extends the Command class
        Command: 'SL.view.senchaExtensions.Command'
    }
});

Ext.define('SL.view.AnalysisViews.AnalysisDetailsView', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.AnalysisDetailsView',
    mixins: {AnalysisView: "SL.view.AnalysisViews.AnalysisView"},
    requires: ['SL.view.AnalysisViews.RAWDataViews.RAWDataView', 'SL.view.AnalysisViews.IntermediateDataViews.IntermediateDataView', 'SL.view.AnalysisViews.ProcessedDataViews.ProcessedDataView'],
    /**BC******************************************************************************      
     * 
     * SOME ATTRIBUTES
     * 
     **EC******************************************************************************/
    inCreationMode: false,
    inEditionMode: false,
    inWizardMode: false,
    name: "AnalysisDetailsView",
    /**BC******************************************************************************      
     * 
     * GETTERS AND SETTERS
     * 
     **EC******************************************************************************/
    getAnalysisID: function () {
        return this.getModel().getID();
    },
    isInEditionMode: function () {
        return this.inEditionMode;
    },
    isInWizardMode: function () {
        return this.inWizardMode;
    },
    setMainTitle: function (newTitle) {
        this.queryById("mainTitle").update('<p class="form_title">' + newTitle + '</p>');
    },
    setHelpContent: function (helpText) {
        this.queryById("helpBox").update("<p style=' font-size: 18px; color: #A3A3A3; margin-left: 5px;'>" + helpText + '</p>');
    },
    getStepViews: function () {
        if (this.stepViews == null) {
            this.stepViews = {};
        }
        return this.stepViews;
    },
    getStepView: function (stepID) {
        return this.getStepViews()[stepID];
    },
    addStepView: function (stepID, stepView) {
        this.getStepViews()[stepID] = stepView;
    },
    removeStepView: function (stepID) {
        delete this.getStepViews()[stepID];
    },
    getSampleViews: function () {
        if (this.sampleViews == null) {
            this.sampleViews = {};
        }
        return this.sampleViews;
    },
    getSampleView: function (bioconditionID) {
        return this.getSampleViews()[bioconditionID];
    },
    addSampleView: function (bioconditionID, sampleView) {
        this.getSampleViews()[bioconditionID] = sampleView;
    },
    removeSampleView: function (bioconditionID) {
        delete this.getSampleViews()[bioconditionID];
    },
    /********************************************************************************      
     * This function returns the associated MODEL showed into the current VIEW 
     *  
     * @return a model      
     ********************************************************************************/
    getModel: function () {
        return this.model;
    },
    loadModel: function (model) {
        this.setLoading(true);

        if (this.getModel() != null) {
            this.model.deleteObserver(this);
            this.clearTaskQueue();
        }

        //Hide the panel temporaly to avoid problems with layout
        this.model = model;
        this.sampleViews = null;
        this.stepViews = null;

        this.analysisID = model.getID();
        this.queryById('analysisDataContainer').removeInnerPanels();
        if (model.non_processed_data().count() === 0) {
            this.queryById('analysisDataContainer').html = '<h2 style="font-size:20px; font-style:italic; color:#d6d6d6;text-align:center;padding-top:20px">No steps associated yet. Please, add new information.</h2>';
        } else {
            this.queryById('analysisDataContainer').html = '<h2 style="font-size:20px; font-style:italic; color:#d6d6d6;text-align:center;padding-top:20px">Please choose an step in the Workflow panel.</h2>';
        }

        this.updatePipelineStepsPanel();
        this.setLoading(false);
    },
    updateObserver: function () {
        this.loadModel(this.getModel());
    },
    updatePipelineStepsPanel: function () {
        this.queryById('analysisStepsGrid').setData(this.model.getNonProcessedData(), this.model.getProcessedData());
    },
    /********************************************************************************      
     * Due to the AnalysisDetailsView can be used to Inspect/Edit/Create Analysis, we need 
     * this function to custom the panel depending on the situation (set the buttons's 
     * visibility, the editable_mode of the formulary’s fields...
     *  
     * @param mode an option in ["edition", "creation", "inspect"]
     * @return      
     ********************************************************************************/
    setViewMode: function (mode) {
        this.setLoading(true);
        var buttons_status = "10001";
        var editableMode = false;

        switch (mode) {
            //EDITION
            case "edition":
                buttons_status = "00011";
                //The last task we should do is to liberate the blocked object
                //in case of error during insertion, we should close the panel and the object 
                //must be liberated (if not, an exception may caused that the object wasn't liberated)
                //The following task will be added when the Accept buttons is pressed, only if the
                //Analysis view has the EDITON MODE flag enabled.
                this.addNewTask("clear_blocked_status", null);
                this.addNewTask("send_analysis_image", null);
                editableMode = true;
                this.setMainTitle("Analysis Form - Edit analysis");
                break;

                //CREATION    
            case "creation":
                buttons_status = "00011";
                editableMode = true;
                //THE QUEUE OF TASKS THAT SHOULD BE CARRIED OUT WHEN PRESSING "ACCEPT" BUTTON
                this.addNewTask("create_new_analysis", null);
                this.addNewTask("send_analysis_image", null);
                this.setMainTitle("Analysis Form - New analysis");
                break;

                //WIZARD    
            case "wizard":
                buttons_status = "00101";
                editableMode = true;
                //THE QUEUE OF TASKS THAT SHOULD BE CARRIED OUT WHEN PRESSING "ACCEPT" BUTTON
                this.setMainTitle("Analysis Wizard - Step 1. Workflow definition");
                this.setHelpContent("Please, define the common pipeline for all the Analysis.");

                break;

                //INSPECT    
            case "inspect":
                buttons_status = "10001";
                editableMode = false;
                this.setMainTitle("Analysis Form");
                break;

            default:
                break;
        }


        application.mainView.setButtonsStatus(buttons_status);
        this.inEditionMode = (mode === "edition");
        this.inCreationMode = (mode === "creation");
        this.inWizardMode = (mode === "wizard");

        this.setLoading(false);
        this.queryById('associatedStepsTools').setVisible(editableMode);
    },
    setLoading: function (loading) {
        Ext.getCmp('mainViewCenterPanel').setLoading(loading);
        if (loading === true) {
            Ext.suspendLayouts();
        } else {
            Ext.resumeLayouts(true);
        }
    },
    showStepInformation: function (step_id) {
        var step_type = this.getModel().non_processed_data().findRecord('step_id', step_id);
        if (step_type != null) {
            step_type = step_type.get('type');
        } else {
            step_type = "Processed_data";
        }
        this.getController().workflowNodeClickHandler(this, step_type, step_id);
    },
    setUpdateNeededWorkflowPanel: function (updateNeeded) {
        var component = this.queryById("analysisWorkflowPanel");
        component.updateNeeded = updateNeeded;
    },
    updateWorkflowPanel: function (force) {
        force = (force === undefined) ? false : force;
        var workflowPanel = this.queryById('analysisWorkflowPanel');
        if (workflowPanel.updateNeeded === true || force === true) {
            workflowPanel.setLoading(true);
            var json_data = this.getModel().getJSONforGraph();
            this.cytoscape_graph = configureCytoscapeAnalysisGraph(workflowPanel, 'cytoscapeweb_analysis', json_data);
            workflowPanel.updateNeeded = false;
            workflowPanel.setLoading(false);
            this.setAddStepButtonsMode();
        }
        this.updatePipelineStepsPanel();
    },
    setAddStepButtonsMode: function () {
        var analysisModel = this.getModel();
//        this.queryById("addNewIntermediateDataStepOption").setDisabled(analysisModel.getNonProcessedData().count() < 1);
    },
    /**BC**************************************************************************************
     ** 
     ** SOME EVENTS HANDLERS
     ** 
     **EC**************************************************************************************/
    /**BC*********************************************************************************************************
     * This function handles the event fires when
     * 
     * @param clickedNodeData
     * @return 
     /**EC*********************************************************************************************************/
    onAddNewNodeHandler: function (clickedNodeData) {
        var analysisView = this.up("AnalysisDetailsView");
        if (!analysisView.inEditionMode && !analysisView.inCreationMode && !analysisView.inWizardMode) {
            showWarningMessage("Please, activate Edition mode first.", {soft: true, delay: 600});
            return;
        }

        var comboBoxOptions = [['processed_data', 'Processed data step']];
        if (clickedNodeData.type !== "Processed_data") {
            comboBoxOptions.push(['intermediate_data', 'Intermediate data step']);
        }

        var analysisTypeDialog = Ext.create('Ext.window.Window', {
            title: 'Please, choose the type for the new step type',
            height: 180, width: 380, layout: 'fit',
            closable: false, modal: true,
            items: [
                {xtype: 'container', border: false, layout: {type: 'vbox', align: 'stretch', pack: 'center'},
                    padding: 10, style: {'background': 'white'},
                    items: [{
                            xtype: 'combobox', cls: 'combobox',
                            fieldLabel: 'New step type',
                            emptyText: "Choose the new step type", editable: false,
                            displayField: 'value', valueField: 'value',
                            store: comboBoxOptions
                        }]
                }],
            buttons: [{
                    text: 'Accept',
                    cls: 'acceptButton',
                    handler: function () {
                        var stepType = this.up('window').down('combobox').getValue();
                        if (stepType == null) {
                            return;
                        }

                        if (stepType === "intermediate_data") {
                            application.getController("IntermediateDataController").showIntermediateDataCreationDialogHandler(analysisView, null, [clickedNodeData.id]);
                        } else {
                            //Handled by ProcessedDataController
                            application.getController("ProcessedDataController").showProcessedDataCreationDialogHandler(analysisView, null, [clickedNodeData.id]);
                        }
                        analysisTypeDialog.close();
                    }
                }, {
                    text: 'Cancel',
                    cls: 'cancelButton',
                    handler: function () {
                        this.up('window').close();
                    }
                }]
        });
        analysisTypeDialog.show();
    },
    editStepButtonHandler: function () {
        var stepPanel = this.queryById('analysisDataContainer').getInnerPanel();
        if (stepPanel === null) {
            showWarningMessage("Please, choose first a step in the workflow panel.");
            return;
        }
        var stepModel = stepPanel.getModel();

        //CHECK IF THE STEP IS NOT AN IMPORTED STEP
        var currentAnalysisID = this.getModel().getID();
        var expectedOwnerAnalysisID = "AN" + stepModel.getID().slice(2).split(".")[0];
        if (currentAnalysisID !== expectedOwnerAnalysisID) {
            console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: Imported steps must be edited in their owner analysis.</br>Please go to Analysis " + expectedOwnerAnalysisID + " to edit this step.");
            showErrorMessage("Imported steps must be edited in their owner analysis.</br>Please go to Analysis " + expectedOwnerAnalysisID + " to edit this step.", {soft: true});
            return;
        }

        //DELEGATE THE EDITING EVENT TO THE CORRECT CONTROLLER
        if (stepModel instanceof SL.model.AnalysisModels.RAWDataModels.RAWData) {
            //Caught by RAWDataController
            application.getController("RAWDataController").showRAWDataEditionDialogHandler(this, stepModel);
        } else if (stepModel instanceof SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data) {
            //Caught by IntermediateDataController
            application.getController("IntermediateDataController").showIntermediateDataEditionDialogHandler(this, stepModel);
        } else if (stepModel instanceof SL.model.AnalysisModels.Processed_data) {
            //Caught by ProcessedDataController
            application.getController("ProcessedDataController").showProcessedDataEditionDialogHandler(this, stepModel);
        }
    },
    onEditSelectedNodeHandler: function (clickedNodeData) {
        var analysisView = this.up("AnalysisDetailsView");
        if (!analysisView.inEditionMode && !analysisView.inCreationMode && !analysisView.inWizardMode) {
            showWarningMessage("Please, activate Edition mode first.", {soft: true, delay: 600});
            return;
        }
        var toBeEditedModelID = clickedNodeData.id;
        //CHECK IF THE STEP IS NOT AN IMPORTED STEP
        var currentAnalysisID = analysisView.getModel().getID();
        var expectedOwnerAnalysisID = "AN" + toBeEditedModelID.slice(2).split(".")[0];
        if (currentAnalysisID !== expectedOwnerAnalysisID) {
            console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: Imported steps must be edited in their owner analysis.</br>Please go to Analysis " + expectedOwnerAnalysisID + " to edit this step.");
            showErrorMessage("Imported steps must be edited in their owner analysis.</br>Please go to Analysis " + expectedOwnerAnalysisID + " to edit this step.", {soft: true});
            return;
        }
        if (clickedNodeData.type === "RAWData") {
            var stepModel = analysisView.getModel().getNonProcessedDataByID(toBeEditedModelID);
            application.getController("RAWDataController").showRAWDataEditionDialogHandler(analysisView, stepModel);
        } else if (clickedNodeData.type === "Intermediate_step") {
            var stepModel = analysisView.getModel().getNonProcessedDataByID(toBeEditedModelID);
            application.getController("IntermediateDataController").showIntermediateDataEditionDialogHandler(analysisView, stepModel);
        } else if (clickedNodeData.type === "Processed_data") {
            var stepModel = analysisView.getModel().getProcessedDataByID(toBeEditedModelID);
            application.getController("ProcessedDataController").showProcessedDataEditionDialogHandler(analysisView, stepModel);
        }
    },
    /**BC*********************************************************************************************************
     * This function handles the event fires when
     * 
     * @return 
     /**EC*********************************************************************************************************/
    copyStepButtonClick: function () {
        var stepPanel = this.queryById('analysisDataContainer').getInnerPanel();
        if (stepPanel === null) {
            showWarningMessage("Please, choose first a step in the workflow panel.");
            return;
        }
        var stepModel = stepPanel.getModel();

        //DELEGATE THE EDITING EVENT TO THE CORRECT CONTROLLER
        if (stepModel instanceof SL.model.AnalysisModels.RAWDataModels.RAWData) {
            application.getController("RAWDataController").showRAWDataCloningDialogHandler(this, stepModel);
        }
        else if (stepModel instanceof SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data) {
            //Caught by IntermediateDataController
            application.getController("IntermediateDataController").showIntermediateDataCloningDialogHandler(this, stepModel);
        }
        else if (stepModel instanceof SL.model.AnalysisModels.Processed_data) {
            application.getController("ProcessedDataController").showProcessedDataCloningDialogHandler(this, stepModel);
        }
    },
    /**BC*********************************************************************************************************
     * This function handles the event fires when
     * 
     * @param clickedNodeData
     * @return 
     /**EC*********************************************************************************************************/
    onCopySelectedNodeHandler: function (clickedNodeData) {
        var analysisView = this.up("AnalysisDetailsView");
        if (!analysisView.inEditionMode && !analysisView.inCreationMode && !analysisView.inWizardMode) {
            showWarningMessage("Please, activate Edition mode first.", {soft: true, delay: 600});
            return;
        }
        var toBeEditedModelID = clickedNodeData.id;

        if (clickedNodeData.type === "RAWData") {
            var stepModel = analysisView.getModel().getNonProcessedDataByID(toBeEditedModelID);
            application.getController("RAWDataController").showRAWDataCloningDialogHandler(analysisView, stepModel);
        } else if (clickedNodeData.type === "Intermediate_step") {
            var stepModel = analysisView.getModel().getNonProcessedDataByID(toBeEditedModelID);
            application.getController("IntermediateDataController").showIntermediateDataCloningDialogHandler(analysisView, stepModel);
        } else if (clickedNodeData.type === "Processed_data") {
            var stepModel = analysisView.getModel().getProcessedDataByID(toBeEditedModelID);
            application.getController("ProcessedDataController").showProcessedDataCloningDialogHandler(analysisView, stepModel);
        }
    },
    /**BC*********************************************************************************************************
     * This function handles the event fires when
     * 
     * @return 
     /**EC*********************************************************************************************************/
    deleteStepButtonHandler: function () {
        var me = this;
        var askToContinue = function (buttonId) {
            if (buttonId === "yes") {
                var toBeRemovedModelID = null;
                var stepPanel = me.queryById('analysisDataContainer').getInnerPanel();
                if (stepPanel != null) {
                    toBeRemovedModelID = stepPanel.getModel().getID();
                } else {
                    showWarningMessage("Please, choose first an item at the diagram.");
                }
                if (toBeRemovedModelID != null) {
                    me.getController().deleteStepButtonHandler(me, toBeRemovedModelID);
                }
            }
        };
        Ext.MessageBox.show({
            title: 'Delete Selected step?',
            msg: 'After saving, changes can not be undone.<br/>Are you sure to continue?',
            buttons: Ext.MessageBox.YESNO,
            fn: askToContinue,
            icon: Ext.MessageBox.QUESTION
        });
    },
    /**BC*********************************************************************************************************
     * This function handles the event fires when
     * 
     * @param clickedNodeData
     * @return 
     /**EC*********************************************************************************************************/
    onRemoveSelectedNodeHandler: function (clickedNodeData) {
        var analysisView = this.up("AnalysisDetailsView");
        if (!analysisView.inEditionMode && !analysisView.inCreationMode && !analysisView.inWizardMode) {
            showWarningMessage("Please, activate Edition mode first.", {soft: true, delay: 600});
            return;
        }
        var me = analysisView;
        var askToContinue = function (buttonId) {
            if (buttonId === "yes") {
                if (clickedNodeData.type === "Processed_data" || clickedNodeData.type === "Intermediate_step" || clickedNodeData.type === "RAWData") {
                    var toBeRemovedModelID = clickedNodeData.id;
                    if (toBeRemovedModelID != null) {
                        me.getController().deleteStepButtonHandler(me, toBeRemovedModelID);
                    }
                }
            }
        };
        Ext.MessageBox.show({
            title: 'Delete Selected step?',
            msg: 'After saving, changes can not be undone.<br/>Are you sure to continue?',
            buttons: Ext.MessageBox.YESNO,
            fn: askToContinue,
            icon: Ext.MessageBox.QUESTION
        });
    },
    /**BC*********************************************************************************************************
     * This function handles the event fires when
     * 
     * @param component
     * @return 
     /**EC*********************************************************************************************************/
    onAnalysisWorkflowPanelShow: function (component) {
        if (component.updateNeeded) {
            this.updateWorkflowPanel();
        }
    },
    /**BC*********************************************************************************************************
     * This function handles the event fires when
     * 
     * @return 
     /**EC*********************************************************************************************************/
    onAnalysisWorkflowPanelResize: function () {
        try {
            if (this.cytoscape_graph != null) {
                this.cytoscape_graph.resize();
                this.cytoscape_graph.fit();
            }
        } catch (error) {
        }
    },
    /**BC*********************************************************************************************************
     * This function handles the event fires when
     * 
     * @param field
     * @param newValue
     * @param oldValue
     * @return 
     /**EC*********************************************************************************************************/
    onComboboxChange: function (field, newValue, oldValue) {
        //CLEAR AND HIDE THE PREVIOUS SPECIFIC INTERMEDIATE DATA PANEL (IF EXISTS)
        if (oldValue != null && oldValue !== "") {
            var previousPanel = field.up('AnalysisDetailsView').queryById(oldValue + "_form");
            if (previousPanel != null) {
                // previousPanel.getForm().reset();
                previousPanel.disable();
                previousPanel.hide();
                previousPanel.defaults.submitValue = false;
            }
        }

        if (newValue === "") {
            return;
        }

        var newPanel = field.up('AnalysisDetailsView').queryById(newValue + "_form");

        if (newPanel != null) {
            //newPanel.getForm().reset();
            newPanel.enable();
            newPanel.setVisible(true);
            previousPanel.defaults.submitValue = true;
        }
    },
    /**BC*********************************************************************************************************
     * This function handles the event fires when
     * @param component
     * @return 
     /**EC*********************************************************************************************************/
    onAnalysisViewPanelBeforeDestroy: function (component) {
        if (component.getModel() != null) {
            component.getModel().deleteObserver(component);
        }
        if (component.timerID1 != null) {
            clearTimeout(component.timerID1);
            console.info('Removed count-down timer 1');
        }
        if (component.timerID2 != null) {
            clearTimeout(component.timerID2);
            console.info('Removed count-down timer 2');
        }
    },
    /**BC*********************************************************************************************************
     * This function handles the event fires when
     * 
     * @param clickedNodeData
     * @return 
     /**EC*********************************************************************************************************/
    onNodeClickHandler: function (clickedNodeData) {
        var clicked_step_id = clickedNodeData.id;
        var step_type = clickedNodeData.type;

        this.up('AnalysisDetailsView').getController().workflowNodeClickHandler(this.up('AnalysisDetailsView'), step_type, clicked_step_id);
    },
    /**BC****************************************************************************************
     * 
     * COMPONENT DEFINITION
     * 
     **EC****************************************************************************************/
    initComponent: function () {
        var me = this;

        this.setController(application.getController("AnalysisController"));

        var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: '{columnName}: {name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
            hideGroupedHeader: true,
            startCollapsed: false
        });

        me.border = 0;
        Ext.apply(me, {
            layout: {type: 'vbox', align: 'stretch'}, border: 0, autoScroll: true, cls: 'analysisView',
            items: [
                {xtype: 'container', itemId: "analysisDetailsPanel", layout: {type: 'vbox', align: 'center'}, defaults: {width: "90%"}, border: 0,
                    items: [
                        {xtype: 'label', itemId: "mainTitle", html: '<p class="form_title">Analysis Form</p>'},
                        {xtype: 'label', html: "<h1 style='display: inline-block;' class='form_subtitle'>Analysis pipeline overview</h1>" +
                                    "<a id='showAnalysisPipelineDiagramToogle' class='toggleLink'><i class='fa fa-toggle-on'></i> Show diagram</a>" +
                                    "<a id='showAnalysisPipelineTableToogle'class='toggleLink'><i class='fa fa-toggle-on'></i> Show steps table </a>"},
                        {xtype: 'box', itemId: "helpBox", html: ''},
                        {xtype: 'box', itemId: "associatedStepsTools",
                            html: "  <h2 class='form_subtitle'>Step options</h2>" +
                                    "<a id='addNewRawDataOption' class='tableOption addOption' ><i class='fa fa-plus'> Raw</i></a>" +
                                    "<a id='addNewIntermediateOption' style='color: #269AE2;' class='tableOption addOption' ><i class='fa fa-plus'> Intermediate</i></a>" +
                                    "<a id='addNewProcessedOption' style='color: #9775C3;'  class='tableOption addOption' ><i class='fa fa-plus'> Processed</i></a>" +
                                    "<a id='copyStepOption' class='tableOption copyOption'><i class='fa fa-copy'></i></a>" +
                                    "<a id='importStepOption' class='tableOption importOption'><i class='fa fa-sitemap'></i></a>" +
                                    "<a id='editStepOption' class='tableOption editOption'><i class='fa fa-edit'></i></a>" +
                                    "<a id='deleteStepOption' class='tableOption deleteOption'><i class='fa fa-trash'></i></a>"
                        },
                        {xtype: 'container', itemId: 'analysisWorkflowPanelWrapper', layout: {align: 'stretch', type: 'hbox'}, cls: 'fieldBox',
                            items: [
                                {xtype: 'container', itemId: 'pipelineStepsPanelWrapper', flex: 2,
                                    items: [
                                        {xtype: 'label', html: '<h2>Analysis pipeline table</h2>'},
                                        {xtype: "box", html: '<i class="panelHelpTip"><i class="fa fa-info-circle"></i> Click on table entries to get detailed information for each step.</i>'},
                                        {xtype: "gridpanel", hideHeaders: true, itemId: 'analysisStepsGrid', multiSelect: false, maxHeight: 300, height: 300, features: [groupingFeature],
                                            store: Ext.create('Ext.data.ArrayStore', {groupField: 'step_type', fields: ['step_id', 'step_type', 'step_subtype', 'step_name']}),
                                            columns: [
                                                {text: 'Step type', dataIndex: 'step_type'},
                                                {text: 'Step name', minWidth: 200, flex: 1, dataIndex: 'step_name',
                                                    renderer: function (value, metaData, record, rowIndex) {
                                                        if (value === "")
                                                            return "Unnamed " + record.get("step_type") + " step " + (rowIndex + 1);
                                                        return value;
                                                    }},
                                                {text: 'Step subtype', dataIndex: 'step_subtype', width: 200,
                                                    renderer: function (value) {
                                                        if (value === undefined)
                                                            return "";
                                                        else {
                                                            var _value = value.replace(/_/g, " ");
                                                            return _value.charAt(0).toUpperCase() + _value.slice(1);
                                                        }
                                                    }
                                                }
                                            ],
                                            setData: function (nonProcessedDataList, processeDataList) {
                                                var myArrayData = [];
                                                for (var i = 0; i < nonProcessedDataList.getCount(); i++) {
                                                    myArrayData.push([nonProcessedDataList.getAt(i).getID(), nonProcessedDataList.getAt(i).getType() === "rawdata" ? "Raw data" : "Intermediate Data",
                                                        nonProcessedDataList.getAt(i).get('intermediate_data_type'), nonProcessedDataList.getAt(i).getName()]);
                                                }
                                                for (var i = 0; i < processeDataList.getCount(); i++) {
                                                    myArrayData.push([processeDataList.getAt(i).getID(), "Processed data", processeDataList.getAt(i).getProcessedDataType(), processeDataList.getAt(i).getName()]);
                                                }

                                                this.getStore().loadData(myArrayData);
                                                this.setLoading(false);
                                            },
                                            listeners: {
                                                itemclick: function (view, record) {
                                                    me.showStepInformation(record.get("step_id"));
                                                }
                                            }
                                        }
                                    ]},
                                {xtype: 'container', itemId: 'analysisDiagramPanelWrapper', layout: {align: 'stretch', type: 'vbox'}, padding: 5, flex: 3,
                                    items: [
                                        {xtype: 'label', html: '<h2>Analysis pipeline diagram</h2>'},
                                        {xtype: "box", html: '<i class="panelHelpTip"><i class="fa fa-info-circle"></i> Use the right-click context menu over the diagram nodes to add, remove or edit elements.</i>'},
                                        {xtype: 'container', itemId: 'analysisWorkflowPanel', updateNeeded: true, minHeight: 300, height: 300, resizable: true, resizeHandles: 'n,s', border: 1,
                                            html: '<div  class="cytoscapewebPanel" id="cytoscapeweb_analysis"></div><div id="note"></div>',
                                            nodeClickHandler: me.onNodeClickHandler,
                                            copySelectedNodeHandler: me.onCopySelectedNodeHandler,
                                            editSelectedNodeHandler: me.onEditSelectedNodeHandler,
                                            removeSelectedNodeHandler: me.onRemoveSelectedNodeHandler,
                                            addNewNodeHandler: me.onAddNewNodeHandler,
                                            listeners: {
                                                resize: {fn: me.onAnalysisWorkflowPanelResize, scope: me}
                                            }
                                        }
                                    ]
                                }


                            ]
                        }
                    ]
                },
                {xtype: 'panel', itemId: 'analysisDataContainer', border: 0, layout: {type: 'vbox', align: 'center'}, defaults: {width: "90%"}, minHeight: 200,
                    html: '<h2 style="font-size:20px; font-style:italic; color:#d6d6d6;text-align:center;padding-top:20px">No step selected. </br>Click on a step on the Overview diagram to browse data</br>Or add new steps.</h2>',
                    innerPanel: null,
                    getInnerPanel: function () {
                        return this.innerPanel;
                    },
                    setInnerPanel: function (stepView, addStepView) {
                        var component = this;
                        if (component.getInnerPanel() !== null) {
                            component.getInnerPanel().setHidden(true);
                        }

                        component.innerPanel = stepView;
                        if (addStepView === true) {
                            component.add(stepView);
                            return;
                        }
                        if (stepView !== null) {
                            stepView.setHidden(false);
                        }
                        return component.innerPanel;
                    },
                    removeInnerPanels: function () {
                        this.innerPanel = null;
                        this.removeAll();
                    }
                }
            ],
            listeners: {
                boxready: function () {
                    var me = this;
                    $("#showAnalysisPipelineDiagramToogle").click(function () {
                        var component = me.queryById('analysisDiagramPanelWrapper');
                        var checked = $("#showAnalysisPipelineDiagramToogle i").hasClass("fa-toggle-on");
                        if (!checked) {
                            var task = new Ext.util.DelayedTask(function () {
                                component.setVisible(!checked);
                                component.getEl().fadeIn();
                                $("#showAnalysisPipelineDiagramToogle i").removeClass("fa-toggle-off");
                                $("#showAnalysisPipelineDiagramToogle i").addClass("fa-toggle-on");
                            });
                            task.delay(100);
                        } else {
                            component.getEl().fadeOut({callback: function () {
                                    component.setVisible(!checked);
                                    $("#showAnalysisPipelineDiagramToogle i").removeClass("fa-toggle-on");
                                    $("#showAnalysisPipelineDiagramToogle i").addClass("fa-toggle-off");
                                }});
                        }
                    });
                    $("#showAnalysisPipelineTableToogle").click(function () {
                        var component = me.queryById('pipelineStepsPanelWrapper');
                        var checked = $("#showAnalysisPipelineTableToogle i").hasClass("fa-toggle-on");
                        if (!checked) {
                            me.updatePipelineStepsPanel();

                            var task = new Ext.util.DelayedTask(function () {
                                component.setVisible(!checked);
                                component.getEl().fadeIn();
                                $("#showAnalysisPipelineTableToogle i").removeClass("fa-toggle-off");
                                $("#showAnalysisPipelineTableToogle i").addClass("fa-toggle-on");
                            });
                            task.delay(100);
                        } else {
                            component.getEl().fadeOut({callback: function () {
                                    component.setVisible(!checked);
                                    $("#showAnalysisPipelineTableToogle i").removeClass("fa-toggle-on");
                                    $("#showAnalysisPipelineTableToogle i").addClass("fa-toggle-off");
                                }});
                        }
                    });

                    var qtipData = {content: 'Annotate a new Raw data acquisition step', show: 'mouseover', hide: 'mouseout', style: {classes: 'qtip-tipsy qtip-shadow'}, position: {my: 'bottom center', at: 'top center'}};
                    $("#addNewRawDataOption").click(function () {
                        //Handled by RAWDataController
                        application.getController("RAWDataController").showRAWDataCreationDialogHandler(me, null);
                    }).qtip(qtipData);

                    qtipData.content = "Annotate a new Intermediate data generation step";
                    $("#addNewIntermediateOption").click(function () {
                        //Handled by IntermediateDataController
                        application.getController("IntermediateDataController").showIntermediateDataCreationDialogHandler(me, null);
                    }).qtip(qtipData);

                    qtipData.content = "Annotate a new Processed data generation step";
                    $("#addNewProcessedOption").click(function () {
                        //Handled by ProcessedDataController
                        application.getController("ProcessedDataController").showProcessedDataCreationDialogHandler(me, null);
                    }).qtip(qtipData);

                    qtipData.content = "Copy selected step";
                    $("#copyStepOption").click(function () {
                        me.copyStepButtonClick();
                    }).qtip(qtipData);

                    qtipData.content = "Import steps from other Analysis";
                    $("#importStepOption").click(function () {
                        me.getController().importStepButtonHandler(me);
                    }).qtip(qtipData);

                    qtipData.content = "Edit selected step";
                    $("#editStepOption").click(function () {
                        me.editStepButtonHandler();
                    }).qtip(qtipData);

                    qtipData.content = "Delete selected step";
                    $("#deleteStepOption").click(function () {
                        me.deleteStepButtonHandler();
                    }).qtip(qtipData);
                    me.onAnalysisWorkflowPanelResize();

                },
                afterlayout: function () {
                    //TODO: REMOVE THIS CODE
                    if (debugging === true)
                        console.info("AnalysisDetailsView : Layout");
                },
                beforedestroy: {
                    fn: me.onAnalysisViewPanelBeforeDestroy,
                    scope: me
                }
            }
        });

        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.AnalysisListView', {
    extend: 'Ext.container.Container',
    alias: 'widget.AnalysisListView',
    mixins: {AnalysisView: "SL.view.AnalysisViews.AnalysisView"},
    requires: ['Ext.grid.plugin.RowExpander', "SL.view.AnalysisViews.AnalysisWizardView"],
    itemId: 'analysisBrowsePanel',
    name: "AnalysisListView",
    title: "Analysis browser",
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    /**
     * This function updates the contetn of the panel
     * @param {type} data
     * @returns {undefined}
     */
    setData: function (data) {
        this.analysisList = data;
        this.queryById('analysisContainer').setData(this.analysisList);
    },
    /**
     * This function ...
     * @param {String} mode
     * @returns {undefined}
     */
    setLoading: function (mode) {
        this.queryById('analysisContainer').setLoading(mode);
    },
    /**
     * This function ...
     * @param {boolean} show
     * @returns {undefined}
     */
    showToolbars: function (show) {
        this.queryById('panelOptionsContainer').setVisible(show);
    },
    /**BC*********************************************************************************
     * 
     * SOME EVENTS
     * 
     **EC*********************************************************************************/
    updateContent: function () {
        if (this.queryById('stepsContainer').isVisible()) {
            this.getController().loadAllAnalysisHandler(this.queryById('stepsContainer'), null, true);
        }
        this.getController().loadAllAnalysisHandler(this);
    },
    /**BC****************************************************************************************
     * 
     * COMPONENT DEFINITION
     * 
     **EC****************************************************************************************/
    initComponent: function () {
        var me = this;

        this.setController(application.getController("AnalysisController"));

        Ext.applyIf(me, {
            border: 0,
            layout: {type: "vbox", align: 'center'}, defaults: {width: "90%"}, padding: '0 0 20 0',
            items: [
                {xtype: 'box', html: "<h1 class='form_title'>" + this.title + "</h1>"},
                {xtype: 'box', itemId: "panelOptionsContainer",
                    html: "  <h2 class='form_subtitle'>Options</h2>" +
                            "<a id='addNewAnalysisOption' class='tableOption addOption' ><i class='fa fa-plus'></i></a>" +
                            "<a id='openAnalysisWizardOption' class='tableOption wizardOption'><i class='fa fa-bolt'></i></a>" +
                            "<a id='copyAnalysisOption' class='tableOption copyOption'><i class='fa fa-copy'></i></a>" +
                            "<a id='inspectAnalysisOption' class='tableOption detailsOption'><i class='fa fa-search'></i></a>" +
                            "<a id='deleteAnalysisOption' class='tableOption deleteOption'><i class='fa fa-trash'></i></a>"
                },
                {xtype: "gridpanel", itemId: 'analysisContainer', flex: 1, autoScroll: true, multiSelect: false, width: "90%",
                    store: Ext.create('Ext.data.Store', {model: "SL.model.AnalysisModels.Analysis"}),
                    columns: [{text: 'Analysis ID', dataIndex: 'analysis_id'}, {text: 'Analysis type', dataIndex: 'analysis_type'}, {text: 'Last step name', flex: 1, dataIndex: 'last_step_name'}],
                    viewConfig: {stripeRows: true, enableTextSelection: false},
                    setData: function (data) {
                        this.getStore().removeAll();
                        this.getStore().loadRawData(data);
                        this.setLoading(false);
                    },
                    dockedItems: [
                        {xtype: 'toolbar', dock: 'top',
                            defaults: {labelAlign: 'right'},
                            items: [
                                'Display options:',
                                "<a id='showAnalysisStepsToogle1' class='toggleLink' ><i class='fa fa-toggle-on'></i> Group steps by analysis </a>",
                                {xtype: 'combobox', margins: '0 20 0 20', fieldLabel: 'Analysis type', cls: 'combobox',
                                    itemId: 'analysisTypeFilterField', editable: false, value: 'All',
                                    store: ['All', 'ChIP-seq', 'DNase-seq', 'Methyl-seq', 'mRNA-seq', 'smallRNA-seq', 'Metabolomics', 'Proteomics'],
                                    listeners: {change: {fn: function (item) {
                                                item.up('gridpanel').applyFilters();
                                            }, scope: me}
                                    }
                                },
                                {xtype: 'textfield', fieldLabel: 'Analysis ID', itemId: 'analysisIdFilterField', listeners: {change: {fn: function (item) {
                                                item.up('gridpanel').applyFilters();
                                            }, scope: me}
                                    }
                                }
                            ]
                        }
                    ],
                    plugins: [{ptype: 'rowexpander', expandOnClick: true, rowBodyTpl: ['<div id="' + me.id + '-CallsGridRow-{analysis_id}" ></div>']}],
                    listeners: {
                        boxready: function (grid) {
                            //THIS CODE ADD THE IMAGE PANEL IN EACH ROW IN THE GRID
                            grid.getView().on('expandbody',
                                    function (rowNode, record, expandbody) {
                                        var targetId = grid.up('AnalysisListView').id + '-CallsGridRow-' + record.get('analysis_id');
                                        if (rowNode.getElementsByClassName('AnalysisListElement').length === 0) {
                                            var analysisListElement = Ext.create('SL.view.AnalysisViews.AnalysisListElement', {
                                                forceFit: true,
                                                renderTo: targetId,
                                                parent: grid
                                            });
                                            analysisListElement.loadModel(record);
                                        }
                                    });
                        }
                    },
                    applyFilters: function () {
                        var analysisContainerStore = this.getStore();
                        analysisContainerStore.clearFilter(true);
                        var analysisType = this.queryById('analysisTypeFilterField').getValue();
                        if (analysisType !== "All") {
                            analysisContainerStore.filter('analysis_type', analysisType);
                        }

                        var analysisId = this.queryById('analysisIdFilterField').getValue();
                        analysisContainerStore.filter('analysis_id', new RegExp(analysisId, "g"));
                    }
                },
                {xtype: "gridpanel", itemId: 'stepsContainer', width: "90%",
                    hidden: true, flex: 1, autoScroll: true, stateful: true,
                    multiSelect: false,
                    store: Ext.create('Ext.data.ArrayStore', {
                        storeId: 'myOtherStore',
                        fields: ['step_id', 'step_type', 'step_subtype', 'analysis_id', 'analysis_type', 'step_name']
                    }),
                    columns: [
                        {text: 'Step ID', dataIndex: 'step_id'},
                        {text: 'Step type', dataIndex: 'step_type', width: 150,
                            renderer: function (value) {
                                if (value === "rawdata")
                                    return "Raw data";
                                else if (value === "intermediate_data")
                                    return "Intermediate Data";
                                else if (value === "processed_data") {
                                    return "Processed Data";
                                }
                            }
                        },
                        {text: 'Step subtype', dataIndex: 'step_subtype', width: 200,
                            renderer: function (value) {
                                if (value === undefined)
                                    return "";
                                else {
                                    var _value = value.replace(/_/g, " ");
                                    return _value.charAt(0).toUpperCase() + _value.slice(1);
                                }
                            }
                        },
                        {text: 'Analysis ID', dataIndex: 'analysis_id'},
                        {text: 'Analysis type', dataIndex: 'analysis_type'},
                        {text: 'Step name', flex: 1, dataIndex: 'step_name'}
                    ],
                    viewConfig: {stripeRows: true, enableTextSelection: false},
                    setData: function (analysisList) {
                        this.up('AnalysisListView').analysisList = analysisList;
                        var myArrayData = [];
                        var model;
                        for (var j in analysisList) {
                            model = analysisList[j];
                            var nonProcessedDataList = model.non_processed_data().data.items;
                            var processedDataList = model.processed_data().data.items;

                            for (var i in nonProcessedDataList) {
                                myArrayData.push([
                                    nonProcessedDataList[i].getID(),
                                    nonProcessedDataList[i].getType(),
                                    nonProcessedDataList[i].get('intermediate_data_type'),
                                    model.getID(),
                                    model.get('analysis_type'),
                                    nonProcessedDataList[i].get('step_name')
                                ]);
                            }
                            for (var i in processedDataList) {
                                myArrayData.push([
                                    processedDataList[i].getID(),
                                    processedDataList[i].getType(),
                                    processedDataList[i].get('processed_data_type'),
                                    model.getID(),
                                    model.get('analysis_type'),
                                    processedDataList[i].get('step_name')]);
                            }
                        }

                        this.getStore().removeAll();
                        this.getStore().loadData(myArrayData);
                        this.setLoading(false);
                    },
                    listeners: {
                        show: function () {
                            me.getController().loadAllAnalysisHandler(this, null, true);
                        }
                    },
                    dockedItems: [
                        {xtype: 'toolbar', dock: 'top',
                            defaults: {labelAlign: 'right'},
                            items: [
                                'Display options:',
                                "<a id='showAnalysisStepsToogle2' class='toggleLink'><i class='fa fa-toggle-off'></i> Group steps by analysis </a>",
                                {xtype: 'combobox', cls: 'combobox',
                                    margins: '0 20 0 20',
                                    fieldLabel: 'Step type', itemId: 'stepTypeFilterField',
                                    editable: false, value: 'all', displayField: "name", valueField: "value",
                                    store: Ext.create('Ext.data.ArrayStore', {
                                        fields: ['name', 'value'],
                                        data: [['All', "all"], ['Raw data', "rawdata"], ['Intermediate data', "intermediate_data"], ['Processed data', "processed_data"]]
                                    }),
                                    listeners: {
                                        change: {fn: function (item) {
                                                item.up('gridpanel').applyFilters();
                                            }, scope: me}
                                    }
                                },
                                {xtype: 'textfield', fieldLabel: 'Step name', itemId: 'stepNameFilterField', listeners: {change: {fn: function (item) {
                                                item.up('gridpanel').applyFilters();
                                            }, scope: me}
                                    }
                                }
                            ]
                        }
                    ],
                    applyFilters: function () {
                        var analysisContainerStore = this.getStore();
                        analysisContainerStore.clearFilter(true);
                        var stepType = this.queryById('stepTypeFilterField').getValue();
                        if (stepType !== "all") {
                            analysisContainerStore.filter('step_type', stepType);
                        }

                        var stepName = this.queryById('stepNameFilterField').getValue();
                        analysisContainerStore.filter('step_name', new RegExp(stepName, "g"));
                    }
                }
            ],
            listeners: {
                boxready: function () {
                    if (Ext.util.Cookies.get('currentExperimentID') === "Not selected" || Ext.util.Cookies.get('currentExperimentID') === "undefined") {
                        showErrorMessage("No experiment selected.\nPlease switch to an existing experiment or create a new one before continue.", {soft: true});
                        application.mainView.changeMainView("HomePanel");
                        return;
                    }

                    $("#showAnalysisStepsToogle1").click(function () {
                        var component1 = me.queryById('analysisContainer').setVisible(false);
                        var component2 = me.queryById('stepsContainer').setVisible(true);
                        component1.getEl().fadeOut({callback: function () {
                                component1.setVisible(false);
                                var task = new Ext.util.DelayedTask(function () {
                                    component2.setVisible(true);
                                    component2.getEl().fadeIn();
                                });
                                task.delay(100);
                            }});
                    });

                    $("#showAnalysisStepsToogle2").click(function () {
                        var component2 = me.queryById('analysisContainer').setVisible(false);
                        var component1 = me.queryById('stepsContainer').setVisible(true);
                        component1.getEl().fadeOut({callback: function () {
                                component1.setVisible(false);
                                var task = new Ext.util.DelayedTask(function () {
                                    component2.setVisible(true);
                                    component2.getEl().fadeIn();
                                });
                                task.delay(100);
                            }});
                    });

                    var qtipData = {content: 'Annotate a new Analysis', hide: 'click mouseleave', style: {classes: 'qtip-tipsy qtip-shadow'}, position: {my: 'bottom center', at: 'top center'}};
                    $("#addNewAnalysisOption").click(function () {
                        me.getController().createNewAnalysisButtonClickHandler();
                    }).qtip(qtipData);

                    qtipData.content = "Open analysis wizard";
                    $("#openAnalysisWizardOption").click(function () {
                        me.getController().openAnalysisWizardButtonHandler();
                    }).qtip(qtipData);

                    qtipData.content = "Copy selected Analysis";
                    $("#copyAnalysisOption").click(function () {
                        me.getController().copyAnalysisButtonClickHandler();
                    }).qtip(qtipData);

                    qtipData.content = "Inspect selected Analysis";
                    $("#inspectAnalysisOption").click(function () {
                        me.getController().showAnalysisDetailsHandler();
                    }).qtip(qtipData);

                    qtipData.content = "Delete selected Analysis";
                    $("#deleteAnalysisOption").click(function () {
                        me.getController().deleteAnalysisButtonClickHandler();
                    }).qtip(qtipData);
                }
            }
        });

        me.callParent(arguments);
    }

});

Ext.define('SL.view.AnalysisViews.AnalysisListElement', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.AnalysisListElement',
    mixins: {AnalysisView: "SL.view.AnalysisViews.AnalysisView"},
    cls: 'AnalysisListElement',
    flex: 1, border: 0, layout: {align: 'stretch', type: 'vbox'},
    margin: '10 0 10 0',
    loadModel: function (model) {
        this.queryById('analysisStepsContainer').setLoading(true);

        this.model = model;
        this.queryById('imageFieldPanel').add({
            xtype: 'image',
            cls: 'analysisPreviewField',
            src: SERVER_URL + SERVER_PORT + "/get_analysis_img_prev?analysis_id=" + model.getID() + "&experimentID=" + Ext.util.Cookies.get('currentExperimentID'),
            hidden: true,
            padding: '0 0 0 50'
        }
        );
        var me = this;
        setTimeout(function () {
            me.showPreviewImage();
        }, 500);

        if (this.model.non_processed_data().getCount() === 0 && this.model.processed_data().getCount() === 0) {
            this.queryById('analysisStepsContainer').setLoading(true);
            this.parent.up('AnalysisListView').getController().loadAnalysisHandler(this.model.getID(), this.queryById('analysisStepsContainer'));
        }
    },
    getModel: function () {
        return this.model;
    },
    showPreviewImage: function () {
        var image = this.down('image[cls=analysisPreviewField]');
        var me = this;
        if (image === null) {
            return;
        }
        if (image.el.dom.height > 0) {
            image.setVisible(true);
            image.previousSibling('image').setVisible(false);
            image.el.on('mouseenter', function (event, item) {
                me.showAnalysisWorkflowImage(event.getXY());
            });
            image.el.on('mouseout', function (event) {
                me.closeAnalysisWorkflowImage();
            });
            image.el.on('click', function (event) {
                me.showAnalysisWorkflowImage(event.getXY());
            });
        } else {
            setTimeout(function () {
                me.showPreviewImage();
            }, 1000);
        }
    },
    showAnalysisWorkflowImage: function (mouseCoordinates) {
        var me = this;
        if (me.imgDialog == null) {
            me.imgDialog = Ext.create('Ext.panel.Panel', {
                floating: true,
                width: 35,
                height: 35,
                layout: {type: "vbox", align: "middle", pack: "center"},
                items: [
                    {xtype: 'image', src: 'resources/images/loading_32x32.gif'},
                    {xtype: 'image', hidden: true, cls: 'analysisWorkflowImage',
                        src: SERVER_URL + SERVER_PORT + "/get_analysis_img?analysis_id=" + me.getModel().getID() + "&experimentID=" + Ext.util.Cookies.get('currentExperimentID')
                    }
                ],
                showLoadedImage: function () {
                    var image = this.down('image[cls=analysisWorkflowImage]');
                    if (image.el.dom.height > 0) {
                        image.setVisible(true);
                        image.previousSibling('image').setVisible(false);
                        this.setHeight(image.el.dom.height);
                        this.setWidth(image.el.dom.width);

                    } else {
                        var me = this;
                        setTimeout(function () {
                            me.showLoadedImage();
                        }, 1000);
                    }
                }
            });
        }
        this.parent.up('AnalysisListView').add(me.imgDialog);
        me.imgDialog.setPosition(mouseCoordinates[0] + 10, mouseCoordinates[1] - 60);
        me.imgDialog.setVisible(true);
        me.imgDialog.showLoadedImage();
    },
    closeAnalysisWorkflowImage: function () {
        if (this.imgDialog !== undefined) {
            this.imgDialog.setVisible(false);
            this.parent.up('AnalysisListView').remove(this.imgDialog, true);
            this.imgDialog = null;
        }
    },
    initComponent: function () {
        var me = this;

        this.setController(application.getController("AnalysisController"));

        Ext.applyIf(me, {
            items: [
                {xtype: 'label',
                    margin: '10 0 10 20', height: 20, maxHeight: 20,
                    style: {labelStyle: 'font-weight:bold; font-size: 14px'},
                    width: 150, text: 'Workflow overview'
                },
                {xtype: 'fieldcontainer', border: 0, itemId: 'imageFieldPanel',
                    flex: 1, layout: {type: 'vbox'}, labelAlign: 'top',
                    items: [
                        {xtype: 'image',
                            itemId: 'tmpImageField',
                            src: 'resources/images/loading_32x32.gif',
                            padding: '0 0 0 50', minHeight: 32, minWidth: 32
                        }
                    ]
                },
                {xtype: 'label', text: 'Pipeline steps',
                    margin: '10 0 10 20', height: 20, maxHeight: 20, width: 150,
                    style: {labelStyle: 'font-weight:bold; font-size: 14px'}
                },
                {xtype: "gridpanel", itemId: 'analysisStepsContainer',
                    multiSelect: false,
                    margin: '5 25 5 25',
                    store: Ext.create('Ext.data.ArrayStore', {
                        storeId: 'myStore',
                        fields: ['step_type', 'step_subtype', 'step_name']
                    }),
                    columns: [
                        {text: 'Step type', dataIndex: 'step_type', width: 150,
                            renderer: function (value) {
                                if (value === "rawdata")
                                    return "Raw data";
                                else if (value === "intermediate_data")
                                    return "Intermediate Data";
                                else {
                                    return "Processed Data";
                                }
                            }
                        },
                        {text: 'Step subtype', dataIndex: 'step_subtype', width: 200,
                            renderer: function (value) {
                                if (value === undefined)
                                    return "";
                                else {
                                    var _value = value.replace(/_/g, " ");
                                    return _value.charAt(0).toUpperCase() + _value.slice(1);
                                }
                            }
                        },
                        {text: 'Step name', flex: 1, dataIndex: 'step_name'}
                    ],
                    setData: function (nonProcessedDataList, processeDataList) {
                        var myArrayData = [];
                        for (var i in nonProcessedDataList) {
                            myArrayData.push([nonProcessedDataList[i].get('type'), nonProcessedDataList[i].get('intermediate_data_type'), nonProcessedDataList[i].get('step_name')]);
                        }
                        for (var i in processeDataList) {
                            myArrayData.push(["Processed data", processeDataList[i].get('processed_data_type'), processeDataList[i].get('step_name')]);
                        }

                        this.getStore().loadData(myArrayData);
                        this.setLoading(false);
                    },
                    loadModel: function (model) {
                        this.setData(model.non_processed_data().data.items, model.processed_data().data.items);
                        this.up().model.non_processed_data = model.non_processed_data;
                        this.up().model.processed_data = model.processed_data;
                    }
                }
            ]
        });

        me.callParent(arguments);
    }
});