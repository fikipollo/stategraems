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
 * - ExperimentView
 * - ExperimentListView
 * - ExperimentDetailsView
 * 
 */
Ext.define('SL.view.ExperimentView', {
    requires: ['SL.model.Experiment'],
    mixins: {
        //Extends the Observer class
        View: 'SL.view.senchaExtensions.View',
        //Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer',
        //Extends the Command class
        Command: 'SL.view.senchaExtensions.Command'
    }
});

Ext.define('SL.view.ExperimentListView', {
    extend: 'SL.view.senchaExtensions.ElementListSelector',
    alias: 'widget.ExperimentListView',
    mixins: {ExperimentView: "SL.view.ExperimentView"},
    itemId: "experimentBrowsePanel",
    title: "Experiment browser",
    name: "ExperimentListView",
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getSelectedExperiments: function () {
        return this.getSelectedData();
    },
    getSelectedExperimentsIDs: function () {
        var selectedExperiments = this.getSelectedData();
        var selectedExperimentsIDs = [];
        for (var i = 0; i < selectedExperiments.length; i++) {
            selectedExperimentsIDs.push(selectedExperiments[i].experiment_id);
        }
        return selectedExperimentsIDs;
    },
    /**BC*********************************************************************************
     * 
     * SOME EVENTS
     * 
     **EC*********************************************************************************/
    gridpanelDblClickHandler: function (grid, record) {
        this.up('ExperimentListView').getController().showExperimentDetailsHandler(record.getID());
    },
    setLoading: function (loading) {
        this.down('grid').setLoading(loading);
        if (loading === true) {
            Ext.suspendLayouts();
        } else {
            Ext.resumeLayouts(true);
        }
    },
    updateContent: function () {
        this.getController().loadAllExperimentsHandler(this);
    },
    /**BC****************************************************************************************
     * 
     * COMPONENT DEFINITION
     * 
     **EC***************************************************************************/
    initComponent: function () {
        var me = this;

        this.setController(application.getController("ExperimentController"));

        Ext.apply(me, {
            border: true, region: 'center', closable: true,
            store: Ext.create('Ext.data.Store', {model: "SL.model.Experiment"}),
            fieldsNames: [['Experiment ID', "experiment_id"], ['Title', "title"], ['Abstract', "experiment_description"]],
            columnsWidth: [-1, -1, 0],
            allowMultiselect: false,
            groupRows: false,
            gridPlugins: [{
                    ptype: 'rowexpander',
                    rowBodyTpl: [
                        '<p><b>Title:</b> {title}</p>',
                        '<p><b>Experiment id:</b> {experiment_id}</p>',
                        '<p><b>Abstract:</b> {experiment_description}</p>',
                    ]
                }],
            listeners: {
                boxready: function () {
                    this.updateContent();
                }
            }
        });

        me.callParent(arguments);

        me.setPanelOptions([
            {xtype: 'button', text: '<i class="fa fa-plus-circle"></i> Annotate new experiment', cls: "button", action: "newBioCondition", margin: '0 5 0 0', scope: me,
                handler: function () {
                    this.getController().newExperimentButtonHandler(this);
                }
            },
            {xtype: 'button', text: '<i class="fa fa-search"></i> Inspect selected', cls: "button", scope: me,
                handler: function () {
                    var selectedItem = this.getSelectedExperimentsIDs();
                    if (selectedItem.length > 0) {
                        this.getController().showExperimentDetailsHandler(selectedItem);
                    }
                }
            },
            {xtype: 'button', text: '<i class="fa fa-share"></i> Switch to selected experiment', cls: "acceptButton", scope: me,
                handler: function () {
                    var selectedItem = this.getSelectedExperiments();
                    if (selectedItem.length > 0) {
                        this.getController().changeCurrentExperiment(selectedItem[0].experiment_id, selectedItem[0].title);
                    }
                }
            },
        ]);

    }
});

