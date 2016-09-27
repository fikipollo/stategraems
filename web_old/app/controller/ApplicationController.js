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
 * - ApplicationController
 * 
 * THIS CONTROLLER CONTAINS THE FOLLOWING HANDLERS
 * - loadDependenciesRequiredHandler
 * - loginButtonHandler
 * - splitButtonClickedHandler
 * - onMenuMouseOver
 * - onMenuMouseLeave
 * - acceptButtonHandler
 * - cancelButtonHandler
 * - editButtonHandler
 * - nextButtonHandler
 * - backButtonHandler
 * - dumpDatabaseHandler
 * - showDataDirectoryContentButtonClickHandler
 * - validateSession
 * - getCredentialsParams
 * - statics -> ajaxErrorHandling
 * 
 */
Ext.define('SL.controller.ApplicationController', {
    extend: 'Ext.app.Controller',
    the_controller: this,
    views: ['MainView'],
    init: function () {
        this.control({
            "HomePanel": {
                loadDependenciesRequired: this.loadDependenciesRequiredHandler
            },
            "LoginPanel button[action=login]": {
                click: this.loginButtonHandler
            },
            "HomePanel splitbutton": {
                click: this.splitButtonClickedHandler
            },
            "AdminToolsPanel splitbutton": {
                click: this.splitButtonClickedHandler
            },
            "HomePanel menu": {
                mouseover: this.onMenuMouseOver,
                mouseleave: this.onMenuMouseLeave
            },
            "AdminToolsPanel menu": {
                mouseover: this.onMenuMouseOver,
                mouseleave: this.onMenuMouseLeave
            },
            "button[action=acceptButton]": {
                click: this.acceptButtonHandler
            },
            "button[action=nextButton]": {
                click: this.nextButtonHandler
            },
            "button[action=backButton]": {
                click: this.backButtonHandler
            },
            "button[action=cancelButton]": {
                click: this.cancelButtonHandler
            },
            "button[action=editButton]": {
                click: this.editButtonHandler
            },
            "AdminToolsPanel menuitem[action=dumpDatabase]": {
                click: this.dumpDatabaseHandler
            }
        });
    },
    /**
     * 
     * @returns {undefined}
     */
    loadDependenciesRequiredHandler: function () {
    },
    /**
     * 
     * @param {type} button
     * @returns {undefined}
     */
    loginButtonHandler: function (button) {
        var me = this;
        var form = button.up('form').getForm(); // get the basic form
        if (form.isValid()) { // make sure the form contains valid data before submitting

            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};

            form.submit({
                method: 'POST',
                /*
                 * DUE TO SOME WEB BROWSER (ie: GOOGLE CHROME) SEND TO THE SERVER, BEFORE THE POST REQUEST,
                 * AN OPTIONS REQUEST, IN ORDER TO TEST THE SERVER AVALIBILITY,
                 * WE'VE TO CONFIGURE THE PACKAGE'S HEADER
                 */
                url: SERVER_URL + SERVER_PORT + SERVER_URL_LOGIN,
                clientValidation: true,
                success: function (form, action) {
                    var jsonResponse = Ext.JSON.decode(action.response.responseText);
                    jsonResponse = jsonResponse['user_data'][0];
                    //LETS DECODE THE RESPONSE 
                    var loggedUser = jsonResponse['user_id'];
                    var sessionToken = jsonResponse['sessionToken'];
                    var currentExperimentID, currentExperimentName;
                    if (jsonResponse['last_experiment_id'] === undefined && loggedUser !== "admin") {
                        showWarningMessage("Currently you are not member of any experiment. Please, contact to administrator to solve this issue before continue.", {soft: true});
                        currentExperimentID = "Not selected";
                        currentExperimentName = "Please choose an Experiment at Experiment browse panel to start working";
                    } else {
                        currentExperimentID = jsonResponse['last_experiment_id'];
                        currentExperimentName = jsonResponse['last_experiment_name'];
                    }

                    //SAVE THE USER AND 
                    Ext.util.Cookies.set('sessionToken', sessionToken, null, location.pathname);
                    Ext.util.Cookies.set('loggedUser', loggedUser, null, location.pathname);
                    Ext.util.Cookies.set('currentExperimentID', currentExperimentID, null, location.pathname);
                    Ext.util.Cookies.set('currentExperimentName', currentExperimentName, null, location.pathname);

                    var mainView = application.mainView;
                    mainView.changeMainView("HomePanel");
                },
                failure: function (form, action) {
                    if (action.response.responseText.indexOf("User not found") !== -1) {
                        showErrorMessage("Login failed. </br>Please check the username and password", {soft: true});
                    } else {
                        SL.controller.ApplicationController.ajaxErrorHandling(form, action, 'Login failed.<br>Please try again.');
                    }
                }
            });
        }
    },
    /**
     * 
     * @param {type} button
     * @param {type} e
     * @param {type} eOpts
     * @returns {undefined}
     */
    splitButtonClickedHandler: function (button, e, eOpts) {
        button.showMenu();
    },
    /**
     * 
     * @param {type} menu
     * @param {type} item
     * @param {type} e
     * @param {type} eOpts
     * @returns {undefined}
     */
    onMenuMouseOver: function (menu, item, e, eOpts) {
        if (item === null) {
            return;
        }
        var helpText = {
            'showExperimentInfo': "Show the Experiment information.",
            'newBioCondition': "Register a new Biological Condition and the associated Biological Replicates.",
            'copyBioCondition': "Register a new Biological Condition but using an existing one as template.",
            'sendBioConditionsTemplate': "Register multiple Biological Conditions using a XLS document.",
            'searchBioCondition': "Browse all the existing Biological Condition. Use this option for Sample inspection and edition",
            'createNewAnalysis': "Start a new Analysis workflow.",
            'searchAnalysis': "Browse all the existing Analyisis. Use this option for Analysis inspection and edition.",
            'browseExperiment': "Browse all the existing Experiments. Use this option to change the current Experiment or for other experiments inspection/edition.",
            'inspectExperiment': "Show the current Experiment details.",
            'dumpDatabase': "Save the database content to a file."
        };
        var parent = item.up('HomePanel');
        if (parent === undefined) {
            parent = item.up('AdminToolsPanel');
        }
        parent.updateHelpPanel("<p>" + helpText[item.itemId] + "</p>");
    },
    /**
     * 
     * @param {type} menu
     * @returns {undefined}
     */
    onMenuMouseLeave: function (menu) {
        var parent = menu.up('HomePanel');
        if (parent === undefined) {
            parent = menu.up('AdminToolsPanel');
        }
        parent.updateHelpPanel("<p>Current Experiment " + Ext.util.Cookies.get('currentExperimentID') + "</p><p style='font-size: 16px;color: #0081C9;'>" + Ext.util.Cookies.get('currentExperimentName') + "</p<>  ");
    },
    /**
     * 
     * @returns {undefined}
     */
    acceptButtonHandler: function () {
        //THIS FUNCTION IS CALLED WHEN THE "ACCEPT" BUTTON OF MainView IS PRESSED
        //THEN THIS CONTROLLER FIRES A ACCEPT_BUTTON_PRESSED EVENT THAT SHOULD BE CATCHED BY
        //THE CONTROLLER ASSOCIATED FOR THE INNER PANEL.
        var _panel = application.mainView.getCurrentView();

        if (_panel.getController !== undefined && _panel.getController().acceptButtonPressedHandler !== undefined) {
            _panel.getController().acceptButtonPressedHandler(_panel);
        } else {
            _panel.fireEvent('accept_button_pressed', _panel);
        }

    },
    /************************************************************************************************
     * This function handles the event fires when the button "Cancel" located in 
     * MainView is clicked.
     * Then, this controller fires an "cancel_button_pressed" event that should be catched by the 
     * assocaited controller of the inner panel.
     *
     * @return      
     *************************************************************************************************/
    cancelButtonHandler: function () {
        var _panel = application.mainView.getCurrentView();

        if (_panel.getController !== undefined && _panel.getController().cancelButtonPressedHandler !== undefined) {
            _panel.getController().cancelButtonPressedHandler(_panel);
        } else {
            _panel.fireEvent('cancel_button_pressed', _panel);
        }
    },
    /************************************************************************************************
     * This function handles the event fires when the button "Edit" located in 
     * MainView is clicked.
     * Then, this controller fires an "edit_buton_pressed" event that should be catched by the 
     * assocaited controller of the inner panel.
     *
     * @return      
     *************************************************************************************************/
    editButtonHandler: function () {
        var _panel = application.mainView.getCurrentView();

        if (_panel.getController !== undefined && _panel.getController().editButtonPressedHandler !== undefined) {
            _panel.getController().editButtonPressedHandler(_panel);
        } else {
            _panel.fireEvent('edit_button_pressed', _panel);
        }
    },
    /************************************************************************************************
     * This function handles the event fires when the button "Next" located in 
     * MainView is clicked.
     * Then, this controller fires an "edit_buton_pressed" event that should be catched by the 
     * assocaited controller of the inner panel.
     *
     * @return      
     *************************************************************************************************/
    nextButtonHandler: function () {
        var _panel = application.mainView.getCurrentView();

        if (_panel.getController !== undefined && _panel.getController().nextButtonPressedHandler !== undefined) {
            _panel.getController().nextButtonPressedHandler(_panel);
        } else {
            _panel.fireEvent('next_button_pressed', _panel);
        }
    },
    /************************************************************************************************
     * This function handles the event fires when the button "Back" located in 
     * MainView is clicked.
     * Then, this controller fires an "edit_buton_pressed" event that should be catched by the 
     * assocaited controller of the inner panel.
     *
     * @return      
     *************************************************************************************************/
    backButtonHandler: function () {
        var _panel = application.mainView.getCurrentView();
        if (_panel.getController !== undefined && _panel.getController().backButtonPressedHandler !== undefined) {
            _panel.getController().backButtonPressedHandler(_panel);
        } else {
            _panel.fireEvent('back_button_pressed', _panel);
        }
    },
    /**
     * 
     * @returns {undefined}
     */
    dumpDatabaseHandler: function () {
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_DUMPDB,
            method: 'POST',
            params: this.getCredentialsParams(),
            success: function (response, opts) {
                var responseText = response.responseText;
                if (responseText !== undefined) {
                    responseText = Ext.JSON.decode(responseText);
                    responseText = responseText['location'];
                }
                showSuccessMessage('Database Backup created successfully.' + ((responseText !== undefined) ? "</br>SQL file saved at " + responseText : ""));
            },
            failure: function (response, opts) {
                var errorMsg = response.responseText;
                if (errorMsg !== undefined) {
                    errorMsg = Ext.JSON.decode(errorMsg);
                    errorMsg = errorMsg['reason'];
                }
                showErrorMessage('Database Backup failed.<br>Please try again.' + ((errorMsg !== undefined) ? "</br>" + errorMsg : ""), {soft: false});
            }
        });
    },
    /**
     * 
     * @param {type} treePanel
     * @returns {undefined}
     */
    showDataDirectoryContentButtonClickHandler: function (treePanel) {
        var me = this;
        treePanel.setLoading(true);
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_EXPERIMENT_DIRECTORY_CONTENT,
            method: 'POST',
            params: me.getCredentialsParams(),
            success: function (response) {                 // responseText should be in json format
                try {
                    //1.DECODE THE JSON STRING AND CREATE A JSON OBJECT
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    var directoryContent = jsonResponse['directoryContent'];
                    treePanel.setRootNode(directoryContent);
                    treePanel.expandNode(treePanel.getRootNode());
                    treePanel.getStore().sort("text", "ASC");
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'ApplicationController:loadAnalysisHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
                treePanel.setLoading(false);
            },
            failure: function (response) {
                ajaxErrorHandler("AnalysisController", "showDataDirectoryContentButtonClickHandler", response);
                treePanel.setLoading(false);
            }
        });
    },
    /**
     * 
     * @returns {undefined}
     */
    validateSession: function () {
        if (Ext.util.Cookies.get('loggedUser') == null) {
            return;
        }

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_VALIDATE_SESSION,
            method: 'POST',
            params: this.getCredentialsParams(),
            success: function (response, opts) {
                return true;
            },
            failure: function (response, opts) {
                Ext.util.Cookies.clear('loggedUser', location.pathname);
                Ext.util.Cookies.clear('sessionToken', location.pathname);
                Ext.util.Cookies.clear('currentExperimentID', location.pathname);
                Ext.util.Cookies.clear('currentExperimentName', location.pathname);
                forceRefresh = true;
                location.reload();
            }
        });
    },
    /**
     * 
     * @returns {Object}
     */
    getCredentialsParams: function () {
        var credentials = {};
        credentials['sessionToken'] = Ext.util.Cookies.get('sessionToken');
        credentials['loggedUser'] = Ext.util.Cookies.get('loggedUser');
        credentials['currentExperimentID'] = Ext.util.Cookies.get('currentExperimentID');
        return credentials;
    },
    statics: {
        ajaxErrorHandling: function (form, action, message) {
            switch (action.failureType) {
                case Ext.form.action.Action.CLIENT_INVALID:
                    //Failure type returned when client side validation of the Form fails thus aborting a submit action
                    showErrorMessage('Form fields may not be submitted with invalid values.', {soft: false});
                    break;
                case Ext.form.action.Action.CONNECT_FAILURE:
                    //Failure type returned when a communication error happens when attempting to send a request to the remote server
                    showErrorMessage('Ajax communication failed.<br>Please try again later, if the problem persist contact with technical support.<br>Server response: ' + action.response.responseText, {soft: false});
                    break;
                case Ext.form.action.Action.LOAD_FAILURE:
                    //Failure type returned when the response's success property is set to false, or no field values are returned in the response's data property.
                    showErrorMessage('LOAD_FAILURE.<br>Server response: ' + action.response.responseText, {soft: false});
                    break;
                case Ext.form.action.Action.SERVER_INVALID:
                    //Failure type returned when server side processing fails and the result's success property is set to false
                    //TODO: CAMBIAR ESTO POR UN MENSAJE EN EL PROPIO FORMULARIO
                    if (action.response.responseText.indexOf("ERROR 0x00002") !== -1)
                        showErrorMessage(message, {soft: false});
                    else
                        showErrorMessage('Server internal error.<br>Server response: ' + action.response.responseText, {soft: false});
                    break;
            }
        }
    }
});
