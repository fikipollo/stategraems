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
 * - BioReplicate
 */
Ext.define('SL.model.SampleModels.BioReplicate', {
    extend: 'Ext.data.Model',
    alias: 'widget.BioReplicate',
    //Extends the Observable class
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    requires: ['SL.model.SampleModels.AnalyticalReplicate', 'SL.model.SampleModels.Batch', 'SL.model.SampleModels.Treatment'],
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        {name: 'biocondition_id'},
        {name: 'bioreplicate_id'},
        {name: 'bioreplicate_name'}
    ],
    analyticalReplicates: null,
    associatedBatch: null,
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getID: function () {
        return this.get("bioreplicate_id");
    },
    setID: function (bioreplicateID) {
        this.set("bioreplicate_id", bioreplicateID);
        this.setChanged();
    },
    getBioConditionID: function () {
        return this.get("biocondition_id");
    },
    setBioConditionID: function (bioconditionID) {
        this.set("biocondition_id", bioconditionID);
        this.setChanged();
    },
    getName: function () {
        return this.get("bioreplicate_name");
    },
    setName: function (bioreplicateName) {
        this.set("bioreplicate_name", bioreplicateName);
        this.setChanged();
    },
    getAnalyticalReplicates: function () {
        if (this.analyticalReplicates === null) {
            this.analyticalReplicates = [];
        }
        return this.analyticalReplicates;
    },
    setAnalyticalReplicates: function (analyticalReplicates) {
        this.analyticalReplicates = analyticalReplicates;
        this.setChanged();
    },
    addAnalyticalReplicate: function (analyticalReplicate) {
        this.getAnalyticalReplicates().push(analyticalReplicate);
        this.setChanged();
    },
    removeAnalyticalReplicate: function (analyticalReplicateID) {
        var analyticalReplicates = this.getAnalyticalReplicates();
        for (var i in analyticalReplicates) {
            if (analyticalReplicates[i].getID() === analyticalReplicateID) {
                var elem = this.getAnalyticalReplicates().splice(i, 1);
                this.setChanged();
                return elem[0];
            }
        }
        return null;
    },
    getAssociatedBatch: function () {
        return this.associatedBatch;
    },
    setAssociatedBatch: function (associatedBatch) {
        this.associatedBatch = associatedBatch;
        this.setChanged();
    },
    /**BC********************************************************************
     **OTHER METHODS
     **EC********************************************************************/
    toSimpleJSON: function (_recursive) {
        var recursive = (_recursive == null) ? true : _recursive;
        var JSON_DATA = this.data;
        if (recursive) {
            var analytical_rep_JSON_DATA = [];
            for (var i = 0; i < this.getAnalyticalReplicates().length; i++) {
                analytical_rep_JSON_DATA.push(this.analyticalReplicates[i].toSimpleJSON());
            }
            //MERGE THE OBJECT
            if (analytical_rep_JSON_DATA.length > 0) {
                JSON_DATA["associatedAnalyticalReplicates"] = analytical_rep_JSON_DATA;
            }
        }
        if (this.getAssociatedBatch() != null) {
            JSON_DATA["associatedBatch"] = {'batch_id': this.getAssociatedBatch().get('batch_id')};
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
            var model = Ext.create('SL.model.SampleModels.BioReplicate');
            if (ignoreIDs != null) {
                if (jsonData['bioreplicate_id']) {
                    delete jsonData['bioreplicate_id'];
                }
            }

            var associatedAnalyticalReplicates = [];

            if (jsonData['associatedAnalyticalReplicates']) {
                var associatedAnalyticalReplicates_JSON_list = jsonData['associatedAnalyticalReplicates'];
                delete jsonData['associatedAnalyticalReplicates'];

                for (var i in associatedAnalyticalReplicates_JSON_list) {
                    associatedAnalyticalReplicates.push(Ext.widget('AnalyticalReplicate').loadFromJSON(associatedAnalyticalReplicates_JSON_list[i], ignoreIDs));
                }
            }

            if (jsonData['associatedBatch']) {
                var associatedBatch_JSON = jsonData['associatedBatch'];
                delete jsonData['associatedBatch'];
                model.setAssociatedBatch(SL.model.SampleModels.Batch.loadFromJSON(associatedBatch_JSON));
            }

            model.set(jsonData);
            model.setAnalyticalReplicates(associatedAnalyticalReplicates);
            return model;
        }
    },
    getMemento: function () {
        var memento = this.copy();
        memento.setAssociatedBatch(this.getAssociatedBatch());
        var analyticalReplicates = this.getAnalyticalReplicates();
        for (var i in analyticalReplicates) {
            memento.addAnalyticalReplicate(analyticalReplicates[i].getMemento());
        }
        return memento;
    },
    restoreFromMemento: function (memento) {
        if (memento !== null) {
            this.copyFrom(memento);
            this.setAssociatedBatch(memento.getAssociatedBatch());
            this.setAnalyticalReplicates(null);
            var analyticalReplicates = memento.getAnalyticalReplicates();
            for (var i in analyticalReplicates) {
                this.addAnalyticalReplicate(analyticalReplicates[i]);
            }
            this.setChanged();
        }
    },
    /**BC********************************************************************************************
     ***  
     *** OTHER FUNCTIONS  
     ***
     **EC********************************************************************************************/
    getJSONforGraph: function (posX, posY) {
        var nodeDataList = [];

        //GENERATE THE NODES FOR THE ANALYTICAL SAMPLES CALCULATING THE POSITION
        var analyticalSamples = this.getAnalyticalReplicates();
        var jsonDataAux;

        //ANALYTICAL SAMPLES WILL BE DRAW GROUPED BY PROTOCOL SO WE SAVE IN A TABLE
        //FOR EACH PROTOCOL THE NODE DATA, THE POSITION FOR THE NODE AND THE LIST OF 
        //AS THAT BELONGS TO THE SAME PROTOCOL
        var protocolsTable = {};
        //THE OFFSET FOR PROTOCOLS  RESPECT THE BIOREPLICATE NODE
        var protocolsXOffset = 150;
        var protocolsYOffset = 150;

        //THE OFFSET FOR AS NODES RESPECT THE PREVIOUS AS NODE INSIDE THE PROTOCOL NODE
        var asOffsetX = 200;

        //Set the position for the first protocol (current pos + offset)
        var currentPosX = posX + protocolsXOffset;
        var currentPosY = posY;

        var analyticalSampledata, protocolNodeData;
        for (var i in analyticalSamples ) {
            jsonDataAux = analyticalSamples[i].getJSONforGraph();
            analyticalSampledata = jsonDataAux;

            //IF THE PROTOCOL WAS NOT INSERTED PREVIOUSLY save the position for the AS node 
            if (protocolsTable[analyticalSampledata.parent] === undefined) {
                protocolNodeData = {
                    id: analyticalSampledata.parent,
                    label: "Protocol",
                    type: 'protocol',
                    parent_id: this.getID(),
                    description: "<b>Protocol</b></br><i>" + analyticalSampledata.parent.slice(analyticalSampledata.parent.indexOf("-") + 1) + "</i>",
                    pos: [currentPosX, currentPosY]
                };

                analyticalSampledata.pos = [currentPosX + asOffsetX, currentPosY];

                protocolsTable[protocolNodeData.id] = [currentPosX + asOffsetX, currentPosY];

                nodeDataList.push(protocolNodeData);

                //CALCULATE THE Y POSITION FOR THE NEXT PROTOCOL NODE
                currentPosY += protocolsYOffset;
            } else {
                //GET THE POSTION FOR THE PREVIOUS AS NODE FOR THE ALREADY INSERTED PROTOCOL
                var lastASEntriePos = protocolsTable[analyticalSampledata.parent];
                //SET THE POSITION TO THE SAME POSITION OF THE PREVIOUS NODE FOR THE SAME TREATMENT + THE X AXIS OFFSET 
                analyticalSampledata.pos = [lastASEntriePos[0] + asOffsetX, lastASEntriePos[1]];
                protocolsTable[analyticalSampledata.parent] = analyticalSampledata.pos;
            }
            nodeDataList.push(analyticalSampledata);
        }

        if(analyticalSamples.length === 0)
            currentPosY += protocolsYOffset;


        //FINALLY CALCULATE THE POSITION FOR THE BIOREPLICATE NODE (THE Y POSITION WILL BE THE
        //MIDDLE POINT RESPECT ALL THE PROTOCOL NODES)
        posY = posY - protocolsYOffset/2 + (currentPosY - posY) / 2;

        //GENERATE THE NODE FOR THE BIOREPLICATE
        var nodeData = {
            id: this.getID(),
            label: (this.getName() != null ? this.getName().substring(0, 20) + (this.getName().length > 21 ? "..." : "") : ""),
            type: 'bioreplicate',
            parent_id: this.getBioConditionID(),
            description: "<b>Biological replicate</b></br><i>" + (this.getName() != null ? this.getName() : "") + "</i>",
            pos: [posX, posY]
        };
        nodeDataList.push(nodeData);

        //GENERATE THE NODE FOR THE BATCH
        if (this.getAssociatedBatch() != null) {
            nodeData.parent = this.getAssociatedBatch().getID();
            var batchNodeData = {
                id: this.getAssociatedBatch().getID(),
                label: "Batch " + this.getAssociatedBatch().getID(),
                parent_id: this.getID(),
                description: "<b>Batch</b></br><i>" + this.getAssociatedBatch().getID() + "</i>",
                type: 'batch'
            };
            nodeDataList.push(batchNodeData);
        }

        return [nodeDataList, currentPosY];
    },
    getNextFakeAnalyticalRepID: function () {
        var analyticalReplicates = this.getAnalyticalReplicates();

        var nextFakeID = 0;
        var _otherID = "";
        for (var i in analyticalReplicates) {
            _otherID = analyticalReplicates[i].getID();
            if (_otherID.indexOf("f_AR") !== -1) {
                var pointPos = _otherID.lastIndexOf(".");
                _otherID = _otherID.slice(pointPos + 1);
                nextFakeID = Math.max(parseInt(_otherID), nextFakeID);
            }
        }
        nextFakeID++;
        nextFakeID = this.get('bioreplicate_id').replace("BR", "AR") + "." + nextFakeID;
        if (nextFakeID.indexOf("f_") === -1) {
            nextFakeID = "f_" + nextFakeID;
        }
        return nextFakeID;
    }
});