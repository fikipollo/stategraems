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
 * - Experiment
 */
Ext.define('SL.model.Experiment', {
    extend: 'Ext.data.Model',
    alias: 'widget.Experiment',
    //Extends the Observable class
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    fields: [
        {name: 'experiment_id'},
        {name: 'title'},
        {name: 'experiment_description'},
        {name: 'public_references'},
        {name: 'is_time_course_type'},
        {name: 'is_case_control_type'},
        {name: 'is_survival_type'},
        {name: 'is_single_condition'},
        {name: 'is_multiple_conditions'},
        {name: 'is_other_type'},
        {name: 'biological_rep_no', defaultValue: 0},
        {name: 'technical_rep_no', defaultValue: 0},
        {name: 'contains_chipseq', defaultValue: 0},
        {name: 'contains_dnaseseq', defaultValue: 0},
        {name: 'contains_methylseq', defaultValue: 0},
        {name: 'contains_mrnaseq', defaultValue: 0},
        {name: 'contains_mirnaseq', defaultValue: 0},
        {name: 'contains_metabolomics', defaultValue: 0},
        {name: 'contains_proteomics', defaultValue: 0},
        {name: 'contains_other', defaultValue: false},
        {name: 'submission_date', convert: function(v, rec) {
                return rec.dateConversion(v);
            }},
        {name: 'last_edition_date', convert: function(v, rec) {
                return rec.dateConversion(v);
            }},
        {name: 'experimentDataDirectory'}
    ],
    experiment_owners: [],
    experiment_members: [],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getID: function() {
        return this.get('experiment_id');
    },
    setID: function(value) {
        this.set('experiment_id', value);
        this.setChanged();
    },
    getTitle: function() {
        return this.get('title');
    },
    setTitle: function(value) {
        this.set('title', value);
        this.setChanged();
    },
    getDescription: function() {
        return this.get('experiment_description');
    },
    setDescription: function(value) {
        this.set('experiment_description', value);
        this.setChanged();
    },
    getPublicReferences: function() {
        return this.get('public_references');
    },
    setPublicReferences: function(value) {
        this.set('public_references', value);
        this.setChanged();
    },
    isTimeCourseType: function() {
        return this.get('is_time_course_type');
    },
    setIsTimeCourseType: function(value) {
        this.set('is_time_course_type', value);
        this.setChanged();
    },
    isCaseControlType: function() {
        return this.get('is_case_control_type');
    },
    setIsCaseControlType: function(value) {
        this.set('is_case_control_type', value);
        this.setChanged();
    },
    isSurvivalType: function() {
        return this.get('is_survival_type');
    },
    setIsSurvivalType: function(value) {
        this.set('is_survival_type', value);
        this.setChanged();
    },
    isSingleCondition: function() {
        return this.get('is_single_condition');
    },
    setIsSingleCondition: function(value) {
        this.set('is_single_condition', value);
        this.setChanged();
    },
    isMultipleCondition: function() {
        return this.get('is_multiple_conditions');
    },
    setIsMultipleCondition: function(value) {
        this.set('is_multiple_conditions', value);
        this.setChanged();
    },
    isOtherType: function() {
        return this.get('is_other_type');
    },
    setIsOtherType: function(value) {
        this.set('is_other_type', value);
        this.setChanged();
    },
    getContainsChipSeq: function() {
        return this.get('contains_chipseq');
    },
    setContainsChipSeq: function(value) {
        this.set('contains_chipseq', value);
        this.setChanged();
    },
    getContainsDNaseSeq: function() {
        return this.get('contains_dnaseseq');
    },
    setContainsDNaseSeq: function(value) {
        this.set('contains_dnaseseq', value);
        this.setChanged();
    },
    getContainsMethylSeq: function() {
        return this.get('contains_methylseq');
    },
    setContainsMethylSeq: function(value) {
        this.set('contains_methylseq', value);
        this.setChanged();
    },
    getContainsmRNASeq: function() {
        return this.get('contains_mrnaseq');
    },
    setContainsmRNASeq: function(value) {
        this.set('contains_mrnaseq', value);
        this.setChanged();
    },
    getContainsSmallRNASeq: function() {
        return this.get('contains_mirnaseq');
    },
    setContainsSmallRNASeq: function(value) {
        this.set('contains_mirnaseq', value);
        this.setChanged();
    },
    getContainsMetabolomics: function() {
        return this.get('contains_metabolomics');
    },
    setContainsMetabolomics: function(value) {
        this.set('contains_metabolomics', value);
        this.setChanged();
    },
    getContainsProteomics: function() {
        return this.get('contains_proteomics');
    },
    setContainsProteomics: function(value) {
        this.set('contains_proteomics', value);
        this.setChanged();
    },
    getContainsOther: function() {
        return this.get('contains_other');
    },
    setContainsOther: function(value) {
        this.set('contains_other', value);
        this.setChanged();
    },
    getSubmissionDate: function() {
        return this.get("submission_date");
    },
    setSubmissionDate: function(value) {
        this.set("submission_date", value);
        this.setChanged();
    },
    getLastEditionDate: function() {
        return this.get("last_edition_date");
    },
    setLastEditionDate: function(value) {
        this.set("last_edition_date", value);
        this.setChanged();
    },
    getOwners: function() {
        if (this.experiment_owners == null) {
            this.experiment_owners = [];
        }
        return this.experiment_owners;
    },
    setOwners: function(experiment_owners) {
        this.experiment_owners = experiment_owners;
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
    getMembers: function() {
        if (this.experiment_members == null) {
            this.experiment_members = [];
        }
        return this.experiment_members;
    },
    setMembers: function(experiment_members) {
        this.experiment_members = experiment_members;
        this.setChanged();
    },
    addMember: function(newMember) {
        if (typeof newMember === "string") {
            var newMemberID = newMember;
            newMember = Ext.create('SL.model.User');
            newMember.setID(newMemberID);
        }
        this.getMembers().push(newMember);
        this.setChanged();
    },
    isMember: function(anUser) {
        if (typeof anUser === "string") {
            var members = this.getMembers();
            for (var i in members) {
                if (members[i].getID() === anUser) {
                    return true;
                }
            }
            return false;
        } else {
            //TODO: WORKS?
            return this.getMembers().indexOf(anUser) !== -1;
        }
    },    
    setExperimentDataDirectory: function(value) {
        this.set('experimentDataDirectory', value);
        this.setChanged();
    },
    getExperimentDataDirectory: function() {
        return this.get('experimentDataDirectory');
    },
    /**BC********************************************************************************************
     ***  
     *** OTHER FUNCTIONS  
     ***
     **EC********************************************************************************************/
    getMemento: function() {
        var memento = this.copy();
        memento.setOwners(this.getOwners());
        memento.setMembers(this.getMembers());
        return memento;
    },
    restoreFromMemento: function(memento) {
        if (memento !== null) {
            this.copyFrom(memento);
            this.setOwners(memento.getOwners());
            this.setMembers(memento.getMembers());
            this.setChanged();
        }
    },
    toSimpleJSON: function() {
        var JSON_DATA = this.data;

        var owners_JSON_DATA = [];
        var owners = this.getOwners();
        for (var i in owners) {
            owners_JSON_DATA.push(owners[i].toSimpleJSON());
        }
        //MERGE THE OBJECT
        if (owners_JSON_DATA.length > 0) {
            JSON_DATA["experiment_owners"] = owners_JSON_DATA;
        }

        var members_JSON_DATA = [];
        var members = this.getMembers();
        for (var i in members) {
            members_JSON_DATA.push(members[i].toSimpleJSON());
        }
        //MERGE THE OBJECT
        if (members_JSON_DATA.length > 0) {
            JSON_DATA["experiment_members"] = members_JSON_DATA;
        }

        return JSON_DATA;
    },
    statics: {
        /********************************************************************************      
         * This function creates a new MODEL using the information provided as a JSON
         *  
         * @param jsonData, the data for the model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function(jsonData) {
            var model = Ext.create('SL.model.Experiment');

            var experiment_owners = [];
            if (jsonData['experiment_owners']) {
                var owners_JSON_list = jsonData['experiment_owners'];
                delete jsonData['experiment_owners'];

                for (var i in owners_JSON_list) {
                    experiment_owners.push(Ext.create('SL.model.User', owners_JSON_list[i]));
                }
            }
            model.setOwners(experiment_owners);

            var experiment_members = [];
            if (jsonData['experiment_members']) {
                var members_JSON_list = jsonData['experiment_members'];
                delete jsonData['experiment_members'];

                for (var i in members_JSON_list) {
                    experiment_members.push(Ext.create('SL.model.User', members_JSON_list[i]));
                }
            }
            model.setMembers(experiment_members);
            model.set(jsonData);
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


