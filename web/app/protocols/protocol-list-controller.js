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
 * - ProtocolListController
 * - ProtocolDetailController
 */
(function () {
    var app = angular.module('protocols.controllers', [
        'ang-dialogs',
        'angular.backtop',
        'protocols.services.protocol-list',
        'protocols.directives.protocol-card',
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
    app.controller('ProtocolListController', function ($rootScope, $scope, $http, $dialogs, APP_EVENTS, ProtocolList) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------
        /**
         * This function retrieves all the protocols registered in the system
         * @param {type} group, limit the search to "user's" protocols (not used)
         * @param {type} force
         * @returns this
         */
        this.retrieveProtocolsData = function (group, force) {
            $scope.isLoading = true;

            if (ProtocolList.getOld() > 1 || force) { //Max age for data 5min.
                $http($rootScope.getHttpRequestConfig("POST", "protocol-list", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams()
                })).then(
                        function successCallback(response) {
                            $scope.isLoading = false;
                            $scope.protocols = ProtocolList.setProtocols(response.data).getProtocols();
                            $scope.tags = ProtocolList.updateTags().getTags();
                            $scope.filteredProtocols = $scope.protocols.length;

                            //Display the protocols in batches
                            if (window.innerWidth > 1500) {
                                $scope.visibleProtocols = 14;
                            } else if (window.innerWidth > 1200) {
                                $scope.visibleProtocols = 10;
                            } else {
                                $scope.visibleProtocols = 6;
                            }

                            $scope.visibleProtocols = Math.min($scope.filteredProtocols, $scope.visibleProtocols);
                        },
                        function errorCallback(response) {
                            $scope.isLoading = false;

                            debugger;
                            var message = "Failed while retrieving the protocols list.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at ProtocolListController:retrieveProtocolsData."
                            });
                            console.error(response.data);
                        }
                );
            } else {
                $scope.protocols = ProtocolList.getProtocols();
                $scope.tags = ProtocolList.getTags();
                $scope.filteredProtocols = $scope.protocols.length;
                $scope.isLoading = false;
            }

            return this;
        };

        /**
         * This function defines the behaviour for the "filterProtocols" function.
         * Given a item (protocol) and a set of filters, the function evaluates if
         * the current item contains the set of filters within the different attributes
         * of the model.
         *
         * @returns {Boolean} true if the model passes all the filters.
         */
        $scope.filterProtocols = function () {
            $scope.filteredProtocols = 0;
            $scope.user_id = $scope.user_id || Cookies.get("loggedUserID");
            return function (item) {
                if ($scope.show === "my_protocols") {
                    if (!ProtocolList.isOwner(item, $scope.user_id) && !ProtocolList.isMember(item, $scope.user_id)) {
                        return false;
                    }
                }

                var filterAux, item_tags;
                for (var i in $scope.filters) {
                    filterAux = $scope.filters[i].toLowerCase();
                    item_tags = item.tags.join("");
                    if (!((item.title.toLowerCase().indexOf(filterAux)) !== -1 || (item.protocol_description.toLowerCase().indexOf(filterAux)) !== -1 || (item_tags.toLowerCase().indexOf(filterAux)) !== -1)) {
                        return false;
                    }
                }
                $scope.filteredProtocols++;
                return true;
            };
        };

        $scope.getTagColor = function (_tag) {
            var tag = ProtocolList.getTag(_tag);
            if (tag !== null) {
                return tag.color;
            }
            return "";
        }

        $scope.isMember = function (protocol) {
            $scope.user_id = $scope.user_id || Cookies.get("loggedUserID");
            return (ProtocolList.isOwner(protocol, $scope.user_id) || ProtocolList.isMember(protocol, $scope.user_id));
        }



        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------
        $scope.$on(APP_EVENTS.protocolDeleted, function (event, args) {
            debugger;
            this.retrieveProtocolsData('', true);
        });

        this.showProtocolChooserChangeHandler = function () {
            this.retrieveProtocolsData($scope.show);
        };


        /**BC****************************************************************************      
         * This function try to change the current selected protocol to a given one (if
         * user is member or owner).
         *
         * @param protocol_id the Protocol id
         * @return      
         **EC****************************************************************************/
        this.changeCurrentProtocolHandler = function (protocol_id) {
            $http($rootScope.getHttpRequestConfig("POST", "protocol-selection", {
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                data: $rootScope.getCredentialsParams({'protocol_id': protocol_id}),
            })).then(
                    function successCallback(response) {
                        if (response.data.valid_protocol) {
                            console.info((new Date()).toLocaleString() + "CHANGED TO EXPERIMENT " + protocol_id + " SUCCESSFULLY");
                            Cookies.set('currentProtocolID', protocol_id, null, location.pathname);
                            $dialogs.showSuccessDialog("Now you are working with Protocol.");
                        } else {
                            showErrorMessage("You are not member of the selected protocol. Please, contact administrator or protocol owners to become a member.");
                        }
                    },
                    function errorCallback(response) {
                        var message = "Failed while changing the current protocol.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ProtocolListController:changeCurrentProtocolHandler."
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
            $scope.filters = ProtocolList.setFilters(filters).getFilters();
        };

        this.filterByTag = function (tag) {
            if (tag !== "All") {
                var filters = arrayUnique($scope.filters.concat(tag));
                $scope.filters = ProtocolList.setFilters(filters).getFilters();
            }
        };

        /**
         * This function remove a given filter when the user clicks at the "x" button
         */
        this.removeFilterHandler = function (filter) {
            $scope.filters = ProtocolList.removeFilter(filter).getFilters();
        };

        this.showMoreProtocolsHandler = function () {
            if (window.innerWidth > 1500) {
                $scope.visibleProtocols += 10;
            } else if (window.innerWidth > 1200) {
                $scope.visibleProtocols += 6;
            } else {
                $scope.visibleProtocols += 4;
            }
            $scope.visibleProtocols = Math.min($scope.filteredProtocols, $scope.visibleProtocols);
        }

        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        var me = this;

        //This controller uses the ProtocolList, which defines a Singleton instance of
        //a list of protocols + list of tags + list of filters. Hence, the application will not
        //request the data everytime that the protocol list panel is displayed (data persistance).
        $scope.protocols = ProtocolList.getProtocols();
        $scope.tags = ProtocolList.getTags();
        $scope.filters = ProtocolList.getFilters();
        $scope.filteredProtocols = $scope.protocols.length;

        //Display the protocols in batches
        if (window.innerWidth > 1500) {
            $scope.visibleProtocols = 14;
        } else if (window.innerWidth > 1200) {
            $scope.visibleProtocols = 10;
        } else {
            $scope.visibleProtocols = 6;
        }

        $scope.visibleProtocols = Math.min($scope.filteredProtocols, $scope.visibleProtocols);


        if ($scope.protocols.length === 0) {
            this.retrieveProtocolsData("my_protocols");
        }
    });

    app.controller('ProtocolDetailController', function ($state, $rootScope, $scope, $http, $stateParams, $timeout, $dialogs, APP_EVENTS, ProtocolList, TemplateList) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------

        /**
         * This function gets the details for a given Protocol
         * @param protocol_id the id for the Protocol to be retieved
         */
        this.retrieveProtocolDetails = function (protocol_id, force) {
            $scope.setLoading(true);

            $scope.model = ProtocolList.getProtocol(protocol_id);

            if ($scope.model === null || force === true) {
                $http($rootScope.getHttpRequestConfig("POST", "protocol-info", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams({protocol_id: protocol_id})
                })).then(
                        function successCallback(response) {
                            $scope.model = ProtocolList.addProtocol(response.data);
                            ProtocolList.adaptInformation([$scope.model])[0];
                            $scope.setLoading(false);
                        },
                        function errorCallback(response) {
                            debugger;
                            var message = "Failed while retrieving the protocol's details.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at ProtocolDetailController:retrieveProtocolDetails."
                            });
                            console.error(response.data);
                            $scope.setLoading(false);
                        }
                );
            }
            $scope.setLoading(false);
        };

        /******************************************************************************      
         * This function send the protocol information contain in a given protocol_view 
         * to the SERVER in order to save a NEW protocol in the database .
         * Briefly the way of work is :
         *	1.	Check if the formulary's content is valid. If not, throws an error that should 
         *		catched in the caller function.
         *
         *	2.	If all fields are correct, then the protocol model is converted from JSON to a 
         *		JSON format STRING and sent to the server using POST. After that the function finished.
         *	
         *	3.	After a while, the server returns a RESPONSE catched inside this function. 
         *		The response has 2 possible status: SUCCESS and FAILURE.
         *		a.	If SUCCESS, then the new protocol identifier is set in the protocol_view. 
         *			After that,  isthe callback function is called, in this case the 
         *       	callback function is the "execute_task" function that will execute the next
         *           task in the TASK QUEUE of the given ProtocolDetailsView panel. This function is called
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
        this.send_create_protocol = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "protocol-create", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'protocol_json_data': $scope.model}),
            })).then(
                    function successCallback(response) {
                        console.info((new Date()).toLocaleString() + "Protocol " + $scope.model.protocol_id + " successfully saved in server");
                        $scope.model.protocol_id = response.data.newID;
                        ProtocolList.addProtocol($scope.model);
//                        //Notify all the other controllers that a new protocol exists
//                        $rootScope.$broadcast(APP_EVENTS.protocolCreated);
                        $scope.setLoading(false);

                        callback_caller[callback_function](true);
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while creating a new protocol.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ProtocolDetailController:send_create_protocol."
                        });
                        console.error(response.data);

                        $scope.taskQueue.unshift({command: "create_new_protocol", object: null});
                        $scope.setLoading(false);
                        callback_caller[callback_function](false);
                    }
            );
        };
        /******************************************************************************      
         * This function send the BioReplicatess information of the given biorepicate_model 
         * to the SERVER in order to save a NEW BIOREPLICATE in the database associated to the 
         * protocol given by the Protocol_view.
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
         *           task in the TASK QUEUE of the given ProtocolVIEW panel. This function is called
         *           with the status flag sets to TRUE (~ success).
         *		b.	If FAILURE, then the callback function is called (the "execute_task" function again)
         *       	but this time with the status flag sets to FALSE (~ failure), in this case, 
         *           the current task is re-added to the TASK QUEUE and an error message is showed.
         *           The insertion process is aborted, however all "TO DO" steps are saved in order to be executed again.
         *  
         *  
         * @param  protocolView the ProtocolDetailsView panel which fires the create action and contains the TASK QUEUE. Needed for the callback function.
         * @param  callback_caller after the success/failure event, this object will call to the callback_function. Is needed to preserve the enviroment.
         * @param  callback_function the function invoked by the callback_caller after the success/failure event
         * @return    
         ******************************************************************************/
        this.send_update_protocol = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "protocol-update", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'protocol_json_data': $scope.model}),
            })).then(
                    function successCallback(response) {
                        console.info((new Date()).toLocaleString() + "Protocol " + $scope.model.protocol_id + " successfully updated in server");
                        $scope.setLoading(false);
                        callback_caller[callback_function](true);
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while updating the protocol.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ProtocolDetailController:send_update_protocol."
                        });
                        console.error(response.data);

                        $scope.taskQueue.unshift({command: "update_protocol", object: null});
                        $scope.setLoading(false);
                        callback_caller[callback_function](false);
                    }
            );
        };

        /******************************************************************************      
         * This function lock a protocol for editing.  
         * @param {String} newViewMode the new viewMode in case of success
         * @return this;  
         ******************************************************************************/
        this.send_lock_protocol = function (newViewMode) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "protocol-lock", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'protocol_id': $scope.model.protocol_id}),
            })).then(
                    function successCallback(response) {
                        if (response.data.success) {
                            console.info((new Date()).toLocaleString() + "object locked successfully");
                            if (newViewMode === "edition") {
                                $scope.initializeCountdownDialogs();
                                $scope.memento = ProtocolList.getMemento($scope.model);
                            }
                            $scope.setViewMode(newViewMode || 'view');
                            $scope.setLoading(false);
                        } else {
                            $dialogs.showErrorDialog('Apparently user ' + response.data.user_id + ' opened this object for editing. </br>Please, try again later. If the problem persists, please contact with tecnical support.', {
                                logMessage: ((new Date()).toLocaleString() + "EDITION DENIED FOR Protocol " + $scope.model.protocol_id)
                            });
                            $scope.setLoading(false);
                        }
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while sending lock request.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ProtocolDetailController:send_lock_protocol."
                        });
                        console.error(response.data);
                        $scope.setLoading(false);
                    }
            );
            return this;
        };


        /******************************************************************************      
         * This function lock a protocol for editing.  
         * @return this;  
         ******************************************************************************/
        this.send_unlock_protocol = function (callback_caller, callback_function) {
            $scope.setLoading(true);

            $http($rootScope.getHttpRequestConfig("POST", "protocol-unlock", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({'protocol_id': $scope.model.protocol_id}),
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
                            logMessage: message + " at ProtocolDetailController:send_unlock_protocol."
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
                //The create_new_protocol task must be always in the first position (if we are creating a new protocol)
                if (tasks_queue[0].command === "create_new_protocol") {
                    //The protocol creation send all the information (protocol, bioreplicates, ... )to the server in only one step 
                    //So it's neccessary to remove all the tasks related with bioreplicates and analytical replicates insertion.
                    //After that only "create_new_protocol" and others tasks like "send_treatment_document" should be in the queue
                    var tasks_queue_temp = [tasks_queue[0]];
                    return tasks_queue_temp;
                }
                var tasks_queue_temp = [];
                //IF NOT, we need to "clean" the queue removing pairs of "create, remove" tasks and creation task for subelements
                //that would be created in the superelement creation. Eg. if we added tasks for Analytical reps creation but those
                //analytical reps are associated to a to-be-added bioreplicate, we should remove those tasks because they will be
                //inserted during the Bioreplicate insertion (because the local object has already the changes)
                tasks_queue_temp.push({command: "update_protocol", object: null});
                tasks_queue_temp.push({command: "clear_locked_status", object: null});
                return tasks_queue_temp;
            } catch (error) {
                $scope.showErrorDialog('ERROR CLEANING TASK QUEUE: ' + error, {soft: false});
                return tasks_queue;
            }
        };

        /**********************************************************************************************
         * This function handles the tasks execution for a given protocolView and should be only called after 
         * protocol creation/edition.
         *
         * ACCEPT BUTTON should be only visible during new OBJECTS creation/edition (eg. during a protocol creation/edition) 
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
                        case "create_new_protocol":
                            console.info((new Date()).toLocaleString() + "SENDING SAVE NEW protocol REQUEST TO SERVER");
                            this.send_create_protocol(this, "execute_tasks");
                            console.info((new Date()).toLocaleString() + "SAVE NEW protocol REQUEST SENT TO SERVER");
                            break;
                        case "update_protocol":
                            console.info((new Date()).toLocaleString() + "SENDING UPDATE Protocol REQUEST TO SERVER");
                            this.send_update_protocol(this, "execute_tasks");
                            console.info((new Date()).toLocaleString() + "UPDATE Protocol REQUEST SENT TO SERVER");
                            break;
                        case "clear_locked_status":
                            //TODO:
                            console.info(new Date().toLocaleString() + "SENDING UNLOCK Protocol " + $scope.model.protocol_id + " REQUEST TO SERVER");
                            this.send_unlock_protocol(this, "execute_tasks");
                            console.info(new Date().toLocaleString() + "UNLOCK Protocol " + $scope.model.protocol_id + " REQUEST SENT TO SERVER");
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
                this.retrieveProtocolDetails($scope.model.protocol_id, true);
                $dialogs.showSuccessDialog('Protocol ' + $scope.model.protocol_id + ' saved successfully');
            } else {
                status = false;
                $scope.taskQueue.unshift(current_task);
                $scope.setLoading(false);
            }
        };

        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------
        this.deleteProtocolHandler = function () {
            var me = this;
            var current_user_id = '' + Cookies.get('loggedUserID');

            if (ProtocolList.isOwner($scope.model, current_user_id) || current_user_id === "admin") {
                //ONLY OWNERS CAN REMOVE THE EXPERIMENT, OTHERWISE THE USER WILL BE REMOVED FROM MEMBERS LIST
                var message = "";
                if ($scope.model.protocol_owners.length > 1 && current_user_id !== "admin") {
                    //Remove the user from the owners list
                    message = 'Delete this protocol from your collection?<br>You will be removed from the owners list but the protocol will not deleted before all the administrators remove the protocol.';
                } else {
                    //No more owners --> remove the entire protocol
                    message = 'Delete this protocol from the system?<br>This action will remove all the data for the protocol from database, including all associated analysis.<br>This action cannot be undone.';
                }

                $dialogs.showConfirmationDialog(message, {
                    title: "Please confirm this action.",
                    callback: function (result) {
                        if (result === 'ok') {
                            $http($rootScope.getHttpRequestConfig("POST", "protocol-delete", {
                                headers: {'Content-Type': 'application/json; charset=utf-8'},
                                data: $rootScope.getCredentialsParams({'protocol_id': $scope.model.protocol_id, loggedUserID: current_user_id}),
                            })).then(
                                    function successCallback(response) {
                                        $dialogs.showSuccessDialog("The protocol was successfully deleted.");
                                        //Notify all the other controllers that user has signed in
                                        $rootScope.$broadcast(APP_EVENTS.protocolDeleted);
                                        me.send_unlock_protocol();
                                        $state.go('protocols');
                                    },
                                    function errorCallback(response) {
                                        var message = "Failed while deleting the protocol.";
                                        $dialogs.showErrorDialog(message, {
                                            logMessage: message + " at ProtocolDetailController:deleteProtocolHandler."
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


        /**BC****************************************************************************      
         * This function try to change the current selected protocol to a given one (if
         * user is member or owner).
         *
         * @param protocol_id the Protocol id
         * @return      
         **EC****************************************************************************/
        this.changeCurrentProtocolHandler = function (protocol_id) {
            $http($rootScope.getHttpRequestConfig("POST", "protocol-selection", {
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                data: $rootScope.getCredentialsParams({'protocol_id': protocol_id}),
            })).then(
                    function successCallback(response) {
                        if (response.data.valid_protocol) {
                            console.info((new Date()).toLocaleString() + "CHANGED TO EXPERIMENT " + protocol_id + " SUCCESSFULLY");
                            Cookies.set('currentProtocolID', protocol_id, null, location.pathname);
                            $dialogs.showSuccessDialog("Now you are working with Protocol.");
                        } else {
                            showErrorMessage("You are not member of the selected protocol. Please, contact administrator or protocol owners to become a member.");
                        }
                    },
                    function errorCallback(response) {
                        var message = "Failed while changing the current protocol.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ProtocolDetailController:changeCurrentProtocolHandler."
                        });
                        console.error(response.data);
                        debugger
                    }
            );
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
         * This function send a Edition request to the server in order to block the Protocol
         * avoiding that other users edit it before the user saves the changes.
         * Each user has 30 minutes max. to edit a Protocol, after that the user will be 
         * ask again, if no answer is given, the Protocol is unblocked and changes will be  
         * lost.
         * This is neccessary because if the user leaves the application without save or close the panel,
         * the server MUST free the blocked object in order to let other users edit it.
         * After BLOCKET_TIME minutes, the server automatically frees the blocked object, so the user
         * will be asked 1 minute before the liberation takes place.
         * 
         * @returns this;
         */
        this.editButtonHandler = function () {
            //1. CHECK IF THE USER HAS EDITING PRIVILEGES OVER THE Protocol (ONLY OWNERS)
            //TODO: THIS CODE COULD BE BETTER IN THE SERVER (JAVASCRIPT IS VULNERABLE)
            var current_user_id = '' + Cookies.get('loggedUserID');
            if (!ProtocolList.isOwner($scope.model, current_user_id) && current_user_id !== "admin") {
                console.error((new Date()).toLocaleString() + " EDITION REQUEST DENIED. Error message: User " + current_user_id + " has not Edition privileges over the Protocol " + $scope.model.protocol_id);
                $dialogs.showErrorDialog("Your user is not allowed to edit this protocol");
                return;
            }

            //2. SEND LOCK REQUEST
            console.info((new Date()).toLocaleString() + "SENDING EDIT REQUEST FOR Protocol " + $scope.model.protocol_id + " TO SERVER");
            this.send_lock_protocol('edition');

            return this;
        };

        /**
         * This function handles the cancel_button_pressed thown by the Application Controller
         * when the Cancel button located in MainView is pressed and the inner panel is an
         * ProtocolDetailsView panel.
         * Asks the user if close without save changes. If user selects "Yes", the panel is closed.
         * if the panel was in a "Editing mode" (if the panel has a timer id), then sends a signal to the server in order to unblock
         * the Protocol in the list of blocked elements.
         * 
         * @param {type} protocolView
         * @param {type} force
         * @returns {undefined}
         */
        this.cancelButtonHandler = function () {
            $scope.clearTaskQueue();

            if ($scope.viewMode === 'view') {
                $state.go('protocols');
            } else if ($scope.viewMode === 'edition') {
                this.send_unlock_protocol();
            } else {
                $state.go('protocols');
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
        var me = this;

        $scope.setViewMode = function (mode, restore) {
            if (mode === 'view') {
                $scope.panel_title = "Protocol details.";
                $scope.clearCountdownDialogs();
                if (restore === true) {
                    ProtocolList.restoreFromMemento($scope.model, $scope.memento);
                    $scope.memento = null;
                }
            } else if (mode === 'creation') {
                $scope.panel_title = "Protocol creation.";
                $scope.addNewTask("create_new_protocol", null);
            } else if (mode === 'edition') {
                $scope.panel_title = "Protocol edition.";
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

        //The corresponding view will be watching to this variable
        //and update its content after the http response
        $scope.loadingComplete = false;
        $scope.model = {};
        $scope.setViewMode($stateParams.viewMode || 'view');
        $scope.getFormTemplate('protocol-form');

        if ($stateParams.protocol_id !== null) {
            this.retrieveProtocolDetails($stateParams.protocol_id);
        } else {
            $scope.model.protocol_id = "[Autogenerated after saving]";
            $scope.model.submission_date = new Date();
            $scope.model.last_edition_date = new Date();
            $scope.model.protocol_owners = [{user_id: Cookies.get("loggedUserID")}];
            $scope.model.protocol_members = [];
            $scope.model.tags = [];
        }

    });
})();