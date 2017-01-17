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
 *   - IntermediateDataView 
 *   - SpecificDetailsPanel (IntermediateDataView)
 *   - ExtractRelevantFeaturesView 
 *   - MappingStepView 
 *   - MaxQuantStepView 
 *   - PreprocessingStepView 
 *   - SmoothingStepView 
 *   - UnionStepView 
 *   -
 */
Ext.define('SL.view.AnalysisViews.IntermediateDataViews.IntermediateDataView', {
    extend: 'Ext.form.Panel',
    alias: 'widget.IntermediateDataView',
    mixins: {
        //Extends the Observer class
        View: 'SL.view.senchaExtensions.View',
        //Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer',
        //Extends the Command class
        Command: 'SL.view.senchaExtensions.Command'
    },
    requires: [
        'SL.view.AnalysisViews.SoftwareConfigurationField',
        'SL.view.AnalysisViews.QualityReportField',
        'SL.view.UserViews.UserView',
        'SL.view.AnalysisViews.FileLocationSelectorField',
    ],
    /**BC******************************************************************************      
     * 
     * SOME ATTRIBUTES
     * 
     **EC******************************************************************************/
    inCreationMode: false,
    inEditionMode: false,
    inWizardMode: false,
    helpFileURL: "data/help/intermediatedataview_help.json",
    /********************************************************************************            
     * This function load a given Intermediate step MODEL into the current VIEW 
     *  
     * @param  model, the intermediate step model
     * @return      
     ********************************************************************************/
    loadModel: function (model) {
        this.setLoading(true);

        //Hide the panel temporaly to avoid problems with layout
        this.model = model;

        //1. Create the new view for the specific details
        var intermediateDataType = model.getIntermediateDataType();
        var specificDetailsPanelType = "SL.view.AnalysisViews.IntermediateDataViews.";

        if (intermediateDataType === "extract_relevant_features_step")
            specificDetailsPanelType += "ExtractRelevantFeaturesView";
        else if (intermediateDataType === "mapping_step")
            specificDetailsPanelType += "MappingStepView";
        else if (intermediateDataType === "preprocessing_step")
            specificDetailsPanelType += "PreprocessingStepView";
        else if (intermediateDataType === "smoothing_step")
            specificDetailsPanelType += "SmoothingStepView";
        else if (intermediateDataType === "union_step")
            specificDetailsPanelType += "UnionStepView";
        else
            specificDetailsPanelType = "";

        var me = this;
        Ext.require([specificDetailsPanelType], function () {
            if (specificDetailsPanelType !== "") {
                //1.CREATE THE NEW PANEL
                var newPanel = Ext.create(specificDetailsPanelType);
                //2. CLEAR AND HIDE THE PREVIOUS SPECIFIC INTERMEDIATE DATA PANEL (IF EXISTS)
                var previousPanel = me.queryById("specificDetailsPanel");
                if (previousPanel != null) {
                    me.remove(previousPanel)
                }

                //2.b Add the views for all the previous steps
                var analysisModel = me.parent.getModel();
                var previousSteps = model.getPreviousSteps();
                var previousStepsFields = newPanel.down('AnalysisStepSelectorField');

                for (var i = 0; i < previousSteps.length; i++) {
                    previousStepsFields.addModel(analysisModel.getStepByID(previousSteps[i]));
                }
                previousStepsFields.update();

                //Add the new panel before the qualityReport component
                var newItemPosition = me.items.length - 2;
                me.insert(newItemPosition, newPanel);
            }

            //2. Load all RAWDATA fields in the formulary
            me.loadRecord(model);

            //3.Load owners info
            var owners = model.getOwners();
            var stepOwnersField = me.queryById("step_owners");
            stepOwnersField.clear();
            for (var i in owners) {
                stepOwnersField.addUser(owners[i].getID());
            }

            //4.Load the file location info
            var fileLocation = model.getFileLocation();
            fileLocation = fileLocation.split("\\$\\$");
            var step_fileLocation = me.queryById("fileLocationField");
            var fileLocationElement, fileLocationsModels = [];
            for (var i in fileLocation) {
                if (fileLocation[i] === "") {
                    continue;
                }
                fileLocationElement = new Object();
                fileLocationElement.file_location = fileLocation[i];
                fileLocationsModels.push(fileLocationElement);
            }
            step_fileLocation.loadModels(fileLocationsModels);

            //5. Check if the step is an imported step (comparing the id with the expected id for this analysis)
            //GETS THE ANALYSIS MODEL
            var analysisModel = me.parent.getModel();
            var currentAnalysisID = analysisModel.getID();
            var expectedAnalysisOwnerID = "AN" + model.getID().slice(2).split(".")[0];
            if (currentAnalysisID !== expectedAnalysisOwnerID) {
                me.queryById('warningTip').update("<p>Step imported from analysis " + expectedAnalysisOwnerID);
                me.queryById('warningTip').setVisible(true);
            }

            me.queryById('software_configuration_static').setValue(model.get('software_configuration'));
            //6. Load the quality report
            var qualityReportField = me.queryById('qualityReportField');
            if (model.getAssociatedQualityReport() != null) {
                var qualityReport = model.getAssociatedQualityReport();
                qualityReportField.loadModel(qualityReport);
                qualityReport.addObserver(qualityReportField);
            } else {
                qualityReportField.cleanAndHide();
            }

            me.setLoading(false);
        });

    },
    /**BC******************************************************************************      
     * This function return the associated model to the current VIEW 
     * @return  the RAWDATA model
     **EC******************************************************************************/
    getModel: function () {
        return this.model;
    },
    updateObserver: function () {
        this.loadModel(this.getModel());
        this.setEditableMode(this.inEditionMode || this.inCreationMode);
    },
    /**BC***************************************************************************      
     * GETTERS AND SETTERS
     **EC*****************************************************************************/
    getID: function () {
        return this.queryById('idField').getValue();
    },
    getName: function () {
        return this.queryById('stepNameField').getValue();
    },
    getIntermediateDataType: function () {
        return this.queryById("intermediate_data_type_chooser").getValue();
    },
    getFileLocation: function () {
        return this.queryById('fileLocationField').getValue();
    },
    getSubmissionDate: function () {
        return this.queryById("submission_date").getValue();
    },
    getLastEditionDate: function () {
        return this.queryById("last_edition_date").getValue();
    },
    setLastEditionDate: function () {
        this.queryById("last_edition_date").setValue(new Date());
    },
    getOwners: function () {
        return this.queryById("step_owners").getAllInsertedUsers();
    },
    getSoftware: function () {
        return this.queryById('softwareField').getValue();
    },
    getSoftwareVersion: function () {
        return this.queryById('softwareVersionField').getValue();
    },
    getSoftwareConfiguration: function () {
        return this.queryById('software_configuration_static').getValue();
    },
    getMotivation: function () {
        return this.queryById('motivationField').getValue();
    },
    getResults: function () {
        return this.queryById('resultsField').getValue();
    },
    getPreviousSteps: function () {
        if (this.down('AnalysisStepSelectorField') != null) {
            return this.down('AnalysisStepSelectorField').getModels();
        }
        return null;
    },
    getAssociatedQualityReportField: function () {
        return this.down('QualityReportField');
    },
    isInEditionMode: function () {
        return this.inEditionMode;
    },
    isInWizardMode: function () {
        return this.inWizardMode;
    },
    /**BC******************************************************************************      
     * Due to the this view can be used to Inspect/Edit/Create RAW Data, we need 
     * this function to custom the panel depending on the situation (set the buttons's 
     * visibility, the editable_mode of the formulary’s fields...
     *  
     * @param  mode an option in ["edition", "creation", "inspect"]
     * @return      
     **EC******************************************************************************/
    setViewMode: function (mode, otherParams) {
        this.setLoading(true);
        this.inWizardMode = (otherParams == null || otherParams.inWizardMode == null) ? false : otherParams.inWizardMode;

        var editable_mode = false;
        switch (mode) {
            //EDITION
            case "edition":
                //The first task we should do is to liberate the blocked object
                //in case of error during insertion, we should close the panel and the object 
                //must be liberated (if not, an exception may caused that the object wasn't liberated)
                editable_mode = true;
                this.inEditionMode = true;
                break;
                //CREATION    
            case "creation":
                editable_mode = true;
                this.inCreationMode = true;
                break;
                //INSPECT    
            case "inspect":
                editable_mode = false;
                break;
            default:
                break;
        }

        this.setEditableMode(editable_mode);
        this.queryById("last_edition_date").setReadOnly(true);
        this.queryById("submission_date").setReadOnly(mode !== "creation");
        this.queryById('software_configuration_static').setViewMode(mode);
        this.queryById('qualityReportField').setViewMode(mode);
        this.queryById('intermediate_data_type_chooser').setReadOnly(mode !== "creation");

        //CHECK IF WE ARE IN WIZARD MODE, i.e. FIELD SUCH AS STEP NAME AND FILE LOCATION WILL BE SPECIFIED LATER
        if (this.isInWizardMode()) {
            this.queryById("fileLocationField").setEnabled(false);
            this.queryById("stepNameField").setDisabled(true);
        }
        this.setLoading(false);
    },
    /********************************************************************************      
     * This function changes the Editable mode setting of all formulary fields and all 
     * the inner panels.
     *  
     * @param  mode, a boolean value where true means "Editable mode ON"
     * @return      
     ********************************************************************************/
    setEditableMode: function (mode) {
        Ext.suspendLayouts();
        var elements = this.query("field");
        for (var i in elements) {
            elements[i].setReadOnly(!mode);
        }
        this.queryById("step_owners").setEditable(mode);

        var fields = this.query('checkbox[cls=showHideCheckbox]');
        for (var i in fields) {
            fields[i].setReadOnly(false);
        }

        this.queryById("fileLocationField").setEditable(mode);

        var previousStepsFields = this.down('AnalysisStepSelectorField');
        if (previousStepsFields != null) {
            previousStepsFields.setEditable(mode);
        }
        Ext.resumeLayouts(true);
    },
    validateContent: function () {
        //TODO: MEJORAR
        //Check if the information in the form is valid
        var valid = true;
        valid &= this.getForm().isValid();
        valid &= this.queryById("fileLocationField").isValid();
        // make sure the form contains valid data before submitting
//        valid &= this.getPreviousSteps().isEmpty();
        return valid;
    },
    setLoading: function (loading) {
        this.parent.setLoading(loading);
        if (loading === true) {
            Ext.suspendLayouts();
        } else {
            Ext.resumeLayouts(true);
        }
    },
    setHidden: function (hidden) {
        var component = this;
        if (hidden) {
            this.getEl().fadeOut({callback: function () {
                    component.setVisible(false);
                }});
        } else {
            var task = new Ext.util.DelayedTask(function () {
                component.setVisible(true);
                if (component.getEl() != null)
                    component.getEl().fadeIn();
            });
            task.delay(500);
        }
    },
    /**BC*********************************************************************************
     * 
     * SOME EVENTS
     * 
     **EC*********************************************************************************/
    intermediate_data_typeComboboxChange: function (field, newIntermediateDataType, oldValue, eOpts) {
        var intermediateDataView = field.up('IntermediateDataView');
        var intermediateDataModel = intermediateDataView.getModel();

        //If the RAW DATA STEP type has changed, cretes a new model
        if (intermediateDataModel.getIntermediateDataType() !== newIntermediateDataType && field.getStore().findExact("value", newIntermediateDataType) !== -1) {
            this.getController().intermediateDataTypeComboboxChangeHandler(intermediateDataView, newIntermediateDataType);
        }
    },
    /**BC****************************************************************************************
     * 
     * COMPONENT DEFINITION    
     * 
     **EC****************************************************************************************/
    initComponent: function () {
        var me = this;
        me.border = 0;

        this.setController(application.getController("IntermediateDataController"));

        Ext.applyIf(me, {
            border: false, layout: {type: "vbox", align: "stretch"},
            cls: 'intermediateDataView', bodyPadding: '20 10 20 10',
            fieldDefaults: {labelAlign: 'right', labelWidth: 220, msgTarget: 'side', emptyText: "Not specified"},
            items: [
                {xtype: 'label', itemId: "mainTitle", html: '<p class="form_title">Step information</p>'},
                {xtype: 'label', html: '<h1 class="form_subtitle">Intermediate step</h1>'},
                {xtype: 'container', cls: 'fieldBox', layout: {type: 'vbox', align: 'stretch'},
                    items: [
                        {xtype: 'label', html: '<h2>General details</h2>'},
                        {xtype: 'fieldcontainer', fieldLabel: "Step ID", name: 'step_id', layout: {type: 'hbox', align: 'stretchmax'},
                            items: [
                                {xtype: 'displayfield', name: 'step_id', itemId: 'idField',
                                    renderer: function (value) {
                                        if (value.indexOf("STxxxx") !== -1) {
                                            return '<span style="color:gray;">[Autogenerated after saving]</span>';
                                        } else
                                            return value;
                                    }
                                },
                                {xtype: 'box', hidden: true, itemId: 'warningTip', cls: "warningTip", html: '<p>Step imported</p>', margin: '0 0 0 10'}
                            ]
                        },
                        {xtype: 'textfield', fieldLabel: 'Step Name', name: 'step_name', itemId: 'stepNameField', maxLength: 90, allowBlank: false, enforceMaxLength: true},
                        {xtype: 'combobox', fieldLabel: 'Intermediate step type', name: 'intermediate_data_type', itemId: 'intermediate_data_type_chooser',
                            maxWidth: 600, allowBlank: false, forceSelection: true, displayField: 'label', valueField: 'value', cls: 'combobox',
                            store: Ext.create('Ext.data.ArrayStore',
                                    {fields: ['label', 'value'],
                                        data: [
                                            ['Relevant features extraction', 'extract_relevant_features_step'],
                                            ['Mapping', 'mapping_step'],
                                            ['Data Preprocessing', 'preprocessing_step'],
                                            ['Data unification', 'union_step'],
                                            ['Data smoothing', 'smoothing_step']
                                        ]
                                    }),
                            listeners: {change: {fn: me.intermediate_data_typeComboboxChange, scope: me}}
                        },
                        {xtype: 'container', itemId: 'intermediate_data_form', layout: {align: 'stretch', type: 'vbox'},
                            items: [
                                {xtype: "FileLocationSelectorField", name: 'files_location', itemId: 'fileLocationField', allowBlank: true},
                                {xtype: 'datefield', itemId: 'submission_date', fieldLabel: 'Submission date', name: 'submission_date', maxWidth: 350, allowBlank: false, format: 'Y/m/d'},
                                {xtype: 'datefield', itemId: 'last_edition_date', fieldLabel: 'Last edition date', name: 'last_edition_date', maxWidth: 350, allowBlank: false, format: 'Y/m/d'},
                                {xtype: 'UserListTextField', name: 'step_owners', itemId: 'step_owners', fieldLabel: 'Owners',
                                    store: Ext.create('Ext.data.ArrayStore', {fields: ['value'], data: []}),
                                    valueField: 'value', displayField: 'value', allowBlank: false, minHeight: 30, margin: '0 0 10 0'
                                }
                            ]},
                        {xtype: 'numberfield', fieldLabel: 'Step number', name: 'step_number',
                            flex: 1, hidden: true, maxWidth: 350, readOnly: true
                        }
                    ]
                },
                {xtype: 'container', cls: 'fieldBox', layout: {type: 'vbox', align: 'stretch'},
                    items: [
                        {xtype: 'label', html: '<h2>Software details</h2>'},
                        {xtype: 'combobox', fieldLabel: 'Software', name: 'software', itemId: 'softwareField',
                            maxWidth: 550, maxLength: 200, enforceMaxLength: true,
                            allowBlank: false, hideTrigger: true, queryMode: 'local',
                            blankText: 'Please type the used software.',
                            emptyText: 'Select or type a software',
                            displayField: 'name', valueField: 'name',
                            store: Ext.create('Ext.data.ArrayStore', {fields: ['name'], autoLoad: true, proxy: {type: 'ajax', url: 'data/software.json', reader: {type: 'json', root: 'software', successProperty: 'success'}}})
                        },
                        {xtype: 'textfield', fieldLabel: 'Software version', name: 'software_version', itemId: 'softwareVersionField', maxWidth: 550, maxLength: 200, enforceMaxLength: true},
                        {xtype: 'SoftwareConfigurationField', itemId: 'software_configuration_static'},
                        {xtype: 'textareafield', flex: 1, minHeight: 150, fieldLabel: 'Motivation', name: 'motivation', itemId: 'motivationField'},
                        {xtype: 'textareafield', flex: 1, minHeight: 150, fieldLabel: 'Observations/Results', name: 'results', allowBlank: false, itemId: 'resultsField'}
                    ]
                },
                {xtype: 'container', layout: 'hbox', items: [
                        {xtype: 'label', html: '<h1  class="form_subtitle">Quality report</h1>'},
                        {xtype: 'checkbox', boxLabel: 'Show', checked: true, cls: "showHideCheckbox", margin: '12 0 0 10', itemId: 'showQualityReportCheck',
                            handler: function (checkbox, checked) {
                                var component = this.up().nextSibling('QualityReportField');
                                if (checked) {
                                    component.setLoading(true);
                                    var task = new Ext.util.DelayedTask(function () {
                                        component.setVisible(checked);
                                        component.getEl().fadeIn();
                                        component.setLoading(false);
                                    });
                                    task.delay(500);

                                } else {
                                    component.getEl().fadeOut({callback: function () {
                                            component.setVisible(checked);
                                        }});
                                }
                            }
                        },
                    ]},
                {xtype: 'QualityReportField'}
            ],
            listeners: {
                boxready: function () {
                    showHelpTips(this);
                },
                afterlayout: function () {
                    //TODO: REMOVE THIS CODE
                    if (debugging === true)
                        console.info("IntermediateDataView : Layout");
                },
                beforedestroy: function () {
                    me.getModel().deleteObserver(me);
                }
            }
        });
        me.callParent(arguments);
    }
});