Ext.define('SL.view.ExperimentDetailsView', {
    extend: 'Ext.container.Container',
    mixins: {ExperimentView: "SL.view.ExperimentView"},
    alias: 'widget.ExperimentDetailsView',
    name: "ExperimentDetailsView",
    inEditionMode: false,
    /**BC****************************************************************************      
     * This function load a given BioCondition MODEL into the current VIEW 
     *  
     * @param  model, the BioCondition model
     * @return      
     **EC****************************************************************************/
    loadModel: function (model) {
        //Hide the panel temporaly to avoid problems with layout
        this.setLoading(true);

        if (this.getModel() != null) {
            this.model.deleteObserver(this);
            this.clearTaskQueue();
        }

        this.model = model;

        //1. Load all BioCondition fields in the formulary
        this.queryById('experimentFieldsPanel').loadRecord(model);

        var measurementsFields = this.queryById('measurementsField').query('checkboxfield');

        //TODO CAMBIAR ESTO
        var fieldName;
        for (var i in measurementsFields) {
            if (measurementsFields[i].name.match(/^expected/)) {
                fieldName = measurementsFields[i].name.replace("expected", "contains");
                measurementsFields[i].setValue(model.get(fieldName) > 1);
            } else if (measurementsFields[i].name.match(/^done/)) {
                fieldName = measurementsFields[i].name.replace("done", "contains");
                measurementsFields[i].setValue(model.get(fieldName) % 2 === 1);
            }
        }

        //3. Add a User for each bioreplicate owner (property hasMany in model) 
        var owners = model.getOwners();
        var experimentOwnersField = this.queryById("experiment_owners");
        experimentOwnersField.removeAllUsers();
        for (var i in owners) {
            experimentOwnersField.addUser(owners[i].getID());
        }
        var members = model.getMembers();
        var experiment_members = this.queryById("experiment_members");
        experiment_members.removeAllUsers();
        for (var i in members) {
            experiment_members.addUser(members[i].getID());
        }
        //Show again the panel (or not)
        this.setLoading(false);
    },
    /********************************************************************************      
     * This function returns the associated EXPERIMENT MODEL showed into the current VIEW 
     *  
     * @return model a EXPERIMENT model      
     ********************************************************************************/
    getModel: function () {
        return this.model;
    },
    updateObserver: function () {
        this.loadModel(this.getModel());
    },
    /**BC***************************************************************************      
     * 
     * GETTERS AND SETTERS
     * 
     **EC*****************************************************************************/
    getExperimentID: function () {
        return this.getID();
    },
    isInEditionMode: function () {
        return this.inEditionMode;
    },
    getID: function () {
        return this.queryById('idField').getValue();
    },
    getTitle: function () {
        return this.queryById('titleField').getValue();
    },
    getDescription: function () {
        return this.queryById('descriptionField').getValue();
    },
    getPublicReferences: function () {
        return this.queryById('publicReferencesField').getValue();
    },
    isTimeCourseType: function () {
        return this.queryById('isTimeCourseTypeField').getValue();
    },
    isCaseControlType: function () {
        return this.queryById('isCaseControlTypeField').getValue();
    },
    isSurvivalType: function () {
        return this.queryById('isSurvivalTypeField').getValue();
    },
    isSingleCondition: function () {
        return this.queryById('isSingleConditionField').getValue();
    },
    isMultipleCondition: function () {
        return this.queryById('isMultipleConditionField').getValue();
    },
    isOtherType: function () {
        return this.queryById('isOtherTypeField').getValue();
    },
    getContainsChipSeq: function () {
        var expected = (this.queryById('expected_chipseq').getValue() ? 2 : 0);
        var done = (this.queryById('done_chipseq').getValue() ? 1 : 0);
        return expected + done;
    },
    getContainsDNaseSeq: function () {
        var expected = (this.queryById('expected_dnaseseq').getValue() ? 2 : 0);
        var done = (this.queryById('done_dnaseseq').getValue() ? 1 : 0);
        return expected + done;
    },
    getContainsMethylSeq: function () {
        var expected = (this.queryById('expected_methylseq').getValue() ? 2 : 0);
        var done = (this.queryById('done_methylseq').getValue() ? 1 : 0);
        return expected + done;
    },
    getContainsmRNASeq: function () {
        var expected = (this.queryById('expected_mrnaseq').getValue() ? 2 : 0);
        var done = (this.queryById('done_mrnaseq').getValue() ? 1 : 0);
        return expected + done;
    },
    getContainsSmallRNASeq: function () {
        var expected = (this.queryById('expected_mirnaseq').getValue() ? 2 : 0);
        var done = (this.queryById('done_mirnaseq').getValue() ? 1 : 0);
        return expected + done;
    },
    getContainsMetabolomics: function () {
        var expected = (this.queryById('expected_metabolomics').getValue() ? 2 : 0);
        var done = (this.queryById('done_metabolomics').getValue() ? 1 : 0);
        return expected + done;
    },
    getContainsProteomics: function () {
        var expected = (this.queryById('expected_proteomics').getValue() ? 2 : 0);
        var done = (this.queryById('done_proteomics').getValue() ? 1 : 0);
        return expected + done;
    },
    getContainsOther: function () {
        return this.queryById('contains_other').getValue();
    },
    getOwners: function () {
        return this.queryById("experiment_owners").getAllInsertedUsers();
    },
    getMembers: function () {
        return this.queryById("experiment_members").getAllInsertedUsers();
    },
    getSubmissionDate: function () {
        return this.queryById("submission_date").getValue();
    },
    getLastEditionDate: function () {
        return this.queryById("last_edition_date").getValue();
    },
    getExperimentDataDirectory: function () {
        return this.queryById("experimentDataDirectoryField").getValue();
    },
    /**BC****************************************************************************      
     * Due to the View can be used to Inspect/Edit/Create models, we need 
     * this function to custom the panel depending on the situation (set the buttons's 
     * visibility, the editable_mode of the formulary’s fields...
     *  
     * @param   mode, an option in ["edition", "creation", "inspect"]
     * @return      
     **EC****************************************************************************/
    setViewMode: function (mode) {
        this.setLoading(true);

        var buttons_status = "10001";
        var panel_title = "Experiment details";
        var editable_mode = false;
        switch (mode)
        {
            //EDITION
            case "edition":
                buttons_status = "00011";
                panel_title = "Experiment edition.";
                //The first task we should do is to liberate the blocked object
                //in case of error during insertion, we should close the panel and the object 
                //must be liberated (if not, an exception may caused that the object wasn't liberated)
                this.addNewTask("clear_blocked_status", null);
                editable_mode = true;
                break;

                //CREATION    
            case "creation":
                buttons_status = "00011";
                panel_title = "Experiment creation.";
                editable_mode = true;
                //THE QUEUE OF TASKS THAT SHOULD BE CARRIED OUT WHEN PRESSING "ACCEPT" BUTTON
                this.addNewTask("create_new_experiment", null);
                break;

                //INSPECT    
            case "inspect":
                buttons_status = "10001";
                panel_title = "Experiment inspect.";
                editable_mode = false;
                break;
            default:
                break;
        }
        //REMOVE mainView CONTENT (IF EXISTS) AND ADD THE NEW PANEL
        application.mainView.setButtonsStatus(buttons_status);

        this.setEditableMode(editable_mode);
        this.inEditionMode = (mode === "edition");
        this.inCreationMode = (mode === "creation");

        if (mode === "edition") {
            this.queryById('submission_date').setReadOnly(true);
            this.queryById('last_edition_date').setReadOnly(true);
            this.queryById('last_edition_date').setValue(new Date());
        }
        this.queryById("switchExperimentButton").setVisible(!editable_mode);

        //Show again the panel (or not)
        this.setLoading(false);
    },
    /**BC****************************************************************************      
     * This function changes the Editable mode setting of all formulary fields and all 
     * the inner panels.
     *  
     * @param  mode, a boolean value where true means "Editable mode ON"
     * @return      
     **EC****************************************************************************/
    setEditableMode: function (mode) {
        this.setVisible(false);
        var elements = this.query("field");
        for (var i in elements) {
            elements[i].setReadOnly(!mode)
        }
        this.queryById("experiment_owners").setEditable(mode);
        this.queryById("experiment_members").setEditable(mode);
        this.setVisible(true);
    },
    validateContent: function () {
        //TODO: MEJORAR
        //Check if the information in the form is valid
        var form = this.queryById('experimentFieldsPanel').getForm();
        // make sure the form contains valid data before submitting
        return form.isValid();
    },
    setLoading: function (loading) {
        Ext.getCmp('mainViewCenterPanel').setLoading(loading);
        if (loading === true) {
            Ext.suspendLayouts();
        } else {
            Ext.resumeLayouts(true);
        }
    },
    /******************************************************************************************
     * 
     * SOME EVENTS HANDLERS
     * 
     ******************************************************************************************/

    /******************************************************************************************
     * 
     * COMPONENTS DECLARATION
     * 
     ******************************************************************************************/
    initComponent: function () {
        var me = this;

        this.setController(application.getController("ExperimentController"));

        Ext.applyIf(me, {
            border: 0, layout: {type: "vbox", align: 'center'}, defaults: {width: "85%"}, autoScroll: true,
            cls: 'experimentView', bodyPadding: '20 10 20 10',
            items: [
                {xtype: 'form', itemId: 'experimentFieldsPanel',
                    border: 0, layout: "anchor", defaults: {anchor: '100%'},
                    fieldDefaults: {labelAlign: 'right', labelWidth: 200, msgTarget: 'side', emptyText: "Not specified"},
                    items: [
                        {xtype: 'container', layout: 'hbox', items: [
                                {xtype: 'label', html: '<p class="form_title">Experiment Form</p>', flex: 1},
                                {xtype: 'button', cls: "acceptButton", itemId: 'switchExperimentButton', text: '<i class="fa fa-share"></i>  Switch to this experiment', scope: me,
                                    handler: function () {
                                        me.getController().changeCurrentExperimentHandler(me);
                                    }
                                }
                            ]},
                        {xtype: 'label', html: '<h1 class="form_subtitle">Experiment</h1>'},
                        {xtype: 'label', html: '<h2>General details</h2>'},
                        {
                            xtype: 'container', cls: 'fieldBox',
                            layout: {align: 'stretch', type: 'vbox'},
                            items: [
                                {xtype: 'displayfield', itemId: 'idField', margin: '0 0 20 0', fieldLabel: 'Experiment ID', name: 'experiment_id',
                                    renderer: function (value) {
                                        if (value.length === 0) {
                                            return '<span style="color:gray;">[Autogenerated after saving]</span>';
                                        } else
                                            return value;
                                    }
                                },
                                {xtype: 'textfield', itemId: 'titleField', fieldLabel: 'Title', name: 'title', maxLength: 200, allowBlank: false, enforceMaxLength: true},
                                {xtype: 'textfield', itemId: 'experimentDataDirectoryField', fieldLabel: 'Data Directory', name: 'experimentDataDirectory'},
                                {xtype: 'textarea', itemId: 'descriptionField', minHeight: 150, flex: 1, fieldLabel: 'Description', name: 'experiment_description'},
                                {xtype: 'textarea', itemId: 'publicReferencesField', fieldLabel: 'Public references', name: 'public_references'},
                            ]
                        },
                        {xtype: 'label', html: '<h2>Design summary</h2>'},
                        {
                            xtype: 'container', layout: {type: "hbox", align: "stretchmax"}, margin: "0 0 30 0",
                            items: [
                                {
                                    xtype: "container", cls: 'fieldBox', name: 'type', padding: 10, margin: '0 10 0 0',
                                    defaultType: 'checkboxfield', flex: 1, fieldDefaults: {inputValue: true, style: {'font-size': "16px"}},
                                    layout: {type: 'vbox', align: "stretch"},
                                    items: [
                                        {xtype: "label", html: "<h3>Type</h3>"},
                                        {boxLabel: "Time course", itemId: 'isTimeCourseTypeField', name: "is_time_course_type", margin: '0 0 10 60'},
                                        {boxLabel: "Case - Control", itemId: 'isCaseControlTypeField', name: "is_case_control_type", margin: '0 0 10 60'},
                                        {boxLabel: "Survival", itemId: 'isSurvivalTypeField', name: "is_survival_type", margin: '0 0 10 60'},
                                        {boxLabel: "Single condition", itemId: 'isSingleConditionField', name: "is_single_condition", margin: '0 0 10 60'},
                                        {boxLabel: "Multiple conditions", itemId: 'isMultipleConditionField', name: "is_multiple_conditions", margin: '0 0 10 60'},
                                        {boxLabel: "Other", itemId: 'isOtherTypeField', name: "is_other_type", margin: '0 0 10 60'},
                                    ]
                                },
                                {
                                    xtype: "container", cls: 'fieldBox', name: 'replicates_no', padding: 10, margin: '0 10 0 10',
                                    defaultType: 'numberfield',
                                    flex: 1, fieldDefaults: {labelWidth: 160, labelAlign: "right"},
                                    layout: {type: 'vbox', align: "stretch"},
                                    items: [
                                        {xtype: "label", html: "<h3>Replicates</h3>"},
                                        {fieldLabel: "# Biological replicates", name: "biological_rep_no", hideTrigger: true, minValue: 0, value: 0, maxValue: 999, margin: '0 0 10 30'},
                                        {fieldLabel: "# Technical replicates", name: "technical_rep_no", hideTrigger: true, minValue: 0, value: 0, maxValue: 999, margin: '0 0 10 30'},
                                    ]

                                },
                                {
                                    xtype: "container", cls: 'fieldBox', name: 'measurements', padding: 10, margin: '0 10 0 0',
                                    itemId: "measurementsField",
                                    flex: 1,
                                    defaultType: 'checkboxfield',
                                    layout: {type: 'table', columns: 2, tableAttrs: {style: {textAlign: 'center'}}},
                                    defaults: {width: 80, labelWidth: 130},
                                    items: [
                                        {xtype: "label", html: "<h3>Measurements</h3>"}, {xtype: "label", text: ""},
                                        {xtype: "label", text: "Planned", margin: '0 0 10 142'}, {xtype: "label", text: "Done"},
                                        {fieldLabel: "ChIP-seq", labelAlign: "right", labelPad: 30, itemId: 'expected_chipseq', name: "expected_chipseq"}, {name: "done_chipseq", itemId: 'done_chipseq', inputValue: true},
                                        {fieldLabel: "DNase-seq", labelAlign: "right", labelPad: 30, itemId: 'expected_dnaseseq', name: "expected_dnaseseq"}, {name: "done_dnaseseq", itemId: 'done_dnaseseq', inputValue: true},
                                        {fieldLabel: "Methyl-seq", labelAlign: "right", labelPad: 30, itemId: 'expected_methylseq', name: "expected_methylseq"}, {name: "done_methylseq", itemId: 'done_methylseq', inputValue: true},
                                        {fieldLabel: "mRNA-seq", labelAlign: "right", labelPad: 30, itemId: 'expected_mrnaseq', name: "expected_mrnaseq"}, {name: "done_mrnaseq", itemId: 'done_mrnaseq', inputValue: true},
                                        {fieldLabel: "smallRNA-seq", labelAlign: "right", labelPad: 30, itemId: 'expected_mirnaseq', name: "expected_mirnaseq"}, {name: "done_mirnaseq", itemId: 'done_mirnaseq', inputValue: true},
                                        {fieldLabel: "Metabolomics", labelAlign: "right", labelPad: 30, itemId: 'expected_metabolomics', name: "expected_metabolomics"}, {name: "done_metabolomics", itemId: 'done_metabolomics', inputValue: true},
                                        {fieldLabel: "Proteomics", labelAlign: "right", labelPad: 30, itemId: 'expected_proteomics', name: "expected_proteomics"}, {name: "done_proteomics", itemId: 'done_proteomics', inputValue: true},
                                        {fieldLabel: "Others", labelAlign: "right", labelPad: 30, itemId: 'contains_other', name: "contains_other"},
                                    ],
                                },
                            ]

                        },
                        {xtype: 'label', html: '<h2>Other details</h2>'},
                        {
                            xtype: 'container', cls: 'fieldBox', itemId: 'otherInformationPanel', layout: {align: 'stretch', type: 'vbox'},
                            items: [
                                {xtype: 'UserListTextField', itemId: 'experiment_owners', fieldLabel: 'Owners', name: 'experiment_owners',
                                    store: Ext.create('Ext.data.ArrayStore', {fields: ['value'], data: []}),
                                    valueField: 'value', displayField: 'value', allowBlank: false,
                                },
                                {xtype: 'UserListTextField', itemId: 'experiment_members', name: 'experiment_members',
                                    store: Ext.create('Ext.data.ArrayStore', {fields: ['value'], data: []}),
                                    valueField: 'value', displayField: 'value', allowBlank: true, fieldLabel: 'Members', minHeight: 30
                                },
                                {xtype: 'datefield', itemId: 'submission_date', fieldLabel: 'Submission date', name: 'submission_date',
                                    maxWidth: 320, value: '2013/03/26', allowBlank: false, format: 'Y/m/d', margin: '10 0 0 0',
                                },
                                {xtype: 'datefield', itemId: 'last_edition_date', fieldLabel: 'Last edition date', name: 'last_edition_date',
                                    maxWidth: 320, value: '2013/03/26', allowBlank: false, format: 'Y/m/d'
                                }
                            ]
                        }
                    ]}
            ],
            listeners: {
                boxready: function () {
                    showHelpTips(this);
                },
                afterlayout: function () {
                    //TODO: REMOVE THIS CODE
                    console.info("ExperimentDetailsView : Layout")
                },
                beforedestroy: function (item) {
                    me.getModel().deleteObserver(me);
                }
            }
        });

        me.callParent(arguments);
    }
});