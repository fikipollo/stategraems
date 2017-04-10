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
 *     Rafael Hernandez de Diego
 *     rhernandez@cipf.es
 *     Ana Conesa Cegarra
 *     aconesa@cipf.es
 *
 * THIS FILE CONTAINS THE FOLLOWING MODULE DECLARATION
 * - ExternalSourceListController
 * -
 *
 */
(function () {
    var app = angular.module('external-sources-controllers', [
        'ang-dialogs',
        'ui.bootstrap',
        'external-sources.services.external-sources-list'
    ]);

    app.controller('ExternalSourceListController', function ($rootScope, $scope, $http, $dialogs, $state, $interval, $uibModal, APP_EVENTS, ExternalSourceList) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------
        this.retrieveExternalSourcesListData = function (force, callback_caller, callback_function) {
            $scope.isLoading = true;

            if (ExternalSourceList.getOld() > 1 || force) { //Max age for data 5min.
                $http($rootScope.getHttpRequestConfig("GET", "external-sources-rest", {})).
                        then(
                                function successCallback(response) {
                                    $scope.isLoading = false;
                                    $scope.externalSources = ExternalSourceList.setExternalSources(response.data).getExternalSources();

                                    if (callback_function !== undefined) {
                                        callback_caller[callback_function]();
                                    }
                                },
                                function errorCallback(response) {
                                    $scope.isLoading = false;

                                    debugger;
                                    var message = "Failed while retrieving the externalSources list.";
                                    $dialogs.showErrorDialog(message, {
                                        logMessage: message + " at ExternalSourceListController:retrieveExternalSourcesListData."
                                    });
                                    console.error(response.data);
                                }
                        );
            } else {
                $scope.externalSources = ExternalSourceList.getExternalSources();
                $scope.isLoading = false;
            }
        };

        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------
        this.editExternalSourceHandler = function (externalSource) {
            $scope.model = externalSource;
            this.addNewExternalSourceHandler(true);
        }

        this.addNewExternalSourceHandler = function (isUpdate) {
            $scope.isUpdate = isUpdate;
            var modalInstance = $uibModal.open({
                controller: 'ExternalSourceController',
                controllerAs: 'controller',
                size: 'md',
                scope: $scope,
                templateUrl: "app/admin/external-source-details.tpl.html"
            });

            modalInstance.result.then(function (selectedItem) {
                delete $scope.model;
                delete $scope.isUpdate;
                me.retrieveExternalSourcesListData(true);
            }, function () {
                delete $scope.model;
                delete $scope.isUpdate;
                me.retrieveExternalSourcesListData(true);
            });
        };

        this.deleteExternalSourceHandler = function (externalSource) {
            var sendRemoveRequest = function (option) {
                if (option === "ok") {
                    $http($rootScope.getHttpRequestConfig("DELETE", "external-sources-rest", {
                        extra: externalSource.source_id
                    })).then(
                            function successCallback(response) {
                                if (response.data.success) {
                                    me.retrieveExternalSourcesListData(true);
                                }
                            },
                            function errorCallback(response) {
                                $scope.isLoading = false;

                                debugger;
                                var message = "Failed while deleting the external source.";
                                $dialogs.showErrorDialog(message, {
                                    logMessage: message + " at ExternalSourceListController:deleteExternalSourceHandler."
                                });
                                console.error(response.data);
                            }
                    );
                }
            }
            $dialogs.showConfirmationDialog("Are you sure?", {title: "Remove the selected external source?", callback: sendRemoveRequest});
        };

        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        var me = this;
        $scope.externalSources = ExternalSourceList.getExternalSources();
        this.retrieveExternalSourcesListData(true);
    });

    app.controller('ExternalSourceController', function ($rootScope, $scope, $http, $dialogs, $uibModalInstance, APP_EVENTS, ExternalSourceList) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------

        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------
        this.saveExternalSourceDetailsHandler = function () {
            $http($rootScope.getHttpRequestConfig(($scope.isUpdate ? "PUT" : "POST"), "external-sources-rest", {
                data: {
                    external_source_json_data: $scope.model
                },
                extra: ($scope.isUpdate ? $scope.model.source_id : "")
            })).then(
                    function successCallback(response) {
                        $dialogs.showSuccessDialog("External source succesfully saved.");
                        $uibModalInstance.dismiss('cancel');
                    },
                    function errorCallback(response) {
                        $scope.isLoading = false;

                        debugger;
                        var message = "Failed while saving the external source.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at ExternalSourceListController:saveExternalSourceDetailsHandler."
                        });
                        console.error(response.data);
                    }
            );
        };

        this.closeExternalSourceDetailsHandler = function () {
            $uibModalInstance.dismiss('cancel');
        };

        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        var me = this;

        if (!$scope.model) {
            $scope.model = {
            };
        }

    });
})();
