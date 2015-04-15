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
 * - adminExperimentsButtonHandler
 * - browseExperimentButtonHandler
 * - inspectCurrentExperimentButtonHandler
 * - showExperimentDetailsHandler
 * - newExperimentButtonHandler
 * - acceptButtonPressedHandler
 * - cancelButtonPressedHandler
 * - editButtonPressedHandler
 * - clean_task_queue
 * - execute_tasks
 * - changeCurrentExperimentHandler
 * - changeCurrentExperiment
 * - send_create_experiment
 * - send_update_experiment
 * - send_remove_experiment
 * - send_unblock_experiment
 * - getMoreTimeButtonHandler
 * - loadAllExperimentsHandler
 * - loadExperimentHandler
 * - getCredentialsParams
 * 
 */
Ext.define('SL.controller.ExperimentController', {
    extend: 'Ext.app.Controller',
    /**
     * This function handles the event fired when the "Experiment admin" button is pressed at administrator main menu.
     * First creates a window that contains a ElementListSelector panel, ie. a grid panel with some extra settings, 
     * in order to list all the registered experiments.This window also contains some buttons to Add/edit/remove 
     * experiments.
     * 
     * After that calls to the loadAllExperimentsHandler function which send a request to server in order to load all 
     * experiments. 
     * 
     * @param button the "Experiment admin" button that fired the event
     * @returns {undefined}
     */
    adminExperimentsButtonHandler: function (button) {
        var theController = this;
        Ext.require(['SL.view.senchaExtensions.ElementListSelector', 'SL.view.ExperimentView', 'SL.model.Experiment'], function () {
            // Creates a new window that contains a ElementListSelector panel in order to list all the registered experiments
            var experimentListWindow = Ext.create('Ext.window.Window', {
                //Set layout and size
                layout: 'fit', minWidth: 800, minHeight: 600,
                //Other settings
                title: 'Experiments administration', closable: false, modal: true,
                //Empty window (Panel is added later)
                items: [],
                //Top toolbar with options for Create/Edit/Remove experiments
                tbar: [
                    {xtype: 'button', cls: 'acceptButton', text: '<i class="fa fa-plus-circle"></i> Register new experiment',
                        handler: function () {
                            experimentListWindow.close();
                            theController.newExperimentButtonHandler();
                        }
                    },
                    {xtype: 'button', cls: 'cancelButton', text: '<i class="fa fa-trash"></i> Remove selected experiment',
                        //Shows a dialog to confirm the item deletion. If user accepts, then calls to send_remove_experiment function
                        handler: function (button) {
                            var askToContinue = function (buttonId, text, opt) {
                                if (buttonId === "yes") {
                                    var selected_exp_ids = experimentListWindow.down('ElementListSelector').getSelectedExperimentsIDs();
                                    if (selected_exp_ids.length > 0) {
                                        theController.send_remove_experiment(experimentListWindow, selected_exp_ids[0], experimentListWindow, "updateView");
                                    }
                                }
                            };
                            Ext.MessageBox.show({
                                title: 'Delete Experiment?',
                                msg: 'All associated analysis will be deleted. Changes can not be undone.<br/>Are you sure to continue?',
                                buttons: Ext.MessageBox.YESNO,
                                fn: askToContinue,
                                icon: Ext.MessageBox.QUESTION
                            });
                        }
                    }
                ],
                buttons: [
                    {text: '<i class="fa fa-remove"></i> Close', cls: 'cancelButton', handler: function () {
                            this.up('window').close();
                        }}
                ],
                /**
                 * This function load all registered Experiments in the ElementListSelector by using the loadAllExperimentsHandler 
                 * function which send a request to server in order to load all experiments. 
                 * 
                 * @returns {undefined}
                 */
                updateView: function () {
                    theController.loadAllExperimentsHandler(experimentListWindow.down('ElementListSelector'));
                }
            });
            //Creates the ElementListSelector and add it to the experimentListWindow
            experimentListWindow.add(
                    Ext.create('SL.view.senchaExtensions.ElementListSelector',
                            {
                                //Some settings
                                itemId: "experimentBrowsePanel",
                                title: 'Experiment Browser', border: true, region: 'center', iconCls: 'tabBrowse', closable: true,
                                //Set the Columns names and keys for autoloading.
                                fieldsNames: [['Experiment ID', "experiment_id"], ['Title', "title"], ['Abstract', "experiment_abstract"]],
                                //Set the sizes for columns (-1 means flexible column)
                                columnsWidth: [100, -1, -1],
                                //Disable multiselection
                                allowMultiselect: false,
                                /**BC*******************************************************************************************************
                                 * This function returns all selected Experiments
                                 * @return selected experiments
                                 **EC******************************************************************************************************/
                                getSelectedExperiments: function () {
                                    return this.getSelectedData();
                                },
                                /**BC*******************************************************************************************************
                                 * This function returns all selected Experiment IDs
                                 * @return selected experiment IDs
                                 **EC******************************************************************************************************/
                                getSelectedExperimentsIDs: function () {
                                    var selectedExperiments = this.getSelectedData();
                                    var selectedExperimentsIDs = [];
                                    for (var i = 0; i < selectedExperiments.length; i++) {
                                        selectedExperimentsIDs.push(selectedExperiments[i].experiment_id);
                                    }
                                    return selectedExperimentsIDs;
                                },
                                gridpanelDblClickHandler: function (grid, record) {
                                }
                            }));
            //Load all experiments (update view)
            experimentListWindow.updateView();
            //Set the width and height and show the window.
            experimentListWindow.setHeight(Ext.getBody().getViewSize().height * 0.7);
            experimentListWindow.setWidth(Ext.getBody().getViewSize().width * 0.6);
            experimentListWindow.show();
        });
    },
    /**
     * This function handles the event fires when the button "Browse Sample" is clicked.
     * First creates a new ElementListSelector listing all the Experiment stored in the server.
     * When a Experiment is selected to be inspected (double click or button Inspect), a new 
     * Experiment is created and opened.
     *  
     * @returns {undefined}
     */
    browseExperimentButtonHandler: function () {
        Ext.getCmp('mainView').changeMainView("ExperimentListView").updateContent();
    },
    /**
     * This function handles the event fired when the button "Inspect current experiment" is clicked at HomePanel
     * First, creates a ExperimentDetailsView Panel for experiment details and calls the funtion loadExperimentHandler
     * located in this Controller in order to load from server the EXperiment information.
     * 
     * @returns {undefined}
     */
    inspectCurrentExperimentButtonHandler: function () {
        //Get the current experiment ID
        if (Ext.util.Cookies.get('currentExperimentID') === "Not selected") {
            showErrorMessage("No experiment selected.\nPlease switch to an existing experiment or create a new one before continue.", {soft: true});
            return;
        }

        var currentExperimentID = Ext.util.Cookies.get('currentExperimentID');

        if (currentExperimentID == null) {
            showErrorMessage("Please choose first an Experiment");
            return;
        }
        this.showExperimentDetailsHandler(currentExperimentID);
    },
    /**
     * This function handles ....
     * 
     * @param {type} experimentID
     * @returns {undefined}
     */
    showExperimentDetailsHandler: function (experimentID) {
        var mainView = Ext.getCmp('mainView');
        var experimentView = mainView.changeMainView("ExperimentDetailsView");
        console.info((new Date()).toLocaleString() + " OPENING Experiment " + experimentID + " FOR INSPECT");
        var doAfterLoading = function () {
            experimentView.setViewMode('inspect');
            mainView.setLoading(false);
        };
        mainView.setLoading(true);
        this.loadExperimentHandler(experimentID, experimentView, doAfterLoading);
    },
    /**
     * This auxiliar function creates a new Window containing an empty ExperimentDetailsView Panel for new experiment
     * registration.
     * 
     * @returns {undefined}
     */
    newExperimentButtonHandler: function () {
        //1. Create the new model
        var newModel = Ext.widget('Experiment');

        newModel.addOwner(Ext.create('SL.model.User', {user_id: '' + Ext.util.Cookies.get('loggedUser')}));
        newModel.setLastEditionDate(new Date());
        newModel.setSubmissionDate(new Date());

        //2. Create the new view
        var mainView = Ext.getCmp('mainView');
        var experimentView = mainView.changeMainView("ExperimentDetailsView");

        //4.Load the information
        experimentView.setLoading(true);
        experimentView.loadModel(newModel);
        newModel.addObserver(experimentView);
        experimentView.setViewMode('creation');
        experimentView.setLoading(false);
    },
    /**
     * This function handles the event accept_button_pressed fires in other Controller (eg. ApplicationController)
     * when a button Accept is pressed.
     *  
     * @param {type} experimentView
     * @returns {undefined}
     */
    acceptButtonPressedHandler: function (experimentView) {
        experimentView.setLoading(true);

        //Check if the information in the form is valid
        if (!experimentView.validateContent()) {
            experimentView.setLoading(false);
            console.error((new Date()).toLocaleString() + "SAVING Experiment REQUEST ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            showErrorMessage('Invalid Data. Please correct form errors.');
            return;
        }
        if (experimentView.isInEditionMode()) {
            experimentView.addNewTask("edit_experiment", null);
        }

        //Update the model
        var model = experimentView.getModel();
        model.setID(experimentView.getID());
        model.setTitle(experimentView.getTitle());
        model.setDescription(experimentView.getDescription());
        model.setIsTimeCourseType(experimentView.isTimeCourseType());
        model.setIsCaseControlType(experimentView.isCaseControlType());
        model.setIsSurvivalType(experimentView.isSurvivalType());
        model.setIsSingleCondition(experimentView.isSingleCondition());
        model.setIsMultipleCondition(experimentView.isMultipleCondition());
        //biological_rep_no
        //technical_rep_no
        model.setContainsChipSeq(experimentView.getContainsChipSeq());
        model.setContainsDNaseSeq(experimentView.getContainsDNaseSeq());
        model.setContainsMethylSeq(experimentView.getContainsMethylSeq());
        model.setContainsmRNASeq(experimentView.getContainsmRNASeq());
        model.setContainsSmallRNASeq(experimentView.getContainsSmallRNASeq());
        model.setContainsMetabolomics(experimentView.getContainsMetabolomics());
        model.setContainsProteomics(experimentView.getContainsProteomics());
        model.setContainsOther(experimentView.getContainsOther());
        model.setPublicReferences(experimentView.getPublicReferences());
        model.setSubmissionDate(experimentView.getSubmissionDate());
        model.setLastEditionDate(experimentView.getLastEditionDate());
        model.setExperimentDataDirectory(experimentView.getExperimentDataDirectory());
        model.setOwners([]);
        var owners = experimentView.getOwners();
        for (var i in owners) {
            model.addOwner(owners[i]);
        }
        
        model.setMembers([]);
        var members = experimentView.getMembers();
        for (var i in members) {
            model.addMember(members[i]);
        }

        experimentView.setTaskQueue(this.clean_task_queue(experimentView.getTaskQueue()));
        this.execute_tasks(experimentView, true);
    },
    /**
     * This function handles the cancel_button_pressed thown by the Application Controller
     * when the Cancel button located in MainView is pressed and the inner panel is an
     * ExperimentDetailsView panel.
     * Asks the user if close without save changes. If user selects "Yes", the panel is closed.
     * if the panel was in a "Editing mode" (if the panel has a timer id), then sends a signal to the server in order to unblock
     * the Experiment in the list of blocked elements.
     * 
     * @param {type} experimentView
     * @param {type} force
     * @returns {undefined}
     */
    cancelButtonPressedHandler: function (experimentView, force) {
        var me = this;
        if (experimentView.isInEditionMode()) {
            var doClose = function () {
                experimentView.setLoading(true);

                experimentView.cleanCountdownDialogs();
                me.send_unblock_experiment(experimentView, null, null);
                //If the model has changed (added a new AS or edited some values) --> restore
                if (experimentView.getModel().hasChanged()) {
                    experimentView.getModel().restoreFromMemento(experimentView.memento);
                }
                //Remove the memento
                experimentView.memento = null;

                experimentView.loadModel(experimentView.getModel());
                experimentView.setViewMode("inspect");
                experimentView.clearTaskQueue();
                experimentView.setLoading(false);
//                experimentView.doLayout();
            };
            if (force === true) {
                doClose();
            } else {
                var askToContinue = function (buttonId, text, opt) {
                    if (buttonId === "yes") {
                        doClose();
                    }
                };
                Ext.MessageBox.show({
                    title: 'Exit without save?',
                    msg: 'You are closing the form before save changes. <br/>Would you like to continue?',
                    buttons: Ext.MessageBox.YESNO,
                    fn: askToContinue,
                    icon: Ext.MessageBox.QUESTION
                });
            }
        } else {
            experimentView.clearTaskQueue();

            var mainView = Ext.getCmp('mainView');
            mainView.setButtonsStatus(false);
            mainView.changeMainView("ExperimentListView").updateContent();
        }
    },
    /**
     * This function send a Edition request to the server in order to block the Experiment
     * avoiding that other users edit it before the user saves the changes.
     * Each user has 30 minutes max. to edit a Experiment, after that the user will be 
     * ask again, if no answer is given, the Experiment is unblocked and changes will be  
     * lost.
     * This is neccessary because if the user leaves the application without save or close the panel,
     * the server MUST free the blocked object in order to let other users edit it.
     * After BLOCKET_TIME minutes, the server automatically frees the blocked object, so the user
     * will be asked 1 minute before the liberation takes place.
     * 
     * @param {type} experimentView
     * @returns {undefined}
     */
    editButtonPressedHandler: function (experimentView) {
        //FIRST STEP: CHECK IF THE USER HAS EDITING PRIVILEGES OVER THE Experiment (ONLY OWNERS)
        //TODO: THIS CODE COULD BE BETTER IN THE SERVER (JAVASCRIPT IS VULNERABLE)
        var current_user_id = '' + Ext.util.Cookies.get('loggedUser');
        if (!experimentView.getModel().isOwner(current_user_id) && current_user_id !== "admin") {
            console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over the Experiment " + experimentView.getExperimentID());
            showErrorMessage("User " + current_user_id + " has not Edition privileges over the Experiment " + experimentView.getExperimentID() + "</br>Only Experiment's owners can edit the information. </br>Please, contact with listed owners or with system administrator to get more privileges.", '');
            return;
        }

        var me = this;
        experimentView.setLoading(true);
        console.info((new Date()).toLocaleString() + "SENDING EDIT REQUEST FOR Experiment " + experimentView.getID() + " TO SERVER");

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_LOCK_EXPERIMENT,
            method: 'POST',
            params: me.getCredentialsParams({'experiment_id': experimentView.getID()}),
            success: function (response) {
                // responseText should be in json format
                try {

                    //IF THE REQUEST WAS SENT SUCCESSFULLY
                    var jsonResponse = Ext.JSON.decode(response.responseText);

                    //IF SUCCESS == TRUE, IT MEANS THAT THE OBJECT WAS BLOCKED SUCCESSFULLY, SO 
                    //WE CAN EDIT IT
                    if (jsonResponse['success']) {
                        console.info((new Date()).toLocaleString() + "EDITION ALLOWED FOR Experiment " + experimentView.getID());

                        experimentView.initializeCountdownDialogs();
                        experimentView.setViewMode("edition");
                        experimentView.setLoading(false);
                        experimentView.memento = experimentView.getModel().getMemento();
                        experimentView.doLayout();
                    } else {
                        console.info((new Date()).toLocaleString() + " EDITION NOT ALLOWED FOR Experiment " + experimentView.getID());

                        showErrorMessage('Apparently another user opens this object for editing. </br>Please, try again later. If the problem persists, please contact with tecnical support.', '');
                        experimentView.setLoading(false);
                        experimentView.doLayout();
                    }

                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'ExperimentController:edit_button_pressed:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
            },
            failure: function (response) {
                ajaxErrorHandler("ExperimentController", "edit_button_pressed", response);
            }
        });
        console.info((new Date()).toLocaleString() + "EDIT REQUEST FOR Experiment " + experimentView.getID() + " SENT TO SERVER");
    },
    /**
     * 
     * @param {type} tasks_queue
     * @returns {Array}
     */
    clean_task_queue: function (tasks_queue) {
        console.info((new Date()).toLocaleString() + "CLEANING TASK QUEUE");
        try {
            if (tasks_queue.length === 0) {
                return tasks_queue;
            }

            //IF THE QUEUE INCLUDES A CREATION TASK
            //The create_new_experiment task must be always in the first position (if we are creating a new experiment)
            if (tasks_queue[0].command === "create_new_experiment") {
                //The experiment creation send all the information (experiment, bioreplicates, ... )to the server in only one step 
                //So it's neccessary to remove all the tasks related with bioreplicates and analytical replicates insertion.
                //After that only "create_new_experiment" and others tasks like "send_treatment_document" should be in the queue
                var tasks_queue_temp = [tasks_queue[0]];
                return tasks_queue_temp;
            }
            var tasks_queue_temp = [];
            //IF NOT, we need to "clean" the queue removing pairs of "create, remove" tasks and creation task for subelements
            //that would be created in the superelement creation. Eg. if we added tasks for Analytical reps creation but those
            //analytical reps are associated to a to-be-added bioreplicate, we should remove those tasks because they will be
            //inserted during the Bioreplicate insertion (because the local object has already the changes)
            tasks_queue_temp.push({command: "update_experiment", object: null});
            tasks_queue_temp.push({command: "clear_blocked_status", object: null});
            return tasks_queue_temp;
        } catch (error) {
            showErrorMessage('ERROR CLEANING TASK QUEUE: ' + error, {soft: false});
            return tasks_queue;
        }
    },
    /**********************************************************************************************
     * This function handles the tasks execution for a given experimentView and should be only called after 
     * experiment creation/edition.
     *
     * ACCEPT BUTTON should be only visible during new OBJECTS creation/edition (eg. during a experiment creation/edition) 
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
     
     * @param  experimentView the experiment view
     * @param  status true if some error occurs during execution
     * @return      
     ***********************************************************************************************/
    execute_tasks: function (experimentView, status) {
        var error_message = "";
        //GET THE NEXT TASK IN THE QUEUE
        var current_task = experimentView.getTaskQueue().shift();
        //IF THERE IS A NEXT TASK AND NO PREVIOUS ERROR
        if (current_task != null && status) {
            try {
                switch (current_task.command)
                {
                    case "create_new_experiment":
                        console.info((new Date()).toLocaleString() + "SENDING SAVE NEW experiment REQUEST TO SERVER");
                        this.send_create_experiment(experimentView, this, "execute_tasks");
                        console.info((new Date()).toLocaleString() + "SAVE NEW experiment REQUEST SENT TO SERVER");
                        break;
                    case "update_experiment":
                        console.info((new Date()).toLocaleString() + "SENDING UPDATE Experiment REQUEST TO SERVER");
                        this.send_update_experiment(experimentView, this, "execute_tasks");
                        console.info((new Date()).toLocaleString() + "UPDATE Experiment REQUEST SENT TO SERVER");
                        break;
                    case "clear_blocked_status":
                        console.info(new Date().toLocaleString() + "SENDING UNLOCK Experiment " + experimentView.getID() + " REQUEST TO SERVER");
                        this.send_unblock_experiment(experimentView, this, "execute_tasks");
                        console.info(new Date().toLocaleString() + "UNLOCK Experiment " + experimentView.getID() + " REQUEST SENT TO SERVER");
                        break;
                    default:
                        status = false;
                        break;
                }
            } catch (error) {
                error_message = error.message;
                status = false;
                experimentView.taskQueue.unshift(current_task);
            }

            if (!status) {
                showErrorMessage('Failed trying to saved the changes.</br>Please try again.</br>Error: ' + error_message);
            }
        }
        //IF NO MORE TASKS AND EVERYTHING GOES WELL
        else if (status) {
            console.info(new Date().toLocaleString() + "Experiment " + experimentView.getID() + " saved successfully");
            experimentView.cleanCountdownDialogs();

            //TODO:Check if is necessary to update the experimentView
            //Only if it is a new experiment
            experimentView.updatedNeeded = true;
            if (experimentView.updatedNeeded === true) {
                //Load all the information for the selected biocondition (including bioreplicates) and load it in the current view
                var doAfterLoading = function () {
                    experimentView.setViewMode("inspect");
                    experimentView.setLoading(false);
                    experimentView.doLayout();
                    showSuccessMessage('Experiment ' + experimentView.getID() + ' saved successfully', {soft: true});
                };
                experimentView.getModel().deleteObserver(experimentView);
                this.loadExperimentHandler(experimentView.getModel().getID(), experimentView, doAfterLoading);
            } else {
                experimentView.setViewMode("inspect");
                experimentView.setLoading(false);
                experimentView.doLayout();
                showSuccessMessage('Experiment ' + experimentView.getID() + ' saved successfully', {soft: true});
            }
        } else {
            status = false;
            experimentView.taskQueue.unshift(current_task);
            experimentView.setLoading(false);
        }
    },
    changeCurrentExperimentHandler: function (experimentView) {
        this.changeCurrentExperiment(experimentView.getModel().getID(), experimentView.getModel().getTitle());
    },
    /**BC****************************************************************************      
     * This function try to change the current selected experiment to a given one (if
     * user is member or owner).
     *
     * @param experimentID the Experiment view
     * @param experimentName the Experiment view
     * @return      
     **EC****************************************************************************/
    changeCurrentExperiment: function (experimentID, experimentName) {
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_CHANGE_CURRENT_EXPERIMENT,
            method: 'POST',
            params: me.getCredentialsParams({'experiment_id': experimentID}),
            success: function (response) {
                var jsonResponse = Ext.JSON.decode(response.responseText);
                var valid_experiment = jsonResponse['valid_experiment'];
                if (valid_experiment) {
                    var mainView = Ext.getCmp("mainView");

                    console.info((new Date()).toLocaleString() + "CHANGED TO EXPERIMENT " + experimentID + " SUCCESSFULLY");
                    Ext.util.Cookies.set('currentExperimentID', experimentID, null, location.pathname);
                    Ext.util.Cookies.set('currentExperimentName', experimentName, null, location.pathname);

                    mainView.getView('HomePanel').updateHelpPanel("<p>Current Experiment " + Ext.util.Cookies.get('currentExperimentID') + "</p><p style='font-size: 16px;color: #0081C9;'>" + Ext.util.Cookies.get('currentExperimentName') + "</p<>");
                    showSuccessMessage("Now you are working with Experiment " + experimentID, {soft: true});

//                    var auxView = mainView.getView('AnalysisListView');
//                    if(auxView != null){
//                        auxView.updateContent();
//                    }

//                    var analysisListView = Ext.getCmp('principalTabPanel').down('AnalysisListView');
//                    if (analysisListView != null) {
//                        Ext.getCmp('principalTabPanel').remove(analysisListView);
//                    }

                } else {
                    showErrorMessage("You are not member of the selected experiment. Please, contact administrator or experiment owners to become a member.");
                }
            },
            failure: function (response) {
                ajaxErrorHandler("ExperimentController", "changeCurrentExperiment", response);
            }
        });
    },
    /******************************************************************************      
     * This function send the experiment information contain in a given experiment_view 
     * to the SERVER in order to save a NEW experiment in the database .
     * Briefly the way of work is :
     *	1.	Check if the formulary's content is valid. If not, throws an error that should 
     *		catched in the caller function.
     *
     *	2.	If all fields are correct, then the experiment model is converted from JSON to a 
     *		JSON format STRING and sent to the server using POST. After that the function finished.
     *	
     *	3.	After a while, the server returns a RESPONSE catched inside this function. 
     *		The response has 2 possible status: SUCCESS and FAILURE.
     *		a.	If SUCCESS, then the new experiment identifier is set in the experiment_view. 
     *			After that,  isthe callback function is called, in this case the 
     *       	callback function is the "execute_task" function that will execute the next
     *           task in the TASK QUEUE of the given ExperimentDetailsView panel. This function is called
     *           with the status flag sets to TRUE (~ success).
     *		b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *       	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *           the current task is re-added to the TASK QUEUE and an error message is showed.
     *           The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     * @param  experimentView the experimentView panel which fires the create action and contains the TASK QUEUE and the experiment model. Needed for the callback function.
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @return   
     ******************************************************************************/
    send_create_experiment: function (experimentView, callback_caller, callback_function) {
        var me = this;

        //Get the BioCondition model as a Simple JSON and convert the JSON object to STRING
        var experimentModel = experimentView.getModel();
        var JSON_DATA = experimentModel.toSimpleJSON();
        JSON_DATA = Ext.encode(JSON_DATA);

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_ADD_EXPERIMENT,
            method: 'POST',
            params: me.getCredentialsParams({'experiment_json_data': JSON_DATA}),
            success: function (response) {
                try {
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    experimentModel.setID(jsonResponse['newID']);
                    //experimentModel.notifyObservers();
                    console.info((new Date()).toLocaleString() + " Experiment " + jsonResponse['newID'] + " SAVED IN SERVER SUCCESSFULLY");
                    experimentView.getModel().notifyObservers();
                } catch (error) {
                    showErrorMessage('An error ocurred trying to get the new ID of the Experiment.</br>Please contact with the technical support.', {soft: true});
                    console.warn((new Date()).toLocaleString() + " Experiment SAVED IN SERVER SUCCESSFULLY BUT RESPONSE DOES NOT INCLUDE THE ASSIGNED ID");
                }
                callback_caller[callback_function](experimentView, true);
            },
            failure: function (response) {
                ajaxErrorHandler("ExperimentController", "create_new_experiment", response);
                //Undo the task shift in the queue 
                experimentView.taskQueue.unshift({command: "create_new_experiment", object: null});
                callback_caller[callback_function](experimentView, false);
            }
        });
    },
    /******************************************************************************      
     * This function send the BioReplicatess information of the given biorepicate_model 
     * to the SERVER in order to save a NEW BIOREPLICATE in the database associated to the 
     * experiment given by the Experiment_view.
     *
     * Briefly the way of work is :
     *
     *	1.	Convert the BioReplicate model from Object to JSON format String.
     *
     *	2.	If all fields are correct, then sends the information to the server using POST 
     *		and finishes the execution.
     *	
     *	3.	After a while, the server returns a RESPONSE catched inside this function. 
     *		The response has 2 possible status: SUCCESS and FAILURE.
     *		a.	If SUCCESS, then the callback function is called, in this case the 
     *        	callback function is the "execute_task" function that will execute the next
     *           task in the TASK QUEUE of the given ExperimentVIEW panel. This function is called
     *           with the status flag sets to TRUE (~ success).
     *		b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *       	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *           the current task is re-added to the TASK QUEUE and an error message is showed.
     *           The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     *  
     * @param  experimentView the ExperimentDetailsView panel which fires the create action and contains the TASK QUEUE. Needed for the callback function.
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @return    
     ******************************************************************************/
    send_update_experiment: function (experimentView, callback_caller, callback_function) {
        var me = this;

        //Get the BioCondition model as a Simple JSON and convert the JSON object to STRING
        var experimentModel = experimentView.getModel();
        var JSON_DATA = experimentModel.toSimpleJSON();
        JSON_DATA = Ext.encode(JSON_DATA);

        var requestParams = {};
        requestParams.experiment_json_data = JSON_DATA;

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_UPDATE_EXPERIMENT,
            method: 'POST',
            params: me.getCredentialsParams(requestParams),
            success: function (response) {
                // responseText should be in json format
                console.info((new Date()).toLocaleString() + "EXPERIMENT UPDATED SUCCESSFULLY IN SERVER");
                callback_caller[callback_function](experimentView, true);
                experimentView.getModel().notifyObservers();
            },
            failure: function (response) {
                ajaxErrorHandler("ExperimentController", "send_update_experiment", response);
                //Undo the task shift in the queue 
                experimentView.taskQueue.unshift({command: "update_experiment", object: to_be_arrays});
                callback_caller[callback_function](experimentView, false);
            }
        });
    },
    /**BC****************************************************************************      
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
     * @param  experimentView the experimentView panel which fires the create action and contains the TASK QUEUE and the user model. Needed for the callback function.
     * @param  experimentID 
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @return   
     **EC****************************************************************************/
    send_remove_experiment: function (experimentView, experimentID, callback_caller, callback_function) {
        experimentView.setLoading(true);
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_REMOVE_EXPERIMENT,
            method: 'POST',
            params: me.getCredentialsParams({'experiment_id': experimentID}),
            success: function (response) {
                console.info((new Date()).toLocaleString() + " EXPERIMENT " + experimentID + " REMOVED FROM SERVER SUCCESSFULLY");
                callback_caller[callback_function](experimentView, true);
                experimentView.setLoading(false);
            },
            failure: function (response) {
                ajaxErrorHandler("ExperimentController", "send_remove_experiment", response);
                callback_caller[callback_function](experimentView, false);
                experimentView.setLoading(false);
            }
        });

    },
    /**BC****************************************************************************      
     * This function send to the server a signal to unblock the given Experiment which was blocked when the 
     * edition step started.
     * 	a.	If SUCCESS, the callback function is called, in this case the 
     *      	callback function is the "execute_task" function that will execute the next
     *       task in the TASK QUEUE of the given ExperimentVIEW panel. This function is called
     *       with the status flag sets to TRUE (~ success).
     *	b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *     	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *       the current task is re-added to the TASK QUEUE and an error message is showed.
     *       The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     * @param  experimentView the ExperimentDetailsView panel which fires the unblock action and contains the TASK QUEUE. Needed for the callback function.
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @return     
     **EC****************************************************************************/
    send_unblock_experiment: function (experimentView, callback_caller, callback_function) {
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_UNLOCK_EXPERIMENT,
            method: 'POST',
            params: me.getCredentialsParams({'experiment_id': experimentView.getID()}),
            success: function (response) {
                //if we are here, the server liberated successfully the Experiment
                //Remove the timeOut for the local blocking time
                console.info((new Date()).toLocaleString() + " Experiment " + experimentView.getID() + " UNBLOCKED SUCCESSFULLY");
                if (callback_caller != null) {
                    callback_caller[callback_function](experimentView, true);
                }
            },
            failure: function (response) {
                ajaxErrorHandler("ExperimentController", "send_unblock_experiment", response);
                //Undo the task shift in the queue 
                experimentView.taskQueue.unshift({command: "clear_blocked_status", object: null});
                if (callback_caller != null) {
                    callback_caller[callback_function](experimentView, false);
                }
            }
        });
    },
    getMoreTimeButtonHandler: function (experimentView) {
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_LOCK_EXPERIMENT,
            method: 'POST',
            params: me.getCredentialsParams({'experiment_id': experimentView.getID()}),
            success: function (response) {
                // responseText should be in json format
                try {
                    //IF THE REQUEST WAS SENT SUCCESSFULLY
                    var jsonResponse = Ext.JSON.decode(response.responseText);

                    //IF SUCCESS == TRUE, IT MEANS THAT THE OBJECT WAS BLOCKED SUCCESSFULLY, SO WE CAN EDIT IT
                    if (jsonResponse.success === true) {
                        console.info((new Date()).toLocaleString() + "EXPERIMENT " + experimentView.getID() + " LOCKED DURING 30 MINUTES MORE");
                        showWarningMessage('Experiment locked successfully for edition during 30 minutes more.', {soft: true});
                        experimentView.cleanCountdownDialogs();
                        experimentView.initializeCountdownDialogs();
                    } else {
                        console.info((new Date()).toLocaleString() + "UNABLE TO LOCK EXPERIMENT " + experimentView.getID() + " DURING 30 MINUTES MORE");
                        showErrorMessage('Unable to get extra time for Experiment edition.</br>Please save changes and try to edit again.', {soft: true});
                    }
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'ExperimentController:getMoreTimeButtonHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
                experimentView.setLoading(false);
            },
            failure: function (response) {
                ajaxErrorHandler("ExperimentController", "getMoreTimeButtonHandler", response);
            }
        });
    },
    loadAllExperimentsHandler: function (aView) {
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_ALL_EXPERIMENTS,
            method: 'POST',
            params: me.getCredentialsParams(),
            success: function (response) {
                // responseText should be in json format
                try {
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    var experimentsList = jsonResponse['experimentList'];

                    var experiments = [];

                    if (experimentsList.length === 0) {
                        showErrorMessage("No Experiment found in databases.</br>Please add New Experiment first.", {"title": "Browse Experiment", "soft": true});
                    } else {
                        for (var i in experimentsList) {
                            var newModel = SL.model.Experiment.loadFromJSON(experimentsList[i]);
                            experiments.push(newModel);
                        }
                        aView.setData(experiments);
                    }
                    aView.setLoading(false);
                } catch (error) {
                    showErrorMessage('Parsing Error at <i>' + 'ExperimentController:loadAllExperimentsHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>');
                }
            },
            failure: function (response) {
                ajaxErrorHandler("ExperimentController", "loadAllExperimentsHandler", response);
            }
        });
    },
    loadExperimentHandler: function (_experiment_id, experimentView, callback) {
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_EXPERIMENT,
            method: 'POST',
            params: me.getCredentialsParams({experiment_id: _experiment_id}),
            success: function (response) {
                try {
                    //1.DECODE THE JSON STRING AND CREATE A JSON OBJECT
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    var experimentsList = jsonResponse['experimentList'];
                    var experimentJSONData = experimentsList[0];

                    //2.CREATE A NEW OBJECT USING THE JSON DATA
                    var newModel = SL.model.Experiment.loadFromJSON(experimentJSONData);

                    //3.Load in the new view and add as it as observer
                    experimentView.loadModel(newModel);
                    newModel.addObserver(experimentView);

                    if (callback !== undefined) {
                        callback();
                    }
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'ExperimentController:loadExperimentHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
            },
            failure: function (response) {
                ajaxErrorHandler("ExperimentController", "loadExperimentHandler", response);
                this.browseExperimentButtonHandler();
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