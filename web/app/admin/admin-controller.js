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
    var app = angular.module('admin.controllers', [
        'ang-dialogs',
        'ui.router',
        'admin.directives.admin-directives',
        'ui.bootstrap',
        'external-sources-controllers',
    ]);

    app.controller('AdminController', function ($state, $rootScope, $scope, $http, $uibModal, $dialogs, APP_EVENTS) {
        //--------------------------------------------------------------------
        // CONTROLLER FUNCTIONS
        //--------------------------------------------------------------------
        //
        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------
        this.sendBackupRequestHandler = function () {
            $http($rootScope.getHttpRequestConfig("POST", "admin-rest", {
                headers: {'Content-Type': 'application/json'},
                extra: 'backup'
            })).then(
                    function successCallback(response) {
                        $dialogs.showSuccessDialog("Backup successfully created!");
                        var file_content = response.data;

                        var saveByteArray = (function () {
                            var a = document.createElement("a");
                            document.body.appendChild(a);
                            a.style = "display: none";
                            return function (data, name) {
                                var blob = new Blob(data, {type: "octet/stream"}),
                                        url = window.URL.createObjectURL(blob);
                                a.href = url;
                                a.download = name;
                                a.click();
                                window.URL.revokeObjectURL(url);
                            };
                        }());
                        var filename = response.headers("content-disposition").replace("filename=", "").replace(/\"/g, "");
                        saveByteArray([file_content], filename);

                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while creating the backup for databases.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at UserSessionController:sendBackupRequestHandler."
                        });
                        console.error(response.data);
                    }
            );
        };

        //--------------------------------------------------------------------
        // INITIALIZATION
        //--------------------------------------------------------------------
    });
})();
