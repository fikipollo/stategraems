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
 * - RegionSelectorField
 * - RegionSelectorWindow
 * - RegionSelectedItem
 * - AnalysisListElement
 * 
 */
Ext.define('SL.view.AnalysisViews.RegionSelectorField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.RegionSelectorField',
    fieldLabel: 'Selected Regions', itemId: "regionSelectorField",
    layout: {type: 'vbox', align: 'stretch'},
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            border: 0, minHeight: 30, fieldBodyCls: "regionSelectorFieldBody",
            items: [
                {xtype: 'container', margin: '0 0 5 0', hidden: false, itemId: "buttonsPanel",
                    items: [
                        {xtype: 'button', cls: 'button', text: '<i class="fa fa-plus-circle"></i> Add used region', margin: '0 5 0 0',
                            handler: function () {
                                Ext.require(['SL.view.senchaExtensions.ElementListSelector'], function () {
                                    var selectionWindow = Ext.create('SL.view.AnalysisViews.RegionSelectorWindow', {parent: me});
                                    selectionWindow.setHeight(Ext.getBody().getViewSize().height * 0.8);
                                    selectionWindow.setWidth(Ext.getBody().getViewSize().width * 0.7);
                                    selectionWindow.show();
                                });
                            }
                        }
                    ]},
                {xtype: 'panel', itemId: 'panelRegions', border: 0, flex: 1, layout: {type: 'vbox', align: 'stretchmax'}}
            ]
        });
        me.callParent(arguments);
    },
    addModel: function (model) {
        this.getModels().push(model);
    },
    removeModel: function (index) {
        return this.models.splice(index, 1);
    },
    getModels: function () {
        if (this.models == null) {
            this.models = [];
        }
        return this.models;
    },
    loadModels: function (_models) {
        var models = this.getModels();
        for (var i in _models) {
            models.push(_models[i]);
        }
        this.update();
    },
    update: function () {
        var panelRegions = this.queryById('panelRegions');
        panelRegions.removeAll();
        var models = this.getModels();
        for (var i in models) {
            var n = parseInt(i) + 1;
            var item = Ext.widget('RegionSelectedItem');
            item.setContent(models[i], n)
            panelRegions.add(item);
        }
    },
    setEditable: function (mode) {
        this.queryById('buttonsPanel').setVisible(mode);
        Ext.Array.each(this.query('RegionSelectedItem'), function (elem) {
            elem.setEditable(mode);
        });
    }
});

