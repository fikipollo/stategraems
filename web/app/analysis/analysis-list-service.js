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
 * - analysis.services.analysis-list
 *
 */
(function () {
    var app = angular.module('analysis.services.analysis-list', []);

    app.factory("AnalysisList", ['$rootScope', function ($rootScope) {
            var analysis = [];
            var tags = [];
            var analysisTypes = [];
            var filters = [];
            var tagColors = ['yellow', 'green', 'red', 'blue', 'purple', 'pink', 'yellow2', 'green2', 'red2', 'blue2', 'purple2', 'pink2']
            var old = new Date(0);
            //http://stackoverflow.com/questions/18247130/how-to-store-the-data-to-local-storage
            return {
                getAnalysis: function () {
                    return analysis;
                },
                setAnalysis: function (_analysis) {
                    analysis = this.adaptInformation(_analysis);
                    old = new Date();
                    return this;
                },
                findAnalysis: function (analysis_id) {
                    for (var i in analysis) {
                        if (analysis[i].analysis_id === analysis_id) {
                            return analysis[i];
                        }
                    }
                    return null;
                },
                findStep: function (step_id) {
                    var analysis = this.findAnalysis(step_id.split(".")[0].replace("ST", "AN"));

                    if (analysis) {
                        var steps = analysis.non_processed_data.concat(analysis.processed_data); // Merges both arrays
                        for (var i in steps) {
                            if (steps[i].step_id === step_id) {
                                return steps[i];
                            }
                        }
                    }
                    return null;
                },
                addAnalysis: function (_analysis) {
                    var previous = this.findAnalysis(_analysis.analysis_id);
                    if (previous === null) {
                        analysis.push(_analysis);
                    } else {
                        return this.updateAnalysis(_analysis);
                    }
                    this.updateTags();
                    this.updateAnalysisTypes();
                    return analysis;
                },
                updateAnalysis: function (_analysis) {
                    var previous = this.findAnalysis(_analysis.analysis_id);
                    if (previous !== null) {
                        for (var i in _analysis) {
                            previous[i] = _analysis[i];
                        }
                    }
                    this.updateTags();
                    this.updateAnalysisTypes();
                    return previous;
                },
                deleteAnalysis: function (analysis_id) {
                    for (var i in analysis) {
                        if (analysis[i].analysis_id === analysis_id) {
                            analysis.splice(i, 1);
                            break;
                        }
                    }
                    this.updateTags();
                    this.updateAnalysisTypes();
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

                    for (var i in analysis) {
                        _tags = analysis[i].tags;
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


                    tags.push({name: "All", times: analysis.length});

                    return this;
                },
                getAnalysisTypes: function () {
                    return analysisTypes;
                },
                setAnalysisTypes: function (_analysisTypes) {
                    analysisTypes = _analysisTypes;
                    return this;
                },
                updateAnalysisTypes: function () {
                    var typesAux = {}, _type;

                    for (var i in analysis) {
                        typesAux[analysis[i].analysis_type] = 1;
                    }

                    analysisTypes.length = 0;
                    analysisTypes.push("All analysis types");
                    for (var i in typesAux) {
                        analysisTypes.push(i);
                    }

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
                adaptInformation: function (_analysis) {
                    for (var i in _analysis) {
                        _analysis[i].analysis_name = (_analysis[i].analysis_name || "Unnamed analysis");
                        //ADAPT THE TAGS
                        _analysis[i].tags = (_analysis[i].tags || []);
                        _analysis[i].tags.push(_analysis[i].analysis_type);
                        _analysis[i].tags = arrayUnique(_analysis[i].tags);
                        //GET NEXT STEP ID
                        var maxStep = 0;
                        for (var j in _analysis[i].non_processed_data) {
                            maxStep = Math.max(maxStep, Number.parseInt(_analysis[i].non_processed_data[j].step_id.split(".")[1]));
                        }
                        for (var j in _analysis[i].processed_data) {
                            maxStep = Math.max(maxStep, Number.parseInt(_analysis[i].processed_data[j].step_id.split(".")[1]));
                        }

                        _analysis[i].nextStepID = maxStep + 1;

                        //ADAPT STEPS INFO
                        this.adaptStepInformation(_analysis[i].non_processed_data);
                        this.adaptStepInformation(_analysis[i].processed_data);

                    }
                    return _analysis;
                },
                adaptStepInformation: function (steps) {
                    for (var i in steps) {
                        //ADAPT THE DATES
                        var date = steps[i].submission_date;
                        if (date.indexOf("/") === -1) {
                            date = date.substr(0, 4) + "/" + date.substr(4, 2) + "/" + date.substr(6, 2);
                        }
                        steps[i].submission_date = new Date(date);

                        date = steps[i].last_edition_date;
                        if (date.indexOf("/") === -1) {
                            date = date.substr(0, 4) + "/" + date.substr(4, 2) + "/" + date.substr(6, 2);
                        }
                        steps[i].last_edition_date = new Date(date);
                    }
                    return steps;
                },
                isOwner: function (analysis, user_id) {
                    if (!analysis.non_processed_data && !analysis.processed_data) {
                        return false;
                    }
                    var steps = analysis.non_processed_data.concat(analysis.processed_data); // Merges both arrays
                    for (var i in steps) {
                        for (var j in steps[i].step_owners) {
                            if (steps[i].step_owners[j].user_id === user_id) {
                                return true;
                            }
                        }
                    }
                    return false;
                },
                isStepOwner: function (step, user_id) {
                    for (var i in step.step_owners) {
                        if (step.step_owners[i].user_id === user_id) {
                            return true;
                        }
                    }
                    return false;
                },
                isMember: function (analysis, user_id) {
                    for (var i in analysis.analysis_members) {
                        if (analysis.analysis_members[i].user_id === user_id) {
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
                },
                hasChangedStep: function (newValues, oldValues) {
                    if ((newValues === undefined || oldValues === undefined) && newValues !== oldValues) {
                        debugger;
                        return true;
                    }

                    //Get names for all properties (unique)
                    var keys = arrayUnique(Object.keys(newValues).concat(Object.keys(oldValues)));

                    var key;
                    for (var i in keys) {
                        key = keys[i];
                        //1. If there are new properties or removed ones
                        if (newValues[key] === undefined || oldValues[key] === undefined) {
                            debugger;
                            return true;
                            //2. Else if prop is an array, check content
                        } else if (newValues[key] instanceof Array) {
                            //1. Check if lenghts are different
                            if (newValues[key].length !== oldValues[key].length) {
                                debugger;
                                return true;
                            }
                            //2. Check if arrays are similar
                            for (var j in newValues[key]) {
                                if (oldValues[key].indexOf(newValues[key][j]) === -1) {
                                    debugger;
                                    return true;
                                }
                            }
                            for (var j in oldValues[key]) {
                                if (newValues[key].indexOf(oldValues[key][j]) === -1) {
                                    debugger;
                                    return true;
                                }
                            }
                            //3. Else if prop is an object, call this function recursively
                        } else if (newValues[key] instanceof Object) {
                            var hasChanged = this.hasChangedStep(newValues[key], oldValues[key]);
                            if (hasChanged) {
                                debugger;
                                return true;
                            }
                        } else if (key !== "status" && newValues[key] !== oldValues[key]) {
                            debugger;
                            return true;
                        }
                    }
                    return false;
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
