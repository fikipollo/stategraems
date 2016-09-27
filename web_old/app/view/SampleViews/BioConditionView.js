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
 * - BioConditionView
 * - BioConditionListView
 * - BioConditionDetailsView
 * 
 */
Ext.define('SL.view.SampleViews.BioConditionView', {
    requires: ['SL.model.SampleModels.BioCondition'],
    mixins: {
        //Extends the Observer class
        View: 'SL.view.senchaExtensions.View',
        //Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer',
        //Extends the Command class
        Command: 'SL.view.senchaExtensions.Command'
    }
});

Ext.define('SL.view.SampleViews.BioConditionListView', {
    extend: 'SL.view.senchaExtensions.ElementListSelector',
    alias: 'widget.BioConditionListView',
    itemId: "bioconditionBrowsePanel",
    mixins: {BioConditionView: "SL.view.SampleViews.BioConditionView"},
    name: "BioConditionListView",
    title: "Biological samples browser",
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/

    getSelectedBioConditions: function () {
        return this.getSelectedData();
    },
    getSelectedBioConditionsIDs: function () {
        var selectedBioConditions = this.getSelectedData();
        var selectedBioConditionsIDs = [];
        for (var i = 0; i < selectedBioConditions.length; i++) {
            selectedBioConditionsIDs.push(selectedBioConditions[i].biocondition_id);
        }
        return selectedBioConditionsIDs;
    },
    /**BC*********************************************************************************
     * 
     * SOME EVENTS
     * 
     **EC*********************************************************************************/
    gridpanelDblClickHandler: function (grid, record) {
        this.up('BioConditionListView').getController().showBioConditionDetailsHandler(record.get('biocondition_id'));
    },
    newBioConditionButtonHandler: function () {
        this.getController().newBioConditionButtonHandler();
    },
    onInspectSelectedBioConditionClick: function () {
        var selectedItem = this.getSelectedBioConditionsIDs();
        if (selectedItem.length > 0) {
            this.getController().showBioConditionDetailsHandler(selectedItem[0]);
        }
    },
    onCopySelectedBioConditionClick: function () {
        var selectedItem = this.getSelectedBioConditionsIDs();
        if (selectedItem.length > 0) {
            this.getController().copySelectedBioConditionHandler(selectedItem[0]);
        }
    },
    onRemoveSelectedBioConditionClick: function () {
        var me = this;
        var askToContinue = function (buttonId, text, opt) {
            if (buttonId === "yes") {
                var selectedItem = me.getSelectedBioConditionsIDs();
                if (selectedItem.length > 0) {
                    me.getController().removeSelectedBioConditionHandler(selectedItem[0]);
                }
            }
        };
        Ext.MessageBox.show({
            title: 'Remove selected Biological Condition?',
            msg: 'This will delete the Biological Condition and all its asssociated information (Biological replicates, Analytical samples...). <br/>Would you like to continue?<br/><i>Note that only owners for a Biological condition can delete it.</i>',
            buttons: Ext.MessageBox.YESNO,
            fn: askToContinue,
            icon: Ext.MessageBox.QUESTION
        });

    },
    sendBioConditionsTemplateButtonHandler: function () {
        this.getController().sendBioConditionsTemplateButtonHandler(this);
    },
    setLoading: function (loading) {
        Ext.getCmp('mainViewCenterPanel').setLoading(loading);
        if (loading === true) {
            Ext.suspendLayouts();
        } else {
            Ext.resumeLayouts(true);
        }
    },
    updateContent: function () {
        this.getController().loadAllBioConditionsHandler(this);
    },
    /**BC**************************************************************************
     * 
     * COMPONENT DEFINITION
     * 
     **EC***************************************************************************/
    initComponent: function () {
        var me = this;

        this.setController(application.getController("BioConditionController"));

        Ext.apply(me, {
            store: Ext.create('Ext.data.Store', {model: "SL.model.SampleModels.BioCondition"}),
            fieldsNames: [
                ['Name', "name"], ['Organism', "organism"],
                ['BioCondition id', "biocondition_id"],
                ["Title", "title"], ['Cell type', "cell_type"],
                ['Tissue type', "tissue_type"], ['Cell line', "cell_line"],
                ['Genotype/Variation', "genotype"], ["Conditions", "conditions"],
                ["Time", "time"]
            ],
            columnsWidth: [-1, -1, 0],
            allowMultiselect: false,
            groupRows: false,
            gridPlugins: [{
                    ptype: 'rowexpander',
                    rowBodyTpl: [
                        '<p><b>Title:</b> {title}</p>',
                        '<p><b>BioCondition id:</b> {biocondition_id}</p>',
                        '<p><b>Conditions:</b> {conditions}, <b>Time:</b> {time}</p>',
                        '<p><b>Cell type:</b> {cell_type}, <b>Tissue type:</b> {tissue_type}</p>',
                        '<p><b>Cell line:</b> {cell_line}, <b>Genotype/Variation:</b> {genotype}</p>'
                    ]
                }],
            listeners: {
                boxready: function () {
                    if (Ext.util.Cookies.get('currentExperimentID') === "Not selected" || Ext.util.Cookies.get('currentExperimentID') == "undefined") {
                        showErrorMessage("No experiment selected.\nPlease switch to an existing experiment or create a new one before continue.", {soft: true});
                        application.mainView.changeMainView("HomePanel");
                        return;
                    }
                }
            }
        });

        me.callParent(arguments);

        me.setPanelOptions([
//            'Biological condition tools: ',
            {xtype: 'button', cls: "button", text: '<i class="fa fa-search"></i> Inspect selected', scope: me, handler: me.onInspectSelectedBioConditionClick},
            {xtype: 'button', text: '<i class="fa fa-plus-circle"></i> Add new Biological Condition', cls: "button", scope: me, handler: me.newBioConditionButtonHandler},
            {xtype: 'button', text: '<i class="fa fa-file-excel-o"></i> Add using XLS template', cls: "button", scope: me, handler: me.sendBioConditionsTemplateButtonHandler},
            {xtype: 'button', text: '<i class="fa  fa-copy"></i> Copy selected', cls: "button", scope: me, handler: me.onCopySelectedBioConditionClick},
            {xtype: 'button', text: '<i class="fa fa-remove"></i> Remove selected', cls: "cancelButton", scope: me, handler: me.onRemoveSelectedBioConditionClick},
        ]);

    }
});