Ext.require(['SL.view.AnalysisViews.AnalysisStepSelectorView']);

Ext.define('SL.view.AnalysisViews.IntermediateDataViews.SpecificDetailsPanel', {
    extend: 'Ext.container.Container', itemId: 'specificDetailsPanel',
    listeners: {
        boxready: function () {
            showHelpTips(this);
        }
    }
});

Ext.define('SL.view.AnalysisViews.IntermediateDataViews.ExtractRelevantFeaturesView', {
    extend: 'SL.view.AnalysisViews.IntermediateDataViews.SpecificDetailsPanel',
    alias: 'widget.ExtractRelevantFeaturesView',
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            layout: {type: 'vbox', align: 'stretch'}, cls: 'fieldBox',
            items: [
                {xtype: 'label', html: '<h2>Relevant features extraction details</h2>'},
                {xtype: 'AnalysisStepSelectorField', fieldLabel: "Features Files", name: "used_data"},
                {xtype: 'container', itemId: 'specificFields', layout: {type: 'vbox', align: 'stretch'},
                    items: [
                        {xtype: 'textfield', fieldLabel: 'Extracted feature type', name: 'feature_type'},
                        {xtype: 'textareafield', flex: 1, fieldLabel: 'Description of files', name: 'files_description'},
                        {xtype: 'textareafield', flex: 1, fieldLabel: 'Reference files', name: 'reference_files'}
                    ]
                }
            ]
        });
        me.callParent(arguments);
    }
});
//
//Ext.define('SL.view.AnalysisViews.IntermediateDataViews.MappingStepView', {
//    extend: 'SL.view.AnalysisViews.IntermediateDataViews.SpecificDetailsPanel',
//    alias: 'widget.MappingStepView',
//    initComponent: function () {
//        var me = this;
//        Ext.applyIf(me, {
//            cls: 'fieldBox',
//            layout: {type: 'vbox', align: 'stretch'},
//            items: [
//                {xtype: 'label', html: '<h2>Mapping details</h2>'},
//                {xtype: 'AnalysisStepSelectorField', fieldLabel: "Mapped Files", name: "used_data"},
//                {xtype: 'container', itemId: 'specificFields', layout: {type: 'vbox', align: 'stretch'},
//                    items: [{
//                            xtype: 'combobox', flex: 1, maxLength: 200, enforceMaxLength: true,
//                            fieldLabel: 'Genome specie', name: 'genome_specie', emptyText: 'Select or type an organism...',
//                            displayField: 'organism', valueField: 'organism',
//                            queryMode: 'local', typeAhead: true, allowBlank: false,
//                            store: Ext.create('Ext.data.ArrayStore', {fields: ['organism'], autoLoad: true,
//                                proxy: {type: 'ajax', url: 'data/organisms.json', reader: {type: 'json', root: 'organisms', successProperty: 'success'}}
//                            }),
//                        },
//                        {xtype: 'textfield', flex: 1, fieldLabel: 'Genome version', name: 'genome_version', maxLength: 200, enforceMaxLength: true, },
//                        {xtype: 'textfield', flex: 1, fieldLabel: 'Genome source', name: 'genome_source', maxLength: 200, enforceMaxLength: true, }
//                    ]
//                }
//            ]
//        });
//        me.callParent(arguments);
//    }
//});

