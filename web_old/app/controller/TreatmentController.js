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
 * - TreatmentController
 * 
 * THIS CONTROLLER CONTAINS THE FOLLOWING HANDLERS
 * - loadTreatmentModelHandler
 * - loadAllTreatmentsHandler
 * - showTreatmentDetailsButtonHandler
 * - showCreateTreatmentWindowHandler
 * - createNewTreatmentAcceptButtonHandler
 * - updateTreatmentButtonHandler
 * - editTreatmentButtonHandler
 * - removeTreatmentHandler
 * - checkRemovableInstance
 * - getCredentialsParams
 * 
 */
Ext.define('SL.controller.TreatmentController', {
    extend: 'Ext.app.Controller',
    loadTreatmentModelHandler: function (treatmentCreationWindows, _treatment_id, afterLoadFunction) {
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_TREATMENT,
            method: 'POST',
            params: me.getCredentialsParams({treatment_id: _treatment_id}),
            success: function (response) {
                // responseText should be in json format
                try {
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    var treatmentList = jsonResponse['treatmentList'];
                    if (treatmentList.length < 1) {
                        showErrorMessage('Extraction protocol not found for the given ID.', {soft: true, delay: 5000});
                        return;
                    }

                    var newModel = SL.model.SampleModels.Treatment.loadFromJSON(treatmentList[0]);

                    treatmentCreationWindows.loadModel(newModel);

                    if (afterLoadFunction) {
                        afterLoadFunction();
                    }

                    treatmentCreationWindows.setLoading(false);

                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'TreatmentController:loadTreatmentModelHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
            },
            failure: function (response) {
                ajaxErrorHandler("TreatmentController", "loadTreatmentModelHandler", response);
            }
        });

    },
    /**
     * This function send the an Get all Treatments request to the SERVER in order
     * get the list of Treatments stored in database.
     * 
     * @param {type} treatmentSelectionView
     * @returns {undefined}
     */
    loadAllTreatmentsHandler: function (treatmentSelectionView) {
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_ALL_TREATMENTS,
            method: 'POST',
            params: this.getCredentialsParams(),
            success: function (response) {
                var jsonResponse = Ext.JSON.decode(response.responseText);
                var treatmentList = jsonResponse['treatmentList'];
                if (treatmentList.length < 1) {
                    showWarningMessage('No Protocols found in Database, please Add new Protocols before continue.', {soft: true});
                } else {
                    var treatmentsList = [];
                    for (var i in treatmentList) {
                        treatmentsList.push(SL.model.SampleModels.Treatment.loadFromJSON(treatmentList[i]));
                    }
                    treatmentSelectionView.loadModels(treatmentsList);
                }
            },
            failure: function (response) {
                ajaxErrorHandler("TreatmentController", "treatmentWindowAfterRenderHandler", response);
            }
        });
    },
    /**
     * 
     * @param {type} parentView
     * @returns {undefined}
     */
    showTreatmentListButtonClickHandler: function (parentView) {
        var treatmentSelectionWindow = Ext.create('SL.view.SampleViews.TreatmentSelectionWindow', {parent: parentView});
        treatmentSelectionWindow.show(function () {
            parentView.loadModels(treatmentSelectionWindow.queryById('treatmentList').getModels());
        });
    },
    /**
     * 
     * @param {type} treatmentModel
     * @param {type} mode
     * @returns {undefined}
     */
    showTreatmentDetailsButtonHandler: function (treatmentModel, mode) {
        var treatmentCreationWindow = Ext.create('SL.view.SampleViews.TreatmentCreationWindow');
        treatmentCreationWindow.loadModel(treatmentModel);
        treatmentCreationWindow.show('inspect', function () {
        });
        if (mode === "edition") {
            var button = treatmentCreationWindow.queryById("editButton");
            button.fireEvent("click", button);
        }
    },
    /**
     * 
     * @param {type} treatmentSelectionWindow
     * @returns {undefined}
     */
    showCreateTreatmentWindowHandler: function (treatmentSelectionWindow) {
        var treatmentCreationWindow = Ext.create('SL.view.SampleViews.TreatmentCreationWindow');
        var treatmentModel = Ext.create('SL.model.SampleModels.Treatment');
        treatmentModel.addOwner(Ext.create('SL.model.User', {user_id: Ext.util.Cookies.get('loggedUser')}));
        var controller = this;
        treatmentCreationWindow.loadModel(treatmentModel);

        treatmentCreationWindow.show('creation', function () {
            //Action called after close the dialog
            if (treatmentCreationWindow.changedSaved === true) {
                //UPDATE THE LIST VIEW
                controller.loadAllTreatmentsHandler(treatmentSelectionWindow);
            }
        });
    },
    /**
     * 
     * @param {type} treatmentCreationWindows
     * @returns {undefined}
     */
    createNewTreatmentAcceptButtonHandler: function (treatmentCreationWindows) {
        var form = treatmentCreationWindows.queryById('treatmentFields');
        form = form.getForm(); // get the basic form
        if (form.isValid()) { // make sure the form contains valid data before submitting

            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
            form.submit({
                method: 'POST',
                waitMsg: 'Sending the information, Please wait...',
                /*
                 * DUE TO SOME WEB BROWSER (ie: GOOGLE CHROME) SEND TO THE SERVER, BEFORE THE POST REQUEST,
                 * AN OPTIONS REQUEST, IN ORDER TO TEST THE SERVER AVALIBILITY,
                 * WE'VE TO CONFIGURE THE PACKAGE'S HEADER
                 */
                headers: {'Accept': 'application/json'},
                params: this.getCredentialsParams(),
                url: SERVER_URL + SERVER_PORT + SERVER_URL_ADD_TREATMENT,
                clientValidation: true,
                success: function (form, action) {
                    showSuccessMessage('New treatment created successfully');
                    //1.UPDATE THE MODEL
                    treatmentCreationWindows.setViewMode('inspect');
                    var jsonResponse = Ext.JSON.decode(action.response.responseText);
                    var treatment_id = jsonResponse['newID'];
                    var treatmentModel = treatmentCreationWindows.getModel();
                    treatmentModel.setID(treatment_id);
                    treatmentModel.setName(treatmentCreationWindows.getName());
                    treatmentModel.setDescription(treatmentCreationWindows.getDescription());
                    treatmentModel.setBiomolecule(treatmentCreationWindows.getBiomolecule());
                    treatmentModel.setOwners(treatmentCreationWindows.getOwners());

                    treatmentCreationWindows.changedSaved = true;
                    treatmentCreationWindows.setID(treatment_id);
                },
                failure: function (form, action) {
                    var response = action.response;
                    ajaxErrorHandler("TreatmentController", "createNewTreatmenAcceptButtonHandler", response);
                }
            });
        } else { // display error alert if the data is invalid
            showErrorMessage('Invalid Data. Please correct form errors.', '');
        }
    },
    /**
     * 
     * @param {type} treatmentEditionView
     * @returns {undefined}
     */
    updateTreatmentButtonHandler: function (treatmentEditionView) {
        var form = treatmentEditionView.queryById('treatmentFields');
        form = form.getForm(); // get the basic form
        if (form.isValid()) { // make sure the form contains valid data before submitting

            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
            form.submit({
                method: 'POST',
                waitMsg: 'Sending the information, Please wait...',
                /*
                 * DUE TO SOME WEB BROWSER (ie: GOOGLE CHROME) SEND TO THE SERVER, BEFORE THE POST REQUEST,
                 * AN OPTIONS REQUEST, IN ORDER TO TEST THE SERVER AVALIBILITY,
                 * WE'VE TO CONFIGURE THE PACKAGE'S HEADER
                 */
                headers: {'Accept': 'application/json'},
                params: this.getCredentialsParams({treatment_id: form.getRecord().get('treatment_id')}),
                url: SERVER_URL + SERVER_PORT + SERVER_URL_UPDATE_TREATMENT,
                clientValidation: true,
                success: function (form, action) {
                    showSuccessMessage('Protocol updated successfully');
                    treatmentEditionView.setViewMode('inspect');
                    var treatmentModel = treatmentEditionView.getModel();
                    treatmentModel.setName(treatmentEditionView.getName());
                    treatmentModel.setDescription(treatmentEditionView.getDescription());
                    treatmentModel.setBiomolecule(treatmentEditionView.getBiomolecule());
                    treatmentModel.setOwners(treatmentEditionView.getOwners());
                    //2.NOTIFY THE OBSERVERS
                    treatmentModel.notifyObservers();
                },
                failure: function (form, action) {
                    var response = action.response;
                    ajaxErrorHandler("TreatmentController", "updateTreatmentButtonHandler", response);
                }
            });
        } else { // display error alert if the data is invalid
            showErrorMessage('Invalid Data. Please correct form errors.', '');
        }
    },
    /**
     * 
     * @param {type} treatmentView
     * @returns {undefined}
     */
    editTreatmentButtonHandler: function (treatmentView) {
        //TODO: CONTROL THAT OTHER USERS CAN NOT EDIT A STEP WHILE SOMEBODY IS EDITING IT
        var treatment_model = treatmentView.getModel();

        var current_user_id = '' + Ext.util.Cookies.get('loggedUser');
        if (treatment_model.isOwner(current_user_id) === false && current_user_id !== "admin") {
            console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over this protocol.");
            showErrorMessage("User " + current_user_id + " has not Edition privileges over the selected protocol.</br>Only Owners can edit this information. Please, contact with listed owners or with administrator to get more privileges.", '');
            return;
        }

        treatmentView.setViewMode("edition");
        treatmentView.queryById('acceptButton').handler = function () {
            treatmentView.getController().updateTreatmentButtonHandler(treatmentView);
        };
    },
    /**
     * 
     * @param {type} treatmentSelectionWindow
     * @param {type} treatmentModel
     * @returns {undefined}
     */
    removeTreatmentHandler: function (treatmentSelectionWindow, treatmentModel) {
        var me = this;

        var current_user_id = '' + Ext.util.Cookies.get('loggedUser');
        if (treatmentModel.isOwner(current_user_id) === false && current_user_id !== "admin") {
            console.error((new Date()).toLocaleString() + "DELETION REQUEST DENIED. Error message: User " + current_user_id + " has not enough privileges over this batch.");
            showErrorMessage("User " + current_user_id + " has not enough privileges over the selected batch.</br>Only Owners can remove this information. Please, contact with listed owners or with administrator to get more privileges.", '');
            return;
        }
        var onSuccessAction = function () {
            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
            Ext.Ajax.request({
                url: SERVER_URL + SERVER_PORT + SERVER_URL_REMOVE_TREATMENT,
                method: 'POST',
                params: me.getCredentialsParams({treatment_id: treatmentModel.getID()}),
                success: function (response) {
                    showSuccessMessage("Treatment " + treatmentModel.getID() + "removed successfully");
                    me.loadAllTreatmentsHandler(treatmentSelectionWindow);
                },
                failure: function (response) {
                    ajaxErrorHandler("TreatmentController", "removeTreatmentHandler", response);
                }
            });
        };

        me.checkRemovableInstance(treatmentModel.getID(), "treatment", onSuccessAction);
    },
    /**
     * 
     * @param {type} objectID
     * @param {type} objectType
     * @param {type} onSuccessAction
     * @returns {undefined}
     */
    checkRemovableInstance: function (objectID, objectType, onSuccessAction) {
        var me = this;

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_CHECK_REMOVABLE_TREATMENT,
            method: 'POST',
            params: me.getCredentialsParams({'object_id': objectID, object_type: objectType}),
            success: function (response) {
                // responseText should be in json format
                try {
                    //IF THE REQUEST WAS SENT SUCCESSFULLY
                    var jsonResponse = Ext.JSON.decode(response.responseText);

                    //IF SUCCESS == TRUE, IT MEANS THAT THE OBJECT WAS BLOCKED SUCCESSFULLY, SO WE CAN EDIT IT
                    if (jsonResponse.success === true) {
                        onSuccessAction();
                    } else {
                        if (objectType === "treatment") {
                            showErrorMessage('This element is associated to one or more Analytical Samples.</br>' +
                                    'In order to keep data consistence, it is not possible to remove yet.</br>' +
                                    'Please edit or remove first the following Analytical Samples and try again.</br>' +
                                    "<p>Analytical Sample IDs: " + ("" + jsonResponse.analyticalSampleIds).replace(/,/g, ", ") + "</p>", {title: 'Object not removable', soft: false});
                        }
                    }
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'TreatmentController:checkRemovableInstance:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
            },
            failure: function (response) {
                ajaxErrorHandler("TreatmentController", "checkRemovableInstance", response);
            }
        });
    },
    /**
     * 
     * @param {type} request_params
     * @returns {TreatmentControllerAnonym$0.getCredentialsParams.credentials}
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
