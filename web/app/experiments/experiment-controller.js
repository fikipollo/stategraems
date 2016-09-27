/*
 * (C) Copyright 2016 SLU Global Bioinformatics Centre, SLU
 * (http://sgbc.slu.se) and the B3Africa Project (http://www.b3africa.org/).
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
 *     Rafael Hernandez de Diego <rafahdediego@gmail.com>
 *     Tomas Klingström
 *     Erik Bongcam-Rudloff
 *     and others.
 *
 * THIS FILE CONTAINS THE FOLLOWING MODULE DECLARATION
 * - ExperimentListController
 * - ExperimentDetailController
 */
(function () {
    var app = angular.module('experiments.controllers', [
        'common.dialogs',
        'angular.backtop',
        'experiments.services.experiment-list',
        'experiments.directives.experiment-card',
        'templates.directives.template'
    ]);

    //TODO: MOVE TO DIRECTIVES
    app.directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    });

    /***************************************************************************/
    /*CONTROLLERS **************************************************************/
    /***************************************************************************/
    app.controller('ExperimentListController', function ($rootScope, $scope, $http, $dialogs, ExperimentList) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------
        /**
         * This function retrieves all the experiments registered in the system
         * @param {type} group, limit the search to "user's" experiments (not used)
         * @param {type} force
         * @returns this
         */
        this.retrieveExperimentsData = function (group, force) {
            $scope.isLoading = true;

            if (ExperimentList.getOld() > 1 || force) { //Max age for data 5min.
                $http($rootScope.getHttpRequestConfig("POST", "experiment-list", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams()
                })).then(
                        function successCallback(response) {
                            $scope.isLoading = false;
                            $scope.experiments = ExperimentList.setExperiments(response.data).getExperiments();
                            $scope.tags = ExperimentList.updateTags().getTags();
                            $scope.filteredExperiments = $scope.experiments.length;

                            //Display the experiments in batches
                            if (window.innerWidth > 1500) {
                                $scope.visibleExperiments = 14;
                            } else if (window.innerWidth > 1200) {
                                $scope.visibleExperiments = 10;
                            } else {
                                $scope.visibleExperiments = 6;
                            }

                            $scope.visibleExperiments = Math.min($scope.filteredExperiments, $scope.visibleExperiments);
                        },
                        function errorCallback(response) {
                            $scope.isLoading = false;

                            debugger;
                            var message = "Failed while retrieving the experiments list.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at ExperimentListController:retrieveExperimentsData."
                            });
                            console.error(response.data);
                        }
                );
            } else {
                $scope.experiments = ExperimentList.getExperiments();
                $scope.tags = ExperimentList.getTags();
                $scope.filteredExperiments = $scope.experiments.length;
                $scope.isLoading = false;
            }

            return this;
        };

        /**
         * This function defines the behaviour for the "filterExperiments" function.
         * Given a item (experiment) and a set of filters, the function evaluates if
         * the current item contains the set of filters within the different attributes
         * of the model.
         *
         * @returns {Boolean} true if the model passes all the filters.
         */
        $scope.filterExperiments = function () {
            $scope.filteredExperiments = 0;
            $scope.username = $scope.username || Cookies.get("loggedUser");
            return function (item) {
                if ($scope.show === "my_experiments") {
                    for (var i in  item.experiment_owners) {
                        if (item.experiment_owners[i].user_id === $scope.username) {
                            item.isMember = true;
                            break;
                        }
                    }

                    if (!item.isMember) {
                        for (var i in  item.experiment_members) {
                            if (item.experiment_members[i].user_id === $scope.username) {
                                item.isMember = true;
                                break;
                            }
                        }
                    }

                    if (!item.isMember) {
                        return false;
                    }
                }

                var filterAux, item_tags;
                for (var i in $scope.filters) {
                    filterAux = $scope.filters[i].toLowerCase();
                    item_tags = item.tags.join("");
                    if (!((item.name.toLowerCase().indexOf(filterAux)) !== -1 || (item_tags.toLowerCase().indexOf(filterAux)) !== -1)) {
                        return false;
                    }
                }
                $scope.filteredExperiments++;
                return true;
            };
        };

        $scope.getTagColor = function (_tag) {
            var tag = ExperimentList.getTag(_tag);
            if (tag !== null) {
                return tag.color;
            }
            return "";
        }

        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------

        this.deleteExperimentHandler = function (experiment) {
            var me = this;
            $dialogs.showConfirmationDialog('Delete the experiment ' + model.name + ' from your collection?\nThis action cannot be undone.', {
                title: "Please confirm this action.",
                callback: function (result) {
                    if (result === 'ok') {
                        $http($rootScope.getHttpRequestConfig("DELETE", "experiment-delete", {
                            headers: {'Content-Type': 'application/json; charset=utf-8'},
                            extra: model.experiment_id
                        })).then(
                                function successCallback(response) {
                                    $dialogs.showSuccessDialog("The experiment was successfully deleted.");
                                    $scope.experiments = ExperimentList.deleteExperiment(model.id);
                                    $scope.tags = ExperimentList.updateTags().getTags();
                                    // $scope.filteredExperiments = $scope.experiments.length;
                                    me.retrieveExperimentsData("my_experiments", true);
                                },
                                function errorCallback(response) {
                                    debugger;
                                    var message = "Failed while deleting the experiment.";
                                    $dialogs.showErrorDialog(message, {
                                        logMessage: message + " at ExperimentListController:deleteExperimentHandler."
                                    });
                                    console.error(response.data);
                                    debugger
                                }
                        );
                    }
                }
            });
        }

        this.showExperimentChooserChangeHandler = function () {
            this.retrieveExperimentsData($scope.show);
        }
        /**
         * This function applies the filters when the user clicks on "Search"
         */
        this.applySearchHandler = function () {
            var filters = arrayUnique($scope.filters.concat($scope.searchFor.split(" ")));
            $scope.filters = ExperimentList.setFilters(filters).getFilters();
        };

        this.filterByTag = function (tag) {
            if (tag !== "All") {
                var filters = arrayUnique($scope.filters.concat(tag));
                $scope.filters = ExperimentList.setFilters(filters).getFilters();
            }
        }

        /**
         * This function remove a given filter when the user clicks at the "x" button
         */
        this.removeFilterHandler = function (filter) {
            $scope.filters = ExperimentList.removeFilter(filter).getFilters();
        };

        this.showMoreExperimentsHandler = function () {
            if (window.innerWidth > 1500) {
                $scope.visibleExperiments += 10;
            } else if (window.innerWidth > 1200) {
                $scope.visibleExperiments += 6;
            } else {
                $scope.visibleExperiments += 4;
            }
            $scope.visibleExperiments = Math.min($scope.filteredExperiments, $scope.visibleExperiments);
        }



        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        var me = this;

        //This controller uses the ExperimentList, which defines a Singleton instance of
        //a list of experiments + list of tags + list of filters. Hence, the application will not
        //request the data everytime that the experiment list panel is displayed (data persistance).
        $scope.experiments = ExperimentList.getExperiments();
        $scope.tags = ExperimentList.getTags();
        $scope.filters = ExperimentList.getFilters();
        $scope.filteredExperiments = $scope.experiments.length;

        //Display the experiments in batches
        if (window.innerWidth > 1500) {
            $scope.visibleExperiments = 14;
        } else if (window.innerWidth > 1200) {
            $scope.visibleExperiments = 10;
        } else {
            $scope.visibleExperiments = 6;
        }

        $scope.visibleExperiments = Math.min($scope.filteredExperiments, $scope.visibleExperiments);


        if ($scope.experiments.length === 0) {
            this.retrieveExperimentsData("my_experiments");
        }
    });

    app.controller('ExperimentDetailController', function ($state, $rootScope, $scope, $http, $stateParams, $timeout, $dialogs, ExperimentList, TemplateList) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------

        /**
         * This function gets the details for a given Experiment
         * @param experiment_id the id for the Experiment to be retieved
         */
        this.retrieveExperimentDetails = function (experiment_id, force) {
            $scope.model = ExperimentList.getExperiment(experiment_id);

            //TODO: EXTRA FIELDS
            $scope.model.extra = {
                section_1: [
                    {
                        "name": "title",
                        "label": "Extra 2",
                        "type": "text"
                    }
                ]
            };
            $scope.model.experiment_owners = [{"user_id": "admin", "email": "", "role": "", "loggedIn": ""}];
            $scope.model.submission_date = '2016/09/22';
            $scope.model.last_edition_date = '2016/09/22';
            $scope.model.tags= [{"value":1,"text":"Amsterdam"}];

            
            if ($scope.experiment === null || force === true) {
                $http($rootScope.getHttpRequestConfig("POST", "experiment-info", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams({experiment_id: experiment_id})
                })).then(
                        function successCallback(response) {
                            for (var attrname in response.data) {
                                $scope.model[attrname] = response.data[attrname];
                            }

                            //TODO: DATES?
                            //TODO: OWNERS?
                            //TODO: MEMBERS?

                            $scope.loadingComplete = true;
                        },
                        function errorCallback(response) {
                            debugger;
                            var message = "Failed while retrieving the experiment's details.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at ExperimentDetailController:retrieveExperimentDetails."
                            });
                            console.error(response.data);
                        }
                );
            }
        };

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
        this.send_create_experiment = function (callback_caller, callback_function) {
            //TODO: fix owners
            $scope.model.experiment_owners = [{"user_id": "admin", "email": "", "role": "", "loggedIn": ""}];
            $scope.model.submission_date = '2016/09/22';
            $scope.model.last_edition_date = '2016/09/22';

            $http($rootScope.getHttpRequestConfig("POST", "experiment-create", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'experiment_json_data': $scope.experiment}),
            })).then(
                    function successCallback(response) {
                        $scope.model.experiment_id = response.newID;
                        console.info((new Date()).toLocaleString() + " Experiment " + $scope.model.experiment_id + " SAVED IN SERVER SUCCESSFULLY");
                        callback_caller[callback_function](true);
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while creating a new experiment.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExperimentDetailController:send_create_experiment."
                        });
                        console.error(response.data);

                        $scope.taskQueue.unshift({command: "create_new_experiment", object: null});
                        callback_caller[callback_function](false);
                    }
            );
        };

        this.clean_task_queue = function (tasks_queue) {
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
                $scope.showErrorDialog('ERROR CLEANING TASK QUEUE: ' + error, {soft: false});
                return tasks_queue;
            }
        };

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
        this.execute_tasks = function (status) {
            var error_message = "";
            //GET THE NEXT TASK IN THE QUEUE
            var current_task = $scope.getTaskQueue().shift();
            //IF THERE IS A NEXT TASK AND NO PREVIOUS ERROR
            if (current_task != null && status) {
                try {
                    switch (current_task.command)
                    {
                        case "create_new_experiment":
                            console.info((new Date()).toLocaleString() + "SENDING SAVE NEW experiment REQUEST TO SERVER");
                            this.send_create_experiment(this, "execute_tasks");
                            console.info((new Date()).toLocaleString() + "SAVE NEW experiment REQUEST SENT TO SERVER");
                            break;
                        case "update_experiment":
                            console.info((new Date()).toLocaleString() + "SENDING UPDATE Experiment REQUEST TO SERVER");
                            this.send_update_experiment(this, "execute_tasks");
                            console.info((new Date()).toLocaleString() + "UPDATE Experiment REQUEST SENT TO SERVER");
                            break;
                        case "clear_blocked_status":
                            //TODO:
                            console.info(new Date().toLocaleString() + "SENDING UNLOCK Experiment " + $scope.model.experiment_id + " REQUEST TO SERVER");
                            this.send_unblock_experiment(this, "execute_tasks");
                            console.info(new Date().toLocaleString() + "UNLOCK Experiment " + $scope.model.experiment_id + " REQUEST SENT TO SERVER");
                            break;
                        default:
                            status = false;
                            break;
                    }
                } catch (error) {
                    error_message = error.message;
                    status = false;
                    $scope.taskQueue.unshift(current_task);
                }

                if (!status) {
                    $dialogs.showErrorDialog('Failed trying to saved the changes.</br>Please try again.</br>Error: ' + error_message);
                }
            }
            //IF NO MORE TASKS AND EVERYTHING GOES WELL
            else if (status) {
                //TODO: $scope.cleanCountdownDialogs();
                $scope.setViewMode("view");
                this.retrieveExperimentDetails($scope.model.experiment_id, true);
                $dialog.showSuccessDialog('Experiment ' + $scope.model.id + ' saved successfully');
            } else {
                status = false;
                $scope.taskQueue.unshift(current_task);
                $scope.setLoading(false);
            }
        };

        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------

        this.acceptButtonHandler = function () {
            // experimentView.setLoading(true);
            //Check if the information in the form is valid
            $scope.setTaskQueue(this.clean_task_queue($scope.getTaskQueue()));
            this.execute_tasks(true);
        }

        this.cancelButtonHandler = function () {
            history.back();
        };

        this.backButtonHandler = function () {
            $scope.invocation.current_step--;
        };

        this.nextStepButtonHandler = function () {
            if ($scope.invocation.valid === true) {
                $scope.invocation.current_step++;
            }
        }

        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        var me = this;

        $scope.setViewMode = function (mode) {
            if (mode === 'view') {
                $scope.panel_title = "Experiment details.";
            } else if (mode === 'creation') {
                $scope.panel_title = "Experiment creation.";
                $scope.addNewTask("create_new_experiment", null);
            } else if (mode === 'edition') {
                $scope.panel_title = "Experiment edition.";
                this.addNewTask("clear_blocked_status", null);
            }
            $scope.viewMode = mode;//'view', 'creation', 'edition'
        };


        //The corresponding view will be watching to this variable
        //and update its content after the http response
        $scope.loadingComplete = false;
        $scope.model = {};
        $scope.setViewMode($stateParams.viewMode || 'view');
        $scope.getFormTemplate($scope, 'experiment-form');

        if ($stateParams.experiment_id !== null) {
            this.retrieveExperimentDetails($stateParams.experiment_id);
        }

    });
})();