Ext.define('SL.view.AnalysisViews.IntermediateDataViews.MaxQuantStepView', {
    extend: 'SL.view.AnalysisViews.IntermediateDataViews.SpecificDetailsPanel',
    alias: 'widget.MaxQuantStepView',
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            cls: 'fieldBox',
            layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'label', html: '<h2>Mapping details</h2>'},
                {xtype: 'AnalysisStepSelectorField', fieldLabel: "Quantified Files", name: "used_data"},
                {xtype: 'textfield', flex: 1, fieldLabel: 'Mqpar file location', name: 'path_mqpar_file'},
                {xtype: 'textfield', flex: 1, fieldLabel: 'Protein group table', name: 'protein_groups_table_id'}
            ]
        });
        me.callParent(arguments);
    }
});
//
//Ext.define('SL.view.AnalysisViews.IntermediateDataViews.PreprocessingStepView', {
//    extend: 'SL.view.AnalysisViews.IntermediateDataViews.SpecificDetailsPanel',
//    alias: 'widget.PreprocessingStepView',
//    initComponent: function () {
//        var me = this;
//        Ext.applyIf(me, {
//            cls: 'fieldBox', layout: {type: 'vbox', align: 'stretch'},
//            items: [
//                {xtype: 'label', html: '<h2>Preprocessing details</h2>'},
//                {xtype: 'container', itemId: 'specificFields', layout: {type: 'vbox', align: 'stretch'},
//                    items: [{
//                            xtype: 'combobox', maxWidth: 750,
//                            maxLength: 200, enforceMaxLength: true,
//                            fieldLabel: 'Preprocessing type',
//                            name: 'preprocessing_type',
//                            emptyText: 'Select or type the preprocessing action',
//                            store: ['Trimming', 'Filtering', 'Normalization', 'Sorting', 'File format conversion', 'Other']
//                        }]
//                },
//                {xtype: 'AnalysisStepSelectorField', fieldLabel: "Preprocessed Files", name: "used_data"},
//            ]
//        });
//        me.callParent(arguments);
//    }
//});
//
//Ext.define('SL.view.AnalysisViews.IntermediateDataViews.SmoothingStepView', {
//    extend: 'SL.view.AnalysisViews.IntermediateDataViews.SpecificDetailsPanel',
//    alias: 'widget.SmoothingStepView',
//    initComponent: function () {
//        var me = this;
//        Ext.applyIf(me, {
//            cls: 'fieldBox',
//            layout: {type: 'vbox', align: 'stretch'}, layout: {type: 'vbox', align: 'stretch'},
//            items: [
//                {xtype: 'label', html: '<h2>Smoothing details</h2>'},
//                {xtype: 'AnalysisStepSelectorField', fieldLabel: "Smoothed peak Files", name: "used_data"},
//                {xtype: 'container', itemId: 'specificFields',
//                    items: [{xtype: 'numberfield', flex: 1, fieldLabel: 'Sliding window length', name: 'sliding_window_length', maxWidth: 350},
//                        {xtype: 'numberfield', flex: 1, fieldLabel: 'Step length', name: 'steps_length', maxWidth: 350}
//                    ]
//                }
//            ]
//        });
//        me.callParent(arguments);
//    }
//});

Ext.define('SL.view.AnalysisViews.IntermediateDataViews.UnionStepView', {
    extend: 'SL.view.AnalysisViews.IntermediateDataViews.SpecificDetailsPanel',
    alias: 'widget.UnionStepView',
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            cls: 'fieldBox',
            layout: {type: 'vbox', align: 'stretch'}, layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'label', html: '<h2>Unification details</h2>'},
                {xtype: 'AnalysisStepSelectorField', fieldLabel: "Unified Files", name: "used_data"},
                {xtype: 'container', itemId: 'specificFields', items: []}
            ]
        });
        me.callParent(arguments);
    }
});
