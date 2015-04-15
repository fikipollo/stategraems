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
 *   - RAWData model
 */
Ext.define('SL.model.AnalysisModels.RAWDataModels.RAWData', {
    extend: 'SL.model.AnalysisModels.Non_processed_data',
    alias: 'widget.RAWData',
    requires: ['SL.model.AnalysisModels.RAWDataModels.ExtractionMethod'],
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        {name: 'type', defaultValue: 'rawdata'},
        {name: 'analyticalReplicate_id'},
        {name: 'analyticalReplicate_name'},
        {name: 'raw_data_type'}
    ],
    extractionMethod: null,
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getAnalyticalReplicateID: function() {
        return this.get('analyticalReplicate_id');
    },
    setAnalyticalReplicateID: function(analyticalReplicateID) {
        this.set('analyticalReplicate_id', analyticalReplicateID);
        this.setChanged();
    },
    getAnalyticalReplicateName: function() {
        return this.get('analyticalReplicate_name');
    },
    setAnalyticalReplicateName: function(analyticalReplicateName) {
        this.set('analyticalReplicate_name', analyticalReplicateName);
        this.setChanged();
    },
    getRawDataType: function() {
        return this.get('raw_data_type');
    },
    setRawDataType: function(rawDataType) {
        this.set('raw_data_type', rawDataType);
        this.setChanged();
    },
    getExtractionMethod: function() {
        return this.extractionMethod;
    },
    setExtractionMethod: function(extractionMethod) {
        if (extractionMethod == null) {
            return;
        }
        extractionMethod.set('rawdata_id', this.get('step_id'));
        this.extractionMethod = extractionMethod;
        this.setChanged();
    },
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    statics: {
        /********************************************************************************      
         * This static function creates a new RAWData MODEL using the information 
         * provided as a JSON
         *  
         * @param jsonData the data for the RAWData model in JSON format
         * @return the model with the loaded data    
         ********************************************************************************/
        loadFromJSON: function(jsonData) {
            var model = Ext.create('SL.model.AnalysisModels.RAWDataModels.RAWData');

            var extractionMethodJSONdata = jsonData['extractionMethod'];
            delete jsonData['extractionMethod'];

            var extractionMethod = jsonData['raw_data_type'];
            switch (extractionMethod) {
                case 'ChIP-seq':
                    extractionMethod = SL.model.AnalysisModels.RAWDataModels.ChIPseq.loadFromJSON(extractionMethodJSONdata);
                    break;
                case 'DNase-seq':
                    extractionMethod = SL.model.AnalysisModels.RAWDataModels.DNaseseq.loadFromJSON(extractionMethodJSONdata);
                    break;
                case 'mRNA-seq':
                    extractionMethod = SL.model.AnalysisModels.RAWDataModels.mRNAseq.loadFromJSON(extractionMethodJSONdata);
                    break;
                case 'GC-MS':
                    extractionMethod = SL.model.AnalysisModels.RAWDataModels.MassSpectrometry.loadFromJSON(extractionMethodJSONdata);
                    break;
                case 'LC-MS':
                    extractionMethod = SL.model.AnalysisModels.RAWDataModels.MassSpectrometry.loadFromJSON(extractionMethodJSONdata);
                    break;
                case 'CE-MS':
                    extractionMethod = SL.model.AnalysisModels.RAWDataModels.MassSpectrometry.loadFromJSON(extractionMethodJSONdata);
                    break;
                case 'MassSpectrometry':
                    extractionMethod = SL.model.AnalysisModels.RAWDataModels.MassSpectrometry.loadFromJSON(extractionMethodJSONdata);
                    break;
                case 'Methyl-seq':
                    extractionMethod = SL.model.AnalysisModels.RAWDataModels.Methylseq.loadFromJSON(extractionMethodJSONdata);
                    break;
                case 'smallRNA-seq':
                    extractionMethod = SL.model.AnalysisModels.RAWDataModels.smallRNAseq.loadFromJSON(extractionMethodJSONdata);
                    break;
                case 'NuclearMagneticResonance':
                    extractionMethod = SL.model.AnalysisModels.RAWDataModels.NuclearMagneticResonance.loadFromJSON(extractionMethodJSONdata);
                    break;
                default:
                    throw "Unknown Extraction method type.";
                    break;
            }
            model.setExtractionMethod(extractionMethod);
            model.set(jsonData);
            return model;
        }
    },
    /**BC********************************************************************
     * This function...
     *  
     * @return 
     *EC********************************************************************/
    getJSONforGraph: function() {
        var _parents_id = [];
        _parents_id.push(this.get('analyticalReplicate_id'));
        var json_data =
                {
                    id: this.get('step_id'),
                    name: (this.getName() != null ?  this.getName(): ""),
                    type: this.get('raw_data_type') , 
                    nodeType: 'RAWData',
                    summary: "TODO",
                    parents_id: _parents_id
                };

        return json_data;
    },
    /**BC********************************************************************
     * This function...
     *  
     * @return 
     *EC********************************************************************/
    toSimpleJSON: function() {
        var JSON_DATA = this.data;
        if (this.getExtractionMethod() != null) {
            JSON_DATA['extractionMethod'] = this.getExtractionMethod().toSimpleJSON();
        }
        if (this.getAssociatedQualityReport() != null) {
            JSON_DATA['associatedQualityReport'] = this.getAssociatedQualityReport().toSimpleJSON();
        } else {
            delete JSON_DATA['associatedQualityReport'];
        }
        var owners_JSON_DATA = [];
        var owners = this.getOwners();
        for (var i in owners) {
            owners_JSON_DATA.push(owners[i].toSimpleJSON());
        }
        //MERGE THE OBJECT
        if (owners_JSON_DATA != []) {
            JSON_DATA["step_owners"] = owners_JSON_DATA;
        }

        return JSON_DATA;
    },
    /**BC********************************************************************
     * This function check if the model is valid:
     * @return  True is everithing is OK, an  String with the error message in other case.
     *EC********************************************************************/
    isValid: function() {
        var ERROR_MESSAGE = "";
        var errors = this.validate();

        if (!errors.isValid()) {
            errors.each(function(item) {
                ERROR_MESSAGE += "</br>-  RAW data metadata error:   Field " + item.field + " " + item.message;
            });
        }
        return (ERROR_MESSAGE === "" ? true : ERROR_MESSAGE);
    }
});
