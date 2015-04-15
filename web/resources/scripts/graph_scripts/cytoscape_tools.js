
function addPlugins(cytoscapeInstance, panel_owner, commands) {

    // the default values of each option are outlined below:
    var defaults = {
        menuRadius: 50, // the radius of the circular menu in pixels
        selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
        commands: commands,
        fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
        activeFillColor: 'rgba(0, 173, 255, 0.75)', // the colour used to indicate the selected command
        activePadding: 20, // additional size in pixels for the active command
        indicatorSize: 24, // the size in pixels of the pointer to the active command
        separatorWidth: 3, // the empty spacing in pixels between successive commands
        spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
        minSpotlightRadius: 10, // the minimum radius in pixels of the spotlight
        maxSpotlightRadius: 15, // the maximum radius in pixels of the spotlight
        itemColor: 'white', // the colour of text in the command's content
        itemTextShadowColor: 'black', // the text shadow colour of the command's content
        zIndex: 9999 // the z-index of the ui div
    };

    cytoscapeInstance.cxtmenu(defaults);


    // the default values of each option are outlined below:
    defaults = ({
        zoomFactor: 0.05, // zoom factor per zoom tick
        zoomDelay: 45, // how many ms between zoom ticks
        minZoom: 0.1, // min zoom level
        maxZoom: 10, // max zoom level
        fitPadding: 20, // padding when fitting
        panSpeed: 5, // how many ms in between pan ticks
        panDistance: 10, // max pan distance per tick
        panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
        panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
        panInactiveArea: 8, // radius of inactive area in pan drag box
        panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
        autodisableForMobile: true, // disable the panzoom completely for mobile (since we don't really need it with gestures like pinch to zoom)

        // icon class names
        sliderHandleIcon: 'fa fa-minus',
        zoomInIcon: 'fa fa-plus',
        zoomOutIcon: 'fa fa-minus',
        resetIcon: 'fa fa-expand'
    });

    cytoscapeInstance.panzoom(defaults);

//    cytoscapeInstance.elements("node").each(function () {
//        this.qtip({
//            content: function () {
//                return this.data("description")
//            },
//            position: {
//                my: 'top center',
//                at: 'bottom center'
//            },
//            style: {
//                classes: 'qtip-bootstrap',
//                tip: {
//                    width: 16,
//                    height: 8
//                }
//            }
//        });
//    });

    cytoscapeInstance.on('click', 'node', function (event) {
        var target = event.cyTarget;
        panel_owner.nodeClickHandler(target.data());
    });

    cytoscapeInstance.selected = function () {
        return this.$(":selected");
    };

    cytoscapeInstance.getParents = function (node_id) {
//        var node_instance = this.node(node_id);
//        return node_instance.parents_id;
    };

    cytoscapeInstance.getAllPreviousNodes = function (node_id, nodes) {
        var node_instance = this.getElementById(node_id);
        var validStepTypes = ["RAWData", "Intermediate_step", "Processed_data"];

        var nodesAux = node_instance.predecessors().nodes();

        for (var i = 0; i < nodesAux.length; i++) {
            if (validStepTypes.indexOf(nodesAux[i].data("type")) !== -1) {
                nodes.push(nodesAux[i].data());
            }
        }
        return nodes;
    };

    cytoscapeInstance.getAllPreviousNodesIDs = function (node_id, nodes) {
        var node_instance = this.getElementById(node_id);
        var validStepTypes = ["RAWData", "Intermediate_step", "Processed_data"];

        var nodesAux = node_instance.predecessors().nodes();

        for (var i = 0; i < nodesAux.length; i++) {
            if (validStepTypes.indexOf(nodesAux[i].data("type")) !== -1) {
                nodes.push(nodesAux[i].data("id"));
            }
        }

        return nodes;
    };


    cytoscapeInstance.getAllLaterNodes = function (node_id, nodes) {
//        nodes.push(node_id);
//        var edges = this.firstNeighbors([node_id]).edges;
//        for (var i in edges) {
//            if (edges[i].data.source === node_id) {
//                if (nodes.indexOf(edges[i].data.target) === -1)
//                    this.getAllLaterNodes(edges[i].data.target, nodes);
//            }
//        }
        return nodes;
    };

}

