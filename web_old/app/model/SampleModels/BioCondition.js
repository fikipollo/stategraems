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
 * - BioCondition
 */
Ext.define('SL.model.SampleModels.BioCondition', {
    extend: 'Ext.data.Model',
    alias: 'widget.BioCondition',
    //Extends the Observable class
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    requires: ['SL.model.User', 'SL.model.SampleModels.BioReplicate'],
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        {name: 'biocondition_id'},
        {name: 'name'},
        {name: 'title'},
        {name: 'organism'},
        {name: 'tissue_type'},
        {name: 'cell_type'},
        {name: 'cell_line'},
        {name: 'gender'},
        {name: 'genotype'},
        {name: 'other_biomaterial'},
        {name: 'treatment'},
        {name: 'dose'},
        {name: 'time'},
        {name: 'other_exp_cond'},
        {name: 'protocol_description'},
        {name: 'submission_date', convert: function (value, item) {
                return item.dateConversion(value);
            }},
        {name: 'last_edition_date', convert: function (value, item) {
                return item.dateConversion(value);
            }},
        {name: 'external_links'},
        {name: 'hasTreatmentDocument'}
    ],
    bioreplicates: null,
    owners: null,
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getID: function () {
        return this.get('biocondition_id');
    },
    setID: function (biocondition_id) {
        this.set('biocondition_id', biocondition_id);
        this.setChanged();
    },
    getName: function () {
        return this.get('name');
    },
    setName: function (name) {
        this.set('name', name);
        this.setChanged();
    },
    getTitle: function () {
        return this.get('title');
    },
    setTitle: function (title) {
        this.set('title', title);
        this.setChanged();
    },
    getOrganism: function () {
        return this.get('organism');
    },
    setOrganism: function (organism) {
        this.set('organism', organism);
        this.setChanged();
    },
    getTissue: function () {
        return this.get('tissue_type');
    },
    setTissue: function (tissue_type) {
        this.set('tissue_type', tissue_type);
        this.setChanged();
    },
    getCellType: function () {
        return this.get('cell_type');
    },
    setCellType: function (cell_type) {
        this.set('cell_type', cell_type);
        this.setChanged();
    },
    getCellLine: function () {
        return this.get('cell_line');
    },
    setCellLine: function (cell_line) {
        this.set('cell_line', cell_line);
        this.setChanged();
    },
    getGender: function () {
        return this.get('gender');
    },
    setGender: function (gender) {
        this.set('gender', gender);
        this.setChanged();
    },
    getGenotype: function () {
        return this.get('genotype');
    },
    setGenotype: function (genotype) {
        this.set('genotype', genotype);
        this.setChanged();
    },
    getOtherBiomaterial: function () {
        return this.get('other_biomaterial');
    },
    setOtherBiomaterial: function (other_biomaterial) {
        this.set('other_biomaterial', other_biomaterial);
        this.setChanged();
    },
    getTreatment: function () {
        return this.get('treatment');
    },
    setTreatment: function (treatment) {
        this.set('treatment', treatment);
        this.setChanged();
    },
    getDose: function () {
        return this.get('dose');
    },
    setDose: function (dose) {
        this.set('dose', dose);
        this.setChanged();
    },
    getTime: function () {
        return this.get('time');
    },
    setTime: function (time) {
        this.set('time', time);
        this.setChanged();
    },
    getOtherExperimentalConditions: function () {
        return this.get('other_exp_cond');
    },
    setOtherExperimentalConditions: function (other_exp_cond) {
        this.set('other_exp_cond', other_exp_cond);
        this.setChanged();
    },
    getProtocolDescription: function () {
        return this.get('protocol_description');
    },
    setProtocolDescription: function (protocol_description) {
        this.set('protocol_description', protocol_description);
        this.setChanged();
    },
    getOwners: function () {
        if (this.owners == null) {
            this.owners = [];
        }
        return this.owners;
    },
    setOwners: function (owners) {
        this.owners = owners;
        this.setChanged();
    },
    addOwner: function (newOwner) {
        if (typeof newOwner === "string") {
            var newOwnerID = newOwner;
            newOwner = Ext.create('SL.model.User');
            newOwner.setID(newOwnerID);
        }
        this.getOwners().push(newOwner);
        this.setChanged();
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
    getSubmissionDate: function () {
        return this.get('submission_date');
    },
    setSubmissionDate: function (submission_date) {
        this.set('submission_date', submission_date);
        this.setChanged();
    },
    getLastEditionDate: function () {
        return this.get('last_edition_date');
    },
    setLastEditionDate: function (last_edition_date) {
        this.set('last_edition_date', last_edition_date);
        this.setChanged();
    },
    getExternalLinks: function () {
        return this.get('external_links');
    },
    setExternalLinks: function (external_links) {
        this.set('external_links', external_links);
        this.setChanged();
    },
    getBioReplicates: function () {
        if (this.bioreplicates == null) {
            this.bioreplicates = [];
        }
        return this.bioreplicates;
    },
    setBioReplicates: function (bioreplicates) {
        this.bioreplicates = bioreplicates;
        this.setChanged();
    },
    addBioReplicate: function (bioreplicate) {
        this.getBioReplicates().push(bioreplicate);
        this.setChanged();
    },
    removeBioReplicate: function (bioreplicateID) {
        var bioReplicates = this.getBioReplicates();
        for (var i in bioReplicates) {
            if (bioReplicates[i].getID() === bioreplicateID) {
                var elem = this.getBioReplicates().splice(i, 1);
                this.setChanged();
                return elem[0];
            }
        }
        return null;
    },
    findBioReplicateByID: function (bioreplicateID) {
        var bioReplicates = this.getBioReplicates();
        for (var i in bioReplicates) {
            if (bioReplicates[i].getID().search(bioreplicateID) !== -1) {
                return bioReplicates[i];
            }
        }
        return null;
    },
    /**BC********************************************************************
     **OTHER METHODS
     **EC********************************************************************/
    toSimpleJSON: function (_recursive) {
        var JSON_DATA = this.data;
        var biological_rep_JSON_DATA = [];

        var recursive = (_recursive == null) ? true : _recursive;

        if (recursive) {
            var bioreplicates = this.getBioReplicates();
            for (var i in bioreplicates) {
                biological_rep_JSON_DATA.push(bioreplicates[i].toSimpleJSON());
            }
            //MERGE THE OBJECT
            if (biological_rep_JSON_DATA.length > 0) {
                JSON_DATA["associatedBioreplicates"] = biological_rep_JSON_DATA;
            }
        }

        var owners_JSON_DATA = [];
        var owners = this.getOwners();
//        var notRepeatedOwners = this.owners().collect('user_id');
        for (var i in owners) {
            owners_JSON_DATA.push(owners[i].toSimpleJSON());
        }
        //MERGE THE OBJECT
        if (owners_JSON_DATA.length > 0) {
            JSON_DATA["owners"] = owners_JSON_DATA;
        }

        return JSON_DATA;
    },
    statics: {
        /**BC******************************************************************************      
         * This static function creates a new MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData the data for the RAWData model in JSON format
         * @param ignoreIDs if defined, the model does not load the information about IDs (used when copying elements)
         * @return the model with the loaded data    
         **EC******************************************************************************/
        loadFromJSON: function (jsonData, ignoreIDs) {
            var model = Ext.create('SL.model.SampleModels.BioCondition');
            if (ignoreIDs != null) {
                if (jsonData['biocondition_id']) {
                    delete jsonData['biocondition_id'];
                }
            }

            var associatedBioreplicates = [];

            if (jsonData['associatedBioreplicates']) {
                var associatedBioreplicates_JSON_list = jsonData['associatedBioreplicates'];
                delete jsonData['associatedBioreplicates'];

                for (var i in associatedBioreplicates_JSON_list) {
                    associatedBioreplicates.push(SL.model.SampleModels.BioReplicate.loadFromJSON(associatedBioreplicates_JSON_list[i], ignoreIDs));
                }
            }

            var owners = [];
            if (jsonData['owners']) {
                var owners_JSON_list = jsonData['owners'];
                delete jsonData['owners'];

                for (var i in owners_JSON_list) {
                    owners.push(Ext.create('SL.model.User', owners_JSON_list[i]));
                }
            }
            model.set(jsonData);
            model.setBioReplicates(associatedBioreplicates);
            model.setOwners(owners);
            return model;
        }
    },
    /**BC********************************************************************************************
     ***  
     *** OTHER FUNCTIONS  
     ***
     **EC********************************************************************************************/
    getMemento: function () {
        var memento = this.copy();
        var bioreplicates = this.getBioReplicates();
        memento.setOwners(this.getOwners());
        for (var i in bioreplicates) {
            memento.addBioReplicate(bioreplicates[i].getMemento());
        }
        return memento;
    },
    restoreFromMemento: function (memento) {
        if (memento !== null) {
            this.copyFrom(memento);
            this.setOwners(memento.getOwners());
            var bioreplicatesMemento = memento.getBioReplicates();
            this.setBioReplicates(null);
            for (var i in bioreplicatesMemento) {
                this.addBioReplicate(bioreplicatesMemento[i]);
            }
            this.setChanged();
        }
    },
    /**BC********************************************************************************************
     * This function returns the next temporal ID for a new instance of BioReplicate added to this Biocondition
     * 
     * @returns nextFakeID the next temporal ID
     **EC********************************************************************************************/ 
    getJSONforGraph: function () {
        var nodeDataList = [];

        var bioreplicates = this.getBioReplicates();
        var batchesTable = {no_batch: []};
        var jsonDataAux;

        //1. First we need to separate the BioReplicates by batches
        var batch;
        for (var i in bioreplicates) {
            batch = bioreplicates[i].getAssociatedBatch();
            if (batch !== null) {
                if (batchesTable[batch.getID()] === undefined) {
                    batchesTable[batch.getID()] = [];
                }
                batchesTable[batch.getID()].push(bioreplicates[i]);
            } else {
                batchesTable["no_batch"].push(bioreplicates[i]);
            }
        }


        var offsetX = 120 * (bioreplicates.length/2 +1) ;
        var posX = 0 + offsetX;
        var posY = 0;
        //For each batch
        for (var i in batchesTable) {
            for (var j in batchesTable[i]) {
                jsonDataAux = batchesTable[i][j].getJSONforGraph(posX, posY);
                nodeDataList = nodeDataList.concat(jsonDataAux[0]);
                //If THE Y POSITION DIDN'T CHANGE (NO ANALYTYCAL SAMPLES)
                posY = (posY === jsonDataAux[1]) ? posY + 50 : jsonDataAux[1];
            }
        }

        var nodeData = {
            id: (this.getID() != "" ? this.getID() : "NOID"),
            label: (this.getName() != null ? this.getName().substring(0, 20) + (this.getName().length > 21 ? "..." : "") : ""),
            type: 'biocondition',
            description: "<b>Biological condition</b></br><i>" + (this.getName() != null ? "\n" + this.getName() : "") + "</i>",
            pos: [0, posY / 2]
        };

        nodeDataList.push(nodeData);

        return nodeDataList;
    },
    getNextFakeBioreplicateID: function () {
        var associatedBioreplicates = this.getBioReplicates();

        var nextFakeID = 0;
        var _otherID = "";
        for (var i in associatedBioreplicates) {
            _otherID = associatedBioreplicates[i].getID();
            if (_otherID.indexOf("f_BR") !== -1) {
                _otherID = _otherID.replace("f_BR","");
                nextFakeID = Math.max(parseInt(_otherID), nextFakeID);
            }
        }
        nextFakeID++;
        nextFakeID = "f_BR" + nextFakeID;
        return nextFakeID;
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