Ext.define('SL.view.SampleViews.BioConditionDetailsView', {
    extend: 'Ext.container.Container',
    mixins: {BioConditionView: "SL.view.SampleViews.BioConditionView"},
    alias: 'widget.BioConditionDetailsView',
    requires: ["SL.view.SampleViews.BioReplicateView", 'SL.view.UserViews.UserView'],
    inEditionMode: false,
    name: "BioConditionDetailsView",
    /********************************************************************************      
     * This function load a given BioCondition MODEL into the current VIEW 
     *  
     * @param  model, the BioCondition model
     * @return      
     ********************************************************************************/
    loadModel: function (model) {
        this.setLoading(true);

        if (this.getModel() != null) {
            this.model.deleteObserver(this);
            this.clearTaskQueue();
        }

        this.model = model;

        this.queryById("showAssociatedBioRepsPanelCheck").setValue(false);

        //1. Load all BioCondition fields in the formulary
        var form = this.queryById('bioconditionFieldsPanel');
        form.loadRecord(model);

        if (model.get('hasTreatmentDocument')) {
            this.queryById('treatment_document_downloader').setValue('<a href="' + SERVER_URL + SERVER_PORT + SERVER_URL_GET_TREATMENT_DOCUMENT + "?biocondition_id=" + model.get('biocondition_id') + '">' + model.get('biocondition_id') + '_treatment.pdf</a>');
        }

        //2. Add a BioReplicateView for each associated bioreplicate
        this.updateBioReplicateViews();

        //3. Add a User for each bioreplicate owner (property hasMany in model) 
        var owners = model.getOwners();
        var bioconditionOwnersField = this.queryById("biocondition_owners");
        bioconditionOwnersField.removeAllUsers();
        for (var i in owners) {
            bioconditionOwnersField.addUser(owners[i].getID());
        }
        this.setLoading(false);
    },
    /********************************************************************************      
     * This function returns the associated BioCondition MODEL showed into the current VIEW 
     *  
     * @return a BioCondition model      
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
        return this.queryById('idField').getValue();
    },
    getName: function () {
        return this.queryById('nameField').getValue();
    },
    getTitle: function () {
        return this.queryById('titleField').getValue();
    },
    getOrganism: function () {
        return this.queryById('organismField').getValue();
    },
    getTissue: function () {
        return this.queryById('tissueField').getValue();
    },
    getCellType: function () {
        return this.queryById('cellTypeField').getValue();
    },
    getCellLine: function () {
        return this.queryById('cellLineField').getValue();
    },
    getGender: function () {
        return this.queryById('genderField').getValue();
    },
    getGenotype: function () {
        return this.queryById('genotypeField').getValue();
    },
    getOtherBiomaterial: function () {
        return this.queryById('otherBiomaterialField').getValue();
    },
    getTreatment: function () {
        return this.queryById('treatmentField').getValue();
    },
    getDose: function () {
        return this.queryById('doseField').getValue();
    },
    getTime: function () {
        return this.queryById('timeField').getValue();
    },
    getOtherExperimentalConditions: function () {
        return this.queryById('otherExperimentalConditionsField').getValue();
    },
    getProtocolDescription: function () {
        return this.queryById('protocolDescriptionField').getValue();
    },
    getOwners: function () {
        return this.queryById("biocondition_owners").getAllInsertedUsers();
    },
    getSubmissionDate: function () {
        return this.queryById("submission_date").getValue();
    },
    getLastEditionDate: function () {
        return this.queryById("last_edition_date").getValue();
    },
    getExternalLinks: function () {
        return this.queryById("externalLinksField").getValue();
    },
    /********************************************************************************      
     * Due to the BioConditionDetailsView can be used to Inspect/Edit/Create BioConditions, we need 
     * this function to custom the panel depending on the situation (set the buttons's 
     * visibility, the editable_mode of the formulary’s fields...
     *  
     * @param   mode, an option in ["edition", "creation", "inspect"]
     * @return      
     ********************************************************************************/
    setViewMode: function (mode) {
        this.setLoading(true);
        var buttons_status = "10001";
        var editable_mode = false;

        switch (mode) {
            //EDITION
            case "edition":
                buttons_status = "00011";
                //The first task we should do is to liberate the blocked object
                //in case of error during insertion, we should close the panel and the object 
                //must be liberated (if not, an exception may caused that the object wasn't liberated)
                this.addNewTask("clear_blocked_status", null);
                editable_mode = true;
                break;

                //CREATION    
            case "creation":
                buttons_status = "00011";
                editable_mode = true;
                //THE QUEUE OF TASKS THAT SHOULD BE CARRIED OUT WHEN PRESSING "ACCEPT" BUTTON
                this.addNewTask("create_new_biocondition", null);
                break;

                //INSPECT    
            case "inspect":
                buttons_status = "10001";
                editable_mode = false;
                break;

            default:
                break;
        }

        //TODO
//        if (this.parent === documentInfoPanel)
//            documentInfoPanel.setButtonsStatus(buttons_status);
        application.mainView.setButtonsStatus(buttons_status);
        this.inEditionMode = (mode === "edition");
        this.inCreationMode = (mode === "creation");

        this.setEditableMode(editable_mode);

        if (mode === "edition") {
            this.queryById('submission_date').setReadOnly(true);
            this.queryById('last_edition_date').setReadOnly(true);
            this.queryById('last_edition_date').setValue(new Date());
        }

        this.setLoading(false);

    },
    /********************************************************************************      
     * This function changes the Editable mode setting of all formulary fields and all 
     * the inner panels.
     *  
     * @param  mode a boolean value where true means "Editable mode ON"
     * @return      
     ********************************************************************************/
    setEditableMode: function (mode) {
        var currentPanel = this.queryById("bioconditionFieldsPanel");

        var elements = currentPanel.query("textfield");
        for (var i in elements) {
            elements[i].setReadOnly(!mode);
        }

        currentPanel.queryById('treatment_document_loader').setVisible(mode);
        currentPanel.queryById('treatment_document_loader').setReadOnly(true);
        currentPanel.queryById('treatment_document_downloader').setVisible(!mode);

        this.queryById("associatedBioRepTools").setVisible(mode);
        //Set the editable mode for each Bioreplicate view
        elements = this.query('BioReplicateView');
        for (var i in elements) {
            elements[i].setEditingMode(mode);
        }

        this.queryById("biocondition_owners").setEditable(mode);
    },
    validateContent: function () {
        //TODO: MEJORAR
        //Check if the information in the form is valid
        var form = this.queryById('bioconditionFieldsPanel').getForm();
        // make sure the form contains valid data before submitting
        return form.isValid();
    },
    updateBioReplicateViews: function () {
        this.setUpdateNeededWorkflowPanel(true);
        if (this.queryById("showAssociatedBioRepsPanelCheck").getValue() !== true) {
            return;
        }

        //Get all the bioreplicates models
        var bioreplicates = this.getModel().getBioReplicates();
        var associatedBioRepsPanel = this.queryById("associatedBioRepsPanel");

        //Clean the panel
        associatedBioRepsPanel.removeAll();
        //Add a new BIOREPLICATEVIEW for each model
        var newPanel;
        for (var i in bioreplicates) {
            newPanel = Ext.create('SL.view.SampleViews.BioReplicateView', {itemId: "bioreplicateView-" + bioreplicates[i].getID().replace(".", ""), margin: '0 0 30 0'});
            newPanel.loadModel(bioreplicates[i]);
            //TODO: MOVE THIS CODE TO CONTROLLER?
            bioreplicates[i].addObserver(newPanel);
            newPanel.setEditableMode(false);
            newPanel.setEditingMode(this.inEditionMode === true || this.inCreationMode === true);
            associatedBioRepsPanel.add(newPanel);
        }
    },
    setLoading: function (loading) {
        Ext.getCmp('mainViewCenterPanel').setLoading(loading);
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
    updateWorkflowPanel: function (force) {
        force = (force === undefined) ? false : force;
        var component = this.queryById("samplesWorkflowPanel");
        if (component.updateNeeded === true || force === true) {
            component.setLoading(true);
            var json_data = this.getModel().getJSONforGraph();
            this.cytoscape_graph = configureCytoscapeSamplesGraph(component, 'cytoscapeweb_biocondition', json_data);
            component.setHeight(json_data[json_data.length - 1].pos[1] * 1.5);
            component.setLoading(false);
            component.updateNeeded = false;
        }
    },
    setUpdateNeededWorkflowPanel: function (updateNeeded) {
        var component = this.queryById("samplesWorkflowPanel");
        component.updateNeeded = updateNeeded;
    },
    /******************************************************************************************
     * 
     * SOME EVENTS HANDLERS
     * 
     ******************************************************************************************/
    onTreatment_document_loaderChange: function () {
        this.addNewTask('send_treatment_document', null);
    },
    onWorkflowPanelResize: function () {
        try {
            this.cytoscape_graph.resize();
            this.cytoscape_graph.fit();
        } catch (error) {
        }
    },
    onInspectSelectedNodeHandler: function (clickedNodeData) {
        var bioconditionView = this.up('BioConditionDetailsView');

        if (clickedNodeData.type === "biocondition") {
            return;
        } else if (clickedNodeData.type === "batch") {
            //TODO: SHOW INFO OF THE BATCH
            return;
        } else if (clickedNodeData.type === "protocol") {
            //TODO: SHOW INFO OF THE PROTOCOL
            return;
        } else {
            //GET THE BIOREPLICATE ID
            var nodeId = clickedNodeData.id;
            if (clickedNodeData.type === "analyticalsample") {
                nodeId = "BR" + nodeId.substring(2, nodeId.lastIndexOf("."));
            }
            var bioreplicateModel = bioconditionView.getModel().findBioReplicateByID(nodeId);
            if (bioreplicateModel !== null) {
                application.getController("BioReplicateController").showBioreplicateDetailsWindowHandler(bioconditionView, bioreplicateModel);
            }
        }
    },
    onEditSelectedNodeButtonHandler: function (editButton) {
        var bioconditionView = editButton.up('BioConditionDetailsView');
        var selectedNode = bioconditionView.cytoscape_graph.selected();
        if (selectedNode.length > 0) {
            selectedNode = selectedNode[0];
            bioconditionView.onEditSelectedNodeHandler(selectedNode.data());
        }else{
            showWarningMessage("Please, choose first an item at the diagram.")
        }
    },
    onCopySelectedNodeButtonHandler: function (editButton) {
        var bioconditionView = editButton.up('BioConditionDetailsView');
        var selectedNode = bioconditionView.cytoscape_graph.selected();
        if (selectedNode.length > 0) {
            selectedNode = selectedNode[0];
            bioconditionView.onCopySelectedNodeHandler(selectedNode.data());
        }else{
            showWarningMessage("Please, choose first an item at the diagram.")
        }
    },
    onCopySelectedNodeHandler: function (clickedNodeData) {
        var bioconditionView = this.up('BioConditionDetailsView');
        if (bioconditionView === undefined) {
            bioconditionView = this;
        }

        if (bioconditionView.inEditionMode === true || bioconditionView.inCreationMode === true) {
            if (clickedNodeData.type !== "bioreplicate") {
                return;
            }
            //GET THE BIOREPLICATE ID
            var nodeId = clickedNodeData.id;
            var bioreplicateModel = bioconditionView.getModel().findBioReplicateByID(nodeId);
            if (bioreplicateModel !== null) {
                application.getController("BioReplicateController").showBioreplicateCopyWindowHandler(bioconditionView, bioreplicateModel);
            }
        } else {
            showWarningMessage("Please, activate Edition mode first.", {soft: true, delay: 600});
        }
    },
    onEditSelectedNodeHandler: function (clickedNodeData) {
        var bioconditionView = this.up('BioConditionDetailsView');
        if (bioconditionView === undefined) {
            bioconditionView = this;
        }

        if (bioconditionView.inEditionMode === true || bioconditionView.inCreationMode === true) {
            if (clickedNodeData.type === "biocondition") {
                return;
            } else if (clickedNodeData.type === "batch") {
                return;
            } else if (clickedNodeData.type === "protocol") {
                return;
            } else {
                //GET THE BIOREPLICATE ID
                var nodeId = clickedNodeData.id;
                if (clickedNodeData.type === "analyticalsample") {
                    nodeId = "BR" + nodeId.substring(0, nodeId.lastIndexOf("-"));
                }
                var bioreplicateModel = bioconditionView.getModel().findBioReplicateByID(nodeId);
                if (bioreplicateModel !== null) {
                    application.getController("BioReplicateController").showBioreplicateEditionWindowHandler(bioconditionView, bioreplicateModel);
                }
            }
        } else {
            showWarningMessage("Please, activate Edition mode first.", {soft: true, delay: 600});
        }
    },
    onRemoveSelectedNodeButtonHandler: function (editButton) {
        var bioconditionView = editButton.up('BioConditionDetailsView');
        var selectedNode = bioconditionView.cytoscape_graph.selected();
        if (selectedNode.length > 0) {
            selectedNode = selectedNode[0];
            bioconditionView.onRemoveSelectedNodeHandler(selectedNode.data());
        }else{
            showWarningMessage("Please, choose first an item at the diagram.")
        }
    },
    onRemoveSelectedNodeHandler: function (clickedNodeData) {
        var bioconditionView = this.up('BioConditionDetailsView');
        if (bioconditionView === undefined) {
            bioconditionView = this;
        }
        if (bioconditionView.inEditionMode === true || bioconditionView.inCreationMode === true) {
            if (clickedNodeData.type === "biocondition") {
                showWarningMessage("Element not removable.", {soft: true, delay: 600})
            } else if (clickedNodeData.type === "batch") {
                showWarningMessage("Element not removable.\nUse Bioreplicate edition for deassociate the selected batch.", {soft: true, delay: 600})
            } else if (clickedNodeData.type === "protocol") {
                showWarningMessage("Element not removable.\nRemove Analytical samples for deassociate the selected protocol.", {soft: true, delay: 600})
            } else if (clickedNodeData.type === "analyticalsample") {
                var bioreplicateID = clickedNodeData.parent.substring(0, clickedNodeData.parent.lastIndexOf("-"));
                var bioreplicateModel = bioconditionView.getModel().findBioReplicateByID(bioreplicateID);
                if (bioreplicateModel !== null) {
                    var onSuccessAction = function () {
                        application.getController("BioReplicateController").showAnalyticalSampleDeletionDialogHandler(bioconditionView, bioreplicateModel, null, clickedNodeData.id);
                    };

                    bioconditionView.getController().checkRemovableInstance(clickedNodeData.id, "analytical_sample", onSuccessAction);
                }
            } else {
                var bioreplicateModel = bioconditionView.getModel().findBioReplicateByID(clickedNodeData.id);
                if (bioreplicateModel !== null) {
                    var onSuccessAction = function () {
                        bioconditionView.getController().showBioreplicateDeletionDialogHandler(bioconditionView, bioreplicateModel);
                    };

                    bioconditionView.getController().checkRemovableInstance(clickedNodeData.id, "bioreplicate", onSuccessAction);
                }
            }
        } else {
            showWarningMessage("Please, activate Edition mode first.", {soft: true, delay: 600})
        }
    },
    /******************************************************************************************
     * 
     * COMPONENTS DECLARATION
     * 
     ******************************************************************************************/
    initComponent: function () {
        var me = this;

        this.setController(application.getController("BioConditionController"));

        Ext.applyIf(me, {
            border: false, layout: {type: "vbox", align: 'center'}, defaults: {width: "85%"}, autoScroll: true,
            cls: 'bioconditionView', bodyPadding: '20 10 20 10',
            items: [
                {xtype: 'form',
                    itemId: 'bioconditionFieldsPanel',
                    border: 0, layout: "anchor", defaults: {anchor: '100%'},
                    fieldDefaults: {labelAlign: 'right', labelWidth: 200, msgTarget: 'side', emptyText: "Not specified"},
                    items: [
                        {xtype: 'container', layout: 'hbox', items: [
                                {xtype: 'label', html: '<p class="form_title">Sample Form</p>', flex: 1},
                                {xtype: 'button', cls: 'button', text: '<i class="fa fa-search"></i> Go to biological replicates', maxWidth: 250, handler: function () {
                                        this.up('BioConditionDetailsView').queryById('samplesWorkflowPanelWrapper').focus();
                                    }
                                },
                            ]},
                        {xtype: 'label', html: '<h1 class="form_subtitle">Biological condition</h1>'},
                        {xtype: 'container', cls: 'fieldBox',
                            layout: {align: 'stretch', type: 'vbox'},
                            items: [{xtype: 'label', html: '<h2>General details</h2>'},
                                {xtype: 'displayfield', itemId: 'idField', margin: '0 0 20 0', fieldLabel: 'Biological condition ID', name: 'biocondition_id',
                                    renderer: function (value) {
                                        if (value.length === 0 || value == "BCxxxxx") {
                                            return '<span style="color:gray;">[Autogenerated after saving]</span>';
                                        } else
                                            return value;
                                    }
                                },
                                {xtype: 'textfield', fieldLabel: 'Name', name: 'name', allowBlank: false, itemId: 'nameField', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', fieldLabel: 'Title', name: 'title', itemId: 'titleField', maxLength: 200, enforceMaxLength: true},
                            ]
                        },
                        {xtype: 'container', cls: 'fieldBox',
                            layout: {align: 'stretch', type: 'vbox'},
                            items: [
                                {xtype: 'label', html: '<h2>Biomaterial</h2>'},
                                {xtype: 'combobox',
                                    fieldLabel: 'Organism', name: 'organism', itemId: 'organismField', valueField: 'organism',
                                    allowBlank: false, emptyText: 'Select or type an organism...',
                                    displayField: 'organism',
                                    queryMode: 'local', maxLength: 200, enforceMaxLength: true, typeAhead: true,
                                    store: Ext.create('Ext.data.ArrayStore', {
                                        fields: ['organism'],
                                        autoLoad: true,
                                        proxy: {type: 'ajax', url: 'data/organisms.json', reader: {type: 'json', root: 'organisms', successProperty: 'success'}}
                                    })
                                },
                                {xtype: 'textfield', fieldLabel: 'Tissue/Organ', name: 'tissue_type', itemId: 'tissueField', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', flex: 1, fieldLabel: 'Cell type', name: 'cell_type', itemId: 'cellTypeField', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'combobox',
                                    flex: 1, fieldLabel: 'Cell line', name: 'cell_line', itemId: 'cellLineField',
                                    emptyText: 'Select or type an cell line...', pageSize: 10, queryMode: 'local', typeAhead: true,
                                    valueField: 'cell_line', displayField: 'cell_line', maxLength: 200, enforceMaxLength: true,
                                    store: Ext.create('Ext.data.ArrayStore', {
                                        fields: ['cell_line', "description", "lineage", "tissue", "karyotype"],
                                        autoLoad: true,
                                        proxy: {type: 'ajax', url: 'data/cell_lines.json', reader: {type: 'json', root: 'cell_lines', successProperty: 'success'}}
                                    }),
                                    listConfig: {
                                        loadingText: 'Searching...',
                                        emptyText: 'No matching cell lines found.',
                                        // Custom rendering template for each item
                                        getInnerTpl: function () {
                                            return '<div><b>{cell_line}</b></br><i style="color: rgb(129, 129, 129);">{lineage}, {tissue}, {karyotype}</i><p style="color: rgb(129, 129, 129);">{description}</p></div>';
                                        }
                                    }
                                },
                                {xtype: 'textfield', flex: 1, fieldLabel: 'Gender', name: 'gender', itemId: 'genderField', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', flex: 1, fieldLabel: 'Genotype/Variation', name: 'genotype', itemId: 'genotypeField', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textareafield', flex: 1, height: 100, fieldLabel: 'Other', name: 'other_biomaterial', itemId: 'otherBiomaterialField'}
                            ]
                        },
                        {xtype: 'container', itemId: 'expConditionsPanel',
                            layout: {align: 'stretch', type: 'vbox'}, cls: 'fieldBox',
                            items: [
                                {xtype: 'label', html: '<h2>Experimental conditions</h2>'},
                                {xtype: 'textfield', fieldLabel: 'Treatment', name: 'treatment', itemId: 'treatmentField', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textfield', fieldLabel: 'Dose', name: 'dose', itemId: 'doseField', maxLength: 100, enforceMaxLength: true},
                                {xtype: 'textfield', fieldLabel: 'Time', name: 'time', itemId: 'timeField', maxLength: 200, enforceMaxLength: true},
                                {xtype: 'textareafield', flex: 1, height: 100, itemId: 'otherExperimentalConditionsField', fieldLabel: 'Other', name: 'other_exp_cond'},
                                {xtype: 'textareafield', height: 100, fieldLabel: 'Protocol Description', name: 'protocol_description', itemId: 'protocolDescriptionField', },
                                {xtype: 'filefield', itemId: 'treatment_document_loader', fieldLabel: 'Treatment Document', cls: "filefield",
                                    name: 'treatment_document', submitValue: false, maxWidth: 500, vtype: 'pdf',
                                    listeners: {change: {fn: me.onTreatment_document_loaderChange, scope: me}}
                                },
                                {xtype: 'displayfield', itemId: 'treatment_document_downloader', fieldLabel: 'Treatment Document',
                                    name: 'treatment_document',
                                    flex: 1, hidden: true,
                                    value: '<i style=\'color:#838383\'>Treatment description document not found.</i>'
                                }
                            ]
                        },
                        {xtype: 'container', itemId: 'otherInformationPanel',
                            layout: {align: 'stretch', type: 'vbox'}, cls: 'fieldBox',
                            items: [
                                {xtype: 'label', html: '<h2>Other details</h2>'},
                                {xtype: 'UserListTextField', itemId: 'biocondition_owners', fieldLabel: 'Owners', name: 'owners',
                                    store: Ext.create('Ext.data.ArrayStore', {fields: ['value'], data: []}),
                                    valueField: 'value', displayField: 'value', allowBlank: false,
                                },
                                {xtype: 'datefield', itemId: 'submission_date', fieldLabel: 'Submission date', name: 'submission_date',
                                    maxWidth: 320, allowBlank: false, format: 'Y/m/d'
                                },
                                {xtype: 'datefield', itemId: 'last_edition_date', fieldLabel: 'Last edition date', name: 'last_edition_date',
                                    maxWidth: 320, allowBlank: false, format: 'Y/m/d'
                                },
                                {xtype: 'textareafield', fieldLabel: 'External links', name: 'external_links', itemId: 'externalLinksField'},
                            ]
                        },
                    ],
                },
                {xtype: 'label', html: '<h1 class="form_subtitle">Biological replicates</h1>'},
                {xtype: 'toolbar', dock: 'top', itemId: 'associatedBioRepTools', margin: '0 0 10 0', border: false,
                    items: [
                        '<h2 class="form_subtitle" >Biological Replicates options:<h2>',
                        {xtype: 'button', text: '<i class="fa fa-plus-circle"></i> Add new Biological Replicate', cls: 'button', itemId: 'addNewBioreplicateButton', scope: me,
                            handler: function () {
                                application.getController("BioReplicateController").addNewBioreplicateButtonClickHandler(this);
                            }},
                        {xtype: 'button', text: '<i class="fa fa-copy"></i> Copy selected Biological Replicate', cls: 'button', handler: me.onCopySelectedNodeButtonHandler},
                        {xtype: 'button', text: '<i class="fa fa-edit"></i> Edit selected node', cls: 'editButton', handler: me.onEditSelectedNodeButtonHandler},
                        {xtype: 'button', text: '<i class="fa fa-remove"></i> Remove selected node', cls: 'cancelButton', handler: me.onRemoveSelectedNodeButtonHandler},
                    ]
                },
                {xtype: 'container', itemId: 'samplesWorkflowPanelWrapper', layout: {align: 'stretch', type: 'vbox'}, cls: 'fieldBox', padding: 5,
                    items: [
                        {xtype: 'container', layout: 'hbox', items: [
                                {xtype: 'label', html: '<h2>Overview diagram for Samples</h2>'},
                                {xtype: 'checkbox', boxLabel: 'Show', checked: true, margin: '12 0 0 10',
                                    handler: function (checkbox, checked) {
                                        var component = this.up('BioConditionDetailsView').queryById('samplesWorkflowPanel');
                                        if (checked) {
                                            var parent = checkbox.up('container[itemId=samplesWorkflowPanelWrapper]');
                                            parent.setLoading(true);
                                            var task = new Ext.util.DelayedTask(function () {
                                                component.setVisible(checked);
                                                component.getEl().fadeIn();
                                                parent.setLoading(false);
                                            });
                                            task.delay(500);

                                        } else {
                                            component.getEl().fadeOut({callback: function () {
                                                    component.setVisible(checked);
                                                }});
                                        }
                                    }
                                }
                            ]},
                        {xtype: "box", html: '<i style="color: rgb(72, 130, 187); margin-left:10px;"><i class="fa fa-info-circle"></i> Use the right-click context menu over the diagram nodes to add, remove or edit elements.</i>'},
                        {xtype: 'panel', itemId: 'samplesWorkflowPanel', updateNeeded: true, minHeight: 350, resizable: true, resizeHandles: 'n,s', margin: '0 0 20 0', border: false,
                            html: '<div class="cytoscapewebPanel" id="cytoscapeweb_biocondition"></div><div id="note"></div>',
                            nodeClickHandler: function () {
                            },
                            inspectSelectedNodeHandler: me.onInspectSelectedNodeHandler,
                            editSelectedNodeHandler: me.onEditSelectedNodeHandler,
                            removeSelectedNodeHandler: me.onRemoveSelectedNodeHandler,
                            copySelectedNodeHandler: me.onCopySelectedNodeHandler,
                            listeners: {
                                resize: {fn: me.onWorkflowPanelResize, scope: me}
                            }
                        }
                    ]
                },
                {xtype: 'container', cls: 'fieldBox', itemId: 'associatedBioRepsPanelWrapper',
                    items: [
                        {xtype: 'container', layout: 'hbox', margin: '0 0 20 0', items: [
                                {xtype: 'label', html: '<h2>Biological replicates table</h2>'},
                                {xtype: 'checkbox', itemId: "showAssociatedBioRepsPanelCheck", boxLabel: 'Show', checked: false, margin: '12 0 0 10',
                                    handler: function (checkbox, checked) {
                                        var component = this.up('BioConditionDetailsView').queryById('associatedBioRepsPanel');
                                        var parent = checkbox.up('container[itemId=associatedBioRepsPanelWrapper]');
                                        if (checked) {
                                            parent.setLoading(true);

                                            me.updateBioReplicateViews();

                                            var task = new Ext.util.DelayedTask(function () {
                                                component.setVisible(checked);
                                                component.getEl().fadeIn();
                                                parent.setLoading(false);
                                            });
                                            task.delay(100);
                                        } else {
                                            parent.setLoading(true);
                                            component.getEl().fadeOut({callback: function () {
                                                    component.setVisible(checked);
                                                }});
                                            parent.setLoading(false);
                                        }
                                    }
                                },
                            ]},
                        {xtype: 'panel', hidden: true,
                            html: '<h2 style="font-size:20px; font-style:italic; color:#d6d6d6;text-align:center;padding-top:20px">No Biological replicates associated yet.</h2>',
                            itemId: 'associatedBioRepsPanel',
                            border: 0, defaults: {border: 0, }
                        }
                    ]
                },
            ],
            listeners: {
                boxready: function (item) {
                    showHelpTips(this);
                    Ext.apply(Ext.form.VTypes, {
                        pdf: function (v) {
                            return /^.*\.(pdf)$/.test(v);
                        },
                        pdfText: 'Only pdf files are supported'
                    });
                    //ADD THE EVENT FOR MOUSE WHEEL TO THE DIAGRAM PANEL (ONLY NEEDED FOR CHROME)
                    var component = this.queryById("samplesWorkflowPanelWrapper");
                    var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
                    if (isChrome) {
                        var bioconditionView = this;
                        var analysisWorkflowPanel = this.queryById('samplesWorkflowPanel');
                        analysisWorkflowPanel.getEl().on("mousewheel", function (e) {
                            bioconditionView.scrollBy(0, -e.browserEvent.wheelDeltaY, false);
                        });
                        console.info("Added event for mouse wheel handler.");
                    }
//                    this.updateWorkflowPanel();
                    this.getController().loadDependenciesRequiredHandler();
                },
                afterlayout: function () {
                    //TODO: REMOVE THIS CODE
                    if (debugging === true)
                        console.info("BioConditionDetailsView : Layout");
                },
                beforedestroy: function () {
                    me.getModel().deleteObserver(me);
                    //TODO: TIMERS??
                }
            }
        });

        me.callParent(arguments);
    }
});
 