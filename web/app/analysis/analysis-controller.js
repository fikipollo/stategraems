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
 */
(function () {
    var app = angular.module('analysis.controllers', [
        'common.dialogs',
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

    /***************************************************************************/
    /*CONTROLLERS **************************************************************/
    /***************************************************************************/
    app.controller('AnalysisListController', function ($state, $rootScope, $scope, $http, $dialogs, INFO_EVENTS, AnalysisList) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------
        /**
         * This function retrieves all the analysis registered in the system
         * @param {type} group, limit the search to "user's" analysis (not used)
         * @param {type} force
         * @returns this
         */
        this.retrieveAnalysisData = function (group, force) {
            $scope.isLoading = true;
            if (!Cookies.get("currentExperimentID")) {
                $dialogs.showInfoDialog("Please, choose first an experiment at the \"Browse experiments\" section.");
                $state.go('experiments');
                return;
            }

            if (AnalysisList.getOld() > 1 || force) { //Max age for data 5min.
                $http($rootScope.getHttpRequestConfig("POST", "analysis-list", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams()
                })).then(
                        function successCallback(response) {
                            $scope.isLoading = false;
                            $scope.analysis = AnalysisList.setAnalysis(response.data).getAnalysis();
                            $scope.tags = AnalysisList.updateTags().getTags();
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
                        },
                        function errorCallback(response) {
                            $scope.isLoading = false;

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
                $scope.isLoading = false;
            }

            return this;
        };

        /**
         * This function defines the behaviour for the "filterAnalysis" function.
         * Given a item (analysis) and a set of filters, the function evaluates if
         * the current item contains the set of filters within the different attributes
         * of the model.
         *
         * @returns {Boolean} true if the model passes all the filters.
         */
        $scope.filterAnalysis = function () {
            $scope.filteredAnalysis = 0;
            $scope.user_id = $scope.user_id || Cookies.get("loggedUserID");
            return function (item) {
                if ($scope.show !== "All analysis types") {
                    if (item.analysis_type !== $scope.show) {
                        return false;
                    }
                }

                var filterAux, item_tags;
                for (var i in $scope.filters) {
                    filterAux = $scope.filters[i].toLowerCase();
                    item_tags = item.tags.join("");
                    if (!((item.title.toLowerCase().indexOf(filterAux)) !== -1 || (item.analysis_description.toLowerCase().indexOf(filterAux)) !== -1 || (item_tags.toLowerCase().indexOf(filterAux)) !== -1)) {
                        return false;
                    }
                }
                $scope.filteredAnalysis++;
                return true;
            };
        };

        $scope.getTagColor = function (_tag) {
            var tag = AnalysisList.getTag(_tag);
            if (tag !== null) {
                return tag.color;
            }
            return "";
        }

        $scope.isMember = function (analysis) {
            $scope.user_id = $scope.user_id || Cookies.get("loggedUserID");
            return (AnalysisList.isOwner(analysis, $scope.user_id) || AnalysisList.isMember(analysis, $scope.user_id));
        }



        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------
        $scope.$on(INFO_EVENTS.analysisDeleted, function (event, args) {
            debugger;
            this.retrieveAnalysisData('', true);
        });

        this.showAnalysisChooserChangeHandler = function () {
            this.retrieveAnalysisData($scope.show);
        };


        /**BC****************************************************************************      
         * This function try to change the current selected analysis to a given one (if
         * user is member or owner).
         *
         * @param analysis_id the Analysis id
         * @return      
         **EC****************************************************************************/
        this.changeCurrentAnalysisHandler = function (analysis_id) {
            $http($rootScope.getHttpRequestConfig("POST", "analysis-selection", {
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                data: $rootScope.getCredentialsParams({'analysis_id': analysis_id}),
            })).then(
                    function successCallback(response) {
                        if (response.data.valid_analysis) {
                            console.info((new Date()).toLocaleString() + "CHANGED TO EXPERIMENT " + analysis_id + " SUCCESSFULLY");
                            Cookies.set('currentAnalysisID', analysis_id, null, location.pathname);
                            $dialogs.showSuccessDialog("Now you are working with Analysis.");
                        } else {
                            showErrorMessage("You are not member of the selected analysis. Please, contact administrator or analysis owners to become a member.");
                        }
                    },
                    function errorCallback(response) {
                        var message = "Failed while changing the current analysis.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at AnalysisListController:changeCurrentAnalysisHandler."
                        });
                        console.error(response.data);
                        debugger
                    }
            );
        };

        /**
         * This function applies the filters when the user clicks on "Search"
         */
        this.applySearchHandler = function () {
            var filters = arrayUnique($scope.filters.concat($scope.searchFor.split(" ")));
            $scope.filters = AnalysisList.setFilters(filters).getFilters();
        };

        this.filterByTag = function (tag) {
            if (tag !== "All") {
                var filters = arrayUnique($scope.filters.concat(tag));
                $scope.filters = AnalysisList.setFilters(filters).getFilters();
            }
        };

        /**
         * This function remove a given filter when the user clicks at the "x" button
         */
        this.removeFilterHandler = function (filter) {
            $scope.filters = AnalysisList.removeFilter(filter).getFilters();
        };

        this.showMoreAnalysisHandler = function () {
            if (window.innerWidth > 1500) {
                $scope.visibleAnalysis += 10;
            } else if (window.innerWidth > 1200) {
                $scope.visibleAnalysis += 6;
            } else {
                $scope.visibleAnalysis += 4;
            }
            $scope.visibleAnalysis = Math.min($scope.filteredAnalysis, $scope.visibleAnalysis);
        }

        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        this.name = "AnalysisListController";
        var me = this;

        //This controller uses the AnalysisList, which defines a Singleton instance of
        //a list of analysis + list of tags + list of filters. Hence, the application will not
        //request the data everytime that the analysis list panel is displayed (data persistance).
        $scope.analysis = AnalysisList.getAnalysis();
        $scope.tags = AnalysisList.getTags();
        $scope.analysisTypes = AnalysisList.getAnalysisTypes();
        $scope.filters = AnalysisList.getFilters();
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


        if ($scope.analysis.length === 0) {
            this.retrieveAnalysisData("my_analysis");
        }
    });

    app.controller('AnalysisDetailController', function ($state, $rootScope, $scope, $http, $stateParams, $timeout, $dialogs, INFO_EVENTS, AnalysisList, TemplateList) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------

        /**
         * This function gets the details for a given Analysis
         * @param analysis_id the id for the Analysis to be retieved
         */
        this.retrieveAnalysisDetails = function (analysis_id, force) {
            $scope.setLoading(true);

            $scope.model = AnalysisList.findAnalysis(analysis_id);

            //TODO: EXTRA FIELDS
//            $scope.model.extra = {
//                section_1: [
//                    {
//                        "name": "title",
//                        "label": "Extra 2",
//                        "type": "text"
//                    }
//                ]
//            };
            if ($scope.model === null || force === true || ($scope.model.non_processed_data === undefined && $scope.model.processed_data === undefined)) {
                $http($rootScope.getHttpRequestConfig("POST", "analysis-info", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams({analysis_id: analysis_id})
                })).then(
                        function successCallback(response) {
                            $scope.model = AnalysisList.addAnalysis(response.data);
                            AnalysisList.adaptInformation([$scope.model])[0];
                            $scope.diagram = me.generateWorkflowDiagram($scope.model);
//                            me.updateWorkflowDiagram();
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
            }
            $scope.setLoading(false);
        };

        /**
         * This function creates a network from a given list of steps of a workflow.
         *
         * @param workflow_steps a list of workflow steps
         * @return a network representation of the workflow (Object) with a list
         *         of nodes and a list of edges.
         */
        this.generateWorkflowDiagram = function (analysis) {
            var step = null, edge_id = "", edges = {}, diagram = {"nodes": [], "edges": []};

            try {
                var steps = analysis.non_processed_data.concat(analysis.processed_data); // Merges both arrays

                for (var i in steps) {
                    step = steps[i];

                    diagram.nodes.push({
                        id: step.step_id,
                        label: (step.step_number + 1) + ". " + step.step_name,
                        x: step.x || 0,
                        y: step.y || 0,
                        step_type: step.type,
                        step_subtype: step.raw_data_type || step.intermediate_data_type
                    });

                    for (var j in step.used_data) {
                        edge_id = step.step_id + "" + step.used_data[j];
                        if (!edges[edge_id] && step.used_data[j] !== undefined && step.step_id !== undefined) {
                            edges[edge_id] = true;
                            diagram.edges.push({
                                id: edge_id,
                                source: step.used_data[j],
                                target: step.step_id,
                                type: 'arrow'
                            });
                        }
                    }
                }
            } catch (e) {
                debugger;
            }

            return diagram;
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
//                        $rootScope.$broadcast(INFO_EVENTS.analysisCreated);
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
                                $scope.memento = AnalysisList.getMemento($scope.model);
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

        /**
         * 
         * @param {type} tasks_queue
         * @returns {Array}
         */
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
                }
                var tasks_queue_temp = [];
                tasks_queue_temp.push({command: "update_analysis", object: null});
                tasks_queue_temp.push({command: "clear_locked_status", object: null});
                return tasks_queue_temp;
            } catch (error) {
                $dialogs.showErrorDialog('ERROR CLEANING TASK QUEUE: ' + error, {soft: false});
                return tasks_queue;
            }
        };

        /**********************************************************************************************
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
                $scope.setViewMode("view");
                this.retrieveAnalysisDetails($scope.model.analysis_id, true);
                $dialogs.showSuccessDialog('Analysis ' + $scope.model.analysis_id + ' saved successfully');
            } else {
                status = false;
                $scope.taskQueue.unshift(current_task);
                $scope.setLoading(false);
            }
        };

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
            return;
        };

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
            return;
        };

        $scope.setViewMode = function (mode, restore) {
            if (mode === 'view') {
                $scope.panel_title = "Analysis details.";
                $scope.clearCountdownDialogs();
                if (restore === true) {
                    AnalysisList.restoreFromMemento($scope.model, $scope.memento);
                    $scope.memento = null;
                }
            } else if (mode === 'creation') {
                $scope.panel_title = "Analysis creation.";
                $scope.addNewTask("create_new_analysis", null);
            } else if (mode === 'edition') {
                $scope.panel_title = "Analysis edition.";
                this.addNewTask("clear_locked_status", null);
            }
            $scope.viewMode = mode;//'view', 'creation', 'edition'
        };

        $scope.initializeCountdownDialogs = function () {
            //TODO
            console.error("initializeCountdownDialogs NOT IMPLEMENTED");
        };

        $scope.clearCountdownDialogs = function () {
            //TODO
            console.error("cleanCountdownDialogs NOT IMPLEMENTED");
        };

        $scope.setLoading = function (loading) {
            //TODO
            console.error("setLoading NOT IMPLEMENTED");
        };

        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------
        this.deleteAnalysisHandler = function () {
            var me = this;
            var current_user_id = '' + Cookies.get('loggedUserID');

            if (AnalysisList.isOwner($scope.model, current_user_id) || current_user_id === "admin") {
                //ONLY OWNERS CAN REMOVE THE EXPERIMENT, OTHERWISE THE USER WILL BE REMOVED FROM MEMBERS LIST
                var message = "";
                if ($scope.model.analysis_owners.length > 1 && current_user_id !== "admin") {
                    //Remove the user from the owners list
                    message = 'Delete this analysis from your collection?<br>You will be removed from the owners list but the analysis will not deleted before all the administrators remove the analysis.';
                } else {
                    //No more owners --> remove the entire analysis
                    message = 'Delete this analysis from the system?<br>This action will remove all the data for the analysis from database, including all associated analysis.<br>This action cannot be undone.';
                }

                $dialogs.showConfirmationDialog(message, {
                    title: "Please confirm this action.",
                    callback: function (result) {
                        if (result === 'ok') {
                            $http($rootScope.getHttpRequestConfig("POST", "analysis-delete", {
                                headers: {'Content-Type': 'application/json; charset=utf-8'},
                                data: $rootScope.getCredentialsParams({'analysis_id': $scope.model.analysis_id, loggedUserID: current_user_id}),
                            })).then(
                                    function successCallback(response) {
                                        $dialogs.showSuccessDialog("The analysis was successfully deleted.");
                                        //Notify all the other controllers that user has signed in
                                        $rootScope.$broadcast(INFO_EVENTS.analysisDeleted);
                                        me.send_unlock_analysis();
                                        $state.go('analysis');
                                    },
                                    function errorCallback(response) {
                                        var message = "Failed while deleting the analysis.";
                                        $dialogs.showErrorDialog(message, {
                                            logMessage: message + " at AnalysisDetailController:deleteAnalysisHandler."
                                        });
                                        console.error(response.data);
                                        debugger
                                    }
                            );
                        }
                    }
                });
            }
        };


        /**
         * This function handles the event accept_button_pressed fires in other Controller (eg. ApplicationController)
         * when a button Accept is pressed.
         *  
         * @returns this
         */
        this.acceptButtonHandler = function () {
            $scope.setLoading(true);
            $scope.setTaskQueue(this.clean_task_queue($scope.getTaskQueue()));
            this.execute_tasks(true);
            return this;
        };

        /**
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
         * @returns this;
         */
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

        /**
         * This function handles the cancel_button_pressed thown by the Application Controller
         * when the Cancel button located in MainView is pressed and the inner panel is an
         * AnalysisDetailsView panel.
         * Asks the user if close without save changes. If user selects "Yes", the panel is closed.
         * if the panel was in a "Editing mode" (if the panel has a timer id), then sends a signal to the server in order to unblock
         * the Analysis in the list of blocked elements.
         * 
         * @param {type} analysisView
         * @param {type} force
         * @returns {undefined}
         */
        this.cancelButtonHandler = function () {
            $scope.clearTaskQueue();

            if ($scope.viewMode === 'view') {
                $state.go('analysis');
            } else if ($scope.viewMode === 'edition') {
                this.send_unlock_analysis();
            } else {
                $state.go('analysis');
            }
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
        this.name = "AnalysisDetailController";
        var me = this;

        //The corresponding view will be watching to this variable
        //and update its content after the http response
        $scope.loadingComplete = false;
        $scope.model = {};
        $scope.setViewMode($stateParams.viewMode || 'view');
        $scope.getFormTemplate('analysis-form');

        if ($stateParams.analysis_id !== null) {
            this.retrieveAnalysisDetails($stateParams.analysis_id);
        } else {
            $scope.model.analysis_id = "[Autogenerated after saving]";
            $scope.model.submission_date = new Date();
            $scope.model.last_edition_date = new Date();
            $scope.model.analysis_owners = [{user_id: Cookies.get("loggedUserID")}];
            $scope.model.analysis_members = [];
            $scope.model.tags = [];
        }

    });


    app.controller('StepDetailController', function ($state, $rootScope, $scope, $http, $uibModal, AnalysisList, SampleList, TemplateList) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------

        this.removableModel = function () {
            return $scope.viewMode !== 'view' && ($scope.model.status === undefined || $scope.model.status.indexOf('deleted') === -1);
        };

        this.unremovableModel = function () {
            return $scope.viewMode !== 'view' && //if mode is edition or creation
                    ($scope.model.status !== undefined && $scope.model.status.indexOf('deleted') !== -1); //if this IU is deleted
        };


        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------
        this.showStepDetailsHandler = function () {
            var controller = $scope.getParentController("AnalysisDetailController");
            if (controller !== null) {
                controller.showStepDetails($scope.model);
            }
        };

        this.changeInputFilesHandler = function () {
            $scope.isDialog = true;

            $scope.browseDialog = $uibModal.open({
                templateUrl: 'app/analysis/analysis-step-selector.tpl.html',
                controller: 'StepDetailController',
                controllerAs: 'controller',
                scope: $scope
            });

            return this;
        };

        this.addSelectedInputFile = function (step_id) {
            var pos = $scope.model.used_data.indexOf(step_id);
            if (pos === -1) {
                $scope.model.used_data.push(step_id);
            }
            return this;
        };

        this.removeSelectedInputFile = function (step_id) {
            var pos = $scope.model.used_data.indexOf(step_id);
            if (pos !== -1) {
                $scope.model.used_data.splice(pos, 1);
            }
            return this;
        };
        this.removeStepHandler = function () {
            //TODO: CHECK IF CONTAINS NOT REMOVABLE AS
            AnalysisList.updateModelStatus($scope.model, "deleted");
        };

        this.unremoveStepHandler = function () {
            AnalysisList.updateModelStatus($scope.model, "undo");
        };

        $scope.$watch('model', function (newValues, oldValues, scope) {
            var hasChanged = (oldValues.bioreplicate_name !== newValues.bioreplicate_name) || (oldValues.batch_id !== newValues.batch_id);
            if (hasChanged) {
                SampleList.updateModelStatus($scope.model, "edited");
                return;
            }
            //TODO: CHANGES IN BATCH
            //TODO: EXTRA FIELDS

        }, true);

        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        this.name = "StepDetailController";
        var me = this;
        var current_user_id = '' + Cookies.get('loggedUserID');
        if (!AnalysisList.isStepOwner($scope.model, current_user_id) && current_user_id !== "admin") {
            $scope.viewMode = 'view';
        }

        $scope.getFormTemplate($scope.model.type + "-form");
        if ($scope.summary !== true) {
            var secondTemplate = "";
            if ($scope.model && $scope.model.type === "rawdata") {
                secondTemplate = $scope.model.type + "/" + $scope.model.raw_data_type + "-form";
            } else if ($scope.model && $scope.model.type === "intermediate_data") {
                secondTemplate = $scope.model.type + "/" + $scope.model.intermediate_data_type + "-form";
            } else if ($scope.model && $scope.model.type === "processed_data") {
                secondTemplate = $scope.model.type + "/" + $scope.model.processed_data_type + "-form";
            }
            $scope.getFormTemplate(secondTemplate, "subtemplate");
        }

        if ($scope.model && !$scope.model.step_id) {
            $scope.model.step_id = "[Autogenerated after saving]";
        }
    });
})();