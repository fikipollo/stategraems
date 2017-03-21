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
 * - workflow-list
 *
 */
(function () {
    var app = angular.module('users.directives.user-session', [
        'ui.bootstrap',
        'users.controllers.user-session'
    ]);

    app.service('loginModal', function ($uibModal, $rootScope) {
        function assignCurrentUser(user) {
            $rootScope.currentUser = userF;
            return user;
        }

        return function () {
            var instance = $uibModal.open({
                templateUrl: 'app/users/user-sign-in.tpl.html'
            })

            return instance.result.then(assignCurrentUser);
        };
    });

    app.directive("sessionToolbar", function () {
        return {
            restrict: 'E',
            replace: true,
            template:
                    '      <div class="sessionToolbar" ng-controller="UserSessionController as controller">' +
                    '        <div class="dropdown" ng-show="userInfo.email !== undefined">' +
                    '          <button class="btn btn-default dropdown-toggle" id="dropdownMenu1" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                    '            <i class="fa fa-user" aria-hidden="true"></i> {{userInfo.email}}' +
                    '            <span class="caret"></span>' +
                    '          </button>' +
                    '          <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">' +
                    '            <li class="dropdown-header">Signed in as <b>{{userInfo.email}}</b></li>' +
                    '            <li><a ng-click="controller.signOutButtonHandler()" class="clickable">Sign out</a></li>' +
                    // '            <li role="separator" class="divider"></li>' +
                    // '            <li><a href="' + EMS_SERVER_URL + '" target="_blank">Go to Galaxy site</a></li>' +
                    '          </ul>' +
                    '        </div>' +
                    '      </div>'
        };
    });

    app.directive('ngPwcheck', [function () {
            return {
                require: 'ngModel',
                link: function (scope, elem, attrs, ctrl) {
                    var firstPassword = '#' + attrs.ngPwcheck;
                    elem.on('keyup', function () {
                        scope.$apply(function () {
                            var v = elem.val() === $(firstPassword).val();
                            ctrl.$setValidity('pwmatch', v);
                        });
                    });
                    $(firstPassword).on('keyup', function () {
                        scope.$apply(function () {
                            var v = elem.val() === $(firstPassword).val();
                            ctrl.$setValidity('pwmatch', v);
                        });
                    });
                }
            }
        }]);

    app.directive("userSessionInfoPanel", function () {
        return {
            restrict: 'E',
            replace: true,
            template:
                    ' <div class="panel panel-container" ng-controller="UserSessionController as controller">' +
                    '   <h4>Your account</h4>' +
                    '   <p><b>Signed in as </b> <i>{{userInfo.email}}</i></p>' +
                    '   <a class="clickable" ng-click="controller.changePasswordButtonHandler()"><i class="fa fa-key fa-fw"></i> Change password</a>' +
                    '  <div style="text-align: center;margin-top:10px;">' +
                    '    <a class="btn btn-primary btn-sm" style="display: inline-block;margin: auto;" ng-click="controller.getAPICodeHandler()"><i class="fa fa-android fa-fw"></i> Get API code</a>' +
                    '    <a class="btn btn-danger btn-sm" style="display: inline-block; margin: auto;" ng-click="controller.signOutButtonHandler()"><i class="fa fa-sign-out fa-fw"></i> Close session</a>' +
                    '  </div>' +
                    ' </div>'
        };
    });

    app.directive("userAdminToolsPanel", function () {
        return {
            restrict: 'E',
            replace: true,
            template:
                    ' <div ng-show="userInfo.role === \'admin\'" ng-controller="UserSessionController as controller">' +
                    '  <h4>Admin tools</h4>' +
                    '  <div class="panel panel-container" style="text-align: center;margin-top:10px;">' +
//                    '   <a class="btn btn-default homeMainButton" ng-click="controller.showUserManagementTool()">' +
//                    '       <i class="fa fa-users fa-5" aria-hidden="true" ></i><p>Manage users</p>' +
//                    '   </a>' +
                    '   <a class="btn btn-default homeMainButton" >' +
                    '       <i class="fa fa-database fa-5" aria-hidden="true" ng-click="controller.sendBackupRequestHandler()"></i><p>Backup DB</p>' +
                    '   </a>' +
                    '  </div>' +
                    ' </div>'
        };
    });
})();
