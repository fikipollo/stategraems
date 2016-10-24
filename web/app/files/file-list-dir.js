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
 * - file-list
 * - outputFilesSelectorField
 * - inputFilesSelectorField
 *
 */
(function () {
    var app = angular.module('files.directives.file-list', [
        'ui.bootstrap',
        'analysis.services.analysis-list',
        'files.services.file-list'
    ]);

    app.directive("filesTree", function ($compile, FileList) {
        return {
            restrict: 'E',
            replace: true,
            link: function ($scope, element, attrs) {
                $scope.$watch('filesTree', function (newValues, oldValues) {

                    var template = 
                            '<div ng-controller="FileListController as controller">' +
                            '   <div id="files-tree-container" ng-show="(!filters || filters.length < 1)" style="min-width:200px; min-height: 330px;"></div>' +
                            '   <div ng-show="(filters && filters.length > 0)" style="min-width:200px; min-height: 330px;"></div>' +
                            '</div>';

                    element.html(template);
                    $compile(element.contents())($scope);
                    
                    $('#files-tree-container').treeview({data: [$scope.filesTree]});
                }, true);
            }
        }
    });

    app.directive("outputFilesSelectorField", function () {
        return {
            restrict: 'E',
            replace: true,
            template:
                    '<div ng-controller="FileListController as controller">' +
                    '   <div style="min-width:200px; min-height: 30px;">' +
                    '       <div ng-repeat="file in models" class="fileLocationItem"> {{file}}</div>' +
                    '   </div>' +
                    '   <a class="btn btn-default" ng-show="viewMode !== \'view\'" ng-click="controller.changeSelectedFilesButtonHandler();" style="margin-top:20px;">' +
                    '      <i class="fa fa-plus" aria-hidden="true"></i> Change output files' +
                    '   </a>' +
                    '</div>'
        };
    });

    app.directive("inputFilesSelectorField", function ($compile, AnalysisList) {
        return {
            restrict: 'E',
            replace: true,
            link: function ($scope, element, attrs) {
                $scope.$watch('model.used_data', function (newValues, oldValues, scope) {

                    var template =
                            '<div ng-controller="StepDetailController as controller">' +
                            '   <div style="min-width:200px; min-height: 30px;">';

                    for (var i in $scope.model.used_data) {
                        template +=
                                '       <div class="fileLocationItem">{{file}}' +
                                '         <b>Output files for step ' + $scope.model.used_data[i] + '</b>' +
                                '         <ul>';

                        var step = AnalysisList.findStep($scope.model.used_data[i]);
                        if (step) {
                            for (var j in step.files_location) {
                                template += '         <li>' + step.files_location[j] + '</li>';
                            }
                        }

                        template +=
                                '         </ul>' +
                                '       </div>';
                    }
                    template +=
                            '   </div>' +
                            '   <a class="btn btn-default" ng-show="viewMode !== \'view\'" ng-click="controller.changeInputFilesHandler();">' +
                            '      <i class="fa fa-plus" aria-hidden="true"></i> Choose input files' +
                            '   </a>' +
                            '</div>';
                    element.html(template);
                    $compile(element.contents())($scope);
                }, true);
            }
        };
    });

})();