function configureCytoscapeAnalysisGraph(panelOwner, divID, jsonData, otherOptions) {
    var diagramData = createAnalysisDiagram(jsonData);

    if (otherOptions == null) {
        otherOptions = {};
    }

    var showMenu = (otherOptions.showMenu !== undefined) ? otherOptions.showMenu : true;

    var cytoscapeGraph = cytoscape({
        zoom: 1, minZoom: 0.1, maxZoom: 2, boxSelectionEnabled: false,
        pan: {x: 0, y: 0},
        zoomingEnabled: true, userZoomingEnabled: false,
        panningEnabled: true, userPanningEnabled: true,
        container: $("#" + divID)[0],
        style: cytoscape.stylesheet().selector('node').css({
            'height': 80, 'width': 120,
            'content': 'data(label)', 'text-valign': 'bottom',
            'shape': 'roundrectangle', 'border-width': 3, 'background-color': '#fff',
        }).selector('edge').css({
            'width': 1, 'target-arrow-shape': 'triangle-backcurve', 'line-color': '#ea446a', 'target-arrow-color': '#ea446a', 
        }).selector('.analyticalreplicate').css({
            'border-color': '#DC9E9E', 'border-style': 'dashed', 'height': 75, 'width': 75, 'shape': 'ellipse',
            'border-radius': 5, 'background-image': './resources/images/diagram_sample_icon.png', 'background-color': '#fff'
        }).selector('.rawdata').css({
            'height': 100, 'width': 100, 'border-width': 0,
            'background-color': '#bfff00', 'background-image': './resources/images/diagram_sequencing_icon.png', 'shape': 'ellipse'
        }).selector('.intermediate_step').css({
            'border-color': '#6bcdff', 'background-image': './resources/images/diagram_document_icon.png'
        }).selector('.processed_data').css({
            'border-color': '#c86bff', 'background-image': './resources/images/diagram_document_icon.png'
        }).selector('.quality_report').css({
            'border-color': '#dfdfdf', 'background-image': './resources/images/diagram_qualitycontrol_icon.png', 'height': 60, 'width': 60
        }).selector('.external_source').css({
            'border-color': '#dfdfdf', 'background-image': './resources/images/diagram_region_icon.png', 'height': 60, 'width': 60
        }).selector(':selected').css({
            'border-color': '#ffcc00', 'border-width': 8
        }),
        elements: {nodes: diagramData.nodes, edges: diagramData.edges},
        layout: {
            name: 'horizontalTree',
            fit: true, // whether to fit the viewport to the graph
            directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
            padding: 50, // padding on fit
            circle: false, // put depths in concentric circles if true, put depths top down if false
            boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
            avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
            roots: diagramData.roots, // the roots of the trees
            maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
            animate: true, // whether to transition the node positions
            animationDuration: 500, // duration of animation in ms if enabled
            ready: undefined, // callback on layoutready
            stop: undefined // callback on layoutstop
        }
    });

    var commands = [];
    if (showMenu === true) {
        commands = [// an array of commands to list in the menu
            {content: '<span class="fa fa-plus-circle fa-2x"></span>',
                select: function () {
                    panelOwner.addNewNodeHandler(this[0].data());
                }
            },
            {content: '<span class="fa fa-edit fa-2x"></span>',
                select: function () {
                    panelOwner.editSelectedNodeHandler(this[0].data());
                }
            },
            {content: '<span class="fa fa-copy fa-2x"></span>',
                select: function () {
                    panelOwner.copySelectedNodeHandler(this[0].data());
                }
            },
            {content: '<span class="fa fa-trash fa-2x"></span>',
                select: function () {
                    panelOwner.removeSelectedNodeHandler(this[0].data());
                }
            }
        ];
    }
    addPlugins(cytoscapeGraph, panelOwner, commands);

    panelOwner.graph = cytoscapeGraph;
    return cytoscapeGraph;
}

