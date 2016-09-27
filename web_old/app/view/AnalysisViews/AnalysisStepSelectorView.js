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
 * - AnalysisStepSelectorView
 * - AnalysisStepSelectorField
 * - AnalysisStepSelectorWindow
 * - AnalysisStepSelectorPanel
 * - WorkflowPanel
 * 
 */
Ext.define('SL.view.AnalysisViews.AnalysisStepSelectorView', {
    mixins: {
        //Extends the Observer class
        View: 'SL.view.senchaExtensions.View'
    }
});

Ext.define('SL.view.AnalysisViews.AnalysisStepSelectorField', {
    extend: 'Ext.form.FieldContainer',
    mixins: {AnalysisStepSelectorView: 'SL.view.AnalysisViews.AnalysisStepSelectorView'},
    alias: 'widget.AnalysisStepSelectorField',
    /**BC******************************************************************************      
     * 
     * SOME ATTRIBUTES
     * 
     **EC******************************************************************************/
    fieldLabel: 'Selected steps',
    /**BC******************************************************************************      
     * 
     * GETTERS AND SETTERS
     * 
     **EC******************************************************************************/
    loadModels: function (_models) {
        this.models = [];
        for (var i in _models) {
            this.models.push(_models[i]);
        }
        this.update();
    },
    getModels: function () {
        return this.models;
    },
    addModel: function (model) {
        this.models.push(model);
    },
    removeModel: function (index) {
        return this.models.splice(index, 1);
    },
    update: function () {
        this.queryById('panelPreviousSteps').removeAll();
        var panelPreviousSteps = this.queryById('panelPreviousSteps');
        for (var i in this.models) {
            var n = parseInt(i) + 1;
            var item = Ext.widget('AnalysisStepSelectorItem');
            item.setContent(this.models[i], n);
            panelPreviousSteps.add(item);
        }
    },
    setEditable: function (mode) {
        this.queryById('buttonsPanel').setVisible(mode);
        Ext.Array.each(this.query('AnalysisStepSelectorItem'), function (elem) {
            elem.setEditable(mode);
        });
    },
    /**BC**************************************************************************************
     ** 
     ** SOME EVENTS HANDLERS
     ** 
     **EC**************************************************************************************/
    /***********************************************************************************************************
     * This function handles the event fires when the button "Add previous step" is clicked during a 
     * Intermediate_step creation/edition.
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
     * TODO: CHECK IF THE SELECTED PREVIOUS STEP IS VALID FOR THE TO-BE-CREATED/EDITED STEP (EG. SMOOTHING 
     *		STEPS ONLY CAN USE INTERMEDIATE STEPS (RESULTING OF A MAPPING/PREPROCESSING AFTER MAPPING STEP).
     *  
     * @param  button
     * @return true if created successfully     
     ***********************************************************************************************************/
    addNewPreviousStepButton: function (button, e, eOpts) {
        var analysisStepSelectorField = button.up('AnalysisStepSelectorField');
        var step_id;
        if (analysisStepSelectorField.up('IntermediateDataView') != null) {
            step_id = analysisStepSelectorField.up('IntermediateDataView').getModel().getID();
        } else {
            step_id = analysisStepSelectorField.up('ProcessedDataView').getModel().getID();
        }

        var selectionWindow = Ext.create('Ext.window.Window', {
            title: 'Please choose the previous steps',
            minHeight: 450, minWidth: 700, layout: 'border', closable: false, modal: true,
            previousPanel: null,
            cytoscape_graph: null,
            current_step_id: step_id,
            selectedSteps: [],
            items: [
                {xtype: "box", html: '<h2>Please, select the previous steps whose resulting data are used as input for the new step.</h2></br>' +
                            '<i class="fa fa-info-circle"></i><i style="color: rgb(167, 167, 167);">For multiselection, keep pressed SHIFT key</i>'},
                {xtype: 'container', region: 'center', itemId: 'panelWorkflow', style: "background-color:#fff",
                    html: '<div class="cytoscapewebPanel" id="cytoscapeweb_stepSelector"></div><div id="note"></div>',
                    nodeClickHandler: function (clickedNodeData) {
                        var me = selectionWindow;
                        var clickedStepID = clickedNodeData.id;
                        var clickedStepType = clickedNodeData.type;
                        var validStepTypes = ["RAWData", "Intermediate_step", "Processed_data"];
                        var isValid = false;
                        var selectedNodes = me.cytoscape_graph.selected("nodes");
                        var selectedNodesAux = [];

                        //FIRST FILL THE LIST OF BANNED STEPS (IF NOT EXIST)
                        if (me.banned_steps === undefined) {
                            me.banned_steps = [];
                            //TODO:THIS SHOULD BE CHANGED IF WE CHANGE THE ANALYSIS REPRESENTATION TO A MATRIX
                            //FIND ALL THE NODES THAT USE DIRECTLY OR INDIRECTLY THE CURRENT STEP
                            me.cytoscape_graph.getAllLaterNodes(me.current_step_id, me.banned_steps);
                        }

                        //CHECK IF THE TYPE OF THE CLICKED STEP IS VALID
                        isValid = validStepTypes.indexOf(clickedStepType) !== -1;
                        //IF SO, CHECK IF THE CLICKED STEP IS NOT IN THE BANNED LIST
                        if (isValid === true) {
                            isValid = me.banned_steps.indexOf(clickedStepID) === -1
                            //IF SO, CHECK IF THE NODE WAS CLICKED BEFORE
                            if (isValid === true) {
                                for (var i = 0; i < selectedNodes.length; i++) {
                                    if ((selectedNodes[i].data() !== null && selectedNodes[i].data("id") === clickedStepID) || selectedNodes[i] === clickedStepID) {
                                        //REMOVE THE NODE FROM SELECTED LIST
                                        isValid = false;
                                    } else {
                                        selectedNodesAux.push(selectedNodes[i].data("id"));
                                    }
                                }
                            }
                        }

                        if (isValid === true) {
                            selectedNodesAux.push(clickedStepID);
                        }

                        setTimeout(function () {
                            me.cytoscape_graph.nodes().forEach(function (ele) {
                                (selectedNodesAux.indexOf(ele.data("id")) !== -1) ? ele.select() : ele.unselect();
                            });
                        }, 50);
                    }
                }
            ],
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton',
                    handler: function () {
                        selectionWindow.selectedSteps = selectionWindow.cytoscape_graph.selected();
                        var analysisModel = null;
                        if (analysisStepSelectorField.up('AnalysisDetailsView') == null) {
                            analysisModel = analysisStepSelectorField.up('window').parent.getModel();
                        } else {
                            analysisModel = analysisStepSelectorField.up('AnalysisDetailsView').getModel();
                        }
                        var nodeData, previousStepModel;
                        for (var i = 0; i < selectionWindow.selectedSteps.length; i++) {
                            nodeData = selectionWindow.selectedSteps[i].data();
                            previousStepModel = analysisModel.getStepByID(nodeData.id);
                            analysisStepSelectorField.addModel(previousStepModel);
                        }
                        analysisStepSelectorField.update();
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
                    var json_data;
                    var view = application.mainView.getCurrentView();

                    if (view.getName() === "AnalysisDetailsView") {
                        json_data = view.getModel().getJSONforGraph();
                    } else if (view.getName() === "AnalysisWizardViewPanel") {
                        json_data = view.getAnalysisEditorView().getModel().getJSONforGraph();
                    } else {
                        json_data = application.mainView.getView('AnalysisWizardViewPanel').getModel().getJSONforGraph();
                    }

                    this.cytoscape_graph = configureCytoscapeAnalysisGraph(this.queryById('panelWorkflow'), 'cytoscapeweb_stepSelector', json_data, {showMenu: false});
                    //OVERRIDE THE SELECT EVENT
                    this.cytoscape_graph.off("tap");

//                    var me = this;

                    //GENERATE THE BANNED NODES LIST (NODES THAT SHOULD NOT BE SELECTED TO AVOID CYCLES)
                    //TODO:THIS SHOULD BE CHANGED IF WE CHANGE THE ANALYSIS REPRESENTATION TO A MATRIX
                    //MOVED TO THE NODE CLICK EVENT (BECAUSE NEEDS THE DIAGRAM DRAWN)
                    this.updateNeccesary = false;
                    this.setLoading(false);
                }
            }
        });
        selectionWindow.setHeight(Ext.getBody().getViewSize().height * 0.5);
        selectionWindow.setWidth(Ext.getBody().getViewSize().width * 0.7);
        selectionWindow.show();
    },
    initComponent: function () {
        var me = this;

        this.setController(application.getController("AnalysisController"));

        me.layout = {type: 'vbox', align: 'stretch'};

        Ext.apply(me, {
            itemId: 'analysisStepSelectorField', fieldBodyCls: "analysisStepSelectorFieldBody",
            models: [],
            items: [
                {xtype: 'container', margin: '0 0 5 0', itemId: "buttonsPanel",
                    items: [
                        {xtype: 'button', text: '<i class="fa fa-plus-circle"></i> Add from previous steps', margin: '0 5 0 0',
                            handler: me.addNewPreviousStepButton
                        }]
                },
                {xtype: 'panel', itemId: 'panelPreviousSteps', border: 0, flex: 1, layout: 'vbox', autoScroll: true}
            ]});
        this.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.AnalysisStepSelectorItem', {
    extend: 'Ext.container.Container',
    mixins: {AnalysisStepSelectorView: 'SL.view.AnalysisViews.AnalysisStepSelectorView'},
    alias: 'widget.AnalysisStepSelectorItem',
    /**BC******************************************************************************      
     * 
     * SOME ATTRIBUTES
     * 
     **EC******************************************************************************/
    border: 0, model: null, index: 0, layout: {type: 'hbox', align: 'middle'},
    /**BC******************************************************************************      
     * 
     * GETTERS AND SETTERS
     * 
     **EC******************************************************************************/
    getModel: function () {
        return this.model;
    },
    removeStepElement: function () {
        this.up("AnalysisStepSelectorField").removeModel(this.up('AnalysisStepSelectorItem').index - 1);
        this.up("AnalysisStepSelectorField").update();
    },
    setEditable: function (mode) {
        this.down('button').setVisible(mode);
    },
    setContent: function (model, index) {
        var _html;
        if (model instanceof SL.model.AnalysisModels.RAWDataModels.RAWData) {
            _html = "<b>RAW Data " + model.getID() + "</b></br>";
        } else if (model instanceof SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data) {
            _html = "<b>Intermediate Step " + model.getID() + "</b></br>";
        } else if (model instanceof SL.model.AnalysisModels.Processed_data) {
            _html = "<b>Processed data Step " + model.getID() + "</b></br>";
        } else {
            return;
        }
        //Get the value of the "files location" field
        var files_location = model.getFileLocation();
        //If no files were saved
        if (files_location === "" || files_location == null) {
            files_location = "<i>Files not saved.</i>";
        }
        files_location = files_location.replace(/\$\$/g, "\n");
        files_location = files_location.split("\n");

        var pattern = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
        for (var i in files_location) {
            if (pattern.test(files_location[i])) {
                _html += '<a style="margin-left:10px" class="path" href="' + files_location[i] + '">' + files_location[i] + '</a>';
            } else {
                _html += '<p style="margin-left:10px" class="path" >' + files_location[i] + '</p>';
            }
        }
        this.queryById("stepSelectedItem").update(_html);
        this.model = model;
        this.index = index;
    },
    initComponent: function () {
        var me = this;

        this.setController(application.getController("AnalysisController"));

        Ext.apply(me, {
            items: [
                {xtype: 'button', text: '<i class="fa fa-remove"></i>', margin: '0 5 0 0', style: "background:#FC4E4E", maxHeight: 22, maxWidth: 22, handler: me.removeStepElement},
                {xtype: 'box', margins: '5 0 0 5 ', minHeight: 50, itemId: "stepSelectedItem", cls: "stepSelectedItem"}
            ]

        });
        me.callParent(arguments);
    },
});

