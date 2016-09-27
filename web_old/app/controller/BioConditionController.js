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
 * - BioReplicateController
 * 
 * 
 * THIS CONTROLLER CONTAINS THE FOLLOWING HANDLERS
 * - loadDependenciesRequiredHandler
 * - browseBioConditionButtonClickHandler
 * - showBioConditionDetailsHandler
 * - copySelectedBioConditionHandler
 * - removeSelectedBioConditionHandler
 * - newBioConditionButtonHandler
 * - analyticalReplicateSelectorTabChangeHandler
 * - showBiologicalConditionDetailsWindow
 * - getBiologicalConditionDetailsPanel
 * - sendBioConditionsTemplateButtonHandler
 * - removeSelectedBioreplicateButtonClickHandler
 * - showBioreplicateDeletionDialogHandler
 * - acceptButtonPressedHandler
 * - cancelButtonPressedHandler
 * - editButtonPressedHandler
 * 
 * - clean_task_queue
 * - execute_tasks
 * - send_create_biocondition
 * - send_treatment_document
 * - send_update_biocondition
 * - send_unblock_biocondition
 * - getMoreTimeButtonHandler
 * - loadAllBioConditionsHandler
 * - loadBioConditionHandler
 * - copyBioConditionHandler
 * - removeBioConditionHandler
 * - checkRemovableInstance
 * - getCredentialsParams
 * 
 */
