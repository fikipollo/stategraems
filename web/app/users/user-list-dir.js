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
    var app = angular.module('users.directives.user-list', [
        'ui.bootstrap',
        'users.controllers.user-session'
    ]);

    app.service('UserSelectionModal', function ($uibModal, $rootScope, UserList) {
        function loadAllUsers() {
            //TODO
            return null;
        }

        return function () {
            var instance = $uibModal.open({
                templateUrl: 'app/users/user-list.tpl.html'
            });

            return instance.result.then(loadAllUsers);
        };
    });


    app.directive("userSelectorField", function () {
        return {
            restrict: 'E',
            replace: true,
            template:
                    '<div ng-controller="UserListController as controller">' +
                    '   <div class="bootstrap-tagsinput" style="min-width:200px; min-height: 30px;">'+
                    '     <span class="tag label label-info" ng-repeat="user in models">'+
                    '       {{user.user_id}} <i class="fa fa-times" style="cursor:pointer;" ng-show="viewMode !== \'view\'" ng-click="controller.removeSelectedUser(user)";></i>' + 
                    '     </span>' + 
                    '   </div>'+
                    '   <a class="btn btn-default" ng-show="viewMode !== \'view\'" ng-click="controller.changeSelectedUsersButtonHandler();">' +
                    '      <i class="fa fa-plus" aria-hidden="true"></i> Choose users' +
                    '   </a>' +
                    '</div>'
        };
    });

})();
