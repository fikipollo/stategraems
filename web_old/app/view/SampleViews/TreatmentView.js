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
 * - TreatmentView
 * - TreatmentCreationWindows
 * - TreatmentSelectionWindow
 * 
 */
Ext.define('SL.view.SampleViews.TreatmentView', {
    mixins: {
        //Extends the Observer class
        View: 'SL.view.senchaExtensions.View',
        //Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer',
        //Extends the Command class
        Command: 'SL.view.senchaExtensions.Command'
    }
});

Ext.define('SL.view.SampleViews.TreatmentCreationWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.TreatmentCreationWindows',
    mixins: {TreatmentView: 'SL.view.SampleViews.TreatmentView'},
    minHeight: 350, minWidth: 500,
    layout: {type: 'fit'}, closable: false, modal: true,
    title: 'Extraction protocol creation',
    /********************************************************************************      
     * This function load a given Batch MODEL into the current VIEW
     *  
     * @param  model, the batch model or an BATCH ID (then the BatchCOntroller should load
     *			the batch model.
     * @return      
     ********************************************************************************/
    loadModel: function (model) {
        if (typeof model == 'string' || model instanceof String) {
            this.getController().loadTreatmentModelHandler(this, model, null);
        } else {
            //1. Load all Treatment fields in the formulary
            var form = this.queryById('treatmentFields');
            form.loadRecord(model);

            if (model.get('hasSOPFile')) {
                //TODO: user id y sessio token ?
                this.queryById('fileDownloader').setValue('<a href="' + SERVER_URL + SERVER_PORT + SERVER_URL_GET_SOP_FILE + "?treatment_id=" + model.get('treatment_id') + '">' + model.get('treatment_id') + '_SOP.pdf</a>');
            }
            //3. Add a User for each owner
            var owners = model.getOwners();
            var nOwners = owners.length;
            var treatmentOwnersField = this.queryById("owners");
            for (var i = 0; i < nOwners; i++) {
                treatmentOwnersField.addUser(owners[i].getID());
            }
        }
    },
    /********************************************************************************      
     * This function returns the bioreplicate MODEL associated to the current VIEW
     *  
     * @return      
     ********************************************************************************/
    getModel: function () {
        var form = this.queryById('treatmentFields');
        form = form.getForm();
        return form.getRecord();
    },
    updateObserver: function () {
        this.loadModel(this.getModel());
    },
    getID: function () {
        this.queryById("treatment_id").getValue();
    },
    setID: function (treatment_id) {
        this.queryById("treatment_id").setRawValue(treatment_id);
    },
    getName: function () {
        return this.queryById("treatment_name").getValue();
    },
    setName: function (name) {
        this.queryById("treatment_name").setValue(name);
    },
    getDescription: function () {
        return this.queryById("description").getValue();
    },
    setDescription: function (description) {
        this.queryById("description").setValue(description);
    },
    getBiomolecule: function () {
        return this.queryById("biomolecule").getValue();
    },
    setBiomolecule: function (biomolecule) {
        this.queryById("biomolecule").setValue(biomolecule);
    },
    getOwners: function () {
        return this.down('UserListTextField').getAllUsers();
    },
    /********************************************************************************      
     * Due to the BatchCreationWindow can be used to Inspect/Edit/Create Batchs, we need 
     * this function to custom the panel depending on the situation (set the buttons's 
     * visibility, the editable_mode of the formulary’s fields...
     *  
     * @param   mode, an option in ["edition", "creation", "inspect"]
     * @return      
     ********************************************************************************/
    setViewMode: function (mode) {
        var buttons_status = "101";
        var panel_title = "Extraction protocol details";
        var editable_mode = false;
        this.viewMode = "inspect";
        switch (mode) {
            //EDITION
            case "edition":
                buttons_status = "011";
                panel_title = "Extraction protocol edition.";
                //The first task we should do is to liberate the blocked object
                //in case of error during insertion, we should close the panel and the object 
                //must be liberated (if not, an exception may caused that the object wasn't liberated)
                this.addNewTask("clear_blocked_status", null);
                editable_mode = true;
                this.viewMode = "edition";
                break;

                //CREATION    
            case "creation":
                buttons_status = "011";
                panel_title = "Extraction protocol creation.";
                editable_mode = true;

                //THE QUEUE OF TASKS THAT SHOULD BE CARRIED OUT WHEN PRESSING "ACCEPT" BUTTON
                this.addNewTask("create_new_treatment", null);
                this.viewMode = "creation";

                var treatment_owners = this.queryById("owners");
                treatment_owners.addUser(Ext.util.Cookies.get('loggedUser'));

                break;

                //INSPECT    
            case "inspect":
                buttons_status = "101";
                panel_title = "Extraction protocol details.";
                editable_mode = false;
                this.viewMode = "inspect";
                break;
            default:
        }

        this.setButtonsStatus(buttons_status);

        this.setTitle(panel_title);
        this.setEditableMode(editable_mode);
    },
    setButtonsStatus: function (status) {
        //SET THE VISIBILITY OF THE TOOLBAR BUTTONS USING A BINARY CODE
        //0 NOT VISIBLE, 1 VISIBLE.
        //EACH BINARY POSITION REFERS TO A BUTTON, IN ORDER: EDIT, BACK, NEXT, ACCEPT AND CANCEL BUTTONS.
        this.queryById('editButton').setVisible((status.charAt(0) === "1"));
        this.queryById('acceptButton').setVisible((status.charAt(1) === "1"));
        this.queryById('cancelButton').setVisible((status.charAt(2) === "1"));
    },
    setEditableMode: function (mode) {
        Ext.Array.each(this.queryById('treatmentFields').query('component'), function (item) {
            if (item.setReadOnly) {
                item.setReadOnly(!mode)
            }
        });
        this.queryById('fileLoader').setReadOnly(true);
        if (!mode) {
            this.queryById('fileLoader').setVisible(mode);
            this.queryById('fileDownloader').setVisible(!mode);
        }
    },
    setRefreshNeeded: function (_refreshNeeded) {
        this.refreshNeeded = _refreshNeeded;
    },
    show: function (mode, _callbackFn) {
        this.setViewMode(mode);
        this.setHeight(Ext.getBody().getViewSize().height * 0.7);
        this.setWidth(Ext.getBody().getViewSize().width * 0.6);
        this.callBackFn = _callbackFn;
        this.callParent();

        Ext.apply(Ext.form.VTypes, {
            pdf: function (v) {
                return /^.*\.(pdf)$/.test(v);
            },
            pdfText: 'Only pdf files supported'
        });
    },
    onWindowBeforeClose: function (panel, eOpts) {
        this.callBackFn(this.refreshNeeded);
        return true;
    },
    initComponent: function () {
        var me = this;

        this.setController(application.getController("TreatmentController"));

        Ext.applyIf(me, {
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', itemId: 'acceptButton', scope: me, handler: function () {
                        this.getController().createNewTreatmentAcceptButtonHandler(this);
                    }},
                {text: '<i class="fa fa-edit"></i> Edit', cls: 'editButton', itemId: 'editButton', scope: me, handler: function () {
                        this.getController().editTreatmentButtonHandler(this);
                    }},
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', itemId: 'cancelButton',
                    handler: function (button) {
                        if (me.viewMode !== "inspect") {
                            var askToContinue = function (buttonId, text, opt) {
                                if (buttonId === "yes") {
                                    me.refreshNeeded = false;
                                    me.close();
                                }
                            };

                            Ext.MessageBox.show({
                                title: 'Close without saving?',
                                msg: 'You are closing the dialog before save changes. <br/>Would you like to continue?',
                                buttons: Ext.MessageBox.YESNO,
                                fn: askToContinue,
                                icon: Ext.MessageBox.QUESTION
                            });
                        } else {
                            me.close();
                        }
                    }
                }
            ],
            items: [
                {xtype: 'form', itemId: 'treatmentFields',
                    layout: {align: 'stretch', type: 'vbox'}, bodyPadding: 10, fieldDefaults: {labelAlign: 'right', labelWidth: 120},
                    items: [
                        {xtype: 'displayfield', fieldLabel: 'Protocol ID', name: 'treatment_id', itemId: 'treatment_id',
                            renderer: function (value) {
                                if (value.length === 0) {
                                    return '<span style="color:gray;">[Autogenerated after saving]</span>';
                                } else
                                    return value;
                            }
                        },
                        {xtype: 'textfield', fieldLabel: 'Protocol name', name: 'treatment_name', itemId: 'treatment_name', allowBlank: false},
                        {xtype: 'textareafield', flex: 1, height: 100, fieldLabel: 'Short description', itemId: 'description', name: 'description'},
                        {xtype: 'textfield', fieldLabel: 'Extracted molecule', itemId: 'biomolecule', name: 'biomolecule'},
                        {xtype: 'filefield', itemId: 'fileLoader', fieldLabel: 'SOP document', name: 'SOP_document', emptyText: 'Select a file', vtype: 'pdf'},
                        {xtype: 'displayfield', hidden: true, itemId: 'fileDownloader', fieldLabel: 'SOP document', value: '<i style=\'color:#838383\'>Standard Operation Protocol file not found.</i>'},
                        {xtype: 'UserListTextField', name: 'owners', itemId: 'owners', fieldLabel: 'Owners',
                            store: Ext.create('Ext.data.ArrayStore', {fields: ['value'], data: []}),
                            valueField: 'value', displayField: 'value', allowBlank: false
                        }
                    ]
                }
            ],
            listeners: {
                beforeclose: {fn: me.onWindowBeforeClose, scope: me},
                boxready: function () {
                    showHelpTips(this);
                }
            }
        });

        me.callParent(arguments);
    }
});
Ext.define('SL.view.SampleViews.TreatmentSelectionCombobox', {
    extend: 'Ext.container.Container',
    mixins: {TreatmentView: 'SL.view.SampleViews.TreatmentView'},
    alias: 'widget.TreatmentSelectionCombobox',
    /**BC****************************************************************************
     **SETTERS AND GETTERS      *****************************************************
     **EC***************************************************************************/
    /**
     * This function loads a list of Batch models in the grid panel
     * @param models the list of batch models
     */
    loadModels: function (models) {
        this.setLoading(true);
        var treatmentStore = this.queryById("protocolsList").getStore();
        treatmentStore.removeAll();

        for (var i in models) {
            treatmentStore.add(models[i]);
        }
        this.setLoading(false);
    },
    setValue: function (treatmentId) {
        this.queryById("protocolsList").select(treatmentId[0].getID());
    },
    initComponent: function () {
        var me = this;

        this.setController(application.getController("TreatmentController"));
        Ext.apply(me, {
            layout: {type: 'vbox', align: "stretch"},
            items: [
                {xtype: "label", html: '<i style=" margin-bottom: 10px; color: #2D6486; "><i class="fa fa-info-circle"></i>Type your protocol name to start searching or use the trigger to show the whole list of protocols.</i>'},
                {xtype: "combobox",
                    fieldLabel: 'Protocol name', labelWidth: 150, itemId: "protocolsList", valueField: 'treatment_id', displayField: 'treatment_name',
                    style: 'margin-right:40px;', matchFieldWidth: false, pageSize: 20, queryMode: 'local', typeAhead: true,
                    allowBlank: false, forceSelection: true, maxLength: 200, enforceMaxLength: true,
                    store: Ext.create('Ext.data.Store', {model: "SL.model.SampleModels.Treatment", data: []}),
                    listConfig: {
                        loadingText: 'Searching...',
                        emptyText: 'No matching treatment found, click <a  href="javascript:void(0)" >here to register a new Protocol</a>',
                        // Custom rendering template for each item
                        getInnerTpl: function () {
                            return '<div style="width:400px;padding-right:17px; text-align:justify; border-top: solid 1px rgb(197, 191, 191);margin-bottom:5px">' +
                                    '<b>{treatment_id}</b></br>' +
                                    '<i>{treatment_name:ellipsis(150, true)}</i>' +
                                    '<p style="color: rgb(129, 129, 129);">Extracted biomolecule: {biomolecule:ellipsis(150, true)}</p>' +
                                    '<p style="color: rgb(129, 129, 129);">{description:ellipsis(300, true)}</p>' +
                                    '<a href="javascript:void(0)" id={treatment_id}>Show more</a></div>';
                        }
                    },
                    listeners: {
                        select: function (combo, selectedTreatment, index, eOpts) {
                            if (event !== undefined && event.target.nodeName === "A") {
                                var protocol = combo.getStore().getAt(combo.getStore().find("treatment_id", event.target.id));
                                if(protocol !== undefined){                                    
                                    me.getController().showTreatmentDetailsButtonHandler(protocol, "inspect");
                                }  
                            } 
                        },
                        change: function (combo, newValue, oldValue, eOpts) {
                                var protocol = this.getStore().getAt(this.getStore().find("treatment_id", newValue));
                                if(protocol !== undefined){                                    
                                    me.queryById("protocolOverviewField").setValue(protocol.getDescription() == "" ? "Not specified" : protocol.getDescription());
                                }
                        }
                    }
                },
                {xtype: 'textarea', itemId: "protocolOverviewField", labelWidth: 150, fieldLabel: 'Protocol overview', readOnly: true},
                {xtype: "container", layout: 'hbox',
                    items: [
                        {xtype: "label", html: "<p style='padding-top: 4px;margin: 0 10px 0 0;'>Can't find your protocol? Browse the complete list of protocols or add new elements.</p>"},
                        {xtype: 'button', text: '<i class="fa fa-plus-circle"></i> Add/Remove/Edit procotocols', scope: me, handler:
                                    function () {
                                        me.getController().showTreatmentListButtonClickHandler(me);
                                    }
                        }
                    ]
                },
            ],
            listeners: {
                boxready: function () {
                    me.getController().loadAllTreatmentsHandler(this);
                }
            }
        });

        me.callParent(arguments);
    }
});

