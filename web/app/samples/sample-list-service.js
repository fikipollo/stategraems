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
                getBioreplicate: function (biocondition, bioreplicate_id) {
                    for (var i in biocondition.associatedBioreplicates) {
                        if (biocondition.associatedBioreplicates[i].bioreplicate_id === bioreplicate_id) {
                            return biocondition.associatedBioreplicates[i];
                        }
                    }
                    return null;
                },
                getAnalyticalReplicate: function (bioreplicate, analytical_rep_id) {
                    for (var i in bioreplicate.associatedAnalyticalReplicates) {
                        if (bioreplicate.associatedAnalyticalReplicates[i].analytical_rep_id === analytical_rep_id) {
                            return bioreplicate.associatedAnalyticalReplicates[i];
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
                            if (i === "owners") {
                                previous[i].length = 0;
                                for (var j in _biocondition[i]) {
                                    previous[i].push(_biocondition[i][j]);
                                }
                            } else {
                                previous[i] = _biocondition[i];
                            }
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

                        _bioconditions[i].tags = _bioconditions[i].tags || [];
                        _bioconditions[i].tags.push(_bioconditions[i].organism);
                        _bioconditions[i].tags.push(_bioconditions[i].tissue_type);
                        _bioconditions[i].tags.push(_bioconditions[i].cell_type);
                        _bioconditions[i].tags = arrayUnique(_bioconditions[i].tags, [""]);

                        _bioconditions[i].sample_description =
                                "Sample ID: " + _bioconditions[i].biocondition_id +
                                ", Organism: " + _bioconditions[i].organism +
                                ", Material type: " + _bioconditions[i].tissue_type +
                                ", Cell type: " + _bioconditions[i].cell_type +
                                ", Cell line: " + _bioconditions[i].cell_line +
                                ", Gender: " + _bioconditions[i].gender +
                                ", Genotype/Variation: " + _bioconditions[i].genotype +
                                ", Creation date: " + _bioconditions[i].submission_date.toISOString().split("T")[0];

                        //Create the table for protocols -> list(AS)
                        this.adaptBioreplicatesInformation(_bioconditions[i].associatedBioreplicates);
                    }
                    return _bioconditions;
                },
                adaptBioreplicatesInformation: function (_bioreplicates) {
                    for (var j in _bioreplicates) {
                        _bioreplicates[j].extractionProtocols = {};
                        var analyticalSamples = _bioreplicates[j].associatedAnalyticalReplicates;
                        for (var k in analyticalSamples) {
                            var protocolID = (analyticalSamples[k].protocol_id || "Unknown");
                            if (!_bioreplicates[j].extractionProtocols[protocolID]) {
                                _bioreplicates[j].extractionProtocols[protocolID] = [];
                            }
                            _bioreplicates[j].extractionProtocols[protocolID].push(analyticalSamples[k]);
                        }
                    }
                    return _bioreplicates;
                },
                isOwner: function (biocondition, user_id) {
                    for (var i in biocondition.owners) {
                        if (biocondition.owners[i].user_id === user_id) {
                            return true;
                        }
                    }
                    return false;
                },
                getBioconditionID: function (model_id) {
                    return model_id.replace(/AR|BR/, 'BC').split('.')[0];
                },
                getBioreplicateID: function (model_id) {
                    model_id = model_id.replace(/AR/, 'BR').split('.');
                    if (model_id.length > 1) {
                        return model_id[0] + "." + model_id[1];
                    }
                },
                updateModelStatus: function (model, newStatus) {
                    if (newStatus === "undo") {
                        if (model.status === "deleted") {
                            delete model.status;
                        }
                        if (model.status === "new_deleted") {
                            model.status = "new";
                        }
                        if (model.status === "edited") {
                            delete model.status;
                            //TODO: restore from memento.
                        }
                        if (model.status === "edited_deleted") {
                            model.status = "edited";
                        }
                    } else {
                        if (model.status === "new") {
                            if (newStatus === "deleted") {
                                model.status = "new_deleted";
                            }
                        } else if (model.status === "edited") {
                            if (newStatus === "deleted") {
                                model.status = "edited_deleted";
                            }
                        } else if (model.status === undefined) {
                            if (newStatus === "deleted") {
                                model.status = "deleted";
                            } else if (newStatus === "edited") {
                                model.status = "edited";
                            }
                        }
                    }
                }
            };
        }]);
})();