function createAnalysisDiagram(json_data) {
    var edges = [];
    var nodes = [];
    var AR_nodes = {};
    var Region_nodes = {};

    for (var i in json_data) {
        var node = json_data[i];
        var node_data = {
            group: "nodes",
            data: {
                id: node['id'],
                label: node['type'].replace("_", " "),
                type: node['nodeType'],
                description: "<b>" + node['type'].replace("_", " ") + "</b></br><i>" + node['name'] + "</i>",
                parents_id: node['parents_id']
            },
            classes: (node['nodeType']).toLowerCase(),
        };

        if (node['nodeType'] === "AnalyticalReplicate" && AR_nodes[node_data.data.id] === undefined) {
            AR_nodes[node_data.data.id] = node_data;
        } else if (node['nodeType'] === "external_source" && Region_nodes[node_data.data.id] === undefined) {
            Region_nodes[node_data.data.id] = node_data;
            nodes.push(node_data);
        } else {
            nodes.push(node_data);
        }
//            
//            var alreadyInserted = false;
//            
//            for (var j in AR_nodes) {
//                if (AR_nodes[j].data.id === node_data.data.id) {
//                    alreadyInserted = true;
//                    break;
//                }
//            }
//            if (!alreadyInserted) {
//                AR_nodes.push(node_data);
//                AR_nodes_ids.push(node_data.data.id);
//            }
//        } else {
//            nodes.push(node_data);
//        }        }


//        if (node['nodeType'] === "AnalyticalReplicate") {
//            var alreadyInserted = false;
//            for (var j in AR_nodes) {
//                if (AR_nodes[j].data.id === node_data.data.id) {
//                    alreadyInserted = true;
//                    break;
//                }
//            }
//            if (!alreadyInserted) {
//                AR_nodes.push(node_data);
//                AR_nodes_ids.push(node_data.data.id);
//            }
//        } else {
//            nodes.push(node_data);
//        }

        for (var j in node['parents_id']) {
            var edge_data = {
                group: "edges",
                data: {
                    source: node['parents_id'][j],
                    target: node['id'],
                    type: "",
                    directed: true
                }
            };
            if (node['nodeType'] !== "AnalyticalReplicate") {
                edges.push(edge_data);
            }
        }
    }

    nodes = Object.values(AR_nodes).concat(nodes);

    var roots = (Object.keys(AR_nodes).length > 0) ? Object.keys(AR_nodes) : Object.keys(Region_nodes);

    return {nodes: nodes, edges: edges, roots: roots};
}

