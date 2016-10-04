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
 * - samples.services.sample-list
 *
 */
(function () {
    var app = angular.module('samples.services.sample-list', []);

    app.factory("SampleList", ['$rootScope', function ($rootScope) {
            var bioconditions = [];
            var tags = [];
            var filters = [];
            var tagColors = ['yellow', 'green', 'red', 'blue', 'purple', 'pink', 'yellow2', 'green2', 'red2', 'blue2', 'purple2', 'pink2']
            var old = new Date(0);
            //http://stackoverflow.com/questions/18247130/how-to-store-the-data-to-local-storage
            return {
                getSamples: function () {
                    return bioconditions;
                },
                setSamples: function (_bioconditions) {
                    bioconditions = this.adaptInformation(_bioconditions);
                    old = new Date();
                    return this;
                },
                getBiocondition: function (biocondition_id) {
                    for (var i in bioconditions) {
                        if (bioconditions[i].biocondition_id === biocondition_id) {
                            return bioconditions[i];
                        }
                    }
                    return null;
                },
                addBiocondition: function (biocondition) {
                    var previous = this.getBiocondition(biocondition.biocondition_id);
                    if (previous === null) {
                        bioconditions.push(biocondition);
                    } else {
                        return this.updateBiocondition(biocondition);
                    }
                    this.updateTags();
                    return biocondition;
                },
                updateBiocondition: function (_biocondition) {
                    var previous = this.getBiocondition(_biocondition.biocondition_id);
                    if (previous !== null) {
                        for (var i in _biocondition) {
                            previous[i] = _biocondition[i];
                        }
                    }
                    this.updateTags();
                    return previous;
                },
                deleteBiocondition: function (biocondition_id) {
                    for (var i in bioconditions) {
                        if (bioconditions[i].biocondition_id === biocondition_id) {
                            biocondition_id.splice(i, 1);
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

                    for (var i in bioconditions) {
                        _tags = bioconditions[i].tags;
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


                    tags.push({name: "All", times: bioconditions.length});

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
                adaptInformation: function (_bioconditions) {
                    for (var i in _bioconditions) {
                        //ADAPT THE DATES
                        var date = _bioconditions[i].submission_date;
                        if (date.indexOf("/") === -1) {
                            date = date.substr(0, 4) + "/" + date.substr(4, 2) + "/" + date.substr(6, 2);
                        }
                        _bioconditions[i].submission_date = new Date(date);

                        date = _bioconditions[i].last_edition_date;
                        if (date.indexOf("/") === -1) {
                            date = date.substr(0, 4) + "/" + date.substr(4, 2) + "/" + date.substr(6, 2);
                        }
                        _bioconditions[i].last_edition_date = new Date(date);

                        //ADAPT THE TAGS
//                        _samples[i].tags = ((_samples[i].tags !== undefined) ? _samples[i].tags.split(",") : ["Case-control"]);
                    }
                    return _bioconditions;
                },
                isOwner: function (biocondition, user_id) {
                    for (var i in biocondition.owners) {
                        if (biocondition.owners[i].user_id === user_id) {
                            return true;
                        }
                    }
                    return false;
                },
                isMember: function (biocondition, user_id) {
                    for (var i in biocondition.members) {
                        if (biocondition.members[i].user_id === user_id) {
                            return true;
                        }
                    }
                    return false;
                },
                getMemento: function (model) {
                    var memento = {};
                    for (var key in model) {
                        //IF IS ARRAY
                        if ((!!model[key]) && (model[key].constructor === Array)) {
                            memento[key] = [];
                            for (var i in model[key]) {
                                memento[key].push(model[key][i]);
                            }
                            //IF IS object
                        } else if ((!!model[key]) && (model[key].constructor === Object)) {
                            memento[key] = {};
                            for (var i in model[key]) {
                                memento[key][i] = model[key][i];
                            }
                        } else {
                            memento[key] = model[key];
                        }
                    }

                    return memento;
                },
                restoreFromMemento: function (model, memento) {
                    for (var key in model) {
                        if ((!!memento[key]) && (memento[key].constructor === Array)) {
                            model[key].length = 0;
                            for (var i in memento[key]) {
                                model[key].push(memento[key][i]);
                            }
                            //IF IS object
                        } else if ((!!memento[key]) && (memento[key].constructor === Object)) {
                            for (var i in model[key]) {
                                delete model[key][i];
                            }

                            for (var i in memento[key]) {
                                model[key][i] = memento[key][i];
                            }
                        } else {
                            model[key] = memento[key];
                        }
                    }
                    return model;
                }
            };
        }]);
})();
