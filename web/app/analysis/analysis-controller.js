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
 * - AnalysisListController
 * - AnalysisDetailController
 * - StepDetailController
 */
(function () {
    var app = angular.module('analysis.controllers', [
        'ang-dialogs',
        'angular.backtop',
        'analysis.services.analysis-list',
        'analysis.directives.analysis-views',
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
    app.controller('AnalysisListController', function ($state, $rootScope, $scope, $http, $stateParams, $dialogs, APP_EVENTS, AnalysisList) {
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
         * This function retrieves all the analysis registered in the system
         * @param {type} group, limit the search to "user's" analysis (not used)
         * @param {type} force
         * @returns this
         ******************************************************************************/
        this.retrieveAnalysisData = function (group, force) {
            $scope.setLoading(true);
            if (AnalysisList.getOld() > 1 || force) { //Max age for data 5min.
                $http($rootScope.getHttpRequestConfig("POST", "analysis-list", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams()
                })).then(
                        function successCallback(response) {
                            //LOAD ANALYSIS
                            $scope.analysis = AnalysisList.setAnalysis(response.data).getAnalysis();

                            for (var i in $scope.analysis) {
                                if ($scope.analysis[i].status === "pending") {
                                    $scope.review = true;
                                    break;
                                }
                            }
                            //UPDATE THE LIST OF TAGS
                            $scope.tags = AnalysisList.updateTags().getTags();
                            //Update the list of analysis types
                            $scope.analysisTypes = AnalysisList.updateAnalysisTypes().getAnalysisTypes();
                            $scope.filteredAnalysis = $scope.analysis.length;

                            //Display the analysis in batches
                            if (window.innerWidth > 1500) {
                                $scope.visibleAnalysis = 14;
                            } else if (window.innerWidth > 1200) {
                                $scope.visibleAnalysis = 10;
                            } else {
                                $scope.visibleAnalysis = 6;
                            }
                            $scope.visibleAnalysis = Math.min($scope.filteredAnalysis, $scope.visibleAnalysis);

                            $scope.setLoading(false);
                        },
                        function errorCallback(response) {
                            $scope.setLoading(false);

                            debugger;
                            var message = "Failed while retrieving the analysis list.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at AnalysisListController:retrieveAnalysisData."
                            });
                            console.error(response.data);
                        }
                );
            } else {
                $scope.analysis = AnalysisList.getAnalysis();
                $scope.tags = AnalysisList.getTags();
                $scope.filteredAnalysis = $scope.analysis.length;
                for (var i in $scope.analysis) {
                    if ($scope.analysis[i].status === "pending") {
                        $scope.review = true;
                        break;
                    }
                }
                $scope.setLoading(false);
            }

            return this;
        };

        /******************************************************************************      
         * This function defines the behaviour for the "filterAnalysis" function.
         * Given a item (analysis) and a set of filters, the function evaluates if
         * the current item contains the set of filters within the different attributes
         * of the model.
         *
         * @returns {Boolean} true if the model passes all the filters.
         ******************************************************************************/
        $scope.filterAnalysis = function () {
            $scope.filteredAnalysis = 0;
            $scope.user_id = $scope.user_id || Cookies.get("loggedUserID");
            return function (item) {
                if ($scope.show !== "All analysis types" && item.analysis_type !== $scope.show) {
                    return false;
                }
                if (!$scope.showDeleted && item.remove_requests.indexOf($scope.user_id) !== -1) {
                    return false;
                }

                var filterAux, item_tags;
                for (var i in $scope.filters) {
                    filterAux = $scope.filters[i].toLowerCase();
                    item_tags = item.tags.join("");
                    if (!((item.analysis_name.toLowerCase().indexOf(filterAux)) !== -1 || (item.analysis_type.toLowerCase().indexOf(filterAux)) !== -1 || (item_tags.toLowerCase().indexOf(filterAux)) !== -1)) {
                        return false;
                    }
                }
                $scope.filteredAnalysis++;
                return true;
            };
        };

        /******************************************************************************      
         * This function returns a color for the given tag
         * 
         * @returns {String} color code
         ******************************************************************************/
        $scope.getTagColor = function (_tag) {
            var tag = AnalysisList.getTag(_tag);
            if (tag !== null) {
                return tag.color;
            }
            return "";
        };

        /******************************************************************************      
         * This function checks if the current user is a valid owner or member for the 
         * analysis
         * 
         * @returns {Boolean} true is the current user is a valid member
         ******************************************************************************/
        $scope.isMember = function (analysis) {
            $scope.user_id = $scope.user_id || Cookies.get("loggedUserID");
            return (AnalysisList.isOwner(analysis, $scope.user_id) || AnalysisList.isMember(analysis, $scope.user_id));
        };

        /******************************************************************************      
         * This function 
         *
         ******************************************************************************/
        this.filterByTag = function (tag) {
            if (tag !== "All") {
                var filters = arrayUnique($scope.filters.concat(tag));
                $scope.filters = AnalysisList.setFilters(filters).getFilters();
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
        $scope.$on(APP_EVENTS.experimentDeleted, function (event, args) {
            this.retrieveExperimentsData('', true);
        });

        /******************************************************************************      
         * This function handles the event fires when the filter chooser changes.
         *
         ******************************************************************************/
        this.showAnalysisChooserChangeHandler = function () {
            this.retrieveAnalysisData($scope.show);
        };

        /******************************************************************************      
         * This function applies the filters when the user clicks on "Search"
         *
         ******************************************************************************/
        this.applySearchHandler = function () {
            var filters = arrayUnique($scope.filters.concat($scope.searchFor.split(" ")));
            $scope.filters = AnalysisList.setFilters(filters).getFilters();
        };

        /******************************************************************************      
         * This function remove a given filter when the user clicks at the "x" button
         *
         * @param {String} filter the filter to be removed 
         ******************************************************************************/
        this.removeFilterHandler = function (filter) {
            $scope.filters = AnalysisList.removeFilter(filter).getFilters();
        };

        /******************************************************************************      
         * This function handles the event fires when the user clicks on the button 
         * "Show more" analysis in the list
         *
         ******************************************************************************/
        this.showMoreAnalysisHandler = function () {
            if (window.innerWidth > 1500) {
                $scope.visibleAnalysis += 10;
            } else if (window.innerWidth > 1200) {
                $scope.visibleAnalysis += 6;
            } else {
                $scope.visibleAnalysis += 4;
            }
            $scope.visibleAnalysis = Math.min($scope.filteredAnalysis, $scope.visibleAnalysis);
        };

        /******************************************************************************
         *      ___ _  _ ___ _____ ___   _   _    ___ ____  _ _____ ___ ___  _  _ 
         *     |_ _| \| |_ _|_   _|_ _| /_\ | |  |_ _|_  / /_\_   _|_ _/ _ \| \| |
         *      | || .` || |  | |  | | / _ \| |__ | | / / / _ \| |  | | (_) | .` |
         *     |___|_|\_|___| |_| |___/_/ \_\____|___/___/_/ \_\_| |___\___/|_|\_|
         *     
         ******************************************************************************/
        this.name = "AnalysisListController";
        var me = this;

        if (!Cookies.get("currentExperimentID")) {
            $dialogs.showInfoDialog("Please, choose first an study at the \"Browse studies\" section.");
            $state.go('experiments');
            return;
        }

        //This controller uses the AnalysisList, which defines a Singleton instance of
        //a list of analysis + list of tags + list of filters. Hence, the application will not
        //request the data everytime that the analysis list panel is displayed (data persistance).
        $scope.analysis = AnalysisList.getAnalysis();
        $scope.tags = AnalysisList.getTags();
        $scope.analysisTypes = AnalysisList.getAnalysisTypes();
        $scope.filters = AnalysisList.getFilters();
        $scope.filteredAnalysis = $scope.analysis.length;

        for (var i in $scope.analysis) {
            if ($scope.analysis[i].status === "pending") {
                $scope.review = true;
                break;
            }
        }

        //Display the analysis in batches
        if (window.innerWidth > 1500) {
            $scope.visibleAnalysis = 14;
        } else if (window.innerWidth > 1200) {
            $scope.visibleAnalysis = 10;
        } else {
            $scope.visibleAnalysis = 6;
        }

        $scope.visibleAnalysis = Math.min($scope.filteredAnalysis, $scope.visibleAnalysis);

        if ($scope.analysis.length === 0 || $stateParams.force) {
            this.retrieveAnalysisData("my_analysis", true);
        }
    });

    app.controller('AnalysisDetailController', function ($state, $rootScope, $scope, $http, $stateParams, $timeout, $uibModal, $dialogs, APP_EVENTS, AnalysisList, TemplateList) {
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
         * This function gets the details for a given Analysis
         * 
         * @param {String} analysis_id the id for the Analysis to be retieved
         * @param {Boolean} force true to force the request
         ******************************************************************************/
        this.retrieveAnalysisDetails = function (analysis_id, force) {
            $scope.setLoading(true);

            $scope.model = AnalysisList.findAnalysis(analysis_id);

            //TODO: EXTRA FIELDS
            // $scope.model.extra = {
            //   section_1: [ { "name": "title", "label": "Extra 2", "type": "text" } ]
            // };
            if ($scope.model === null || force === true || ($scope.model.non_processed_data === undefined && $scope.model.processed_data === undefined)) {
                $http($rootScope.getHttpRequestConfig("POST", "analysis-info", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams({analysis_id: analysis_id})
                })).then(
                        function successCallback(response) {
                            $scope.model = AnalysisList.addAnalysis(response.data);
                            AnalysisList.adaptInformation([$scope.model])[0];
                            $scope.diagram = me.generateWorkflowDiagram($scope.model, $scope.diagram);
                            $scope.setLoading(false);
                        },
                        function errorCallback(response) {
                            debugger;
                            var message = "Failed while retrieving the analysis's details.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at AnalysisDetailController:retrieveAnalysisDetails."
                            });
                            console.error(response.data);
                            $scope.setLoading(false);
                        }
                );
            } else {
                $scope.diagram = me.generateWorkflowDiagram($scope.model, $scope.diagram);
                $scope.setLoading(false);
            }
        };

        /******************************************************************************      
         * This function send the analysis information contain in a given analysis_view 
         * to the SERVER in order to save a NEW analysis in the database .
         * Briefly the way of work is :
         *	1.	Check if the formulary's content is valid. If not, throws an error that should 
         *		catched in the caller function.
         *
         *	2.	If all fields are correct, then the analysis model is converted from JSON to a 
         *		JSON format STRING and sent to the server using POST. After that the function finished.
         *	
         *	3.	After a while, the server returns a RESPONSE catched inside this function. 
         *		The response has 2 possible status: SUCCESS and FAILURE.
         *		a.	If SUCCESS, then the new analysis identifier is set in the analysis_view. 
         *			After that,  isthe callback function is called, in this case the 
         *       	callback function is the "execute_task" function that will execute the next
         *           task in the TASK QUEUE of the given AnalysisDetailsView panel. This function is called
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
        this.send_create_analysis = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "analysis-create", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'analysis_json_data': $scope.model}),
            })).then(
                    function successCallback(response) {
                        console.info((new Date()).toLocaleString() + "Analysis " + $scope.model.analysis_id + " successfully saved in server");
                        $scope.model.analysis_id = response.data.newID;
                        AnalysisList.addAnalysis($scope.model);
//                        //Notify all the other controllers that a new analysis exists
//                        $rootScope.$emit(APP_EVENTS.analysisCreated);
                        $scope.setLoading(false);

                        callback_caller[callback_function](true);
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while creating a new analysis.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at AnalysisDetailController:send_create_analysis."
                        });
                        console.error(response.data);

                        $scope.taskQueue.unshift({command: "create_new_analysis", object: null});
                        $scope.setLoading(false);
                        callback_caller[callback_function](false);
                    }
            );
        };

        /******************************************************************************      
         * This function send the BioReplicatess information of the given biorepicate_model 
         * to the SERVER in order to save a NEW BIOREPLICATE in the database associated to the 
         * analysis given by the Analysis_view.
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
         *           task in the TASK QUEUE of the given AnalysisVIEW panel. This function is called
         *           with the status flag sets to TRUE (~ success).
         *		b.	If FAILURE, then the callback function is called (the "execute_task" function again)
         *       	but this time with the status flag sets to FALSE (~ failure), in this case, 
         *           the current task is re-added to the TASK QUEUE and an error message is showed.
         *           The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
         *  
         *  
         * @param  analysisView the AnalysisDetailsView panel which fires the create action and contains the TASK QUEUE. Needed for the callback function.
         * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
         * @param  callback_function the function invoked by the callback_caller after the success/failure event
         * @return    
         ******************************************************************************/
        this.send_update_analysis = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "analysis-update", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'analysis_json_data': $scope.model}),
            })).then(
                    function successCallback(response) {
                        console.info((new Date()).toLocaleString() + "Analysis " + $scope.model.analysis_id + " successfully updated in server");
                        $scope.setLoading(false);
                        callback_caller[callback_function](true);
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while updating the analysis.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at AnalysisDetailController:send_update_analysis."
                        });
                        console.error(response.data);

                        $scope.taskQueue.unshift({command: "update_analysis", object: null});
                        $scope.setLoading(false);
                        callback_caller[callback_function](false);
                    }
            );
        };

        /******************************************************************************      
         * This function lock a analysis for editing.  
         * @param {String} newViewMode the new viewMode in case of success
         * @return this;  
         ******************************************************************************/
        this.send_lock_analysis = function (newViewMode) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "analysis-lock", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'analysis_id': $scope.model.analysis_id}),
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
                                logMessage: ((new Date()).toLocaleString() + "EDITION DENIED FOR Analysis " + $scope.model.analysis_id)
                            });
                            $scope.setLoading(false);
                        }
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while sending lock request.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at AnalysisDetailController:send_lock_analysis."
                        });
                        console.error(response.data);
                        $scope.setLoading(false);
                    }
            );
            return this;
        };

        /******************************************************************************      
         * This function lock a analysis for editing.  
         * @return this;  
         ******************************************************************************/
        this.send_unlock_analysis = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "analysis-unlock", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'analysis_id': $scope.model.analysis_id}),
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
                            logMessage: message + " at AnalysisDetailController:send_unlock_analysis."
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
                //The create_new_analysis task must be always in the first position (if we are creating a new analysis)
                if (tasks_queue[0].command === "create_new_analysis") {
                    //The analysis creation send all the information (analysis, bioreplicates, ... )to the server in only one step 
                    //So it's neccessary to remove all the tasks related with bioreplicates and analytical replicates insertion.
                    //After that only "create_new_analysis" and others tasks like "send_treatment_document" should be in the queue
                    var tasks_queue_temp = [tasks_queue[0]];
                    return tasks_queue_temp;
                } else {
                    var tasks_queue_temp = [];
                    tasks_queue_temp.push({command: "update_analysis", object: null});
                    tasks_queue_temp.push({command: "clear_locked_status", object: null});
                    return tasks_queue_temp;
                }
            } catch (error) {
                $dialogs.showErrorDialog('ERROR CLEANING TASK QUEUE: ' + error, {soft: false});
                return tasks_queue;
            }
        };

        /******************************************************************************
         * This function handles the tasks execution for a given analysisView and should be only called after 
         * analysis creation/edition.
         *
         * ACCEPT BUTTON should be only visible during new OBJECTS creation/edition (eg. during a analysis creation/edition) 
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
         * @param  status true if some error occurs during execution
         ******************************************************************************/
        this.execute_tasks = function (status) {
            var error_message = "";
            //GET THE NEXT TASK IN THE QUEUE
            var current_task = $scope.getTaskQueue().shift();
            //IF THERE IS A NEXT TASK AND NO PREVIOUS ERROR
            if (current_task != null && status) {
                try {
                    switch (current_task.command)
                    {
                        case "create_new_analysis":
                            console.info((new Date()).toLocaleString() + "SENDING SAVE NEW analysis REQUEST TO SERVER");
                            this.send_create_analysis(this, "execute_tasks");
                            console.info((new Date()).toLocaleString() + "SAVE NEW analysis REQUEST SENT TO SERVER");
                            break;
                        case "update_analysis":
                            console.info((new Date()).toLocaleString() + "SENDING UPDATE Analysis REQUEST TO SERVER");
                            this.send_update_analysis(this, "execute_tasks");
                            console.info((new Date()).toLocaleString() + "UPDATE Analysis REQUEST SENT TO SERVER");
                            break;
                        case "clear_locked_status":
                            //TODO:
                            console.info(new Date().toLocaleString() + "SENDING UNLOCK Analysis " + $scope.model.analysis_id + " REQUEST TO SERVER");
                            this.send_unlock_analysis(this, "execute_tasks");
                            console.info(new Date().toLocaleString() + "UNLOCK Analysis " + $scope.model.analysis_id + " REQUEST SENT TO SERVER");
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
                $dialogs.showSuccessDialog('Analysis ' + $scope.model.analysis_id + ' saved successfully');
            } else {
                status = false;
                $scope.taskQueue.unshift(current_task);
                $scope.setLoading(false);
            }
        };

        /******************************************************************************
         * This function creates a network from a given list of steps of a workflow.
         *
         * @param {Analysis} analysis the IU to for creating the diagram
         * @param {Object} diagram a previous instance of a diagram (update)
         * @return {Object} a network representation of the workflow (Object) with a list
         *         of nodes and a list of edges.
         ******************************************************************************/
        this.generateWorkflowDiagram = function (analysis, diagram) {
            var step = null, edge_id = "", edges = {}, nodes = {};

            analysis = analysis || $scope.analysis;

            try {
                var steps = analysis.non_processed_data.concat(analysis.processed_data); // Merges both arrays

                for (var i in steps) {
                    step = steps[i];
                    if (!step.status || step.status.indexOf('deleted') === -1) {
                        nodes[step.step_id] = {
                            id: step.step_id,
                            label: (step.step_number) + ". " + step.step_name,
                            x: step.x || 0,
                            y: step.y || 0,
                            step_type: step.type,
                            step_subtype: step.raw_data_type || step.intermediate_data_type,
                            size: 12
                        };
                    }
                }

                for (var i in steps) {
                    step = steps[i];
                    if (nodes[step.step_id]) {
                        for (var j in step.used_data) {
                            if (nodes[step.used_data[j]]) {
                                edge_id = step.step_id + "" + step.used_data[j];
                                edges[edge_id] = {
                                    id: edge_id,
                                    source: step.used_data[j],
                                    target: step.step_id,
                                    type: 'arrow',
                                };
                            }
                        }
                    }
                }
                for (var i in steps) {
                    step = steps[i];
                    if (nodes[step.step_id]) {
                        for (var j in step.reference_data) {
                            if (nodes[step.reference_data[j]]) {
                                edge_id = step.step_id + "" + step.reference_data[j];
                                edges[edge_id] = {
                                    id: edge_id,
                                    source: step.reference_data[j],
                                    target: step.step_id,
                                    type: 'dotted',
                                };
                            }
                        }
                    }
                }

                diagram = diagram || $scope.diagram;
                if (!diagram) {
                    diagram = {hasChanged: 0, "nodes": Object.values(nodes), "edges": Object.values(edges)};
                } else {
                    diagram.nodes = Object.values(nodes);
                    diagram.edges = Object.values(edges);
                    diagram.hasChanged++;
                }
            } catch (e) {
                debugger;
            }

            return diagram;
        };

        /******************************************************************************
         * This function opens a new tab with the details for the selected step
         *
         * @param {Step} stepModel the step to be displayed
         * @return {AnalysisDetailController} the controller
         ******************************************************************************/
        this.showStepDetails = function (stepModel) {
            $scope.displayedSteps = $scope.displayedSteps || [];
            for (var i = 0; i < $scope.displayedSteps.length; i++) {
                if ($scope.displayedSteps[i].step_id === stepModel.step_id) {
                    $scope.activeTab = (i + 2);
                    return;
                }
            }

            $scope.displayedSteps.push(stepModel);
            $timeout(function () {
                $scope.activeTab = ($scope.displayedSteps.length + 1);
            }, 300);
            return this;
        };

        /******************************************************************************
         * This function closes a tab with the details for the selected step
         *
         * @param {Step} stepModel the step to be hidden
         * @return {AnalysisDetailController} the controller
         ******************************************************************************/
        this.closeStepDetails = function (stepModel) {
            $scope.displayedSteps = $scope.displayedSteps || [];
            for (var i = 0; i < $scope.displayedSteps.length; i++) {
                if ($scope.displayedSteps[i].step_id === stepModel.step_id) {
                    $scope.displayedSteps.splice(i, 1);
                    if ($scope.activeTab === (i + 2)) {
                        $scope.activeTab = 1;
                    }
                    return;
                }
            }
            return this;
        };

        this.closeAllDetailsViews = function () {
            $scope.displayedSteps = [];
            return this;
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
                $scope.panel_title = "Analysis details.";
                $scope.clearCountdownDialogs();
                if (restore === true) {
                    me.retrieveAnalysisDetails($scope.model.analysis_id, true);
                }
            } else if (mode === 'creation') {
                $scope.panel_title = "Analysis creation.";
                $scope.addNewTask("create_new_analysis", null);
            } else if (mode === 'edition') {
                $scope.panel_title = "Analysis edition.";
                this.addNewTask("clear_locked_status", null);
            }
            $scope.viewMode = mode;//'view', 'creation', 'edition'

            return $scope.viewMode;
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
         * This function defines the behaviour for the "filterSteps" function.
         * Given a item (analysis) and a set of filters, the function evaluates if
         * the current item contains the set of filters within the different attributes
         * of the model.
         *
         * @returns {Boolean} true if the model passes all the filters.
         ******************************************************************************/
        $scope.filterSteps = function (type) {
            return function (item) {
                if ((type && item.type !== type) || ($scope.show.steps !== "all" && item.type !== $scope.show.steps)) {
                    return false;
                }
                return true;
            };
        };

        $scope.countStepsByClassification = function (classification) {
            var count = 0;
            for (var i in $scope.model.non_processed_data) {
                if ($scope.model.non_processed_data[i].type === classification) {
                    count++;
                }
            }
            for (var i in $scope.model.processed_data) {
                if ($scope.model.processed_data[i].type === classification) {
                    count++;
                }
            }
            return count;
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
         * This function handles the event fired when an step has changed.
         *
         * @return {AnalysisDetailController} the controller
         ******************************************************************************/
        $scope.$on(APP_EVENTS.stepChanged, function () {
            if (!$scope.isModal) {
                AnalysisList.updateStepIndexes($scope.model);
                $scope.diagram = me.generateWorkflowDiagram($scope.model, $scope.diagram);
            }
        });

        /******************************************************************************
         * This function handles the event fires when the "Add new step" button is pressed.
         * 
         * @return {AnalysisDetailController} the controller
         ******************************************************************************/
        this.addNewStepButtonHandler = function () {
            //SHOW DIALOG TO CHOOSE THE STEP TYPE (RAW/INTERMEDIATE/PROCESSED) AND THE SUBTYPE
            //  IF NEW SUBTYPE --> SHOW MESSAGE "Not found, Please choose a valid template for this type?"
            //    Chooser with available subtypes
            //    Checkbox "Save the new template in the system?"
            // CREATE --> set the type, subtype and the subtype_template
            //            add the new step to the analysis by given type.
            $scope.typesInfo = {};
            $scope.isModal = true;

            $scope.createStepDialog = $uibModal.open({
                templateUrl: 'app/analysis/new-step-dialog.tpl.html',
                size: 'md',
                controller: 'AnalysisDetailController',
                controllerAs: 'controller',
                scope: $scope
            });

            $scope.createStepDialog.result.then(
                    function (reason) { //Closed
                        //TODO: SET TEMPORAL IDS;
                        var step = {
                            step_name: "Unnamed step",
                            step_id: $scope.model.analysis_id + "." + $scope.model.nextStepID,
                            submission_date: new Date(),
                            last_edition_date: new Date(),
                            step_owners: [{user_id: Cookies.get("loggedUserID")}],
                            files_location: [],
                            status: "new"
                        };

                        if ($scope.typesInfo.step_type === "rawdata") {
                            step.type = "rawdata";
                            step.raw_data_type = $scope.typesInfo.step_subtype.replace(/ /g, "_");
                            step.step_name = "Unnamed " + step.raw_data_type + " step";
                            step.analyticalReplicate_id = null;
                            step.extractionMethod = {extraction_method_type: $scope.typesInfo.step_subtype.replace(/ /g, "_"), separationMethod: {}};

                            $scope.model.non_processed_data.push(step);
                            $scope.model.nextStepID++;
                        } else if ($scope.typesInfo.step_type === "intermediate_data") {
                            step.type = "intermediate_data";
                            step.intermediate_data_type = $scope.typesInfo.step_subtype.replace(/ /g, "_");
                            step.step_name = "Unnamed " + step.intermediate_data_type + " step";
                            step.used_data = [];
                            $scope.model.non_processed_data.push(step);
                            $scope.model.nextStepID++;
                        } else if ($scope.typesInfo.step_type === "external_source") {
                            step.type = "external_source";
                            $scope.model.non_processed_data.push(step);
                            $scope.model.nextStepID++;
                        } else if ($scope.typesInfo.step_type === "processed_data") {
                            step.type = "processed_data";
                            step.processed_data_type = $scope.typesInfo.step_subtype.replace(/ /g, "_");
                            step.step_name = "Unnamed " + step.processed_data_type + " step";
                            step.used_data = [];
                            step.reference_data = [];
                            $scope.model.processed_data.push(step);
                            $scope.model.nextStepID++;
                        }
                        delete $scope.typesInfo;
                        delete $scope.isModal;

                        $rootScope.$broadcast(APP_EVENTS.stepChanged);

                        me.showStepDetails(step);
                    },
                    function (result) { //Dismissed
                    });

            return this;
        };

        /******************************************************************************
         * This function handles the event fires when the user accepts the creation of 
         * a new step
         *
         ******************************************************************************/
        this.addNewStepAcceptButtonHandler = function () {
            $scope.createStepDialog.close("cancel");
            delete $scope.createStepDialog;
        };

        /******************************************************************************
         * This function handles the event fires when the new step type chooser changed.
         *
         ******************************************************************************/
        this.updateStepSubtypes = function () {
            if ($scope.typesInfo.step_type) {
                $http($rootScope.getHttpRequestConfig("GET", "analysis-step-subtypes", {
                    params: {'step_type': $scope.typesInfo.step_type}
                })).then(
                        function successCallback(response) {
                            $scope.typesInfo.step_subtypes = response.data.subtypes;
                        },
                        function errorCallback(response) {
                            var message = "Failed while retrieving the step subtypes.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at AnalysisDetailController:updateStepSubtypes."
                            });
                            console.error(response.data);
                            debugger
                        }
                );
            }
        };

        /******************************************************************************
         * This function handles the event fires when the user deletes an analysis
         *
         ******************************************************************************/
        this.deleteAnalysisHandler = function () {
            var me = this;
            var current_user_id = '' + Cookies.get('loggedUserID');

            if (AnalysisList.isOwner($scope.model, current_user_id) || current_user_id === "admin") {
                $scope.setLoading(true);
                $http($rootScope.getHttpRequestConfig("POST", "analysis-delete", {
                    headers: {'Content-Type': 'application/json; charset=utf-8'},
                    data: $rootScope.getCredentialsParams({'analysis_id': $scope.model.analysis_id, loggedUserID: current_user_id}),
                })).then(
                        function successCallback(response) {
                            $scope.setLoading(false);
                            if (response.data.removed) {
                                $dialogs.showSuccessDialog("The analysis was successfully deleted.");
                            } else {
                                $dialogs.showSuccessDialog("The analysis is now in deletion process and it will be completely deleted as soon as the other owners confirm this action.");
                            }
                            $rootScope.$emit(APP_EVENTS.analysisDeleted);
                            $state.go('analysis', {force: true});
                        },
                        function errorCallback(response) {
                            $scope.setLoading(false);
                            var message = "Failed while deleting the analysis.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at AnalysisDetailController:deleteAnalysisHandler."
                            });
                            console.error(response.data);
                            debugger
                        }
                );
            }
        };

        /******************************************************************************
         * This function send a Edition request to the server in order to block the Analysis
         * avoiding that other users edit it before the user saves the changes.
         * Each user has 30 minutes max. to edit a Analysis, after that the user will be 
         * ask again, if no answer is given, the Analysis is unblocked and changes will be  
         * lost.
         * This is neccessary because if the user leaves the application without save or close the panel,
         * the server MUST free the blocked object in order to let other users edit it.
         * After BLOCKET_TIME minutes, the server automatically frees the blocked object, so the user
         * will be asked 1 minute before the liberation takes place.
         * 
         * @returns {AnalysisDetailController} the controller;
         * @chainable
         ******************************************************************************/
        this.editButtonHandler = function () {
            //1. CHECK IF THE USER HAS EDITING PRIVILEGES OVER THE Analysis (ONLY OWNERS)
            //TODO: THIS CODE COULD BE BETTER IN THE SERVER (JAVASCRIPT IS VULNERABLE)
            var current_user_id = '' + Cookies.get('loggedUserID');
            if (!AnalysisList.isOwner($scope.model, current_user_id) && current_user_id !== "admin") {
                console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over the Analysis " + $scope.model.analysis_id);
                $dialogs.showErrorDialog("Your user is not allowed to edit this analysis");
                return;
            }

            //2. SEND LOCK REQUEST
            console.info((new Date()).toLocaleString() + "SENDING EDIT REQUEST FOR Analysis " + $scope.model.analysis_id + " TO SERVER");
            this.send_lock_analysis('edition');

            return this;
        };

        /******************************************************************************
         * This function handles the event accept_button_pressed fires in other Controller
         * (eg. ApplicationController)
         * when a button Accept is pressed.
         *  
         * @returns {AnalysisDetailController} the controller;
         * @chainable
         ******************************************************************************/
        this.acceptButtonHandler = function () {
            if (!$scope.analysisForm.$valid) {
                $dialogs.showErrorDialog("Invalid form, please check the form and fill the empty fields.")
                return false;
            }

            this.closeAllDetailsViews();
            $scope.setTaskQueue(this.clean_task_queue($scope.getTaskQueue()));
            this.execute_tasks(true);
            return this;
        };

        /******************************************************************************
         * This function handles the cancel_button_pressed thown by the Application Controller
         * when the Cancel button located in MainView is pressed and the inner panel is an
         * AnalysisDetailsView panel.
         * Asks the user if close without save changes. If user selects "Yes", the panel is closed.
         * if the panel was in a "Editing mode" (if the panel has a timer id), then sends a signal to the server in order to unblock
         * the Analysis in the list of blocked elements.
         ******************************************************************************/
        this.cancelButtonHandler = function () {
            //TODO: REMOVE COUNTERS AND UNLOCK EXPERIMENT
            $scope.clearTaskQueue();
            AnalysisList.setNewAnalysis(null);

            if ($scope.viewMode === 'view') {
                $state.go('analysis');
            } else if ($scope.viewMode === 'edition') {
                this.closeAllDetailsViews();
                this.send_unlock_analysis();
            } else {
                $state.go('analysis');
            }
        };

        this.updateMainDiagramHandler = function () {
            if ($scope.diagram) {
                setTimeout(function () {
                    $scope.diagram.hasChanged--;
                    $scope.$digest();
                }, 500);
            }
        };


        /******************************************************************************
         *      ___ _  _ ___ _____ ___   _   _    ___ ____  _ _____ ___ ___  _  _ 
         *     |_ _| \| |_ _|_   _|_ _| /_\ | |  |_ _|_  / /_\_   _|_ _/ _ \| \| |
         *      | || .` || |  | |  | | / _ \| |__ | | / / / _ \| |  | | (_) | .` |
         *     |___|_|\_|___| |_| |___/_/ \_\____|___/___/_/ \_\_| |___\___/|_|\_|
         *     
         ******************************************************************************/
        this.name = "AnalysisDetailController";
        var me = this;

        if (!Cookies.get("currentExperimentID")) {
            $dialogs.showInfoDialog("Please, choose first an study at the \"Browse studies\" section.");
            $state.go('experiments');
            return;
        }

        if (!$scope.isModal) {
            //The corresponding view will be watching to this variable
            //and update its content after the http response
            $scope.loadingComplete = false;
            $scope.model = {};

            $scope.setViewMode($stateParams.viewMode || 'view');
            $scope.getFormTemplate('analysis-form');

            if ($stateParams.analysis_id !== null) {
                AnalysisList.setNewAnalysis(null);
                this.retrieveAnalysisDetails($stateParams.analysis_id);
            } else if ($stateParams.analysis_id === null && $scope.viewMode === "view") {
                $state.go('analysis');
            } else {
                $scope.model.analysis_id = "ANxxxx";
                $scope.model.analysis_name = "Unnamed analysis";
                $scope.model.submission_date = new Date();
                $scope.model.last_edition_date = new Date();
                $scope.model.analysis_owners = [{user_id: Cookies.get("loggedUserID")}];
                $scope.model.tags = [];
                $scope.model.non_processed_data = [];
                $scope.model.processed_data = [];
                $scope.model.nextStepID = 1;
                AnalysisList.setNewAnalysis($scope.model);
            }
        }
    });

    app.controller('StepDetailController', function ($state, $rootScope, $scope, $http, $uibModal, $dialogs, APP_EVENTS, AnalysisList, SampleList, TemplateList) {
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
         * This function indicates if the current model can be removed
         * 
         * @returns {Boolean} true if the model can be removed
         ******************************************************************************/
        this.removableModel = function () {
            return $scope.viewMode !== 'view' && ($scope.model.status === undefined || $scope.model.status.indexOf('deleted') === -1);
        };

        /******************************************************************************
         * This function indicates if the current model can not be removed
         * 
         * @returns {Boolean} true if the model can not be removed
         ******************************************************************************/
        this.unremovableModel = function () {
            return $scope.viewMode !== 'view' && //if mode is edition or creation
                    ($scope.model.status !== undefined && $scope.model.status.indexOf('deleted') !== -1); //if this IU is deleted
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
         * This function opens a new tab with the details for the current step
         *
         ******************************************************************************/
        this.showStepDetailsHandler = function () {
            var controller = $scope.getParentController("AnalysisDetailController");
            if (controller !== null) {
                controller.showStepDetails($scope.model);
            }
        };

        /******************************************************************************
         * This function opens a new dialog for selecting the input steps for current
         * model
         * 
         * @returns {StepDetailController} the controller
         * @chainable
         ******************************************************************************/
        this.changeInputFilesHandler = function (propertyName) {
            //TODO: REMOVE THE DIALOG AFTER CHOOSING (NOT DIMISS)
            $scope.isDialog = true;
            $scope.propertyName = propertyName || "used_data";

            $scope.browseDialog = $uibModal.open({
                templateUrl: 'app/analysis/analysis-step-selector.tpl.html',
                size: 'lg',
                controller: 'StepDetailController',
                controllerAs: 'controller',
                scope: $scope
            });

            return this;
        };

        /******************************************************************************
         * This function adds a new input step for current model
         * 
         * @param {String} added_step_id the identifier for the new input step
         * @param {Boolean} doDigest force the digest that updates the model
         * @returns {Boolean} true if step is added successfully.
         ******************************************************************************/
        this.addSelectedInputFileHandler = function (added_step_id, doDigest) {
            var propertyName = $scope.propertyName || 'used_data';

            var pos = $scope.model[propertyName].indexOf(added_step_id);
            var isLoop = AnalysisList.checkLoop(added_step_id, $scope.model.step_id, propertyName);
            if (!isLoop && pos === -1) {
                $scope.model[propertyName].push(added_step_id);
                if (doDigest === true) {
                    $scope.$digest();
                }
            } else {
                console.log("Loop detected, ignoring...");
            }
            return true;
        };

        /******************************************************************************
         * This function handles the event fired when an input file for a step is
         * removed from the list.
         * 
         * @param {String} removed_step_id the identifier for the input step
         * @param {Boolean} doDigest force the digest that updates the model
         * @returns {Boolean} true if step is removed successfully.
         ******************************************************************************/
        this.removeSelectedInputFileHandler = function (removed_step_id, doDigest) {
            var propertyName = $scope.propertyName || 'used_data';

            var pos = $scope.model[propertyName].indexOf(removed_step_id);
            if (pos !== -1) {
                $scope.model[propertyName].splice(pos, 1);
                if (doDigest === true) {
                    $scope.$digest();
                }
            }
            return true;
        };

        /******************************************************************************
         * This function handles the event fired when an step is removed.
         ******************************************************************************/
        this.removeStepHandler = function () {
            //TODO: CHECK IF CONTAINS NOT REMOVABLE AS
            AnalysisList.updateModelStatus($scope.model, "deleted");
            $rootScope.$broadcast(APP_EVENTS.stepChanged);
        };

        /******************************************************************************
         * This function handles the event fired when an action (e.g. remove an step)
         * is undone.
         ******************************************************************************/
        this.unremoveStepHandler = function () {
            AnalysisList.updateModelStatus($scope.model, "undo");
            $rootScope.$broadcast(APP_EVENTS.stepChanged);
        };


        /******************************************************************************
         * This function handles the event fired when the use choose the option "Send files
         * to an external tool" in a Step panel. It shows a new dialog for destination and 
         * files selection.
         * 
         ******************************************************************************/
        this.sendStepToGalaxyHandler = function () {
            $scope.files_selection = {
                source_id: '',
                selection: 'all',
                files: []
            };

            $scope.modalInstance = $uibModal.open({
                templateUrl: 'app/analysis/send-step-dialog.tpl.html',
                scope: $scope,
                backdrop: 'static',
                size: 'lg'
            });

        };
        /******************************************************************************
         * This function handles the event fired when the user changes the selection of
         * files to be sent to an external tool.
         * 
         * @param file the file (un)selected
         ******************************************************************************/
        this.changeFileSelection = function (file) {
            var pos = $scope.files_selection.files.indexOf(file);
            if (pos !== -1) {
                $scope.files_selection.files.splice(pos, 1);
            } else {
                $scope.files_selection.files.push(file);
            }
        };
        /******************************************************************************
         * This auxiliar function removes all the sources that are not valid for 
         * sending files.
         * 
         * @param item the external_source to be evaluated
         ******************************************************************************/
        $scope.filterValidTools = function (item) {
            return item.type === 'galaxy_server' || item.type === 'other';
        };
        /******************************************************************************
         * This function handles the event fired when the user closes the dialog for 
         * sending files.
         * 
         * @param option whether the selected option is "send" or "close"
         ******************************************************************************/
        this.closeSendStepDialogHandler = function (option) {
            if (option === 'send') {
                $scope.setLoading(true);
                if ($scope.files_selection.selection === "all") {
                    $scope.files_selection.files = $scope.model.files_location;
                }
                if ($scope.files_selection.username !== undefined && $scope.files_selection.username !== "") {
                    $scope.files_selection.username = btoa($scope.files_selection.username + ":" + $scope.files_selection.pass);
                }
                if ($scope.remember) {

                }

                $http($rootScope.getHttpRequestConfig("POST", "file-rest", {
                    headers: {'Content-Type': 'application/json; charset=utf-8'},
                    data: {
                        source_id: $scope.files_selection.source_id,
                        credentials: $scope.files_selection.username,
                        apikey: $scope.files_selection.apikey,
                        files: $scope.files_selection.files
                    },
                    extra: "send"
                })).then(
                        function successCallback(response) {
                            $scope.setLoading(false);
                            if (response.data.errors === "") {
                                $dialogs.showSuccessDialog("The selected files were successfully sent.");

                                $scope.modalInstance.close();
                                delete $scope.modalInstance;
                                delete $scope.files_selection;
                            } else {
                                $dialogs.showWarningDialog("Some errors were found while sending the selected files: " + response.data.errors);
                            }
                        },
                        function errorCallback(response) {
                            $scope.setLoading(false);
                            var message = "Failed while sending the files.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at AnalysisDetailController:closeSendStepDialogHandler."
                            });
                            console.error(response.data);
                            debugger
                        }
                );
            } else {
                $scope.modalInstance.close();
                delete $scope.modalInstance;
                delete $scope.files_selection;
            }
        };

        /******************************************************************************
         * This function handles the event fired when the use choose the option "Download 
         * files" in a Step panel. 
         * 
         * @param step the current step whose file will be downloaded
         ******************************************************************************/
        this.downloadStepFilesHandler = function (step) {
            alert("Not implemented!!");
        };

        /******************************************************************************
         * This function handles the event fired when the use choose the option "Export
         * step" in a Step panel. 
         * 
         * @param step the step to be exported
         * @param format the format to be exported
         ******************************************************************************/
        this.exportStepHandler = function (step, format) {
            alert("Not implemented!!");
        };

        /******************************************************************************
         * This event watch to the corresponding step model waiting for changes.
         * When detected, first we check if there is a real change in the data. 
         * If so, then we update the status for the model and notify other controllers
         * that the step has changed (for example to redraw the diagram).
         *          
         * @param {Object} newValues an object representing the new values for the model
         * @param {Object} oldValues an object representing the old values for the model
         * @returns {Boolean} true if the mode has changed
         * @chainable
         ******************************************************************************/
        $scope.$watch('model', function (newValues, oldValues) {
            var hasChanged = AnalysisList.hasChangedStep(newValues, oldValues);
            if (hasChanged) {
                AnalysisList.updateModelStatus($scope.model, "edited");
                $rootScope.$broadcast(APP_EVENTS.stepChanged);
                return true;
            }
            return false;
        }, true);

        /******************************************************************************
         *      ___ _  _ ___ _____ ___   _   _    ___ ____  _ _____ ___ ___  _  _ 
         *     |_ _| \| |_ _|_   _|_ _| /_\ | |  |_ _|_  / /_\_   _|_ _/ _ \| \| |
         *      | || .` || |  | |  | | / _ \| |__ | | / / / _ \| |  | | (_) | .` |
         *     |___|_|\_|___| |_| |___/_/ \_\____|___/___/_/ \_\_| |___\___/|_|\_|
         *     
         ******************************************************************************/
        this.name = "StepDetailController";
        var me = this;

        //Set the view mode to "view" if the user is not an owner of the current model
        var current_user_id = '' + Cookies.get('loggedUserID');
        if (!AnalysisList.isStepOwner($scope.model, current_user_id) && current_user_id !== "admin") {
            $scope.viewMode = 'view';
        }

        //Load the new template
        $scope.getFormTemplate($scope.model.type + "-form");
        if ($scope.summary !== true) {
            var secondTemplate = "";
            if ($scope.model && $scope.model.type === "rawdata") {
                secondTemplate = $scope.model.type + "/" + $scope.model.raw_data_type + "-form";
            } else if ($scope.model && $scope.model.type === "intermediate_data") {
                secondTemplate = $scope.model.type + "/" + $scope.model.intermediate_data_type + "-form";
                secondTemplate = secondTemplate.split("/");
                secondTemplate = secondTemplate[0] + "/" + secondTemplate[1][0].toUpperCase() + secondTemplate[1].substr(1);
                secondTemplate = secondTemplate.replace("_step", "");
            } else if ($scope.model && $scope.model.type === "processed_data") {
                secondTemplate = $scope.model.type + "/" + $scope.model.processed_data_type + "-form";
                secondTemplate = secondTemplate.split("/");
                secondTemplate = secondTemplate[0] + "/" + secondTemplate[1][0].toUpperCase() + secondTemplate[1].substr(1)
                secondTemplate = secondTemplate.replace("_step", "");
            }
            $scope.getFormTemplate(secondTemplate, "subtemplate");
        }
    });
})();