function configureCytoscapeSamplesGraph(panel_owner, div_id, json_data) {
    var diagramData = createSamplesDiagram(json_data);

    var cytoscapeGraph = cytoscape({ 
        zoom: 1, pan: {x: 0, y: 0}, minZoom: 0.1, maxZoom: 2, boxSelectionEnabled: false,
        zoomingEnabled: true, userZoomingEnabled: false,
        panningEnabled: true, userPanningEnabled: true,
        container: $("#" + div_id)[0],
        style: cytoscape.stylesheet().selector('node').css({
            'content': 'data(label)', 'text-valign': 'bottom',
            'shape': 'roundrectangle', 'border-width': 3, 'background-color': '#fff'
        }).selector('$node > node').css({
            'padding-top': '20px', 'padding-left': '50px', 'border-color': '#898989',
            'padding-bottom': '20px', 'padding-right': '50px', 'text-halign': 'center'
        }).selector('edge').css({
            'width': 1, 'target-arrow-shape': 'triangle-backcurve', 'line-color': '#ea446a', 'target-arrow-color': '#ea446a', 
        }).selector('.biocondition').css({
            'border-width': 0, 'shape': 'ellipse', 'height': 100, 'width': 100,
            'background-image': './resources/images/diagram_biocondition_icon.png'
        }).selector('.bioreplicate').css({
            'height': 80, 'width': 100, 'border-width': 4, 'border-color': '#7ccdff', 'shape': 'roundrectangle',
            'background-image': './resources/images/diagram_bioreplicate_icon.png', 'background-color': '#edf8ff'
        }).selector('.analyticalsample').css({
            'border-color': '#DC9E9E', 'border-style': 'dashed', 'height': 75, 'width': 75, 'shape': 'ellipse',
            'border-radius': 5, 'background-image': './resources/images/diagram_sample_icon.png', 'background-color': '#fff'
        }).selector('.protocol').css({
            'border-width': 0,'padding-top': '20px', 'padding-bottom': '30px', 'padding-left': '80px', 'padding-right': '80px', 'background-color': '#ede39a'
        }).selector('.batch').css({
            'border-width': 0,'padding-top': '20px', 'padding-bottom': '30px', 'padding-left': '80px', 'padding-right': '80px', 'background-color': '#c0dae0' 
        }).selector(':selected').css(
                {'border-color': '#ffcc00', 'border-width': 8}),
        elements: {nodes: diagramData.nodes, edges: diagramData.edges},
        layout: {
            name: 'preset',
            positions: diagramData.points, // map of (node id) => (position obj); or function(node){ return somPos; }
            zoom: undefined, // the zoom level to set (prob want fit = false if set)
            pan: undefined, // the pan level to set (prob want fit = false if set)
            fit: true, // whether to fit to viewport
            padding: 30, // padding on fit
            animate: true, // whether to transition the node positions
            animationDuration: 500, // duration of animation in ms if enabled
            ready: undefined, // callback on layoutready
            stop: undefined // callback on layoutstop
        },
    });

    var commands = [// an array of commands to list in the menu
        {content: '<span class="fa fa-search fa-2x"></span>',
            select: function () {
                panel_owner.inspectSelectedNodeHandler(this[0].data());
            }
        },
        {content: '<span class="fa fa-edit fa-2x"></span>',
            select: function () {
                panel_owner.editSelectedNodeHandler(this[0].data());
            }
        },
        {content: '<span class="fa fa-copy fa-2x"></span>',
            select: function () {
                panel_owner.copySelectedNodeHandler(this[0].data());
            }
        },
        {content: '<span class="fa fa-trash fa-2x"></span>',
            select: function () {
                panel_owner.removeSelectedNodeHandler(this[0].data());
            }
        }
    ];

    addPlugins(cytoscapeGraph, panel_owner, commands);

    panel_owner.graph = cytoscapeGraph;
    return cytoscapeGraph;
}

function createSamplesDiagram(json_data) {
    var edges = [], nodes = [], batchNodes = [], treatmentNodes = [], points = {};

    for (var i in json_data) {

        var node = json_data[i];
        var nodeData = {
            group: "nodes",
            data: node,
            classes: (node['type']).toLowerCase(),
        };

        if (node.type === "batch") {
            var nodesArray = batchNodes;
            var alreadyInserted = false;
            for (var j in nodesArray) {
                if (nodesArray[j].data.id === node.id) {
                    alreadyInserted = true;
                    break;
                }
            }
            if (!alreadyInserted) {
                nodesArray.push(nodeData);
            }
        } else {
            nodes.push(nodeData);
            if (node.parent_id !== undefined) {
                var edgeData = {
                    group: "edges",
                    data: {
                        source: node.parent_id,
                        target: node.id,
                        type: "", directed: true
                    }
                };
                edges.push(edgeData);

            }
            points[node.id] = {x: node.pos[0], y: node.pos[1]}
        }
    }
    nodes = nodes.concat(batchNodes);
    nodes = nodes.concat(treatmentNodes);

    return {nodes: nodes, edges: edges, points: points};
}

