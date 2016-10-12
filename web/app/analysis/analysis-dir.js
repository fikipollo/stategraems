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
 * - analysis.directives.analysis-views
 *
 */
(function () {
    var app = angular.module('analysis.directives.analysis-views', [
    ]);

    /***************************************************************************/
    /*DIRECTIVES ***************************************************************/
    /***************************************************************************/
    app.directive("analysisCard", function ($timeout) {
        return {
            restrict: 'E',
            templateUrl: "app/analysis/analysis-card.tpl.html",
            link: function (scope, element, attrs) {
                //Execute the afterRender function (linked to a controller function)
                $timeout(scope.$eval(attrs.afterRender), 0);
            }
        };
    });

    app.directive("rawDataForm", function () {
        return {
            restrict: 'E',
            templateUrl: "app/analysis/rawdata-form.tpl.html"
        };
    });

    app.directive("intermediateDataForm", function () {
        return {
            restrict: 'E',
            templateUrl: "app/analysis/intermediatedata-form.tpl.html"
        };
    });

    app.directive("processedDataForm", function () {
        return {
            restrict: 'E',
            templateUrl: "app/analysis/processeddata-form.tpl.html"
        };
    });

    app.directive("analysisDiagram", ['$compile', '$dialogs', '$http', function ($compile, $dialogs, $http) {
            return {
                restrict: 'E',
                replace: true,
                link: function ($scope, element, attrs) {
                    debugger;
                    var template = '<div class="sigmaContainer" style="' + (attrs['style'] || "") + '"></div>';
                    var sigmaContainer = $compile($(template).appendTo(element))($scope)[0];

                    var createDiagram = function (element) {
                        //CREATE THE SIGMA NETWORK
                        var diagram = $scope.diagram;

                        if ($scope.sigma !== undefined) {
                            debugger
                        }

                        $scope.sigma = new sigma({
                            graph: diagram,
                            renderer: {
                                container: element,
                                type: 'canvas'
                            },
                            settings: {
                                edgeColor: 'default',
                                defaultEdgeColor: '#d3d3d3',
                                // mouseEnabled: false,
                                sideMargin: 100,
                                labelAlignment: "bottom"
                            }
                        });

                        var nodeSize = 16;
                        var edgeSize = 4;
                        if (diagram.nodes.length > 15) {
                            nodeSize = 7;
                            edgeSize = 2;
                        } else if (diagram.nodes.length > 10) {
                            nodeSize = 10;
                            edgeSize = 3;
                        }

                        var myPalette = {}, myStyles = {};
                        if (attrs.selectable !== undefined) {
                            for (var i in diagram.nodes) {
                                diagram.nodes[i]["selected"] = ($scope.model.used_data.indexOf(diagram.nodes[i].id) !== -1) ? "true" : "false";
                            }

                            myPalette = {
                                iconScheme: {
                                    'false': {rawdata: 'FontAwesome', scale: 1.0, color: '#fff', content: "\uf055"}
                                },
                                colorScheme: {
                                    true: "#dfdfdf",
                                    false: "#dfdfdf"
                                }
                            };

                            myStyles = {
                                nodes: {
//                                    size: {by: 'size', bins: 7, min: nodeSize, max: nodeSize},
//                                    color: {by: 'step_type', scheme: 'colorScheme'},
                                    icon: {by: 'selected', scheme: 'iconScheme'},
                                },
                                edges: {
//                                    size: {by: 'size', min: edgeSize, max: edgeSize},
                                }
                            };

                            $scope.sigma.bind('clickNode', function (event) {
                                var node = event.data.node;
                                if (node.id === $scope.model.step_id) {
                                    return;
                                }
                                if (node.selected === "false") {
                                    $scope.controller.addSelectedInputFile(node.id);
                                    node.selected = "true";
                                    var edge_id = $scope.model.step_id + "" + node.id;
                                    $scope.sigma.graph.addEdge({
                                        id: edge_id,
                                        source: node.id,
                                        target: $scope.model.step_id,
                                        type: 'arrow'
                                    });
                                } else {
                                    $scope.controller.removeSelectedInputFile(node.id);
                                    node.selected = "false";
                                    var edge_id = $scope.model.step_id + "" + node.id;
                                    $scope.sigma.graph.dropEdge(edge_id);
                                }
                                $scope.sigma.refresh();
                            });

                        } else {
                            // Create a custom color palette:
                            myPalette = {
                                iconScheme: {
                                    'data_input': {rawdata: 'FontAwesome', scale: 1.0, color: '#fff', content: "\uf15c"}
                                },
                                aSetScheme: {
                                    7: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628"]
                                }
                            };

                            myStyles = {
                                nodes: {
                                    size: {by: 'size', bins: 7, min: nodeSize, max: nodeSize},
                                    icon: {by: 'step_type', scheme: 'iconScheme'},
                                    color: {by: 'step_type', scheme: 'aSetScheme', set: 7},
                                },
                                edges: {
                                    size: {by: 'size', min: edgeSize, max: edgeSize},
                                }
                            };
                        }


                        // Instanciate the design:
                        var design = sigma.plugins.design($scope.sigma, {
                            styles: myStyles,
                            palette: myPalette
                        });

                        design.apply();

                        // Configure the DAG layout:
                        var dagreListener = sigma.layouts.dagre.configure($scope.sigma, {
                            directed: true, // take edge direction into account
                            rankdir: 'LR', // Direction for rank nodes. Can be TB, BT, LR, or RL,
                            // where T = top, B = bottom, L = left, and R = right.
                            easing: 'quadraticInOut', // animation transition function
                            duration: 800, // animation duration
                            // nodes : s.graph.nodes().slice(0,30), // subset of nodes
                            // boundingBox: {minX: 10, maxX: 20, minY: 10, maxY:20} // constrain layout bounds ; object or true (all current positions of the given nodes)
                        });

                        // Bind the events:
                        dagreListener.bind('start stop interpolate', function (e) {
                            console.log(e.type);
                        });

                        // Start the DAG layout:
                        sigma.layouts.dagre.start($scope.sigma);
                    };

                    $scope.$watch('diagram', function (newval) {
                        if ($scope.diagram !== undefined) {
                            createDiagram(sigmaContainer);
                        }
                    });
                }
            };
        }]);

})();
