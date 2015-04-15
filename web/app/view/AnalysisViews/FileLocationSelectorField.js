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
 * - FileLocationSelectorField
 * - FileLocationSelectorWindow
 * - FileLocationSelectorPanel
 * - FileLocationItem
 * 
 */
Ext.define('SL.view.AnalysisViews.FileLocationSelectorField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.FileLocationSelectorField',
    fieldLabel: 'File Location', itemId: "fileLocationSelectorField",
    layout: {type: 'vbox', align: 'stretch'},
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
        this.models = [];
        for (var i in _models) {
            this.models.push(_models[i]);
        }
        this.update();
    },
    update: function () {
        var models = this.getModels();
        var panelFileLocations = this.queryById('panelFileLocations');
        Ext.suspendLayouts();
        panelFileLocations.removeAll();
        if (models.length > 0) {
            for (var i in models) {
                var n = parseInt(i) + 1;
                var item = Ext.widget('FileLocationItem');
                item.setContent(models[i], n);
                panelFileLocations.add(item);
            }
        } else {
            panelFileLocations.add({xtype: "label", height: 20, width: 200, html: '<i style="line-height:20px">Not specified</i>'});
        }
        Ext.resumeLayouts(true);
    },
    setEditable: function (mode) {
        Ext.suspendLayouts();
        this.queryById('buttonsPanel').setVisible(mode);
        Ext.Array.each(this.query('FileLocationItem'), function (elem) {
            elem.setEditable(mode);
        });
        Ext.resumeLayouts(true);
    },
    setEnabled: function (enabled) {
        Ext.suspendLayouts();
        this.setDisabled(!enabled);
        this.queryById('buttonsPanel').setDisabled(!enabled);
        Ext.Array.each(this.query('FileLocationItem'), function (elem) {
            elem.setDisabled(!enabled);
        });
        Ext.resumeLayouts(true);
    },
    getValue: function () {
        var value = "";
        var models = this.getModels();
        for (var i in models) {
            value += models[i].file_location + "$$";
        }
        return value.replace(/\$\$$/, "");
    },
    getName: function () {
        return this.name;
    },
    isValid: function () {
        if (this.allowBlank === false && this.isDisabled() === false) {
            if (this.getModels().length < 1) {
                this.queryById('panelFileLocations').down("label").update('<b style="line-height:20px; color:red;"><i class="fa fa-exclamation-triangle"></i> This field is required.</b>');
                return false;
            }
        }
        return true;
    },
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            border: "1px solid #E4E5E6", minHeight: 30, fieldBodyCls: "fileLocationSelectorFieldBody",
            items: [
                {xtype: 'container', margin: '0 0 5 0', hidden: false, itemId: "buttonsPanel",
                    items: [
                        {xtype: 'button', cls: 'button', text: '<i class="fa fa-plus-circle"></i> Add file location', margin: '0 5 0 0',
                            handler: function () {
                                Ext.create('SL.view.AnalysisViews.FileLocationSelectorWindow', {parent: me}).show();
                            }}
                    ]},
                {xtype: 'panel', itemId: 'panelFileLocations', border: 0, flex: 1, layout: {type: 'vbox', align: 'stretchmax'}}
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.FileLocationSelectorWindow', {
    extend: 'Ext.window.Window',
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            title: "File location selection",
            layout: {type: 'fit'}, height: 600, minHeight: 400, width: 720, minWidth: 720, closable: false, modal: true,
            items: [Ext.create("SL.view.AnalysisViews.FileLocationSelectorPanel")],
            buttons: [
                {text: '<i class="fa fa-check"></i> Add selection', cls: 'acceptButton',
                    handler:
                            /***********************************************************************************************************
                             * This function handles the event fires when the button "Add file location" is clicked during a 
                             * step creation/edition.
                             * First opens a new Dialog with a list of the content of the Experiment directory.
                             * When the Accept button is pressed, the selected file locations are inserted in the view
                             *
                             * @param  button
                             ***********************************************************************************************************/
                                    function (button) {
                                        var selected_elements = me.down('treepanel').getChecked();
                                        var fileLocationElement = null;
                                        for (var i in selected_elements) {
                                            fileLocationElement = new Object();
                                            fileLocationElement.file_location = selected_elements[i].raw.path;
                                            me.parent.addModel(fileLocationElement);
                                        }
                                        var fileLocation = me.queryById('fileLocationField').getValue();
                                        if (fileLocation !== "") {
                                            fileLocation = fileLocation.split("\n");
                                            for (var i in fileLocation) {
                                                me.parent.addModel({"file_location": fileLocation[i]});
                                            }
                                        }
                                        me.parent.update();
                                        me.close();
                                    }
                        },
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function (button) {
                        me.close();
                    }}]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.FileLocationSelectorPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.FileLocationSelectorPanel',
    getSelectedPaths: function () {
        var selected_elements = this.down("treepanel").getChecked();
        var selectedPaths = [];
        for (var i in selected_elements) {
            selectedPaths.push(selected_elements[i].raw.path);
        }
        var fileLocation = this.queryById('fileLocationField').getValue();
        if (fileLocation !== "") {
            selectedPaths.push(fileLocation);
        }
        return selectedPaths;
    },
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            layout: {type: 'vbox', align: "stretch"},
            items: [
                {xtype: 'label', html: '<h1 class="form_subtitle">File location selection</h1>'},
                {xtype: 'label', html: '<h2 style=" font-size: 16px; font-weight: 300; color: #5F5F5F; margin: 0px 5px; ">Please, browse the Experiment directory and choose the files location or...</h2>'},
                {xtype: "treepanel", flex: 1, itemId: 'experimentDirTreePanel', multiSelect: true,
                    store: Ext.create('Ext.data.TreeStore', {root: {expanded: true, children: []}}),
                    getSelectedData: function () {
                        return this.getSelectionModel().getSelection();
                    },
                    listeners: {
                        boxready: function () {
                            application.getController("ApplicationController").showDataDirectoryContentButtonClickHandler(this);
                        }
                    }
                },
                {xtype: 'label',
                    html: '<h2 style=" font-size: 16px; font-weight: 300; color: #5F5F5F; margin: 0px 5px; ">Enter it manually (path to files at your server or an URL).</h2>' +
                            '<i class="panelHelpTip"><i class="fa fa-info-circle"></i>One file or URL per line. In case of URL, precede the path with the corresponding protocol (i.e. http(s):// or ftp://.</i>).'
                },
                {xtype: 'form', border: 0, resizable: true, bodyPadding: 10, layout: {align: 'stretch', type: 'vbox'},
                    fieldDefaults: {labelAlign: 'right', labelWidth: 120, msgTarget: 'side', labelStyle: 'font-weight:bold; font-size: 14px'},
                    items: [{xtype: 'textarea', flex: 1, name: 'file_location', itemId: "fileLocationField", fieldLabel: 'File location'}]
                }],
            listeners: {
                boxready: function () {
                    showHelpTips(this);
                }
            }
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.FileLocationItem', {
    extend: 'Ext.container.Container',
    alias: 'widget.FileLocationItem',
    border: 0, model: null, index: 0,
    layout: {type: 'hbox', align: 'middle'},
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [
                {xtype: 'button', text: '<i class="fa fa-remove"></i>', margin: '0 5 0 0', style: "background:#FC4E4E", maxHeight: 22, maxWidth: 22, handler: me.removeFileLocationItem},
                {xtype: 'box', margins: '5 0 0 5 ', minHeight: 50, itemId: "FileLocationItem", cls: "fileLocationItem"}
            ]
        });
        me.callParent(arguments);
    },
    setContent: function (model, index) {
        var _html;
        _html = "<b>File location " + index + ":</b></br>";
        _html += model.file_location;
        this.queryById("FileLocationItem").update(_html.replace(/(https?:\/\/|ftp:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})(\:[\d]+)?\/?([\da-zA-Z\.\-\/_\#\?%=]*)/g, "<a href='$&' target='_blank'>$&</a>"));
        this.model = model;
        this.index = index;
    },
    getModel: function () {
        return this.model;
    },
    removeFileLocationItem: function () {
        this.up("FileLocationSelectorField").removeModel(this.up("FileLocationItem").index - 1);
        this.up("FileLocationSelectorField").update();
    },
    setEditable: function (mode) {
        this.down('button').setVisible(mode)
    }
});
