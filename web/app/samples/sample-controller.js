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
 * - SampleListController
 * - BioconditionDetailController
 * - BioreplicateDetailController
 * - AnalyticalReplicateDetailController
 * - ExternalSampleController
 */
(function () {
    var app = angular.module('samples.controllers', [
        'ang-dialogs',
        'angular.backtop',
        'samples.services.sample-list',
        'samples.directives.sample-views',
        'templates.directives.template',
        'protocols.services.protocol-list',
        'ui.bootstrap'
    ]);

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
    app.controller('SampleListController', function ($state, $rootScope, $scope, $http, $stateParams, $uibModal, $dialogs, APP_EVENTS, SampleList) {

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
         * This function retrieves all the samples registered in the system
         * @param {String} group limit the search to "user's" samples (not used)
         * @param {boolean} force true if the request must be executed
         * @param {boolean} recursive true if the request should be recursive (get samples, aliquots, etc.)
         * @returns this
         ******************************************************************************/
        this.retrieveSamplesData = function (group, force, recursive) {
            $scope.setLoading(true);

            if (SampleList.getOld() > 1 || force) { //Max age for data 5min.
                $http($rootScope.getHttpRequestConfig("POST", "sample-list", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams({recursive: (recursive !== undefined)})
                })).then(
                        function successCallback(response) {
                            $scope.samples = SampleList.setSamples(response.data).getSamples();
                            $scope.tags = SampleList.updateTags().getTags();
                            $scope.filteredSamples = $scope.samples.length;

                            //Display the samples in batches
                            if (window.innerWidth > 1500) {
                                $scope.visibleSamples = 14;
                            } else if (window.innerWidth > 1200) {
                                $scope.visibleSamples = 10;
                            } else {
                                $scope.visibleSamples = 6;
                            }

                            $scope.visibleSamples = Math.min($scope.filteredSamples, $scope.visibleSamples);
                            $scope.setLoading(false);
                        },
                        function errorCallback(response) {
                            $scope.setLoading(false);

                            debugger;
                            var message = "Failed while retrieving the samples list.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at SampleListController:retrieveSamplesData."
                            });
                            console.error(response.data);
                        }
                );
            } else {
                $scope.samples = SampleList.getSamples();
                $scope.tags = SampleList.getTags();
                $scope.filteredSamples = $scope.samples.length;
                $scope.setLoading(false);
            }

            return this;
        };

        /******************************************************************************      
         * This function defines the behaviour for the "filterSamples" function.
         * Given a item (sample) and a set of filters, the function evaluates if
         * the current item contains the set of filters within the different attributes
         * of the model.
         *
         * @returns {Boolean} true if the model passes all the filters.
         ******************************************************************************/
        $scope.filterSamples = function () {
            $scope.filteredSamples = 0;
            $scope.user_id = $scope.user_id || Cookies.get("loggedUserID");
            return function (item) {
                if ($scope.show === "my_samples") {
                    if (!SampleList.isOwner(item, $scope.user_id)) {
                        return false;
                    }
                }
                //
                var filterAux, item_tags;
                for (var i in $scope.filters) {
                    filterAux = $scope.filters[i].toLowerCase();
                    item_tags = item.tags.join("");
                    if (!((item.title.toLowerCase().indexOf(filterAux)) !== -1 || (item.sample_description.toLowerCase().indexOf(filterAux)) !== -1 || (item_tags.toLowerCase().indexOf(filterAux)) !== -1)) {
                        return false;
                    }
                }
                $scope.filteredSamples++;
                return true;
            };
        };

        /**
         * This function returns a color code for a given tag
         * 
         * @param {String} _tag
         * @returns {String} the color code
         */
        $scope.getTagColor = function (_tag) {
            var tag = SampleList.getTag(_tag);
            if (tag !== null) {
                return tag.color;
            }
            return "";
        };

        /**
         * This function checks if the current user is member or owner for the given sample.
         * @param {Biocondition} sample
         * @returns {Boolean} true if the user is owner
         */
        $scope.isMember = function (sample) {
            $scope.user_id = $scope.user_id || Cookies.get("loggedUserID");
            return SampleList.isOwner(sample, $scope.user_id);
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
        $scope.$on(APP_EVENTS.sampleDeleted, function () {
            debugger;
            this.retrieveSamplesData('', true);
        });
        $scope.$on(APP_EVENTS.sampleCreated, function () {
            debugger;
            this.retrieveSamplesData('', true);
        });
        /******************************************************************************
         * This function...
         *
         ******************************************************************************/
        this.showSampleChooserChangeHandler = function () {
            this.retrieveSamplesData($scope.show);
        };

        /******************************************************************************
         * This function applies the filters when the user clicks on "Search"
         *
         ******************************************************************************/
        this.applySearchHandler = function () {
            var filters = arrayUnique($scope.filters.concat($scope.searchFor.split(" ")));
            $scope.filters = SampleList.setFilters(filters).getFilters();
        };

        /******************************************************************************
         * This function...
         *
         ******************************************************************************/
        this.filterByTag = function (tag) {
            if (tag !== "All") {
                var filters = arrayUnique($scope.filters.concat(tag));
                $scope.filters = SampleList.setFilters(filters).getFilters();
            }
        };

        /******************************************************************************
         * This function remove a given filter when the user clicks at the "x" button
         *
         ******************************************************************************/
        this.removeFilterHandler = function (filter) {
            $scope.filters = SampleList.removeFilter(filter).getFilters();
        };

        /******************************************************************************
         * This function...
         *
         ******************************************************************************/
        this.showMoreSamplesHandler = function () {
            if (window.innerWidth > 1500) {
                $scope.visibleSamples += 10;
            } else if (window.innerWidth > 1200) {
                $scope.visibleSamples += 6;
            } else {
                $scope.visibleSamples += 4;
            }
            $scope.visibleSamples = Math.min($scope.filteredSamples, $scope.visibleSamples);
        }

        /******************************************************************************
         *      ___ _  _ ___ _____ ___   _   _    ___ ____  _ _____ ___ ___  _  _ 
         *     |_ _| \| |_ _|_   _|_ _| /_\ | |  |_ _|_  / /_\_   _|_ _/ _ \| \| |
         *      | || .` || |  | |  | | / _ \| |__ | | / / / _ \| |  | | (_) | .` |
         *     |___|_|\_|___| |_| |___/_/ \_\____|___/___/_/ \_\_| |___\___/|_|\_|
         *     
         ******************************************************************************/
        this.name = "SampleListController";
        var me = this;

        if (!Cookies.get("currentExperimentID")) {
            $dialogs.showInfoDialog("Please, choose first an study at the \"Browse studies\" section.");
            $state.go('experiments');
            return;
        }

        //This controller uses the SampleList, which defines a Singleton instance of
        //a list of samples + list of tags + list of filters. Hence, the application will not
        //request the data everytime that the sample list panel is displayed (data persistance).
        $scope.samples = SampleList.getSamples();
        $scope.tags = SampleList.getTags();
        $scope.filters = SampleList.getFilters();
        $scope.filteredSamples = $scope.samples.length;

        //Display the samples in batches
        if (window.innerWidth > 1500) {
            $scope.visibleSamples = 14;
        } else if (window.innerWidth > 1200) {
            $scope.visibleSamples = 10;
        } else {
            $scope.visibleSamples = 6;
        }

        $scope.visibleSamples = Math.min($scope.filteredSamples, $scope.visibleSamples);


        if ($scope.samples.length === 0 || $stateParams.force || $scope.force) {
            this.retrieveSamplesData("my_samples", true, $scope.recursive);
        }
    });

    app.controller('BioconditionDetailController', function ($state, $rootScope, $scope, $http, $stateParams, $timeout, $uibModal, $dialogs, APP_EVENTS, SampleList, TemplateList) {

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
         * This function gets the details for a given Sample
         * 
         * @param biocondition_id the id for the Sample to be retieved
         * @param force true if the request must be executed
         ******************************************************************************/
        this.retrieveSampleDetails = function (biocondition_id, force) {
            $scope.setLoading(true);

            $scope.model = SampleList.getBiocondition(biocondition_id);

            if ($scope.model === null || $scope.model.bioreplicates === undefined || force === true) {
                $http($rootScope.getHttpRequestConfig("POST", "sample-info", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams({biocondition_id: biocondition_id, recursive: true})
                })).then(
                        function successCallback(response) {
                            $scope.model = SampleList.addBiocondition(response.data);
                            SampleList.adaptInformation([$scope.model])[0];

                            if ($scope.bioreplicate_id) {
                                $scope.bioreplicate = SampleList.getBioreplicate($scope.model, $scope.bioreplicate_id);
                                if ($scope.analytical_rep_id) {
                                    $scope.analytical_rep = SampleList.getAnalyticalReplicate($scope.bioreplicate, $scope.analytical_rep_id);
                                }
                            }
                            $scope.setLoading(false);
                        },
                        function errorCallback(response) {
                            debugger;
                            var message = "Failed while retrieving the sample's details.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at BioconditionDetailController:retrieveSampleDetails."
                            });
                            console.error(response.data);
                            $scope.setLoading(false);
                        }
                );
            }
        };

        /******************************************************************************      
         * This function send the sample information contain in a given sample_view 
         * to the SERVER in order to save a NEW sample in the database .
         * Briefly the way of work is :
         *	1.	Check if the formulary's content is valid. If not, throws an error that should 
         *		catched in the caller function.
         *
         *	2.	If all fields are correct, then the sample model is converted from JSON to a 
         *		JSON format STRING and sent to the server using POST. After that the function finished.
         *	
         *	3.	After a while, the server returns a RESPONSE catched inside this function. 
         *		The response has 2 possible status: SUCCESS and FAILURE.
         *		a.	If SUCCESS, then the new sample identifier is set in the sample_view. 
         *			After that,  isthe callback function is called, in this case the 
         *       	callback function is the "execute_task" function that will execute the next
         *           task in the TASK QUEUE of the given SampleDetailsView panel. This function is called
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
        this.send_create_sample = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "sample-create", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'biocondition_json_data': $scope.model})
            })).then(
                    function successCallback(response) {
                        console.info((new Date()).toLocaleString() + "Sample " + $scope.model.biocondition_id + " successfully saved in server");
                        $scope.model.biocondition_id = response.data.newID;

                        SampleList.addBiocondition($scope.model);

                        //Notify all the other controllers that a new sample exists
                        $rootScope.$broadcast(APP_EVENTS.sampleCreated);
                        $scope.setLoading(false);

                        callback_caller[callback_function](true);
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while creating a new sample.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at BioconditionDetailController:send_create_sample."
                        });
                        console.error(response.data);

                        $scope.taskQueue.unshift({command: "create_new_sample", object: null});
                        $scope.setLoading(false);
                        callback_caller[callback_function](false);
                    }
            );
        };

        /******************************************************************************      
         * This function send the BioReplicatess information of the given biorepicate_model 
         * to the SERVER in order to save a NEW BIOREPLICATE in the database associated to the 
         * sample given by the Sample_view.
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
         *           task in the TASK QUEUE of the given SampleVIEW panel. This function is called
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
        this.send_update_sample = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "sample-update", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'biocondition_json_data': $scope.model})
            })).then(
                    function successCallback(response) {
                        console.info((new Date()).toLocaleString() + "Sample " + $scope.model.biocondition_id + " successfully updated in server");
                        $rootScope.$broadcast(APP_EVENTS.sampleCreated);

                        $scope.setLoading(false);
                        callback_caller[callback_function](true);
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while updating the sample.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at BioconditionDetailController:send_update_sample."
                        });
                        console.error(response.data);

                        $scope.taskQueue.unshift({command: "update_sample", object: null});
                        $scope.setLoading(false);
                        callback_caller[callback_function](false);
                    }
            );
        };

        /******************************************************************************      
         * This function lock a sample for editing.  
         * @param {String} newViewMode the new viewMode in case of success
         * @return this;  
         ******************************************************************************/
        this.send_lock_sample = function (newViewMode) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "sample-lock", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'biocondition_id': $scope.model.biocondition_id})
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
                                logMessage: ((new Date()).toLocaleString() + "EDITION DENIED FOR Sample " + $scope.model.biocondition_id)
                            });
                            $scope.setLoading(false);
                        }
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while sending lock request.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at BioconditionDetailController:send_lock_sample."
                        });
                        console.error(response.data);
                        $scope.setLoading(false);
                    }
            );
            return this;
        };

        /******************************************************************************      
         * This function lock a sample for editing.  
         * 
         * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
         * @param  callback_function the function invoked by the callback_caller after the success/failure event
         * @return this;  
         ******************************************************************************/
        this.send_unlock_sample = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "sample-unlock", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'biocondition_id': $scope.model.biocondition_id})
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
                            logMessage: message + " at BioconditionDetailController:send_unlock_sample."
                        });
                        console.error(response.data);
                        callback_caller[callback_function](false);
                        $scope.setLoading(false);
                    }
            );
            return this;
        };

        /******************************************************************************      
         * This function receives a list of tasks to be executed and adapts the content 
         * accordingly. 
         * 
         * @param {Array} tasks_queue
         * @returns {Array} new tasks_queue
         ******************************************************************************/
        this.clean_task_queue = function (tasks_queue) {
            console.info((new Date()).toLocaleString() + "CLEANING TASK QUEUE");
            try {
                if (tasks_queue.length === 0) {
                    return tasks_queue;
                }
                var tasks_queue_temp;

                //IF THE QUEUE INCLUDES A CREATION TASK
                //The create_new_sample task must be always in the first position (if we are creating a new sample)
                if (tasks_queue[0].command === "create_new_sample") {
                    //The sample creation send all the information (sample, bioreplicates, ... )to the server in only one step 
                    //So it's neccessary to remove all the tasks related with bioreplicates and analytical replicates insertion.
                    //After that only "create_new_sample" and others tasks like "send_treatment_document" should be in the queue
                    tasks_queue_temp = [tasks_queue[0]];
                    //TODO: SEND SOP DOCUMENT
                    //for (var i = tasks_queue.length - 1; i > 0; i--) {
                    //    if ("send_treatment_document" === tasks_queue[i].command) {
                    //        tasks_queue_temp.push(tasks_queue[i]);
                    //        break;
                    //    }
                    //}
                } else {
                    tasks_queue_temp = [];
                    tasks_queue_temp.push({command: "update_sample", object: null});
                    //TODO: SEND DOCUMENT
                    tasks_queue_temp.push({command: "clear_locked_status", object: null});
                }

                return tasks_queue_temp;
            } catch (error) {
                $dialogs.showErrorDialog('ERROR CLEANING TASK QUEUE: ' + error, {soft: false});
                return tasks_queue;
            }
        };

        /******************************************************************************
         * This function handles the tasks execution for a given sampleView and should be only called after 
         * sample creation/edition.
         *
         * ACCEPT BUTTON should be only visible during new OBJECTS creation/edition (eg. during a sample creation/edition) 
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
                        case "create_new_sample":
                            console.info((new Date()).toLocaleString() + "SENDING SAVE NEW sample REQUEST TO SERVER");
                            this.send_create_sample(this, "execute_tasks");
                            console.info((new Date()).toLocaleString() + "SAVE NEW sample REQUEST SENT TO SERVER");
                            break;
                        case "update_sample":
                            console.info((new Date()).toLocaleString() + "SENDING UPDATE Sample REQUEST TO SERVER");
                            this.send_update_sample(this, "execute_tasks");
                            console.info((new Date()).toLocaleString() + "UPDATE Sample REQUEST SENT TO SERVER");
                            break;
                        case "clear_locked_status":
                            //TODO:
                            console.info(new Date().toLocaleString() + "SENDING UNLOCK Sample " + $scope.model.biocondition_id + " REQUEST TO SERVER");
                            this.send_unlock_sample(this, "execute_tasks");
                            console.info(new Date().toLocaleString() + "UNLOCK Sample " + $scope.model.biocondition_id + " REQUEST SENT TO SERVER");
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
                $scope.setLoading(false);
            }
            //IF NO MORE TASKS AND EVERYTHING GOES WELL
            else if (status) {
                //TODO: $scope.cleanCountdownDialogs();
                $scope.setViewMode("view", true);
                $scope.setLoading(false);
                $dialogs.showSuccessDialog('Sample ' + $scope.model.biocondition_id + ' saved successfully');
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
                $scope.panel_title = "Sample details.";
                $scope.clearCountdownDialogs();
                if (restore === true) {
                    me.retrieveSampleDetails($scope.model.biocondition_id, true);
                }
            } else if (mode === 'creation') {
                $scope.panel_title = "Sample creation.";
                $scope.addNewTask("create_new_sample", null);
            } else if (mode === 'edition') {
                $scope.panel_title = "Sample edition.";
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
         * This function handles the event fires when the user deletes a biocondition
         *
         ******************************************************************************/
        this.deleteBiologicalConditionHandler = function () {
            var me = this;
            $scope.setLoading(true);

            var current_user_id = '' + Cookies.get('loggedUserID');
            if (SampleList.isOwner($scope.model, current_user_id) || current_user_id === "admin") {
                $http($rootScope.getHttpRequestConfig("POST", "sample-delete", {
                    headers: {'Content-Type': 'application/json; charset=utf-8'},
                    data: $rootScope.getCredentialsParams({'biocondition_id': $scope.model.biocondition_id, loggedUserID: current_user_id}),
                })).then(
                        function successCallback(response) {
                            $scope.setLoading(false);
                            //Notify all the other controllers that samples has been deleted
                            $rootScope.$broadcast(APP_EVENTS.sampleDeleted);
                            $dialogs.showSuccessDialog("All the samples were successfully deleted.");
                            $state.go('samples', {force: true});
                        },
                        function errorCallback(response) {
                            $scope.setLoading(false);
                            var message = "Failed while deleting the samples.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at SampleDetailController:deleteBiologicalConditionHandler."
                            });
                            console.error(response.data);
                            debugger
                        }
                );
            }
        };

        /******************************************************************************
         * This function handles the event when the "Add new sample" is pressed
         ******************************************************************************/
        this.addNewBioreplicateButtonHandler = function () {
            $scope.model.associatedBioreplicates.push({
                bioreplicate_name: "",
                associatedAnalyticalReplicates: [],
                status: "new"
            });
        };

        /******************************************************************************
         * This function handles the event when the "Add new sample" is pressed
         ******************************************************************************/
        this.showSelectedSampleDetailsButtonHandler = function () {
            $scope.isDialog = true;

            $scope.browseDialog = $uibModal.open({
                templateUrl: ($scope.model.isExternal ? 'app/samples/external-sample-form.tpl.html' : 'app/samples/biocondition-form.tpl.html'),
                controller: ($scope.model.isExternal ? 'ExternalSampleDetailController' : 'BioconditionDetailController'),
                controllerAs: 'controller',
                size: "lg",
                scope: $scope
            });

            return this;
        };

        /******************************************************************************
         * This function handles the event when clicking on the "Choose sample" button
         * in a "Sample selector" field.
         * @returns this;
         ******************************************************************************/
        this.changeSelectedSampleButtonHandler = function () {
            $scope.isDialog = true;
            $scope.force = true;
            $scope.recursive = true;

            $scope.changeSelectedSample = function (sample_id) {
                if (sample_id.indexOf("BC") !== -1 && sample_id !== $scope.biocondition_id) {
                    $scope.biocondition_id = sample_id;
                    $scope.model = SampleList.getBiocondition($scope.biocondition_id);
                    delete $scope.bioreplicate_id;
                    delete $scope.bioreplicate;
                    delete $scope.analytical_rep_id;
                    delete $scope.analytical_rep;
                } else if (sample_id.indexOf("BR") !== -1 && sample_id !== $scope.biocondition_id) {
                    $scope.bioreplicate_id = sample_id;
                    $scope.bioreplicate = SampleList.getBioreplicate($scope.model, $scope.bioreplicate_id);
                    delete $scope.analytical_rep_id;
                    delete $scope.analytical_rep;
                } else if (sample_id.indexOf("AR") !== -1 && sample_id !== $scope.analytical_rep_id) {
                    $scope.analytical_rep_id = sample_id;
                    $scope.analytical_rep = SampleList.getAnalyticalReplicate($scope.bioreplicate, $scope.analytical_rep_id);
                }

                if ($scope.bioreplicate_id) {
                    $scope.browseDialog.current = 3;
                } else if ($scope.biocondition_id) {
                    $scope.browseDialog.current = 2;
                } else {
                    $scope.browseDialog.current = 1;
                }
            };

            $scope.closeSelectionDialog = function () {
                delete $scope.changeSelectedSample;
                delete $scope.closeSelectionDialog;

                if ($scope.other_model) {
                    if ($scope.analytical_rep_id) {
                        $scope.other_model.analyticalReplicate_id = $scope.analytical_rep_id;
                    } else if ($scope.bioreplicate_id) {
                        $scope.other_model.analyticalReplicate_id = $scope.bioreplicate_id;
                    } else {
                        $scope.other_model.analyticalReplicate_id = $scope.biocondition_id;
                    }
                }

                $scope.browseDialog.dismiss("cancel");
                delete $scope.browseDialog;
            };

            $scope.browseDialog = $uibModal.open({
                templateUrl: 'app/samples/sample-chooser-dialog.tpl.html',
                controller: 'SampleListController',
                controllerAs: 'controller',
                size: "lg",
                scope: $scope
            });

            if ($scope.bioreplicate_id) {
                $scope.browseDialog.current = 3;
            } else if ($scope.biocondition_id) {
                $scope.browseDialog.current = 2;
            } else {
                $scope.browseDialog.current = 1;
            }

            return this;
        };

        /******************************************************************************
         * This function handles the event accept_button_pressed fires in other Controller 
         * (eg. ApplicationController) when a button Accept is pressed.
         *  
         * @returns the controller;
         * @chainable
         ******************************************************************************/
        this.acceptButtonHandler = function () {
            if (!$scope.bioconditionForm.$valid) {
                $dialogs.showErrorDialog("Invalid form, please check the form and fill the empty fields.");
                return false;
            }

            $scope.setLoading(true);
            $scope.setTaskQueue(this.clean_task_queue($scope.getTaskQueue()));
            this.execute_tasks(true);
            return this;
        };

        /******************************************************************************
         * This function send a Edition request to the server in order to block the Sample
         * avoiding that other users edit it before the user saves the changes.
         * Each user has 30 minutes max. to edit a Sample, after that the user will be 
         * ask again, if no answer is given, the Sample is unblocked and changes will be  
         * lost.
         * This is neccessary because if the user leaves the application without save or close the panel,
         * the server MUST free the blocked object in order to let other users edit it.
         * After BLOCKET_TIME minutes, the server automatically frees the blocked object, so the user
         * will be asked 1 minute before the liberation takes place.
         * 
         * @returns the controller;
         ******************************************************************************/
        this.editButtonHandler = function () {
            //1. CHECK IF THE USER HAS EDITING PRIVILEGES OVER THE Sample (ONLY OWNERS)
            var current_user_id = '' + Cookies.get('loggedUserID');
            if (!SampleList.isOwner($scope.model, current_user_id) && current_user_id !== "admin") {
                console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over the Sample " + $scope.model.biocondition_id);
                $dialogs.showErrorDialog("Your user is not allowed to edit this sample");
                return;
            }

            //2. SEND LOCK REQUEST
            console.info((new Date()).toLocaleString() + "SENDING EDIT REQUEST FOR Sample " + $scope.model.biocondition_id + " TO SERVER");
            this.send_lock_sample('edition');

            return this;
        };

        /******************************************************************************
         * This function handles the cancel_button_pressed thown by the Application Controller
         * when the Cancel button located in MainView is pressed and the inner panel is an
         * SampleDetailsView panel.
         * Asks the user if close without save changes. If user selects "Yes", the panel is closed.
         * if the panel was in a "Editing mode" (if the panel has a timer id), then sends a signal 
         * to the server in order to unlock the Sample in the list of locked elements.
         ******************************************************************************/
        this.cancelButtonHandler = function () {
            //TODO: REMOVE COUNTERS AND UNLOCK EXPERIMENT
            $scope.clearTaskQueue();

            if ($scope.viewMode === 'view') {
                $state.go('samples');
            } else if ($scope.viewMode === 'edition') {
                this.send_unlock_sample();
            } else {
                $state.go('samples');
            }
        };

        /******************************************************************************
         *      ___ _  _ ___ _____ ___   _   _    ___ ____  _ _____ ___ ___  _  _ 
         *     |_ _| \| |_ _|_   _|_ _| /_\ | |  |_ _|_  / /_\_   _|_ _/ _ \| \| |
         *      | || .` || |  | |  | | / _ \| |__ | | / / / _ \| |  | | (_) | .` |
         *     |___|_|\_|___| |_| |___/_/ \_\____|___/___/_/ \_\_| |___\___/|_|\_|
         *     
         ******************************************************************************/
        this.name = "BioconditionDetailController";
        var me = this;

        if (!Cookies.get("currentExperimentID")) {
            $dialogs.showInfoDialog("Please, choose first an study at the \"Browse studies\" section.");
            $state.go('experiments');
            return;
        }

        //The corresponding view will be watching to this variable
        //and update its content after the http response
        $scope.loadingComplete = false;

        //If it is a sample-chooser field
        if ($scope.model && !$scope.model.biocondition_id) {
            $scope.other_model = $scope.model;
            if ($scope.model.analyticalReplicate_id) {
                $scope.biocondition_id = SampleList.getBioconditionID($scope.model.analyticalReplicate_id);
                if ($scope.biocondition_id !== $scope.model.analyticalReplicate_id) { //we provided a BR or an AR
                    $scope.bioreplicate_id = SampleList.getBioreplicateID($scope.model.analyticalReplicate_id);
                    if ($scope.bioreplicate_id !== $scope.model.analyticalReplicate_id) { //we provided an AR
                        $scope.analytical_rep_id = $scope.model.analyticalReplicate_id;
                    }
                }
            }
        } else {
            $scope.setViewMode($stateParams.viewMode || 'view');
            $scope.getFormTemplate('biocondition-form');
        }

        $scope.model = {};

        if ($stateParams.biocondition_id || $scope.biocondition_id) {
            this.retrieveSampleDetails($stateParams.biocondition_id || $scope.biocondition_id, true);
        } else if ($stateParams.biocondition_id === null && $scope.viewMode === "view") {
            $state.go('samples');
        }else {
            $scope.model.biocondition_id = "[Autogenerated after saving]";
            $scope.model.bioreplicates = [];
            $scope.model.tags = [];
            $scope.model.owners = [{user_id: Cookies.get("loggedUserID")}];
            $scope.model.submission_date = new Date();
            $scope.model.last_edition_date = new Date();
            $scope.model.associatedBioreplicates = [];
            $scope.model.files_location = [];
        }
    });

    app.controller('BioreplicateDetailController', function ($state, $rootScope, $scope, $http, $uibModal, SampleList, ProtocolList, APP_EVENTS, TemplateList) {
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

        $scope.getProtocolName = function (protocol_id, ntries) {
            ntries = (ntries || 0) + 1;
            var protocol = ProtocolList.getProtocol(protocol_id);
            if (protocol === null && ntries < 4) {
                console.log("Protocol information not ready, waiting 3 seconds...");
                setTimeout(function () {
                    $scope.getProtocolName(protocol_id, ntries);
                }, 3000);
            } else {
                $scope.protocol_name = (protocol !== null ? protocol.protocol_name : "Unknown");
                return $scope.protocol_name;
            }

        };
        $scope.getTotalExtractionProcotols = function () {
            return Object.keys($scope.model.extractionProtocols || {}).length;
        };
        this.removableModel = function () {
            return $scope.viewMode !== 'view' && ($scope.model.status === undefined || $scope.model.status.indexOf('deleted') === -1);
        };

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

        $scope.$watch('model', function (newValues, oldValues, scope) {
            var hasChanged = (oldValues.bioreplicate_name !== newValues.bioreplicate_name) || (oldValues.batch_id !== newValues.batch_id);
            if (hasChanged) {
                SampleList.updateModelStatus($scope.model, "edited");
                return;
            }
            //TODO: CHANGES IN BATCH
            //TODO: EXTRA FIELDS

        }, true);

        /**
         * This function handles the event when the "Add new aliquout" is pressed
         */
        this.addNewAnalyticalReplicateButtonHandler = function () {
            $scope.isDialog = true;
            $scope.force = true;

            $scope.browseDialog = $uibModal.open({
                templateUrl: 'app/protocols/protocol-chooser-dialog.tpl.html',
                controller: 'ProtocolListController',
                controllerAs: 'controller',
                size: "lg",
                scope: $scope
            });

            $scope.changeSelectedProtocol = function (protocol_id) {
                $scope.protocol_id = protocol_id;
            };

            $scope.closeSelectionDialog = function () {
                delete $scope.changeSelectedProtocol;
                delete $scope.closeSelectionDialog;

                $scope.browseDialog.dismiss("cancel");
                delete $scope.browseDialog;
                me.addAnalyticalReplicateToProtocolButtonHandler($scope.protocol_id);
            };
            return this;
        };

        /**
         * This function handles the event when the "Add new aliquout" is pressed
         * with a given protocol_id
         */
        this.addAnalyticalReplicateToProtocolButtonHandler = function (protocol_id) {
            $scope.model.associatedAnalyticalReplicates.push({
                analytical_rep_name: "",
                protocol_id: protocol_id,
                status: "new"
            });
            SampleList.adaptBioreplicatesInformation([$scope.model]);
        };

        this.removeBioreplicateHandler = function () {
            //TODO: CHECK IF CONTAINS NOT REMOVABLE AS
            SampleList.updateModelStatus($scope.model, "deleted");
            for (var i in $scope.model.associatedAnalyticalReplicates) {
                SampleList.updateModelStatus($scope.model.associatedAnalyticalReplicates[i], "deleted");
            }
        };

        this.unremoveBioreplicateHandler = function () {
            SampleList.updateModelStatus($scope.model, "undo");
            for (var i in $scope.model.associatedAnalyticalReplicates) {
                SampleList.updateModelStatus($scope.model.associatedAnalyticalReplicates[i], "undo");
            }
        };

        /******************************************************************************
         *      ___ _  _ ___ _____ ___   _   _    ___ ____  _ _____ ___ ___  _  _ 
         *     |_ _| \| |_ _|_   _|_ _| /_\ | |  |_ _|_  / /_\_   _|_ _/ _ \| \| |
         *      | || .` || |  | |  | | / _ \| |__ | | / / / _ \| |  | | (_) | .` |
         *     |___|_|\_|___| |_| |___/_/ \_\____|___/___/_/ \_\_| |___\___/|_|\_|
         *     
         ******************************************************************************/
        var me = this;

        //The corresponding view will be watching to this variable
        //and update its content after the http response
        $scope.getFormTemplate('bioreplicate-form');

        if ($scope.model && !$scope.model.bioreplicate_id) {
            $scope.model.bioreplicate_id = "[Autogenerated after saving]";
        }
    });


    app.controller('AnalyticalReplicateDetailController', function ($state, $rootScope, $scope, $http, SampleList, ProtocolList, TemplateList) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------
        this.removableModel = function () {
            return $scope.viewMode !== 'view' && ($scope.model.status === undefined || $scope.model.status.indexOf('deleted') === -1);
        };

        this.unremovableModel = function () {
            return $scope.viewMode !== 'view' && //if mode is edition or creation
                    ($scope.$parent.$parent.model.status === undefined || $scope.$parent.$parent.model.status.indexOf("deleted") === -1) && //if parent IU is not deleted
                    ($scope.model.status !== undefined && $scope.model.status.indexOf('deleted') !== -1); //if this IU is deleted
        };

        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------

        this.removeAnalyticalReplicateHandler = function () {
            //CHECK IF REMOVABLE
            SampleList.updateModelStatus($scope.model, "deleted");
        };

        this.unremoveAnalyticalReplicateHandler = function () {
            SampleList.updateModelStatus($scope.model, "undo");
        };

        $scope.$watch('model', function (newValues, oldValues, scope) {
            var hasChanged = (oldValues.analytical_rep_name !== newValues.analytical_rep_name) || (oldValues.protocol_id !== newValues.protocol_id);
            if (hasChanged) {
                SampleList.updateModelStatus($scope.model, "edited");
                return;
            }
            //TODO: EXTRA FIELDS
        }, true);

        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        var me = this;

        //The corresponding view will be watching to this variable
        //and update its content after the http response
        if ($scope.model && !$scope.model.analytical_rep_id) {
            $scope.model.analytical_rep_id = "[Autogenerated after saving]";
        }
    });


    app.controller('ExternalSampleDetailController', function ($state, $rootScope, $scope, $http, $stateParams, $timeout, $dialogs, APP_EVENTS, SampleList, TemplateList) {
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
         * This function gets the details for a given Sample
         * 
         * @param biocondition_id the id for the Sample to be retieved
         ******************************************************************************/
        this.retrieveSampleDetails = function (biocondition_id, force) {
            $scope.setLoading(true);

            $scope.model = SampleList.getBiocondition(biocondition_id);

            if ($scope.model === null || force === true) {
                $http($rootScope.getHttpRequestConfig("POST", "sample-info", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams({biocondition_id: biocondition_id, recursive: true})
                })).then(
                        function successCallback(response) {
                            $scope.model = SampleList.addBiocondition(response.data);
                            SampleList.adaptInformation([$scope.model])[0];
                            if ($scope.model.other_exp_cond !== undefined && $scope.model.protocol_description !== undefined) {
                                $scope.link_input_type = 'auto';
                                me.generateExternalLinks();
                                me.retrieveSampleServicesList();
                            }
                            $scope.setLoading(false);
                        },
                        function errorCallback(response) {
                            debugger;
                            var message = "Failed while retrieving the sample's details.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at ExternalSampleDetailController:retrieveSampleDetails."
                            });
                            console.error(response.data);
                            $scope.setLoading(false);
                        }
                );
            }
            $scope.setLoading(false);
        };

        /******************************************************************************
         * This function gets the list of available hosts that contains services for storing
         * information for samples (e.g. LIMS)
         * 
         ******************************************************************************/
        this.getOrganimsList = function () {
            $http({
                method: 'GET',
                url: 'data/organisms.json',
            }).success(function (options) {
                $scope.organisms_options = options["organism"];
            });
        };

        /******************************************************************************
         * This function gets the list of available hosts that contains services for storing
         * information for samples (e.g. LIMS)
         * 
         ******************************************************************************/
        this.retrieveSampleServicesHostList = function () {
            $http($rootScope.getHttpRequestConfig("GET", "sample-service-host-list", {
            })).then(
                    function successCallback(response) {
                        $scope.samplesInfo.hosts = response.data.hosts;
                    },
                    function errorCallback(response) {
                        var message = "Failed while retrieving the list of available hosts.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExternalSampleDetailController:retrieveSampleServicesHostList."
                        });
                        console.error(response.data);
                        debugger
                    }
            );
        };

        /******************************************************************************
         * This function gets the list of installed services in a host that store 
         * information for samples (e.g. LIMS)
         * 
         ******************************************************************************/
        this.retrieveSampleServicesList = function () {
            $http($rootScope.getHttpRequestConfig("GET", "sample-service-list", {
                params: {'host': $scope.model.other_exp_cond}
            })).then(
                    function successCallback(response) {
                        $scope.samplesInfo.services = response.data.services;
                    },
                    function errorCallback(response) {
                        var message = "Failed while retrieving the list of available hosts.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExternalSampleDetailController:retrieveSampleServicesList."
                        });
                        console.error(response.data);
                        debugger
                    }
            );
        };

        this.generateExternalLinks = function () {
            var ids = [];
            if ($scope.model.other_exp_cond && $scope.model.protocol_description) {
                ids = $scope.model.external_links.replace(/(\n| )/g, "");
                ids = ids.split(",");

                for (var i in ids) {
                    ///translate?sample@samplemanager.eb3kit.ki.se::23
                    ids[i] = "/external-sample?sample_id=sample@" + $scope.model.protocol_description + "." + $scope.model.other_exp_cond + "::" + ids[i];
                }
            }
            ids = arrayUnique(ids, [""]);
            $scope.samplesInfo.built_ids = ids;

            return this;
        };

        /******************************************************************************      
         * This function send the sample information contain in a given sample_view 
         * to the SERVER in order to save a NEW sample in the database .
         * Briefly the way of work is :
         *	1.	Check if the formulary's content is valid. If not, throws an error that should 
         *		catched in the caller function.
         *
         *	2.	If all fields are correct, then the sample model is converted from JSON to a 
         *		JSON format STRING and sent to the server using POST. After that the function finished.
         *	
         *	3.	After a while, the server returns a RESPONSE catched inside this function. 
         *		The response has 2 possible status: SUCCESS and FAILURE.
         *		a.	If SUCCESS, then the new sample identifier is set in the sample_view. 
         *			After that,  isthe callback function is called, in this case the 
         *       	callback function is the "execute_task" function that will execute the next
         *           task in the TASK QUEUE of the given SampleDetailsView panel. This function is called
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
        this.send_create_sample = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "sample-create", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'biocondition_json_data': $scope.model}),
            })).then(
                    function successCallback(response) {
                        console.info((new Date()).toLocaleString() + "Sample " + $scope.model.biocondition_id + " successfully saved in server");
                        $scope.model.biocondition_id = response.data.newID;

                        SampleList.addBiocondition($scope.model);

                        //Notify all the other controllers that a new sample exists
                        //$rootScope.$emit(APP_EVENTS.sampleCreated);
                        $scope.setLoading(false);

                        callback_caller[callback_function](true);
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while creating a new sample.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExternalSampleDetailController:send_create_sample."
                        });
                        console.error(response.data);

                        $scope.taskQueue.unshift({command: "create_new_sample", object: null});
                        $scope.setLoading(false);
                        callback_caller[callback_function](false);
                    }
            );
        };

        /******************************************************************************      
         * This function updates the information for the external sample.
         * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
         * @param  callback_function the function invoked by the callback_caller after the success/failure event
         * @return    
         ******************************************************************************/
        this.send_update_sample = function (callback_caller, callback_function) {
            debugger;
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "sample-update", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'biocondition_json_data': $scope.model}),
            })).then(
                    function successCallback(response) {
                        console.info((new Date()).toLocaleString() + "Sample " + $scope.model.biocondition_id + " successfully updated in server");
                        $scope.setLoading(false);
                        callback_caller[callback_function](true);
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while updating the sample.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExternalSampleDetailController:send_update_sample."
                        });
                        console.error(response.data);

                        $scope.taskQueue.unshift({command: "update_sample", object: null});
                        $scope.setLoading(false);
                        callback_caller[callback_function](false);
                    }
            );
        };

        /******************************************************************************      
         * This function lock a sample for editing.  
         * @param {String} newViewMode the new viewMode in case of success
         * @return this;  
         ******************************************************************************/
        this.send_lock_sample = function (newViewMode) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "sample-lock", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'biocondition_id': $scope.model.biocondition_id}),
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
                                logMessage: ((new Date()).toLocaleString() + "EDITION DENIED FOR Sample " + $scope.model.biocondition_id)
                            });
                            $scope.setLoading(false);
                        }
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while sending lock request.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExternalSampleDetailController:send_lock_sample."
                        });
                        console.error(response.data);
                        $scope.setLoading(false);
                    }
            );
            return this;
        };

        /******************************************************************************      
         * This function lock a sample for editing.  
         * @return this;  
         ******************************************************************************/
        this.send_unlock_sample = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "sample-unlock", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'biocondition_id': $scope.model.biocondition_id}),
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
                            logMessage: message + " at ExternalSampleDetailController:send_unlock_sample."
                        });
                        console.error(response.data);
                        callback_caller[callback_function](false);
                        $scope.setLoading(false);
                    }
            );
            return this;
        };

        /******************************************************************************      
         * 
         * @param {type} tasks_queue
         * @returns {Array}
         ******************************************************************************/
        this.clean_task_queue = function (tasks_queue) {
            console.info((new Date()).toLocaleString() + "CLEANING TASK QUEUE");
            try {
                if (tasks_queue.length === 0) {
                    return tasks_queue;
                }

                //IF THE QUEUE INCLUDES A CREATION TASK
                //The create_new_sample task must be always in the first position (if we are creating a new sample)
                if (tasks_queue[0].command === "create_new_sample") {
                    var tasks_queue_temp = [tasks_queue[0]];
                    return tasks_queue_temp;
                } else {
                    var tasks_queue_temp = [];
                    tasks_queue_temp.push({command: "update_sample", object: null});
                    tasks_queue_temp.push({command: "clear_locked_status", object: null});
                }

                return tasks_queue_temp;
            } catch (error) {
                $dialogs.showErrorDialog('ERROR CLEANING TASK QUEUE: ' + error, {soft: false});
                return tasks_queue;
            }
        };

        /******************************************************************************
         * This function handles the tasks execution for a given sampleView and should be only called after 
         * sample creation/edition.
         *
         * ACCEPT BUTTON should be only visible during new OBJECTS creation/edition (eg. during a sample creation/edition) 
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
                        case "create_new_sample":
                            console.info((new Date()).toLocaleString() + "SENDING SAVE NEW sample REQUEST TO SERVER");
                            this.send_create_sample(this, "execute_tasks");
                            console.info((new Date()).toLocaleString() + "SAVE NEW sample REQUEST SENT TO SERVER");
                            break;
                        case "update_sample":
                            console.info((new Date()).toLocaleString() + "SENDING UPDATE Sample REQUEST TO SERVER");
                            this.send_update_sample(this, "execute_tasks");
                            console.info((new Date()).toLocaleString() + "UPDATE Sample REQUEST SENT TO SERVER");
                            break;
                        case "clear_locked_status":
                            //TODO:
                            console.info(new Date().toLocaleString() + "SENDING UNLOCK Sample " + $scope.model.biocondition_id + " REQUEST TO SERVER");
                            this.send_unlock_sample(this, "execute_tasks");
                            console.info(new Date().toLocaleString() + "UNLOCK Sample " + $scope.model.biocondition_id + " REQUEST SENT TO SERVER");
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
                $dialogs.showSuccessDialog('Sample ' + $scope.model.biocondition_id + ' saved successfully');
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
                $scope.panel_title = "External samples details.";
                $scope.clearCountdownDialogs();
                if (restore === true) {
                    me.retrieveSampleDetails($scope.model.biocondition_id, true);
                }
            } else if (mode === 'creation') {
                $scope.panel_title = "Registering external samples";
                $scope.addNewTask("create_new_sample", null);
            } else if (mode === 'edition') {
                $scope.panel_title = "External samples edition.";
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
         * This function gets the list of installed services in a server that store 
         * information for samples (e.g. LIMS)
         * 
         ******************************************************************************/
        this.sampleServicesHostChangedHandler = function () {
            if ($scope.model.other_exp_cond) {
                delete $scope.model.protocol_description;
                this.retrieveSampleServicesList();
            }
            return this;
        };

        /******************************************************************************
         * This function generates the list of external links by combining the
         * selected Host + Service name + list of sample IDs.
         * 
         * @returns {Array} the list of external links
         ******************************************************************************/
        this.sampleIdentifiersChangedHandler = function () {
            this.generateExternalLinks();
        };

        /******************************************************************************
         * This function handles the event fires when the user deletes a biocondition
         *
         ******************************************************************************/
        this.deleteBiologicalConditionHandler = function () {
            var me = this;
            var current_user_id = '' + Cookies.get('loggedUserID');

            if (SampleList.isOwner($scope.model, current_user_id) || current_user_id === "admin") {
                $http($rootScope.getHttpRequestConfig("POST", "sample-delete", {
                    headers: {'Content-Type': 'application/json; charset=utf-8'},
                    data: $rootScope.getCredentialsParams({'biocondition_id': $scope.model.biocondition_id, loggedUserID: current_user_id}),
                })).then(
                        function successCallback(response) {
                            //Notify all the other controllers that samples has been deleted
                            $rootScope.$emit(APP_EVENTS.sampleDeleted);
                            $dialogs.showSuccessDialog("All the samples were successfully deleted.");
                            $state.go('samples', {force: true});
                        },
                        function errorCallback(response) {
                            var message = "Failed while deleting the samples.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at ExternalSampleDetailController:deleteBiologicalConditionHandler."
                            });
                            console.error(response.data);
                            debugger
                        }
                );
            }
        };

        /**
         * This function handles the event accept_button_pressed fires in other Controller (eg. ApplicationController)
         * when a button Accept is pressed.
         *  
         * @returns this
         */
        this.acceptButtonHandler = function () {
            if (!$scope.bioconditionForm.$valid) {
                $dialogs.showErrorDialog("Invalid form, please check the form and fill the empty fields.")
                return false;
            }

            $scope.setLoading(true);
            $scope.setTaskQueue(this.clean_task_queue($scope.getTaskQueue()));
            this.execute_tasks(true);
            return this;
        };

        /**
         * This function send a Edition request to the server in order to block the Sample
         * avoiding that other users edit it before the user saves the changes.
         * Each user has 30 minutes max. to edit a Sample, after that the user will be 
         * ask again, if no answer is given, the Sample is unblocked and changes will be  
         * lost.
         * This is neccessary because if the user leaves the application without save or close the panel,
         * the server MUST free the blocked object in order to let other users edit it.
         * After BLOCKET_TIME minutes, the server automatically frees the blocked object, so the user
         * will be asked 1 minute before the liberation takes place.
         * 
         * @returns this;
         */
        this.editButtonHandler = function () {
            //1. CHECK IF THE USER HAS EDITING PRIVILEGES OVER THE Sample (ONLY OWNERS)
            //TODO: THIS CODE COULD BE BETTER IN THE SERVER (JAVASCRIPT IS VULNERABLE)
            var current_user_id = '' + Cookies.get('loggedUserID');
            if (!SampleList.isOwner($scope.model, current_user_id) && current_user_id !== "admin") {
                console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over the Sample " + $scope.model.biocondition_id);
                $dialogs.showErrorDialog("Your user is not allowed to edit this sample");
                return;
            }

            //2. SEND LOCK REQUEST
            console.info((new Date()).toLocaleString() + "SENDING EDIT REQUEST FOR Sample " + $scope.model.biocondition_id + " TO SERVER");
            this.send_lock_sample('edition');

            return this;
        };

        /**
         * This function handles the cancel_button_pressed thown by the Application Controller
         * when the Cancel button located in MainView is pressed and the inner panel is an
         * SampleDetailsView panel.
         * Asks the user if close without save changes. If user selects "Yes", the panel is closed.
         * if the panel was in a "Editing mode" (if the panel has a timer id), then sends a signal to the server in order to unblock
         * the Sample in the list of blocked elements.
         * 
         * @param {type} sampleView
         * @param {type} force
         * @returns {undefined}
         */
        this.cancelButtonHandler = function () {
            $scope.clearTaskQueue();

            if ($scope.viewMode === 'view') {
                $state.go('samples');
            } else if ($scope.viewMode === 'edition') {
                this.send_unlock_sample();
            } else {
                $state.go('samples');
            }

        };

        /******************************************************************************
         *      ___ _  _ ___ _____ ___   _   _    ___ ____  _ _____ ___ ___  _  _ 
         *     |_ _| \| |_ _|_   _|_ _| /_\ | |  |_ _|_  / /_\_   _|_ _/ _ \| \| |
         *      | || .` || |  | |  | | / _ \| |__ | | / / / _ \| |  | | (_) | .` |
         *     |___|_|\_|___| |_| |___/_/ \_\____|___/___/_/ \_\_| |___\___/|_|\_|
         *     
         ******************************************************************************/
        this.name = "ExternalSampleDetailController";
        var me = this;

        //The corresponding view will be watching to this variable
        //and update its content after the http response
        $scope.model = {};
        $scope.samplesInfo = {};
        $scope.setViewMode($stateParams.viewMode || 'view');
        $scope.link_input_type = "manual";

        if ($stateParams.biocondition_id || $scope.biocondition_id) {
            this.retrieveSampleDetails($stateParams.biocondition_id || $scope.biocondition_id, true);
        } else {
            $scope.model.biocondition_id = "[Autogenerated after saving]";
            $scope.model.bioreplicates = [];
            $scope.model.tags = [];
            $scope.model.owners = [{user_id: Cookies.get("loggedUserID")}];
            $scope.model.submission_date = new Date();
            $scope.model.last_edition_date = new Date();
            $scope.model.associatedBioreplicates = [];
            $scope.model.isExternal = true;
        }

        this.retrieveSampleServicesHostList();
        this.getOrganimsList();
    });
})();