Ext.define('SL.view.SampleViews.TreatmentSelectionWindow', {
    extend: 'Ext.window.Window',
    mixins: {TreatmentView: 'SL.view.SampleViews.TreatmentView'},
    alias: 'widget.TreatmentSelectionWindow',
    title: 'Extraction protocol selection',
    /**BC****************************************************************************
     **SETTERS AND GETTERS      *****************************************************
     **EC***************************************************************************/
    /**
     * This function loads a list of Batch models in the grid panel
     * @param models the list of batch models
     */
    loadModels: function (models) {
        this.setLoading(true);
        var treatmentStore = this.queryById('treatmentList').down('grid').getStore();
        treatmentStore.removeAll();

        for (var i in models) {
            treatmentStore.add(models[i]);
        }
        this.setLoading(false);
    },
    /**
     * This function set the selected batch at the grid panel
     * @param _selectedTreatment the selected batch
     */
    setSelectedTreatment: function (_selectedTreatment) {
        this.selectedTreatment = _selectedTreatment;
    },
    /**
     * This function overrides the "show" function of the Window
     * class saving a given callback function that will be executed
     * before close the window.
     * 
     * @param _callbackFn the function that will be executed before close.
     */
    show: function (_callbackFn) {
        this.callBackFn = _callbackFn;
        this.setHeight(Ext.getBody().getViewSize().height * 0.7);
        this.setWidth(Ext.getBody().getViewSize().width * 0.6);
        this.callParent();
    },
    /**BC****************************************************************************
     **SOME EVENT HANDLERS      *****************************************************
     **EC***************************************************************************/
    onWindowBeforeClose: function (panel, eOpts) {
        this.callBackFn();
        return true;
    },
    onCreateNewTreatment: function () {
        this.getController().showCreateTreatmentWindowHandler(this);
    },
    onInspectSelectedTreatment: function () {
        var selectedTreatment = this.queryById('treatmentList').getSelectedTreatment();
        if (selectedTreatment.length < 1) {
            return;
        }
        selectedTreatment = selectedTreatment[0];
        this.getController().showTreatmentDetailsButtonHandler(selectedTreatment, "inspect");
    },
    onEditSelectedTreatment: function () {
        var selectedTreatment = this.queryById('treatmentList').getSelectedTreatment();
        if (selectedTreatment.length < 1) {
            return;
        }
        selectedTreatment = selectedTreatment[0];
        this.getController().showTreatmentDetailsButtonHandler(selectedTreatment, "edition");
    },
    onRemoveSelectedTreatment: function () {
        var selectedTreatment = this.queryById('treatmentList').getSelectedTreatment();
        if (selectedTreatment.length < 1) {
            return;
        }
        var me = this;
        var askToContinue = function (buttonId, text, opt) {
            if (buttonId === "yes") {
                selectedTreatment = selectedTreatment[0];
                me.getController().removeTreatmentHandler(me, selectedTreatment);
            }
        };

        Ext.MessageBox.show({
            title: 'Remove the selected protocol?',
            msg: 'This action can not be undone.<br/>Would you like to continue?',
            buttons: Ext.MessageBox.YESNO,
            fn: askToContinue,
            icon: Ext.MessageBox.QUESTION
        });
    },
    /**BC****************************************************************************
     **COMPONENT DEFINITION     *****************************************************
     **EC***************************************************************************/
    initComponent: function () {
        var me = this;

        this.setController(application.getController("TreatmentController"));

        this.items = [];

        var newPanel = Ext.create('SL.view.senchaExtensions.ElementListSelector',
                {title: 'Choose a Extraction protocol', itemId: "treatmentList",
                    store: Ext.create('Ext.data.Store', {model: "SL.model.SampleModels.Treatment", data: []}),
                    fieldsNames: [
                        ['Protocol name', "treatment_name"], ['Extracted Biomolecule', "biomolecule"], ['Overview', "description"]
                    ],
                    columnsWidth: [-1, 150], allowMultiselect: false, groupRows: false,
                    gridPlugins: [{
                            ptype: 'rowexpander',
                            rowBodyTpl: ['<b>Protocol overview</b></br>{description}</p>']
                        }],
                    getSelectedTreatment: function () {
                        return this.getSelectedModels();
                    },
                    getSelectedTreatmentIds: function () {
                        var selectedTreatments = this.getSelectedData();
                        var selectedTreatmentsIDs = [];
                        for (var i = 0; i < selectedTreatments.length; i++) {
                            selectedTreatmentsIDs.push(selectedTreatments[i].treatment_id);
                        }
                        return selectedTreatmentsIDs;
                    },
                    gridpanelDblClickHandler: function (grid, record) {
                        var acceptButton = this.up('TreatmentSelectionWindow').queryById("acceptButton");
                        if (acceptButton != null) {
                            acceptButton.handler.call(acceptButton.scope);
                        }
                    }
                });

        me.items.push(newPanel);

        Ext.applyIf(me, {
            minHeight: 400, minWidth: 700, layout: 'fit', closable: false, modal: true,
            buttons: [
                {text: '<i class="fa fa-check"></i> Use selected Treatment', itemId: "acceptButton", cls: 'acceptButton',
                    scope: me, handler: function (button) {
                        var selectedTreatment = this.queryById('treatmentList').getSelectedTreatment();

                        if (selectedTreatment.length > 0) {
                            this.parent.setValue(selectedTreatment);
                        }
                        this.close();
                    }
                },
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton',
                    handler: function (button) {
                        var treatmentSelectionWindow = button.up('TreatmentSelectionWindow');
                        treatmentSelectionWindow.close();
                    }
                }
            ],
            listeners: {
                boxready: function () {
                    me.getController().loadAllTreatmentsHandler(me);
                },
                beforeclose: {fn: me.onWindowBeforeClose, scope: me}
            }
        });

        me.callParent(arguments);

        newPanel.setPanelOptions([
            {xtype: 'button', text: '<i class="fa fa-plus-circle"></i> Register new Extraction protocol', cls: "button", scope: me, handler: me.onCreateNewTreatment},
            {xtype: 'button', text: '<i class="fa fa-search"></i> Inspect selected', cls: "button", scope: me, handler: me.onInspectSelectedTreatment, margin: '0 5 0 0'},
            {xtype: 'button', text: '<i class="fa fa-edit"></i> Edit selected', cls: "editButton", itemId: "editButton", scope: me, handler: me.onEditSelectedTreatment},
            {xtype: 'button', text: '<i class="fa fa-trash"></i> Remove selected', cls: 'cancelButton', scope: me, handler: me.onRemoveSelectedTreatment}
        ]);
    }
});
