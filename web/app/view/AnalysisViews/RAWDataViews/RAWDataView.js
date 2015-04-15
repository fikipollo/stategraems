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
 *   - RAWDataView 
 *   - 
 */
Ext.define('SL.view.AnalysisViews.RAWDataViews.RAWDataView', {
    extend: 'Ext.form.Panel',
    alias: 'widget.RAWDataView',
    mixins: {
        //Extends the Observer class
        View: 'SL.view.senchaExtensions.View',
        //Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer',
        //Extends the Command class
        Command: 'SL.view.senchaExtensions.Command'
    },
    requires: [
        'SL.view.senchaExtensions.ElementListSelector', 'SL.view.SampleViews.AnalyticalReplicateView',
        'SL.view.AnalysisViews.QualityReportField', 'SL.view.AnalysisViews.RAWDataViews.ExtractionMethodView',
        'SL.view.AnalysisViews.RAWDataViews.SeparationMethodsView', 'SL.view.UserViews.UserView',
        'SL.view.AnalysisViews.FileLocationSelectorField'
    ],
    /**BC******************************************************************************      
     * 
     * SOME ATTRIBUTES
     * 
     **EC******************************************************************************/
    inCreationMode: false,
    inEditionMode: false,
    inWizardMode: false,
    helpFileURL: "data/help/rawdataview_help.json", border: 0,
    /**BC******************************************************************************      
     * This function load a given RAWData MODEL into the current VIEW 
     *  
     * @param  model, the RAWDATA model
     * @return      
     **EC******************************************************************************/
    loadModel: function (model) {
        this.setLoading(true);

        this.model = model;

        //1. Load all RAWDATA fields in the formulary
        this.loadRecord(model);

        //2. If the RAW method uses an extraction method
        if (model.getExtractionMethod() != null) {
            var previousExtractionMethodView, newExtractionMethodView, newItemPosition;

            var rawDatatype = model.getRawDataType();
            rawDatatype = rawDatatype.replace("-", "");

            if (rawDatatype === "GCMS") {
                rawDatatype = "MassSpectrometry";
            } else if (rawDatatype === "LCMS") {
                rawDatatype = "MassSpectrometry";
            } else if (rawDatatype === "CEMS") {
                rawDatatype = "MassSpectrometry";
            }
            rawDatatype += "View";

            newExtractionMethodView = Ext.create("SL.view.AnalysisViews.RAWDataViews." + rawDatatype);
            previousExtractionMethodView = this.queryById('specificDetailsPanel');

            if (previousExtractionMethodView != null) {
                this.remove(previousExtractionMethodView);
            }
            newItemPosition = this.items.length - 2;
            this.insert(newItemPosition, newExtractionMethodView);

//            newExtractionMethodView.setEditableMode(this.inEditionMode);
            newExtractionMethodView.loadModel(model.getExtractionMethod());
            model.getExtractionMethod().addObserver(newExtractionMethodView);
        }

        //3.Load the information for the analytical replicate
        var analyticalSampleIDfield = this.queryById('analyticalReplicateField');
        if (model.get('analyticalReplicate_id') != null) {
            analyticalSampleIDfield.setValue(model.getAnalyticalReplicateID());
        }

        analyticalSampleIDfield.setName("analyticalReplicate_id");

        //4.Load the file location info
        var fileLocation = model.getFileLocation();
        fileLocation = fileLocation.split("$$");
        var step_fileLocation = this.queryById("fileLocationField");
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

        //5.Load owners info
        var owners = model.getOwners();
        var stepOwnersField = this.queryById("step_owners");
        stepOwnersField.clear();
        for (var i in owners) {
            stepOwnersField.addUser(owners[i].getID());
        }

        //6. Check if the step is an imported step (comparing the id with the expected id for this analysis)
        //GETS THE ANALYSIS MODEL
        var analysisModel = this.parent.getModel();
        var currentAnalysisID = analysisModel.getID();
        var expectedAnalysisOwnerID = "AN" + model.getID().slice(2).split(".")[0];
        if (currentAnalysisID !== expectedAnalysisOwnerID) {
            this.queryById('warningTip').update("<p>Step imported from analysis " + expectedAnalysisOwnerID);
            this.queryById('warningTip').setVisible(true);
        }

        //7. Load the quality report
        var qualityReportField = this.queryById('qualityReportField');
        if (model.getAssociatedQualityReport() != null) {
            var qualityReport = model.getAssociatedQualityReport();
            qualityReportField.loadModel(qualityReport);
            qualityReport.addObserver(qualityReportField);
        } else {
            qualityReportField.cleanAndHide();
        }

        this.setLoading(false);
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
    getAnalyticalReplicateID: function () {
        return this.queryById('analyticalReplicateField').getValue();
    },
    getName: function () {
        return this.queryById('stepNameField').getValue();
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
    getExtractionMethodType: function () {
        return this.queryById("raw_data_type_chooser").getValue();
    },
    getExtractionMethod: function () {
        return this.queryById("specificDetailsPanel").getModel();
    },
    getSeparationMethodType: function () {
        if (this.queryById("separation_method_type") != null) {
            return this.queryById("separation_method_type").getValue();
        }
        return null;
    },
    getSeparationMethod: function () {
        if (this.queryById("separationMethodView") != null) {
            return this.queryById("separationMethodView").getModel();
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
                //THE QUEUE OF TASKS THAT SHOULD BE CARRIED OUT WHEN PRESSING "ACCEPT" BUTTON
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
        this.queryById('qualityReportField').setViewMode(mode);
        if (['GC-MS', 'LC-MS', 'CE-MS'].indexOf(this.queryById('raw_data_type_chooser').getValue()) !== -1) {
            this.down('combobox[name=separation_method_type]').setReadOnly(mode !== "creation");
        }
        this.queryById('raw_data_type_chooser').setReadOnly(mode !== "creation");

        //CHECK IF WE ARE IN WIZARD MODE, i.e. FIELD SUCH AS STEP NAME AND FILE LOCATION WILL BE SPECIFIED LATER
        if (this.isInWizardMode()) {
            this.queryById("fileLocationField").setEnabled(false);
            this.queryById("analyticalReplicateField").setEnabled(false);
            this.queryById("stepNameField").setDisabled(true);
        }
        this.setLoading(false);
    },
    /**BC******************************************************************************      
     * This function changes the value of inWizardMode field
     *  
     * @param  mode, a boolean value where true means "Wizard mode ON"
     * @return      
     **EC******************************************************************************/
    setIsInWizardMode: function (mode) {
        this.inWizardMode = mode;
    },
    /**BC******************************************************************************      
     * This function changes the Editable mode setting of all formulary fields and all 
     * the inner panels.
     *  
     * @param  mode, a boolean value where true means "Editable mode ON"
     * @return      
     **EC******************************************************************************/
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

        this.queryById("analyticalReplicateField").setEditableMode(mode);
//        if (this.queryById('specificDetailsPanel') !== null) {
//            this.queryById('specificDetailsPanel').setEditableMode(mode);
//        }
        if (this.queryById("separationMethodView") != null) {
            this.queryById("separationMethodView").setEditableMode(mode);
        }
        Ext.resumeLayouts(true);
    },
    validateContent: function () {
        //TODO: MEJORAR
        //Check if the information in the form is valid
        var valid = true;
        valid &= this.getForm().isValid();
        valid &= this.queryById("fileLocationField").isValid();
        valid &= this.queryById("analyticalReplicateField").isValid();
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
                component.getEl().fadeIn();
            });
            task.delay(500);
        }
    },
    /**BC****************************************************************************************
     *
     *SOME EVENTS HANDLERS    
     *
     **EC****************************************************************************************/
    extractionMethodTypeComboboxChange: function (field, newExtractionMethodType) {
        var rawDataView = field.up('RAWDataView');
        var rawdataModel = rawDataView.getModel();

        //If the RAW DATA STEP type has changed, cretes a new model
        if (rawdataModel.getRawDataType() !== newExtractionMethodType && field.getStore().findExact("value", newExtractionMethodType) !== -1) {
            this.getController().extractionMethodTypeComboboxChangeHandler(rawDataView, newExtractionMethodType);
        }
    },
    elementSelectorFieldSearchButtonClicked: function () {
        this.getController().searchAnalyticalReplicateButtonClick(this.queryById("analyticalReplicateField"));
    },
    elementSelectorFieldInspectButtonClicked: function () {
        this.getController().inspectAnalyticalReplicateButtonClick(this.queryById("analyticalReplicateField"));
    },
    /**BC****************************************************************************************
     * 
     * COMPONENT DEFINITION    
     * 
     **EC****************************************************************************************/
    initComponent: function () {
        var me = this;
        me.border = 0;

        this.setController(application.getController("RAWDataController"));

        Ext.applyIf(me, {
            border: 0, layout: {type: "vbox", align: "stretch"},
            cls: 'rawDataView', bodyPadding: '20 10 20 10',
            fieldDefaults: {labelAlign: 'right', labelWidth: 220, msgTarget: 'side', emptyText: "Not specified"},
            items: [
                {xtype: 'label', itemId: "mainTitle", html: '<p class="form_title">Step information</p>'},
                {xtype: 'label', html: '<h1 class="form_subtitle">Raw data details</h1>'},
                {xtype: 'container', cls: 'fieldBox', layout: {align: 'stretch', type: 'vbox'},
                    items: [
                        {xtype: 'label', html: '<h2>General details</h2>'},
                        {xtype: 'fieldcontainer', fieldLabel: "Step ID", name: 'step_id', itemId: 'idField', layout: {type: 'hbox', align: 'stretch'},
                            items: [
                                {xtype: 'displayfield', name: 'step_id',
                                    renderer: function (value) {
                                        if (value.indexOf("STxxxx") !== -1) {
                                            return '<span style="color:gray;">[Autogenerated after saving]</span>';
                                        } else {
                                            return value;
                                        }
                                    }
                                },
                                {xtype: 'box', hidden: true, itemId: 'warningTip', cls: "warningTip", html: '<p>Step imported</p>', margin: '0 0 0 10'}
                            ]
                        },
                        {xtype: 'ElementSelectorField', name: "analyticalReplicate_id", itemId: 'analyticalReplicateField',
                            margins: '0 0 5 0', fieldLabel: "Analytical Sample", writable: false,
                            buttonsText: ["Show Analytical sample details", "Browse Analytical Sample"],
                            buttonActions: [me.elementSelectorFieldSearchButtonClicked, me.elementSelectorFieldInspectButtonClicked],
                            scope: me
                        },
                        {xtype: 'textfield', fieldLabel: 'Step Name', name: 'step_name', itemId: 'stepNameField', maxLength: 90, allowBlank: false, enforceMaxLength: true},
                        {xtype: "FileLocationSelectorField", name: 'files_location', itemId: 'fileLocationField', allowBlank: false},
                        {xtype: 'datefield', itemId: 'submission_date', fieldLabel: 'Submission date', name: 'submission_date', maxWidth: 350, allowBlank: false, format: 'Y/m/d'},
                        {xtype: 'datefield', itemId: 'last_edition_date', fieldLabel: 'Last edition date', name: 'last_edition_date', maxWidth: 350, allowBlank: false, format: 'Y/m/d'},
                        {xtype: 'UserListTextField', name: 'step_owners', itemId: 'step_owners', fieldLabel: 'Owners',
                            layout: {type: 'hbox', align: 'stretch'},
                            store: Ext.create('Ext.data.ArrayStore', {fields: ['value'], data: []}),
                            valueField: 'value', displayField: 'value', allowBlank: false, minHeight: 30
                        },
                        {xtype: 'combobox', itemId: 'raw_data_type_chooser', fieldLabel: 'Technology', name: 'raw_data_type', cls: 'combobox',
                            displayField: 'label', valueField: 'value', allowBlank: false, forceSelection: true, maxWidth: 500, margin: "10 0 10 0",
                            store: Ext.create('Ext.data.ArrayStore',
                                    {fields: ['label', 'value'],
                                        data: [
                                            ['ChIP-seq', 'ChIP-seq'], ['DNase-seq', 'DNase-seq'], ['Methyl-seq', 'Methyl-seq'],
                                            ['mRNA-seq', 'mRNA-seq'], ['small RNA-seq', 'smallRNA-seq'], ['GC-MS', 'GC-MS'],
                                            ['LC-MS', 'LC-MS'], ['CE-MS', 'CE-MS'], ['Mass Spectrometry', 'MassSpectrometry'],
                                            ['Nuclear Magnetic Resonance', 'NuclearMagneticResonance'],
                                        ]
                                    }),
                            listeners: {change: {fn: me.extractionMethodTypeComboboxChange, scope: me}}
                        },
                    ]
                },
                {xtype: 'container', layout: 'hbox', items: [
                        {xtype: 'label', html: '<h1  class="form_subtitle">Quality report</h1>'},
                        {xtype: 'checkbox', boxLabel: 'Show', checked: true, margin: '12 0 0 10', cls: "showHideCheckbox", itemId: 'showQualityReportCheck',
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
                        console.info("RAWDataView : Layout");
                },
                beforedestroy: function () {
                    me.getModel().deleteObserver(me);
                }
            }
        });

        me.callParent(arguments);
    }
});