Ext.define('SL.controller.BioConditionController', {
    extend: 'Ext.app.Controller',
    /**
     * This function handles the event fires by the AnalysisDetailsView in order to
     * load all dependecies neccessaries to work with analysis
     */
    loadDependenciesRequiredHandler: function () {
        Ext.require(['SL.view.SampleViews.BioReplicateView', 'SL.view.SampleViews.AnalyticalReplicateView', 'SL.view.SampleViews.TreatmentView']);
        application.loadControllers(['BioReplicateController', 'BatchController', 'TreatmentController']);
    },
    /**BC*********************************************************************************************************
     * This function handles the event fires when the button "Browse Sample" is clicked.
     * First creates a new ElementListSelector listing all the bioconditions stored in the server.
     * When a BioCondition is selected to be inspected (double click or button Inspect), a new 
     * BioConditionDetailsView is created and opened.
     *  
     * @return true if created successfully     
     **EC********************************************************************************************************/
    browseBioConditionButtonClickHandler: function () {
        application.mainView.changeMainView("BioConditionListView").updateContent();
    },
    /**
     * 
     * @param {type} bioconditionID
     * @returns {undefined}
     */
    showBioConditionDetailsHandler: function (bioconditionID) {
        //1. Create a new Biocondition view
        var mainView = application.mainView;
        var bioconditionView = mainView.changeMainView("BioConditionDetailsView");
        console.info((new Date()).toLocaleString() + " OPENING BioCondition " + bioconditionID + " FOR INSPECT");

        var doAfterLoading = function () {
            bioconditionView.setViewMode('inspect');
            bioconditionView.updateWorkflowPanel(true);
            bioconditionView.setLoading(false);
        };

        bioconditionView.setLoading(true);
        this.loadBioConditionHandler(bioconditionID, bioconditionView, doAfterLoading);
    },
    /**
     * 
     * @param {type} bioconditionID
     * @returns {undefined}
     */
    copySelectedBioConditionHandler: function (bioconditionID) {
        //1. Change the content of the MainView
        var mainView = application.mainView;
        var bioconditionView = mainView.changeMainView("BioConditionDetailsView");
        console.info((new Date()).toLocaleString() + " OPENING BioCondition " + bioconditionID + " FOR COPY");

        //2.Load all the information for the selected BioCondition (including bioreplicates) and load it in the new view
        var doAfterLoading = function () {
            //Set View mode must be executed after model loading or the Biological replicate panels will be in inspect mode
            bioconditionView.setViewMode('creation');
            bioconditionView.updateWorkflowPanel(true);
            bioconditionView.setLoading(false);
        };

        bioconditionView.setLoading(true);
        this.copyBioConditionHandler(bioconditionID, bioconditionView, doAfterLoading);
    },
    /**
     * This function handles ....
     * 
     * @param {type} bioconditionID
     * @returns {undefined}
     */
    removeSelectedBioConditionHandler: function (bioconditionID) {
        var me = this;
        var onSuccessAction = function () {
            console.info((new Date()).toLocaleString() + " SENDING REMOVE REQUEST FOR BioCondition " + bioconditionID);
            me.removeBioConditionHandler(bioconditionID, function () {
            });
        };
        this.checkRemovableInstance(bioconditionID, "biocondition", onSuccessAction);
    },
    /**
     *  This function handles the event fires when the button "New BioCondition" is clicked.
     * First creates a new empty BioCondition MODEL by creating a new BioConditionDetailsView.
     * Then shows the BioConditionDetailsView panel 
     * 
     * @returns {undefined}
     */
    newBioConditionButtonHandler: function () {
        //1. Create the new model
        var newModel = Ext.create('SL.model.SampleModels.BioCondition');
        newModel.setID("BCxxxxx");

        newModel.addOwner(Ext.create('SL.model.User', {user_id: '' + Ext.util.Cookies.get('loggedUser')}));
        newModel.setLastEditionDate(new Date());
        newModel.setSubmissionDate(new Date());

        //2. Create the new view

        //2. Create the new view
        var mainView = application.mainView;
        var bioconditionView = mainView.changeMainView("BioConditionDetailsView");

        //3.Load the information

        //4.Change the main panel content
        bioconditionView.setLoading(true);
        bioconditionView.loadModel(newModel);
        newModel.addObserver(bioconditionView);
        bioconditionView.setViewMode('creation');
        bioconditionView.updateWorkflowPanel(true);
        bioconditionView.setLoading(false);
    },
    /**
     * 
     * @param {type} tabPanel
     * @param {type} newCard
     * @param {type} oldCard
     * @param {type} eOpts
     * @returns {undefined}
     */
    analyticalReplicateSelectorTabChangeHandler: function (tabPanel, newCard, oldCard, eOpts) {
        if (newCard.itemId === "bioconditionSelectorPanel") {
            this.loadAllBioConditionsHandler(newCard);
        } else {
            tabPanel.setLoading(true);
            this.loadBioConditionHandler(oldCard.getSelectedBioConditionsIDs()[0], tabPanel);
        }
    },
    /********************************************************************************      
     * This function manages the event fires when the button "Inspect Analytical Sample" 
     * is pressed.
     *
     * @param  bioconditionID
     * @return   
     ********************************************************************************/
    showBiologicalConditionDetailsWindow: function (bioconditionID) {
        //2.Create the edition window
        var detailsWindow = Ext.create('Ext.window.Window', {
            title: 'Biological Condition details',
            layout: "fit", closable: false, modal: true, autoScroll: true,
            previousPanel: null, bodyPadding: '20 0 20 20', bodyStyle: {'background': "white"},
            parent: null,
            items: [],
            buttons: [
                {text: '<i class="fa fa-remove"></i> Close', cls: 'cancelButton', handler: function () {
                        this.up('window').close();
                    }
                }
            ]
        });
        detailsWindow.setLoading(true);
        console.info((new Date()).toLocaleString() + " OPENING BioCondition " + bioconditionID + " FOR INSPECT");
        //1. Create a new Biocondition view
        var bioconditionView = Ext.create('SL.view.SampleViews.BioConditionDetailsView', {header: false, border: false});
        bioconditionView.parent = detailsWindow;
        detailsWindow.add(bioconditionView);

        //2.Load all the information for the selected biocondition (including bioreplicates) and load it in the new view
        var doAfterLoading = function () {
            detailsWindow.setHeight(Ext.getBody().getViewSize().height * 0.9);
            detailsWindow.setWidth(Ext.getBody().getViewSize().width * 0.8);
            bioconditionView.setViewMode('inspect');
            detailsWindow.center();
            detailsWindow.show();
            bioconditionView.updateWorkflowPanel(true);
        };
        this.loadBioConditionHandler(bioconditionID, bioconditionView, doAfterLoading);
        return bioconditionView;
    },
    /********************************************************************************      
     * This function manages the event fires when an Analytical Sample node is clicked at
     * the Analysis panel
     *
     * @param  bioconditionID Biological condition ID for the clicked node
     * @param  doAfterLoading
     * @return a new BiologicalConditionDetails panel
     ********************************************************************************/
    getBiologicalConditionDetailsPanel: function (bioconditionID, doAfterLoading) {
        console.info((new Date()).toLocaleString() + " OPENING BioCondition " + bioconditionID + " FOR INSPECT");
        //1. Create a new Biocondition view
        var bioconditionView = Ext.create('SL.view.SampleViews.BioConditionDetailsView', {header: false, border: false, defaults: {width: "100%"}, autoScroll: false});
        bioconditionView.setViewMode('inspect');
        //2.Load all the information for the selected biocondition (including bioreplicates) and load it in the new view
        this.loadBioConditionHandler(bioconditionID, bioconditionView, doAfterLoading);
        return bioconditionView;
    },
    /**
     * This function handles the event fires when 
     * 
     * @return {undefined}
     */
    sendBioConditionsTemplateButtonHandler: function () {
        Ext.apply(Ext.form.VTypes, {
            xls: function (v) {
                return /^.*\.(xls)$/.test(v);
            },
            xlsText: 'Only XLS files are supported'
        });
        var me = this;

        var window = Ext.create('Ext.window.Window', {
            title: 'Please, select the XLS file with the Samples information',
            height: 250, width: 620,
            layout: {type: 'vbox', align: "stretch"},
            closable: false, resizable: false, modal: true,
            items: [
                {xtype: 'panel', border: 0, flex: 1, html: "<p style='padding:5px; font-size:16px'>Please, select the XLS file which contains all the <i>to-be-created</i> Samples information.</p><p style='font-size:14px;padding:8px;  color:#8c8c8c'>BioCondition creation XLS template can be downloaded by clicking <a href='data/xls_templates/STATegra_EMS_Sample_templates.xls' target='_blank'>here</a></p>"},
                {xtype: 'panel', border: 0, flex: 0, layout: 'fit',
                    items: [
                        {xtype: 'filefield', labelWidth: 120, labelAlign: 'right', allowBlank: false, padding: 5, fieldLabel: 'XLS Document', name: 'xls_document', submitValue: false, vtype: 'xls', cls: 'combobox'}
                    ]}
            ],
            buttons: [
                {text: "<i class='fa fa-check'></i> Accept", cls: 'acceptButton',
                    handler: function () {
                        var document_loader = this.up('window').down('filefield');

                        if (document_loader.isValid()) {
                            form = Ext.create('Ext.form.Panel');
                            form.add(document_loader);
                            document_loader.submitValue = true;

                            form = form.getForm();
                            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};

                            form.submit(
                                    {
                                        method: 'POST',
                                        waitMsg: 'Sending XLS Document, please wait...',
                                        url: SERVER_URL + SERVER_PORT + SERVER_URL_SEND_BIOCONDITION_TEMPLATE_DOCUMENT,
                                        params: me.getCredentialsParams(),
                                        success: function (form, action) {
                                            showSuccessMessage('All data was added successfully', {soft: true});
                                            window.close();
                                            me.browseBioConditionButtonClickHandler();
                                        },
                                        failure: function (form, action) {
                                            showErrorMessage('Failed trying to save the Treatment Document, please try again later. </br>Server response: <i> ' + action.response.responseText + '</i>');
                                            window.close();
                                        }
                                    });
                        } else {
                            showErrorMessage("Error: Only XLS files are supported", {soft: true});
                        }
                    }
                },
                {text: "<i class='fa fa-remove'></i> Cancel", cls: 'cancelButton', handler: function () {
                        window.close();
                    }}
            ]
        }).show();

    },
    /***********************************************************************************************************
     * This function is called when a Biological Sample is marked to be removed.
     * It will show a confirmation dialog and if "yes" button is clicked, the biological sample model is removed from the 
     * biological condition.
     *  
     * @param  bioconditionView
     * @param  bioreplicateModel
     ***********************************************************************************************************/
    showBioreplicateDeletionDialogHandler: function (bioconditionView, bioreplicateModel) {
        var askToContinue = function (buttonId, text, opt) {
            if (buttonId === "yes") {
                var _bioconditionModel = bioconditionView.getModel();

                _bioconditionModel.removeBioReplicate(bioreplicateModel.getID());
                bioconditionView.addNewTask("remove_bioreplicate", bioreplicateModel);
                bioconditionView.setLoading(true);
                bioconditionView.updateBioReplicateViews();
                bioconditionView.updateWorkflowPanel();
                bioconditionView.setLoading(false);
                bioconditionView.doLayout();
            }
        };
        Ext.MessageBox.show({
            title: 'Delete Biological Replicate?',
            msg: 'If the selected BioReplicate has some associated Analytical Samples, Analysis, etc. deletion will also remove those associated elements and, after saving, changes can not be undone.<br/>Are you sure to continue?',
            buttons: Ext.MessageBox.YESNO,
            fn: askToContinue,
            icon: Ext.MessageBox.QUESTION
        });
    },
    /***********************************************************************************************************
     * This function handles the event accept_button_pressed fires in other Controller (eg. ApplicationController)
     * when a button Accept is pressed.
     * First cleans the BioConditionDetailsView tasks queue (removing all unneccessary tasks) and then starts with task
     * execution.
     *  
     * @param  bioConditionView
     ***********************************************************************************************************/
    acceptButtonPressedHandler: function (bioConditionView) {
        bioConditionView.setLoading(true);

        //Check if the information in the form is valid
        if (!bioConditionView.validateContent()) {
            bioConditionView.setLoading(false);
            console.error((new Date()).toLocaleString() + "SAVING BioCondition REQUEST ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            showErrorMessage('Invalid Data. Please correct form errors.');
            return;
        }

        if (bioConditionView.isInEditionMode()) {
//            bioConditionView.cleanCountdownDialogs();
            bioConditionView.addNewTask("edit_biocondition", null);
        }

        //Update the model
        var model = bioConditionView.getModel();
        model.setID(bioConditionView.getID());
        model.setTitle(bioConditionView.getTitle());
        model.setName(bioConditionView.getName());
        model.setOrganism(bioConditionView.getOrganism());
        model.setTissue(bioConditionView.getTissue());
        model.setCellType(bioConditionView.getCellType());
        model.setCellLine(bioConditionView.getCellLine());
        model.setGender(bioConditionView.getGender());
        model.setGenotype(bioConditionView.getGenotype());
        model.setOtherBiomaterial(bioConditionView.getOtherBiomaterial());
        model.setTreatment(bioConditionView.getTreatment());
        model.setDose(bioConditionView.getDose());
        model.setTime(bioConditionView.getTime());
        model.setOtherExperimentalConditions(bioConditionView.getOtherExperimentalConditions());
        model.setProtocolDescription(bioConditionView.getProtocolDescription());
        model.setOwners([]);
        var owners = bioConditionView.getOwners();
        for (var i in owners) {
            model.addOwner(owners[i]);
        }
        model.setSubmissionDate(bioConditionView.getSubmissionDate());
        model.setLastEditionDate(bioConditionView.getLastEditionDate());
        model.setExternalLinks(bioConditionView.getExternalLinks());

        bioConditionView.setTaskQueue(this.clean_task_queue(bioConditionView.getTaskQueue()));
        this.execute_tasks(bioConditionView, true);
    },
    /********************************************************************************      
     * This function handles the cancel_button_pressed thown by the Application Controller
     * when the Cancel button located in MainView is pressed and the inner panel is an
     * BioConditionDetailsView panel.
     * Asks the user if close without save changes. If user selects "Yes", the panel is closed.
     * if the panel was in a "Editing mode" (if the panel has a timer id), then sends a signal to the server in order to unblock
     * the BioCondition in the list of blocked elements.
     *
     * @param  bioconditionView the biocondition_view 
     * @param  force
     * @return      
     ********************************************************************************/
    cancelButtonPressedHandler: function (bioconditionView, force) {
        var me = this;
        if (bioconditionView.isInEditionMode()) {
            var doClose = function () {
                bioconditionView.setLoading(true);

                bioconditionView.cleanCountdownDialogs();
                me.send_unblock_biocondition(bioconditionView, null, null);
                //If the model has changed (added a new AS or edited some values) --> restore
                if (bioconditionView.getModel().hasChanged()) {
                    bioconditionView.getModel().restoreFromMemento(bioconditionView.memento);
                }
                //Remove the memento
                bioconditionView.memento = null;

                bioconditionView.loadModel(bioconditionView.getModel());
                bioconditionView.setViewMode("inspect");
                bioconditionView.updateWorkflowPanel(true);
                bioconditionView.clearTaskQueue();
                bioconditionView.setLoading(false);
//                bioConditionView.doLayout();
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
                    msg: 'You are closing the form before saving changes. <br/>Would you like to continue?',
                    buttons: Ext.MessageBox.YESNO,
                    fn: askToContinue,
                    icon: Ext.MessageBox.QUESTION
                });
            }
        } else {
            bioconditionView.clearTaskQueue();
            var mainView = application.mainView;
            mainView.setButtonsStatus(false);
            mainView.changeMainView("BioConditionListView").updateContent();
        }
    },
    /**BC******************************************************************************      
     * This function send a 	Edition request to the server in order to block the BioCondition
     * avoiding that other users edit it before the user saves the changes.
     * Each user has 30 minutes max. to edit a BioCondition, after that the user will be 
     * ask again, if no answer is given, the BioCondition is unblocked and changes will be  
     * lost.
     * This is neccessary because if the user leaves the application without save or close the panel,
     * the server MUST free the blocked object in order to let other users edit it.
     * After BLOCKET_TIME minutes, the server automatically frees the blocked object, so the user
     * will be asked 1 minute before the liberation takes place.
     *
     * @param  bioconditionView the BioCondition view
     * @return      
     **EC****************************************************************************/
    editButtonPressedHandler: function (bioconditionView) {
        //FIRST STEP: CHECK IF THE USER HAS EDITING PRIVILEGES OVER THE BioCondition (ONLY OWNERS)
        //TODO: THIS CODE COULD BE BETTER IN THE SERVER (JAVASCRIPT IS VULNERABLE)
        var current_user_id = '' + Ext.util.Cookies.get('loggedUser');
        if (!bioconditionView.getModel().isOwner(current_user_id) && current_user_id !== "admin") {
            console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over the BioCondition " + bioconditionView.getID());
            showErrorMessage("User " + current_user_id + " has not Edition privileges over the BioCondition " + bioconditionView.getID() + "</br>Only BioCondition's owners can edit the information. </br>Please, contact with listed owners or with EMS's administrator to get more privileges.", '');
            return;
        }

        var me = this;
        bioconditionView.setLoading(true);

        console.info((new Date()).toLocaleString() + "SENDING EDIT REQUEST FOR BioCondition " + bioconditionView.getID() + " TO SERVER");

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_LOCK_BIOCONDITION,
            method: 'POST',
            params: me.getCredentialsParams({'biocondition_id': bioconditionView.getID()}),
            success: function (response) {
                // responseText should be in json format
                try {
                    //IF THE REQUEST WAS SENT SUCCESSFULLY
                    var jsonResponse = Ext.JSON.decode(response.responseText);

                    //IF SUCCESS == TRUE, IT MEANS THAT THE OBJECT WAS BLOCKED SUCCESSFULLY, SO 
                    //WE CAN EDIT IT
                    if (jsonResponse['success']) {
                        console.info((new Date()).toLocaleString() + "EDITION ALLOWED FOR BioCondition " + bioconditionView.getID());

                        bioconditionView.initializeCountdownDialogs();
                        bioconditionView.setViewMode("edition");
                        bioconditionView.setLoading(false);
                        bioconditionView.memento = bioconditionView.getModel().getMemento();
                        bioconditionView.doLayout();
                    } else {
                        console.info((new Date()).toLocaleString() + " EDITION NOT ALLOWED FOR BioCondition " + bioconditionView.getID());

                        showErrorMessage('Apparently another user opens this object for editing. </br>Please, try again later. If the problem persists, please contact with tecnical support.', '');
                        bioconditionView.setLoading(false);
                        bioconditionView.doLayout();
                    }

                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'BioConditionController:edit_button_pressed:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
            },
            failure: function (response) {
                ajaxErrorHandler("BioConditionController", "edit_button_pressed", response);
            }
        });
        console.info((new Date()).toLocaleString() + "EDIT REQUEST FOR BioCondition " + bioconditionView.getID() + " SENT TO SERVER");
    },
    clean_task_queue: function (tasks_queue) {
        console.info((new Date()).toLocaleString() + "CLEANING TASK QUEUE");
        try {
            if (tasks_queue.length === 0) {
                return tasks_queue;
            }

            //IF THE QUEUE INCLUDES A CREATION TASK
            //The create_new_biocondition task must be always in the first position (if we are creating a new biocondition)
            if (tasks_queue[0].command === "create_new_biocondition") {
                //The biocondition creation send all the information (biocondition, bioreplicates, ... )to the server in only one step 
                //So it's neccessary to remove all the tasks related with bioreplicates and analytical replicates insertion.
                //After that only "create_new_biocondition" and others tasks like "send_treatment_document" should be in the queue
                var tasks_queue_temp = [tasks_queue[0]];
                for (var i = tasks_queue.length - 1; i > 0; i--) {
                    if ("send_treatment_document" === tasks_queue[i].command) {
                        tasks_queue_temp.push(tasks_queue[i]);
                        break;
                    }
                }
                return tasks_queue_temp;
            }

            //IF NOT, we need to "clean" the queue removing pairs of "create, remove" tasks and creation task for subelements
            //that would be created in the superelement creation. Eg. if we added tasks for Analytical reps creation but those
            //analytical reps are associated to a to-be-added bioreplicate, we should remove those tasks because they will be
            //inserted during the Bioreplicate insertion (because the local object has already the changes)
            var tasks = {to_be_created_BR: {}, to_be_created_AR: {}, to_be_edited_BR: {}, to_be_edited_AR: {}, to_be_deleted_BR: [], to_be_deleted_AR: []};
            var edit_biocondition = false;
            var send_treatment_document = false;
            var clear_blocked_status = false;
            var other_tasks = [];
            var tasks_queue_temp = [];

            for (var i = 0; i < tasks_queue.length; i++) {
                switch (tasks_queue[i].command)
                {
                    //send_treatment_document IS ADDED WHEN THE TREATMENT DOCUEMNT LOADER IS EDITED
                    case "edit_biocondition":
                        edit_biocondition = true;
                        break;

                    case "send_treatment_document":
                        send_treatment_document = true;
                        break;

                    case "clear_blocked_status":
                        clear_blocked_status = true;
                        break;

                        //add_bioreplicate IS ADDED WHEN A NEW BIOREPLICATE IS CREATED AND ADDED TO A BioCondition
                    case "add_new_bioreplicate":
                        //Due to the bioreplicate id is unique in the same biocondition,
                        //We add a new entry in the temporal array indexed by the Bioreplicate id, saving the position
                        var objectId = tasks_queue[i].object.get('bioreplicate_id');
                        tasks.to_be_created_BR[objectId] = tasks_queue[i].object;
                        break;

                        //add_analytical_rep IS ADDED WHEN A NEW ANALYITICAL REP IS ADDED TO AN EXISTING BIOREP
                    case "add_new_analytical_rep":
                        //However we only add the task if the bioreplicate is not a "to-be-added" bioreplicate, ie. if there
                        //is not a previous "add_new_bioreplicate" for the bioreplicate owner.
                        var objectId = tasks_queue[i].object.get('analytical_rep_id');
                        var parentId = tasks_queue[i].object.get('bioreplicate_id');
                        //IF THE PARENT BR IS NOT A TO-BE-CREATED BR
                        if (tasks.to_be_created_BR[parentId] == null) {
                            tasks.to_be_created_AR[objectId] = tasks_queue[i].object;
                        }
                        break;

                        //edit_bioreplicate IS ADDED WHEN A BIOREPLICATE IS EDITED
                    case "edit_bioreplicate":
                        //Due to the bioreplicate id is unique in the same biocondition,
                        //We add a new entry in the temporal array indexed by the Bioreplicate id, saving the position
                        //BUt only if the BR is not a TO-BE-CREATED BR
                        var objectId = tasks_queue[i].object.get('bioreplicate_id');
                        if (tasks.to_be_created_BR[objectId] == null) {
                            tasks.to_be_edited_BR[objectId] = tasks_queue[i].object;
                        }
                        break;

                        //edit_analytical_rep IS ADDED WHEN AN ANALYITICAL REP IS edited
                    case "edit_analytical_rep":
                        //However we only add the task if the bioreplicate is not a "to-be-added" bioreplicate, or
                        //and if there is not a previous "edit_analytical_rep" task and if the AR is not a 
                        //TO-BE CREATED AR
                        var objectId = tasks_queue[i].object.get('analytical_rep_id');
                        var parentId = tasks_queue[i].object.get('bioreplicate_id');
                        //IF THE PARENT BR IS NOT A TO-BE-CREATED BR
                        if (tasks.to_be_created_BR[parentId] == null && tasks.to_be_created_AR[objectId] == null) {
                            tasks.to_be_edited_AR[objectId] = tasks_queue[i].object;
                        }
                        break;

                    case "remove_bioreplicate":
                        var objectId = tasks_queue[i].object.get('bioreplicate_id');
                        //If we find a previous "addition" or "editiion" task for the same Bioreplicate, we should remove the both task
                        //AND ALL THE RELATED TASKS (EG. ANALYTICAL REPS ADDING)    
                        //If the BR was a TO-BE-CREATED BR, there is not more related tasks added
                        //so remove the addition task and not add the remove
                        if (tasks.to_be_created_BR[objectId] != null) {
                            delete tasks.to_be_created_BR[objectId];
                        } else {
                            //Else if the BR was previosly added
                            //we could have an Edition task over the BR and 1..N edition/creation tasks of analytical reps.
                            if (tasks.to_be_edited_BR[objectId] != null) {
                                delete tasks.to_be_edited_BR[objectId];
                            }

                            var associated_AR = Object.keys(tasks.to_be_edited_AR);
                            for (var key in associated_AR) {
                                if (key.search(objectId) !== -1) {
                                    delete tasks.to_be_edited_AR[key];
                                }
                            }
                            var associated_AR = Object.keys(tasks.to_be_created_AR);
                            for (var key in associated_AR) {
                                if (key.search(objectId) !== -1) {
                                    delete tasks.to_be_created_AR[key];
                                }
                            }

                            tasks.to_be_deleted_BR.push(objectId);
                        }
                        break;


                    case "remove_analytical_rep":
                        var objectId = tasks_queue[i].object.get('analytical_rep_id');
                        //If we find a previous "addition" or "edition" task for the same AR, we should remove the both task
                        //If the AR was a TO-BE-CREATED AR, there is not more related tasks added
                        //so remove the addition task and do not add the remove
                        if (tasks.to_be_created_AR[objectId] != null) {
                            delete tasks.to_be_created_AR[objectId];
                        } else {
                            if (tasks.to_be_edited_AR[objectId] != null) {
                                delete tasks.to_be_edited_AR[objectId];
                            }
                            tasks.to_be_deleted_AR.push(objectId);
                        }
                        break;

                    case "update_biocondition":
                        tasks_queue_temp.push(tasks_queue[i]);
                        break;

                    default:
                        other_tasks.push(tasks_queue[i]);
                        break;
                }
            }
            tasks_queue_temp.push({command: "update_biocondition", object: tasks});

            if (send_treatment_document) {
                tasks_queue_temp.push({command: "send_treatment_document", object: null});
            }
            tasks_queue_temp = tasks_queue_temp.concat(other_tasks);
            if (clear_blocked_status) {
                tasks_queue_temp.push({command: "clear_blocked_status", object: null});
            }

            return tasks_queue_temp;
        } catch (error) {
            showErrorMessage('ERROR CLEANING TASK QUEUE: ' + error, {soft: false});
            return tasks_queue;
        }

    },
    /************************************************************************************************
     * This function handles the tasks execution for a given bioconditionView and should be only called after 
     * BioCondition creation/edition.
     *
     * ACCEPT BUTTON should be only visible during new OBJECTS creation/edition (eg. during a BioCondition creation/edition) 
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
     *
     * @param  bioconditionView the biocondition view
     * @param  status
     * @return      
     *************************************************************************************************/
    execute_tasks: function (bioconditionView, status) {
        var error_message = "";

        //GET THE NEXT TASK IN THE QUEUE
        var current_task = bioconditionView.getTaskQueue().shift();

        //IF THERE IS A NEXT TASK AND NO PREVIOUS ERROR
        if (current_task != null && status) {
            try {
                switch (current_task.command)
                {
                    case "create_new_biocondition":
                        console.info((new Date()).toLocaleString() + "SENDING SAVE NEW BioCondition REQUEST TO SERVER");
                        this.send_create_biocondition(bioconditionView, this, "execute_tasks");
                        console.info((new Date()).toLocaleString() + "SAVE NEW BioCondition REQUEST SENT TO SERVER");
                        break;

                    case "send_treatment_document":
                        console.info((new Date()).toLocaleString() + "SENDING TREATMENT DOCUMENT SAVE REQUEST TO SERVER");
                        this.send_treatment_document(bioconditionView, this, "execute_tasks");
                        console.info((new Date()).toLocaleString() + "SAVE TREATMENT DOCUMENT REQUEST SENT TO SERVER");
                        break;

                    case "update_biocondition":
                        console.info((new Date()).toLocaleString() + "SENDING UPDATE BIOCONDITION REQUEST TO SERVER");
                        this.send_update_biocondition(bioconditionView, current_task.object, this, "execute_tasks");
                        console.info((new Date()).toLocaleString() + "UPDATE BIOCONDITION REQUEST SENT TO SERVER");
                        break;

                        //create_new_biocondition IS ADDED ONLY DURING BioCondition CREATION    
                    case "clear_blocked_status":
                        console.info(new Date().toLocaleString() + "SENDING UNLOCK BioCondition " + bioconditionView.getID() + " REQUEST TO SERVER");
                        this.send_unblock_biocondition(bioconditionView, this, "execute_tasks");
                        console.info(new Date().toLocaleString() + "UNLOCK BioCondition " + bioconditionView.getID() + " REQUEST SENT TO SERVER");
                        break;

                    case "void_action":
                        this.execute_tasks(bioconditionView, true);
                        break;

                    default:
                        status = false;
                        break;
                }
            } catch (error) {
                error_message = error;
                status = false;
                bioconditionView.taskQueue.unshift(current_task);
            }

            if (!status) {
                showErrorMessage('Failed trying to saved the changes.</br>Please try again.</br>Error: ' + error_message);
            }
        }
        //IF NO MORE TASKS AND EVERYTHING GOES WELL
        else if (status) {
            console.info(new Date().toLocaleString() + "BioCondition " + bioconditionView.getID() + " saved successfully");
            bioconditionView.cleanCountdownDialogs();
            //TODO:Check if is necessary to update the bioconditionView
            //Only if there are new Analytical replicates and/or new
            //Biological replicates (it is neccessary to update to get the new IDs)
            //OR if it is a new biocondition
            bioconditionView.updatedNeeded = true;
            if (bioconditionView.updatedNeeded === true) {
                //Load all the information for the selected biocondition (including bioreplicates) and load it in the current view
                var doAfterLoading = function () {
                    bioconditionView.setViewMode("inspect");
                    bioconditionView.setLoading(false);
                    bioconditionView.doLayout();
                    showSuccessMessage('BioCondition ' + bioconditionView.getModel().getID() + ' saved successfully', {soft: true});
                };
                bioconditionView.getModel().deleteObserver(bioconditionView);
                this.loadBioConditionHandler(bioconditionView.getModel().getID(), bioconditionView, doAfterLoading);
            } else {
                bioconditionView.setViewMode("inspect");
                bioconditionView.setLoading(false);
                bioconditionView.doLayout();
                showSuccessMessage('BioCondition ' + bioconditionView.getModel().getID() + ' saved successfully', {soft: true});
            }
        } else {
            status = false;
            bioconditionView.taskQueue.unshift(current_task);
            bioconditionView.setLoading(false);
        }
    },
    /********************************************************************************      
     * This function send the BioCondition information contain in a given biocondition_view 
     * to the SERVER in order to save a NEW BioCondition in the database .
     * Briefly the way of work is :
     *	1.	Check if the formulary's content is valid. If not, throws an error that should 
     *		catched in the caller function.
     *
     *	2.	If all fields are correct, then the BioCondition model is converted from JSON to a 
     *		JSON format STRING and sent to the server using POST. After that the function finished.
     *	
     *	3.	After a while, the server returns a RESPONSE catched inside this function. 
     *		The response has 2 possible status: SUCCESS and FAILURE.
     *		a.	If SUCCESS, then the new biocondition identifier is set in the biocondition_view. 
     *			After that,  isthe callback function is called, in this case the 
     *       	callback function is the "execute_task" function that will execute the next
     *           task in the TASK QUEUE of the given BioConditionVIEW panel. This function is called
     *           with the status flag sets to TRUE (~ success).
     *		b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *       	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *           the current task is re-added to the TASK QUEUE and an error message is showed.
     *           The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     * @param  bioconditionView the BioConditionDetailsView panel which fires the create action and contains the TASK QUEUE and the biocondition model. Needed for the callback function.
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @return   
     ********************************************************************************/
    send_create_biocondition: function (bioconditionView, callback_caller, callback_function) {
        var me = this;
        //THIS FLAG IS NECCESSARY TO UPDATE THE VIEW AFTER SAVING, 
        //BECAUSE WE DON'T KNOW THE NEW IDs
        bioconditionView.updatedNeeded = true;
        //Get the BioCondition model as a Simple JSON and convert the JSON object to STRING
        var bioconditionModel = bioconditionView.getModel();
        var JSON_DATA = bioconditionModel.toSimpleJSON();
        JSON_DATA = Ext.encode(JSON_DATA);

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_ADD_BIOCONDITION,
            method: 'POST',
            params: me.getCredentialsParams({'biocondition_json_data': JSON_DATA}),
            success: function (response) {
                try {
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    var bioconditionID = jsonResponse['newID'];
                    bioconditionModel.setID(bioconditionID);
                    //bioconditionModel.notifyObservers();
                    console.info((new Date()).toLocaleString() + " BioCondition " + jsonResponse['newID'] + " SAVED IN SERVER SUCCESSFULLY");
                } catch (error) {
                    showErrorMessage('An error ocurred trying to get the new ID of the BioCondition.</br>Please contact with the technical support.', {soft: true});
                    console.warn((new Date()).toLocaleString() + " BioCondition SAVED IN SERVER SUCCESSFULLY BUT RESPONSE DOES NOT INCLUDE THE ASSIGNED ID");
                }
                callback_caller[callback_function](bioconditionView, true);
            },
            failure: function (response) {
                ajaxErrorHandler("BioConditionController", "create_new_biocondition", response);
                //Undo the task shift in the queue 
                bioconditionView.taskQueue.unshift({command: "create_new_biocondition", object: null});
                callback_caller[callback_function](bioconditionView, false);
            }
        });
    },
    /********************************************************************************      
     * This function send the Treatment document to the SERVER (only when the "send_treatment_document" was added).
     * Briefly the way of work is :
     *	1.	Obtains the file from the formulary
     *	2.	And send the file to the server using POST. After that, the function finished.
     *	3.	After a while, the server returns a RESPONSE catched inside this function. 
     *		The response has 2 possible status: SUCCESS and FAILURE.
     *		a.	If SUCCESS, the callback function is called, in this case the 
     *       	callback function is the "execute_task" function that will execute the next
     *           task in the TASK QUEUE of the given BioCondition VIEW panel. This function is called
     *           with the status flag sets to TRUE (~ success).
     *		b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *       	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *           the current task is re-added to the TASK QUEUE and an error message is showed.
     *           The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     * @param  bioconditionView the BioConditionDetailsView panel which fires the action
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @return   
     ********************************************************************************/
    send_treatment_document: function (bioconditionView, callback_caller, callback_function) {
        var me = this;

        //CREATE A TEMPORAL FORMULARY (INVISIBLE)
        var documentLoaderField = bioconditionView.queryById('treatment_document_loader');
        var form = Ext.widget('form');
        //MOVE THE FILE FIELD TO THE NEW FORM TO SEND IT INDIVIDUALLY
        form.add(documentLoaderField);
        documentLoaderField.submitValue = true;

        //IF VALID --> SEND
        form = form.getForm();
        if (form.isValid()) {
            Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};

            form.submit({
                method: 'POST',
                headers: {'Accept': 'application/json'},
                url: SERVER_URL + SERVER_PORT + SERVER_URL_SEND_TREATMENT_DOCUMENT,
                params: me.getCredentialsParams({'biocondition_id': bioconditionView.getModel().getID()}),
                success: function (form, action) {
                    documentLoaderField.submitValue = false;
                    bioconditionView.queryById("expConditionsPanel").add(documentLoaderField);
                    callback_caller[callback_function](bioconditionView, true);
                },
                failure: function (form, action) {
                    showErrorMessage('Failed trying to save the Treatment Document, please try again later. </br>Server response: <i> ' + action.response.responseText + '</i>');
                }
            });
        }

    },
    /********************************************************************************      
     * This function send the BioReplicatess information of the given biorepicate_model 
     * to the SERVER in order to save a NEW BIOREPLICATE in the database associated to the 
     * biocondition given by the BioCondition_view.
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
     *           task in the TASK QUEUE of the given BioConditionVIEW panel. This function is called
     *           with the status flag sets to TRUE (~ success).
     *		b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *       	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *           the current task is re-added to the TASK QUEUE and an error message is showed.
     *           The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     *  
     * @param  bioconditionView the BioConditionDetailsView panel which fires the create action and contains the TASK QUEUE. Needed for the callback function.
     * @param  to_be_arrays the to-be-added bioreplicate_model array
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @return    
     ********************************************************************************/
    send_update_biocondition: function (bioconditionView, to_be_arrays, callback_caller, callback_function) {
        var me = this;

        //Get the BioCondition model as a Simple JSON and convert the JSON object to STRING
        var bioconditionModel = bioconditionView.getModel();
        //TODO: AVOID JSON DATA OF CHILD ELEMS? == REDUCE PACKAGE SIZE
        var JSON_DATA = bioconditionModel.toSimpleJSON();
        JSON_DATA = Ext.encode(JSON_DATA);

        //GENERATE THE JSON DATA FOR EACH ELEMENT IN THE QUEUE
        var requestParams = {};
        requestParams.biocondition_json_data = JSON_DATA;

        //GET THE NAMES OF ALL THE ARRAYS THAT CONTAINS TO_DO TASKS (to_be_added, to_be_updated...)
        //AND GENERATE THE JSON STRING FOR EACH ELEMENT
        var array_names = Object.keys(to_be_arrays);
        JSON_DATA = "";
        var all_json_data;
        var current_array;
        //FOR EACH "to-be-" array (eg. to-be-created-AR, to-be-updated-AR,...) 
        for (var i in array_names) {
            if (array_names[i].indexOf("delete") !== -1) {
                requestParams[array_names[i]] = to_be_arrays[array_names[i]];
                continue;
            }

            current_array = to_be_arrays[array_names[i]];
            all_json_data = [];
            //FOR EACH OBJECT IN THE CURRENT ARRAY
            for (var j in current_array) {
                JSON_DATA = current_array[j].toSimpleJSON();
                JSON_DATA = Ext.encode(JSON_DATA);
                all_json_data.push(JSON_DATA);
            }
            requestParams[array_names[i]] = all_json_data;
        }

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_UPDATE_BIOCONDITION,
            method: 'POST',
            params: me.getCredentialsParams(requestParams),
            success: function (response) {
                // responseText should be in json format
                console.info((new Date()).toLocaleString() + "BIOCONDITION UPDATED SUCCESSFULLY IN SERVER");
                callback_caller[callback_function](bioconditionView, true);
            },
            failure: function (response) {
                ajaxErrorHandler("BioConditionController", "send_update_biocondition", response);
                //Undo the task shift in the queue 
                bioconditionView.taskQueue.unshift({command: "update_biocondition", object: to_be_arrays});
                callback_caller[callback_function](bioconditionView, false);
            }
        });
    },
    /********************************************************************************      
     * This function send to the server a signal to unblock the given BioCondition which was blocked when the 
     * edition step started.
     * 	a.	If SUCCESS, the callback function is called, in this case the 
     *      	callback function is the "execute_task" function that will execute the next
     *       task in the TASK QUEUE of the given BioConditionVIEW panel. This function is called
     *       with the status flag sets to TRUE (~ success).
     *	b.	If FAILURE, then the callback function is called (the "execute_task" function again)
     *     	but this time with the status flag sets to FALSE (~ failure), in this case, 
     *       the current task is re-added to the TASK QUEUE and an error message is showed.
     *       The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
     *  
     * @param  bioconditionView the BioConditionDetailsView panel which fires the unblock action and contains the TASK QUEUE. Needed for the callback function.
     * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
     * @param  callback_function the function invoked by the callback_caller after the success/failure event
     * @return     
     ********************************************************************************/
    send_unblock_biocondition: function (bioconditionView, callback_caller, callback_function) {
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_UNLOCK_BIOCONDITION,
            method: 'POST',
            params: me.getCredentialsParams({'biocondition_id': bioconditionView.getID()}),
            success: function (response) {
                //if we are here, the server liberated successfully the BioCondition
                //Remove the timeOut for the local blocking time
                console.info((new Date()).toLocaleString() + " BioCondition " + bioconditionView.getID() + " UNBLOCKED SUCCESSFULLY");
                if (callback_caller != null) {
                    callback_caller[callback_function](bioconditionView, true);
                }
            },
            failure: function (response) {
                ajaxErrorHandler("BioConditionController", "send_unblock_biocondition", response);
                //Undo the task shift in the queue 
                bioconditionView.taskQueue.unshift({command: "clear_blocked_status", object: null});
                if (callback_caller != null) {
                    callback_caller[callback_function](bioconditionView, false);
                }
            }
        });
    },
    getMoreTimeButtonHandler: function (bioconditionView) {
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_LOCK_BIOCONDITION,
            method: 'POST',
            params: me.getCredentialsParams({'biocondition_id': bioconditionView.getID()}),
            success: function (response) {
                // responseText should be in json format
                try {
                    //IF THE REQUEST WAS SENT SUCCESSFULLY
                    var jsonResponse = Ext.JSON.decode(response.responseText);

                    //IF SUCCESS == TRUE, IT MEANS THAT THE OBJECT WAS BLOCKED SUCCESSFULLY, SO WE CAN EDIT IT
                    if (jsonResponse.success === true) {
                        console.info((new Date()).toLocaleString() + "BIOCONDITION " + bioconditionView.getID() + " LOCKED DURING 30 MINUTES MORE");
                        showWarningMessage('Biological condition locked successfully for edition during 30 minutes more.', {soft: true});
                        bioconditionView.cleanCountdownDialogs();
                        bioconditionView.initializeCountdownDialogs();
                    } else {
                        console.info((new Date()).toLocaleString() + "UNABLE TO LOCK BIOCONDITION " + bioconditionView.getAnalysisID() + " DURING 30 MINUTES MORE");
                        showErrorMessage('Unable to get extra time for Biocondition edition.</br>Please save changes and try to edit again.', {soft: true});
                    }
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'BioConditionController:getMoreTimeButtonHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
                bioconditionView.setLoading(false);
            },
            failure: function (response) {
                ajaxErrorHandler("BioConditionController", "getMoreTimeButtonHandler", response);
            }
        });
    },
    loadAllBioConditionsHandler: function (aView) {
        //TODO: PONER ROWS COMO OBSERVER?
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_ALL_BIOCONDITIONS,
            method: 'POST',
            params: me.getCredentialsParams(),
            success: function (response) {
                // responseText should be in json format
                try {
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    var bioconditionsList = jsonResponse['bioconditionsList'];

                    var bioconditions = [];

                    if (bioconditionsList.length < 1) {
                        showWarningMessage("No samples found in databases.</br>Please add New Samples first.", {"title": "Browse Samples", "soft": true});
                    } else {
                        for (var i in bioconditionsList) {
                            var newModel = SL.model.SampleModels.BioCondition.loadFromJSON(bioconditionsList[i]);
                            bioconditions.push(newModel);
                        }
                        aView.setData(bioconditions);
                    }
                    aView.setLoading(false);
                } catch (error) {
                    showErrorMessage('Parsing Error at <i>' + 'BioConditionController:loadAllBioConditionsHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>');
                }
            },
            failure: function (response) {
                ajaxErrorHandler("BioConditionController", "loadAllBioConditionsHandler", response);
            }
        });
    },
    loadBioConditionHandler: function (bioconditionID, bioconditionView, callback) {
        var me = this;
        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_BIOCONDITION,
            method: 'POST',
            params: me.getCredentialsParams({biocondition_id: bioconditionID}),
            success: function (response) {
                try {
                    //1.DECODE THE JSON STRING AND CREATE A JSON OBJECT
                    var jsonResponse = Ext.JSON.decode(response.responseText);
                    var bioconditionsList = jsonResponse['bioconditionsList'];
                    var bioconditionJSONData = bioconditionsList[0];

                    //2.CREATE A NEW OBJECT USING THE JSON DATA
                    var newModel = SL.model.SampleModels.BioCondition.loadFromJSON(bioconditionJSONData);

                    //3.Load in the new view and add as it as observer
                    bioconditionView.loadModel(newModel);
                    newModel.addObserver(bioconditionView);

                    //4.If a callback function was specified, execute it
                    if (callback !== undefined) {
                        callback();
                    }
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'BioConditionController:loadBioConditionHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
            },
            failure: function (response) {
                ajaxErrorHandler("BioConditionController", "loadBioConditionHandler", response);
                this.browseBioConditionButtonClickHandler();
            }
        });
    },
    copyBioConditionHandler: function (bioconditionID, bioconditionView, callback) {
        var me = this;

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_GET_BIOCONDITION,
            method: 'POST',
            params: me.getCredentialsParams({biocondition_id: bioconditionID}),
            success: function (response) {
                try {
                    //REMOVE ALL THE IDS IN THE JSON
                    var jsonData = response.responseText;
                    var find = bioconditionID.replace("BC", "");
                    var re = new RegExp("BR" + find, 'g');
                    jsonData = jsonData.replace(re, 'f_BR' + find);

                    re = new RegExp("AR" + find, 'g');
                    jsonData = jsonData.replace(re, 'f_AR' + find);

                    re = new RegExp("BC" + find, 'g');
                    jsonData = jsonData.replace(re, 'BCxxxxx');

                    //1.DECODE THE JSON STRING AND CREATE A JSON OBJECT
                    var jsonResponse = Ext.JSON.decode(jsonData);
                    var bioconditionsList = jsonResponse['bioconditionsList'];
                    var bioconditionJSONData = bioconditionsList[0];

                    //2.CREATE A NEW OBJECT USING THE JSON DATA
                    var newModel = SL.model.SampleModels.BioCondition.loadFromJSON(bioconditionJSONData);

                    //3.Load in the new view and add as it as observer
                    bioconditionView.loadModel(newModel);
                    newModel.addObserver(bioconditionView);

                    if (callback !== undefined) {
                        callback();
                    }
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'BioConditionController:copyBioConditionHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
            },
            failure: function (response) {
                ajaxErrorHandler("BioConditionController", "copyBioConditionHandler", response);
                bioconditionView.setLoading(false);
                this.browseBioConditionButtonClickHandler();
            }
        });

    },
    removeBioConditionHandler: function (bioconditionID, callback) {
        var me = this;

        application.mainView.setLoading(true);

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_REMOVE_BIOCONDITION,
            method: 'POST',
            params: me.getCredentialsParams({biocondition_id: bioconditionID}),
            success: function (response) {
                try {
                    //REMOVE ALL THE IDS IN THE JSON
                    var jsonData = response.responseText;
                    //1.DECODE THE JSON STRING AND CREATE A JSON OBJECT
                    var jsonResponse = Ext.JSON.decode(jsonData);
                    if (jsonResponse.success === false) {
                        showErrorMessage(new Date() + ': Error while trying to remove the selected Biological Condition.</br>Please try again later.</br>Error message: <i>' + jsonResponse.reason + '</i>', '');
                        return;
                    }

                    if (callback !== undefined) {
                        callback();
                    }

                    //UPDATE THE LIST OF BIOCONDITIONS
                    application.mainView.getView("BioConditionListView").updateContent();
                    application.mainView.setLoading(false);

                    showSuccessMessage("Biological Condition removed successfully.");
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'BioConditionController:removeBioConditionHandler:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
            },
            failure: function (response) {
                //REMOVE ALL THE IDS IN THE JSON
                var jsonData = response.responseText;
                //1.DECODE THE JSON STRING AND CREATE A JSON OBJECT
                application.mainView.setLoading(false);
                var jsonResponse = Ext.JSON.decode(jsonData);
                if (jsonResponse.success === false) {
                    showErrorMessage(new Date() + ': Error while trying to remove the selected Biological Condition.</br>Please try again later.</br>Error message: <i>' + jsonResponse.reason + '</i>', '');
                    return;
                } else {
                    ajaxErrorHandler("BioConditionController", "removeBioConditionHandler", response);
                }
            }
        });
    },
    checkRemovableInstance: function (objectID, objectType, onSuccessAction) {
        var me = this;

        if (objectID.indexOf("f_BR") !== -1 || objectID.indexOf("f_AR") !== -1) {
            onSuccessAction();
            return true;
        }

        Ext.Ajax.defaultHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
        Ext.Ajax.request({
            url: SERVER_URL + SERVER_PORT + SERVER_URL_CHECK_REMOVABLE_SAMPLE,
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
                        if (objectType === "analytical_sample") {
                            showErrorMessage('This element is being used as input for some Raw data acqusition steps.</br>' +
                                    'So, in order to keep data consistence, it is not possible to remove yet.</br>' +
                                    'Please edit or remove first the following Raw data steps and try again.</br>' +
                                    "<p>Step IDs: " + ("" + jsonResponse.rawdataIds).replace(/,/g, ", ") + "</p>", {title: 'Object not removable', soft: false});
                        } else if (objectType === "bioreplicate") {
                            showErrorMessage('Some of the Analytical samples isolated from this sample  are being used as input for some Raw data acqusition steps.</br>' +
                                    'So, in order to keep data consistence, it is not possible to remove yet.</br>' +
                                    'Please edit or remove first the following Raw data steps and try again.</br>' +
                                    "<p>Step IDs: " + ("" + jsonResponse.rawdataIds).replace(/,/g, ", ") + "</p>", {title: 'Object not removable', soft: false});
                        } else if (objectType === "biocondition") {
                            showErrorMessage('Some of the Analytical samples isolated from this sample are being used as input for some Raw data acqusition steps.</br>' +
                                    'So, in order to keep data consistence, it is not possible to remove yet.</br>' +
                                    'Please edit or remove first the following Raw data steps and try again.</br>' +
                                    "<p>Step IDs: " + ("" + jsonResponse.rawdataIds).replace(/,/g, ", ") + "</p>", {title: 'Object not removable', soft: false});
                        }
                    }
                } catch (error) {
                    showErrorMessage(new Date() + ': Parsing Error at <i>' + 'BioConditionController:checkRemovableInstance:success' + '</i></br>Please try again later.</br>Error message: <i>' + error + '</i>', '');
                }
            },
            failure: function (response) {
                ajaxErrorHandler("BioConditionController", "checkRemovableInstance", response);
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