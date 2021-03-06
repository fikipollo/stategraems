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
 * - protocols.services.protocol-list
 *
 */
(function () {
    var app = angular.module('protocols.services.protocol-list', []);

    app.factory("ProtocolList", ['$rootScope', function ($rootScope) {
            var protocols = [{protocol_id:"Unknown", protocol_name: "Default"}];
            var tags = [];
            var filters = [];
            var tagColors = ['yellow', 'green', 'red', 'blue', 'purple', 'pink', 'yellow2', 'green2', 'red2', 'blue2', 'purple2', 'pink2']
            var old = new Date(0);
            //http://stackoverflow.com/questions/18247130/how-to-store-the-data-to-local-storage
            return {
                getProtocols: function () {
                    return protocols;
                },
                setProtocols: function (_protocols) {
                    protocols = this.adaptInformation(_protocols);
                    old = new Date();
                    return this;
                },
                getProtocol: function (protocol_id) {
                    for (var i in protocols) {
                        if (protocols[i].protocol_id === protocol_id) {
                            return protocols[i];
                        }
                    }
                    return null;
                },
                addProtocol: function (protocol) {
                    var previous = this.getProtocol(protocol.protocol_id);
                    if (previous === null) {
                        protocols.push(protocol);
                    } else {
                        return this.updateProtocol(protocol);
                    }
                    this.updateTags();
                    return protocol;
                },
                updateProtocol: function (_protocol) {
                    var previous = this.getProtocol(_protocol.protocol_id);
                    if (previous !== null) {
                        for (var i in _protocol) {
                            previous[i] = _protocol[i];
                        }
                    }
                    this.updateTags();
                    return previous;
                },
                deleteProtocol: function (protocol_id) {
                    for (var i in protocols) {
                        if (protocols[i].protocol_id === protocol_id) {
                            protocols.splice(i, 1);
                            break;
                        }
                    }
                    this.updateTags();
                    return this;
                },
                getTags: function () {
                    return tags;
                },
                getTag: function (_tag) {
                    for (var i in tags) {
                        if (tags[i].name === _tag) {
                            return tags[i];
                        }
                    }
                    return null;
                },
                setTags: function (_tags) {
                    tags = _tags;
                    return this;
                },
                updateTags: function () {
                    var tagsAux = {}, _tags;

                    for (var i in protocols) {
                        _tags = protocols[i].tags;
                        for (var j in _tags) {
                            tagsAux[_tags[j]] = {
                                name: _tags[j],
                                times: ((tagsAux[_tags[j]] === undefined) ? 1 : tagsAux[_tags[j]].times + 1)
                            };
                        }
                    }

                    tags.length = 0;
                    for (var i in tagsAux) {
                        tags.push(tagsAux[i]);
                    }
                    for (var i in tags) {
                        tags[i].color = tagColors[i % tagColors.length];
                    }


                    tags.push({name: "All", times: protocols.length});

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
                adaptInformation: function (_protocols) {
                    return _protocols;
                },
                isOwner: function (protocol, user_id) {
                    for (var i in protocol.owners) {
                        if (protocol.owners[i].user_id === user_id) {
                            return true;
                        }
                    }
                    return false;
                },
                isMember: function (protocol, user_id) {
                    for (var i in protocol.protocol_members) {
                        if (protocol.protocol_members[i].user_id === user_id) {
                            return true;
                        }
                    }
                    return false;
                }
            };
        }]);
})();
