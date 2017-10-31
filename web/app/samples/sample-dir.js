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
 * - bioconditionCard
 * - bioreplicateForm
 * - sampleSelectorField
 *
 */
(function () {
    var app = angular.module('samples.directives.sample-views', [
    ]);

    /***************************************************************************/
    /*DIRECTIVES ***************************************************************/
    /***************************************************************************/
    app.directive("bioconditionCard", function ($timeout) {
        return {
            restrict: 'E',
            templateUrl: "app/samples/biocondition-card.tpl.html",
            link: function (scope, element, attrs) {
                //Execute the afterRender function (linked to a controller function)
                $timeout(scope.$eval(attrs.afterRender), 0);
            }
        };
    });

    app.directive("bioreplicateForm", function () {
        return {
            restrict: 'E',
            templateUrl: "app/samples/bioreplicate-form.tpl.html"
        };
    });

    app.directive("sampleSelectorField", function () {
        return {
            restrict: 'E',
            replace: true,
            template:
                    '<div ng-controller="BioconditionDetailController as controller">' +
                    '   <div class="field-group row">' +
                    '    <label class="col-sm-2" for="title">Biological condition title: </label>' +
                    '    <input class="col-sm-9" type="text" disabled ng-model="model.title">' +
                    '   </div>' +
                    '   <div class="field-group row" ng-show="bioreplicate !== undefined">' +
                    '    <label class="col-sm-2" for="title">Sample name: </label>' +
                    '    <input class="col-sm-9" type="text" disabled ng-model="bioreplicate.bioreplicate_name">' +
                    '   </div>' +
                    '   <div class="field-group row" ng-show="analytical_rep !== undefined">' +
                    '    <label class="col-sm-2" for="title">Aliquout name: </label>' +
                    '    <input class="col-sm-9" type="text" disabled ng-model="analytical_rep.analytical_rep_name">' +
                    '   </div>' +
                    '   <div class="col-sm-11">' +
                    '      <a style="float:right; margin-left: 15px;" class="btn btn-primary" ng-show="viewMode !== \'view\'" ng-click="controller.changeSelectedSampleButtonHandler();">' +
                    '        <i class="fa fa-pencil-square-o" aria-hidden="true"></i> Choose sample' +
                    '      </a>' +
                    '      <a style="float:right" class="btn btn-default" ng-show="biocondition_id !== undefined" ng-click="controller.showSelectedSampleDetailsButtonHandler();">' +
                    '        <i class="fa fa-search" aria-hidden="true"></i> Show sample details' +
                    '      </a>' +
                    '   </div>' +
                    '</div>'
        };
    });


    app.directive("samplesDiagram", ['$compile', '$dialogs', '$http', 'SampleList', function ($compile, $dialogs, $http, SampleList) {
            return {
                restrict: 'E',
                replace: true,
                link: function ($scope, element, attrs) {
                    /**********************************************************************************************
                     * This function...
                     *
                     * @return {AnalysisDetailController} the controller
                     ***********************************************************************************************/
                    var createDiagram = function () {
                        //1. CREATE THE CONTAINER FOR THE DIAGRAM
                        var template = '<div class="sigmaContainer" id="' + attrs["container-id"] + '"style="' + (attrs['style'] || "") + '"></div>';
                        $compile($(template).appendTo(element))($scope)[0];

                        //2. CREATE THE NETWORK DIAGRAM
                        var diagram = $scope.diagram || {nodes: [], edges: []};

                        //3. INITIALIZE THE SIGMA DIAGRMA
                        $scope.controller.sigma = new sigma({
                            graph: diagram,
                            renderer: {container: document.getElementById(attrs["container-id"]), type: 'canvas'},
                            settings: {
                                edgeColor: 'default',
                                defaultEdgeColor: '#d3d3d3',
                                mouseEnabled: true,
                                sideMargin: 100,
                                labelAlignment: "bottom",
                                autoRescale: false
                            }
                        });

                        if (attrs.selectable !== undefined) {
                            $scope.controller.sigma.selectable = true;

                            $scope.controller.sigma.bind('clickNode', function (event) {
                                var node = event.data.node;
                                if (node.id === $scope.model.step_id) {
                                    return;
                                }
                                if (node.selected === "false") {
                                    if ($scope.controller.addSelectedInputFileHandler(node.id, true)) {
                                        node.selected = "true";
                                    }
                                } else {
                                    if ($scope.controller.removeSelectedInputFileHandler(node.id, true)) {
                                        node.selected = "false";
                                    }
                                }
                            });
                        }

                        applyStyles();
                    };

                    /**********************************************************************************************
                     * This function...
                     *
                     * @return {AnalysisDetailController} the controller
                     ***********************************************************************************************/
                    var updateDiagram = function () {
                        var diagram = $scope.diagram || {nodes: [], edges: []};

                        $scope.controller.sigma.graph.clear();
                        $scope.controller.sigma.graph.read(diagram);

                        applyStyles();
                    };

                    var applyStyles = function () {
                        // Create a custom color palette:
                        var myPalette = {
                            nodeColorScheme: {
                                specie: "#cecece",
                                sample: "#ffe196",
                                aliquot: "#f7a56f"
                            },
                            iconScheme: {
                                specie: {font: 'FontAwesome', content: "\uF188", scale: 1, color: '#ffffff'},
                                sample: {font: 'FontAwesome', content: "\uF140", scale: 1, color: '#ffffff'},
                                aliquot: {font: 'FontAwesome', content: "\uF043", scale: 1, color: '#ffffff'}
                            }
                        };

                        var myStyles = {
                            nodes: {
                                icon: {by: 'node_type', scheme: 'iconScheme'},
                                color: {by: 'node_type', scheme: 'nodeColorScheme'}
                            }
                        };


                        // Instanciate the design:
                        if (!$scope.controller.sigma.design) {
                            $scope.controller.sigma.design = sigma.plugins.design($scope.controller.sigma, {
                                styles: myStyles,
                                palette: myPalette
                            });
                        } else {
                            $scope.controller.sigma.design.setPalette(myPalette);
                            $scope.controller.sigma.design.setStyles(myStyles);
                        }

                        $scope.controller.sigma.design.apply();

                        // Configure the DAG layout:
                        var listener = sigma.layouts.dagre.configure($scope.controller.sigma, {
                            directed: true, // take edge direction into account
                            rankdir: 'LR', // Direction for rank nodes. Can be TB, BT, LR, or RL,
                            easing: 'quadraticInOut', // animation transition function
                            duration: 800, // animation duration
                        });

                        // Bind all events:
                        listener.bind('stop', function (event) {
                            if ($scope.controller.sigma.graph.nodes().length) {
                                var dom = document.getElementById(attrs["container-id"]);
                                var w = dom.offsetWidth,
                                        h = dom.offsetHeight;

                                // The "rescale" middleware modifies the position of the nodes, but we
                                // need here the camera to deal with this. Here is the code:
                                var xMin = Infinity,
                                        xMax = -Infinity,
                                        yMin = Infinity,
                                        yMax = -Infinity,
                                        margin = 50,
                                        scale;

                                $scope.controller.sigma.graph.nodes().forEach(function (n) {
                                    xMin = Math.min(n.x, xMin);
                                    xMax = Math.max(n.x, xMax);
                                    yMin = Math.min(n.y, yMin);
                                    yMax = Math.max(n.y, yMax);
                                });

                                xMax += margin;
                                xMin -= margin;
                                yMax += margin;
                                yMin -= margin;

                                scale = Math.min(w / Math.max(xMax - xMin, 1), h / Math.max(yMax - yMin, 1));

                                $scope.controller.sigma.camera.goTo({
                                    x: (xMin + xMax) / 2,
                                    y: (yMin + yMax) / 2,
                                    ratio: 1 / scale
                                });
                            }
                        });

                        // Start the DAG layout:
                        sigma.layouts.dagre.start($scope.controller.sigma);

                        //$scope.controller.sigma.refresh();
                    };

                    $scope.$watch('diagram', function (newValues, oldValues, scope) {
                        if ($scope.diagram !== undefined && !oldValues || $scope.diagram !== undefined && $scope.controller.sigma === undefined) {
                            createDiagram();
                        } else if ($scope.diagram !== undefined) {
                            if (newValues.hasChanged && newValues.hasChanged !== oldValues.hasChanged) {
                                updateDiagram();
                            }
                        }
                    }, true);
                }
            };
        }]);

    app.directive("externalSampleField", ['$compile', '$dialogs', '$http', function ($compile, $dialogs, $http) {
            return {
                restrict: 'E',
                replace: true,
                link: function ($scope, element) {
                    var generateContent = function (element) {
                        if (element.value === undefined || element.value === null) {
                            return;
                        } else if (Array.isArray(element.value)) {
                            var template = '<div class="field-group row">' +
                                    '<label class="control-label col-sm-2">' + (element.name || "") + '</label>' +
                                    '<div class="col-sm-9">';

                            for (var i in element.value) {
                                template += generateContent(element.value[i]);
                            }
                            template += "</div>";
                            return template;
                        } else {
                            return "" +
                                    '<div class="field-group row">' +
                                    '<label class="control-label col-sm-2">' + (element.name || "") + '</label>' +
                                    '<div class="col-sm-9">' +
                                    '  <p class="form-control-static">' + element.value + '</p>' +
                                    '</div>';
                        }
                    };
                    
                    var template = generateContent($scope.field);

                    $compile($(template).appendTo(element))($scope);
                }
            };
        }
    ]);

})();