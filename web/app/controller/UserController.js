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
 *     
 * THIS FILE CONTAINS THE FOLLOWING COMPONENT DECLARATION
 * - UserController
 * 
 * THIS CONTROLLER CONTAINS THE FOLLOWING HANDLERS
 * - adminUsersButtonHandler
 * - newUserButtonHandler
 * - editUserButtonHandler
 * - removeUserButtonHandler
 * - acceptButtonPressedHandler
 * - cancelButtonPressedHandler
 * - editButtonPressedHandler
 * - loadAllUsersHandler
 * - logoutButtonHandler
 * - showUserDataButtonHandler
 * 
 * - clean_task_queue
 * - execute_tasks
 * - send_create_user
 * - send_update_user
 * - send_remove_user
 * - loadUserHandler
 * - getCredentialsParams
 * 
 */
Ext.define('SL.controller.UserController', {
    extend: 'Ext.app.Controller',
    alias: 'controller.UserController',
    /**
     * This function handles the event fires when the button "New User" is clicked.
     * First creates a new empty user MODEL by creating a new UserView.
     * Then shows the UserView panel 
     * 
     * @returns {undefined}
     */
    adminUsersButtonHandler: function () {
        var userListWindow = Ext.create('Ext.window.Window', {
            title: 'Users administration',
            height: 600, width: 770, layout: 'fit', closable: false, modal: true,
            previousPanel: null,
            items: {xtype: 'UserListView', showLogginInfo: true, border: false, showOptions: true, itemId: 'user_list_panel'},
            buttons: [
                {text: '<i class="fa fa-remove"></i> Close', cls: 'cancelButton', handler: function () {
                        this.up('window').close();
                    }}
            ],
            listeners: {
                boxready: function () {
                    this.queryById("user_list_panel").updateContent();
                }
            }
        });

        userListWindow.down('UserListView').setMultiSelect(false);
        userListWindow.setHeight(Ext.getBody().getViewSize().height * 0.7);
        userListWindow.setWidth(Ext.getBody().getViewSize().width * 0.6);
        userListWindow.show();
    },
    /**
     * 
     * @param {type} userView
     * @returns {undefined}
     */
    newUserButtonHandler: function (userView) {
        var userViewWindow = Ext.create('Ext.window.Window', {
            title: 'New User registration',
            height: 425, width: 500, layout: 'fit', closable: false, modal: true,
            updateNeeded: false,
            parent: userView,
            items: {xtype: 'UserView', border: false},
            buttons: [
                {xtype: 'button', cls: 'acceptButton', text: "<i class='fa fa-check'></i> Accept",
                    handler: function (button) {
                        var userView = button.up('window').down('UserView');
                        userView.getController().acceptButtonPressedHandler(userView);
                    }
                },
                {xtype: 'button', cls: 'cancelButton', text: "<i class='fa fa-remove'></i> Cancel", handler: function () {
                        this.up('window').close();
                    }}
            ],
            listeners: {
                beforeclose: {
                    fn: function () {
                        if (this.updateNeeded) {
                            this.parent.updateContent();
                        }
                    }
                }
            }
        });

        userViewWindow.down('UserView').parent = userViewWindow;
        userViewWindow.down('UserView').loadModel(Ext.create('SL.model.User'));
        userViewWindow.down('UserView').setViewMode("creation");
        userViewWindow.show();
    },
    /**
     * 
     * @param {type} userView
     * @returns {undefined}
     */
    editUserButtonHandler: function (userView) {
        var selectedUser = userView.getSelectedUsers();

        //FIRST GET THE SELECTED USER, IF EXISTS
        if (selectedUser.length === 0) {
            return;
        }
        //THEN WE CREATE A NEW WINDOW WITH A USERVIEW INSIDE
        var userViewWindow = Ext.create('Ext.window.Window', {
            title: 'User edition', height: 425, width: 500, layout: 'fit', closable: false, modal: true,
            updateNeeded: false, parent: userView,
            items: {xtype: 'UserView', border: false, parent: userViewWindow},
            //SET THE BUTTONS HANDLER
            buttons: [
                {xtype: 'button', cls: 'acceptButton', text: '<i class="fa fa-plus-circle"></i>  Accept',
                    handler: function (button) {
                        var userView = button.up('window').down('UserView');
                        userView.getController().acceptButtonPressedHandler(userView);
                    }
                },
                {xtype: 'button', cls: 'cancelButton', text: "<i class='fa fa-remove'></i> Cancel", handler: function () {
                        this.up('window').close();
                    }}
            ],
            //SETS THE LISTENERS
            listeners: {
                beforeclose: {
                    fn: function () {
                        if (this.updateNeeded) {
                            this.parent.updateContent();
                        }
                    }
                }
            }
        });

        //OTHER CONFIGURATION FOR THE NEW WINDOW
        var userView = userViewWindow.down('UserView');

        userView.parent = userViewWindow;
        userView.loadModel(selectedUser[0]);
        userView.setViewMode("edition");
        userViewWindow.show();
    },
    /**
     * 
     * @param {type} userView
     * @returns {undefined}
     */
    removeUserButtonHandler: function (userView) {
        var selectedUserIds = userView.getSelectedUsersIDs();

        //FIRST GET THE SELECTED USER, IF EXISTS
        if (selectedUserIds.length > 0) {
            this.send_remove_user(userView, selectedUserIds[0], userView, "updateContent");
        }
    },
    /**
     * This function handles the event accept_button_pressed fires in other Controller (eg. ApplicationController)
     * when a button Accept is pressed.
     * First cleans the UserView tasks queue (removing all unneccessary tasks) and then starts with task
     * execution.
     * 
     * @param {type} user_view
     * @returns {undefined}
     */
    acceptButtonPressedHandler: function (user_view) {
        //user_view.setTaskQueue(this.clean_task_queue(user_view.getTaskQueue()));
        this.execute_tasks(user_view, true);
    },
    /**
     * 
     * @param {type} panel
     * @returns {undefined}
     */
    cancelButtonPressedHandler: function (panel) {
        var askToContinue = function (buttonId, text, opt) {
            if (buttonId === "yes") {
                var elem = Ext.getCmp('documentInfoPanel');
                elem.removeInnerPanel();
                elem.toggleCollapse();
            }
        };

        Ext.MessageBox.show({
            title: 'Exit without save?',
            msg: 'You are closing the form before save changes. <br/>Would you like to continue?',
            buttons: Ext.MessageBox.YESNO,
            fn: askToContinue,
            icon: Ext.MessageBox.QUESTION
        });
    },
    /**
     * 
     * @param {type} aView
     * @returns {undefined}
     */
    loadAllUsersHandler: function (aView) {
        //THIS CODE DO AN ASYNCHRONOUS QUERY TO DB IN ORDER TO GET THE NEXT ITEM ID
        var me = this;

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_USER_LIST,
            method: 'POST',
            params: this.getCredentialsParams(),
            success: function (response) {
                // responseText should be in json format
                var jsonResponse = Ext.JSON.decode(response.responseText);
                var userList = jsonResponse['userList'];

                var users = [];

                if (userList.length < 1) {
                    showWarningMessage("No users found in databases.</br>Please add New users first.", {"title": "Browse Users", "soft": true});
                } else {
                    for (var i in userList) {
                        var newModel = SL.model.User.loadFromJSON(userList[i]);
                        users.push(newModel);
                    }
                    aView.setData(users);
                }
                //TODO
//                var adminEmail = userListStore.getAt(userListStore.find("user_id", "admin")).getEmail();
//                Ext.util.Cookies.set('adminEmail', adminEmail, null, location.pathname);
            },
            failure: function (response) {
                ajaxErrorHandler("UserController", "onUserListAfterRender", response);
            }
        });
    },
    /**
     * 
     * @returns {undefined}
     */
    logoutButtonHandler: function () {
        var mainView = Ext.getCmp('mainView');

        var closePanels = function (response, opts) {
            Ext.util.Cookies.clear('loggedUser', location.pathname);
            Ext.util.Cookies.clear('sessionToken', location.pathname);
            Ext.util.Cookies.clear('currentExperimentID', location.pathname);
            Ext.util.Cookies.clear('currentExperimentName', location.pathname);
            forceRefresh = true;
            location.reload();
        };

        if (["AnalysisDetailsView", "ExperimentDetailsView", "BioConditionDetailsView"].indexOf(mainView.getCurrentView().getViewName()) !== -1 &&
                mainView.getCurrentView().isInEditionMode() === true) {
            showErrorMessage('Please, close the current panel before Logout', {soft: true});
            return;
        }

        if (Ext.util.Cookies.get('loggedUser') == null) {
            closePanels();
            return;
        }

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_LOGOUT,
            method: 'POST',
            params: this.getCredentialsParams(),
            success: closePanels(),
            failure: function (response, opts) {
                showErrorMessage('Logout failed.<br>Please try again.', {soft: true});
                success: closePanels();
            }
        });
    },
    /**
     * 
     * @returns {undefined}
     */
    showUserDataButtonHandler: function () {
        var me = this;
        //LOAD ALL  DEPENDENCIES
        var userViewWindow = Ext.create('Ext.window.Window', {
            title: 'My Account',
            height: 425, width: 500, layout: 'fit', closable: false, modal: true,
            updateNeeded: false, parent: null,
            items: {xtype: 'UserView', header: false, border: false},
            buttons: [
                {cls: 'acceptButton', text: "<i class='fa fa-check'></i> Save changes", hidden: true,
                    handler: function () {
                        var userView = this.up('window').down('UserView');
                        userView.getController().acceptButtonPressedHandler(userView);
                    }
                },
                {cls: 'editButton', text: "<i class='fa fa-edit'></i> Edit",
                    handler: function () {
                        this.up('window').down('UserView').setViewMode("edition");
                        this.setVisible(false);
                        this.previousSibling('button').setVisible(true);
                    }
                },
                {cls: 'cancelButton', text: "<i class='fa fa-remove'></i> Cancel", handler: function () {
                        this.up('window').close();
                    }}
            ]
        });

        userViewWindow.down('UserView').parent = userViewWindow;
        userViewWindow.down('UserView').setViewMode("inspect");
        userViewWindow.show();
        this.loadUserHandler(Ext.util.Cookies.get('loggedUser'), userViewWindow.down('UserView'));
    },
    /************************************************************************************************
     * This function handles the tasks execution for a given UserView and should be only called after 
     * User creation/edition.
     *
     * Briefly, the way of work of this function is:
     * 	1. 	Get the next task that should be carried out.
     *
     *	2.	If the next task is defined and no previous errors were thrown, we should call to the specified function in the task
     *		in order to change the SERVER information. In the specified function call, we should add the callback function that will be
     *		call after the AJAX success/fail event.
     *        
     *	3.	If an error is thrown during the function call, the error is catched in this function and the task re-added to the queue.
     *	4. 	If no more task and the status is "successfull" (~TRUE), then the panel is closed and a SUCCESS message showed.
     
     * @param  userView the userView with the tasks queue model
     * @param  status
     * @return      
     *************************************************************************************************/
    execute_tasks: function (userView, status) {
        var error_message = "";
        //GET THE NEXT TASK IN THE QUEUE
        var current_task = userView.getTaskQueue().shift();

        //IF THERE IS A NEXT TASK AND NO PREVIOUS ERROR
        if (current_task != null && status) {
            try {
                switch (current_task.command)
                {
                    case "create_new_user":
                        console.info((new Date()).toLocaleString() + "SENDING SAVE NEW USER REQUEST TO SERVER");
                        this.send_create_user(userView, this, "execute_tasks");
                        console.info((new Date()).toLocaleString() + "SAVE NEW USER REQUEST SENT TO SERVER");
                        break;

                        //edit_user IS ADDED WHEN A USER IS UPDATED
                    case "edit_user":
                        console.info((new Date()).toLocaleString() + "SENDING UPDATE USER " + userView.getUserID() + " REQUEST TO SERVER");
                        this.send_update_user(userView, this, "execute_tasks");
                        console.info((new Date()).toLocaleString() + "UPDATE USER " + userView.getUserID() + " REQUEST SENT TO SERVER");
                        break;

                        //add_analytical_rep IS ADDED WHEN A NEW ANALYITICAL REP IS ADDED TO AN EXISTING BIOREP
                    case "remove_user":
                        console.info((new Date()).toLocaleString() + "SENDING REMOVE USER " + current_task.object.get("user_id") + " REQUEST TO SERVER");
                        this.send_remove_user(userView, current_task.object, this, "execute_tasks");
                        console.info((new Date()).toLocaleString() + "REMOVE USER " + current_task.object.get("user_id") + " REQUEST SENT TO SERVER");
                        break;

                        //clear_blocked_status ??
                        //case "clear_blocked_status":break;

                    case "void_action":
                        this.execute_tasks(userView, true);
                        break;
                    default:
                        status = false;
                        break;
                }
            } catch (error) {
                //TODO:THROW ERRORS IN ALL CALLED FUNCTIONS 
                error_message = error.message;
                status = false;
                userView.taskQueue.unshift(current_task);
            }

            if (!status) {
                console.error(new Date() + "Error detected trying to save the changes, Error:" + error_message);
                if (error_message !== "") {
                    showErrorMessage('Failed trying to saved the changes.</br>Please try again.</br>Error: ' + error_message, {soft: false});
                }
            }
        }
        //IF NO MORE TASKS AND EVERYTHING GOES WELL
        else if (status) {
            console.info(new Date() + "User " + userView.getUserID() + " saved successfully");
            showSuccessMessage('User ' + userView.getUserID() + ' saved successfully');
            userView.parent.updateNeeded = true;
            userView.parent.close();
        } else {
            status = false;
            userView.taskQueue.unshift(current_task);
        }

    },
    /********************************************************************************      
     * This function send the User information contained in a given user_view 
     * to the SERVER in order to save a NEW USER in the database.
     * Briefly the way of work is :
     *	1.	Check if the formulary's content is valid. If not, throws an error that should 
     *		catched in the caller function.
     *
     *	2.	If all fields are correct, then the User model is converted from JSON to a 
     *		JSON format STRING and sent to the server using POST. After that the function finished.
     *	
     *	3.	After a while, the server returns a RESPONSE catched inside this function. 
     *		The response has 2 possible status: SUCCESS and FAILURE.
     *		a.	If SUCCESS, then the new user identifier is set in the user_view. 
     *			After that,  isthe callback function is called, in this case the 
     *       	callback function is the "execute_task" function that will execute the next
     *           task in the TASK QUEUE of the given USERVIEW panel. This function is called
     *           with the status flag sets to TRUE (~ success).
     *		b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *       	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *           the current task is re-added to the TASK QUEUE and an error message is showed.
     *           The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     * @param  userView the UserView panel which fires the create action and contains the TASK QUEUE and the user model. Needed for the callback function.
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @return   
     ********************************************************************************/
    send_create_user: function (userView, callback_caller, callback_function) {
        var form = userView.queryById('userFields');
        form = form.getForm(); // get the basic form
        if (form.isValid()) { // make sure the form contains valid data before submitting
            //GET THE NEW user MODEL (ASSOCIATED TO THE CREATION FORM) AND THE VALUES
            var user_model = form.getRecord();
            var values = form.getValues();
            user_model.set(values);

            //Get the USER model as a Simple JSON
            var JSON_DATA = user_model.toSimpleJSON();
            //Convert the JSON object to STRING
            JSON_DATA = Ext.encode(JSON_DATA);

            var me = this;

            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
            Ext.Ajax.request({
                url: SERVER_URL + SERVER_PORT + SERVER_URL_CREATE_USER,
                method: 'POST',
                params: me.getCredentialsParams({'user_json_data': JSON_DATA}),
                success: function (response) {
                    console.info((new Date()).toLocaleString() + "USER " + userView.getUserID() + " SAVED IN SERVER SUCCESSFULLY");

                    var message = "Dear user,\n\n" +
                            "Welcome to STATegra EMS.\n" +
                            "Your new account has been created by the administrator.\n\n" +
                            "Application address: " + document.location.href + "\n\n" +
                            "Username: " + userView.getModel().getID() + "\n" +
                            "Password: " + userView.queryById('password_field').getValue() + "\n\n" +
                            "Once you log in the application, you should change your password by clicking on the account options at top-left corner.\n\n" +
                            "Administrator contact: " + Ext.util.Cookies.get('adminEmail') + "\n\n" +
                            "--\n" +
                            "Thanks for choosing STATegraEMS.";

                    Ext.create('Ext.window.Window', {
                        title: 'User account creation notification',
                        height: 400, width: 600, layout: {type: 'vbox', align: 'stretch'},
                        items: [
                            {xtype: 'label', html: '<h2>To send a notification to the user copy the following message or click at the link below.</h2>'},
                            {xtype: 'label', html: '<a target="_blank" href="mailto:' + userView.getModel().getEmail() + '?subject=STATegraEMS%20Account%20details&body=' + message.replace(/ /g, "%20").replace(/\n/g, "%0D%0A") + '">Send email to' + userView.getModel().getEmail() + '</a>'},
                            {xtype: 'textarea', flex: 1, value: message}
                        ],
                        buttons: [{xtype: 'button', text: "<i class='fa fa-remove'></i> Close", cls: "cancelButton", handler: function () {
                                    this.up('window').close();
                                }}]
                    }).show();
                    callback_caller[callback_function](userView, true);
                },
                failure: function (response) {
                    ajaxErrorHandler("UserController", "send_create_user", response);
                    //Undo the task shift in the queue 
                    userView.taskQueue.unshift({command: "create_new_user", object: null});
                    callback_caller[callback_function](userView, false);
                }
            });

        } else { // display error alert if the data is invalid
            showErrorMessage("Invalid Data.</br>Please correct form errors.", {soft: true});
            console.error((new Date()).toLocaleString() + "SAVING USER REQUEST ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            throw new Error("");
        }
    },
    /********************************************************************************      
     * This function send the User information contained in a given user_view 
     * to the SERVER in order to update an USER in the database.
     * Briefly the way of work is :
     *	1.	Check if the formulary's content is valid. If not, throws an error that should 
     *		catched in the caller function.
     *
     *	2.	If all fields are correct, then the User model is converted from JSON to a 
     *		JSON format STRING and sent to the server using POST. After that the function finished.
     *	
     *	3.	After a while, the server returns a RESPONSE catched inside this function. 
     *		The response has 2 possible status: SUCCESS and FAILURE.
     *		a.	If SUCCESS, then the new user identifier is set in the user_view. 
     *			After that,  isthe callback function is called, in this case the 
     *       	callback function is the "execute_task" function that will execute the next
     *           task in the TASK QUEUE of the given USERVIEW panel. This function is called
     *           with the status flag sets to TRUE (~ success).
     *		b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *       	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *           the current task is re-added to the TASK QUEUE and an error message is showed.
     *           The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     * @param  userView the UserView panel which fires the create action and contains the TASK QUEUE and the user model. Needed for the callback function.
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @return   
     ********************************************************************************/
    send_update_user: function (userView, callback_caller, callback_function) {
        var form = userView.queryById('userFields');
        form = form.getForm(); // get the basic form
        if (form.isValid() && form.isDirty()) { // make sure the form contains valid data before submitting
            //GET THE NEW user MODEL (ASSOCIATED TO THE CREATION FORM) AND THE VALUES
            var user_model = form.getRecord();
            var values = form.getValues();
            user_model.set(values);

            //Get the USER model as a Simple JSON
            var JSON_DATA = user_model.toSimpleJSON();
            //Convert the JSON object to STRING
            JSON_DATA = Ext.encode(JSON_DATA);


            var me = this;

            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
            Ext.Ajax.request({
                url: SERVER_URL + SERVER_PORT + SERVER_URL_UPDATE_USER,
                method: 'POST',
                params: me.getCredentialsParams({'user_json_data': JSON_DATA}),
                success: function (response) {
                    console.info((new Date()).toLocaleString() + "USER " + userView.getUserID() + " SAVED IN SERVER SUCCESSFULLY");
                    callback_caller[callback_function](userView, true);
                },
                failure: function (response) {
                    ajaxErrorHandler("UserController", "send_update_user", response);
                    //Undo the task shift in the queue 
                    userView.taskQueue.unshift({command: "create_new_user", object: null});
                    callback_caller[callback_function](userView, false);
                }
            });

        } else { // display error alert if the data is invalid
            showErrorMessage("Invalid Data.</br>Please correct form errors.", {soft: true});
            console.error((new Date()).toLocaleString() + "SAVING USER REQUEST ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            throw new Error("");
        }
    },
    /********************************************************************************      
     * This function send the an User remove request to the SERVER in order in order to
     * remove an USER in the database.
     * Briefly the way of work is :
     *	1.	Check if the user is not protected (admin user)
     *	2.	If not, then request is sent to the server using POST and the function finished.
     *	3.	After a while, the server returns a RESPONSE catched inside this function. 
     *		The response has 2 possible status: SUCCESS and FAILURE.
     *		a.	If SUCCESS, the callback function is called with status value = TRUE (success).
     *		b.	If FAILURE, then the callback function is called (eg. the "execute_task" function)
     *       	but this time with the status flag sets to FALSE (~ failure)
     *  
     * @param  userView the UserView panel which fires the create action and contains the TASK QUEUE and the user model. Needed for the callback function.
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @return   
     ********************************************************************************/
    send_remove_user: function (userView, _user_id, callback_caller, callback_function) {
        if (_user_id === "admin") {
            showErrorMessage('User not removable.');
            return false;
        }
        userView.setLoading(true);
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_REMOVE_USER,
            method: 'POST',
            params: me.getCredentialsParams({'user_id': _user_id}),
            success: function (response) {
                console.info((new Date()).toLocaleString() + "USER " + _user_id + " REMOVED FROM SERVER SUCCESSFULLY");
                callback_caller[callback_function](userView, true);
                userView.setLoading(false);
            },
            failure: function (response) {
                ajaxErrorHandler("UserController", "send_remove_user", response);
                //TODO: RESTORE TASK???
                //user_view.taskQueue.unshift({command: "remove_user",object:_user_id});
                callback_caller[callback_function](userView, false);
                userView.setLoading(false);
            }
        });

    },
    /**
     * 
     * @param {type} _user_id
     * @param {type} user_view
     * @returns {undefined}
     */
    loadUserHandler: function (_user_id, user_view) {
        /***********************************************************************************************************
         * This function handles the event fires when the button "Show User data (My Account)" is clicked.
         * First gets the user data from the Server and creates a new UserView.
         * Then shows the UserView panel 
         *  
         * @param  the clicked button
         ***********************************************************************************************************/
        user_view.setLoading(true);

        //THIS CODE DO AN ASYNCHRONOUS QUERY TO DB IN ORDER TO GET THE NEXT ITEM ID
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_USER,
            method: 'POST',
            params: this.getCredentialsParams({user_id: _user_id}),
            success: function (response) {
                var jsonResponse = Ext.JSON.decode(response.responseText);
                var userList = jsonResponse['userList'];
                var userJSONData = userList[0];

                var newModel = SL.model.User.loadFromJSON(userJSONData);

                user_view.loadModel(newModel);
                user_view.setLoading(false);
            },
            failure: function (response) {
                ajaxErrorHandler("UserController", "loadUserHandler", response);
                try {
                    user_view.up('window').close();
                } catch (error) {
                }
            }
        });
    },
    /**
     * 
     * @param {type} request_params
     * @returns {UserControllerAnonym$0.getCredentialsParams.credentials}
     */
    getCredentialsParams: function (request_params) {
        var credentials = {};
        if (request_params != null) {
            credentials = request_params;
        }

        credentials['sessionToken'] = Ext.util.Cookies.get('sessionToken');
        credentials['loggedUser'] = Ext.util.Cookies.get('loggedUser');
        credentials['currentExperimentID'] = Ext.util.Cookies.get('currentExperimentID');
        return credentials;
    }
});
