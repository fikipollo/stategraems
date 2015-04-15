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
 * - AnalyticalReplicate
 */
Ext.define('SL.model.SampleModels.AnalyticalReplicate', {
    extend: 'Ext.data.Model',
    alias: "widget.AnalyticalReplicate",
    //Extends the Observable class
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    fields: [
        {name: 'analytical_rep_id'},
        {name: 'analytical_rep_name'},
        {name: 'bioreplicate_id'},
        {name: 'biocondition_id'},
        {name: 'treatment_id'}
    ],
    getID: function () {
        return this.get("analytical_rep_id");
    },
    setID: function (analyticalRepID) {
        this.set("analytical_rep_id", analyticalRepID);
    },
    getAnalyticalRepID: function () {
        return this.get("analytical_rep_id");
    },
    setAnalyticalRepID: function (analyticalRepID) {
        this.set("analytical_rep_id", analyticalRepID);
    },
    getBioReplicateID: function () {
        return this.get("bioreplicate_id");
    },
    setBioReplicateID: function (analyticalRepName) {
        this.set("bioreplicate_id", analyticalRepName);
    },
    getAnalyticalRepName: function () {
        return this.get("analytical_rep_name");
    },
    setAnalyticalRepName: function (analyticalRepName) {
        this.set("analytical_rep_name", analyticalRepName);
    },
    getTreatmentID: function () {
        return this.get("treatment_id");
    },
    setTreatmentID: function (treatmentID) {
        this.set("treatment_id", treatmentID);
    },
    toSimpleJSON: function () {
        var JSON_DATA = this.data;
        return JSON_DATA;
    },
    loadFromJSON: function (jsonData, ignoreIDs) {
        if (ignoreIDs != null) {
            if (jsonData['analytical_rep_id']) {
                delete jsonData['analytical_rep_id'];
            }
        }
        this.set(jsonData);
        return this;
    },
    getJSONforGraph: function () {
        var nodeData = {
            id: this.getAnalyticalRepID(),
            label: (this.getAnalyticalRepName() != null ? this.getAnalyticalRepName().substring(0, 20) + (this.getAnalyticalRepName().length > 21 ? "..." : "") : ""),
            type: 'analyticalsample',
            description: "<b>Analytical Sample</b></br><i>" + (this.getAnalyticalRepName() != null ? this.getAnalyticalRepName() : "") + "</i>",
            parent: this.getBioReplicateID() + "-" + this.getTreatmentID()
        };

        return nodeData;
    },
    clone: function () {
        var newInstance = this.copy();
        var observers = this.getObservers();
        for (var i in observers) {
            newInstance.addObserver(observers[i]);
        }

        return newInstance;
    },
    getMemento: function () {
        return this.clone();
    }
});