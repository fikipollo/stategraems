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
 * - external-sources.services.external-source-list
 *
 */
(function () {
    var app = angular.module('external-sources.services.external-sources-list', []);

    app.factory("ExternalSourceList", ['$rootScope', function ($rootScope) {
            var externalSources = [];
            var filters = [];
            var old = new Date(0);
            return {
                getExternalSources: function () {
                    return externalSources;
                },
                setExternalSources: function (_externalSources) {
                    externalSources = this.adaptInformation(_externalSources);
                    old = new Date();
                    return this;
                },
                getExternalSource: function (source_id) {
                    for (var i in externalSources) {
                        if (externalSources[i].source_id === source_id) {
                            return externalSources[i];
                        }
                    }
                    return null;
                },
                addExternalSource: function (externalSource) {
                    var previous = this.getExternalSource(externalSource.source_id);
                    if (previous === null) {
                        externalSources.push(externalSource);
                    } else {
                        return this.updateExternalSource(externalSource);
                    }
                    return externalSource;
                },
                updateExternalSource: function (_externalSource) {
                    var previous = this.getExternalSource(_externalSource.source_id);
                    if (previous !== null) {
                        for (var i in _externalSource) {
                            previous[i] = _externalSource[i];
                        }
                    }
                    return previous;
                },
                deleteExternalSource: function (source_id) {
                    for (var i in externalSources) {
                        if (externalSources[i].source_id === source_id) {
                            externalSources.splice(i, 1);
                            break;
                        }
                    }
                    this.update();
                    return this;
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
                },
                adaptInformation: function (_externalSources) {
                    return _externalSources;
                }
            };
        }]);
})();
