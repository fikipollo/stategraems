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
 *   - ExtractionMethodView 
 *   - SequencingRAWdataView  (EXTENDS ExtractionMethodView)
 *   - ChIPseqView  (EXTENDS ExtractionMethodView)
 *   - DNaseseqView  (EXTENDS ExtractionMethodView)
 *   - MethylseqView  (EXTENDS ExtractionMethodView)
 *   - mRNAseqView  (EXTENDS ExtractionMethodView)
 *   - smallRNAseqView  (EXTENDS ExtractionMethodView)
 *   - MassSpectrometryView  (EXTENDS ExtractionMethodView)
 *   - NuclearMagneticResonanceView  (EXTENDS ExtractionMethodView)
 *   - 
 */
Ext.define('SL.view.AnalysisViews.RAWDataViews.ExtractionMethodView', {
    extend: 'Ext.container.Container',
    mixins: {
        //Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer',
    },
    updateObserver: function () {
        this.loadModel(this.getModel());
    },
    listeners: {
        boxready: function () {
            showHelpTips(this);
        },
        beforedestroy: function (item) {
            item.getModel().deleteObserver(item);
        },
        afterlayout: function () {
            //TODO: REMOVE THIS CODE
            if (debugging === true)
                console.info("ExtractionMethodView : Layout");
        }
    },
    getModel: function () {
        return this.model;
    },
    loadModel: function (model) {
        this.suspendLayout = true;
        this.model = model;

        var fields = this.query('field');
        var fieldName;
        var fieldValue;
        for (var i in fields) {
            fieldName = fields[i].getName();
            if (fieldName != null) {
                fieldValue = model.get(fieldName);
                if (fieldValue != null) {
                    fields[i].setRawValue(fieldValue);
                }
            }
        }
        this.suspendLayout = false;
    }
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.SequencingRAWdataView', {
    extend: 'Ext.container.Container',
    alias: 'widget.SequencingRAWdataView',
    itemId: 'sequencingFields',
    /**BC**********************************************************************************************
     * 
     * Some event declaration
     * 
     **EC***********************************************************************************************/
    layoutComboboxChangeHandler: function (field, newValue, oldValue, eOpts) {
        //  GET THE SELECTED EXPERIMENT TYPE
        var layoutType = newValue;
        var paired_end_description_fields = field.up('RAWDataView').queryById("paired_end_description_fields");
        paired_end_description_fields.setVisible(layoutType === "Paired-end");
        paired_end_description_fields.setDisabled(layoutType !== "Paired-end");
        paired_end_description_fields.defaults.submitValue = (layoutType === "Paired-end");
    },
    platformComboboxChangeHandler: function (field, newValue, oldValue, eOpts) {
        field.up('RAWDataView').queryById('platform_model_combo').getStore().clearFilter(true);
        field.up('RAWDataView').queryById('platform_model_combo').getStore().filter("family", newValue);
    },
    poolingComboboxChangeHandler: function (field, newValue, oldValue, eOpts) {
        if (newValue !== "None") {
            field.up('RAWDataView').queryById("poolingStrategyDescriptionField").setVisible(true);
            field.up('RAWDataView').queryById("poolingStrategyDescriptionField").submitValue = true;
        }
    },
    /**BC**********************************************************************************************
     * 
     * Component declaration
     * 
     **EC***********************************************************************************************/
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'label', html: '<h1 class="form_subtitle">Sequencing details</h1>'},
                {xtype: 'container', cls: 'fieldBox', layout: {align: 'stretch', type: 'vbox'},
                    items: [
                        {xtype: 'label', html: '<h2>Equipment details</h2>'},
                        {xtype: 'combobox', fieldLabel: 'Platform Family', name: 'platform_family',
                            maxWidth: 500, maxLength: 200, enforceMaxLength: true,
                            allowBlank: false,
                            blankText: 'Please type a Platform family or select an existing from the list.',
                            emptyText: 'Select or type a family...',
                            displayField: 'name',
                            store: Ext.create('Ext.data.ArrayStore',
                                    {fields: ['name'], autoLoad: true,
                                        proxy: {
                                            type: 'ajax',
                                            url: 'data/platform_families.json',
                                            reader: {type: 'json', root: 'platform_families', successProperty: 'success'}
                                        }
                                    }),
                            valueField: 'name',
                            listeners: {change: {fn: me.platformComboboxChangeHandler, scope: me}}
                        },
                        {xtype: 'combobox', itemId: 'platform_model_combo', fieldLabel: 'Platform Model', name: 'platform_model',
                            maxWidth: 500, maxLength: 200, enforceMaxLength: true,
                            allowBlank: false,
                            blankText: 'Please type a Platform model or select an existing from the list.',
                            emptyText: 'Select or type a model...',
                            displayField: 'model',
                            store: Ext.create('Ext.data.ArrayStore', {
                                fields: ['family', 'model'],
                                autoLoad: true,
                                proxy: {
                                    type: 'ajax',
                                    url: 'data/platform_families.json',
                                    reader: {type: 'json', root: 'platform_models', successProperty: 'success'}
                                }
                            }),
                            valueField: 'model'
                        },
                        {xtype: 'combobox', fieldLabel: 'Base calls', name: 'base_calls',
                            maxWidth: 350, maxLength: 200, enforceMaxLength: true,
                            allowBlank: false,
                            store: ['Base space', 'Color space']
                        },
                        {xtype: 'numberfield',
                            renderer: Ext.util.Format.numberRenderer('0,000'),
                            maxWidth: 350,
                            fieldLabel: 'Sequencing depth (Million of Spots)',
                            name: 'avg_sequencing_depth',
                            allowBlank: false,
                            hideTrigger: true,
                            allowDecimals: true,
                            minValue: 0,
                            validator: function (value) {
                                return (value <= 0) ? "Sequencing depth must be greater than 0." : true;
                            }
                        },
                        {xtype: 'textfield', fieldLabel: 'Slide ID', name: 'slide_id', maxLength: 200, enforceMaxLength: true},
                        {xtype: 'textfield', fieldLabel: 'Lane number', name: 'lane_number', maxLength: 200, enforceMaxLength: true}
                    ]
                },
                {xtype: 'container', cls: 'fieldBox', layout: {align: 'stretch', type: 'vbox'},
                    items: [
                        {xtype: 'label', html: '<h2>Library details</h2>'},
                        {
                            xtype: 'numberfield',
                            maxWidth: 350,
                            fieldLabel: 'Avg sequence length (bp)',
                            name: 'avg_sequence_length',
                            allowBlank: false,
                            hideTrigger: true,
                            allowDecimals: false,
                            minValue: 0,
                            step: 10,
                            validator: function (value) {
                                return (value <= 0) ? "Avg. Sequence length must be greater than 0." : true;
                            }
                        }, {
                            xtype: 'combobox',
                            maxWidth: 550,
                            fieldLabel: 'Pooling stategy',
                            name: 'pooling_strategy',
                            allowBlank: false,
                            maxLength: 200, enforceMaxLength: true,
                            emptyText: "Select or type a Pooling Strategy",
                            displayField: 'value',
                            store: ['None', 'Multiplexed library', 'Other'],
                            valueField: 'value',
                            listeners: {change: {fn: me.poolingComboboxChangeHandler, scope: me}}
                        }, {
                            xtype: 'textareafield',
                            minHeight: 120,
                            itemId: 'poolingStrategyDescriptionField',
                            emptyText: "Not specified",
                            fieldLabel: 'Pooling strategy description',
                            name: 'pooling_strategy_description'
                        }, {
                            xtype: 'textareafield',
                            name: 'library_construction_protocol',
                            minHeight: 200,
                            fieldLabel: 'Library construction protocol',
                            emptyText: "Not specified",
                        },
                        {xtype: 'combobox', name: 'layout', fieldLabel: 'Layout',
                            valueField: 'value', displayField: 'value',
                            store: ['Single-end', 'Paired-end'],
                            maxWidth: 350, maxLength: 200, enforceMaxLength: true,
                            listeners: {change: {fn: me.layoutComboboxChangeHandler, scope: me}}
                        },
                        {xtype: 'fieldset', itemId: 'paired_end_description_fields',
                            border: false, hidden: true, padding: 0,
                            defaults: {labelWidth: 220, labelAlign: 'right', submitValue: false},
                            layout: {align: 'stretch', type: 'vbox'},
                            items: [
                                {xtype: 'combobox', fieldLabel: 'Orientation', name: 'orientation',
                                    maxWidth: 350, maxLength: 200, enforceMaxLength: true,
                                    store: ['forward-forward', 'forward-reverse']
                                },
                                {xtype: 'numberfield', fieldLabel: 'Nominal length (bp)', name: 'nominal_length',
                                    maxWidth: 350, hideTrigger: true, minValue: 0
                                },
                                {xtype: 'numberfield', fieldLabel: 'Nominal length Std dev (bp)', name: 'nominal_length_stdev',
                                    maxWidth: 350, hideTrigger: true, minValue: 0
                                }
                            ]
                        }
                    ]}
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.ChIPseqView', {
    extend: 'SL.view.AnalysisViews.RAWDataViews.ExtractionMethodView',
    alias: 'widget.ChIPseqView',
    itemId: 'specificDetailsPanel',
    /**BC**********************************************************************************************
     * 
     * Component declaration
     * 
     **EC***********************************************************************************************/
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'SequencingRAWdataView'},
                {xtype: 'container', cls: 'fieldBox',
                    layout: {align: 'stretch', type: 'vbox'},
                    items: [{xtype: 'label', html: '<h2>ChIP-seq library details</h2>'},
                        {xtype: 'checkboxfield', fieldLabel: 'Is Control sample?', name: 'is_control_sample'},
                        {xtype: 'combobox', maxWidth: 500,
                            fieldLabel: 'Antibody manufacturer', name: 'antibody_manufacturer',
                            allowBlank: false,
                            blankText: 'Please type a Platform family or select an existing from the list.',
                            emptyText: 'Select or type a family...',
                            displayField: 'antibody_manufacturer',
                            valueField: 'antibody_manufacturer',
                            maxLength: 200, enforceMaxLength: true,
                            store: Ext.create('Ext.data.ArrayStore',
                                    {
                                        fields: ['antibody_manufacturer'],
                                        autoLoad: true,
                                        proxy: {
                                            type: 'ajax',
                                            url: 'data/chipseq_antibodies.json',
                                            reader: {type: 'json', root: 'antibody_manufacturer', successProperty: 'success'}
                                        }
                                    }),
                        },
                        {xtype: 'combobox', maxWidth: 500,
                            fieldLabel: 'Antibody target type', name: 'antibody_target_type',
                            allowBlank: false,
                            blankText: 'Please type a Platform family or select an existing from the list.',
                            emptyText: 'Select or type a family...',
                            displayField: 'antibody_target_type',
                            valueField: 'antibody_target_type',
                            maxLength: 200, enforceMaxLength: true,
                            store: Ext.create('Ext.data.ArrayStore',
                                    {
                                        fields: ['antibody_target_type'],
                                        autoLoad: true,
                                        proxy: {
                                            type: 'ajax',
                                            url: 'data/chipseq_antibodies.json',
                                            reader: {type: 'json', root: 'antibody_target_type', successProperty: 'success'}
                                        }
                                    }),
                        },
                        {xtype: 'combobox', maxWidth: 500, fieldLabel: 'Antibody target',
                            name: 'antibody_target',
                            allowBlank: false,
                            blankText: 'Please type a Platform family or select an existing from the list.',
                            emptyText: 'Select or type a family...',
                            displayField: 'antibody_target',
                            valueField: 'antibody_target',
                            maxLength: 200, enforceMaxLength: true,
                            store: Ext.create('Ext.data.ArrayStore',
                                    {
                                        fields: ['antibody_target'],
                                        autoLoad: true,
                                        proxy: {
                                            type: 'ajax',
                                            url: 'data/chipseq_antibodies.json',
                                            reader: {type: 'json', root: 'antibody_target', successProperty: 'success'}
                                        }
                                    }),
                        }
                    ]}
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.DNaseseqView', {
    extend: 'SL.view.AnalysisViews.RAWDataViews.ExtractionMethodView',
    alias: 'widget.DNaseseqView',
    itemId: 'specificDetailsPanel',
    /**BC**********************************************************************************************
     * 
     * Component declaration
     * 
     **EC***********************************************************************************************/
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'SequencingRAWdataView'},
                {
                    xtype: 'container', cls: 'fieldBox',
                    layout: {align: 'stretch', type: 'vbox'},
                    items: [
                        {xtype: 'label', html: '<h2>DNase-seq library details</h2>'},
                        {xtype: 'checkboxfield', fieldLabel: 'Is for footprinting?', name: 'is_for_footprinting'},
                        {xtype: 'textfield', fieldLabel: 'Restriction enzyme', name: 'restriction_enzyme', maxLength: 200, enforceMaxLength: true}
                    ]}
            ]
        });
        me.callParent(arguments);
    },
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.MethylseqView', {
    extend: 'SL.view.AnalysisViews.RAWDataViews.ExtractionMethodView',
    alias: 'widget.MethylseqView',
    itemId: 'specificDetailsPanel',
    autoScroll: true,
    /**BC**********************************************************************************************
     * 
     * Component declaration
     * 
     **EC***********************************************************************************************/
    initComponent: function () {
        var me = this;

        Ext.applyIf(me, {
            layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'SequencingRAWdataView'},
                {
                    xtype: 'container', cls: 'fieldBox',
                    layout: {align: 'stretch', type: 'vbox'},
                    items: [{xtype: 'label', html: '<h2>Methyl-seq library details</h2>'},
                        {xtype: 'textfield', fieldLabel: 'Protocol', name: 'protocol', maxLength: 200, enforceMaxLength: true},
                        {xtype: 'combobox', fieldLabel: 'Strand specificity', name: 'strand_specificity', maxWidth: 350, store: ['stranded', 'unstranded'], maxLength: 200, enforceMaxLength: true},
                        {xtype: 'textfield', fieldLabel: 'Selection', name: 'selection', maxLength: 200, enforceMaxLength: true}
                    ]}
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.mRNAseqView', {
    extend: 'SL.view.AnalysisViews.RAWDataViews.ExtractionMethodView',
    alias: 'widget.mRNAseqView',
    itemId: 'specificDetailsPanel',
    autoScroll: true,
    /**BC**********************************************************************************************
     * 
     * Component declaration
     * 
     **EC***********************************************************************************************/
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'SequencingRAWdataView'},
                {
                    xtype: 'container', cls: 'fieldBox',
                    layout: {align: 'stretch', type: 'vbox'},
                    items: [{xtype: 'label', html: '<h2>mRNA-seq library details</h2>'},
//                {xtype: 'textfield', fieldLabel: 'Extracted Molecule', name: 'extracted_molecule',maxLength: 200, enforceMaxLength: true,},
                        {xtype: 'textfield', fieldLabel: 'RNA type', name: 'rna_type', maxLength: 200, enforceMaxLength: true},
                        {
                            xtype: 'combobox',
                            fieldLabel: 'Strand specifity',
                            name: 'strand_specificity',
                            maxWidth: 350, maxLength: 200, enforceMaxLength: true,
                            allowBlank: false,
                            emptyText: 'Please select a value',
                            store: ['stranded', 'unstranded']
                        },
                        {xtype: 'textfield', fieldLabel: 'Selection', name: 'selection', maxLength: 200, enforceMaxLength: true}
                    ]}]
        });

        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.smallRNAseqView', {
    extend: 'SL.view.AnalysisViews.RAWDataViews.ExtractionMethodView',
    alias: 'widget.smallRNAseqView',
    itemId: 'specificDetailsPanel',
    autoScroll: true,
    /**BC**********************************************************************************************
     * 
     * Component declaration
     * 
     **EC***********************************************************************************************/
    initComponent: function () {
        var me = this;

        Ext.applyIf(me, {
            layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'SequencingRAWdataView'},
                {
                    xtype: 'container', cls: 'fieldBox',
                    layout: {align: 'stretch', type: 'vbox'},
                    items: [{xtype: 'label', html: '<h2>small RNA-seq library details</h2>'},
                        {xtype: 'textfield', fieldLabel: 'RNA type', name: 'rna_type', maxLength: 200, enforceMaxLength: true},
                        {xtype: 'combobox', name: 'strand_specificity',
                            maxLength: 200, enforceMaxLength: true, fieldLabel: 'Strand specifity', maxWidth: 350,
                            allowBlank: false,
                            emptyText: 'Please select a value',
                            store: ['stranded', 'unstranded']
                        },
                        {xtype: 'textfield', fieldLabel: 'Selection', name: 'selection', maxLength: 200, enforceMaxLength: true}
                    ]}]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.MassSpectrometryView', {
    extend: 'SL.view.AnalysisViews.RAWDataViews.ExtractionMethodView',
    alias: 'widget.MassSpectrometryView',
    itemId: 'specificDetailsPanel',
    separationMethod: "None",
    autoScroll: true,
    loadModel: function (model) {
        this.model = model;
        if (model.getSeparationMethod() != null) {
            //1.SHows the specific details formulary
            var type = model.get('separation_method_type');
            var newPanel = Ext.create('SL.view.AnalysisViews.RAWDataViews.' + type + "View");
            if (newPanel != null) {
                var parent = this.queryById('separationMethodPanel');
                parent.down('combobox[name= separation_method_type]').setValue(type);
                parent.remove(parent.queryById('separationMethodView'));
                parent.add(newPanel);
            }
            newPanel.loadModel(model.getSeparationMethod());
        }

        var fields = this.queryById('massSpectrometryDetails').query('field');
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
    /********************************************************************************      
     * This function changes the Editable mode setting of all formulary fields and all 
     * the inner panels.
     *  
     * @param  mode, a boolean value where true means "Editable mode ON"
     * @return      
     ********************************************************************************/
    setEditableMode: function (mode) {
        if (this.queryById('separationMethodView') != null) {
            this.queryById('separationMethodView').setEditableMode(mode);
        }
        var items = this.query("checkbox[boxLabel='Show']");
        for (var i in items) {
            items[i].setReadOnly(false);
        }
    },
    /**BC**********************************************************************************************
     * 
     * Some event declaration
     * 
     **EC***********************************************************************************************/
    separationMethodTypeComboboxChangeHandler: function (item, newValue) {
        var oldType = item.up('MassSpectrometryView').getModel().get('separation_method_type');
        if (newValue === oldType || newValue === "") {
            return;
        } else if (newValue === "None") {
            var askToContinue = function (buttonId, text, opt) {
                if (buttonId === "yes") {
                    var parent = item.up('MassSpectrometryView').queryById('separationMethodPanel');
                    parent.remove(parent.queryById('separationMethodView'));
                    item.up('MassSpectrometryView').getModel().set('separation_method_type', "None");
                    item.reset();
                }
            };
            Ext.MessageBox.show({
                title: 'Remove the current associated Separation method?',
                msg: 'This will remove the associated Separation method. <br/>Would you like to continue?',
                buttons: Ext.MessageBox.YESNO,
                fn: askToContinue,
                icon: Ext.MessageBox.QUESTION
            });
        } else {
            var parent = item.up('MassSpectrometryView').queryById('separationMethodPanel');
            parent.remove(parent.queryById('separationMethodView'));
            var newPanel = Ext.create('SL.view.AnalysisViews.RAWDataViews.' + newValue + "View");

            var new_model = Ext.create('SL.model.AnalysisModels.RAWDataModels.' + newValue);
            item.up('MassSpectrometryView').getModel().set('separation_method_type', newValue);
            new_model.set('rawdata_id', item.up('MassSpectrometryView').getModel().get('rawdata_id'));
            newPanel.loadModel(new_model);

            parent.add(newPanel);
        }
    },
    ionization_sourceComboboxChangeHandler: function (field, newValue) {
        var massSpectrometryView = field.up('MassSpectrometryView');
        massSpectrometryView.queryById("esi_description_fields").setVisible(newValue === "Electrospray Ionisation (ESI)");
        massSpectrometryView.queryById("esi_description_fields").setDisabled(newValue !== "Electrospray Ionisation (ESI)");
        massSpectrometryView.queryById("maldi_description_fields").setVisible(newValue === "MALDI");
        massSpectrometryView.queryById("maldi_description_fields").setDisabled(newValue !== "MALDI");
        massSpectrometryView.queryById("other_ionization_description_fields").setVisible(newValue === "Other ion source");
        massSpectrometryView.queryById("other_ionization_description_fields").setDisabled(newValue !== "Other ion source");
    },
    /**BC**********************************************************************************************
     * 
     * Component declaration
     * 
     **EC***********************************************************************************************/
    initComponent: function () {
        var me = this;

        Ext.applyIf(me, {
            defaults: {layout: {type: 'vbox', align: 'stretch'}},
            layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'container', itemId: 'separationMethodPanel',
                    items: [
                        {xtype: 'combobox', itemId: 'separation_method_type', name: 'separation_method_type', fieldLabel: 'Separation method type',
                            maxWidth: 500, editable: false, cls: 'combobox',
                            emptyText: 'None', queryMode: 'local', displayField: 'name', valueField: 'value', value: "None",
                            store: [["None", "None"], ["GasChromatography", 'Gas Chromatography'], ["LiquidChromatography", 'Liquid Chromatography'], ["CapillaryElectrophoresis", 'Capillary Electrophoresis']],
                            listeners: {change: {fn: me.separationMethodTypeComboboxChangeHandler, scope: me}}
                        },
                    ]
                },
                {xtype: 'container', layout: 'hbox', margin: '0 0 20 0', items: [
                        {xtype: 'label', html: '<h1 class="form_subtitle">Mass spectrometry details</h1>'},
                        {xtype: 'checkbox', boxLabel: 'Show', checked: true, margin: '12 0 0 10',
                            handler: function (checkbox, checked) {
                                var component = checkbox.up().nextSibling('container');
                                if (checked) {
                                    var parent = checkbox.up();
                                    parent.setLoading(true);
                                    var task = new Ext.util.DelayedTask(function () {
                                        component.setVisible(checked);
                                        component.getEl().fadeIn();
                                        parent.setLoading(false);
                                    });
                                    task.delay(100);
                                } else {
                                    component.getEl().fadeOut({callback: function () {
                                            component.setVisible(checked);
                                        }});
                                }
                            }
                        }
                    ]},
                {xtype: 'container', itemId: 'massSpectrometryDetails',
                    defaults: {layout: {type: 'vbox', align: 'stretch'}},
                    items: [
                        {xtype: 'container', cls: 'fieldBox',
                            items: [
                                {xtype: 'label', html: '<h2>Equipment details</h2>'},
                                {xtype: 'combobox', fieldLabel: 'Mass spectrometer manufacturer', name: 'mass_spectrometer_manufacturer',
                                    maxLength: 200, enforceMaxLength: true, hideTrigger: true,
                                    blankText: 'Please type a Mass spectrometer manufacturer or select an existing from the list.',
                                    emptyText: 'Select or type a Mass spectrometer manufacturer...',
                                    displayField: 'name', valueField: 'name', queryMode: 'local',
                                    store: Ext.create('Ext.data.ArrayStore',
                                            {fields: ['name'], autoLoad: true,
                                                proxy: {
                                                    type: 'ajax', url: 'data/mass_spectrometer_manufacturer.json',
                                                    reader: {type: 'json', root: 'mass_spectrometer_manufacturer', successProperty: 'success'}
                                                }
                                            })
                                },
                                {xtype: 'textarea', fieldLabel: 'Customizations (summary)', name: 'customizations', maxHeight: 100},
                                {xtype: 'combobox', fieldLabel: 'Ionization source', name: 'ionization_source', itemId: 'ionization_source',
                                    maxWidth: 500, maxLength: 200, enforceMaxLength: true,
                                    queryMode: 'local', store: ['Electrospray Ionisation (ESI)', 'MALDI', 'Other ion source'],
                                    listeners: {change: {fn: me.ionization_sourceComboboxChangeHandler, scope: me}}
                                },
                                {xtype: 'container', itemId: 'esi_description_fields',
                                    hidden: true, padding: 0,
                                    layout: {type: 'vbox', align: 'stretch'},
                                    items: [
                                        {xtype: 'label', html: '<h3>Electrospray Ionisation (ESI) details</h3>'},
                                        {xtype: 'textfield', name: 'supply_type', fieldLabel: 'Supply type', maxLength: 200, enforceMaxLength: true},
                                        {xtype: 'textfield', name: 'interface_manufacturer_and_model', fieldLabel: 'Interface details', maxLength: 200, enforceMaxLength: true},
                                        {xtype: 'textfield', name: 'sprayer_type_manufacturer_and_model', fieldLabel: 'Spayer details', maxLength: 200, enforceMaxLength: true},
                                        {xtype: 'textarea', name: 'other_electrospray_ionisation', fieldLabel: 'Other'}
                                    ]
                                },
                                {xtype: 'container', itemId: 'maldi_description_fields',
                                    hidden: true, padding: 0,
                                    layout: {type: 'vbox', align: 'stretch'},
                                    items: [
                                        {xtype: 'label', html: '<h3>MALDI details</h3>'},
                                        {xtype: 'textfield', name: 'plate_composition', fieldLabel: 'Plate composition', maxLength: 200, enforceMaxLength: true},
                                        {xtype: 'textfield', name: 'matrix_composition', fieldLabel: 'Matrix composition', maxLength: 200, enforceMaxLength: true},
                                        {xtype: 'textarea', name: 'psd_summary', fieldLabel: 'PSD summary'},
                                        {xtype: 'textfield', name: 'laser_type_and_wavelength', fieldLabel: 'Laser details', maxLength: 200, enforceMaxLength: true},
                                        {xtype: 'textarea', name: 'other_maldi', fieldLabel: 'Other'}
                                    ]
                                },
                                {xtype: 'container', itemId: 'other_ionization_description_fields',
                                    hidden: true, padding: 0,
                                    layout: {type: 'vbox', align: 'stretch'},
                                    items: [{xtype: 'textarea', name: 'other_ionization_description', fieldLabel: 'Description'}]
                                },
                            ]},
                        {xtype: 'container', cls: 'fieldBox',
                            items: [
                                {xtype: 'label', html: '<h2>Post source component details</h2>'},
                                {xtype: 'textarea', name: 'mass_analyzer_type', fieldLabel: 'Analyzer description', minHeight: 100},
                                {xtype: 'combobox', maxWidth: 350, fieldLabel: 'Time-of-Flight drift tube: Reflectron status', name: 'reflectron_status', store: ['on', 'off', 'none'], maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'activation_location', fieldLabel: 'Instrument component where the activation / dissociation occurs', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'gas_type', fieldLabel: 'Gas type', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'activation_type', fieldLabel: 'Activation / dissociation type', maxLength: 200, enforceMaxLength: true},
                            ]},
                        {xtype: 'container', cls: 'fieldBox',
                            items: [{xtype: 'label', html: '<h2>Spectrum and peak list generation and annotation (data acquisition)</h2>'},
                                {xtype: 'textfield', name: 'acquisition_software', fieldLabel: 'Software and version', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textarea', name: 'acquisition_parameters', fieldLabel: 'Acquisition parameters', minHeight: 100},
                            ]},
                        {xtype: 'container', cls: 'fieldBox',
                            items: [{xtype: 'label', html: '<h2>Spectrum and peak list generation and annotation (data analysis)</h2>'},
                                {xtype: 'textfield', name: 'analysis_software', fieldLabel: 'Software and version', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textarea', name: 'analysis_parameters', fieldLabel: 'Parameters used in the generation of peak lists or processed spectra', minHeight: 100},
                            ]},
                        {xtype: 'container', cls: 'fieldBox',
                            items: [{xtype: 'label', html: '<h2>Spectrum and peak list generation and annotation (resulting data)</h2>'},
                                {xtype: 'displayfield', name: "source_location", fieldLabel: 'Location of source (‘raw’) and processed files', value: "<i style='color:gray'>See above (File location field)</i>"},
                                {xtype: 'textfield', name: 'intensity_values', fieldLabel: 'm/z and intensity values', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'ms_level', fieldLabel: 'MS level', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'combobox', maxWidth: 350, fieldLabel: 'Ion mode', name: 'ion_mode', store: ['positive', 'negative', 'none'], maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textarea', name: 'additional_info', fieldLabel: 'Additional information for MS level 2', minHeight: 100}
                            ]}
                    ]
                }
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.RAWDataViews.NuclearMagneticResonanceView', {
    extend: 'SL.view.AnalysisViews.RAWDataViews.ExtractionMethodView',
    alias: 'widget.NuclearMagneticResonanceView',
    itemId: 'specificDetailsPanel',
    autoScroll: true,
    loadModel: function (model) {
        this.model = model;
        if (model.getSeparationMethod() != null) {
            //1.SHows the specific details formulary
            var type = model.get('separation_method_type');
            var newPanel = Ext.create('SL.view.AnalysisViews.RAWDataViews.' + type + "View");
            if (newPanel != null) {
                var parent = this.queryById('separationMethodPanel');
                parent.down('combobox[name= separation_method_type]').setValue(type);
                parent.remove(parent.queryById('separationMethodView'));
                parent.add(newPanel);
            }
            newPanel.loadModel(model.getSeparationMethod());
        }

        var fields = this.queryById('nuclearMagneticResonanceDetails').query('field');
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
    /**BC**********************************************************************************************
     * 
     * Some event declaration
     * 
     **EC***********************************************************************************************/
    platformComboboxChangeHandler: function (field, newValue, oldValue, eOpts) {
        field.nextSibling().getStore().clearFilter(true);
        field.nextSibling().getStore().filter("family", newValue);
    },
    separationMethodTypeComboboxChangeHandler: function (item, newValue, oldValue, eOpts) {
        var oldType = item.up('NuclearMagneticResonanceView').getModel().get('separation_method_type');
        if (newValue === oldType || newValue === "") {
            return;
        } else if (newValue === "None") {
            var askToContinue = function (buttonId, text, opt) {
                if (buttonId === "yes") {
                    var parent = item.up('NuclearMagneticResonanceView').queryById('separationMethodPanel');
                    parent.remove(parent.queryById('separationMethodView'));
                    item.up('NuclearMagneticResonanceView').getModel().set('separation_method_type', "None");
                    item.reset();
                }
            };
            Ext.MessageBox.show({
                title: 'Remove the current associated Separation method?',
                msg: 'This will remove the associated Separation method. <br/>Would you like to continue?',
                buttons: Ext.MessageBox.YESNO,
                fn: askToContinue,
                icon: Ext.MessageBox.QUESTION
            });
        } else {
            var parent = item.up('NuclearMagneticResonanceView').queryById('separationMethodPanel');
            parent.remove(parent.queryById('separationMethodView'));
            var newPanel = Ext.create('SL.view.AnalysisViews.RAWDataViews.' + newValue + "View");

            var new_model = Ext.create('SL.model.AnalysisModels.RAWDataModels.' + newValue);
            item.up('NuclearMagneticResonanceView').getModel().set('separation_method_type', newValue);
            new_model.set('rawdata_id', item.up('NuclearMagneticResonanceView').getModel().get('rawdata_id'));
            newPanel.loadModel(new_model);

            parent.add(newPanel);
        }
    },
    /**BC**********************************************************************************************
     * 
     * Component declaration
     * 
     **EC***********************************************************************************************/
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            defaults: {layout: {type: 'vbox', align: 'stretch'}},
            layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'container', itemId: 'separationMethodPanel',
                    items: [
                        {xtype: 'combobox', itemId: 'separation_metohd_type', name: 'separation_method_type', fieldLabel: 'Separation method type',
                            maxWidth: 500,
                            editable: false,
                            emptyText: 'None', displayField: 'name', valueField: 'value', value: "None",
                            queryMode: 'local',
                            store: [["None", "None"], ["ColumnChromatography", 'Column Chromatography']],
                            listeners: {change: {fn: me.separationMethodTypeComboboxChangeHandler, scope: me}}
                        },
                    ]
                },
                {xtype: 'container', itemId: 'nuclearMagneticResonanceDetails', defaults: {layout: {type: 'vbox', align: 'stretch'}},
                    items: [
                        {xtype: 'label', html: '<h1 class="form_subtitle">Nuclear Magnetic Resonance details</h1>'},
                        {xtype: 'container', cls: 'fieldBox', items: [
                                {xtype: 'label', html: '<h2>Instrument details</h2>'},
                                {xtype: 'combobox', fieldLabel: 'Instrument manufacturer', name: 'instrument_manufacturer',
                                    maxWidth: 500, maxLength: 200, enforceMaxLength: true,
                                    blankText: 'Please type a manufacturer or select an existing from the list.',
                                    emptyText: 'Select or type a manufacturer...',
                                    displayField: 'name', valueField: 'name', queryMode: 'local',
                                    store: Ext.create('Ext.data.ArrayStore',
                                            {fields: ['name'], autoLoad: true,
                                                proxy: {
                                                    type: 'ajax',
                                                    url: 'data/nmr_manufacturer.json',
                                                    reader: {type: 'json', root: 'nmr_manufacturer', successProperty: 'success'}
                                                }
                                            }),
                                    listeners: {change: {fn: me.platformComboboxChangeHandler, scope: me}}
                                },
                                {xtype: 'combobox', fieldLabel: 'Instrument model', name: 'instrument_model',
                                    maxWidth: 500, maxLength: 200, enforceMaxLength: true,
                                    blankText: 'Please type a model or select an existing from the list.',
                                    emptyText: 'Select or type a model...',
                                    displayField: 'model', valueField: 'model', queryMode: 'local',
                                    store: Ext.create('Ext.data.ArrayStore',
                                            {fields: ['family', 'model'], autoLoad: true,
                                                proxy: {
                                                    type: 'ajax',
                                                    url: 'data/nmr_manufacturer.json',
                                                    reader: {type: 'json', root: 'nmr_models', successProperty: 'success'}
                                                }
                                            })
                                },
                                {xtype: 'textfield', name: 'strength', fieldLabel: 'Magnetic field strength / proton resonance freq.', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textarea', name: 'console_description', fieldLabel: 'Console description', height: 100}
                            ]},
                        {xtype: 'container', cls: 'fieldBox', items: [
                                {xtype: 'label', html: '<h2>Instrument configuration</h2>'},
                                {xtype: 'textfield', name: 'vt_control', fieldLabel: 'VT Control', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'pulsed_field_strength', fieldLabel: 'Pulsed field gradients', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'max_gradient_strength', fieldLabel: 'Maximum gradient strength', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'numberfield', name: 'n_shims', fieldLabel: 'Number of shims', maxWidth: 350},
                                {xtype: 'numberfield', name: 'n_channels', fieldLabel: 'Number of channels', maxWidth: 350},
                                {xtype: 'textfield', name: 'probe_type', fieldLabel: 'Probe type', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'sample_state', fieldLabel: 'Sample state', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'operation_mode', fieldLabel: 'Operation mode', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'tune_mode', fieldLabel: 'Tune mode', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'probe_gas', fieldLabel: 'Probe gas', maxLength: 200, enforceMaxLength: true}
                            ]},
                        {xtype: 'container', cls: 'fieldBox', items: [
                                {xtype: 'label', html: '<h2>Instrument-specific sample preparation</h2>'},
                                {xtype: 'textfield', name: 'volume', fieldLabel: 'Volume', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'final_sample_status', fieldLabel: 'Final sample status', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'nmr_tube_type', fieldLabel: 'NMR tube type', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'pH', fieldLabel: 'pH', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'solvent', fieldLabel: 'Solvent', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'buffer', fieldLabel: 'Buffer', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', name: 'resonant_frequency', fieldLabel: 'Resonant frequency', maxLength: 200, enforceMaxLength: true}
                            ]},
                        {xtype: 'container', cls: 'fieldBox', items: [
                                {xtype: 'label', html: '<h2>Data acquisiton</h2>'},
                                {xtype: 'textarea', name: 'acquisition_description', fieldLabel: 'Acquisition description', height: 250}
                            ]}
                    ]
                }
            ]
        })
        me.callParent(arguments);
    }
});