Ext.define('SL.view.AnalysisViews.RegionSelectorWindow', {
    extend: 'Ext.window.Window',
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            title: "Region selection",
            layout: {type: 'vbox', align: "stretch"},
            height: 400, minHeight: 400, width: 720, minWidth: 720,
            closable: false,
            modal: true,
            items: [
                {xtype: "box", html: "<h1 class='form_title' style='font-size:20px'>Please, register an external Regions source</h1>"},
                {xtype: 'container', bodyPadding: 10, layout: {align: 'stretch', type: 'vbox'}, border: 0,
                    defaults: {labelAlign: 'right', labelWidth: 120, msgTarget: 'side', labelStyle: 'font-weight:bold; font-size: 14px'},
                    items: [
                        {xtype: 'textfield', name: 'region_name', itemId: "regionNameField", allowBlank: false, fieldLabel: 'Name'},
                        {xtype: 'textfield', name: 'source', itemId: "regionSourceField", allowBlank: false, fieldLabel: 'Source'},
                        {xtype: 'textarea', flex: 1, name: 'files_location', itemId: "regionFilesLocationField", allowBlank: false, fieldLabel: 'File location'}
                    ],
                },
                {xtype: "box", html: "<h1 class='form_title' style='font-size:20px'>Or click here to select an already defined region (regions obtained on previous analysis)</h1>"},
                {xtype: 'ElementListSelector', border: true, flex: 1,
                    region: 'center', itemId: 'regionSelectorPanel',
                    fieldsNames: [['Step id', "step_id"], ['Analysis Type', "analysis_type"], ['Region Type', "processed_data_type"]],
                    columnsWidth: [100, 150, -1], allowMultiselect: true,
                    closable: false,
                    store: Ext.create('Ext.data.Store', {model: 'SL.model.AnalysisModels.Processed_data', }),
                    gridpanelDblClickHandler: function (grid, record) {
                    },
                    setData: function (data) {
                        this.down('gridpanel').columns[2].renderer = function (value) {
                            switch (value) {
                                case "region_calling_step":
                                    return "Region calling";
                                case "region_intersection_step":
                                    return "Region intersection";
                                case "region_consolidation_step":
                                    return "Region consolidation";
                            }
                        };
                        this.down('gridpanel').getStore().loadRawData(data);
                        this.down('gridpanel').setLoading(false);
                    }
                }
            ],
            buttons: [
                {
                    text: '<i class="fa fa-check"></i> Add selection', cls: 'acceptButton',
                    handler:
                            /***********************************************************************************************************
                             * This function handles the event fires when the button "Add region step" is clicked during a 
                             * Region Processed_step creation/edition.
                             * First opens a new Dialog with a list of all the Region Processed data registered in the DB and an extra
                             * Panel for external Regions file insertion.
                             * When the Accept button is pressed, the selected Region steps or external files are inserted in the view
                             *
                             * @param  button
                             ***********************************************************************************************************/
                                    function (button) {
                                        var selected_elements = me.down('ElementListSelector').getSelectedData();
                                        var regionElement = null;
                                        for (var i in selected_elements) {
                                            regionElement = new Object();
                                            regionElement.source = "previous_analysis";
                                            regionElement.region_step_id = selected_elements[i].analysis_id;
                                            regionElement.region_step_type = selected_elements[i].processed_data_type;
                                            regionElement.files_location = selected_elements[i].files_location;
                                            me.parent.addModel(regionElement);
                                        }

                                        if (me.queryById('regionNameField').getValue() !== "") {
                                            regionElement = new Object();
                                            regionElement.source = me.queryById('regionSourceField').getValue();
                                            regionElement.region_name = me.queryById('regionNameField').getValue();
                                            regionElement.files_location = me.queryById('regionFilesLocationField').getValue();

                                            me.parent.addModel(regionElement);
                                        }

                                        me.parent.update();
                                        me.close();
                                    }
                        },
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function (button) {
                        me.close();
                    }}],
            listeners: {
                boxready: function () {
                    showHelpTips(this);
                    application.getController("ProcessedDataController").loadAllRegionDefinitionSteps(this.queryById("regionSelectorPanel"));
                }
            }
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.RegionSelectedItem', {
    extend: 'Ext.container.Container',
    alias: 'widget.RegionSelectedItem',
    border: 0, model: null, index: 0,
    layout: {type: 'hbox', align: 'middle'},
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [
                {xtype: 'button', iconCls: 'delete_small', cls: 'cancelButton',
                    margin: '0 5 0 0', maxHeight: 22, maxWidth: 22,
                    handler: me.removeRegionElement
                },
                {xtype: 'box', margins: '5 0 0 5 ', minHeight: 50, itemId: "regionSelectedItem", cls: "regionSelectedItem"}
            ]

        });
        me.callParent(arguments);
    },
    setContent: function (model, index) {
        var _html;
        _html = "<b>Used region " + index + ": </b>";
        if (model.region_name != null) {
            _html += model.region_name;
        }
        _html += "</br><p style='margin-left:10px'><b>Source:</b> "
        if (model.region_step_id == null) {
            _html += model.source;
        } else {
            _html += "Resulting regions from analysis " + model.region_step_id;
        }

        _html += "<br><b>File Location:</b><br>";
        var files_location = model.files_location;
        files_location = files_location.replace(/\$\$/g, "\n");
        files_location = files_location.split("\n");
        var pattern = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
        for (var i in files_location) {
            if (pattern.test(files_location[i])) {
                _html += '<a style="margin-left:20px"  href="' + files_location[i] + '">' + files_location[i] + '</a>';
            } else {
                _html += '<p style="margin-left:20px"  >' + files_location[i] + '</p>';
            }
        }

        _html += "</p>";
        this.queryById("regionSelectedItem").update(_html);
        this.model = model;
        this.index = index;
    },
    getModel: function () {
        return this.model;
    },
    removeRegionElement: function () {
        this.up("RegionSelectorField").removeModel(this.up("RegionSelectedItem").index - 1);
        this.up("RegionSelectorField").update();
    },
    setEditable: function (mode) {
        this.down('button').setVisible(mode)
    }
});
