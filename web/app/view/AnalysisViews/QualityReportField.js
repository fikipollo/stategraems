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
 * THIS FILE CONTAINS THE FOLLOWING COMPONENT DECLARATION
 * - QualityReportField
 * 
 */
Ext.define('SL.view.AnalysisViews.QualityReportField', {
    extend: 'Ext.container.Container',
    alias: 'widget.QualityReportField',
    requires: ['SL.view.AnalysisViews.SoftwareConfigurationField'],
    helpFileURL: "data/help/bioconditionview_help.json",
    helpTipsObjetive: "bioconditionFieldsPanel",
    cls: 'fieldBox', border: 0,
    /**BC****************************************************************************      
     * This function load a given Intermediate step MODEL into the current VIEW 
     *  
     * @param  model, the intermediate step model
     * @return      
     **EC****************************************************************************/
    loadModel: function (model) {
        //1. Load all data fields in the formulary
        this.model = model;
        this.setSoftware(model.getSoftware());
        this.setSoftwareVersion(model.getSoftwareVersion());
        this.setSoftwareConfiguration(model.getSoftwareConfiguration());
        this.setResults(model.getResults());
        this.setFileLocation(model.getFileLocation());
        this.setSubmissionDate(model.getSubmissionDate());
        this.queryById('qualityReportFields').setVisible(true);
        this.queryById('qualityReportAlternative').setVisible(false);
    },
    /**BC******************************************************************************      
     * This function return the associated model to the current VIEW 
     * @return  the RAWDATA model
     **EC******************************************************************************/
    getModel: function () {
        return this.model;
    },
    /**BC***************************************************************************      
     * GETTERS AND SETTERS
     **EC*****************************************************************************/
    getSoftware: function () {
        return this.queryById('softwareField').getValue();
    },
    setSoftware: function (software) {
        this.queryById('softwareField').setValue(software);
    },
    getSoftwareVersion: function () {
        return this.queryById('softwareVersionField').getValue();
    },
    setSoftwareVersion: function (softwareVersion) {
        this.queryById('softwareVersionField').setValue(softwareVersion);
    },
    getSoftwareConfiguration: function () {
        return this.queryById('softwareConfigurationField').getValue();
    },
    setSoftwareConfiguration: function (softwareConfiguration) {
        this.queryById('softwareConfigurationField').setValue(softwareConfiguration);
    },
    getResults: function () {
        return this.queryById('resultsField').getValue();
    },
    setResults: function (results) {
        this.queryById('resultsField').setValue(results);
    },
    getFileLocation: function () {
        return this.queryById('fileLocationField').getValue();
    },
    setFileLocation: function (filesLocation) {
        this.queryById('fileLocationField').setValue(filesLocation);
    },
    getSubmissionDate: function () {
        return this.queryById("submission_date").getValue();
    },
    setSubmissionDate: function (submissionDate) {
        this.queryById("submission_date").setValue(submissionDate);
    },
    setViewMode: function (mode) {
        var editable_mode = false;
        switch (mode) {
            //EDITION
            case "edition":
                editable_mode = true;
                break;
                //CREATION    
            case "creation":
                editable_mode = true;
                break;
                //INSPECT    
            case "inspect":
                editable_mode = false;
                break;
            default:
                break;
        }

        this.queryById('qualityReportFields').setVisible(editable_mode || this.getModel() != null);
        this.queryById('qualityReportAlternative').setVisible(!editable_mode && this.getModel() == null);
        this.queryById('softwareConfigurationField').setViewMode(mode);
    },
    cleanAndHide: function () {
        //1. Load all data fields in the formulary
        this.setSoftware("");
        this.setSoftwareVersion("");
        this.setSoftwareConfiguration("");
        this.setResults("");
        this.setFileLocation("");
        this.setSubmissionDate(null);
        if (this.model == null) {
            return;
        }
        this.model.deleteObserver(this);
        this.model = null;

        this.queryById('qualityReportFields').setVisible(false);
        this.queryById('qualityReportAlternative').setVisible(true);
    },
    /********************************************************************************      
     * This function changes the Editable mode setting of all formulary fields and all 
     * the inner panels.
     *  
     * @param  mode, a boolean value where true means "Editable mode ON"
     * @return      
     ********************************************************************************/
//    setEditableMode: function(mode) {
//        //Hide the panel temporaly to avoid problems with layout
//        var elements = this.query("field");
//        for (var i in elements) {
//            elements[i].setReadOnly(!mode);
//        }
//    },
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            layout: {type: 'vbox', align: 'stretch'}, msgTarget: 'side', itemId:"qualityReportField",
            items: [
                {xtype: 'box', itemId: 'qualityReportAlternative', html: '<i style="font-size:20px; color:#d6d6d6;">Not specified.</i>', },
                {xtype: "container", itemId: 'qualityReportFields', hidden: true, layout: {type: 'vbox', align: 'stretch'},
                    items: [
                        {xtype: 'combobox', fieldLabel: 'Software', name: 'qr_software', itemId: 'softwareField',
                            maxWidth: 550, maxLength: 200, enforceMaxLength: true, displayField: 'name', valueField: 'name',
                            hideTrigger: true, queryMode: 'local', blankText: 'Please type the used software.', emptyText: 'Select or type a software',
                            store: Ext.create('Ext.data.ArrayStore', {fields: ['name'], autoLoad: true, proxy: {type: 'ajax', url: 'data/software.json', reader: {type: 'json', root: 'software', successProperty: 'success'}}})
                        },
                        {xtype: 'textfield', fieldLabel: 'Software version', name: 'qr_software_version', itemId: 'softwareVersionField', maxWidth: 550, maxLength: 200, enforceMaxLength: true},
                        {xtype: 'SoftwareConfigurationField', name: 'qr_software_configuration', itemId: 'softwareConfigurationField'},
                        {xtype: 'textarea', fieldLabel: 'Observations/Results', name: 'qr_results', minHeight: 200, itemId: 'resultsField'},
                        {xtype: 'textarea', fieldLabel: 'File location', name: 'qr_files_location', itemId: 'fileLocationField'},
                        {xtype: 'datefield', fieldLabel: 'Submission date', name: 'qr_submission_date', itemId: 'submission_date', maxWidth: 420, format: 'Y/m/d',
                        }
                    ]}
            ],
//            listeners: {
//                boxready: function () {
////                    showHelpTips(this);
//                }
//            }
        });
        me.callParent(arguments);
    }
});
