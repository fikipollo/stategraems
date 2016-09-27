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
 * - UserView
 * - UserDetailsView
 * - UserListView
 * - UserListTextField
 * - UserSelectionWindow
 * - InfoLoginPanel
 * 
 */
Ext.define('SL.view.UserViews.UserView', {
    requires: ['SL.model.User'],
    mixins: {
        //Extends the View class
        View: 'SL.view.senchaExtensions.View',
        //Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer',
        //Extends the Command class
        Command: 'SL.view.senchaExtensions.Command'
    }
});

Ext.define('SL.view.UserViews.UserDetailsView', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.UserView',
    mixins: {UserView: "SL.view.UserViews.UserView"},
    title: 'User creation form',
    /********************************************************************************      
     * This function load a given User MODEL into the current VIEW 
     *  
     * @param  model, the user model
     * @return      
     ********************************************************************************/
    loadModel: function (model) {
        //1. Load all user fields in the formulary
        var form = this.queryById('userFields');
        form.loadRecord(model);
    },
    /********************************************************************************      
     * This function returns the associated USER MODEL showed into the current VIEW 
     *  
     * @return a User model      
     ********************************************************************************/
    getModel: function () {
        var form = this.queryById('userFields');
        form = form.getForm();
        return form.getRecord();
    },
    /********************************************************************************      
     * Due to the UserView can be used to Inspect/Edit/Create Users, we need 
     * this function to custom the panel depending on the situation (set the buttons's 
     * visibility, the editable_mode of the formulary’s fields...
     *  
     * @param   mode, an option in ["edition", "creation", "inspect"]
     * @return      
     ********************************************************************************/
    setViewMode: function (mode) {
        var panel_title = "My account";
        var editable_mode = false;
        switch (mode)
        {
            //EDITION
            case "edition":
                panel_title = "User edition.";
                //The first task we should do is to liberate the blocked object
                //in case of error during insertion, we should close the panel and the object 
                //must be liberated (if not, an exception may caused that the object wasn't liberated)
                //this.addNewTask("clear_blocked_status",null);
                editable_mode = true;
                this.addNewTask("edit_user", null);
                break;

                //CREATION    
            case "creation":
                panel_title = "User creation.";
                editable_mode = true;
                //THE QUEUE OF TASKS THAT SHOULD BE CARRIED OUT WHEN PRESSING "ACCEPT" BUTTON
                this.addNewTask("create_new_user", null);
                break;

                //INSPECT    
            case "inspect":
                panel_title = "My account";
                editable_mode = false;
                break;
            default:
        }

        this.setTitle(panel_title);
        this.setEditableMode(editable_mode);
        this.queryById('user_name_field').setReadOnly(mode !== "creation");
        this.queryById('edit_password_check').setVisible(mode === "edition");
        this.queryById('password_fields_container').setVisible(mode !== "inspect");
        this.queryById('password_fields_container').setDisabled(mode !== "creation");
    },
    /********************************************************************************      
     * This function changes the Editable mode setting of all formulary fields and all 
     * the inner panels.
     *  
     * @param  mode, a boolean value where true means "Editable mode ON"
     * @return      
     ********************************************************************************/
    setEditableMode: function (mode) {
        var currentPanel = this.queryById("userFields");
        var elements = currentPanel.query("textfield");
        for (var i in elements) {
            elements[i].setReadOnly(!mode);
        }
        this.queryById("password_fields_container").setVisible(mode);
    },
    getUserID: function () {
        return this.queryById('user_name_field').getValue();
    },
    initComponent: function () {
        var me = this;

        this.setController(application.getController("UserController"));

        Ext.applyIf(me, {
            layout: {type: 'fit'}, bodyPadding: 20,
            items: [
                {xtype: 'form', itemId: 'userFields',
                    border: 0, layout: {align: 'stretch', pack: 'center', type: 'vbox'}, bodyPadding: 5,
                    fieldDefaults: {labelAlign: 'right', labelWidth: 140, msgTarget: 'side', labelStyle: 'font-weight:bold; font-size: 14px'},
                    items: [
                        {xtype: 'textfield', itemId: 'user_name_field', fieldLabel: 'User name', name: 'user_id', allowBlank: false},
                        {xtype: 'textfield', fieldLabel: 'Email', name: 'email', allowBlank: false, vtype: 'email'},
                        {xtype: 'checkboxfield', itemId: 'edit_password_check',
                            fieldLabel: '', submitValue: false,
                            boxLabel: 'Change password',
                            handler: function (checkbox, checked) {
                                this.nextSibling('fieldcontainer').setDisabled(!checked);
                            }
                        },
                        {xtype: 'fieldcontainer', itemId: 'password_fields_container',
                            border: 0, disabled: true, hidden: true,
                            layout: {align: 'stretch', type: 'vbox'},
                            fieldDefaults: {labelAlign: 'right', labelWidth: 140, msgTarget: 'side', labelStyle: 'font-weight:bold; font-size: 14px'},
                            items: [
                                {xtype: 'textfield', itemId: 'password_field',
                                    fieldLabel: 'Password', name: 'password', inputType: 'password', allowBlank: false,
                                    validator: function (value) {
                                        if (this.isDisabled()) {
                                            return true;
                                        }
                                        if (this.up('form').queryById('password_field_repeat').getValue() == value) {
                                            return true
                                        } else {
                                            return "Passwords do not match!";
                                        }
                                    }
                                },
                                {xtype: 'textfield', itemId: 'password_field_repeat', fieldLabel: 'Repeat Password', submitValue: false,
                                    inputType: 'password', allowBlank: false,
                                    validator: function (value) {
                                        if (this.isDisabled()) {
                                            return true;
                                        }
                                        return this.previousSibling('textfield').validate();
                                    },
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }
});

Ext.define('SL.view.UserViews.UserListView', {
    extend: 'SL.view.senchaExtensions.ElementListSelector',
    alias: 'widget.UserListView',
    itemId: "userBrowsePanel",
    mixins: {UserView: "SL.view.UserViews.UserView"},
    name: "UserListView",
    title: 'Users browser',
    showLogginInfo: false, multiSelect: false, showOptions: false,
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    setMultiSelect: function (multiSelect) {
        this.multiSelect = multiSelect;
    },
    getMultiSelect: function () {
        return this.multiSelect;
    },
    setShowOptions: function (showOptions) {
        this.showOptions = showOptions;
    },
    getShowOptions: function () {
        return this.showOptions;
    },
    getSelectedUsers: function () {
        return this.getSelectedModels();
    },
    getSelectedUsersData: function () {
        return this.getSelectedData();
    },
    getSelectedUsersIDs: function () {
        var selectedUsers = this.getSelectedData();
        var selectedUsersIDs = [];
        for (var i = 0; i < selectedUsers.length; i++) {
            selectedUsersIDs.push(selectedUsers[i].user_id);
        }
        return selectedUsersIDs;
    },
    /**BC*********************************************************************************
     * 
     * SOME EVENTS
     * 
     **EC*********************************************************************************/
    gridpanelDblClickHandler: function (grid, record) {
    },
    newUserButtonHandler: function () {
        this.getController().newUserButtonHandler(this);
    },
    editUserButtonHandler: function () {
        this.getController().editUserButtonHandler(this);
    },
    removeUserButtonHandler: function () {
        var me = this;
        if (me.getSelectedUsers().length === 0) {
            return;
        }

        var askToContinue = function (buttonId) {
            if (buttonId === "yes") {
                me.getController().removeUserButtonHandler(me);
            }
        };
        Ext.MessageBox.show({
            title: 'Remove selected Biological Condition?',
            msg: 'This will delete the selected User. <br/>Would you like to continue?',
            buttons: Ext.MessageBox.YESNO,
            fn: askToContinue,
            icon: Ext.MessageBox.QUESTION
        });

    },
    updateContent: function () {
        this.getController().loadAllUsersHandler(this);
    },
    /**BC**************************************************************************
     * 
     * COMPONENT DEFINITION
     * 
     **EC***************************************************************************/
    initComponent: function () {
        var me = this;

        this.setController(application.getController("UserController"));
        var columns = [
            ['Name', "user_id"], ['Email', "email"]
        ];
        if (me.showLogginInfo !== false) {
            columns.push(['Online', 'loggedIn']);
        }

        Ext.apply(me, {
            store: Ext.create('Ext.data.Store', {model: "SL.model.User"}),
            fieldsNames: columns,
            columnsWidth: [-1, -1, (me.showLogginInfo === true) ? 60 : 0],
            allowMultiselect: me.getMultiSelect(),
            groupRows: false
        });

        me.callParent(arguments);
        if (me.getShowOptions() === true) {
            me.setPanelOptions([
                {xtype: 'button', text: '<i class="fa fa-plus-circle"></i> Register new user', cls: "acceptButton", scope: me, handler: me.newUserButtonHandler},
                {xtype: 'button', text: '<i class="fa fa-edit"></i> Edit selected user', cls: "editButton", scope: me, handler: me.editUserButtonHandler},
                {xtype: 'button', text: '<i class="fa fa-trash"></i> Remove selected user', cls: "cancelButton", scope: me, handler: me.removeUserButtonHandler}
            ]);
        }
        if (me.showLogginInfo === true) {
            this.down("grid").columns[2].renderer = function (value) {
                if (value === true) {
                    return '<b style="color:green">' + value + '</b>';
                }
                return '<p style="color:red">' + value + '</p>';
            };
        }
    }
});

Ext.define('SL.view.UserViews.UserSelectionWindow', {
    extend: 'Ext.window.Window',
    mixins: {UserView: "SL.view.UserViews.UserView"},
    alias: 'widget.UserSelectionWindow',
    title: 'Select the user to add',
    closable: false, modal: true, multiSelect: false,
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    setMultiSelect: function (multiSelect) {
        this.multiSelect = multiSelect;
    },
    getMultiSelect: function () {
        return this.multiSelect;
    },
    getSelectedUsers: function () {
        return this.queryById("userBrowsePanel").getSelectedUsers();
    },
    show: function (_callBackFn) {
        this.callBackFn = _callBackFn;
        this.callParent();
    },
    updateContent: function () {
        this.queryById("userBrowsePanel").updateContent();
    },
    initComponent: function () {
        var me = this;

        this.setController(application.getController("UserController"));

        Ext.applyIf(this, {
            selectedUsers: [],
            layout: 'fit', bodyStyle: 'padding: 5px;',
            items: [{xtype: 'UserListView', multiSelect: me.getMultiSelect()}],
            buttons: [
                {text: "<i class='fa fa-check'></i> Add selected users", scope: me, cls: "acceptButton",
                    handler: function () {
                        this.close();
                    }},
                {text: "<i class='fa fa-remove'></i> Cancel", scope: me, cls: "cancelButton",
                    handler: function () {
                        this.close();
                    }}
            ],
            listeners: {
                //PREVENT TO COLLAPSE PANEL IF NO SEARCH WAS MADE
                beforeclose: function () {
                    this.callBackFn(this.getSelectedUsers());
                    return true;
                }
            }
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.UserView.InfoLoginPanel', {
    extend: 'Ext.container.Container',
    alias: 'widget.InfoLoginPanel',
    mixins: {UserView: "SL.view.UserViews.UserView"},
    id: 'InfoLoginPanel', name: "InfoLoginPanel",
    getViewName: function () {
        return this.name;
    },
    setLoginState: function (newStatus) {
        var me = this;
        if (newStatus) {
            me.queryById('notLoggedMessage').setVisible(false);
            me.queryById('button_session_options').setVisible(true);
            me.queryById('button_session_options').setText('<i class="fa fa-user"></i> ' + Ext.util.Cookies.get('loggedUser'));
        } else {
            me.queryById('notLoggedMessage').setVisible(true);
            me.queryById('button_session_options').setVisible(false);
        }
    },
    initComponent: function () {
        var me = this;

        this.setController(application.getController("UserController"));

        Ext.applyIf(me, {
            layout: {type: "hbox", align: "middle", pack: "end"}, style: "margin-right:20px",
            items: [
                {xtype: 'box', itemId: "notLoggedMessage", html: '<p><i class="fa fa-exclamation-triangle"></i> Not logged yet</p>'},
                {xtype: 'button', hidden: true, itemId: 'button_session_options', text: '', cls: "button", width: 120,
                    menu: {
                        xtype: 'menu',
                        items: [
                            {xtype: 'menuitem', scale: 'small', text: '<i class="fa fa-sign-out"></i> Logout',
                                scope: me, handler: function () {
                                    this.getController().logoutButtonHandler();
                                }},
                            {xtype: 'menuitem', scale: 'small', text: '<i class="fa fa-user"></i> My account',
                                scope: me, handler: function () {
                                    this.getController().showUserDataButtonHandler();
                                }
                            }
                        ]
                    }
                }
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.UserViews.UserListTextField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.UserListTextField',
    mixins: {UserView: "SL.view.UserViews.UserView", bindable: 'Ext.util.Bindable', field: 'Ext.form.field.Field'},
    requires: ['Ext.panel.Panel', 'Ext.view.BoundList', 'Ext.layout.container.Fit'],
    uses: ['Ext.view.DragZone', 'Ext.view.DropZone'],
    ddReorder: false, appendOnly: false, displayField: 'text',
    allowBlank: true, minSelections: 0, maxSelections: Number.MAX_VALUE,
    blankText: 'This field is required',
    minSelectionsText: 'Minimum {0} item(s) required',
    maxSelectionsText: 'Minimum {0} item(s) required',
    delimiter: ',',
    ignoreSelectChange: 0,
    cls: 'UserListTextField',
    layout: {align: 'stretch', pack: 'start', type: 'hbox'},
    addUser: function (user) {
        var me = this;
        //var insertedUsers = me.getAllInsertedUsers();
        var theStore = me.getStore();
        if (theStore.findExact('value', user) === -1) {
            theStore.add({'value': user});
        }
        me.isValid();
    },
    getAllInsertedUsers: function () {
        var theStore = this.getStore();
        var users = [];
        theStore.data.items.forEach(function (item) {
            users.push(item.data.value);
        });
        return users;
    },
    getAllUsers: function () {
        var theStore = this.getStore();
        var users = [];
        var model;
        theStore.data.items.forEach(function (item) {
            model = Ext.create("SL.model.User");
            model.setID(item.data.value);
            users.push(model);
        });
        return users;
    },
    removeSelected: function () {
        //GET THE SELECTED VALUES
        var me = this;

        var selected = me.getSelectedValues();
        if (selected.length === 0)
            return;

        //TEST IF SOME PROTECTED USER HAS BEEN SELECTED
        var noError = true;
        me.protectedUsers.forEach(function (item) {
            var userPos = selected.indexOf(item);
            if (userPos !== -1) {
                Ext.MessageBox.show({
                    title: 'User not removable',
                    msg: 'User ' + item + ' can not be removed.',
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.INFO
                });
                noError = false;
            }
        });
        //IF NON PROTECTED USERS ARE SELECTED, REMOVE
        if (noError) {
            me.getStore().remove(me.getSelected());
        }
        this.isValid();
    },
    clear: function () {
        //GET THE SELECTED VALUES
        var me = this;
        me.getStore().removeAll();
    },
    removeAllUsers: function () {
        //GET THE SELECTED VALUES
        var me = this;
        me.getStore().removeAll();
    },
    initComponent: function () {
        var me = this;

        this.setController(application.getController("UserController"));

        Ext.applyIf(me, {protectedUsers: []});

        me.bindStore(me.store, true);
        if (me.store.autoCreated) {
            me.valueField = me.displayField = 'field1';
            if (!me.store.expanded) {
                me.displayField = 'field2';
            }
        }

        if (!Ext.isDefined(me.valueField)) {
            me.valueField = me.displayField;
        }
        me.items = me.setupItems();
        me.initField();
        me.addEvents('drop');

        me.callParent(arguments);
    },
    setupItems: function () {
        var me = this;

        me.boundList = Ext.create('Ext.view.BoundList', Ext.apply({
            deferInitialRefresh: false,
            border: false,
            multiSelect: true,
            store: me.store,
            displayField: me.displayField,
            disabled: me.disabled,
        }, me.listConfig));

        me.boundList.getSelectionModel().on('selectionchange', me.onSelectChange, me);
        return [
            {border: true, bodyStyle: {borderColor: "silver #d9d9d9 #d9d9d9"}, layout: {type: 'anchor', align: 'stretch'}, title: me.title, tbar: me.tbar, items: me.boundList, maxWidth: 600, flex: 1},
            {xtype: 'button', text: '<i class="fa fa-plus-circle"></i><i class="fa fa-user"></i> Add user', tooltip: 'Add other user', handler: me['onAddBtnClick'], itemId: "addUserButton"},
            {xtype: 'button', text: '<i class="fa fa-trash"></i>', tooltip: 'Remove selected users', itemId: "removeUserButton", handler: me['onRemoveBtnClick']}
        ];
    },
    getSelectedValues: function () {
        var selection = this.boundList.getSelectionModel().getSelection();
        var values = [];
        selection.forEach(function (item) {
            values.push(item.data.value)
        });
        return values;
    },
    onAddBtnClick: function () {
        /**
         * This function is used when the ADD NEW USER BUTTON is clicked.
         * Firstly, a new UserSelectionWindow is opened showing all the registered users
         * into a UserListView grid panel. A CALLBACK function is given as param, that's the function
         * which will be called when the UserSelectionWindow get closed.
         * Using checkbox, we can choose the users to add.
         * 
         * When the ADD SELECTED USERS is clicked, the UserSelectionWindow ask to the
         *  UserListView panel which users are selected. Before the UserSelectionWindow get definitively
         *  closed, the BEFORECLOSE listener is called and then the CALLBACK function is invoked.
         *  That CALLBACK function add the selected USERS to the USERLISTTEXTFIELD.
         *  
         * @param  button, the button which call the function, 
         * @return      
         **/

        var me = this;

        var theStore = me.up('UserListTextField').getStore();
        var userSelectionWindow = Ext.widget('UserSelectionWindow', {multiSelect: true});
        userSelectionWindow.setHeight(Ext.getBody().getViewSize().height * 0.7);
        userSelectionWindow.setWidth(Ext.getBody().getViewSize().width * 0.6);

        userSelectionWindow.show(function (selectedUsers) {
            if (selectedUsers.length > 0) {
                selectedUsers.forEach(function (item) {
                    if (theStore.findExact('value', item.getID()) === -1) {
                        theStore.add({'value': item.getID()});
                    }
                });
                me.up('UserListTextField').isValid();
            }
        });

        userSelectionWindow.updateContent();
    },
    onRemoveBtnClick: function () {
        var me = this;
        me.up('UserListTextField').removeSelected();
    },
    getSelected: function () {
        return this.boundList.getSelectionModel().getSelection();
    },
    onSelectChange: function (selModel, selections) {
        if (!this.ignoreSelectChange) {
            this.setValue(selections);
        }
    },
    isEqual: function (v1, v2) {
        var fromArray = Ext.Array.from, i = 0, len;

        v1 = fromArray(v1);
        v2 = fromArray(v2);
        len = v1.length;

        if (len !== v2.length) {
            return false;
        }

        for (; i < len; i++) {
            if (v2[i] !== v1[i]) {
                return false;
            }
        }

        return true;
    },
    afterRender: function () {
        var me = this;

        me.callParent();
        if (me.selectOnRender) {
            ++me.ignoreSelectChange;
            me.boundList.getSelectionModel().select(me.getRecordsForValue(me.value));
            --me.ignoreSelectChange;
            delete me.toSelect;
        }

        if (me.ddReorder && !me.dragGroup && !me.dropGroup) {
            me.dragGroup = me.dropGroup = 'MultiselectDD-' + Ext.id();
        }

        if (me.draggable || me.dragGroup) {
            me.dragZone = Ext.create('Ext.view.DragZone', {view: me.boundList, ddGroup: me.dragGroup, dragText: '{0} Item{1}'});
        }
        if (me.droppable || me.dropGroup) {
            me.dropZone = Ext.create('Ext.view.DropZone', {
                view: me.boundList,
                ddGroup: me.dropGroup,
                handleNodeDrop: function (data, dropRecord, position) {
                    var view = this.view,
                            store = view.getStore(),
                            records = data.records,
                            index;

                    // remove the Models from the source Store
                    data.view.store.remove(records);

                    index = store.indexOf(dropRecord);
                    if (position === 'after') {
                        index++;
                    }
                    store.insert(index, records);
                    view.getSelectionModel().select(records);
                    me.fireEvent('drop', me, records);
                }
            });
        }
    },
    isValid: function () {
        var me = this, disabled = me.disabled, validate = me.forceValidation || !disabled;
        var valid = validate ? me.validateValue(me.value) : disabled;

        if (!valid) {
            me.markInvalid("This field is required.");
        } else {
            me.clearInvalid();
        }
        return valid;
    },
    validateValue: function (value) {
        return (this.getAllInsertedUsers().length > 0 || this.allowBlank);
    },
    markInvalid: function (errors) {
        // Save the message and fire the 'invalid' event
        var me = this, oldMsg = me.getActiveError();
        me.setActiveErrors(Ext.Array.from(errors));
        me.boundList.up().setBodyStyle({borderColor: "red"});

        if (oldMsg !== me.getActiveError()) {
            me.updateLayout();
        }
    },
    clearInvalid: function () {
        /**
         * Clear any invalid styles/messages for this field.
         *
         * **Note**: this method does not cause the Field's {@link #validate} or {@link #isValid} methods to return `true`
         * if the value does not _pass_ validation. So simply clearing a field's errors will not necessarily allow
         * submission of forms submitted with the {@link Ext.form.action.Submit#clientValidation} option set.
         */
        // Clear the message and fire the 'valid' event
        var me = this, hadError = me.hasActiveError();
        me.boundList.up().setBodyStyle({borderColor: "silver #d9d9d9 #d9d9d9"});
        me.unsetActiveError();
        if (hadError) {
            me.updateLayout();
        }
    },
    getSubmitData: function () {
        var me = this, data = null, val;
        if (!me.disabled && me.submitValue && !me.isFileUpload()) {
            val = me.getSubmitValue();
            if (val != null) {
                var val_aux = "";
                for (var i in val) {
                    val_aux += (val[i]) + ",";
                }
                data = {};
                data[me.getName()] = val_aux;
            }
        }
        return data;
    },
    getSubmitValue: function () {
        /**
         * Returns the value that would be included in a standard form submit for this field.
         *
         * @return {String} The value to be submitted, or null.
         */
        var me = this, delimiter = me.delimiter, val = me.getValue();
        return val;

        return Ext.isString(delimiter) ? val.join(delimiter) : val;
    },
    getValue: function () {
        return this.getAllInsertedUsers();
    },
    getRecordsForValue: function (value) {
        var me = this,
                records = [],
                all = me.store.getRange(),
                valueField = me.valueField,
                i = 0,
                allLen = all.length,
                rec,
                j,
                valueLen;

        for (valueLen = value.length; i < valueLen; ++i) {
            for (j = 0; j < allLen; ++j) {
                rec = all[j];
                if (rec.get(valueField) == value[i]) {
                    records.push(rec);
                }
            }
        }
        return records;
    },
    setupValue: function (value) {
        var delimiter = this.delimiter, valueField = this.valueField, i = 0, out, len, item;

        if (Ext.isDefined(value)) {
            if (delimiter && Ext.isString(value)) {
                value = value.split(delimiter);
            } else if (!Ext.isArray(value)) {
                value = [value];
            }

            for (len = value.length; i < len; ++i) {
                item = value[i];
                if (item && item.isModel) {
                    value[i] = item.get(valueField);
                }
            }
            out = Ext.Array.unique(value);
        } else {
            out = [];
        }
        return out;
    },
    setValue: function (value) {
        var me = this, selModel = me.boundList.getSelectionModel();

        // Store not loaded yet - we cannot set the value
        if (!me.store.getCount()) {
            me.store.on({
                load: Ext.Function.bind(me.setValue, me, [value]),
                single: true
            });
            return;
        }

        value = me.setupValue(value);
        me.mixins.field.setValue.call(me, value);

        if (me.rendered) {
            ++me.ignoreSelectChange;
            selModel.deselectAll();
            selModel.select(me.getRecordsForValue(value));
            --me.ignoreSelectChange;
        } else {
            me.selectOnRender = true;
        }
    },
    clearValue: function () {
        this.setValue([]);
    },
    onEnable: function () {
        var list = this.boundList;
        this.callParent();
        if (list) {
            list.enable();
        }
    },
    onDisable: function () {
        var list = this.boundList;
        this.callParent();
        if (list) {
            list.disable();
        }
    },
    getErrors: function (value) {
        var me = this,
                format = Ext.String.format,
                errors = [],
                numSelected;

        value = Ext.Array.from(value || me.getValue());
        numSelected = value.length;

        if (!me.allowBlank && numSelected < 1) {
            errors.push(me.blankText);
        }
        if (numSelected < me.minSelections) {
            errors.push(format(me.minSelectionsText, me.minSelections));
        }
        if (numSelected > me.maxSelections) {
            errors.push(format(me.maxSelectionsText, me.maxSelections));
        }
        return errors;
    },
    onDestroy: function () {
        var me = this;
        me.bindStore(null);
        Ext.destroy(me.dragZone, me.dropZone);
        me.callParent();
    },
    onBindStore: function (store) {
        var boundList = this.boundList;

        if (boundList) {
            boundList.bindStore(store);
        }
    },
    setEditable: function (editable) {
        this.queryById("addUserButton").setVisible(editable);
        this.queryById("removeUserButton").setVisible(editable);
    },
    setReadOnly: function (readOnly) {
        this.setEditable(!readOnly);
    }
});