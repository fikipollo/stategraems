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
 * - UserSessionController
 * - UserListController
 */
(function () {
    var app = angular.module('users.controllers.user-session', [
        'ang-dialogs',
        'ui.router',
        'users.services.user-list',
        'ui.bootstrap'
    ]);

    app.controller('UserSessionController', function ($state, $rootScope, $scope, $http, $uibModal, $dialogs, APP_EVENTS) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------
        this.getCurrentUserDetails = function () {
            if (!Cookies.get("session")) {
                return;
            }

            $http($rootScope.getHttpRequestConfig("GET", "user-rest", {
                headers: {'Content-Type': 'application/json'},
                extra: $rootScope.getCredentialsParams()["loggedUserID"]
            })).then(
                    function successCallback(response) {
                        $scope.userInfo.email = response.data.email;
                        $scope.userInfo.user_id = response.data.user_id;
                        $scope.userInfo.role = response.data.role;
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
        $scope.$on(APP_EVENTS.loginSuccess, function (event, args) {
            $scope.userInfo.email = $rootScope.getCredentialsParams()["loggedUser"];
        });

        $scope.$on(APP_EVENTS.logoutSuccess, function (event, args) {
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
                $http($rootScope.getHttpRequestConfig("POST", "user-rest", {
                    headers: {'Content-Type': 'application/json'},
                    extra: "session",
                    data: {
                        email: $scope.userInfo.email,
                        password: $scope.userInfo.password
                    }
                })).then(
                        function successCallback(response) {
                            //CLEAN PREVIOUS COOKIES
                            Cookies.remove("session", {path: window.location.pathname});
                            Cookies.remove("loggedUserID", {path: window.location.pathname});

                            $scope.userInfo.email = response.data.email;
                            $scope.userInfo.user_id = response.data.user_id;
                            $scope.userInfo.apicode = btoa(response.data.email + ":" + response.data.sessionToken);
                            $scope.userInfo.role = response.data.role;

                            //SET THE COOKIES
                            Cookies.set("session", $scope.userInfo.apicode, {expires: 1, path: window.location.pathname});
                            Cookies.set("loggedUserID", $scope.userInfo.user_id, {expires: 1, path: window.location.pathname});
                            if (response.data.last_experiment_id !== undefined) {
                                Cookies.set("currentExperimentID", response.data.last_experiment_id, {expires: 1, path: window.location.pathname});
                            }

                            delete $scope.userInfo.password;
                            delete $scope.signForm;

                            //Notify all the other controllers that user has signed in
                            $rootScope.$broadcast(APP_EVENTS.loginSuccess);

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
        };

        this.signUpButtonHandler = function () {
            if ($scope.userInfo.email !== '' && $scope.userInfo.user_id !== '' && $scope.userInfo.password !== '' && $scope.userInfo.password === $scope.userInfo.passconfirm) {
                $http($rootScope.getHttpRequestConfig("POST", "user-rest", {
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        email: $scope.userInfo.email,
                        user_id: $scope.userInfo.user_id,
                        password: $scope.userInfo.password
                    }}
                )).then(
                        function successCallback(response) {
                            if (response.data.success) {
                                $dialogs.showSuccessDialog("Your account has been created!");
                                $scope.isLogin = true;
                            } else {
                                $dialogs.showErrorDialog("Failed when creating new account: " + response.data.reason);
                            }

                            delete $scope.userInfo.password;
                            delete $scope.userInfo.passconfirm;
                            delete $scope.signForm;

                            Cookies.remove("session", {path: window.location.pathname});
                            Cookies.remove("loggedUserID", {path: window.location.pathname});
                            Cookies.remove("currentExperimentID", {path: window.location.pathname});

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
            var cleanSessionData = function () {
                console.log("Cleaning all local session data.");
                Cookies.remove("session", {path: window.location.pathname});
                Cookies.remove("loggedUserID", {path: window.location.pathname});
                Cookies.remove("currentExperimentID", {path: window.location.pathname});

                delete $scope.userInfo.email;
                delete $scope.userInfo.user_id;

                $state.go('signin');
                $rootScope.$broadcast(APP_EVENTS.logoutSuccess); //Notify all the other controllers that user has signed in
            };
            $http($rootScope.getHttpRequestConfig("DELETE", "user-rest", {
                headers: {'Content-Type': 'application/json'},
                extra: "session"
            })).then(
                    function successCallback(response) {
                        cleanSessionData();
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed during logout process.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at UserSessionController:signOutButtonHandler."
                        });
                        console.error(response.data);

                        cleanSessionData();
                    }
            );
        };

        this.changePasswordButtonHandler = function () {
            $scope.checkPasswords = function () {
                if ($scope.newpass.newpass.length < 6) {
                    $scope.newpass.error = "Password must be at least 6 characters.";
                } else if ($scope.newpass.newpass === $scope.newpass.repeatpass) {
                    delete $scope.newpass.error;
                    return true;
                } else {
                    $scope.newpass.error = "Passwords do not match.";
                }
                return false;
            };
            $scope.closeDialog = function (option) {
                if (option === 'ok') {
                    if ($scope.checkPasswords()) {
                        modalInstance.close();
                    }
                } else {
                    modalInstance.dismiss();
                }
            };
            $scope.newpass = {
                newpass: "",
                repeatpass: ""
            };

            var modalInstance = $uibModal.open({
                template: '' +
                        '<div class="modal-header">' +
                        '   <h3 class="modal-title" id="modal-title">Change password</h3>' +
                        '</div>' +
                        '<div class="modal-body" id="modal-body">' +
                        '<form class="form-inline">' +
                        '  <div class="form-group">' +
                        '    <label  for="newpass">New password:</label>' +
                        '    <input type="password" ng-model="newpass.newpass" ng-change="checkPasswords()" class="form-control" id="newpass">' +
                        '  </div>' +
                        '  <div class="form-group">' +
                        '    <label for="newpass">Repeat:</label>' +
                        '    <input type="password" ng-model="newpass.repeatpass" ng-change="checkPasswords()" class="form-control" id="repeatpass">' +
                        '  </div>' +
                        '  <p class="text-danger" ng-show="newpass.error">{{newpass.error}}</p>' +
                        '</form>' +
                        '</div>' +
                        '<div class="modal-footer">' +
                        '   <a class="btn btn-success" ng-click="closeDialog(\'ok\');">Change password</a>' +
                        '   <a class="btn btn-danger" ng-click="closeDialog();">Cancel</a>' +
                        '</div>',
                scope: $scope
            });


            modalInstance.result.then(function () {
                $http($rootScope.getHttpRequestConfig("PUT", "user-rest", {
                    headers: {'Content-Type': 'application/json'},
                    extra: $rootScope.getCredentialsParams()["loggedUserID"],
                    data: {newpass: btoa($scope.newpass.newpass)}
                })).then(
                        function successCallback(response) {
                            $dialogs.showSuccessDialog("Password successfully updated!");
                        },
                        function errorCallback(response) {
                            debugger;
                            var message = "Failed while changing the password.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at UserSessionController:changePasswordButtonHandler."
                            });
                            console.error(response.data);
                        }
                );

                delete $scope.checkPasswords;
                delete $scope.closeDialog;
                delete $scope.newpass;
            }, function () {
                delete $scope.checkPasswords;
                delete $scope.closeDialog;
                delete $scope.newpass;
            });


        };

        this.getAPICodeHandler = function () {
            $dialogs.showInfoDialog("Your API code is " + Cookies.get("session"), {title: "API code"});
        };

        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        $scope.userInfo = {
            email: $rootScope.getCredentialsParams()["loggedUser"]
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
                $http($rootScope.getHttpRequestConfig("GET", "user-rest", {
                    headers: {'Content-Type': 'application/json'}
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
            $scope.username = $scope.username || $rootScope.getCredentialsParams()["loggedUser"];
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
