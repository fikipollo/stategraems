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
 * - BioReplicateView
 * 
 */
Ext.define('SL.view.SampleViews.BioReplicateView', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.BioReplicateView',
    mixins: {
        //Extends the Observer class
        View: 'SL.view.senchaExtensions.View',
        //Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer',
        //Extends the Command class
        Command: 'SL.view.senchaExtensions.Command'
    },
    requires: ["SL.view.SampleViews.BatchViews"],
    inEditionMode: false,
    componentCls: 'bioreplicateView',
    /********************************************************************************      
     * This function load a given bioreplicate MODEL into the current VIEW
     *  
     * @param  model, the bioreplicate model
     * @return      
     ********************************************************************************/
    loadModel: function (model) {
        this.model = model;

        //1. Load all BIOREPLICATE fields in the formulary
        var form = this.queryById('bioreplicateFields');
        form.loadRecord(model);

        //2. Add a BioReplicateView for each associated bioreplicate (property hasMany in model) 
        this.updateAnalyticalSampleList();

        var batchInfoPanel = this.queryById("batchInfoPanel");
        batchInfoPanel.setEditableMode(false);
        //IF THE batchInfoPanel HAS A PREVIOUSLY LOADED MODEL
        if (batchInfoPanel.getModel() !== null) {
            batchInfoPanel.getModel().deleteObserver(batchInfoPanel);
        }
        if (model.getAssociatedBatch() !== null) {
            batchInfoPanel.loadModel(model.getAssociatedBatch());
//            batchInfoPanel.collapse();
            model.getAssociatedBatch().addObserver(batchInfoPanel);
        }
    },
    /********************************************************************************      
     * This function returns the bioreplicate MODEL associated to the current VIEW
     *  
     * @return      
     ********************************************************************************/
    getModel: function () {
        return this.model;
    },
    updateObserver: function () {
        this.loadModel(this.getModel());
    },
    /**BC***************************************************************************      
     * GETTERS AND SETTERS
     **EC*****************************************************************************/
    isInEditionMode: function () {
        return this.inEditionMode;
    },
    getID: function () {
        return this.queryById('bioreplicate_id').getValue();
    },
    getName: function () {
        return this.queryById('bioreplicate_name').getValue();
    },
    getAssociatedBatch: function () {
        return this.queryById('batchInfoPanel').getModel();
    },
    /********************************************************************************      
     * This function changes the Editable mode of the inner panels.
     *  
     * @param  mode where TRUE means EDITABLE MODE ON
     * @return  
     ********************************************************************************/
    setEditableMode: function (mode) {
        this.inEditionMode = mode;
        this.queryById("bioreplicate_name").setReadOnly(!mode);
        this.queryById('configurationMenu').setVisible(false);
        this.queryById('batchOptionsMenu').setVisible(mode);
        this.queryById('analyticalSampleOptionsMenu').setVisible(mode);
        this.queryById('addAnalyticalSampleButton').setVisible(mode);
        this.queryById("deleteRowButton").setVisible(mode);
    },
    /********************************************************************************      
     * This function activates the EDITING MODE. 
     * Only during the EDITING MODE, the Edit and Delete buttons are visibles.
     *  
     * @param  mode where TRUE means EDITABLE MODE ON
     * @return  
     ********************************************************************************/
    setEditingMode: function (mode) {
        this.queryById('configurationMenu').setVisible(mode);
    },
    validateContent: function () {
        //Check if the information in the form is valid
        return this.queryById('bioreplicate_name').validate();
    },
    updateAnalyticalSampleList: function () {
        this.setLoading(true);
        var analyticalSampleList = this.getModel().getAnalyticalReplicates();
        var analyticalSampleContainer = this.queryById("analyticalSampleContainer");
        var myArrayData = [];
        for (var i in analyticalSampleList) {
            myArrayData.push(analyticalSampleList[i]);
        }
        analyticalSampleContainer.getStore().removeAll();
        analyticalSampleContainer.getStore().loadData(myArrayData);
        var groupCount = analyticalSampleContainer.getStore().getGroups().length;
        this.queryById("summaryLabel").update('<i class="fa fa-info-circle"></i> <b>' 
                + myArrayData.length + '</b> analytical samples were isolated from the biological sample by applying <b>' + groupCount + '</b> different extraction protocols.</br>' +
                'Use options above to annote new Analytical samples. Double-click on the table cells to edit the content.');
        this.setLoading(false);
    },
    setLoading: function (loading) {
        this.superclass.setLoading(loading);
        if (loading === true) {
            Ext.suspendLayouts();
        } else {
            Ext.resumeLayouts(true);
        }
    },
    initComponent: function () {
        var me = this;

        this.setController(application.getController("BioReplicateController"));

        /**BC*************************************************************************************
         *** INITIALIZE SOME ATTRIBUTES FOR THE ANALYTICAL SAMPLES GRID  **************************
         /**EC*************************************************************************************/
        var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            id: 'treatmentGrouping',
            groupHeaderTpl: '<span style="color: rgb(35, 45, 66) !important;font-size: 13px;font-weight: normal;">{rows.length} Analytical Sample{[values.rows.length > 1 ? "s" : ""]} obtained following Protocol {name} </span><a class="showProtocolLink" id="{name}">Show Protocol information</a> ',
            hideGroupedHeader: true, startCollapsed: false
        });
        var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {clicksToMoveEditor: 1, autoCancel: false});

        /**BC*************************************************************************************
         *** INITIALIZE SOME ATTRIBUTES FOR THE ANALYTICAL SAMPLES GRID  **************************
         /**EC*************************************************************************************/
        Ext.applyIf(me, {
            layout: {type: "vbox", align: "stretch"}, bodyPadding: 30, autoScroll: true, border: 0,
            tbar: [
                {xtype: 'splitbutton', text: 'Biological Replicate options', itemId: 'configurationMenu',
                    handler: function (button) {
                        button.showMenu();
                    },
                    menu: [
                        {text: '<i class="fa fa-edit"></i>Edit this Biological Replicate', itemId: 'editSelectedBioRepButton', scope: me, handler:
                                    function () {
                                        this.getController().editSelectedBioRepButtonClickHandler(this);
                                    }
                        },
                        {text: '<i class="fa fa-trash"></i> Remove this Biological Replicate', itemId: 'deleteButton', scope: me, handler:
                                    function () {
                                        this.getController().removeSelectedBioreplicateButtonClickHandler(this);
                                    }
                        }
                    ]
                },
                {xtype: 'splitbutton', text: '<i class="fa fa-gears"></i> Batch options', itemId: 'batchOptionsMenu', hidden: true,
                    handler: function (button) {
                        button.showMenu();
                    },
                    menu: [
                        {text: '<i class="fa fa-edit"></i> Edit details of associated batch', itemId: "editBatchDetailsButton", tooltip: "Change the information of the selected batch (only owners).", scope: me, handler:
                                    function () {
                                        this.getController().editBatchButtonClickHandler(this);
                                    }},
                        {text: '<i class="fa fa-search"></i> Change the associated batch', itemId: "changeBatchButton", tooltip: "Register a new batch or choose one from the database.", scope: me, handler:
                                    function () {
                                        this.getController().changeBatchButtonClickHandler(this);
                                    }},
                        {text: '<i class="fa fa-trash"></i> Disassociate the selected batch.', itemId: "removeBatchButton", tooltip: "Disassociate this biological replicate from the selected batch.", scope: me, handler:
                                    function () {
                                        this.getController().disassociateBatchButtonClickHandler(this);
                                    }
                        }
                    ]
                },
                {xtype: 'splitbutton', text: '<i class="fa fa-gears"></i> Analytical Sample options', itemId: 'analyticalSampleOptionsMenu', hidden: true,
                    handler: function (button) {
                        button.showMenu();
                    },
                    menu: [{text: '<i class="fa fa-plus-circle"></i> Add more Analytical Samples', itemId: 'addAnalyticalSampleButton', scope: me,
                            handler: function () {
                                this.getController().addAnalyticalRepButtonClickHandler(this);
                            }
                        }]
                }
            ],
            items: [
                {xtype: 'form', itemId: 'bioreplicateFields',
                    border: 0, layout: "anchor", defaults: {anchor: '100%'},
                    fieldDefaults: {labelAlign: 'right', labelWidth: 150},
                    items: [
                        {xtype: 'label', html: '<h2 class="form_subtitle">Biological Replicate</h2>'},
                        {xtype: 'displayfield', itemId: 'bioreplicate_id', fieldLabel: 'Replicate ID', name: 'bioreplicate_id',
                            renderer: function (value) {
                                if (value.match(/^f_/)) {
                                    return '<span style="color:gray;">[Autogenerated after saving]</span>';
                                } else
                                    return value;
                            }
                        },
                        {xtype: 'textfield', itemId: 'bioreplicate_name', fieldLabel: 'Replicate Name', name: 'bioreplicate_name', allowBlank: false, enforceMaxLength: true, maxLength: 200},
                        {xtype: 'BatchDetailsPanel', itemId: 'batchInfoPanel', border: 0},
                    ]
                },
                {xtype: 'label', html: '<h2 class="form_subtitle">Analytical Samples</h2>'},
                {xtype: 'box', itemId: 'summaryLabel', margin: '0 0 10 15',
                    html: '<i class="fa fa-info-circle"></i> <b>0</b> analytical samples were isolated from the biological sample by applying <b>0</b> different extraction protocols.</br>' +
                            'Use options above to annote new Analytical samples. Double-click on the table cells to edit the content.'},
                {xtype: "gridpanel", itemId: 'analyticalSampleContainer',
                    multiSelect: false,
                    features: [groupingFeature], plugins: [rowEditing],
                    margin: '0 15', minHeight: 200,
                    store: Ext.create('Ext.data.Store', {
                        model: "SL.model.SampleModels.AnalyticalReplicate",
                        groupField: 'treatment_id',
                        sorters: ['treatment_id', 'analytical_rep_id']
                    }),
                    viewConfig: {
                        stripeRows: true, markDirty: false,
                        deferEmptyText: false,
                        emptyText: '<h2 style="font-size: 16px; font-style:italic; color:#d6d6d6;padding-left: 25px;">No Analytical samples annotated yet.</h2>'
                    },
                    columns: [
                        {text: 'Protocol ID', dataIndex: 'treatment_id', width: 100},
                        {text: 'Analytical sample ID', dataIndex: 'analytical_rep_id', width: 200,
                            renderer: function (value) {
                                if (value.match(/^f_/)) {
                                    return '<span style="color:gray;">[Autogenerated after saving]</span>';
                                } else
                                    return value;
                            }
                        },
                        {text: 'Analytical sample name', flex: 1, dataIndex: 'analytical_rep_name',
                            editor: {xtype: 'textfield', allowBlank: false}
                        },
                        {xtype: 'actioncolumn', itemId: 'deleteRowButton',
                            width: 30, sortable: false, hidden: true,
                            items: [{icon: 'resources/images/delete_row_16x16.gif', tooltip: 'Delete this Analytical Sample', scope: me, handler:
                                            function (grid, rowIndex, colIndex) {
                                                this.getController().removeAnalyticalRepButtonClickHandler(grid, rowIndex);
                                            }
                                }
                            ]
                        }],
                    listeners: {
                        groupclick: function (view, node, group, e, eOpts) {
                            //This event is fired when header of a grouped set of Analytical Samples is clicked
                            //Check if the "Show Protocol Information" was clicked
                            if (e.target.className === "showProtocolLink") {
                                application.getController("TreatmentController").showTreatmentDetailsButtonHandler(event.target.id, me);
                                view.getFeature("treatmentGrouping").expand(group);
                            }
                        },
                        edit: function (editor, e, eOpts) {
                            //Event handled by the BioreplicateController
                            me.getController().editAnalyticalReplicateEventHandler(e.view, e.record);
                        },
                        beforeedit: function (editor, e) {
                            //AVOID TO EDIT IF NOT IN EDITION MODE
                            return me.inEditionMode;
                        }
                    }
                }
            ],
            listeners: {
                boxready: function () {
                    showHelpTips(this);
                },
                beforedestroy: function (item) {
                    me.getModel().deleteObserver(me);
                },
                afterlayout: function () {
                    //TODO: REMOVE THIS CODE
                    if (debugging === true)
                        console.info("BioReplicateView " + this.id + ": Layout");
                }
            }
        });
        me.callParent(arguments);
    }
});
