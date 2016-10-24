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
 * - files.services.file-list
 *
 */
(function () {
    var app = angular.module('files.services.file-list', []);

    app.factory("FileList", ['$rootScope', function ($rootScope) {
            var filesTree = {};
            var files = [];
            var filters = [];
            var old = new Date(0);
            return {
                getFilesTree: function () {
                    return filesTree;
                },
                setFilesTree: function (_filesTree) {
                    filesTree = _filesTree;
                    files = this.getFilesFromTree(filesTree, []);
                    old = new Date();
                    return this;
                },
                getFilesFromTree: function(node, list){
                    list.push(node.text);
                    for(var i in node.nodes){
                        this.getFilesFromTree(node.nodes[i], list);
                    }
                    return list;
                },
                getFiles: function () {
                    return files;
                },
                setFiles: function (_files) {
                    files = _files;
                    return this;
                },
                getFile: function (file_id) {
                    for (var i in files) {
                        if (files[i] === file_id) {
                            return files[i];
                        }
                    }
                    return null;
                },
                getFilters: function () {
                    return filters;
                },
                setFilters: function (_filters) {
                    filters = _filters;
                    return this;
                },
                removeFilter: function (_filter) {
                    var pos = filters.indexOf(_filter);
                    if (pos !== -1) {
                        filters.splice(pos, 1);
                    }
                    return this;
                },
                getOld: function () {
                    return (new Date() - old) / 60000;
                }
            };
        }]);
})();
