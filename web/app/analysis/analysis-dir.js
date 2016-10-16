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
                    var createDiagram = function () {
                        var template = '<div class="sigmaContainer" id="' + attrs["container-id"] + '"style="' + (attrs['style'] || "") + '"></div>';
                        $compile($(template).appendTo(element))($scope)[0];

                        //CREATE THE SIGMA NETWORK
                        var diagram = $scope.diagram;

                        if (diagram === undefined) {
                            return;
                        }
                        $scope.controller.sigma = new sigma({
                            graph: diagram,
                            renderer: {container: document.getElementById(attrs["container-id"]), type: 'canvas'},
                            settings: {
                                edgeColor: 'default',
                                defaultEdgeColor: '#d3d3d3',
                                mouseEnabled: true,
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

                            // Create a custom color palette:
                            var myPalette = {
                                nodeColorScheme: {
                                    true: "#fc7d71",
                                    false: "#d8d8d8"
                                },
                                iconScheme: {
                                    true: {font: 'FontAwesome', content: "\uF129", scale: 0.7, color: '#ffffff'},
                                    false: {font: 'FontAwesome', content: "\uF129", scale: 0.7, color: '#ffffff'}
                                }
                            };

                            var myStyles = {
                                nodes: {
                                    size: {by: 'size', bins: 7, min: nodeSize, max: nodeSize},
                                    icon: {by: 'selected', scheme: 'iconScheme'},
                                    color: {by: 'selected', scheme: 'nodeColorScheme'}
                                },
                                edges: {
                                    size: {by: 'size', min: edgeSize, max: edgeSize}
                                }
                            };

                            $scope.controller.sigma.bind('clickNode', function (event) {
                                var node = event.data.node;
                                if (node.id === $scope.model.step_id) {
                                    return;
                                }
                                if (node.selected === "false") {
                                    $scope.controller.addSelectedInputFile(node.id);
                                    node.selected = "true";
                                } else {
                                    $scope.controller.removeSelectedInputFile(node.id);
                                    node.selected = "false";
                                }
                            });

                        } else {
                            // Create a custom color palette:
                            var myPalette = {
                                nodeColorScheme: {
                                    rawdata: "#ede43d",
                                    intermediate_data: "#1fa7cb",
                                    processed_data: "#c075e5"
                                },
                                iconScheme: {
                                    rawdata: {font: 'FontAwesome', content: "\uF129", scale: 0.7, color: '#ffffff'},
                                    intermediate_data: {font: 'FontAwesome', content: "\uF129", scale: 0.7, color: '#ffffff'},
                                    processed_data: {font: 'FontAwesome', content: "\uF129", scale: 0.7, color: '#ffffff'}
                                }
                            };

                            var myStyles = {
                                nodes: {
                                    size: {by: 'size', bins: 7, min: nodeSize, max: nodeSize},
                                    icon: {by: 'step_type', scheme: 'iconScheme'},
                                    color: {by: 'step_type', scheme: 'nodeColorScheme'}
                                },
                                edges: {
                                    size: {by: 'size', min: edgeSize, max: edgeSize}
                                }
                            };
                        }


                        // Instanciate the design:
                        var design = sigma.plugins.design($scope.controller.sigma, {
                            styles: myStyles,
                            palette: myPalette
                        });

                        design.apply();

                        // Configure the DAG layout:
                        sigma.layouts.dagre.configure($scope.controller.sigma, {
                            directed: true, // take edge direction into account
                            rankdir: 'LR', // Direction for rank nodes. Can be TB, BT, LR, or RL,
                            easing: 'quadraticInOut', // animation transition function
                            duration: 800, // animation duration
                        });

                        // Start the DAG layout:
                        sigma.layouts.dagre.start($scope.controller.sigma);
                    };


                    var updateDiagram = function () {
                        var diagram = $scope.diagram;
                        $scope.controller.sigma.graph.clear();
                        $scope.controller.sigma.graph.read(diagram);

                        var myPalette = {
                            nodeColorScheme: {
                                true: "#fc7d71",
                                false: "#d8d8d8"
                            },
                            iconScheme: {
                                true: {font: 'FontAwesome', content: "\uF126", scale: 0.7, color: '#ffffff'},
                                false: {font: 'FontAwesome', content: "\uF129", scale: 0.7, color: '#ffffff'}
                            }
                        };
                        // Instanciate the design:
                        var design = sigma.plugins.design($scope.controller.sigma, {
                            palette: myPalette
                        });
                        design.apply();

                        $scope.controller.sigma.refresh();

                        // Configure the DAG layout:
                        sigma.layouts.dagre.configure($scope.controller.sigma, {
                            directed: true, // take edge direction into account
                            rankdir: 'LR', // Direction for rank nodes. Can be TB, BT, LR, or RL,
                            easing: 'quadraticInOut', // animation transition function
                            duration: 800, // animation duration
                        });
                        // Start the DAG layout:
                        sigma.layouts.dagre.start($scope.controller.sigma);
                    };

                    $scope.$watch('diagram', function (newValues, oldValues, scope) {
                        if ($scope.diagram !== undefined && !oldValues || $scope.diagram !== undefined && $scope.controller.sigma === undefined) {
                            createDiagram();
                        } else if ($scope.diagram !== undefined && (newValues.edges.length !== oldValues.edges.length || newValues.nodes.length !== oldValues.nodes.length)) {
                            updateDiagram();
                        }
                    }, true);
                }
            };
        }]);

})();
