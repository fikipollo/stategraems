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
 *     
 * THIS FILE CONTAINS THE FOLLOWING COMPONENT DECLARATION
 * - Non_processed_data
 */
Ext.define('SL.model.AnalysisModels.Non_processed_data', {
    extend: 'Ext.data.Model',
    //Extends the Observable class
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    requires: ['SL.model.AnalysisModels.QualityReport'],
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        {name: 'step_id'},
        {name: 'step_number', defaultValue: 0},
        {name: 'step_name'},
        {name: 'type'},
        {name: 'submission_date', convert: function(v, rec) {
                return rec.dateConversion(v);
            }},
        {name: 'last_edition_date', convert: function(v, rec) {
                return rec.dateConversion(v);
            }},
        {name: 'files_location'}
    ],
    step_owners: null,
    qualityReport: null,
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getID: function() {
        return this.get('step_id');
    },
    setID: function(stepID) {
        this.set('step_id', stepID);
        this.setChanged();
    },
    getStepNumber: function() {
        return this.get('step_number');
    },
    setStepNumber: function(stepNumber) {
        this.set('step_number', stepNumber);
        this.setChanged();
    },
    getName: function() {
        return this.get('step_name');
    },
    setName: function(stepName) {
        this.set('step_name', stepName);
        this.setChanged();
    },
    getFileLocation: function() {
        return this.get('files_location');
    },
    setFileLocation: function(fileLocation) {
        this.set('files_location', fileLocation);
        this.setChanged();
    },
    getType: function() {
        return this.get('type');
    },
    getSubmissionDate: function() {
        return this.get('submission_date');
    },
    setSubmissionDate: function(submission_date) {
        this.set('submission_date', submission_date);
        this.setChanged();
    },
    getLastEditionDate: function() {
        return this.get('last_edition_date');
    },
    setLastEditionDate: function(last_edition_date) {
        this.set('last_edition_date', last_edition_date);
        this.setChanged();
    },
    getOwners: function() {
        if (this.step_owners == null) {
            this.step_owners = [];
        }
        return this.step_owners;
    },
    setOwners: function(step_owners) {
        this.step_owners = step_owners;
        this.setChanged();
    },
    addOwner: function(newOwner) {
        if (typeof newOwner === "string") {
            var newOwnerID = newOwner;
            newOwner = Ext.create('SL.model.User');
            newOwner.setID(newOwnerID);
        }
        this.getOwners().push(newOwner);
        this.setChanged();
    },
    isOwner: function(anUser) {
        if (typeof anUser === "string") {
            var owners = this.getOwners();
            for (var i in owners) {
                if (owners[i].getID() === anUser) {
                    return true;
                }
            }
            return false;
        } else {
            //TODO: WORKS?
            return this.getOwners().indexOf(anUser) !== -1;
        }
    },
    getAssociatedQualityReport: function() {
        return this.qualityReport;
    },
    setAssociatedQualityReport: function(qualityReport) {
        this.qualityReport = qualityReport;
        this.setChanged();
        if (qualityReport == null) {
            return;
        }
        qualityReport.set('studied_step_id', this.get('step_id'));
    },
    updateIDPrefix: function(previousIDPrefix,newIDPrefix) {
        this.setID(this.getID().replace(previousIDPrefix, newIDPrefix));
        //UPDATE THE ID FOR ALL THE USED STEPS
        if (this.getPreviousSteps !== undefined) {
            var previousSteps = this.getPreviousSteps();
            var newPreviousSteps = [];
            for (var i = 0; i < previousSteps.length; i++) {
                newPreviousSteps.push(previousSteps[i].replace(previousIDPrefix, newIDPrefix));
            }
            this.setPreviousStepsIDs(newPreviousSteps);
        }

        var qualityReport = this.getAssociatedQualityReport();
        if (qualityReport != null) {
            qualityReport.setStudiedStepID(this.getID());
        }
    },
    /**
     *  This function clones this object.
     *  First convert the current object to JSON string and then return the new instance
     *  using the loadFromJSON function (the object is converted first to String because
     *  if not, all the arrays should be cloned and code becomes hard, this a trick).
     *  
     *  @return a copy for the current object.
     */
    clone: function() {
        var newInstance = this.toSimpleJSON();
        //THIS IS NECCESSARY TO BE SURE THAT ALL THE ARRAYS ARE NEW OBJECTS 
        //IF NOT, THE USED DATA ARRAY IN INTERMEDIATE STEPS IS SHARED BETWEEN OBJECTS
        newInstance = Ext.encode(newInstance);
        newInstance = Ext.decode(newInstance);
        newInstance = SL.model.AnalysisModels.Non_processed_data.loadFromJSON(newInstance);
        return newInstance;
    },
    getJSONforGraph: function() {
        var json_data = {id: this.get('step_id'), title: "TODO", experimentClass: "", summary: "TODO", sons: []};
        return json_data;
    },
    toSimpleJSON: function() {
        var JSON_DATA = this.data;
        JSON_DATA["step_owners"] = this.getOwners();

        return JSON_DATA;
    },
    statics: {
        /********************************************************************************      
         * This static function creates a new Non_processed_Data MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the Non_processed_Data model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function(jsonData) {
            var model = null;
            switch (jsonData['type'])
            {
                case 'rawdata':
                    model = SL.model.AnalysisModels.RAWDataModels.RAWData.loadFromJSON(jsonData);
                    break;
                case 'intermediate_data':
                    model = SL.model.AnalysisModels.IntermediateDataModels.Intermediate_data.loadFromJSON(jsonData);
                    break;
                default:
                    return null;
                    break;
            }
            if (jsonData['associatedQualityReport'] != null) {
                model.setAssociatedQualityReport(SL.model.AnalysisModels.QualityReport.loadFromJSON(jsonData['associatedQualityReport']));
            }

            if (jsonData['step_owners'] != null) {
                var owners = [];
                var owners_JSON_list = jsonData['step_owners'];
                delete jsonData['step_owners'];

                for (var i in owners_JSON_list) {
                    owners.push(Ext.create('SL.model.User', owners_JSON_list[i]));
                }
                model.setOwners(owners);
            }
            return model;
        }
    },
    dateConversion: function(v) {
        if (v == null || v.length < 8) {
            return "";
        }
        if (v instanceof Date) {
            var formatNumber = function(number, length) {
                var str = '' + number;
                while (str.length < length) {
                    str = '0' + str;
                }
                return str;
            };
            v = v.getFullYear() + "/" + (formatNumber(v.getMonth() + 1, 2)) + "/" + formatNumber(v.getDate(), 2);
            return v;
        }
        if (v.indexOf("/") === -1)
            return v.slice(0, 4) + "/" + v.slice(4, 6) + "/" + v.slice(6, 8);
        else
            return v;
    }
});