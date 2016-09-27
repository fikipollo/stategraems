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
 *   - SeparationMethodsView 
 *   - ColumnChromatographyView  (EXTENDS SeparationMethodsView)
 *   - GasChromatographyView  (EXTENDS ColumnChromatographyView)
 *   - LiquidChromatographyView  (EXTENDS ColumnChromatographyView)
 *   - CapillaryElectrophoresisView  (EXTENDS ExtractionMethodView)
 *   - MobilePhaseView
 *   - FractionView
 */
Ext.define('SL.view.AnalysisViews.RAWDataViews.SeparationMethodsView', {
    extend: 'Ext.container.Container',
    itemId: 'separationMethodView',
    mixins: {
        //Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer',
    },
    alias: 'widget.SeparationMethodsView',
    statics: {
        getInstance: function(type) {
            switch (type) {
                case "LiquidChromatographyView" :
                    return Ext.create('SL.view.AnalysisViews.RAWDataViews.LiquidChromatographyView');
                case "GasChromatographyView" :
                    return Ext.create('SL.view.AnalysisViews.RAWDataViews.GasChromatographyView');
                case "CapillaryElectrophoresis" :
                    return Ext.create('SL.view.AnalysisViews.RAWDataViews.CapillaryElectrophoresisView');
            }
        }
    },
    loadModel: function(model) {
        this.model = model;
        var fields = this.query('field');
        var fieldName;
        var fieldValue;
        for (var i in fields) {
            fieldName = fields[i].getName();
            if (fieldName != null) {
                fieldValue = model.get(fieldName);
                if (fieldValue != null) {
                    fields[i].setValue(fieldValue);
                }
            }
        }
    },
    getModel: function() {
        return this.model;
    },
    setEditableMode: function(mode) {
    }
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.ColumnChromatographyView', {
    extend: 'SL.view.AnalysisViews.RAWDataViews.SeparationMethodsView',
    alias: 'widget.ColumnChromatographyView',
    itemId: 'separationMethodView',
    columnChromatographyType: "",
    loadModel: function(model) {
        this.model = model;
        var fields = this.query('field');
        var fieldName;
        var fieldValue;
        for (var i in fields) {
            fieldName = fields[i].getName();
            if (fieldName != null) {
                fieldValue = model.get(fieldName);
                if (fieldValue != null) {
                    fields[i].setValue(fieldValue);
                }
            }
        }
        var mobilePhases = model.getMobilePhases();
        var mobilePhaseView;
        for (var i in mobilePhases) {
            mobilePhaseView = this.down('container[name=mobile_phases]').add(Ext.widget('MobilePhaseView'));
            mobilePhaseView.loadModel(mobilePhases[i]);
        }
        var fractions = model.getFractions();
        var fractionView;
        for (var i in fractions) {
            fractionView = this.down('container[name=fractions]').add(Ext.widget('FractionView'));
            fractionView.loadModel(fractions[i]);
        }
    },
    /********************************************************************************      
     * This function changes the Editable mode setting of all formulary fields and all 
     * the inner panels.
     *  
     * @param  mode, a boolean value where true means "Editable mode ON"
     * @return      
     ********************************************************************************/
    setEditableMode: function(mode) {
        this.queryById('mobile_phases_buttons').setVisible(mode);
        var mobilePhaseViews = this.query('MobilePhaseView');
        for (var i in mobilePhaseViews) {
            mobilePhaseViews[i].setEditableMode(mode);
        }
        this.queryById('fractions_buttons').setVisible(mode);
        var fractionsViews = this.query('FractionView');
        for (var i in fractionsViews) {
            fractionsViews[i].setEditableMode(mode);
        }
    },
    /**BC**********************************************************************************************
     * 
     * Some event declaration
     * 
     **EC***********************************************************************************************/
    platformComboboxChangeHandler: function(field, newValue, oldValue, eOpts) {
        field.nextSibling().getStore().clearFilter(true);
        field.nextSibling().getStore().filter("family", newValue);
    },
    /**BC**********************************************************************************************
     * 
     * Component declaration
     * 
     **EC***********************************************************************************************/
    initComponent: function() {
        var me = this;
        Ext.applyIf(me, {
            autoScroll: true,
            layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'container', layout: 'hbox', margin: '0 0 20 0', items: [
                        {xtype: 'label', html: '<h1 class="form_subtitle">' + me.columnChromatographyType + ' Chromatography details</h1>'},
                        {xtype: 'checkbox', boxLabel: 'Show', checked: true, margin: '12 0 0 10',
                            handler: function(checkbox, checked) {
                                var component = checkbox.up().nextSibling('container');
                                if (checked) {
                                    var parent = checkbox.up();
                                    parent.setLoading(true);
                                    var task = new Ext.util.DelayedTask(function() {
                                        component.setVisible(checked);
                                        component.getEl().fadeIn();
                                        parent.setLoading(false);
                                    });
                                    task.delay(100);
                                } else {
                                    component.getEl().fadeOut({callback: function() {
                                            component.setVisible(checked);
                                        }});
                                }
                            }
                        }
                    ]},
                {xtype: 'container', defaults: {layout: {type: 'vbox', align: 'stretch'}}, layout: {type: 'vbox', align: 'stretch'},
                    items: [
                        {xtype: 'container', cls: 'fieldBox', items: [
                                {xtype: 'label', html: '<h2>General features</h2>'},
                                {xtype: 'textarea', name: 'cc_sample_description', fieldLabel: 'Brief description of sample', minHeight: 100},
                                {xtype: 'textarea', name: 'cc_sample_processing', fieldLabel: 'Processing applied to sample', minHeight: 100},
                                {xtype: 'textarea', name: 'cc_sample_injection', fieldLabel: 'Sample injection', minHeight: 100},
                            ]},
                        {xtype: 'container', cls: 'fieldBox', items: [
                                {xtype: 'label', html: '<h2>Equipment - Column: Product details</h2>'},
                                {xtype: 'combobox', fieldLabel: 'Column manufacturer', name: 'column_manufacturer',
                                    blankText: 'Please type a Column manufacturer or select an existing from the list.',
                                    emptyText: 'Select or type a Column manufacturer...',
                                    displayField: 'name', valueField: 'name', queryMode: 'local',
                                    maxLength: 500, enforceMaxLength: true,
                                    store: Ext.create('Ext.data.ArrayStore',
                                            {
                                                fields: ['name'],
                                                autoLoad: true,
                                                proxy: {type: 'ajax', url: 'data/column_manufacturer.json', reader: {type: 'json', root: 'column_manufacturer', successProperty: 'success'}}
                                            }),
                                    listeners: {change: {fn: me.platformComboboxChangeHandler, scope: me}}
                                },
                                {xtype: 'combobox', fieldLabel: 'Column model', name: 'column_model',
                                    blankText: 'Please type a Column model or select an existing from the list.',
                                    emptyText: 'Select or type a Column model...',
                                    displayField: 'model', valueField: 'model',
                                    maxLength: 200, enforceMaxLength: true,
                                    store: Ext.create('Ext.data.ArrayStore',
                                            {
                                                fields: ['family', 'model'],
                                                autoLoad: true,
                                                proxy: {type: 'ajax', url: 'data/column_manufacturer.json', reader: {type: 'json', root: 'column_models', successProperty: 'success'}}
                                            })
                                },
                                {xtype: 'combobox', fieldLabel: 'Separation mode', name: 'separation_mode',
                                    maxWidth: 500, maxLength: 200, enforceMaxLength: true,
                                    store: ['Affinity', 'Anion Exchange', 'Cation Exchange', 'Reverse Phase', 'Hydrodynamic Volume']
                                },
                                {xtype: 'textfield', name: 'dimensions', fieldLabel: 'Dimensions', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textarea', name: 'description_of_stationary_phase', fieldLabel: 'Description of stationary phase', minHeight: 100},
                                {xtype: 'textarea', name: 'additional_accessories', fieldLabel: 'Additional accessories', minHeight: 100},
                            ]},
                        {xtype: 'container', cls: 'fieldBox', items: [
                                {xtype: 'label', html: '<h2>Equipment - Chromatography system used for separation</h2>'},
                                {xtype: 'textarea', name: 'combined_unit_manufacturer', fieldLabel: 'Manufacturer of combined unit and software', minHeight: 100},
                                {xtype: 'textarea', name: 'combined_unit_model', fieldLabel: 'Model (of combined unit)', minHeight: 100},
                            ]},
                        {xtype: 'container', name: "mobile_phases", fieldLabel: 'Mobile Phases', cls: 'fieldBox',
                            flex: 1, layout: {type: 'vbox', align: 'stretch'},
                            items: [
                                {xtype: 'label', html: '<h2>Mobile phases</h2>'},
                                {xtype: 'container', itemId: 'mobile_phases_buttons',
                                    items: [
                                        {xtype: 'button', iconCls: 'add_small',
                                            margin: '0 5 0 0', maxHeight: 22, maxWidth: 22,
                                            handler: function() {
                                                this.up('container[name=mobile_phases]').add(Ext.widget('MobilePhaseView'));
                                            }
                                        },
                                        {xtype: 'label', text: 'Add mobile phase'}
                                    ]}
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox', items: [
                                {xtype: 'label', html: '<h2>Column Run properties</h2>'},
                                {xtype: 'textfield', name: 'time', fieldLabel: 'Time', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'gradient', fieldLabel: 'Gradient', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'flow_rate', fieldLabel: 'Flow rate', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'temperature', fieldLabel: 'Temperature', maxLength: 200, enforceMaxLength: true},
                            ]},
                        {xtype: 'container', cls: 'fieldBox', items: [
                                {xtype: 'label', html: '<h2>Pre and Post Run processes</h2>'},
                                {xtype: 'textarea', name: 'pre_run_process_type', fieldLabel: 'Type', minHeight: 100},
                                {xtype: 'textfield', name: 'pre_run_process_substance', fieldLabel: 'Substance', maxLength: 200, enforceMaxLength: true, },
                                {xtype: 'textfield', name: 'pre_run_process_time', fieldLabel: 'Time', maxLength: 200, enforceMaxLength: true, },
                                {xtype: 'textfield', name: 'pre_run_process_flowrate', fieldLabel: 'Flow rate', maxLength: 200, enforceMaxLength: true, },
                            ]},
                        {xtype: 'container', cls: 'fieldBox', items: [
                                {xtype: 'label', html: '<h2>Column outputs - Detection</h2>'},
                                {xtype: 'textarea', name: 'detection_equipment', fieldLabel: 'Equipment used for detection', minHeight: 100},
                                {xtype: 'textfield', name: 'detection_type', fieldLabel: 'Type', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textarea', name: 'detection_equipment_settings', fieldLabel: 'Equipment settings', minHeight: 100},
                                {xtype: 'textarea', name: 'detection_timescale', fieldLabel: 'Timescale over which data was collected', minHeight: 100},
                                {xtype: 'textarea', name: 'detection_trace', fieldLabel: 'Trace', minHeight: 100},
                            ]},
                        {xtype: 'container', name: "fractions", fieldLabel: 'Fractions', cls: 'fieldBox',
                            flex: 1, layout: {type: 'vbox', align: 'stretch'},
                            items: [
                                {xtype: 'label', html: '<h2>Column outputs - Fractions</h2>'},
                                {xtype: 'container', itemId: 'fractions_buttons',
                                    items: [
                                        {xtype: 'button', iconCls: 'add_small',
                                            margin: '0 5 0 0', maxHeight: 22, maxWidth: 22,
                                            handler: function() {
                                                this.up('container[name=fractions]').add(Ext.widget('FractionView'));
                                            }
                                        },
                                        {xtype: 'label', text: 'Add fraction'}
                                    ]}
                            ]
                        }
                    ]},
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.MobilePhaseView', {
    extend: 'Ext.container.Container',
    alias: 'widget.MobilePhaseView',
    loadModel: function(model) {
        this.model = model;
        this.setName(model.getName());
        this.setDescription(model.getDescription());
    },
    getModel: function() {
        return this.model;
    },
    getName: function() {
        return this.queryById('nameField').getValue();
    },
    setName: function(name) {
        this.queryById('nameField').setValue(name);
    },
    getDescription: function() {
        return this.queryById('descriptionField').getValue();
    },
    setDescription: function(description) {
        this.queryById('descriptionField').setValue(description);
    },
    removeMobilePhase: function() {
        this.up('container[name=mobile_phases]').remove(this.up('MobilePhaseView'));
    },
    setEditableMode: function(mode) {
        this.down('button').setVisible(mode)
    },
    /**BC**********************************************************************************************
     * 
     * Component declaration
     * 
     **EC***********************************************************************************************/
    initComponent: function() {
        var me = this;
        Ext.applyIf(me, {
            margin: 20, padding:5,
            cls: "mobilePhaseView", 
            layout: {type: 'hbox', align: 'stretch'},
            items: [
                {xtype: 'button', iconCls: 'delete_small', cls: 'cancelButton',
                    margin: '0 5 0 0', maxHeight: 22, maxWidth: 22,
                    handler: me.removeMobilePhase
                },
                {xtype: 'container', flex: 1, layout: {type: 'vbox', align: 'stretch'},
                    items: [
                        {xtype: 'textfield', itemId: 'nameField', name: 'mp_name', fieldLabel: 'Name', labelWidth: 120, maxLength: 500, enforceMaxLength: true, allowBlank: false},
                        {xtype: 'textarea', itemId: 'descriptionField', name: 'mp_description', fieldLabel: 'Description', flex: 1, minHeight: 100, labelWidth: 120}
                    ]}
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.FractionView', {
    extend: 'Ext.container.Container',
    alias: 'widget.FractionView',
    loadModel: function(model) {
        this.model = model;
        this.setName(model.getName());
        this.setDescription(model.getDescription());
    },
    getModel: function() {
        return this.model;
    },
    getName: function() {
        return this.queryById('nameField').getValue();
    },
    setName: function(name) {
        this.queryById('nameField').setValue(name);
    },
    getDescription: function() {
        return this.queryById('descriptionField').getValue();
    },
    setDescription: function(description) {
        this.queryById('descriptionField').setValue(description);
    },
    removeFraction: function() {
        this.up('container[name=fractions]').remove(this.up('FractionView'));
    },
    setEditableMode: function(mode) {
        this.down('button').setVisible(mode)
    },
    /**BC**********************************************************************************************
     * 
     * Component declaration
     * 
     **EC***********************************************************************************************/
    initComponent: function() {
        var me = this;
        Ext.applyIf(me, {
            margin: 20, padding:5,
            cls: "fractionView",
            layout: {type: 'hbox', align: 'stretch'},
            items: [
                {xtype: 'button', iconCls: 'delete_small', cls: 'cancelButton',
                    margin: '0 5 0 0', maxHeight: 22, maxWidth: 22,
                    handler: me.removeFraction
                },
                {xtype: 'container', flex: 1, layout: {type: 'vbox', align: 'stretch'},
                    items: [
                        {xtype: 'textfield', itemId: 'nameField', name: 'fr_name', fieldLabel: 'Name', labelWidth: 100, maxLength: 500, enforceMaxLength: true, allowBlank: false},
                        {xtype: 'textarea', itemId: 'descriptionField', name: 'fr_description', fieldLabel: 'Description', flex: 1, minHeight: 100, labelWidth: 100}
                    ]}
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.GasChromatographyView', {
    extend: 'SL.view.AnalysisViews.RAWDataViews.ColumnChromatographyView',
    alias: 'widget.GasChromatographyView',
    columnChromatographyType: "Gas"
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.LiquidChromatographyView', {
    extend: 'SL.view.AnalysisViews.RAWDataViews.ColumnChromatographyView',
    alias: 'widget.LiquidChromatographyView',
    columnChromatographyType: "Liquid"
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.CapillaryElectrophoresisView', {
    extend: 'SL.view.AnalysisViews.RAWDataViews.SeparationMethodsView',
    alias: 'widget.CapillaryElectrophoresisView',
    itemId: 'separationMethodView',
    /**BC**********************************************************************************************
     * 
     * Component declaration
     * 
     **EC***********************************************************************************************/
    initComponent: function() {
        var me = this;
        Ext.applyIf(me, {
            defaults: {layout: {type: 'vbox', align: 'stretch'}},
            layout: {type: 'vbox', align: 'stretch'},
            autoScroll: true,
            items: [
                {xtype: 'label', html: '<h1 class="form_subtitle">Capillary Electrophoresis details</h1>'},
                {xtype: 'container', cls: 'fieldBox', items: [
                        {xtype: 'label', html: '<h2>CE General features</h2>'},
                        {xtype: 'combobox', fieldLabel: 'Experiment type', name: 'experiment_type',
                            maxWidth: 750, allowBlank: false, maxLength: 200, enforceMaxLength: true,
                            emptyText: "Select or type the experiment type",
                            displayField: 'value', valueField: 'value',
                            store: [
                                "Capillary Zone Electrophoresis (CZE)", "Capillary Gel Electrophoresis (CGE)",
                                "Micellar Electrokinetic Capillary Chromatography (MEKC)",
                                "Capillary Electrochromatography (CEC)", "Capillary Isoelectric Focusing (CIEF)",
                                "Capillary Isotachorphoresis (CITP)"
                            ],
                        },
                        {xtype: 'combobox', fieldLabel: 'Experiment aim', name: 'experiment_aim',
                            maxWidth: 750, allowBlank: false, maxLength: 200, enforceMaxLength: true,
                            emptyText: "Select or type the experiment aim",
                            displayField: 'value', valueField: 'value',
                            store: ["Quantitation", "Identification", "Size determination", "pI determination", "Enantiomeric excess determination"],
                        },
                        {xtype: 'label', html: '<h2>CE sample features</h2>'},
                        {xtype: 'textarea', name: 'ce_sample_description', fieldLabel: 'Sample description'},
                        {xtype: 'textarea', name: 'ce_sample_solution', fieldLabel: 'Sample solution'},
                        {xtype: 'textarea', name: 'ce_sample_preparation', fieldLabel: 'Sample preparation'},
                        {xtype: 'label', html: '<h2>Equipment details</h2>'},
                        {xtype: 'textarea', name: 'capillary_description', fieldLabel: 'Capillary description'},
                        {xtype: 'textarea', name: 'capillary_source', fieldLabel: 'Capillary Manufacturer/source'},
                        {xtype: 'textfield', name: 'capillary_dimensions', fieldLabel: 'Capillary dimensions', maxLength: 200, enforceMaxLength: true},
                        {xtype: 'label', html: '<h2>Run process description</h2>'},
                        {xtype: 'textfield', name: 'ce_temperature', fieldLabel: 'Temperature of capillary', maxLength: 200, enforceMaxLength: true},
                        {xtype: 'textarea', name: 'auxiliary_data_channels', fieldLabel: 'Auxiliary data channels'},
                        {xtype: 'textfield', name: 'duration', fieldLabel: 'Duration of data collection', maxLength: 200, enforceMaxLength: true},
                        {xtype: 'textarea', name: 'run_description', fieldLabel: 'Run description', flex: 1, minHeight: 500}
                    ]}
            ]
        });
        me.callParent(arguments);
    }
});
