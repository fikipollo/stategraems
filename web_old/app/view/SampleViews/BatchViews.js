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
 * - BatchViews
 * - BatchDetailsPanel
 * - BatchCreationWindow
 * - BatchSelectionWindow
 * 
 */
Ext.define('SL.view.SampleViews.BatchViews', {
    mixins: {
        //Extends the Observer class
        View: 'SL.view.senchaExtensions.View',
        //Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer',
        //Extends the Command class
        Command: 'SL.view.senchaExtensions.Command'
    }
});

Ext.define('SL.view.SampleViews.BatchDetailsPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.BatchDetailsPanel',
    mixins: {BatchViews: 'SL.view.SampleViews.BatchViews'},
    model: null,
    /**BC****************************************************************************      
     * This function load a given batch MODEL into the current VIEW
     *  
     * @param  model the batch  model
     * @return      
     **EC****************************************************************************/
    loadModel: function (model) {
        this.setLoading(true);
        this.model = model;
        //1. Load all BIOREPLICATE fields in the formulary
        this.loadRecord(model);
        if (model.getDescription().length > 200) {
            this.down('textareafield[name=description]').setHeight(200);
        }
        //2. Add a User for each owner
        var owners = model.getOwners();
        var nOwners = owners.length;
        var batchOwnersField = this.queryById("owners");
        for (var i = 0; i < nOwners; i++) {
            batchOwnersField.addUser(owners[i].getID());
        }
        if (this.hideCollapseOptions === true) {
            this.setCollapsibleMode(false);
        }
        this.setLoading(false);
    },
    /********************************************************************************      
     * This function returns the bioreplicate MODEL associated to the current VIEW
     *  
     * @return      
     ********************************************************************************/
    getModel: function () {
        return this.model;
    },
    updateObserver: function () {
        this.loadModel(this.getModel());
    },
    removeModel: function () {
        this.model = null;
        //1. Load all BIOREPLICATE fields in the formulary
        this.getForm().reset();
        this.collapse();
        this.queryById('showDetailsLink').setVisible(false);
    },
    getName: function () {
        return this.down('textfield[name=batch_name]').getValue();
    },
    getDescription: function () {
        return this.down('textareafield[name=description]').getValue();
    },
    getCreationDate: function () {
        return this.down('datefield[name=batch_creation_date]').getValue();
    },
    getOwners: function () {
        return this.down('UserListTextField').getAllUsers();
    },
    setID: function (batchId) {
        this.down('displayfield[name=batch_id]').setRawValue(batchId);
    },
    setCollapsibleMode: function (collapsible) {
        this.hideCollapseOptions = !collapsible;
        this.setLoading(true);
        if (collapsible === false) {
            this.queryById('batchDetails').setVisible(true);
            this.queryById('hideDetailsLink').setVisible(false);
        }
        this.queryById('showDetailsLink').setVisible(collapsible);
        this.setLoading(false);
    },
    collapse: function () {
        this.setLoading(true);
        this.queryById('showDetailsLink').setVisible(true);
        this.queryById('batchDetails').setVisible(false);
        this.queryById('hideDetailsLink').setVisible(false);
        this.setLoading(false);
    },
    display: function () {
        this.setLoading(true);
        this.queryById('showDetailsLink').setVisible(false);
        this.queryById('batchDetails').setVisible(true);
        this.queryById('hideDetailsLink').setVisible(true);
        this.setLoading(false);
    },
    /********************************************************************************      
     * This function changes the Editable mode of the inner panels.
     *  
     * @param  mode where TRUE means EDITABLE MODE ON
     * @return  
     ********************************************************************************/
    setEditableMode: function (mode) {
        this.setLoading(true);
        Ext.Array.each(this.query('component'), function (item) {
            if (item.setReadOnly) {
                item.setReadOnly(!mode)
            }
        });
        this.setLoading(false);
    },
    validateContent: function () {
//        //Check if the information in the form is valid
//        // make sure the form contains valid data before submitting
        return this.getForm().isValid();
    },
    setLoading: function (loading) {
        this.up().setLoading(loading);
        if (loading === true) {
            Ext.suspendLayouts();
        } else {
            Ext.resumeLayouts(true);
        }
    },
    initComponent: function () {
        var me = this;

        this.setController(application.getController("BatchController"));

        me.border = 0;
        Ext.applyIf(me, {
            layout: "anchor", border: 0, fieldDefaults: {labelAlign: 'right', labelWidth: 150, anchor: "100%"},
            items: [
                {xtype: 'textfield', fieldLabel: 'Batch name', name: 'batch_name', allowBlank: false, emptyText: 'Not specified'},
                {xtype: 'label', itemId: "showDetailsLink", html: '<a href="javascript:void(0)">Show details.</a>', hidden: false, margin: '0 0 0 155',
                    listeners: {
                        element: 'el',
                        click: function () {
                            var label = Ext.getCmp(this.id);
                            label.up("BatchDetailsPanel").display();
                        }
                    }
                },
                {xtype: 'container', itemId: "batchDetails", title: "Batch details", hidden: true,
                    border: 0, layout: {align: 'stretch', type: 'vbox'}, fieldDefaults: {labelAlign: 'right', labelWidth: 150},
                    items: [
                        {xtype: 'displayfield', fieldLabel: 'Batch ID', name: 'batch_id', renderer: function (v, c) {
                                if (v === "") {
                                    return '<span style="color:gray;">[Autogenerated after saving]</span>';
                                } else {
                                    return v;
                                }
                            }},
                        {xtype: 'datefield', maxWidth: 260, fieldLabel: 'Process date', name: 'batch_creation_date', format: 'Y/m/d'},
                        {xtype: 'textareafield', flex: 1, height: 100, fieldLabel: 'Process description', name: 'description'},
                        {
                            xtype: 'UserListTextField', name: 'owners', itemId: 'owners', fieldLabel: 'Owners',
                            store: Ext.create('Ext.data.ArrayStore', {fields: ['value'], data: []}),
                            valueField: 'value', displayField: 'value', allowBlank: false,
                        }
                    ]
                },
                {xtype: 'label', itemId: "hideDetailsLink", html: '<a href="javascript:void(0)">Hide details.</a>', margin: '0 0 0 135', hidden: true,
                    listeners: {
                        element: 'el',
                        click: function () {
                            var label = Ext.getCmp(this.id);
                            label.up("BatchDetailsPanel").collapse();
                        }
                    }
                }
            ],
            listeners: {
                beforedestroy: function () {
                    if (me.getModel() !== null) {
                        me.getModel().deleteObserver(me);
                    }
                },
                boxready: function () {
                    showHelpTips(this);
                },
                afterlayout: function () {
                    //TODO: REMOVE THIS CODE
                    if (debugging === true)
                        console.info("BatchDetailsPanel : Layout");
                }
            }
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.SampleViews.BatchCreationWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.BatchCreationWindow',
    title: 'New Experimental batch registration',
    mixins: {BatchViews: 'SL.view.SampleViews.BatchViews'},
    /**BC****************************************************************************
     **SETTERS AND GETTERS      *****************************************************
     **EC***************************************************************************/
    /**BC******************************************************************************      
     * This function load a given Batch MODEL into the current VIEW
     * @param  model, the batch model or an BATCH ID (then the BatchCOntroller should load the batch model.
     * @return      
     **EC*****************************************************************************/
    loadModel: function (model) {
        this.down('BatchDetailsPanel').loadModel(model);
        model.addObserver(this.down('BatchDetailsPanel'));
    },
    /**BC****************************************************************************
     * This function returns the bioreplicate MODEL associated to the current VIEW
     * @return the loaded model     
     **EC*****************************************************************************/
    getModel: function () {
        return this.down('BatchDetailsPanel').getModel();
    },
    getName: function () {
        return this.down('BatchDetailsPanel').getName();
    },
    getDescription: function () {
        return this.down('BatchDetailsPanel').getDescription();
    },
    getCreationDate: function () {
        return this.down('BatchDetailsPanel').getCreationDate();
    },
    getOwners: function () {
        return this.down('BatchDetailsPanel').getOwners();
    },
    setID: function (batchId) {
        this.down('BatchDetailsPanel').setID(batchId);
    },
    validateContent: function () {
        return this.down('BatchDetailsPanel').validateContent();
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
        var panel_title = "Experimental batch details";
        var editable_mode = false;
        this.viewMode = "inspect";
        switch (mode)
        {
            //EDITION
            case "edition":
                buttons_status = "011";
                panel_title = "Experimental batch edition";
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
                panel_title = "Experimental batch registration";
                editable_mode = true;

                //THE QUEUE OF TASKS THAT SHOULD BE CARRIED OUT WHEN PRESSING "ACCEPT" BUTTON
                this.addNewTask("create_new_batch", null);
                this.viewMode = "creation";
                break;

                //INSPECT    
            case "inspect":
                buttons_status = "101";
                panel_title = "Experimental batch details";
                editable_mode = false;
                this.viewMode = "inspect";
                break;
            default:
        }

        this.setButtonsStatus(buttons_status);
        this.down('BatchDetailsPanel').setCollapsibleMode(false);
        this.down('BatchDetailsPanel').down("textarea").flex = 1;
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
        this.queryById('cancelButton').setText((mode === true) ? '<i class="fa fa-remove"></i> Cancel' : '<i class="fa fa-remove"></i> Close')
        this.down('BatchDetailsPanel').setEditableMode(mode);
    },
    show: function (mode, _callbackFn) {
        this.setHeight(Ext.getBody().getViewSize().height * 0.7);
        this.setWidth(Ext.getBody().getViewSize().width * 0.6);

        this.setViewMode(mode);
        this.callBackFn = _callbackFn;
        this.callParent();
    },
    /**BC****************************************************************************
     **SOME EVENT HANDLERS      *****************************************************
     **EC***************************************************************************/
    onWindowBeforeClose: function (panel, eOpts) {
        this.callBackFn(this.refreshNeeded);
        return true;
    },
    initComponent: function () {
        var me = this;

        this.setController(application.getController("BatchController"));

        Ext.applyIf(me, {
            minHeight: 350, minWidth: 600, layout: {type: 'fit'}, closable: false, modal: true,
            items: [{xtype: 'BatchDetailsPanel', padding: '20 10 20 10', style: 'background:white', }],
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', itemId: 'acceptButton', scope: me, handler:
                            function () {
                                this.getController().createNewBatchAcceptButtonHandler(this);
                            }
                },
                {text: '<i class="fa fa-edit"></i> Edit', cls: 'editButton', itemId: 'editButton', scope: me, handler:
                            function () {
                                this.getController().editBatchButtonHandler(this);
                            }
                },
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
            listeners: {
                beforeclose: {
                    fn: me.onWindowBeforeClose,
                    scope: me
                },
                boxready: function () {
                    showHelpTips(this);
                }
            }
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.SampleViews.BatchSelectionWindow', {
    extend: 'Ext.window.Window',
    mixins: {BatchViews: 'SL.view.SampleViews.BatchViews'},
    alias: 'widget.BatchSelectionWindow',
    title: 'Please, choose an Experimental batch',
    /**BC****************************************************************************
     **SETTERS AND GETTERS      *****************************************************
     **EC***************************************************************************/
    /**
     * This function loads a list of Batch models in the grid panel
     * @param models the list of batch models
     */
    loadModels: function (models) {
        this.setLoading(true);
        var batchStore = this.queryById('batchList').down('grid').getStore();
        batchStore.removeAll();

        for (var i in models) {
            batchStore.add(models[i]);
        }
        this.setLoading(false);
    },
    /**
     * This function set the selected batch at the grid panel
     * @param _selectedBatch the selected batch
     */
    setSelectedBatch: function (_selectedBatch) {
        this.selectedBatch = _selectedBatch;
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
        this.callBackFn(this.selectedBatch);
        return true;
    },
    onCreateNewBatch: function () {
        this.getController().showCreateBatchWindowHandler(this);
    },
    onInspectSelectedBatch: function () {
        var selectedBatch = this.queryById('batchList').getSelectedBatch();
        if (selectedBatch.length < 1) {
            return;
        }
        selectedBatch = selectedBatch[0];
        this.getController().showBatchDetailsButtonHandler(selectedBatch, 'inspect');
    },
    onEditSelectedBatch: function () {
        var selectedBatch = this.queryById('batchList').getSelectedBatch();
        if (selectedBatch.length < 1) {
            return;
        }
        selectedBatch = selectedBatch[0];
        this.getController().showBatchDetailsButtonHandler(selectedBatch, 'edition');
    },
    onRemoveSelectedBatch: function () {
        var selectedBatch = this.queryById('batchList').getSelectedBatch();
        if (selectedBatch.length < 1) {
            return;
        }

        var me = this;

        var askToContinue = function (buttonId, text, opt) {
            if (buttonId === "yes") {
                selectedBatch = selectedBatch[0];
                me.getController().removeBatchHandler(me, selectedBatch);
            }
        };

        Ext.MessageBox.show({
            title: 'Remove the selected batch?',
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

        this.setController(application.getController("BatchController"));

        this.items = [];

        var newPanel = Ext.create('SL.view.senchaExtensions.ElementListSelector',
                {title: 'Choose a Batch process', itemId: "batchList",
                    store: Ext.create('Ext.data.Store', {model: "SL.model.SampleModels.Batch"}),
                    fieldsNames: [
                        ['Batch name', "batch_name"], ['Process date', "batch_creation_date"], ['Overview', "description"]
                    ],
                    columnsWidth: [-1, 150], allowMultiselect: false, groupRows: false,
                    gridPlugins: [{
                            ptype: 'rowexpander',
                            rowBodyTpl: ['<b>Batch overview</b></br>{description}</p>']
                        }],
                    getSelectedBatch: function () {
                        return this.getSelectedModels();
                    },
                    getSelectedBatchIDs: function () {
                        var selectedBioConditions = this.getSelectedData();
                        var selectedBioConditionsIDs = [];
                        for (var i = 0; i < selectedBioConditions.length; i++) {
                            selectedBioConditionsIDs.push(selectedBioConditions[i].biocondition_id);
                        }
                        return selectedBioConditionsIDs;
                    },
                    gridpanelDblClickHandler: function (grid, record) {
                        var nextButton = this.up('BatchSelectionWindow').queryById("acceptButton");
                        if (nextButton != null) {
                            nextButton.handler.call(nextButton);
                        }
                    }
                });

        me.items.push(newPanel);

        Ext.applyIf(me, {
            minHeight: 400, minWidth: 700, layout: 'fit', closable: false, modal: true,
            buttons: [
                {
                    text: '<i class="fa fa-check"></i> Use selected Experimental batch', itemId: "acceptButton", cls: 'acceptButton',
                    handler: function (button) {
                        var batchSelectionWindows = button.up('BatchSelectionWindow');
                        var selectedBatch = batchSelectionWindows.queryById('batchList').getSelectedBatch();
                        if (selectedBatch.length > 0) {
                            batchSelectionWindows.setSelectedBatch(selectedBatch);
                        } else {
                            batchSelectionWindows.setSelectedBatch(null);
                        }
                        batchSelectionWindows.close();
                    }
                },
                {
                    text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton',
                    handler: function (button) {
                        var batchSelectionWindows = button.up('BatchSelectionWindow');
                        batchSelectionWindows.close();
                    }
                }
            ],
            listeners: {
                boxready: function () {
                    this.getController().loadAllBatchesEventHandler(this);
                },
                beforeclose: {fn: me.onWindowBeforeClose, scope: me}
            }
        });

        me.callParent(arguments);

        newPanel.setPanelOptions([
            {xtype: 'button', text: '<i class="fa fa-plus-circle"></i> Register new Experimental batch', cls: "button", scope: me, handler: me.onCreateNewBatch},
            {xtype: 'button', text: '<i class="fa fa-search"></i> Inspect selected', cls: "button", scope: me, handler: me.onInspectSelectedBatch, margin: '0 5 0 0'},
            {xtype: 'button', text: '<i class="fa fa-edit"></i> Edit selected', cls: "editButton", scope: me, handler: me.onEditSelectedBatch},
            {xtype: 'button', text: '<i class="fa fa-trash"></i> Remove selected', cls: 'cancelButton', scope: me, handler: me.onRemoveSelectedBatch}
        ]);
    }
});