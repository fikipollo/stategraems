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
 * - addNewBioreplicateButtonClickHandler
 * - addNewBioreplicateAcceptButtonClickHandler
 * - showBioreplicateDetailsWindowHandler
 * - editSelectedBioRepButtonClickHandler
 * - showBioreplicateEditionWindowHandler
 * - showBioreplicateCopyWindowHandler
 * - editSelectedBioRepAcceptButtonHandler
 * - addAnalyticalRepButtonClickHandler
 * - addAnalyticalReplicatesAcceptButtonClickHandler
 * - editAnalyticalReplicateEventHandler
 * - removeAnalyticalRepButtonClickHandler
 * - showAnalyticalSampleDeletionDialogHandler
 * - changeBatchButtonClickHandler
 * - disassociateBatchButtonClickHandler
 * - editBatchButtonClickHandler
 * - getCredentialsParams
 * 
 */
Ext.define('SL.controller.BioReplicateController', {
    extend: 'Ext.app.Controller',
    alias: 'controller.BioReplicateController',
    models: ['SampleModels.BioReplicate'],
    /**
     * This function handles the event fires when 
     * 
     * @param {type} bioconditionView
     * @returns {undefined}
     */
    addNewBioreplicateButtonClickHandler: function (bioconditionView) {
        var me = this;
        var creationWindow = Ext.create('Ext.window.Window', {
            title: 'New Biological Replicate',
            layout: 'fit', closable: false, modal: true,
            parent: bioconditionView,
            items: [],
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', handler: function () {
                        me.addNewBioreplicateAcceptButtonClickHandler(creationWindow);
                    }},
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function () {
                        this.up('window').close();
                    }}
            ]
        });

        var nextFakeID = bioconditionView.getModel().getNextFakeBioreplicateID();
        var newModel = Ext.widget('BioReplicate');
        newModel.setID(nextFakeID);
        newModel.setBioConditionID(bioconditionView.getModel().getID());

        var bioReplicateView = Ext.widget('BioReplicateView');
        bioReplicateView.loadModel(newModel);
        newModel.addObserver(bioReplicateView);
        bioReplicateView.setEditableMode(true);
        bioReplicateView.addNewTask('add_new_bioreplicate', newModel);

        creationWindow.add(bioReplicateView);
        creationWindow.setHeight(Ext.getBody().getViewSize().height * 0.8);
        creationWindow.setWidth(Ext.getBody().getViewSize().width * 0.7);
        creationWindow.show();
    },
    /**
     * This function handles the event fires when the button "Accept" located in 
     * "Add new BioReplicate" window is clicked.
     * First, checks if everything is OK, and if so sets the ID into the BioReplicate model and close the
     * creation window. Finally, updates the BioConditionDetailsView adding the new model.
     *
     * The ACCEPT BUTTON should be only visible during new OBJECTS creation/edition (eg. during a BioCondition creation/edition) 
     * 
     * @param {type} creationWindow
     * @returns {undefined}
     */
    addNewBioreplicateAcceptButtonClickHandler: function (creationWindow) {
        //GET THE BIOREPLICATEVIEW PANEL
        var bioreplicateView = creationWindow.down('BioReplicateView');
        //GET THE BioConditionVIEW PANEL OWNER OF THIS WINDOW   
        var bioconditionView = creationWindow.parent;
        //GET THE BioCondition MODEL ASSOCIATED TO THE BioConditionVIEW OWNER PANEL
        var bioConditionModel = bioconditionView.getModel();

        creationWindow.setLoading(true);

        // make sure the form contains valid data before submitting
        if (!bioreplicateView.validateContent()) {
            bioreplicateView.setLoading(false);
            console.error((new Date()).toLocaleString() + "SAVING BioCondition REQUEST ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            showErrorMessage('Invalid Data. Please correct form errors.');
            creationWindow.setLoading(false);
            return;
        }

        //Update the model
        var model = bioreplicateView.getModel();
        model.setName(bioreplicateView.getName());
        model.setAssociatedBatch(bioreplicateView.getAssociatedBatch());

        //ADD THE NEW BIOREPLICATE MODEL TO THE BioCondition MODEL
        bioConditionModel.addBioReplicate(model);
        //ADD THE TASK TO CREATE THE NEW BIOREPLICATE IN THE SERVER SIDE
        for (var task in bioreplicateView.getTaskQueue()) {
            bioconditionView.addNewTask(bioreplicateView.getTaskQueue()[task].command, bioreplicateView.getTaskQueue()[task].object);
        }

        //bioConditionModel.notifyObservers();
        //REFRESH THE BioCondition VIEW PANEL WITH THE NEW CONTENT
//        bioconditionView.setLoading(true);
        bioconditionView.updateBioReplicateViews();
        bioconditionView.updateWorkflowPanel();
        creationWindow.setLoading(false);
//        bioconditionView.setEditableMode(true);
//        bioconditionView.setLoading(false);
//        bioconditionView.doLayout();

        creationWindow.close();
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} bioconditionView
     * @param {type} bioreplicateModel
     * @returns {undefined}
     */
    showBioreplicateDetailsWindowHandler: function (bioconditionView, bioreplicateModel) {
        //1. Create a new window that will contain the BiologicalRep view
        var editionWindow = Ext.create('Ext.window.Window', {
            title: 'Biological Replicate details',
            closable: false, modal: true, autoScroll: true,
            parent: bioconditionView,
            items: [],
            buttons: [
                {text: '<i class="fa fa-remove"></i> Close', cls: 'cancelButton', handler: function () {
                        editionWindow.close();
                    }
                }
            ]
        });

        var bioReplicateView = Ext.widget('BioReplicateView');
        bioReplicateView.setEditableMode(false);
        bioReplicateView.loadModel(bioreplicateModel);
        //Save the current status for the model before change anything.
//        bioReplicateView.memento = bioreplicateModel.getMemento();
        bioreplicateModel.addObserver(bioReplicateView);
//        bioReplicateView.addNewTask('edit_bioreplicate', bioreplicateModel);

        editionWindow.add(bioReplicateView);
        editionWindow.setHeight(Ext.getBody().getViewSize().height * 0.8);
        editionWindow.setWidth(Ext.getBody().getViewSize().width * 0.8);
        editionWindow.show();
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} bioReplicateView
     * @returns {undefined}
     */
    editSelectedBioRepButtonClickHandler: function (bioReplicateView) {
        var bioconditionView = bioReplicateView.up('BioConditionDetailsView');
        //Get the model to be edited
        var bioreplicateModel = bioReplicateView.getModel();
        this.showBioreplicateEditionWindowHandler(bioconditionView, bioreplicateModel);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} bioReplicateView
     * @returns {undefined}
     */
    removeSelectedBioreplicateButtonClickHandler: function (bioReplicateView) {
        //GET THE BIOREPLICATEVIEW PANEL and Model
        var bioreplicateModel = bioReplicateView.getModel();
        //GET THE BioConditionVIEW PANEL and Model
        var bioconditionView = bioReplicateView.up('BioConditionDetailsView');

        var onSuccessAction = function () {
            application.getController("BioConditionController").showBioreplicateDeletionDialogHandler(bioconditionView, bioreplicateModel);
        };

        application.getController("BioConditionController").checkRemovableInstance(bioreplicateModel.getID(), "bioreplicate", onSuccessAction);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} bioconditionView
     * @param {type} bioreplicateModel
     * @returns {BioReplicateView}
     */
    showBioreplicateEditionWindowHandler: function (bioconditionView, bioreplicateModel) {
        var me = this;
        //1. Create a new window that will contain the BiologicalRep view
        var editionWindow = Ext.create('Ext.window.Window', {
            title: 'Editing Biological Replicate',
            closable: false, modal: true, autoScroll: true,
            parent: bioconditionView,
            items: [],
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', handler: function () {
                        me.editSelectedBioRepAcceptButtonHandler(editionWindow);
                    }
                },
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', handler: function () {
                        me.editSelectedBioRepCancelButtonHandler(editionWindow);
                    }
                }
            ]
        });

        var bioReplicateView = Ext.widget('BioReplicateView');
        bioReplicateView.setEditableMode(true);
        bioReplicateView.loadModel(bioreplicateModel);
        //Save the current status for the model before change anything.
        bioReplicateView.memento = bioreplicateModel.getMemento();
        bioreplicateModel.addObserver(bioReplicateView);
        bioReplicateView.addNewTask('edit_bioreplicate', bioreplicateModel);

        editionWindow.add(bioReplicateView);
        editionWindow.setHeight(Ext.getBody().getViewSize().height * 0.8);
        editionWindow.setWidth(Ext.getBody().getViewSize().width * 0.8);
        editionWindow.show();

        return bioReplicateView;
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} bioconditionView
     * @param {type} bioreplicateModel
     * @returns {undefined}
     */
    showBioreplicateCopyWindowHandler: function (bioconditionView, bioreplicateModel) {
        var me = this;

        var creationWindow = Ext.create('Ext.window.Window', {
            title: 'New Biological Replicate',
            closable: false, modal: true, autoScroll: true,
            parent: bioconditionView,
            items: [],
            buttons: [
                {text: '<i class="fa fa-check"></i> Accept', cls: 'acceptButton', handler: function () {
                        me.addNewBioreplicateAcceptButtonClickHandler(creationWindow);
                    }},
                {text: '<i class="fa fa-remove"></i> Cancel', cls: 'cancelButton', scope: this, handler: function () {
                        creationWindow.close();
                    }}
            ]
        });

        var newModel = Ext.widget('BioReplicate');
        newModel.restoreFromMemento(bioreplicateModel.getMemento());

        var nextFakeID = bioconditionView.getModel().getNextFakeBioreplicateID();
        newModel.setID(nextFakeID);
        newModel.setBioConditionID(bioconditionView.getModel().getID());

        var bioReplicateView = Ext.widget('BioReplicateView');
        bioReplicateView.loadModel(newModel);
        newModel.addObserver(bioReplicateView);

        var analyticalSample = null;
        var analyticalSampleList = newModel.getAnalyticalReplicates();

        for (var i in analyticalSampleList) {
            analyticalSample = analyticalSampleList[i];
            analyticalSample.setID(newModel.getNextFakeAnalyticalRepID());
            analyticalSample.setBioReplicateID(newModel.getID());
        }

        bioReplicateView.setEditableMode(true);
        bioReplicateView.addNewTask('add_new_bioreplicate', newModel);

        creationWindow.add(bioReplicateView);
        creationWindow.setHeight(Ext.getBody().getViewSize().height * 0.8);
        creationWindow.setWidth(Ext.getBody().getViewSize().width * 0.8);
        creationWindow.show();
    },
    /**
     * This function handles the event fires when the button "Accept" located in 
     * "Edit BioReplicate" window is clicked.
     * First, checks if everything is OK, and if so sets the ID into the BioReplicate model and close the
     * creation window. Finally, updates the BioConditionDetailsView adding the new model.
     *
     * The ACCEPT BUTTON should be only visible during new OBJECTS creation/edition (eg. during a BIOCONDITION creation/edition) 
     * 
     * @param {type} editionWindow
     * @returns {undefined}
     */
    editSelectedBioRepAcceptButtonHandler: function (editionWindow) {
        //GET THE BIOREPLICATEVIEW PANEL
        var bioreplicateView = editionWindow.down('BioReplicateView');
        bioreplicateView.setLoading(true);

        //GET THE BioConditionVIEW PANEL OWNER OF THIS WINDOW   
        var bioConditionView = editionWindow.parent;

        // make sure the form contains valid data before submitting
        if (!bioreplicateView.validateContent()) {
            bioreplicateView.setLoading(false);
            console.error((new Date()).toLocaleString() + "SAVING BioCondition REQUEST ABORTED DUE TO LOCAL ERRORS (FORM ERRORS)");
            showErrorMessage('Invalid Data. Please correct form errors.');
            return;
        }
        bioConditionView.setLoading(true);
        //Remove the memento
        bioreplicateView.memento = null;

        //Update the model
        var model = bioreplicateView.getModel();
        model.setName(bioreplicateView.getName());
        model.setAssociatedBatch(bioreplicateView.getAssociatedBatch());
        model.notifyObservers();

        //ADD THE TASK TO CREATE THE NEW BIOREPLICATE IN THE SERVER SIDE
        for (var task in bioreplicateView.getTaskQueue()) {
            bioConditionView.addNewTask(bioreplicateView.getTaskQueue()[task].command, bioreplicateView.getTaskQueue()[task].object);
        }

        //CLOSE THE WINDOW
        bioConditionView.setUpdateNeededWorkflowPanel(true);
        bioConditionView.updateWorkflowPanel();
        bioreplicateView.setLoading(false);
        bioConditionView.setLoading(false);
        editionWindow.close();
    },
    /************************************************************************************************
     * This function handles the event fires when the button "Cancel" located in 
     * "Edit BioReplicate" window is clicked.
     * First check if the model hasChanged, if so, reverts the changes by using the 
     * memento stored in the view (if exists)
     *
     * @param editionWindow 
     *************************************************************************************************/
    editSelectedBioRepCancelButtonHandler: function (editionWindow) {
        //GET THE BIOREPLICATEVIEW PANEL
        var bioreplicateView = editionWindow.down('BioReplicateView');
        bioreplicateView.setLoading(true);
        //Get the model to be edited
        var bioreplicateModel = bioreplicateView.getModel();
        //If the model has changed (added a new AS or edited some values) --> restore
        if (bioreplicateModel.hasChanged()) {
            bioreplicateModel.restoreFromMemento(bioreplicateView.memento);
        }
        //Remove the memento
        bioreplicateView.memento = null;

        bioreplicateView.setLoading(false);
        editionWindow.close();
        bioreplicateModel.notifyObservers();
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} bioreplicateView
     * @returns {undefined}
     */
    addAnalyticalRepButtonClickHandler: function (bioreplicateView) {
        //GET THE BIOREPLICATEVIEW PANEL
        //Create a new window for AS creation
        var creationWindow = Ext.create('SL.view.SampleViews.AnalyticalReplicateCreationWindow', {parent: bioreplicateView});
        creationWindow.show();
        //Insert the first AS
        var store = creationWindow.down('grid').getStore();
        store.insert(0, {'treatment_id': "", 'analytical_rep_name': ""});
        creationWindow.down('grid').getRowEditing().startEdit(0, 0);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} analyticalReplicateCreationWindow
     * @returns {undefined}
     */
    addAnalyticalReplicatesAcceptButtonClickHandler: function (analyticalReplicateCreationWindow) {
        //Get the content of the grid panel
        var store = analyticalReplicateCreationWindow.queryById('analyticalSampleContainer').getStore();
        var bioreplicateView = analyticalReplicateCreationWindow.parent;
        var bioreplicateModel = bioreplicateView.getModel();

        var treatmentId = analyticalReplicateCreationWindow.queryById('protocolsList');

        if (!treatmentId.isValid()) {
            showErrorMessage("Please, choose a valid extraction protocol before continue.", {soft: true});
            return;
        }

        treatmentId = treatmentId.getValue();

        //For each new AnalyticalReplicate, creates a new model and add to the BioReplicate
        var nextFakeID, newModel, rowModel;
        for (var i = 0; i < store.getCount() - 1; i++) {
            nextFakeID = bioreplicateModel.getNextFakeAnalyticalRepID();
            rowModel = store.getAt(i);

            newModel = Ext.create('SL.model.SampleModels.AnalyticalReplicate');
            newModel.setID(nextFakeID);
            newModel.setTreatmentID(treatmentId);
            newModel.setAnalyticalRepName(rowModel.get('analytical_rep_name'));
            newModel.setBioReplicateID(bioreplicateModel.getID());

            bioreplicateModel.addAnalyticalReplicate(newModel);
            bioreplicateView.addNewTask("add_new_analytical_rep", newModel);
        }
        //If at least one AS was added refresh
        if (bioreplicateModel.hasChanged()) {
            bioreplicateView.updateAnalyticalSampleList();
        }
        analyticalReplicateCreationWindow.close();
    },
    /**
     * This function handles the event fired when the information of an Analytical Sample 
     * is edited in the grid panel (BioreplicateView)
     * 
     * @param bioreplicateView the view that contains the grid and the edited model's view
     * @param model the edited model
     * @returns {undefined}
     */
    editAnalyticalReplicateEventHandler: function (bioreplicateView, model) {
        bioreplicateView.up('BioReplicateView').addNewTask("edit_analytical_rep", model);
//        bioreplicateView.getModel().setChanged();
        model.setChanged();
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} analyticalSampleContainer
     * @param {type} rowIndex
     * @param {type} eOpts
     * @returns {undefined}
     */
    removeAnalyticalRepButtonClickHandler: function (analyticalSampleContainer, rowIndex, eOpts) {
        var me = this;
        var bioreplicateView = analyticalSampleContainer.up('BioReplicateView');
        var analyticalSampleID = analyticalSampleContainer.getStore().getAt(rowIndex).get('analytical_rep_id');

        var onSuccessAction = function () {
            me.showAnalyticalSampleDeletionDialogHandler(null, null, bioreplicateView, analyticalSampleID);
        };

        application.getController("BioConditionController").checkRemovableInstance(analyticalSampleID, "analytical_sample", onSuccessAction);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} bioconditionView
     * @param {type} bioreplicateModel
     * @param {type} bioreplicateView
     * @param {type} analyticalSampleID
     * @returns {undefined}
     */
    showAnalyticalSampleDeletionDialogHandler: function (bioconditionView, bioreplicateModel, bioreplicateView, analyticalSampleID) {
        if (bioreplicateView === null) {
            bioreplicateView = this.showBioreplicateEditionWindowHandler(bioconditionView, bioreplicateModel);
        }
        var askToContinue = function (buttonId, text, opt) {
            if (buttonId === "yes") {
                var analyticalReplicateModel = bioreplicateView.getModel().removeAnalyticalReplicate(analyticalSampleID);
                bioreplicateView.queryById('analyticalSampleContainer').getStore().remove(analyticalReplicateModel);
                bioreplicateView.addNewTask("remove_analytical_rep", analyticalReplicateModel);
            }
        };

        var message = Ext.MessageBox.show({
            title: 'Delete Analytical Sample?',
            msg: 'If the selected Analytical Sample has some associated Analysis, deletion will also remove those associated elements and, after saving, changes can not be undo.<br/>Are you sure to continue?',
            buttons: Ext.MessageBox.YESNO,
            fn: askToContinue,
            icon: Ext.MessageBox.QUESTION,
            modal: true
        });

        var task = new Ext.util.DelayedTask(function () {
            message.zIndexManager.bringToFront(message);
        });
        task.delay(500);

    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} bioreplicateView
     * @returns {undefined}
     */
    changeBatchButtonClickHandler: function (bioreplicateView) {
        var batchSelectionWindow = Ext.widget('BatchSelectionWindow', {parent: bioreplicateView});
        batchSelectionWindow.show(
                function (selectedBatch) {
                    if (selectedBatch != null) {
                        var batchInfoPanel = bioreplicateView.queryById('batchInfoPanel');
                        if (batchInfoPanel.getModel() !== null) {
                            batchInfoPanel.getModel().deleteObserver(batchInfoPanel);
                        }
                        batchInfoPanel.loadModel(selectedBatch[0]);
                        selectedBatch[0].addObserver(batchInfoPanel);
                        bioreplicateView.getModel().setAssociatedBatch(selectedBatch[0]);
                        batchInfoPanel.collapse();
                    }
                });
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} bioreplicateView
     * @returns {undefined}
     */
    disassociateBatchButtonClickHandler: function (bioreplicateView) {
        var batchInfoPanel = bioreplicateView.queryById('batchInfoPanel');
        if (batchInfoPanel.getModel() !== null) {
            batchInfoPanel.getModel().deleteObserver(batchInfoPanel);
        }
        batchInfoPanel.removeModel();
        bioreplicateView.getModel().setAssociatedBatch(null);
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} bioreplicateView
     * @returns {undefined}
     */
    editBatchButtonClickHandler: function (bioreplicateView) {
        //Get the model to be edited
        var batchModel = bioreplicateView.getModel().getAssociatedBatch();
        if (batchModel !== null) {
            application.getController("BatchController").showBatchDetailsButtonHandler(batchModel, 'edition');
        } else {
            showErrorMessage("This Biological replicate has not an associated batch.", {soft: true, delay: 500});
        }
    },
    /**
     * This function handles the event fires when 
     * 
     * @param {type} request_params
     * @returns {BioReplicateControllerAnonym$0.getCredentialsParams.credentials}
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