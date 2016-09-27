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
 * - BatchController
 * 
 * THIS CONTROLLER CONTAINS THE FOLLOWING HANDLERS
 * - loadAllBatchesEventHandler
 * - showBatchDetailsButtonHandler
 * - showCreateBatchWindowHandler
 * - createNewBatchAcceptButtonHandler
 * - updateBatchButtonHandler
 * - editBatchButtonHandler
 * - removeBatchHandler
 * - checkRemovableInstance
 * - getCredentialsParams
 * 
 */
Ext.define('SL.controller.BatchController', {
    extend: 'Ext.app.Controller',
    /********************************************************************************      
     * This function send the an Get all Batches request to the SERVER in order
     * get the list of Batches stored in database.
     *  
     * @param  batchSelectionWindow the BatchListView panel which fires the get treatments action
     ********************************************************************************/
    loadAllBatchesEventHandler: function (batchSelectionWindow) {
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_ALL_BATCHS,
            method: 'POST',
            params: this.getCredentialsParams(),
            success: function (response) {
                var jsonResponse = Ext.JSON.decode(response.responseText);
                var batchList = jsonResponse['batchList'];
                if (batchList.length < 1) {
                    showWarningMessage('No Experimental batches found in Database, please register new Experimental batches before continue.', {soft: true, delay: 5000});
                } else {
                    var batchesList = [];
                    for (var i in batchList) {
                        batchesList.push(SL.model.SampleModels.Batch.loadFromJSON(batchList[i]));
                    }
                    batchSelectionWindow.loadModels(batchesList);
                }
            },
            failure: function (response) {
                ajaxErrorHandler("BatchController", "batchWindowAfterRenderHandler", response);
            }
        });

    },
    showBatchDetailsButtonHandler: function (batchModel, mode) {
        var batchCreationWindow = Ext.create('SL.view.SampleViews.BatchCreationWindow');
        batchCreationWindow.loadModel(batchModel);
        batchCreationWindow.show('inspect', function () {
        });
        if (mode === "edition") {
            var button = batchCreationWindow.queryById("editButton");
            button.fireEvent("click", button);
        }
    },
    showCreateBatchWindowHandler: function (batchSelectionWindow) {
        var batchCreationWindow = Ext.create('SL.view.SampleViews.BatchCreationWindow');
        var batchModel = Ext.create('SL.model.SampleModels.Batch');
        batchModel.addOwner(Ext.create('SL.model.User', {user_id: Ext.util.Cookies.get('loggedUser')}));
        var controller = this;
        batchCreationWindow.loadModel(batchModel);

        batchCreationWindow.show('creation', function () {
            //Action called after close the dialog
            if (batchCreationWindow.changedSaved === true) {
                //UPDATE THE LIST VIEW
                controller.loadAllBatchesEventHandler(batchSelectionWindow);
            }
        });
    },
    createNewBatchAcceptButtonHandler: function (batchCreationWindow) {
        if (batchCreationWindow.validateContent()) {
            var form = batchCreationWindow.down('form').getForm();
            /*
             * DUE TO SOME WEB BROWSER (ie: GOOGLE CHROME) SEND TO THE SERVER, BEFORE THE POST REQUEST,
             * AN OPTIONS REQUEST, IN ORDER TO TEST THE SERVER AVALIBILITY,
             * WE'VE TO CONFIGURE THE PACKAGE'S HEADER
             */
            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
            form.submit({
                method: 'POST',
                waitMsg: 'Sending the information, Please wait...',
                params: this.getCredentialsParams(),
                url: SERVER_URL + SERVER_PORT + SERVER_URL_ADD_BATCH,
                clientValidation: true,
                success: function (form, action) {
                    //IF SUCCESS
                    showSuccessMessage('New Experimental batch saved successfully');
                    //1.UPDATE THE MODEL
                    batchCreationWindow.setViewMode('inspect');
                    var batchModel = batchCreationWindow.getModel();
                    batchModel.setName(batchCreationWindow.getName());
                    batchModel.setDescription(batchCreationWindow.getDescription());
                    batchModel.setCreationDate(batchCreationWindow.getCreationDate());
                    batchModel.setOwners(batchCreationWindow.getOwners());
                    //SET THE ID FOR THE NEW MODEL TO THE ID RETURNED BY THE SERVER
                    var jsonResponse = Ext.JSON.decode(action.response.responseText);
                    var batch_id = jsonResponse['newID'];
                    batchModel.setID(batch_id);
                    batchCreationWindow.changedSaved = true;
                    batchCreationWindow.setID(batch_id);
                    //WHEN THE USER CLOSE THE DIALOG THE CALLBACK FUNCTION WILL ADD THE NEW MODEL TO THE LIST OF BATCHES
                },
                failure: function (form, action) {
                    var response = action.response;
                    ajaxErrorHandler("BatchController", "createNewBatchAcceptButtonHandler", response);
                }
            });
        } else { // display error alert if the data is invalid
            showErrorMessage('Invalid Data. Please correct form errors.', '');
        }
    },
    updateBatchButtonHandler: function (batchCreationWindow) {
        if (batchCreationWindow.validateContent()) {
            var form = batchCreationWindow.down('form').getForm();

            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
            form.submit({
                method: 'POST',
                waitMsg: 'Sending the information, Please wait...',
                /*
                 * DUE TO SOME WEB BROWSER (ie: GOOGLE CHROME) SEND TO THE SERVER, BEFORE THE POST REQUEST,
                 * AN OPTIONS REQUEST, IN ORDER TO TEST THE SERVER AVALIBILITY,
                 * WE'VE TO CONFIGURE THE PACKAGE'S HEADER
                 */
                params: this.getCredentialsParams({batch_id: form.getRecord().get('batch_id')}),
                url: SERVER_URL + SERVER_PORT + SERVER_URL_UPDATE_BATCH,
                clientValidation: true,
                success: function (form, action) {
                    //IF SUCCESS
                    showSuccessMessage('Experimental batch updated successfully');
                    //1.UPDATE THE MODEL
                    batchCreationWindow.setViewMode('inspect');
                    var batchModel = batchCreationWindow.getModel();
                    batchModel.setName(batchCreationWindow.getName());
                    batchModel.setDescription(batchCreationWindow.getDescription());
                    batchModel.setCreationDate(batchCreationWindow.getCreationDate());
                    batchModel.setOwners(batchCreationWindow.getOwners());
                    //2.NOTIFY THE OBSERVERS
                    batchModel.notifyObservers();
                },
                failure: function (form, action) {
                    var response = action.response;
                    ajaxErrorHandler("BatchController", "updateBatchButtonHandler", response);
                }
            });
        } else { // display error alert if the data is invalid
            showErrorMessage('Invalid Data. Please correct form errors.', '');
        }
    },
    editBatchButtonHandler: function (batchView) {
        //TODO: CONTROL THAT OTHER USERS CAN NOT EDIT A STEP WHILE SOMEBODY IS EDITING IT
        var batch_model = batchView.getModel();
        debugger;
        var current_user_id = '' + Ext.util.Cookies.get('loggedUser');
        if (batch_model.isOwner(current_user_id) === false && current_user_id !== "admin") {
            console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over this batch.");
            showErrorMessage("User " + current_user_id + " has not Edition privileges over the selected batch.</br>Only Owners can edit this information. Please, contact with listed owners or with administrator to get more privileges.", '');
            return;
        }

        batchView.setViewMode("edition");
        batchView.queryById('acceptButton').handler = function () {
            batchView.getController().updateBatchButtonHandler(batchView);
        };
    },
    removeBatchHandler: function (batchSelectionWindows, batchModel) {
        var me = this;

        var current_user_id = '' + Ext.util.Cookies.get('loggedUser');
        if (batchModel.isOwner(current_user_id) === false && current_user_id !== "admin") {
            console.error((new Date()).toLocaleString() + "DELETION REQUEST DENIED. Error message: User " + current_user_id + " has not enough privileges over this batch.");
            showErrorMessage("User " + current_user_id + " has not enough privileges over the selected batch.</br>Only Owners can remove this information. Please, contact with listed owners or with administrator to get more privileges.", '');
            return;
        }

        var onSuccessAction = function () {
            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
            Ext.Ajax.request({
                url: SERVER_URL + SERVER_PORT + SERVER_URL_REMOVE_BATCH,
                method: 'POST',
                params: me.getCredentialsParams({batch_id: batchModel.getID()}),
                success: function (response) {
                    showSuccessMessage("Batch " + batchModel.getID() + "removed successfully");
                    me.loadAllBatchesEventHandler(batchSelectionWindows);
                },
                failure: function (response) {
                    ajaxErrorHandler("BatchController", "removeBatchHandler", response);
                }
            });
        };

        me.checkRemovableInstance(batchModel.getID(), "batch", onSuccessAction);
    },
    checkRemovableInstance: function (objectID, objectType, onSuccessAction) {
        var me = this;

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_CHECK_REMOVABLE_BATCH,
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
                        if (objectType === "batch") {
                            showErrorMessage('This element is associated to one or more Biological Samples.</br>' +
                                    'In order to keep data consistence, it is not possible to remove yet.</br>' +
                                    'Please edit or remove first the following Biological Samples and try again.</br>' +
                                    "<p>Biological Sample IDs: " + ("" + jsonResponse.biologicalSampleIds).replace(/,/g, ", ") + "</p>", {title: 'Object not removable', soft: false});
                        }
                    }
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'BatchController:checkRemovableInstance:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
            },
            failure: function (response) {
                ajaxErrorHandler("BatchController", "checkRemovableInstance", response);
            }
        });
    },
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
