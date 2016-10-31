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
 * - experiments.services.experiment-list
 *
 */
(function () {
    var app = angular.module('experiments.services.experiment-list', []);

    app.factory("ExperimentList", ['$rootScope', function ($rootScope) {
            var experiments = [];
            var tags = [];
            var filters = [];
            var tagColors = ['yellow', 'green', 'red', 'blue', 'purple', 'pink', 'yellow2', 'green2', 'red2', 'blue2', 'purple2', 'pink2']
            var old = new Date(0);
            //http://stackoverflow.com/questions/18247130/how-to-store-the-data-to-local-storage
            return {
                getExperiments: function () {
                    return experiments;
                },
                setExperiments: function (_experiments) {
                    experiments = this.adaptInformation(_experiments);
                    old = new Date();
                    return this;
                },
                getExperiment: function (experiment_id) {
                    for (var i in experiments) {
                        if (experiments[i].experiment_id === experiment_id) {
                            return experiments[i];
                        }
                    }
                    return null;
                },
                addExperiment: function (experiment) {
                    var previous = this.getExperiment(experiment.experiment_id);
                    if (previous === null) {
                        experiments.push(experiment);
                    } else {
                        return this.updateExperiment(experiment);
                    }
                    this.updateTags();
                    return experiment;
                },
                updateExperiment: function (_experiment) {
                    var previous = this.getExperiment(_experiment.experiment_id);
                    if (previous !== null) {
                        for (var i in _experiment) {
                            previous[i] = _experiment[i];
                        }
                    }
                    this.updateTags();
                    return previous;
                },
                deleteExperiment: function (experiment_id) {
                    for (var i in experiments) {
                        if (experiments[i].experiment_id === experiment_id) {
                            experiments.splice(i, 1);
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

                    for (var i in experiments) {
                        _tags = experiments[i].tags;
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


                    tags.push({name: "All", times: experiments.length});

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
                adaptInformation: function (_experiments) {
                    for (var i in _experiments) {
                        //ADAPT THE DATES
                        var date = _experiments[i].submission_date;
                        if (date.indexOf("/") === -1) {
                            date = date.substr(0, 4) + "/" + date.substr(4, 2) + "/" + date.substr(6, 2);
                        }
                        _experiments[i].submission_date = new Date(date);

                        date = _experiments[i].last_edition_date;
                        if (date.indexOf("/") === -1) {
                            date = date.substr(0, 4) + "/" + date.substr(4, 2) + "/" + date.substr(6, 2);
                        }
                        _experiments[i].last_edition_date = new Date(date);

                        //ADAPT THE TAGS
                        _experiments[i].tags = arrayUnique(_experiments[i].tags, [""]);
                    }
                    return _experiments;
                },
                isOwner: function (experiment, user_id) {
                    for (var i in experiment.experiment_owners) {
                        if (experiment.experiment_owners[i].user_id === user_id) {
                            return true;
                        }
                    }
                    return false;
                },
                isMember: function (experiment, user_id) {
                    for (var i in experiment.experiment_members) {
                        if (experiment.experiment_members[i].user_id === user_id) {
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
