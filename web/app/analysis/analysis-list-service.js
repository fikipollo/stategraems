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
                clearAnalysis: function () {
                    analysis = [];
                    tags = [];
                    analysisTypes = [];
                    filters = [];
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
                        _analysis[i].tags = arrayUnique(_analysis[i].tags, [""]);

                        _analysis[i].isRemoved = _analysis[i].remove_requests.indexOf(Cookies.get('loggedUserID')) !== -1;
                        //GET NEXT STEP ID 
                        var maxStep = 0;
                        var steps = (_analysis[i].processed_data || []).concat(_analysis[i].non_processed_data || []); // Merges both arrays
                        for (var j in steps) {
                            maxStep = Math.max(maxStep, Number.parseInt(steps[j].step_id.split(".")[1]));
                        }
                        _analysis[i].nextStepID = maxStep + 1;

                        //ADAPT STEPS INFO
                        this.adaptStepInformation(_analysis[i].non_processed_data);
                        this.adaptStepInformation(_analysis[i].processed_data);

                        this.updateStepIndexes(_analysis[i]);
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

                        if (steps[i].type === "intermediate_data") {
                            steps[i].intermediate_data_type = steps[i].intermediate_data_type[0].toUpperCase() + steps[i].intermediate_data_type.substr(1);
                            steps[i].intermediate_data_type = steps[i].intermediate_data_type.replace("_step", "");
                        } else if (steps[i].type === "processed_data") {
                            steps[i].processed_data_type = steps[i].processed_data_type[0].toUpperCase() + steps[i].processed_data_type.substr(1);
                            steps[i].processed_data_type = steps[i].processed_data_type.replace("_step", "");
                        } else {
                            steps[i].analyticalReplicate_id = steps[i].analyticalReplicate_id || null;
                        }

                        //Adjust other_fields types
                        for (var key in steps[i].other_fields) {
                            if (!Number.isNaN(Number.parseFloat(steps[i].other_fields[key]))) {
                                steps[i].other_fields[key] = steps[i].other_fields[key] - 0;
                            }
                        }

                    }
                    return steps;
                },
                updateStepIndexes: function (analysis) {
                    var all_steps = {}, already_set = {}, step;

                    var updateRec = function (step, level) {
                        var maxLevel = level;
                        if (!already_set[step.step_id]) {
                            //INITILIZE THE LEVEL
                            step.step_number = level;
                            already_set[step.step_id] = step;
                            //INITILIZE THE LEVEL FOR ALL CHILD
                            for (var i in step.used_data) {
                                maxLevel = Math.max(maxLevel, updateRec(all_steps[step.used_data[i]], level + 1));
                            }
                        } else {
                            if (step.step_number < level) {
                                //UPDATE THE LEVEL 
                                step.step_number = level;
                                //UPDATE THE LEVEL FOR ALL CHILD
                                for (var i in step.used_data) {
                                    maxLevel = Math.max(maxLevel, updateRec(all_steps[step.used_data[i]], level + 1));
                                }
                            } else {
                                maxLevel = step.step_number;
                            }
                        }
                        return maxLevel;
                    };


                    var steps = (analysis.processed_data || []).concat(analysis.non_processed_data || []); // Merges both arrays
                    for (var i in steps) {
                        all_steps[steps[i].step_id] = steps[i];
                    }
                    var maxLevel = -1;
                    for (var i in steps) {
                        maxLevel = Math.max(maxLevel, updateRec(steps[i], 0));
                    }
                    //UPDATE THE NUMBERS
                    var nextNumber = 1;
                    for (var level = maxLevel; level >= 0; level--) {
                        for (var i = steps.length - 1; i >= 0; i--) {
                            if (steps[i].step_number === level) {
                                steps[i].step_number = nextNumber;
                                steps.splice(i, 1);
                                nextNumber++;
                            }
                        }
                    }
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
                hasChangedStep: function (newValues, oldValues) {
                    if ((newValues === undefined || oldValues === undefined) && newValues !== oldValues) {
                        return true;
                    }

                    //CHECK IF ARRAY
                    if (newValues instanceof Array) {
                        //1. Check if same type and same number of elements
                        if (!oldValues instanceof Array || newValues.length !== oldValues.length) {
                            return true;
                        }
                        //2. Check if arrays are similar (including order)
                        for (var i in newValues) {
                            var hasChanged = this.hasChangedStep(newValues[i], oldValues[i]);
                            if (hasChanged) {
                                return true;
                            }
                        }
                    } else if (newValues instanceof Object) {
                        //1. Check if same type and same number of properties
                        if (!oldValues instanceof Object) {
                            return true;
                        }
                        var newKeys = Object.keys(newValues).filter(function (key) {
                            return (key !== "status" && key !== "step_number" && key[0] !== "$")
                        });
                        var oldKeys = Object.keys(newValues).filter(function (key) {
                            return (key !== "status" && key !== "step_number" && key[0] !== "$")
                        });
                        if (newKeys.length !== oldKeys.length) {
                            return true;
                        }
                        //2. Check same properties and values
                        for (var i in newKeys) {
                            var hasChanged = this.hasChangedStep(newValues[newKeys[i]], oldValues[newKeys[i]]);
                            if (hasChanged) {
                                return true;
                            }
                        }
                    } else {
                        return newValues !== oldValues;
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
