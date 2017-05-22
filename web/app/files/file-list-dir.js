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
                            '   <div id="files-tree-container" class="files-tree-container" ng-show="(!filters || filters.length < 1)" ></div>' +
                            '   <div ng-show="(filters && filters.length > 0)" style="min-width:200px; min-height: 330px;"></div>' +
                            '</div>';

                    element.html(template);
                    $compile(element.contents())($scope);

                    $('#files-tree-container').treeview({
                        data: [$scope.filesTree],
                        showCheckbox: true,
                        expandIcon: "glyphicon glyphicon-triangle-right tree-icon",
                        collapseIcon: "glyphicon glyphicon-triangle-bottom tree-icon",
                        checkedIcon: "glyphicon glyphicon-check text-success tree-icon",
                        uncheckedIcon: "glyphicon glyphicon-unchecked text-muted tree-icon",
                        highlightSelected: false,
                        showTools: true,
                        toolsHandlers: {
                            remove: {handler: $scope.deleteFileHandler, icon: "trash text-danger"},
                            download: {handler: $scope.downloadFileHandler, icon: "download-alt text-primary"}
                        },
                        onNodeChecked: function (event, node) {
                            for (var i in node.nodes) {
                                $('#files-tree-container').treeview('checkNode', [node.nodes[i].nodeId]);
                            }
                        },
                        onNodeUnchecked: function (event, node) {
                            for (var i in node.nodes) {
                                $('#files-tree-container').treeview('uncheckNode', [node.nodes[i].nodeId]);
                            }
                        }
                    });


                    if ($scope.models !== null) {
                        var checkNode = function (search, node) {
                            if (node && search[0] === node.text) {
                                if (search.length > 1) {
                                    search.shift();
                                    for (var i in node.nodes) {
                                        checkNode(search, node.nodes[i]);
                                    }
                                } else {
                                    $('#files-tree-container').treeview('checkNode', [node.nodeId]);
                                }
                            }
                        };

                        for (var i in $scope.models) {
                            checkNode($scope.models[i].split("/"), $('#files-tree-container').data('treeview').getNode(0));
                        }
                    }
                }, true);
            }
        };
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
                    '   <a class="btn btn-primary" ng-show="viewMode !== \'view\'" ng-click="controller.changeSelectedFilesButtonHandler();" style="margin-top:10px;">' +
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
                            '   <a class="btn btn-primary" ng-show="viewMode !== \'view\'" ng-click="controller.changeInputFilesHandler();"  style="margin-top:10px;">' +
                            '      <i class="fa fa-plus" aria-hidden="true"></i> Choose input files' +
                            '   </a>' +
                            '</div>';
                    element.html(template);
                    $compile(element.contents())($scope);
                }, true);
            }
        };
    });

    app.directive("referenceFilesSelectorField", function ($compile, AnalysisList) {
        return {
            restrict: 'E',
            replace: true,
            link: function ($scope, element, attrs) {
                $scope.$watch('model.reference_data', function (newValues, oldValues, scope) {

                    var template =
                            '<div ng-controller="StepDetailController as controller">' +
                            '   <div style="min-width:200px; min-height: 30px;">';

                    for (var i in $scope.model.reference_data) {
                        template +=
                                '       <div class="fileLocationItem">{{file}}' +
                                '         <b>Output files for step ' + $scope.model.reference_data[i] + '</b>' +
                                '         <ul>';

                        var step = AnalysisList.findStep($scope.model.reference_data[i]);
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
                            '   <a class="btn btn-primary" ng-show="viewMode !== \'view\'" ng-click="controller.changeInputFilesHandler(\'reference_data\');"  style="margin-top:10px;">' +
                            '      <i class="fa fa-plus" aria-hidden="true"></i> Choose reference files' +
                            '   </a>' +
                            '</div>';
                    element.html(template);
                    $compile(element.contents())($scope);
                }, true);
            }
        };
    });

    app.directive("fileListPanel", function () {
        return {
            restrict: 'E',
            templateUrl: 'app/files/file-list.tpl.html'
        };
    });

    app.directive("fileListInput", function () {
        return {
            restrict: 'E',
            replace: true,
            controller: 'DatasetListController',
            template:
                    '<select class="form-control" name="input_{{step.id}}" style=" max-width: 350px; display: inline-block; margin-left: 10px; "' +
                    '        ng-model="step.inputs[0].value" ng-init="step.inputs[0].value = null"' +
                    '        ng-options="file.id as file.name for file in filtered = (displayedHistory.content | filter:filterDatasets) "' +
                    '        required>' +
                    '  <option disabled value=""> -- Choose a file </option>' +
                    '</select>'
        };
    });

    app.directive("fileUploadPanel", function () {
        return {
            restrict: 'E',
            templateUrl: 'app/files/file-upload.tpl.html'
        };
    });

    app.directive('fileModel', ['$parse', function ($parse) {
            return {
                restrict: 'A',
                link: function ($scope, element, attrs) {
                    element.bind('change', function () {
                        $scope.$apply(function () {
                            element[0].files[0].state = "pending"
                            $scope.uploadFiles.push(element[0].files[0]);
                        });
                    });
                }
            };
        }]);
})();
