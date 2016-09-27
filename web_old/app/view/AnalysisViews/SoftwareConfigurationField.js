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
 * - SoftwareConfigurationField
 * 
 */
Ext.define('SL.view.AnalysisViews.SoftwareConfigurationField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.SoftwareConfigurationField',
    itemId: 'software_configuration_static',
    name: 'software_configuration',
    fieldLabel: 'Software configuration',
    border: 1, style: {borderColor: "#e8e8e8"},
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            editable_mode: false,
            items: [Ext.widget("SoftwareConfigurationFieldItem", {itemId: "softwareConfigurationFieldItem", parent: this, editable_mode: this.editable_mode}).setContent(null)]
        });
        me.callParent(arguments);
    },
    getValue: function () {
        return this.value;
    },
    setValue: function (value) {
        this.value = ((value == null) ? "" : value);
        this.removeAll();
        this.add(Ext.widget("SoftwareConfigurationFieldItem", {itemId: "softwareConfigurationFieldItem", parent: this, editable_mode: this.editable_mode}).setContent(this.value));
    },
    setViewMode: function (mode) {
        this.editable_mode = (mode == "edition" || mode == "creation");
        this.queryById("softwareConfigurationFieldItem").editable_mode = this.editable_mode;
    },
    showSoftwareConfigDetailsButtonClickHandler: function () {
        var me = this;
        var creationWindow = Ext.create('Ext.window.Window', {
            title: 'Software configuration details',
            height: 600, width: 800,
            layout: 'fit', closable: false, modal: true, previousPanel: null,
            parent: me,
            items: [
                {xtype: 'panel', itemId: 'creationPanelContent',
                    layout: 'fit', border: false, autoScroll: true,
                    dockedItems: [{
                            xtype: 'toolbar', dock: 'top',
                            items: [{
                                    text: '<i class="fa fa-edit"></i> Edit code', cls: 'editButton', hidden: !me.editable_mode,
                                    handler: function (button) {
                                        creationWindow.down('textarea').setVisible(true);
                                        creationWindow.queryById('software_configuration_static').setVisible(false);
                                        button.setVisible(false);
                                        button.nextSibling('button').setVisible(true);
                                    }
                                },
                                {text: '<i class="fa fa-check"></i> Save changes', cls: 'acceptButton', hidden: true,
                                    handler: function (button) {
                                        creationWindow.loadModel(creationWindow.down('textarea').getValue());
                                        creationWindow.down('textarea').setVisible(false);
                                        creationWindow.queryById('software_configuration_static').setVisible(true);
                                        button.setVisible(false);
                                        button.previousSibling('button').setVisible(true);
                                    }
                                }]
                        }],
                    items: [
                        {xtype: 'textarea', name: 'software_configuration', hidden: true},
                        {xtype: 'box', itemId: 'software_configuration_static'}
                    ]
                }
            ],
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', handler: function () {
                        this.up('window').parent.setValue(creationWindow.down('textarea').getValue());
                        creationWindow.close();
                    }
                },
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function () {
                        this.up('window').close();
                    }
                }
            ],
            loadModel: function (text) {
                this.queryById('software_configuration_static').update('<pre><code class="prettyprint bash">' + text + '</code></pre>');
                this.down('textarea').setValue((text == null ? "" : text));
                $('.prettyprint').each(function (i, block) {
                    hljs.highlightBlock(block);
                });
            }
        });
        creationWindow.loadModel(creationWindow.parent.getValue());
        creationWindow.show();
        $('.prettyprint').each(function (i, block) {
            hljs.highlightBlock(block);
        });
    }
});


Ext.define('SL.view.AnalysisViews.SoftwareConfigurationFieldItem', {
    extend: 'Ext.Component',
    alias: 'widget.SoftwareConfigurationFieldItem',
    parent: null,
    setContent: function (data) {
        var _html;
        _html = "<span class='softwareConfigurationItemTools' style='display:none;float: left; position: absolute; background: white;'>" +
                "<a class='tableOption editOption' " + ((this.editable_mode === false) ? "style='display:none'" : "") + "><i class='fa fa-edit'></i></a>" +
                "<a class='tableOption detailsOption'><i class='fa fa-search'></i></a></span>";

        data = ((data == null || data == "") ? "Not specified" : data);
        data = data.split(/\r\n|\r|\n/);

        if (data.length > 40) {
            data = data.slice(0, 40);
            data.push('<i style=" font-size: 12px; font-weight: bold;">[Click on details button to show complete code]</i>');
        }
        data = data.join("\n");

        _html += '<pre><code class="prettyprint bash">' + data + '</code></pre>';
        this.update(_html.replace(/(https?:\/\/|ftp:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})(\:[\d]+)?\/?([\da-zA-Z\.\-\/_\#\?%=]*)/g, "<a href='$&' target='_blank'>$&</a>"), false, function () {
            $('.prettyprint').each(function (i, block) {
                hljs.highlightBlock(block);
            });
        });

        return this;
    },
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            border: 0, margins: '5 0 0 5 ', minHeight: 50, layout: {type: 'hbox', align: 'middle'}, cls: "softwareConfigurationItem", editable_mode: false,
            listeners: {
                boxready: function () {
                    var me = this;
                    $(this.getEl().dom).hover(function () {
                        $(this).find(".softwareConfigurationItemTools").fadeIn();
                    }, function () {
                        $(this).find(".softwareConfigurationItemTools").fadeOut();
                    }
                    );
                    var qtipData = {content: 'Edit this code', show: 'mouseover', hide: 'mouseout', style: {classes: 'qtip-tipsy qtip-shadow'}, position: {my: 'bottom center', at: 'top center'}};
                    $(this.getEl().dom).find("a.editOption").click(
                            function () {
                                me.parent.showSoftwareConfigDetailsButtonClickHandler();
                                console.log("edit");
                            }
                    ).css("display", (me.editable_mode === false ? "none" : "")).qtip(qtipData);

                    qtipData.content = "Show complete code";
                    $(this.getEl().dom).find("a.detailsOption").click(
                            function () {
                                me.parent.showSoftwareConfigDetailsButtonClickHandler();
                                console.log("details");
                            }
                    ).qtip(qtipData);
                    $('.prettyprint').each(function (i, block) {
                        hljs.highlightBlock(block);
                    });
                }
            }
        });
        me.callParent(arguments);
    }
});
