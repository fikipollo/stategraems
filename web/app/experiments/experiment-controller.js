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
 *     and others.
 *
 * THIS FILE CONTAINS THE FOLLOWING MODULE DECLARATION
 * - ExperimentListController
 * - ExperimentDetailController
 */
(function () {
    var app = angular.module('experiments.controllers', [
        'ang-dialogs',
        'angular.backtop',
        'experiments.services.experiment-list',
        'experiments.directives.experiment-views',
        'analysis.services.analysis-list',
        'templates.directives.template',
        'ui.bootstrap'
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


    /******************************************************************************      
     *       _____ ____  _   _ _______ _____   ____  _      _      ______ _____   _____ 
     *      / ____/ __ \| \ | |__   __|  __ \ / __ \| |    | |    |  ____|  __ \ / ____|
     *     | |   | |  | |  \| |  | |  | |__) | |  | | |    | |    | |__  | |__) | (___  
     *     | |   | |  | | . ` |  | |  |  _  /| |  | | |    | |    |  __| |  _  / \___ \ 
     *     | |___| |__| | |\  |  | |  | | \ \| |__| | |____| |____| |____| | \ \ ____) |
     *      \_____\____/|_| \_|  |_|  |_|  \_\\____/|______|______|______|_|  \_\_____/ 
     *                                                                                  
     *                                                                                  
     ******************************************************************************/

    app.controller('ExperimentListController', function ($rootScope, $scope, $http, $stateParams, $dialogs, APP_EVENTS, ExperimentList, AnalysisList) {
        /******************************************************************************      
         *       ___ ___  _  _ _____ ___  ___  _    _    ___ ___  
         *      / __/ _ \| \| |_   _| _ \/ _ \| |  | |  | __| _ \ 
         *     | (_| (_) | .` | | | |   / (_) | |__| |__| _||   / 
         *      \___\___/|_|\_| |_|_|_|_\\___/|____|____|___|_|_\ 
         *        | __| | | | \| |/ __|_   _|_ _/ _ \| \| / __|   
         *        | _|| |_| | .` | (__  | |  | | (_) | .` \__ \   
         *        |_|  \___/|_|\_|\___| |_| |___\___/|_|\_|___/   
         *                                                        
         ******************************************************************************/

        /******************************************************************************
         * This function retrieves all the experiments registered in the system
         * @param {type} group, limit the search to "user's" experiments (not used)
         * @param {type} force
         * @returns this
         ******************************************************************************/
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

                            if (Cookies.get('currentExperimentID')) {
                                $scope.currentExperiment = ExperimentList.getExperiment(Cookies.get('currentExperimentID'));
                            }
                        },
                        function errorCallback(response) {
                            $scope.isLoading = false;

                            debugger;
                            var message = "Failed while retrieving the list of studies.";
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

                if (Cookies.get('currentExperimentID')) {
                    $scope.currentExperiment = ExperimentList.getExperiment(Cookies.get('currentExperimentID'));
                }
            }

            return this;
        };

        /******************************************************************************
         * This function try to change the current selected experiment to a given one (if
         * user is member or owner).
         *
         * @param experiment_id the Experiment id
         * @return      
         ******************************************************************************/
        this.changeCurrentExperiment = function (experiment_id) {
            $http($rootScope.getHttpRequestConfig("POST", "experiment-selection", {
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                data: $rootScope.getCredentialsParams({'experiment_id': experiment_id}),
            })).then(
                    function successCallback(response) {
                        if (response.data.valid_experiment) {
                            console.info((new Date()).toLocaleString() + "CHANGED TO EXPERIMENT " + experiment_id + " SUCCESSFULLY");
                            Cookies.set('currentExperimentID', experiment_id, null, location.pathname);
                            AnalysisList.clearAnalysis();
                            $scope.currentExperiment = ExperimentList.getExperiment(Cookies.get('currentExperimentID'));
                            $dialogs.showSuccessDialog("Now you are working with study \"" + ExperimentList.getExperiment(experiment_id).title + "\"");
                        } else {
                            showErrorMessage("You are not member of the selected study. Please, contact administrator or study owners to become a member.");
                        }
                    },
                    function errorCallback(response) {
                        var message = "Failed while changing the current study.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExperimentListController:changeCurrentExperiment."
                        });
                        console.error(response.data);
                        debugger
                    }
            );
        };
        
                /******************************************************************************      
         * This function send a membership requests to the administrators of the 
         * experiment. 
         * @return   
         ******************************************************************************/
        this.send_membership_request = function (experiment_id) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "experiment-member-request", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'experiment_id': experiment_id}),
            })).then(
                    function successCallback(response) {
                        $scope.setLoading(false);
                        $dialogs.showSuccessDialog("A new membership request has been sent to the study administrators.");
                    },
                    function errorCallback(response) {
                        debugger;
                        $scope.setLoading(false);
                        var message = "Failed while sending membership request.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExperimentDetailController:send_membership_request."
                        });
                        console.error(response.data);
                    }
            );
        };

        /******************************************************************************
         * This function defines the behaviour for the "filterExperiments" function.
         * Given a item (experiment) and a set of filters, the function evaluates if
         * the current item contains the set of filters within the different attributes
         * of the model.
         *
         * @returns {Boolean} true if the model passes all the filters.
         ******************************************************************************/
        $scope.filterExperiments = function () {
            $scope.filteredExperiments = 0;
            $scope.user_id = $scope.user_id || Cookies.get("loggedUserID");
            return function (item) {
                if (item === $scope.currentExperiment) {
                    return false;
                }
                if ($scope.show === "my_experiments") {
                    if (!ExperimentList.isOwner(item, $scope.user_id) && !ExperimentList.isMember(item, $scope.user_id)) {
                        return false;
                    }
                }

                var filterAux, item_tags;
                for (var i in $scope.filters) {
                    filterAux = $scope.filters[i].toLowerCase();
                    item_tags = item.tags.join("");
                    if (!((item.title.toLowerCase().indexOf(filterAux)) !== -1 || (item.experiment_description.toLowerCase().indexOf(filterAux)) !== -1 || (item_tags.toLowerCase().indexOf(filterAux)) !== -1)) {
                        return false;
                    }
                }
                $scope.filteredExperiments++;
                return true;
            };
        };

        /******************************************************************************      
         * This function returns a color for the given tag
         * 
         * @return {String} color code
         ******************************************************************************/
        $scope.getTagColor = function (_tag) {
            var tag = ExperimentList.getTag(_tag);
            if (tag !== null) {
                return tag.color;
            }
            return "";
        };

        /******************************************************************************      
         * This function checks if the current user is a valid owner or member for the 
         * experiment
         * 
         * @returns {Boolean} true is the current user is a valid member
         ******************************************************************************/
        $scope.isMember = function (experiment) {
            $scope.user_id = $scope.user_id || Cookies.get("loggedUserID");
            return (ExperimentList.isOwner(experiment, $scope.user_id) || ExperimentList.isMember(experiment, $scope.user_id));
        };

        /******************************************************************************      
         * This function 
         *
         ******************************************************************************/
        this.filterByTag = function (tag) {
            if (tag !== "All") {
                var filters = arrayUnique($scope.filters.concat(tag));
                $scope.filters = ExperimentList.setFilters(filters).getFilters();
            }
        };

        /******************************************************************************      
         *            _____   _____ _  _ _____         
         *           | __\ \ / / __| \| |_   _|        
         *           | _| \ V /| _|| .` | | |          
         *      _  _ |___| \_/_|___|_|\_| |_| ___  ___ 
         *     | || | /_\ | \| |   \| |  | __| _ \/ __|
         *     | __ |/ _ \| .` | |) | |__| _||   /\__ \
         *     |_||_/_/ \_\_|\_|___/|____|___|_|_\|___/
         *                                             
         ******************************************************************************/

        /******************************************************************************      
         * This function handles the event fires when an experiment is deleted.
         *
         ******************************************************************************/
        $scope.$on(APP_EVENTS.experimentDeleted, function () {
            debugger;
            this.retrieveAnalysisData('', true);
        });

        /******************************************************************************      
         * This function handles the event fires when the filter chooser changes.
         *
         ******************************************************************************/
        this.showExperimentChooserChangeHandler = function () {
            this.retrieveExperimentsData($scope.show);
        };

        /******************************************************************************      
         * This function applies the filters when the user clicks on "Search"
         *
         ******************************************************************************/
        this.applySearchHandler = function () {
            var filters = arrayUnique($scope.filters.concat($scope.searchFor.split(" ")));
            $scope.filters = ExperimentList.setFilters(filters).getFilters();
        };

        /******************************************************************************      
         * This function remove a given filter when the user clicks at the "x" button
         * 
         * @param {String} filter the filter to be removed 
         ******************************************************************************/
        this.removeFilterHandler = function (filter) {
            $scope.filters = ExperimentList.removeFilter(filter).getFilters();
        };

        /******************************************************************************      
         * This function handles the event fires when the user clicks on the button 
         * "Show more" experiments in the list
         *
         ******************************************************************************/
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

        /******************************************************************************
         *      ___ _  _ ___ _____ ___   _   _    ___ ____  _ _____ ___ ___  _  _ 
         *     |_ _| \| |_ _|_   _|_ _| /_\ | |  |_ _|_  / /_\_   _|_ _/ _ \| \| |
         *      | || .` || |  | |  | | / _ \| |__ | | / / / _ \| |  | | (_) | .` |
         *     |___|_|\_|___| |_| |___/_/ \_\____|___/___/_/ \_\_| |___\___/|_|\_|
         *     
         ******************************************************************************/
        this.name = "ExperimentListController";
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

        if (Cookies.get('currentExperimentID')) {
            $scope.currentExperiment = ExperimentList.getExperiment(Cookies.get('currentExperimentID'));
        }

        if ($scope.experiments.length === 0 || $stateParams.force) {
            this.retrieveExperimentsData("my_experiments", true);
        }

    });

    app.controller('ExperimentDetailController', function ($state, $rootScope, $scope, $http, $stateParams, $timeout, $dialogs, APP_EVENTS, ExperimentList, TemplateList) {
        /******************************************************************************      
         *       ___ ___  _  _ _____ ___  ___  _    _    ___ ___  
         *      / __/ _ \| \| |_   _| _ \/ _ \| |  | |  | __| _ \ 
         *     | (_| (_) | .` | | | |   / (_) | |__| |__| _||   / 
         *      \___\___/|_|\_| |_|_|_|_\\___/|____|____|___|_|_\ 
         *        | __| | | | \| |/ __|_   _|_ _/ _ \| \| / __|   
         *        | _|| |_| | .` | (__  | |  | | (_) | .` \__ \   
         *        |_|  \___/|_|\_|\___| |_| |___\___/|_|\_|___/   
         *                                                        
         ******************************************************************************/

        /******************************************************************************
         * This function gets the details for a given Experiment
         * 
         * @param {String} experiment_id the id for the Experiment to be retieved
         * @param {Boolean} force true to force the request
         ******************************************************************************/
        this.retrieveExperimentDetails = function (experiment_id, force) {
            $scope.setLoading(true);

            $scope.model = ExperimentList.getExperiment(experiment_id);

            //TODO: EXTRA FIELDS
            // $scope.model.extra = {
            //   section_1: [ { "name": "title", "label": "Extra 2", "type": "text" } ]
            // };
            if ($scope.model === null || force === true) {
                $http($rootScope.getHttpRequestConfig("POST", "experiment-info", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams({experiment_id: experiment_id})
                })).then(
                        function successCallback(response) {
                            $scope.model = ExperimentList.addExperiment(response.data);
                            ExperimentList.adaptInformation([$scope.model])[0];
                            $scope.setLoading(false);
                        },
                        function errorCallback(response) {
                            debugger;
                            var message = "Failed while retrieving the details for the study.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at ExperimentDetailController:retrieveExperimentDetails."
                            });
                            console.error(response.data);
                            $scope.setLoading(false);
                        }
                );
            }
            $scope.setLoading(false);
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
         * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
         * @param  callback_function the function invoked by the callback_caller after the success/failure event
         * @return   
         ******************************************************************************/
        this.send_create_experiment = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "experiment-create", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'experiment_json_data': $scope.model}),
            })).then(
                    function successCallback(response) {
                        console.info((new Date()).toLocaleString() + "Study " + $scope.model.experiment_id + " successfully saved in server");
                        $scope.model.experiment_id = response.data.newID;
                        ExperimentList.addExperiment($scope.model);
//                        //Notify all the other controllers that a new experiment exists
//                        $rootScope.$emit(APP_EVENTS.experimentCreated);
                        $scope.setLoading(false);

                        callback_caller[callback_function](true);
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while creating a new study.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExperimentDetailController:send_create_experiment."
                        });
                        console.error(response.data);

                        $scope.taskQueue.unshift({command: "create_new_experiment", object: null});
                        $scope.setLoading(false);
                        callback_caller[callback_function](false);
                    }
            );
        };

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
        this.send_update_experiment = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "experiment-update", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'experiment_json_data': $scope.model}),
            })).then(
                    function successCallback(response) {
                        console.info((new Date()).toLocaleString() + "Study " + $scope.model.experiment_id + " successfully updated in server");
                        $scope.setLoading(false);
                        callback_caller[callback_function](true);
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while updating the study.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExperimentDetailController:send_update_experiment."
                        });
                        console.error(response.data);

                        $scope.taskQueue.unshift({command: "update_experiment", object: null});
                        $scope.setLoading(false);
                        callback_caller[callback_function](false);
                    }
            );
        };

        /******************************************************************************      
         * This function lock a experiment for editing.  
         * @param {String} newViewMode the new viewMode in case of success
         * @return this;  
         ******************************************************************************/
        this.send_lock_experiment = function (newViewMode) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "experiment-lock", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'experiment_id': $scope.model.experiment_id}),
            })).then(
                    function successCallback(response) {
                        if (response.data.success) {
                            console.info((new Date()).toLocaleString() + "object locked successfully");
                            if (newViewMode === "edition") {
                                $scope.initializeCountdownDialogs();
                            }
                            $scope.setViewMode(newViewMode || 'view');
                            $scope.setLoading(false);
                        } else {
                            $dialogs.showErrorDialog('Apparently user ' + response.data.user_id + ' opened this object for editing. </br>Please, try again later. If the problem persists, please contact with tecnical support.', {
                                logMessage: ((new Date()).toLocaleString() + "EDITION DENIED FOR Study " + $scope.model.experiment_id)
                            });
                            $scope.setLoading(false);
                        }
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while sending lock request.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExperimentDetailController:send_lock_experiment."
                        });
                        console.error(response.data);
                        $scope.setLoading(false);
                    }
            );
            return this;
        };

        /******************************************************************************      
         * This function lock a experiment for editing.  
         * @return this;  
         ******************************************************************************/
        this.send_unlock_experiment = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "experiment-unlock", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'experiment_id': $scope.model.experiment_id}),
            })).then(
                    function successCallback(response) {
                        console.info((new Date()).toLocaleString() + "object unlocked successfully");
                        $scope.setLoading(false);
                        if (callback_caller) {
                            callback_caller[callback_function](true);
                        } else {
                            $scope.setViewMode('view', true);
                        }
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while sending unlock request.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExperimentDetailController:send_unlock_experiment."
                        });
                        console.error(response.data);
                        callback_caller[callback_function](false);
                        $scope.setLoading(false);
                    }
            );
            return this;
        };

        /******************************************************************************
         * This function cleans the queue of tasks and prepare it for executing.
         * 
         * @param {Array} tasks_queue the list of tasks to be executed
         * @returns {Array} the new task
         ******************************************************************************/
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
                tasks_queue_temp.push({command: "update_experiment", object: null});
                tasks_queue_temp.push({command: "clear_locked_status", object: null});
                return tasks_queue_temp;
            } catch (error) {
                $dialogs.showErrorDialog('ERROR CLEANING TASK QUEUE: ' + error, {soft: false});
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
         
         * @param  status true if some error occurs during execution
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
                            console.info((new Date()).toLocaleString() + "SENDING SAVE NEW study REQUEST TO SERVER");
                            this.send_create_experiment(this, "execute_tasks");
                            console.info((new Date()).toLocaleString() + "SAVE NEW study REQUEST SENT TO SERVER");
                            break;
                        case "update_experiment":
                            console.info((new Date()).toLocaleString() + "SENDING UPDATE study REQUEST TO SERVER");
                            this.send_update_experiment(this, "execute_tasks");
                            console.info((new Date()).toLocaleString() + "UPDATE study REQUEST SENT TO SERVER");
                            break;
                        case "clear_locked_status":
                            //TODO:
                            console.info(new Date().toLocaleString() + "SENDING UNLOCK study " + $scope.model.experiment_id + " REQUEST TO SERVER");
                            this.send_unlock_experiment(this, "execute_tasks");
                            console.info(new Date().toLocaleString() + "UNLOCK study " + $scope.model.experiment_id + " REQUEST SENT TO SERVER");
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
                $scope.setViewMode("view", true);
                $scope.setLoading(false);
                $dialogs.showSuccessDialog('Study ' + $scope.model.experiment_id + ' saved successfully');
            } else {
                status = false;
                $scope.taskQueue.unshift(current_task);
                $scope.setLoading(false);
            }
        };

        /******************************************************************************
         * This function changes the view mode
         *
         * @param {String} mode the new mode for the view
         * @param {Boolean} restore determines if the model should be restored from a saved memento
         * @return {String} the new mode
         ******************************************************************************/
        $scope.setViewMode = function (mode, restore) {
            if (mode === 'view') {
                $scope.panel_title = "Experiment details.";
                $scope.clearCountdownDialogs();
                if (restore === true) {
                    me.retrieveExperimentDetails($scope.model.experiment_id, true);
                }
            } else if (mode === 'creation') {
                $scope.panel_title = "Experiment creation.";
                $scope.addNewTask("create_new_experiment", null);
            } else if (mode === 'edition') {
                $scope.panel_title = "Experiment edition.";
                this.addNewTask("clear_locked_status", null);
            }
            $scope.viewMode = mode;//'view', 'creation', 'edition'
        };

        /******************************************************************************
         * This function initialize the timers that check the max time for editing
         *
         ******************************************************************************/
        $scope.initializeCountdownDialogs = function () {
            //TODO
            console.error("initializeCountdownDialogs NOT IMPLEMENTED");
        };

        /******************************************************************************
         * This function clears the timers that check the max time for editing
         *
         ******************************************************************************/
        $scope.clearCountdownDialogs = function () {
            //TODO
            console.error("cleanCountdownDialogs NOT IMPLEMENTED");
        };
        /******************************************************************************      
         *            _____   _____ _  _ _____         
         *           | __\ \ / / __| \| |_   _|        
         *           | _| \ V /| _|| .` | | |          
         *      _  _ |___| \_/_|___|_|\_| |_| ___  ___ 
         *     | || | /_\ | \| |   \| |  | __| _ \/ __|
         *     | __ |/ _ \| .` | |) | |__| _||   /\__ \
         *     |_||_/_/ \_\_|\_|___/|____|___|_|_\|___/
         *                                             
         ******************************************************************************/

        /******************************************************************************
         * This function handles the event fires when the user deletes an experiment
         *
         ******************************************************************************/
        this.deleteExperimentHandler = function () {
            var me = this;
            $scope.setLoading(true);

            var current_user_id = '' + Cookies.get('loggedUserID');
            if (ExperimentList.isOwner($scope.model, current_user_id) || current_user_id === "admin") {
                $http($rootScope.getHttpRequestConfig("POST", "experiment-delete", {
                    headers: {'Content-Type': 'application/json; charset=utf-8'},
                    data: $rootScope.getCredentialsParams({'experiment_id': $scope.model.experiment_id, loggedUserID: current_user_id}),
                })).then(
                        function successCallback(response) {
                            $scope.setLoading(false);
                            //Notify all the other controllers that user has signed in
                            $rootScope.$emit(APP_EVENTS.experimentDeleted);
                            $dialogs.showSuccessDialog("The study was successfully deleted.");
                            $state.go('experiments', {force: true});
                        },
                        function errorCallback(response) {
                            $scope.setLoading(false);
                            var message = "Failed while deleting the study.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at ExperimentDetailController:deleteExperimentHandler."
                            });
                            console.error(response.data);
                            debugger
                        }
                );
            }
        };

        /******************************************************************************
         * This function handles the event accept_button_pressed fires in other Controller 
         * (eg. ApplicationController) when a button Accept is pressed.
         *  
         * @returns the controller;
         * @chainable
         ******************************************************************************/
        this.acceptButtonHandler = function () {
            if (!$scope.experimentForm.$valid) {
                $dialogs.showErrorDialog("Invalid form, please check the form and fill the empty fields.");
                return false;
            }

            $scope.setTaskQueue(this.clean_task_queue($scope.getTaskQueue()));
            this.execute_tasks(true);
            return this;
        };
        
        /******************************************************************************
         * This function send a Edition request to the server in order to block the Experiment
         * avoiding that other users edit it before the user saves the changes.
         * Each user has 30 minutes max. to edit a Experiment, after that the user will be 
         * ask again, if no answer is given, the Experiment is unblocked and changes will be  
         * lost.
         * This is neccessary because if the user leaves the application without save or close 
         * the panel, the server MUST free the blocked object in order to let other users edit it.
         * After BLOCKET_TIME minutes, the server automatically frees the blocked object, so the user
         * will be asked 1 minute before the liberation takes place.
         *  
         * @returns {ExperimentDetailController} the controller;
         * @chainable
         ******************************************************************************/
        this.editButtonHandler = function () {
            //1. CHECK IF THE USER HAS EDITING PRIVILEGES OVER THE Experiment (ONLY OWNERS)
            var current_user_id = '' + Cookies.get('loggedUserID');
            if (!ExperimentList.isOwner($scope.model, current_user_id) && current_user_id !== "admin") {
                console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over the study " + $scope.model.experiment_id);
                $dialogs.showErrorDialog("Your user is not allowed to edit this study");
                return;
            }

            //2. SEND LOCK REQUEST
            console.info((new Date()).toLocaleString() + "SENDING EDIT REQUEST FOR study " + $scope.model.experiment_id + " TO SERVER");
            this.send_lock_experiment('edition');

            return this;
        };

        /******************************************************************************
         * This function handles the cancel_button_pressed thown by the Application Controller
         * when the Cancel button located in MainView is pressed and the inner panel is an
         * ExperimentDetailsView panel.
         * Asks the user if close without save changes. If user selects "Yes", the panel is closed.
         * if the panel was in a "Editing mode" (if the panel has a timer id), then sends a signal 
         * to the server in order to unlock the Experiment in the list of locked elements.
         ******************************************************************************/
        this.cancelButtonHandler = function () {
            //TODO: REMOVE COUNTERS AND UNLOCK EXPERIMENT
            $scope.clearTaskQueue();

            if ($scope.viewMode === 'view') {
                $state.go('experiments');
            } else if ($scope.viewMode === 'edition') {
                this.send_unlock_experiment();
            } else {
                $state.go('experiments');
            }
        };

        /******************************************************************************
         *      ___ _  _ ___ _____ ___   _   _    ___ ____  _ _____ ___ ___  _  _ 
         *     |_ _| \| |_ _|_   _|_ _| /_\ | |  |_ _|_  / /_\_   _|_ _/ _ \| \| |
         *      | || .` || |  | |  | | / _ \| |__ | | / / / _ \| |  | | (_) | .` |
         *     |___|_|\_|___| |_| |___/_/ \_\____|___/___/_/ \_\_| |___\___/|_|\_|
         *     
         ******************************************************************************/
        this.name = "ExperimentDetailController";
        var me = this;

        //The corresponding view will be watching to this variable
        //and update its content after the http response
        $scope.loadingComplete = false;
        $scope.model = {};
        $scope.setViewMode($stateParams.viewMode || 'view');
        $scope.getFormTemplate('experiment-form');

        if ($stateParams.experiment_id !== null) {
            this.retrieveExperimentDetails($stateParams.experiment_id);
        } else {
            $scope.model.experiment_id = "[Autogenerated after saving]";
            $scope.model.submission_date = new Date();
            $scope.model.last_edition_date = new Date();
            $scope.model.experiment_owners = [{user_id: Cookies.get("loggedUserID")}];
            $scope.model.experiment_members = [];
            $scope.model.tags = [];
        }

    });
})();