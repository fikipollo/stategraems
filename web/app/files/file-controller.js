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
 * - FileSessionController
 * - FileListController
 */
(function () {
    var app = angular.module('files.controllers', [
        'ang-dialogs',
        'ui.router',
        'files.services.file-list',
        'ui.bootstrap'
    ]);

    app.controller('FileListController', function ($state, $rootScope, $scope, $http, $dialogs, $uibModal, FileList) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------

        /**
         * This function retrieves all the files registered in the system
         * @param {type} group, limit the search to "file's" files (not used)
         * @param {type} force
         * @returns this
         */
        this.retrieveFilesData = function (force) {
            $scope.isLoading = true;

            if (FileList.getOld() > 1 || force) { //Max age for data 5min.
                $http($rootScope.getHttpRequestConfig("POST", "file-list", {
                    headers: {'Content-Type': 'application/json'},
                    data: $rootScope.getCredentialsParams()
                })).then(
                        function successCallback(response) {
                            $scope.isLoading = false;
                            $scope.filesTree = FileList.setFilesTree(response.data).getFilesTree();
                            $scope.files = FileList.getFiles();
                            $scope.filteredFiles = $scope.files.length;
                        },
                        function errorCallback(response) {
                            $scope.isLoading = false;

                            debugger;
                            var message = "Failed while retrieving the files list.";
                            $dialogs.showErrorDialog(message, {
                                logMessage: message + " at FileListController:retrieveFilesData."
                            });
                            console.error(response.data);
                        }
                );
            } else {
                $scope.files = FileList.getFiles();
                $scope.filteredFiles = $scope.files.length;
                $scope.isLoading = false;
            }

            return this;
        };


        /**
         * This function defines the behaviour for the "filterFiles" function.
         * Given a item (file) and a set of filters, the function evaluates if
         * the current item contains the set of filters within the different attributes
         * of the model.
         *
         * @returns {Boolean} true if the model passes all the filters.
         */
        $scope.filterFiles = function () {
            $scope.filteredFiles = 0;
            return function (item) {
                var filterAux, item_tags;
                for (var i in $scope.filters) {
                    filterAux = $scope.filters[i].toLowerCase();
                    item_tags = item.tags.join("");
                    if (!((item.name.toLowerCase().indexOf(filterAux)) !== -1 || (item_tags.toLowerCase().indexOf(filterAux)) !== -1)) {
                        return false;
                    }
                }
                $scope.filteredFiles++;
                return true;
            };
        };

        $scope.isSelectedFile = function (file) {
            if ($scope.models !== null) {
                for (var i in $scope.models) {
                    if ($scope.models[i].file_id === file.file_id) {
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
         * This function handles the event when clicking on the "Choose files" button
         * in a "File selector" field.
         * @returns this;
         */
        this.changeSelectedFilesButtonHandler = function () {
            $scope.isDialog = true;

            $scope.browseDialog = $uibModal.open({
                templateUrl: 'app/files/file-list.tpl.html',
                size: 'lg',
                controller: 'FileListController',
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
         * This function handles the event when clicking on the "Add file" button
         * in the "File list" table.
         * @param {File} file the file to be added
         * @returns this;
         */
        this.addSelectedFile = function (file) {
            if ($scope.models !== null) {
                for (var i in $scope.models) {
                    if ($scope.models[i].file_id === file.file_id) {
                        return this;
                    }
                }
                $scope.models.push(file);
            }
            return this;
        };
        /**
         * This function handles the event when clicking on the "Remove file" button
         * in the "File list" table.
         * @param {File} file the file to be removed
         * @returns this;
         */
        this.removeSelectedFile = function (file) {
            if ($scope.models !== null) {
                for (var i in $scope.models) {
                    if ($scope.models[i].file_id === file.file_id) {
                        $scope.models.splice(i, 1);
                        return this;
                    }
                }
            }
            return this;
        };

        this.addManualLocationsHandler = function (manual_entries) {
            if ($scope.models !== null && manual_entries !== "") {
                var entries = manual_entries.split("\n");
                for (var i in entries) {
                    $scope.models.push(entries[i]);
                }
            }
            return this;
        };

        /**
         * This function applies the filters when the file clicks on "Search"
         */
        this.applySearchHandler = function () {
            var filters = arrayUnique($scope.filters.concat($scope.searchFor.split(" ")));
            $scope.filters = FileList.setFilters(filters).getFilters();
        };

        /**
         * This function remove a given filter when the file clicks at the "x" button
         */
        this.removeFilterHandler = function (filter) {
            $scope.filters = FileList.removeFilter(filter).getFilters();
        };


        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        var me = this;

        //This controller uses the FileList, which defines a Singleton instance of
        //a list of files + list of tags + list of filters. Hence, the application will not
        //request the data everytime that the file list panel is displayed (data persistance).
        if ($scope.isDialog === true) {
            $scope.files = FileList.getFiles();
            $scope.filters = FileList.getFilters();
            $scope.filteredFiles = $scope.files.length;

            if ($scope.files.length === 0) {
                this.retrieveFilesData();
            }
        }
    });
})();
