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
 * - UserSessionController
 * - UserListController
 */
(function () {
    var app = angular.module('users.controllers.user-session', [
        'common.dialogs',
        'ui.router',
        'users.services.user-list',
        'ui.bootstrap'
    ]);

    app.controller('UserSessionController', function ($state, $rootScope, $scope, $http, $dialogs, AUTH_EVENTS) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------
        this.getCurrentUserDetails = function () {
            $http($rootScope.getHttpRequestConfig("POST", "user-info", {
                headers: {'Content-Type': 'application/json'},
                data: $rootScope.getCredentialsParams({email: 'current'})
            })).then(
                    function successCallback(response) {
                        $scope.userInfo.email = response.data.email;
                        $scope.userInfo.user_id = response.data.user_id;
                    },
                    function errorCallback(response) {
                        var message = "Failed while getting user's details at UserSessionController:getCurrentUserDetails";
                        console.error(message);
                        console.error(response.data);
                    }
            );
        };

        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------
        $scope.$on(AUTH_EVENTS.loginSuccess, function (event, args) {
            debugger
            $scope.userInfo.email = Cookies.get("loggedUser");
        });

        $scope.$on(AUTH_EVENTS.logoutSuccess, function (event, args) {
            delete $scope.userInfo.email;
            delete $scope.userInfo.user_id;
        });

        this.signFormSubmitHandler = function () {
            if ($scope.isLogin) {
                this.signInButtonHandler();
            } else {
                this.signUpButtonHandler();
            }
        };

        this.signInButtonHandler = function () {
            if ($scope.userInfo.email !== '' && $scope.userInfo.password !== '') {
                $http($rootScope.getHttpRequestConfig("POST", "user-sign-in", {
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        email: $scope.userInfo.email,
                        password: $scope.userInfo.password
                    }
                })).then(
                        function successCallback(response) {
                            //CLEAN PREVIOUS COOKIES
                            Cookies.remove("loggedUser", {path: window.location.pathname});
                            Cookies.remove("loggedUserID", {path: window.location.pathname});
                            Cookies.remove("sessionToken", {path: window.location.pathname});

                            $scope.userInfo.email = response.data.email;
                            $scope.userInfo.user_id = response.data.user_id;

                            //SET THE COOKIES
                            Cookies.set("loggedUser", $scope.userInfo.email, {expires: 1, path: window.location.pathname});
                            Cookies.set("loggedUserID", $scope.userInfo.user_id, {expires: 1, path: window.location.pathname});
                            Cookies.set("sessionToken", response.data.sessionToken, {expires: 1, path: window.location.pathname});


                            delete $scope.userInfo.password;
                            delete $scope.signForm;

                            //Notify all the other controllers that user has signed in
                            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

                            $state.go('home');
                        },
                        function errorCallback(response) {
                            if (response.data.code === "00003a") {
                                $dialogs.showErrorDialog("Invalid user or password.");
                                return;
                            }

                            debugger;
                            var message = "Failed during sign-in process.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at UserSessionController:signInButtonHandler."
                            });
                            console.error(response.data);
                        }
                );
            }
            ;
        };

        this.signUpButtonHandler = function () {
            if ($scope.userInfo.email !== '' && $scope.userInfo.user_id !== '' && $scope.userInfo.password !== '' && $scope.userInfo.password == $scope.userInfo.passconfirm) {
                $http($rootScope.getHttpRequestConfig("POST", "user-sign-up", {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    urlEncodedRequest: true,
                    data: {
                        email: $scope.userInfo.email,
                        user_id: $scope.userInfo.user_id,
                        password: $scope.userInfo.password,
                        confirm: $scope.userInfo.password,
                        create_user_button: "Submit"
                    }}
                )).then(
                        function successCallback(response) {
                            response = $(response.data).find(".errormessage").text();

                            if (response === undefined || response === "") {
                                $dialogs.showSuccessDialog("Your account has been created!");
                                $scope.isLogin = true;
                            } else {
                                $dialogs.showErrorDialog("Failed when creating new account: " + response);
                            }

                            delete $scope.userInfo.password;
                            delete $scope.userInfo.passconfirm;
                            delete $scope.signForm;
                        },
                        function errorCallback(response) {
                            debugger;
                            var message = "Failed during sign-up process.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at UserSessionController:signUpButtonHandler."
                            });
                            console.error(response.data);
                        }
                );
            }
        };

        this.signOutButtonHandler = function () {
            $http($rootScope.getHttpRequestConfig("POST", "user-sign-out", {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: $rootScope.getCredentialsParams()
            })).then(
                    function successCallback(response) {
                    },
                    function errorCallback(response) {
                        debugger;
                        console.error("Failed during sign-out process at UserSessionController:signUpButtonHandler.");
                    }
            );
            console.log("Cleaning all local session data.");
            Cookies.remove("loggedUser", {path: window.location.pathname});
            Cookies.remove("sessionToken", {path: window.location.pathname});
            Cookies.remove("currentUserID", {path: window.location.pathname});

            delete $scope.userInfo.email;
            delete $scope.userInfo.user_id;

            $state.go('signin');
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess); //Notify all the other controllers that user has signed in
        };

        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        $scope.userInfo = {
            email: Cookies.get("loggedUser")
        };
        this.getCurrentUserDetails();
    });

    app.controller('UserListController', function ($state, $rootScope, $scope, $http, $dialogs, $uibModal, UserList) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------

        /**
         * This function retrieves all the users registered in the system
         * @param {type} group, limit the search to "user's" users (not used)
         * @param {type} force
         * @returns this
         */
        this.retrieveUsersData = function (force) {
            $scope.isLoading = true;

            if (UserList.getOld() > 1 || force) { //Max age for data 5min.
                $http($rootScope.getHttpRequestConfig("POST", "user-list", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams()
                })).then(
                        function successCallback(response) {
                            $scope.isLoading = false;
                            $scope.users = UserList.setUsers(response.data).getUsers();
                            $scope.filteredUsers = $scope.users.length;
                        },
                        function errorCallback(response) {
                            $scope.isLoading = false;

                            debugger;
                            var message = "Failed while retrieving the users list.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at UserListController:retrieveUsersData."
                            });
                            console.error(response.data);
                        }
                );
            } else {
                $scope.users = UserList.getUsers();
                $scope.filteredUsers = $scope.users.length;
                $scope.isLoading = false;
            }

            return this;
        };


        /**
         * This function defines the behaviour for the "filterUsers" function.
         * Given a item (user) and a set of filters, the function evaluates if
         * the current item contains the set of filters within the different attributes
         * of the model.
         *
         * @returns {Boolean} true if the model passes all the filters.
         */
        $scope.filterUsers = function () {
            $scope.filteredUsers = 0;
            $scope.username = $scope.username || Cookies.get("loggedUser");
            return function (item) {
                if ($scope.show === "my_users") {

                    var filterAux, item_tags;
                    for (var i in $scope.filters) {
                        filterAux = $scope.filters[i].toLowerCase();
                        item_tags = item.tags.join("");
                        if (!((item.name.toLowerCase().indexOf(filterAux)) !== -1 || (item_tags.toLowerCase().indexOf(filterAux)) !== -1)) {
                            return false;
                        }
                    }
                    $scope.filteredUsers++;
                    return true;
                }
            };
        };

        $scope.isSelectedUser = function (user) {
            if ($scope.models !== null) {
                for (var i in $scope.models) {
                    if ($scope.models[i].user_id === user.user_id) {
                        return true;
                    }
                }
            }
            return false;
        };

        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------
        /**
         * This function handles the event when clicking on the "Choose users" button
         * in a "User selector" field.
         * @returns this;
         */
        this.changeSelectedUsersButtonHandler = function () {
            $scope.isDialog = true;

            $scope.browseDialog = $uibModal.open({
                templateUrl: 'app/users/user-list.tpl.html',
                controller: 'UserListController',
                controllerAs: 'controller',
                scope: $scope
            });

            return this;
        };


        this.closeBrowseDialogHandler = function () {
            $scope.browseDialog.dismiss("cancel");
            delete $scope.browseDialog;
        };
        /**
         * This function handles the event when clicking on the "Add user" button
         * in the "User list" table.
         * @param {User} user the user to be added
         * @returns this;
         */
        this.addSelectedUser = function (user) {
            if ($scope.models !== null) {
                for (var i in $scope.models) {
                    if ($scope.models[i].user_id === user.user_id) {
                        return this;
                    }
                }
                $scope.models.push(user);
            }
            return this;
        };
        /**
         * This function handles the event when clicking on the "Remove user" button
         * in the "User list" table.
         * @param {User} user the user to be removed
         * @returns this;
         */
        this.removeSelectedUser = function (user) {
            if ($scope.models !== null) {
                for (var i in $scope.models) {
                    if ($scope.models[i].user_id === user.user_id) {
                        $scope.models.splice(i, 1);
                        return this;
                    }
                }
            }
            return this;
        };
        /**
         * This function applies the filters when the user clicks on "Search"
         */
        this.applySearchHandler = function () {
            var filters = arrayUnique($scope.filters.concat($scope.searchFor.split(" ")));
            $scope.filters = UserList.setFilters(filters).getFilters();
        };

        /**
         * This function remove a given filter when the user clicks at the "x" button
         */
        this.removeFilterHandler = function (filter) {
            $scope.filters = UserList.removeFilter(filter).getFilters();
        };


        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        var me = this;

        //This controller uses the UserList, which defines a Singleton instance of
        //a list of users + list of tags + list of filters. Hence, the application will not
        //request the data everytime that the user list panel is displayed (data persistance).
        $scope.users = UserList.getUsers();
        $scope.filters = UserList.getFilters();
        $scope.filteredUsers = $scope.users.length;

        if ($scope.users.length === 0) {
            this.retrieveUsersData();
        }
    });
})();
