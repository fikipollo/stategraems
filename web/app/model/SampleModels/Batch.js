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
 * - Batch
 */
Ext.define('SL.model.SampleModels.Batch', {
    extend: 'Ext.data.Model',
    alias: 'widget.Batch',
    //Extends the Observable class
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        {name: 'batch_id'},
        {name: 'batch_name'},
        {name: 'batch_creation_date', convert: function (v, rec) {
                return rec.dateConversion(v);
            }
        },
        {name: 'description'}
    ],
    owners: null,
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getID: function () {
        return this.get("batch_id");
    },
    setID: function (batch_id) {
        this.set("batch_id", batch_id);
        this.setChanged();
    },
    getName: function () {
        return this.get("batch_name");
    },
    setName: function (batchName) {
        this.set("batch_name", batchName);
        this.setChanged();
    },
    getCreationDate: function () {
        return this.get("batch_creation_date");
    },
    setCreationDate: function (batchCreationDate) {
        this.set("batch_creation_date", batchCreationDate);
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
    addOwner: function (newOwner) {
        this.getOwners().push(newOwner);
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
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    statics: {
        loadFromJSON: function (jsonData) {
            var model = Ext.create('SL.model.SampleModels.Batch');

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
    },
    toSimpleJSON: function () {
        var JSON_DATA = this.data;
        JSON_DATA["owners"] = this.getOwners();

        return JSON_DATA;
    },
    dateConversion: function (v) {
        if (v == null || v.length < 8) {
            return "";
        }
        if (v instanceof Date) {
            var formatNumber = function (number, length) {
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