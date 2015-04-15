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
 * - AnalyticalReplicateView
 * - AnalyticalReplicateCreationWindow
 * - AnalyticalReplicateSelectorWindow
 * - AnalyticalReplicateSelectorPanel
 * 
 */
Ext.define('SL.view.SampleViews.AnalyticalReplicateView', {
    requires: ['SL.model.SampleModels.AnalyticalReplicate'],
    mixins: {
        //Extends the View class
        View: 'SL.view.senchaExtensions.View',
    }
});

Ext.define('SL.view.SampleViews.AnalyticalReplicateCreationWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.AnalyticalReplicateCreationWindow',
    parent: null,
    initComponent: function () {
        var me = this;

        Ext.applyIf(me, {
            title: 'Adding Analytical samples',
            height: 700, width: 800, closable: false, modal: true, autoScroll: true,
            previousPanel: null, bodyPadding: 10, layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'container', layout: {type: 'vbox', align: 'stretch'}, defaults: {labelAlign: 'top', labelWidth: 120},
                    items: [
                        {xtype: 'box', style: 'margin-bottom:10px;', html: '<h2 class="form_subtitle">1. Choose the extraction protocol</h2><i>Please, choose the followed protocol for analytical samples isolation.</i>'},
                        {xtype: 'TreatmentSelectionCombobox'},
                    ]
                },
                {xtype: 'box', style: 'margin-bottom:10px;', html: '<h2 class="form_subtitle">2. Isolated analytical samples</h2><i>Please, type the name for the isolated analytical samples.</i>'},
                {xtype: "gridpanel", itemId: 'analyticalSampleContainer', flex: 1,
                    plugins: [Ext.create('Ext.grid.plugin.RowEditing', {clicksToMoveEditor: 1, autoCancel: true, pluginId: "rowEditing"})],
                    minHeight: 75, flex: 1, multiSelect: false, viewConfig: {markDirty: false},
                    store: Ext.create('Ext.data.ArrayStore', {fields: ['analytical_rep_name']}),
                    columns: [
                        {text: 'Analytical sample name', flex: 1, dataIndex: 'analytical_rep_name',
                            editor: {
                                xtype: 'textfield', allowBlank: false,
                                emptyText: "Type a name for the Analytical sample or leave blank (row will be ignored)."
                            }
                        },
                        {xtype: 'actioncolumn', text: '<i class="fa fa-trash"></i> ', itemId: 'deleteRowButton',
                            width: 30, sortable: false,
                            items: [{
                                    icon: 'resources/images/delete_row_16x16.gif',
                                    tooltip: 'Delete this Analytical Sample',
                                    handler: function (grid, rowIndex, colIndex) {
                                        if (rowIndex !== grid.getStore().getCount() - 1) {
                                            grid.getStore().removeAt(rowIndex);
                                        }
                                    }
                                }
                            ]
                        }],
                    listeners: {
                        edit: function () {
                            var pos = this.getStore().getCount() - 1;
                            pos++;
                            this.getStore().insert(pos, {'analytical_rep_name': ""});
                            this.getRowEditing().startEdit(pos, 0);
                        }
                    },
                    getRowEditing: function () {
                        return this.getPlugin('rowEditing');
                    }
                }
            ],
            buttons: [
                "->",
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', scope: me, handler:
                            function () {
                                application.getController("BioReplicateController").addAnalyticalReplicatesAcceptButtonClickHandler(this);
                            }
                },
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function () {
                        this.up('window').close()
                    }}
            ]
        });
        me.callParent(arguments);
    }
});

/*BC***************************************************************************************
 ** This file contains the definition of the following components:
 *   - AnalyticalReplicateSelectorWindow 
 *   - AnalyticalReplicateSelectorPanel  
 *   - 
 **EC**************************************************************************************/

