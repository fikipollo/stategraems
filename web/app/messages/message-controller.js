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
 * - MessageListController
 */
(function () {
    var app = angular.module('messages.controllers', [
        'ang-dialogs',
        'angular.backtop',
        'messages.services.message-list',
        'users.directives.user-list',
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
    app.controller('MessageListController', function ($rootScope, $scope, $http, $dialogs, APP_EVENTS, MessageList) {
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
        /**
         * This function retrieves all the messages registered in the system
         * @param {String} group limit the search to "user's" messages (not used)
         * @param {boolean} force true if the request must be executed
         * @returns this
         */
        this.retrieveMessagesData = function (group, force) {
            $scope.setLoading(true);

            if (MessageList.getOld() > 1 || force) { //Max age for data 5min.
                $http($rootScope.getHttpRequestConfig("GET", "message-rest", {
                    headers: {'Content-Type': 'application/json'}
                })).then(
                        function successCallback(response) {
                            $scope.isLoading = false;
                            $scope.messages = MessageList.setMessages(response.data).getMessages();
                            $scope.filteredMessages = $scope.messages.length;

                            //Display the messages in batches
                            if (window.innerWidth > 1500) {
                                $scope.visibleMessages = 14;
                            } else if (window.innerWidth > 1200) {
                                $scope.visibleMessages = 10;
                            } else {
                                $scope.visibleMessages = 6;
                            }

                            $scope.visibleMessages = Math.min($scope.filteredMessages, $scope.visibleMessages);
                            $scope.setLoading(false);
                        },
                        function errorCallback(response) {
                            $scope.setLoading(false);

                            debugger;
                            var message = "Failed while retrieving the messages list.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at MessageListController:retrieveMessagesData."
                            });
                            console.error(response.data);
                        }
                );
            } else {
                $scope.messages = MessageList.getMessages();
                $scope.filteredMessages = $scope.messages.length;
                $scope.setLoading(false);
            }

            return this;
        };

        /**
         * This function defines the behaviour for the "filterMessages" function.
         * Given a item (message) and a set of filters, the function evaluates if
         * the current item contains the set of filters within the different attributes
         * of the model.
         *
         * @returns {Boolean} true if the model passes all the filters.
         */
        $scope.filterMessages = function () {
            $scope.filteredMessages = 0;
            $scope.user_id = $scope.user_id || Cookies.get("loggedUserID");
            return function (item) {
                if ($scope.show !== "all") {
                    return item.type === $scope.show;
                }

                var filterAux, item_tags;
                for (var i in $scope.filters) {
                    filterAux = $scope.filters[i].toLowerCase();
                    //TODO: ENABLE WITH TAG
                    //item_tags = item.tags.join("");
                    //if (!((item.message_name.toLowerCase().indexOf(filterAux)) !== -1 || (item.description.toLowerCase().indexOf(filterAux)) !== -1 || (item_tags.toLowerCase().indexOf(filterAux)) !== -1)) {
                    if (!((item.message_name.toLowerCase().indexOf(filterAux)) !== -1 || (item.description.toLowerCase().indexOf(filterAux)) !== -1)) {
                        return false;
                    }
                }
                $scope.filteredMessages++;
                return true;
            };
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
        $scope.$on(APP_EVENTS.messageDeleted, function (event, args) {
            debugger;
            this.retrieveMessagesData('', true);
        });

        this.changeCurrentMessageHandler = function (message) {
            if ($scope.action !== "new-message") {
                //TODO: SEND "READ" UPDATE TO SERVER
                message.read = true;
                $scope.currentMessage = message;
            }
        };

        this.startNewMessageHandler = function () {
            if ($scope.action !== "new-message") {
                $scope.action = 'new-message';
                $scope.newMessage.users.length = 0;
                $scope.newMessage.subject = '';
                $scope.newMessage.content = '';
            }
        };

        this.replyMessageHandler = function (message) {
            if ($scope.action !== "new-message") {
                $scope.action = 'new-message';
                $scope.newMessage.users.length = 0;
                $scope.newMessage.users.push(message.sender);
                $scope.newMessage.subject = "Re: " + message.subject.replace(/^Re: /, "");
                $scope.newMessage.content = '';
            }
        };

        this.sendNewMessageHandler = function () {
            for (var i in $scope.newMessage.users) {
                $scope.newMessage.users[i].user_id;
                //TODO: CREATE NEW INSTANCE AND SEND
            }
        };

        /**
         * This function applies the filters when the user clicks on "Search"
         */
        this.applySearchHandler = function () {
            var filters = arrayUnique($scope.filters.concat($scope.searchFor.split(" ")));
            $scope.filters = MessageList.setFilters(filters).getFilters();
        };

        this.filterByTag = function (tag) {
            if (tag !== "All") {
                var filters = arrayUnique($scope.filters.concat(tag));
                $scope.filters = MessageList.setFilters(filters).getFilters();
            }
        };

        /**
         * This function remove a given filter when the user clicks at the "x" button
         */
        this.removeFilterHandler = function (filter) {
            $scope.filters = MessageList.removeFilter(filter).getFilters();
        };

        this.showMoreMessagesHandler = function () {
            if (window.innerWidth > 1500) {
                $scope.visibleMessages += 10;
            } else if (window.innerWidth > 1200) {
                $scope.visibleMessages += 6;
            } else {
                $scope.visibleMessages += 4;
            }
            $scope.visibleMessages = Math.min($scope.filteredMessages, $scope.visibleMessages);
        };

        /******************************************************************************
         *      ___ _  _ ___ _____ ___   _   _    ___ ____  _ _____ ___ ___  _  _ 
         *     |_ _| \| |_ _|_   _|_ _| /_\ | |  |_ _|_  / /_\_   _|_ _/ _ \| \| |
         *      | || .` || |  | |  | | / _ \| |__ | | / / / _ \| |  | | (_) | .` |
         *     |___|_|\_|___| |_| |___/_/ \_\____|___/___/_/ \_\_| |___\___/|_|\_|
         *     
         ******************************************************************************/
        this.name = "MessageListController";
        var me = this;

        //This controller uses the MessageList, which defines a Singleton instance of
        //a list of messages + list of tags + list of filters. Hence, the application will not
        //request the data everytime that the message list panel is displayed (data persistance).
        $scope.messages = MessageList.getMessages();
        $scope.filters = MessageList.getFilters();
        $scope.filteredMessages = $scope.messages.length;
        $scope.newMessage = {
            users: []
        };

        //Display the messages in batches
        if (window.innerWidth > 1500) {
            $scope.visibleMessages = 14;
        } else if (window.innerWidth > 1200) {
            $scope.visibleMessages = 10;
        } else {
            $scope.visibleMessages = 6;
        }

        $scope.visibleMessages = Math.min($scope.filteredMessages, $scope.visibleMessages);

        if ($scope.messages.length === 0) { //includes the default message
            this.retrieveMessagesData("my_messages", true);
        }
    });

})();