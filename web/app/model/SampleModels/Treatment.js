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
 * - Treatment
 */
Ext.define('SL.model.SampleModels.Treatment', {
    extend: 'Ext.data.Model',
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        {name: 'treatment_id'},
        {name: 'treatment_name'},
        {name: 'biomolecule'},
        {name: 'description'},
        {name: 'hasSOPFile'}
    ],
    owners: null,
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getID: function () {
        return this.get("treatment_id");
    },
    setID: function (treatment_id) {
        this.set("treatment_id", treatment_id);
        this.setChanged();
    },
    getName: function () {
        return this.get("treatment_name");
    },
    setName: function (treatment_name) {
        this.set("treatment_name", treatment_name);
        this.setChanged();
    },
    getBiomolecule: function () {
        return this.get("biomolecule");
    },
    setBiomolecule: function (biomolecule) {
        this.set("biomolecule", biomolecule);
        this.setChanged();
    },
    getDescription: function () {
        return this.get("description");
    },
    setDescription: function (description) {
        this.set("description", description);
        this.setChanged();
    },
    getOwners: function () {
        if (this.owners === null) {
            this.owners = [];
        }
        return this.owners;
    },
    setOwners: function (owners) {
        this.owners = owners;
        this.setChanged();
    },
    addOwner: function (user_name) {
        this.getOwners().push(user_name);
        this.setChanged();
    },
    removeOwner: function (userID) {
        var owners = this.getOwners();
        for (var i in owners) {
            if (owners[i].getID() === userID) {
                var elem = this.getOwners().splice(i, 1);
                this.setChanged();
                return elem[0];
            }
        }
        return null;
    },
    isOwner: function (anUser) {
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
    toSimpleJSON: function () {
        var JSON_DATA = this.data;
        JSON_DATA["owners"] = this.getOwners();

        return JSON_DATA;
    },
    /********************************************************************************      
     * This function creates a new Treatment MODEL using the information provided as a JSON
     *  
     * @param jsonData, the data for the treatment model in JSON format
     * @return the model with the loaded data    
     ********************************************************************************/
    statics: {
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.SampleModels.Treatment');

            if (jsonData['owners'] != null) {
                var ownersJSONdata = jsonData['owners'];
                delete jsonData['owners'];
                for (var i in ownersJSONdata) {
                    model.addOwner(SL.model.User.loadFromJSON(ownersJSONdata[i]));
                }
            }
            model.set(jsonData);
            return model;
        }
    }
});