Ext.define('SL.view.SampleViews.AnalyticalReplicateSelectorWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.AnalyticalReplicateSelectorWindow',
    title: 'Analytical Sample selection',
    height: 600, width: 800, layout: 'fit', closable: false, modal: true,
    previousPanel: null, multiselection: false,
    selectedAnalyticalReplicate: null,
    initComponent: function () {
        var me = this;

        Ext.applyIf(me, {
            items: [{xtype: 'AnalyticalReplicateSelectorPanel', multiselection: this.multiselection}],
            buttons: [
                {text: '<i class="fa fa-arrow-circle-left"></i> Back', hidden: true, cls: 'button',
                    handler: function () {
                        var tabBar = this.up('window').down('tabpanel');
                        tabBar.getActiveTab().setDisabled(true);
                        tabBar.setActiveTab(tabBar.getActiveTab().previousSibling());
                        tabBar.getActiveTab().setDisabled(false);
                        this.setVisible(false);
                        this.nextSibling('button').setVisible(true);
                        this.nextSibling('button').nextSibling('button').setVisible(false);
                    }
                },
                {text: 'Next <i class="fa fa-arrow-circle-right"></i>', cls: 'button', itemId: "nextButton",
                    handler: function () {
                        var tabBar = this.up('window').down('tabpanel');
                        var selectedBioConditions = tabBar.getActiveTab().getSelectedBioConditions();
                        if (selectedBioConditions == null || selectedBioConditions.length == 0) {
                            return;
                        }
                        tabBar.getActiveTab().setDisabled(true);
                        tabBar.setActiveTab(tabBar.getActiveTab().nextSibling());
                        application.getController("BioConditionController").analyticalReplicateSelectorTabChangeHandler(tabBar, tabBar.getActiveTab(),tabBar.getActiveTab().previousSibling());
                        tabBar.getActiveTab().setDisabled(false);
                        this.setVisible(false);
                        this.nextSibling('button').setVisible(true);
                        this.previousSibling('button').setVisible(true);
                    }
                },
                {text: '<i class="fa fa-check"></i> Accept', hidden: true, cls: 'acceptButton', handler: function () {
                        this.up('window').close();
                    }},
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function () {
                        this.up('window').close();
                    }}
            ],
            callBackFn: function (_value) {
            },
            listeners: {
                //PREVENT TO COLLAPSE PANEL IF NO SEARCH WAS MADE
                beforeclose: function (panel) {
                    this.callBackFn(this.queryById('bioreplicatesPanel').getSelectedAnalyticalReplicates());
                    return true;
                }
            }
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.SampleViews.AnalyticalReplicateSelectorPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.AnalyticalReplicateSelectorPanel',
    requires: ['SL.view.senchaExtensions.ElementListSelector', 'SL.model.SampleModels.BioCondition', 'SL.model.SampleModels.AnalyticalReplicate'],
    multiselection: false,
    initComponent: function () {
        var me = this;
        this.items = [];
        var newPanel = Ext.create('SL.view.senchaExtensions.ElementListSelector',
                {border: true, region: 'center', itemId: 'bioconditionSelectorPanel', closable: false,
                    title: 'Select Biological Condition',
                    store: Ext.create('Ext.data.Store', {model: "SL.model.SampleModels.BioCondition", groupField: "name"}),
                    fieldsNames: [
                        ['Name', "name"], ['Organism', "organism"],
                        ['BioCondition id', "biocondition_id"],
                        ["Title", "title"], ['Cell type', "cell_type"],
                        ['Tissue type', "tissue_type"], ['Cell line', "cell_line"],
                        ['Genotype/Variation', "genotype"], ["Conditions", "conditions"],
                        ["Time", "time"]
                    ],
                    columnsWidth: [-1, -1, 0],
                    allowMultiselect: false,
                    groupRows: false,
                    gridPlugins: [{
                            ptype: 'rowexpander',
                            rowBodyTpl: [
                                '<p><b>Title:</b> {title}</p>',
                                '<p><b>BioCondition id:</b> {biocondition_id}</p>',
                                '<p><b>Conditions:</b> {conditions}</p>',
                                '<p><b>Time:</b> {time}</p>',
                                '<p><b>Cell type:</b> {cell_type}</p>',
                                '<p><b>Tissue type:</b> {tissue_type}</p>',
                                '<p><b>Cell line:</b> {cell_line}</p>',
                                '<p><b>Genotype/Variation:</b> {genotype}</p>'
                            ]
                        }],
                    getSelectedBioConditions: function () {
                        return this.getSelectedData();
                    },
                    getSelectedBioConditionsIDs: function () {
                        var selectedBioConditions = this.getSelectedData();
                        var selectedBioConditionsIDs = [];
                        for (var i = 0; i < selectedBioConditions.length; i++) {
                            selectedBioConditionsIDs.push(selectedBioConditions[i].biocondition_id);
                        }
                        return selectedBioConditionsIDs;
                    },
                    gridpanelDblClickHandler: function (grid, record) {
                        var nextButton = this.up('AnalyticalReplicateSelectorWindow').queryById("nextButton");
                        if (nextButton != null) {
                            nextButton.handler.call(nextButton);
                        }
                    }
                });
        me.items.push(newPanel);
        var newPanel = Ext.create('SL.view.senchaExtensions.ElementListSelector', {
            itemId: 'bioreplicatesPanel',
            border: true, region: 'center', closable: false, disabled: true, allowMultiselect: me.multiselection,
            store: Ext.create('Ext.data.Store', {model: "SL.model.SampleModels.AnalyticalReplicate"}),
            fieldsNames: [
                ['Analytical Sample Id', "analytical_rep_id"],
                ['Analytical Sample Name', "analytical_rep_name"],
                ['Biological condition ID', "biocondition_id"],
                ['Biological Replicate ID', "bioreplicate_id"],
                ['Treatment ID', "treatment_id"]
            ],
            columnsWidth: [150, -1, 110, 100, 200],
            title: 'Select Analytical Sample',
            getSelectedAnalyticalReplicate: function () {
                return this.getSelectedData();
            },
            getSelectedAnalyticalReplicateId: function () {
                var selectedAnalyticalReplicate = this.getSelectedData();
                var selectedAnalyticalReplicateIDs = [];
                for (var i = 0; i < selectedAnalyticalReplicate.length; i++) {
                    selectedAnalyticalReplicateIDs.push(selectedAnalyticalReplicate[i].analytical_rep_id);
                }
                return selectedAnalyticalReplicateIDs;
            },
            gridpanelDblClickHandler: function (grid, record) {
            },
            getSelectedAnalyticalReplicates: function () {
                return this.getSelectedData();
            }
        });
        me.items.push(newPanel);
        this.callParent(arguments);
        application.getController("BioConditionController").analyticalReplicateSelectorTabChangeHandler(this, this.queryById('bioconditionSelectorPanel'));
    },
    loadModel: function (_model) {
        this.setLoading(true);
        //This function loads a biocondition model, and shows all the associated bioreplicates in a grid panel.
        var associatedBioReplicates = _model.getBioReplicates();
        var associatedAnalyicalSamplesStore = this.queryById('bioreplicatesPanel').down('grid').getStore();
        associatedAnalyicalSamplesStore.removeAll();
        for (var i in associatedBioReplicates) {
            associatedAnalyicalSamplesStore.add(associatedBioReplicates[i].getAnalyticalReplicates());
        }
        this.setLoading(false);
    }
});
