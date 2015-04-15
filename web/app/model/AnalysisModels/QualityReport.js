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
 * - QualityReport
 */
Ext.define('SL.model.AnalysisModels.QualityReport', {
    extend: 'Ext.data.Model',
    alias: 'widget.QualityReport',
    //Extends the Observable class
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    fields: [
        {name: 'studied_step_id'},
        {name: 'software'},
        {name: 'software_version'},
        {name: 'software_configuration'},
        {name: 'results'},
        {name: 'files_location'},
        {name: 'submission_date', convert: function(v, rec) {
                return rec.dateConversion(v);
            }}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getStudiedStepID: function() {
        return this.get('studied_step_id');
    },
    setStudiedStepID: function(studied_step_id) {
        this.set('studied_step_id', studied_step_id);
        this.setChanged();
    },
    getSoftware: function() {
        return this.get('software');
    },
    setSoftware: function(software) {
        this.set('software', software);
        this.setChanged();
    },
    getSoftwareVersion: function() {
        return this.get('software_version');
    },
    setSoftwareVersion: function(software_version) {
        this.set('software_version', software_version);
        this.setChanged();
    },
    getSoftwareConfiguration: function() {
        return this.get('software_configuration');
    },
    setSoftwareConfiguration: function(software_configuration) {
        this.set('software_configuration', software_configuration);
        this.setChanged();
    },
    getResults: function() {
        return this.get('results');
    },
    setResults: function(results) {
        this.set('results', results);
        this.setChanged();
    },
    getFileLocation: function() {
        return this.get('files_location');
    },
    setFileLocation: function(files_location) {
        this.set('files_location', files_location);
        this.setChanged();
    },
    getSubmissionDate: function() {
        return this.get('submission_date');
    },
    setSubmissionDate: function(submission_date) {
        this.set('submission_date', submission_date);
        this.setChanged();
    },
    isEmpty: function() {
        return (this.getSoftware() === "" || this.getSoftware() == null) &&
                this.getSoftwareVersion() === "" &&
                (this.getSoftwareConfiguration() === "" || this.getSoftwareConfiguration() == null) &&
                this.getResults() === "" &&
                this.getSubmissionDate() === "";
    },
    statics: {
        /********************************************************************************      
         * This static function creates a new Intermediate step MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData, the data for the Intermediate step model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function(jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.QualityReport');
            model.set(jsonData);
            return model;
        }
    },
    getJSONforGraph: function() {
        var json_data = {
            id: "qr_" + this.getStudiedStepID(),
            name: "",
            type: "Quality report",
            nodeType: "Quality_report",
            summary: "TODO",
            parents_id: [this.getStudiedStepID()],
        };
        return json_data;
    },
    toSimpleJSON: function() {
        return this.data;
    },
    dateConversion: function(v) {
        if (v == null || v.length < 8) {
            return ""
        }
        if (v instanceof Date) {
            var formatNumber = function(number, length) {
                var str = '' + number;
                while (str.length < length) {
                    str = '0' + str;
                }
                return str;
            }
            v = v.getFullYear() + "/" + (formatNumber(v.getMonth() + 1, 2)) + "/" + formatNumber(v.getDate(), 2);
            return v;
        }
        if (v.indexOf("/") === -1)
            return v.slice(0, 4) + "/" + v.slice(4, 6) + "/" + v.slice(6, 8);
        else
            return v;
    }

});