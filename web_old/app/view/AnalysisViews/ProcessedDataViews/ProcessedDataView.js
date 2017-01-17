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
 *   - ProcessedDataView 
 *   - SpecificDetailsPanel (ProcessedDataView)
 *   - CallingStepView 
 *   - DataMatrixStepView 
 *   - MergingStepView 
 *   - ProteomicsMSQuantificationStepView 
 *   - QuantificationStepView 
 *   - RegionCallingStepView 
 *   - RegionIntersectionStepView 
 *   - RegionConsolidationStepView 
 *   -
 */
Ext.define('SL.view.AnalysisViews.ProcessedDataViews.ProcessedDataView', {
    extend: 'Ext.form.Panel',
    alias: 'widget.ProcessedDataView',
    mixins: {
        //Extends the Observer class
        View: 'SL.view.senchaExtensions.View',
        ////Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer',
        //Extends the Command class
        Command: 'SL.view.senchaExtensions.Command',
    },
    requires: [
        'SL.view.AnalysisViews.SoftwareConfigurationField',
//        'SL.view.AnalysisViews.QualityReportField',
        'SL.view.UserViews.UserView',
        'SL.view.AnalysisViews.FileLocationSelectorField'
    ],
    /**BC******************************************************************************      
     * 
     * SOME ATTRIBUTES
     * 
     **EC******************************************************************************/
    inCreationMode: false, inEditionMode: false,
    inWizardMode: false, regionStep: false,
    unificationStep: false,
    helpFileURL: "data/help/processeddataview_help.json",
    /********************************************************************************      
     * This function load a given ProcessedData MODEL into the current VIEW 
     *  
     * @param  model, the ProcessedData model
     * @return      
     ********************************************************************************/
    loadModel: function (model) {
        this.setLoading(true);

        this.model = model;

        this.updateProcessedTypeComboboxContent();

        //1. Create the new view for the specific details
        var processedDataType = model.getProcessedDataType();
        var specificDetailsPanelType = "SL.view.AnalysisViews.ProcessedDataViews.";

        if (processedDataType === "merging_step")
            specificDetailsPanelType += "MergingStepView";
        else if (processedDataType === "proteomics_msquantification_step")
            specificDetailsPanelType += "ProteomicsMSQuantificationStepView";
        else if (processedDataType === "quantification_step")
            specificDetailsPanelType += "QuantificationStepView";
        else if (processedDataType === "calling_step")
            specificDetailsPanelType += "CallingStepView";
        else if (processedDataType === "region_calling_step")
            specificDetailsPanelType += "RegionCallingStepView";
        else if (processedDataType === "region_intersection_step")
            specificDetailsPanelType += "RegionIntersectionStepView";
        else if (processedDataType === "region_consolidation_step")
            specificDetailsPanelType += "RegionConsolidationStepView";
        else if (processedDataType === "data_matrix_step")
            specificDetailsPanelType += "DataMatrixStepView";
        else
            specificDetailsPanelType = "";

        var me = this;
        Ext.require([specificDetailsPanelType], function () {

            //IF THE MODEL IS A SUBCLASS OF PROCESSED DATA, LETS SHOW THE SPECIFIC DETAILS PANEL
            if (specificDetailsPanelType !== "") {
                //1.CREATE THE NEW PANEL
                var newPanel = Ext.create(specificDetailsPanelType);
                //2. CLEAR AND HIDE THE PREVIOUS SPECIFIC INTERMEDIATE DATA PANEL (IF EXISTS)
                var previousPanel = me.queryById("specificDetailsPanel");
                if (previousPanel != null) {
                    me.remove(previousPanel)
                }

                //2b. HIDE OR ADD SPECIFIC FIELDS DEPENDING ON THE TYPE OF STEP
                //IF STEP IS A PROTEOMICS QUANTIFICATION THEN HIDE SOFTWARE FIELDS 
                if (processedDataType === "proteomics_msquantification_step") {
                    var softwareDetailsPanel = me.queryById('softwareDetailsPanel');
                    softwareDetailsPanel.setVisible(false);
                    softwareDetailsPanel.setDisabled(true);
                } else if (processedDataType === "quantification_step" || processedDataType === "region_calling_step") {
                    //IF THE STEP IS A FEATURE QUANTIFICATION STEP SHOW REFERENCE REGION SELECTOR
                    var referenceRegionField = newPanel.getReferenceRegionSelector();
                    referenceRegionField.loadModels(model.getReferenceRegions());
                    //UPDATE THE PREVIOUSSTEP SELECTOR FIELD
                    referenceRegionField.update();
                }

                //2.c Add the views for all the previous steps
                var analysis_model = me.parent.getModel();
                var previousSteps = model.getPreviousSteps();
                var previousStepsFields = null;

                //IF THE STEP IS NOT A REGION DEFINITION STEP (INTERSECTION OR CONSOLIDATION OF REGIONS), LOAD TJHE PREVIOUS STEPS
                if (me.getModel().isRegionDefinitionStep() !== true) {
                    previousStepsFields = newPanel.down('AnalysisStepSelectorField');
                    //ADD A ELEMENT FOR EACH ASSOCIATED PREVIOUS STEP
                    for (var i = 0; i < previousSteps.length; i++) {
                        previousStepsFields.addModel(analysis_model.getStepByID(previousSteps[i]));
                    }
                } else {
                    //ELSE, ADD THE INFORMATION ABOUT REGIONS
                    //ADD A ELEMENT FOR EACH ASSOCIATED REGION STEP
                    previousStepsFields = newPanel.down('RegionSelectorField');
                    previousStepsFields.loadModels(model.getPreviousSteps());
                }
                //UPDATE THE PREVIOUSSTEP SELECTOR FIELD
                previousStepsFields.update();

                //Add the new panel before the qualityReport component
                var newItemPosition = me.items.length - 1;
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
            var fileLocationFields = me.query("FileLocationSelectorField");
            for (var i in fileLocationFields) {
                var fileLocationField = fileLocationFields[i];
                var fieldName = fileLocationField.name;
                var values = me.getModel().get(fieldName);
                values = values.split("\\$\\$");

                var fileLocationElement, fileLocationsModels = [];
                for (var i in values) {
                    if (values[i] === "") {
                        continue;
                    }
                    fileLocationElement = new Object();
                    fileLocationElement.file_location = values[i];
                    fileLocationsModels.push(fileLocationElement);
                }
                fileLocationField.loadModels(fileLocationsModels);
            }


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
    getProcessedDataType: function () {
        return this.queryById("processed_data_type_chooser").getValue();
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
    getResults: function () {
        return this.queryById('resultsField').getValue();
    },
    getPreviousSteps: function () {
        if (this.queryById('analysisStepSelectorField') != null) {
            return this.queryById('analysisStepSelectorField').getModels();
        } else if (this.queryById('regionSelectorField') != null) {
            return this.queryById('regionSelectorField').getModels();
        }
        return null;
    },
//    getAssociatedQualityReportField: function() {
//        return this.down('QualityReportField');
//    },
    isInEditionMode: function () {
        return this.inEditionMode;
    },
    isInWizardMode: function () {
        return this.inWizardMode;
    },
    /********************************************************************************      
     * Due to the thiis view can be used to Inspect/Edit/Create Intermediate Data, we need 
     * this function to custom the panel depending on the situation (set the buttons's 
     * visibility, the editable_mode of the formulary’s fields...
     *  
     * @param   mode, an option in ["edition", "creation", "inspect"]
     * @return      
     ********************************************************************************/
    setViewMode: function (mode, otherParams) {
        this.setLoading(true);
        this.inWizardMode = (otherParams == null || otherParams.inWizardMode == null) ? false : otherParams.inWizardMode;

        var editable_mode = false;
        switch (mode) {
            //EDITION
            case "edition":
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
        }
        this.setEditableMode(editable_mode);
        this.queryById("last_edition_date").setReadOnly(true);
        this.queryById("submission_date").setReadOnly(mode !== "creation");
        this.queryById('software_configuration_static').setViewMode(mode);
//        this.down('QualityReportField').setViewMode(mode);
        this.queryById('processed_data_type_chooser').setReadOnly(mode !== "creation");
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
        var fields = this.query('FileLocationSelectorField');
        for (var i in fields) {
            fields[i].setEditable(mode);
        }

        var previousStepsFields = this.down('AnalysisStepSelectorField');
        if (previousStepsFields != null) {
            previousStepsFields.setEditable(mode);
        }

        var panelAux = this.down('RegionSelectorField');
        if (panelAux != null) {
            panelAux.setEditable(mode);
        }

        var fields = this.query('checkbox[cls=showHideCheckbox]');
        for (var i in fields) {
            fields[i].setReadOnly(false);
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
     * SOME EVENTS
     **EC*********************************************************************************/
    processedDataTypeComboboxChange: function (field, newProcessedDataType) {
        var processedDataView = field.up('ProcessedDataView');
        var processedDataModel = processedDataView.getModel();

        //If the RAW DATA STEP type has changed, cretes a new model
        if (processedDataModel.getProcessedDataType() !== newProcessedDataType && field.getStore().findExact("value", newProcessedDataType) !== -1) {
            this.getController().processedDataTypeComboboxChangeHandler(processedDataView, newProcessedDataType);
        }
    },
    updateProcessedTypeComboboxContent: function () {
        var store_data;
        if (this.regionStep === true) {
            store_data = [
                ['Region Intersection', 'region_intersection_step'],
                ['Region Consolidation', 'region_consolidation_step'],
            ];
        } else if (this.unificiationStep === true) {
            store_data = [
                ['Processed Data unification (Processed Data Matrix)', 'data_matrix_step']
            ];
        } else {
            store_data = [
                ['Features File Merging', 'merging_step'],
                ['Features Quantification', 'quantification_step'],
                ['Calling', 'calling_step'],
                ['Region Calling', 'region_calling_step'],
                ['Proteomics MS Quantification', 'proteomics_msquantification_step']
            ];
        }
        this.queryById('processed_data_type_chooser').bindStore(Ext.create('Ext.data.ArrayStore', {fields: ['label', 'value'], data: store_data}));
    },
    /**BC****************************************************************************************
     * 
     * COMPONENT DEFINITION    
     * 
     **EC****************************************************************************************/
    initComponent: function () {
        var me = this;
        me.border = 0;

        this.setController(application.getController("ProcessedDataController"));

        Ext.applyIf(me, {
            border: false, layout: {type: 'vbox', align: 'stretch'},
            cls: 'processedDataView', bodyPadding: '20 10 20 10',
            fieldDefaults: {labelAlign: 'right', labelWidth: 220, msgTarget: 'side', emptyText: "Not specified"},
            items: [
                {xtype: 'label', itemId: "mainTitle", html: '<p class="form_title">Step information</p>'},
                {xtype: 'label', html: '<h1 class="form_subtitle">Processed data</h1>'},
                {xtype: 'container', cls: 'fieldBox', layout: {align: 'stretch', type: 'vbox'},
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
                        {xtype: 'textfield', fieldLabel: 'Step Name', name: 'step_name', maxLength: 90, enforceMaxLength: true, allowBlank: false, itemId: 'stepNameField'},
                        {xtype: 'combobox', itemId: 'processed_data_type_chooser', fieldLabel: 'Processed step type', name: 'processed_data_type', cls: 'combobox',
                            maxWidth: 600, displayField: 'label', allowBlank: false, forceSelection: true, valueField: 'value',
                            store: Ext.create('Ext.data.ArrayStore', {fields: ['label', 'value'], data: [
                                    ['Features File Merging', 'merging_step'],
                                    ['Features Quantification', 'quantification_step'],
                                    ['Calling', 'calling_step'],
                                    ['Region Calling', 'region_calling_step'],
                                    ['Proteomics MS Quantification', 'proteomics_msquantification_step']
                                ]}),
                            listeners: {change: {fn: me.processedDataTypeComboboxChange, scope: me}}
                        },
                        {xtype: 'container', itemId: 'processed_data_form', layout: {align: 'stretch', type: 'vbox'},
                            items: [
                                {xtype: "FileLocationSelectorField", name: 'files_location', itemId: 'fileLocationField', allowBlank: false},
                                {xtype: 'datefield', itemId: 'submission_date', fieldLabel: 'Submission date', name: 'submission_date', maxWidth: 350, allowBlank: false, format: 'Y/m/d'},
                                {xtype: 'datefield', itemId: 'last_edition_date', fieldLabel: 'Last edition date', name: 'last_edition_date', maxWidth: 350, allowBlank: false, format: 'Y/m/d'},
                                {xtype: 'UserListTextField', itemId: 'step_owners', fieldLabel: 'Owners', name: 'step_owners',
                                    store: Ext.create('Ext.data.ArrayStore', {fields: ['value'], data: []}),
                                    valueField: 'value', displayField: 'value', allowBlank: false, minHeight: 30, margin: '0 0 10 0'
                                }
                            ]
                        }
                    ]},
                {xtype: 'container', cls: 'fieldBox', itemId: "softwareDetailsPanel", layout: {type: 'vbox', align: 'stretch'},
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
//                        {xtype: 'textareafield', flex: 1, minHeight: 150, fieldLabel: 'Motivation', name: 'motivation', itemId: 'motivationField'},
                        {xtype: 'textareafield', flex: 1, minHeight: 200, fieldLabel: 'Observations/Results', name: 'results', itemId: 'resultsField'}
                    ]
                },
//                {xtype: 'QualityReportField', itemId: 'processed_data_form2'}
            ],
            listeners: {
                boxready: function () {
                    showHelpTips(this);
                },
                afterlayout: function () {
                    //TODO: REMOVE THIS CODE
                    if (debugging === true)
                        console.info("ProcessedDataView : Layout");
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

Ext.define('SL.view.AnalysisViews.ProcessedDataViews.SpecificDetailsPanel', {extend: 'Ext.container.Container', itemId: 'specificDetailsPanel',
    getPreviousStepSelector: function () {
        return this.down('AnalysisStepSelectorField');
    },
    listeners: {
        boxready: function () {
            showHelpTips(this);
        }
    }
});

Ext.define('SL.view.AnalysisViews.ProcessedDataViews.CallingStepView', {
    extend: 'SL.view.AnalysisViews.ProcessedDataViews.SpecificDetailsPanel',
    alias: 'widget.CallingStepView',
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            cls: 'fieldBox', layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'label', html: '<h2>Calling details</h2>'},
                {xtype: 'AnalysisStepSelectorField', fieldLabel: "Called Files", name: "called_data"},
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.ProcessedDataViews.DataMatrixStepView', {
    extend: 'SL.view.AnalysisViews.ProcessedDataViews.SpecificDetailsPanel',
    alias: 'widget.DataMatrixStepView',
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            cls: 'fieldBox', layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'label', html: '<h2>File Unification details</h2>'},
                {xtype: 'AnalysisStepSelectorField', fieldLabel: "Unified Files", name: "unified_data"},
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.ProcessedDataViews.MergingStepView', {
    extend: 'SL.view.AnalysisViews.ProcessedDataViews.SpecificDetailsPanel',
    alias: 'widget.MergingStepView',
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            cls: 'fieldBox', layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'label', html: '<h2>File Merging details</h2>'},
                {xtype: 'AnalysisStepSelectorField', fieldLabel: "Merged Files", name: "merged_data"}
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.ProcessedDataViews.ProteomicsMSQuantificationStepView', {
    extend: 'SL.view.AnalysisViews.ProcessedDataViews.SpecificDetailsPanel',
    alias: 'widget.ProteomicsMSQuantificationStepView',
    getPreviousStepSelector: function () {
        return this.queryById('analysisStepSelectorField');
    },
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            layout: {type: 'vbox', align: 'stretch'}, defaults: {layout: {align: 'stretch', type: 'vbox'}},
            items: [
                {xtype: 'container', layout: 'hbox', margin: '0 0 20 0', items: [
                        {xtype: 'label', html: '<h1 class="form_subtitle">Mass spectrometry Quantification</h1>'},
                        {xtype: 'checkbox', boxLabel: 'Show', cls: "showHideCheckbox", checked: true, margin: '12 0 0 10',
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
                        },
                    ]},
                {xtype: 'container', defaults: {layout: {align: 'stretch', type: 'vbox'}},
                    items: [
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>Experimental design</h2>'},
                                {xtype: 'textarea', fieldLabel: 'Groups', name: 'groups', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Biological and technical replicates', name: 'replicates', minHeight: 100}
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>Sample / Assay description</h2>'},
                                {xtype: 'textarea', fieldLabel: 'Labelling protocol', name: 'labelling_protocol', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Sample description', name: 'sample_description', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Sample name', name: 'sample_name', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Sample amount', name: 'sample_amount', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Sample labelling', name: 'sample_labelling', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Replicates and/or groups ', name: 'replicates_and_groups', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Isotopic correction coefficients', name: 'isotopic_correction_coefficients', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Internal references', name: 'internal_references', minHeight: 100}
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>Input data</h2>'},
                                {xtype: 'textfield', fieldLabel: 'Input data type', name: 'input_data_type', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', fieldLabel: 'Input data format', name: 'input_data_format', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', fieldLabel: 'Input data merging', name: 'input_data_merging', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'AnalysisStepSelectorField', hidden: true, fieldLabel: "Availability of input data", name: "quantified_data"}
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>Protocol</h2>'},
                                {xtype: 'combobox', fieldLabel: 'Quantification software', name: 'quantification_software',
                                    hideTrigger: true,
                                    blankText: 'Please type the used software.',
                                    queryMode: 'local', emptyText: 'Select or type a software',
                                    displayField: 'name', valueField: 'name',
                                    store: Ext.create('Ext.data.ArrayStore', {fields: ['name'], autoLoad: true, proxy: {type: 'ajax', url: 'data/software.json', reader: {type: 'json', root: 'software', successProperty: 'success'}}})
                                },
                                {xtype: 'textarea', fieldLabel: 'Description of selection/matching method', name: 'selection_method', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Confidence filter prior to quantification', name: 'confidence_filter', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Missing values imputation and outliers removal', name: 'missing_values', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Quantification values calculation', name: 'quantification_values_calculation', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Replicate aggregation', name: 'replicate_aggregation', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Normalization', name: 'normalization', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Protein quantification values calculation', name: 'protein_quantification_values_calculation', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Protocol specific corrections', name: 'specific_corrections', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Description of methods for estimation of correctness', name: 'correctness_estimation_methods', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Calibration curves of standards', name: 'curves_calibration', minHeight: 100}
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>Quantification values at peptide/feature level</h2>'},
                                {xtype: 'textarea', fieldLabel: 'Primary extracted quantification values', name: 'primary_extracted_quantification_values', minHeight: 100},
                                {xtype: "FileLocationSelectorField", name: 'primary_extracted_quantification_files_location', allowBlank: true, itemId: "primary_extracted_quantification_files_location"},
                                {xtype: 'textarea', fieldLabel: 'Peptide quantification values', name: 'peptide_quantification_values', minHeight: 100},
                                {xtype: "FileLocationSelectorField", name: 'peptide_quantification_files_location', allowBlank: true, itemId: "peptide_quantification_files_location"}
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>Quantification values at protein level</h2>'},
                                {xtype: 'textarea', fieldLabel: 'Raw quantification values', name: 'raw_quantification_values', minHeight: 100},
                                {xtype: "FileLocationSelectorField", fieldLabel: 'File location', name: 'raw_quantification_files_location', allowBlank: true, itemId: "raw_quantification_files_location"},
                                {xtype: 'textarea', fieldLabel: 'Transformed quantification values', name: 'transformed_quantification_values', minHeight: 100},
                                {xtype: "FileLocationSelectorField", fieldLabel: 'File location', name: 'transformed_quantification_files_location', allowBlank: true, itemId: "transformed_quantification_files_location"}
                            ]
                        }
                    ]
                },
                {xtype: 'container', layout: 'hbox', margin: '0 0 20 0', items: [
                        {xtype: 'label', html: '<h1 class="form_subtitle">Mass spectrometry Informatics</h1>'},
                        {xtype: 'checkbox', boxLabel: 'Show', cls: "showHideCheckbox", checked: true, margin: '12 0 0 10',
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
                {xtype: 'container', defaults: {layout: {align: 'stretch', type: 'vbox'}},
                    items: [
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>MSI - General features</h2>'},
                                {xtype: 'textarea', fieldLabel: 'Responsible person or role', name: 'msi_responsible_person', minHeight: 100},
                                {xtype: 'combobox', fieldLabel: 'Software name, version and manufacturer', name: 'msi_software',
                                    hideTrigger: true,
                                    blankText: 'Please type the used software.',
                                    queryMode: 'local', emptyText: 'Select or type a software',
                                    displayField: 'name', valueField: 'name',
                                    store: Ext.create('Ext.data.ArrayStore', {fields: ['name'], autoLoad: true, proxy: {type: 'ajax', url: 'data/software.json', reader: {type: 'json', root: 'software', successProperty: 'success'}}})
                                },
                                {xtype: 'textarea', fieldLabel: 'Customizations', name: 'msi_customizations', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Software availability (URL)', name: 'msi_software_availability', minHeight: 100},
                                {xtype: 'textarea', flex: 1, fieldLabel: 'Generated files location (description)', name: 'msi_files_description', minHeight: 100},
                                {xtype: "FileLocationSelectorField", fieldLabel: 'Generated files location (location)', name: 'msi_files_location', allowBlank: true, itemId: "msi_files_location"}
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>MSI - Input data</h2>'},
                                {xtype: 'textarea', fieldLabel: 'Description and type of MS data', name: 'msi_inputdata_description', minHeight: 100},
                                {xtype: 'displayfield', fieldLabel: 'Availability of MS data', value: '<span style="color:gray">See above <i>Mass spectrometry Quantification - Input data</i></span>'},
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>MSI - Input parameters</h2>'},
                                {xtype: 'textarea', fieldLabel: 'Database queried', name: 'msi_database_queried', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Taxonomical restrictions', name: 'msi_taxonomical_restrictions', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Description of tool and scoring scheme', name: 'msi_tool_description', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Specified cleavage agent(s)', name: 'msi_cleavage_agents', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Allowed number of missed cleavages', name: 'msi_missed_cleavages', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Additional parameters related to cleavage', name: 'msi_cleavage_additional_params', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Permissible amino acids modifications', name: 'msi_permissible_aminoacids_modifications', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Precursor-ion and fragment-ion mass tolerance', name: 'msi_precursorion_tolerance', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Mass tolerance for PMF', name: 'msi_pmf_mass_tolerance', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Thresholds; minimum scores for peptides, proteins', name: 'msi_thresholds', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Any other relevant parameters', name: 'msi_otherparams', minHeight: 100},
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>MSI - Output: Identified proteins</h2>'},
                                {xtype: 'textarea', fieldLabel: 'Accession code in the queried database', name: 'msi_accession_code', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Protein description', name: 'msi_protein_description', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Protein scores', name: 'msi_protein_scores', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Validation status', name: 'msi_validation_status', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Number of different peptide sequences', name: 'msi_different_peptide_sequences', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Percent peptide coverage of protein', name: 'msi_peptide_coverage', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Number of matched/unmatched peaks', name: 'msi_pmf_matched_peaks', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Other additional information, when used for evaluation of confidence', name: 'msi_other_additional_info', minHeight: 100},
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>MSI - Output: Identified peptide</h2>'},
                                {xtype: 'textarea', fieldLabel: 'Sequence', name: 'msi_sequence', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Peptide scores', name: 'msi_peptide_scores', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Chemical modifications and posttranslational modifications; sequence polymorphisms', name: 'msi_chemical_modifications', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Corresponding Spectrum locus', name: 'msi_spectrum_locus', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Charge assumed for identification and a measurement of peptide mass error', name: 'msi_charge_assumed', minHeight: 100},
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>MSI - Output: Quantitation for selected ions</h2>'},
                                {xtype: 'textarea', fieldLabel: 'Quantitation approach', name: 'msi_quantitation_approach', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Quantity measurement', name: 'msi_quantitation_measurement', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Data transformation and normalisation technique', name: 'msi_quantitation_normalisation', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Number of replicates (biological and technical)', name: 'msi_quantitation_replicates_number', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Acceptance criteria', name: 'msi_quantitation_acceptance', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Estimates of uncertainty and the methods for the error analysis', name: 'msi_quantitation_error_analysis', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Results from controls', name: 'msi_quantitation_control_results', minHeight: 100},
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox', defaults: {margin: '0 0 15 0'},
                            items: [
                                {xtype: 'label', html: '<h2>MSI - Interpretation and validation</h2>'},
                                {xtype: 'textarea', fieldLabel: 'Assessment and confidence given to the identification and quantitation', name: 'msi_interpretation_assessment', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Results of statistical analysis or determination of false positive rate in case of large scale experiments', name: 'msi_interpretation_results', minHeight: 100},
                                {xtype: 'textarea', fieldLabel: 'Inclusion/exclusion of the output of the software', name: 'msi_interpretation_inclusion', minHeight: 100},
                            ]
                        }
                    ]
                }
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.ProcessedDataViews.QuantificationStepView', {
    extend: 'SL.view.AnalysisViews.ProcessedDataViews.SpecificDetailsPanel',
    alias: 'widget.QuantificationStepView',
    requires: ['SL.view.AnalysisViews.RegionSelectorField'],
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            cls: 'fieldBox', layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'label', html: '<h2>Quantification details</h2>'},
                {xtype: 'AnalysisStepSelectorField', fieldLabel: "Quantified Files", name: "quantified_data"},
                {xtype: 'RegionSelectorField', fieldLabel: "Reference region Files", name: "reference_region", itemId: 'reference_region_selector'},
            ]
        });
        me.callParent(arguments);
    },
    getReferenceRegionSelector: function () {
        return this.down('RegionSelectorField');
    }
});

Ext.define('SL.view.AnalysisViews.ProcessedDataViews.RegionCallingStepView', {
    extend: 'SL.view.AnalysisViews.ProcessedDataViews.SpecificDetailsPanel',
    alias: 'widget.RegionCallingStepView',
    requires: ['SL.view.AnalysisViews.RegionSelectorField'],
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            cls: 'fieldBox', layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'label', html: '<h2>Region Calling details</h2>'},
                {xtype: 'AnalysisStepSelectorField', fieldLabel: "Called Files", name: "called_data"},
                {xtype: 'RegionSelectorField', fieldLabel: "Reference region Files", name: "reference_region", itemId: 'reference_region_selector'},
            ]
        });
        me.callParent(arguments);
    },
    getReferenceRegionSelector: function () {
        return this.down('RegionSelectorField');
    }
});

Ext.define('SL.view.AnalysisViews.ProcessedDataViews.RegionConsolidationStepView', {
    extend: 'SL.view.AnalysisViews.ProcessedDataViews.SpecificDetailsPanel',
    alias: 'widget.RegionConsolidationStepView',
    requires: ['SL.view.AnalysisViews.RegionSelectorField'],
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            cls: 'fieldBox', layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'label', html: '<h2>Region Consolidation details</h2>'},
                {xtype: 'RegionSelectorField', fieldLabel: "Consolidated Files", name: "consolidated_data"},
                {xtype: 'textarea', flex: 1, fieldLabel: 'Motivation', margin: '0 0 20 0', name: 'motivation', }
            ]
        });
        me.callParent(arguments);
    },
    getPreviousStepSelector: function () {
        return this.down('RegionSelectorField');
    }
});

Ext.define('SL.view.AnalysisViews.ProcessedDataViews.RegionIntersectionStepView', {
    extend: 'SL.view.AnalysisViews.ProcessedDataViews.SpecificDetailsPanel',
    alias: 'widget.RegionIntersectionStepView',
    requires: ['SL.view.AnalysisViews.RegionSelectorField'],
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            cls: 'fieldBox', layout: {type: 'vbox', align: 'stretch'},
            items: [
                {xtype: 'label', html: '<h2>Region Intersection details</h2>'},
                {xtype: 'RegionSelectorField', fieldLabel: "Intersected Files", name: "intersected_data"},
                {xtype: 'textarea', flex: 1, fieldLabel: 'Motivation', margin: '0 0 20 0', name: 'motivation', }
            ]
        });
        me.callParent(arguments);
    },
    getPreviousStepSelector: function () {
        return this.down('RegionSelectorField');
    }
});