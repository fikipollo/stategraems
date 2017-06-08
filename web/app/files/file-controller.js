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
                $http($rootScope.getHttpRequestConfig("GET", "file-rest", {
                    headers: {'Content-Type': 'application/json'}
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
                $scope.filters = FileList.getFilters();
                $scope.filteredFiles = $scope.files.length;
                $scope.filesTree = FileList.getFilesTree();
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
        this.selectNewFileHandler = function () {
            $('#uploadFileSelector').click();
        };

        this.uploadFileHandler = function (nItem) {
            this.removeAllowed = false;

            if (nItem === undefined) {
                nItem = 0;
            }

            if ($scope.uploadFiles === undefined) {
                this.removeAllowed = true;
                return;
            }

            if (nItem === $scope.uploadFiles.length) {
                //Notify all the other controllers that history-list has changed
                this.removeAllowed = true;
                me.retrieveFilesData(true);
                return;
            }

            var file = $scope.uploadFiles[nItem];

            if (file.state !== "pending") {
                this.removeAllowed = true;
                me.uploadFileHandler(nItem + 1);
                return;
            }

            var formData = new FormData();
            formData.append('file_data', file);
            file.state = "uploading";

            $http($rootScope.getHttpRequestConfig("POST", "file-rest", {
                data: formData,
                headers: {'Content-Type': undefined},
                config: {
                    transformRequest: angular.identity,
                }
            })).then(
                    function successCallback(response) {
                        file.state = "done";
                        me.uploadFileHandler(nItem + 1);
                    },
                    function errorCallback(response) {
                        file.state = "error";
                        me.uploadFileHandler(nItem + 1);
                        debugger;
                        console.error("Error while uploading a new file at FileListController:uploadFileHandler.");
                        console.error(response);
                    }
            );
        };

        this.deleteToUploadFileHandler = function (selectedItem) {
            $('#uploadFileSelector').val("");
            for (var i in $scope.uploadFiles) {
                if ($scope.uploadFiles[i] === selectedItem) {
                    $scope.uploadFiles.splice(i, 1);
                    return;
                }
            }
        };

        $scope.deleteFileHandler = function (event) {
            var node = event.data;
            var name = node.text;
            var parent = $('#files-tree-container').data('treeview').getParent(node.nodeId);
            while (parent !== undefined) {
                name = parent.text + "/" + name;
                parent = $('#files-tree-container').data('treeview').getParent(parent.nodeId);
            }

            me.deleteFileHandler("/" + name);
        };

        this.deleteFileHandler = function (selectedFile) {
            var sendRemoveRequest = function (option) {
                if (option === "ok") {
                    $http($rootScope.getHttpRequestConfig("DELETE", "file-rest", {
                        extra: "file",
                        params: {filename: selectedFile}
                    })).then(
                            function successCallback(response) {
                                me.retrieveFilesData(true);
                            },
                            function errorCallback(response) {
                                $scope.isLoading = false;

                                debugger;
                                var message = "Failed while deleting the file.";
                                $dialogs.showErrorDialog(message, {
                                    logMessage: message + " at FileListController:downloadFileHandler."
                                });
                                console.error(response.data);
                            }
                    );
                }
            };
            var fileName = selectedFile.substring(selectedFile.lastIndexOf("/") + 1, selectedFile.length);
            $dialogs.showConfirmationDialog("Are you sure that you want to permanently delete \"" + fileName + "\"? If you delete a file, it is permanently lost.", {title: "Remove the selected file?", callback: sendRemoveRequest});
        };

        $scope.downloadFileHandler = function (event) {
            var node = event.data;
            var name = node.text;
            var parent = $('#files-tree-container').data('treeview').getParent(node.nodeId);
            while (parent !== undefined) {
                name = parent.text + "/" + name;
                parent = $('#files-tree-container').data('treeview').getParent(parent.nodeId);
            }

            me.downloadFileHandler("/" + name);
        };

        this.downloadFileHandler = function (selectedFile) {
            var config = $rootScope.getHttpRequestConfig("GET", "file-rest", {
                extra: "file",
                params: {filename: selectedFile}
            })

            var a = document.createElement("a");
            a.href = config.url + "?filename=" + selectedFile;
            a.target = "_blank";
            a.click();
//            
//            
//            $http($rootScope.getHttpRequestConfig("GET", "file-rest", {
//                extra: "file",
//                params: {: }
//            })).then(
//                    function successCallback(response) {
//                        var file_content = response.data;
//
//                        var saveByteArray = (function () {
//                            document.body.appendChild(a);
//                            a.style = "display: none";
//                            return function (data, name) {
//                                var blob = new Blob(data, {type: "octet/stream"}),
//                                        url = window.URL.createObjectURL(blob);
//                                a.href = url;
//                                a.download = name;
//                                a.click();
//                                window.URL.revokeObjectURL(url);
//                            };
//                        }());
//                        var filename = response.headers("content-disposition").replace("filename=", "").replace(/\"/g, "");
//                        saveByteArray([file_content], filename);
//                    },
//                    function errorCallback(response) {
//                        $scope.isLoading = false;
//
//                        debugger;
//                        var message = "Failed while downloading the file.";
//                        $dialogs.showErrorDialog(message, {
//                            logMessage: message + " at FileListController:downloadFileHandler."
//                        });
//                        console.error(response.data);
//                    }
//            );
        };
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

        this.updateFileSelectionHandler = function () {
            var selectedNodes = $('#files-tree-container').data('treeview').getChecked();
            //Ignore directories from selection
            var selection = [];
            for (var i in $scope.models) {
                selection.push($scope.models[i]);
            }

            for (var i in selectedNodes) {
                if (selectedNodes[i].nodes === undefined) {
                    var name = selectedNodes[i].text;
                    var parent = $('#files-tree-container').data('treeview').getParent(selectedNodes[i].nodeId);
                    while (parent !== undefined) {
                        name = parent.text + "/" + name;
                        parent = $('#files-tree-container').data('treeview').getParent(parent.nodeId);
                    }
                    selection.push(name);
                }
            }
            selection = arrayUnique(selection);
            $scope.models.length = 0;
            for (var i in selection) {
                $scope.models.push(selection[i]);
            }

            return this;
        };

        /**
         * This function applies the filters when the file clicks on "Search"
         */
        this.applySearchHandler = function () {
            $('#files-tree-container').data('treeview').search($scope.searchFor.search, {
                ignoreCase: true, // case insensitive
                exactMatch: false, // like or equals
                revealResults: true, // reveal matching nodes
            });
        };
        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
        var me = this;

        $scope.files = FileList.getFiles();
        $scope.filters = FileList.getFilters();
        $scope.filteredFiles = $scope.files.length;
        $scope.filesTree = FileList.getFilesTree();
        $scope.uploadFiles = [];

        //This controller uses the FileList, which defines a Singleton instance of
        //a list of files + list of tags + list of filters. Hence, the application will not
        //request the data everytime that the file list panel is displayed (data persistance).
        if ($scope.isDialog === true) {
            $scope.searchFor = {search: ""};
            this.retrieveFilesData();
        }

    });
})();