Ext.define('SL.view.AnalysisViews.AnalysisStepSelectorWindow', {
    extend: 'Ext.window.Window',
    mixins: {AnalysisStepSelectorView: 'SL.view.AnalysisViews.AnalysisStepSelectorView'},
    alias: 'widget.AnalysisStepSelectorWindow',
    /**BC******************************************************************************      
     * 
     * SOME ATTRIBUTES
     * 
     **EC******************************************************************************/
    title: 'Analysis step selection',
    previousPanel: null,
    selectedSteps: null,
    /**BC******************************************************************************      
     * 
     * COMPONENT DECLARATION
     * 
     **EC******************************************************************************/
    initComponent: function () {
        var me = this;

        this.setController(application.getController("AnalysisController"));

        Ext.applyIf(me, {
            height: 600, width: 800, layout: 'fit', closable: false, modal: true,
            items: [{xtype: 'AnalysisStepSelectorPanel'}],
            buttons: [
                {text: '<i class="fa fa-chevron-circle-left"></i> Back', hidden: true, cls: 'button',
                    handler: function () {
                        var tabBar = this.up('window').down('tabpanel');
                        tabBar.getActiveTab().setDisabled(true);
                        tabBar.setActiveTab(tabBar.getActiveTab().previousSibling());
                        tabBar.getActiveTab().setDisabled(false);
                        var activeTab = tabBar.getActiveTab();
                        if (activeTab.itemId === "experimentSelectorPanel") {
                            this.setVisible(false);
                        }
                        this.nextSibling('button').setVisible(true);
                        this.nextSibling('button').nextSibling('button').setVisible(false);
                    }
                },
                {text: 'Next <i class="fa fa-chevron-circle-right"></i>', cls: 'button', itemId: "nextButton",
                    handler: function () {
                        var tabBar = this.up('window').down('tabpanel');
                        var activeTab = tabBar.getActiveTab();
                        if (activeTab.itemId === "experimentSelectorPanel") {
                            var selectedExperiment = tabBar.getActiveTab().getSelectedExperimentsIDs();
                            if (selectedExperiment == null || selectedExperiment.length === 0) {
                                return;
                            }
                            tabBar.selectedExperimentID = selectedExperiment[0];
                        } else if (activeTab.itemId === "analysisSelectorPanel") {
                            if (activeTab.queryById('analysisContainer').getSelectionModel().getSelection()[0] === undefined) {
                                return;
                            }
                            tabBar.selectedAnalysisID = activeTab.queryById('analysisContainer').getSelectionModel().getSelection()[0].getID();

                            if (tabBar.selectedAnalysisID === this.up('window').currentAnalysisID) {
                                showErrorMessage("Can not import steps from the current Analysis. </br>Please choose other analysis.", {soft: true});
                                return;
                            }

                            this.setVisible(false);
                            this.nextSibling('button').setVisible(true);
                        } else {
                            this.setVisible(false);
                            this.nextSibling('button').setVisible(true);
                        }
                        this.previousSibling('button').setVisible(true);
                        tabBar.getActiveTab().setDisabled(true);
                        tabBar.setActiveTab(tabBar.getActiveTab().nextSibling());
                        tabBar.getController().analysisStepSelectorPanelTabChangeHandler(tabBar, tabBar.getActiveTab());
                        tabBar.getActiveTab().setDisabled(false);
                    }
                },
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', hidden: true, scope: me,
                    handler: function () {
                        this.close();
                    }},
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', scope: me,
                    handler: function () {
                        this.queryById('stepSelectorPanel').clearSelectedStepModels();
                        this.close();
                    }}
            ],
            callBackFn: function (_value) {
            },
            listeners: {
                //PREVENT TO COLLAPSE PANEL IF NO SEARCH WAS MADE
                beforeclose: function (panel) {
                    this.callBackFn(this.queryById('stepSelectorPanel').getSelectedStepModels());
                    return true;
                }
            }
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.AnalysisStepSelectorPanel', {
    extend: 'Ext.tab.Panel',
    mixins: {AnalysisStepSelectorView: 'SL.view.AnalysisViews.AnalysisStepSelectorView'},
    alias: 'widget.AnalysisStepSelectorPanel',
    /**BC******************************************************************************      
     * 
     * GETTERS AND SETTERS
     * 
     **EC******************************************************************************/
    loadModel: function (_model) {
        //This function loads a biocondition model, and shows all the associated bioreplicates in a grid panel.
        var associatedBioReplicates = _model.associatedBioreplicates();
        var associatedAnalyicalRepsStore = this.queryById('bioreplicatesPanel').down('grid').getStore();
        associatedAnalyicalRepsStore.removeAll();
        associatedBioReplicates.each(
                function (item, index, count) {
                    item.associatedAnalyticalReplicates().each(function (item, index, count) {
                        associatedAnalyicalRepsStore.add(item);
                    });
                }
        );
    },
    /**BC******************************************************************************      
     * 
     * COMPONENT DECLARATION
     * 
     **EC******************************************************************************/
    initComponent: function () {
        var me = this;

        this.setController(application.getController("AnalysisController"));

        this.items = [];
        var newPanel = Ext.create('SL.view.senchaExtensions.ElementListSelector',
                {itemId: "experimentSelectorPanel", border: true, region: 'center', allowMultiselect: false, closable: false,
                    fieldsNames: [['Experiment ID', "experiment_id"], ['Title', "title"], ['Abstract', "experiment_abstract"]], columnsWidth: [100, -1, 0],
                    title: 'Experiment Browser', iconCls: 'tabBrowse',
                    gridPlugins: [{
                            ptype: 'rowexpander',
                            rowBodyTpl: [
                                '<p><b>Title:</b> {title}</p>',
                                '<p><b>Experiment id:</b> {experiment_id}</p>',
                                '<p><b>Abstract:</b> {experiment_description}</p>',
                            ]
                        }],
                    getSelectedExperiments: function () {
                        return this.getSelectedData();
                    },
                    getSelectedExperimentsIDs: function () {
                        var selectedExperiments = this.getSelectedData();
                        var selectedExperimentsIDs = [];
                        for (var i = 0; i < selectedExperiments.length; i++) {
                            selectedExperimentsIDs.push(selectedExperiments[i].experiment_id);
                        }
                        return selectedExperimentsIDs;
                    },
                    gridpanelDblClickHandler: function (grid, record) {
                        var nextButton = this.up('AnalysisStepSelectorWindow').queryById("nextButton");
                        if (nextButton != null) {
                            nextButton.handler.call(nextButton);
                        }
                    }
                });
        me.items.push(newPanel);

        newPanel = Ext.create('SL.view.AnalysisViews.AnalysisListView', {disabled: true, itemId: 'analysisSelectorPanel'});
        newPanel.showToolbars(false);
        me.items.push(newPanel);

        newPanel = Ext.create('SL.view.AnalysisViews.WorkflowPanel', {disabled: true, itemId: 'stepSelectorPanel'});
        me.items.push(newPanel);

        this.listeners = {
            boxready: function () {
                this.getController().analysisStepSelectorPanelTabChangeHandler(this, this.queryById('experimentSelectorPanel'));
            }
        };
        this.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.WorkflowPanel', {
    extend: 'Ext.panel.Panel',
    mixins: {AnalysisStepSelectorView: 'SL.view.AnalysisViews.AnalysisStepSelectorView'},
    /**BC******************************************************************************      
     * 
     * GETTERS AND SETTERS
     * 
     **EC******************************************************************************/
    loadModel: function (model) {
        //1. Generates the Analysis overview tree
        this.model = model;
        //2. Generates the Analysis workflow diagram
        this.setLoading(true);
        var json_data = this.getModel().getJSONforGraph();
        this.cytoscape_graph = configureCytoscapeAnalysisGraph(this, 'workflowPanelSelector', json_data, {showMenu: false}, {showMenu: false});

        this.updateNeccesary = false;
        this.setLoading(false);
    },
    getModel: function () {
        return this.model;
    },
    getAnalysisID: function () {
        return this.analysisID;
    },
    getSelectedStepModels: function () {
        if (this.cytoscape_graph === undefined) {
            return [];
        }
        var selectedNodes = this.cytoscape_graph.selected("nodes");
        var selected_steps = [];
        for (var i = 0; i < selectedNodes.length; i++) {
            selected_steps.push(this.getModel().getStepByID(selectedNodes[i].data("id")));
        }
        return selected_steps;
    },
    clearSelectedStepModels: function () {
        if (this.cytoscape_graph === undefined) {
            return;
        }
        this.cytoscape_graph.nodes().forEach(function (ele) {
            ele.unselect();
        });
    },
    /**BC******************************************************************************      
     * 
     * SOME EVENT HANDLERS
     * 
     **EC******************************************************************************/
    nodeClickHandler: function (clickedNodeData) {
        var me = this;

        var clickedStepID = clickedNodeData.id;
        var clickedStepType = clickedNodeData.type;
        var validStepTypes = ["RAWData", "Intermediate_step", "Processed_data"];

        if (validStepTypes.indexOf(clickedStepType) === -1) {
            setTimeout(function () {
                me.cytoscape_graph.$("#" + clickedStepID).unselect();
            }, 50);
            return;
        }

        this.selected_path = this.cytoscape_graph.getAllPreviousNodesIDs(clickedStepID, [clickedStepID]);
        this.selected_path = Ext.Array.unique(this.selected_path);

        setTimeout(function () {
            me.cytoscape_graph.nodes().forEach(function (ele) {
                (me.selected_path.indexOf(ele.data("id")) !== -1) ? ele.select() : ele.unselect();
            });
        }, 50);
    },
    nodeDoubleClickHandler: function (clickedNodeData) {
        var model = null;
        var newPanel = null;
        var clickedStepType = clickedNodeData.type;
        var clickedStepID = clickedNodeData.id;

        switch (clickedStepType) {
            case "RAWData" :
                model = this.getModel().getNonProcessedDataByID(clickedStepID);
                newPanel = Ext.create('SL.view.AnalysisViews.RAWDataViews.RAWDataView');
                break;
            case "Intermediate_step" :
                model = this.getModel().getNonProcessedDataByID(clickedStepID);
                newPanel = Ext.create('SL.view.AnalysisViews.IntermediateDataViews.IntermediateDataView');
                break;
            case "Processed_data" :
                model = this.getModel().getProcessedDataByID(clickedStepID);
                newPanel = Ext.create('SL.view.AnalysisViews.ProcessedDataViews.ProcessedDataView');
                break;
        }

        if (model != null) {
            var detailsWindow = Ext.create('Ext.window.Window', {layout: {type: 'vbox', align: 'stretch'}, autoScroll: true, closable: false, modal: true, buttons: [
                    {xtype: 'button', cls: "cancelButton", text: '<i class="fa fa-remove"></i> Close', handler: function () {
                            this.up("window").close();
                        }}
                ]});
            newPanel.parent = this;
            newPanel.loadModel(model);
            newPanel.setViewMode('inspect');
            detailsWindow.add(newPanel);
            detailsWindow.setHeight(Ext.getBody().getViewSize().height * 0.9);
            detailsWindow.setWidth(Ext.getBody().getViewSize().width * 0.8);
            detailsWindow.show();
            newPanel.setLoading(false);
        }
    },
//    nodeSelectedHandler: function () {
//        if (this.selected_path !== null && this.selected_path.length > 0) {
//            var nodes = this.selected_path;
//            this.selected_path = null;
//            this.cytoscape_graph.select("nodes", nodes);
//        }
//    },
    /**BC******************************************************************************      
     * 
     * COMPONENT DECLARATION
     * 
     **EC******************************************************************************/
    initComponent: function () {
        var me = this;

        this.setController(application.getController("AnalysisController"));

        this.layout = {type: 'vbox', align: 'stretch', pack: 'center'};
        this.title = 'Analysis workflow';
        this.items = [
            {xtype: 'box', maxHeight: 60, html: '<span style="font-size:14px; color:rgb(0, 136, 255)">'
                        + '<i class="fa fa-info-circle"></i><p>Please select the step to be imported. All previous steps will be automatically selected.</p>'
                        + '<i class="fa fa-info-circle"></i><p>Double-click to inspect step information.</p></span>'},
            {xtype: 'container', flex: 1, html: '<div id="workflowPanelSelector" style="height: 100%;"></div>'}
        ];

        this.callParent(arguments);
    }
});