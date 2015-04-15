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
 *   - ElementListSelector 
 *   - ElementSelectorField
 *   -
 */
Ext.define('SL.view.senchaExtensions.ElementListSelector', {
    extend: 'Ext.container.Container',
    alias: 'widget.ElementListSelector',
    requires: ['Ext.grid.plugin.RowExpander', 'SL.view.senchaExtensions.FilterList', 'SL.view.senchaExtensions.ItemSelector', 'SL.view.senchaExtensions.CheckableTextField'],
    title: "", padding: 10, border: 0,
    groupRows: false, gridPlugins: null, closable: false,
    // detects html tag
    tagsRe: /<[^>]*>/gm,
    // DEL ASCII code
    tagsProtect: '\x0f',
    // detects regexp reserved word
    regExpProtect: /\\|\/|\+|\\|\.|\[|\]|\{|\}|\?|\$|\*|\^|\|/gm,
    /**
     * Selects the previous row containing a match.
     * @private
     */
    addNewFilter: function () {
        var me = this;
        var elemAux = me.down('combobox');
        var fieldName = elemAux.getSubmitValue();

        var searchValue = elemAux.nextNode('textfield').getValue();

        if (searchValue === "")
            return;

        if (me.regExpMode === true) {
            try {
                searchValue = new RegExp(searchValue, 'g');
            } catch (err) {
                Ext.MessageBox.show({
                    title: 'Regular Expression error',
                    msg: 'Regular Expression not valid, please check it before continue.',
                    buttons: Ext.MessageBox.OK
                });
                return;
            }
        }

        me.down('FilterList').addFilter(["" + fieldName + ": " + searchValue], {property: fieldName, value: searchValue, anyMatch: true, caseSensitive: me.caseSensitive});
        elemAux = me.down("gridpanel");
        elemAux.getStore().filter([{property: fieldName, value: searchValue, anyMatch: true, caseSensitive: me.caseSensitive}]);
        elemAux.getStore().sort({property: fieldName, direction: 'ASC'});
        elemAux = elemAux.down('[dataIndex=' + fieldName + ']');
        elemAux.setVisible(true);
    },
    /**
     * Switch to case sensitive mode.
     * @private
     */
    caseSensitiveToggle: function (checkbox, checked) {
        this.caseSensitive = checked;
    },
    /**
     * Switch to regular expression mode
     * @private
     */
    regExpToggle: function (checkbox, checked) {
        this.regExpMode = checked;
        //The case sensitive checkbox should be disabled if reexp is disabled
        checkbox.nextNode('checkbox').setDisabled(!checked);
    },
    setData: function (data) {
        this.down('gridpanel').getStore().loadRawData(data);
        this.down('gridpanel').setLoading(false);
    },
    getSelectedData: function () {
        var selection = this.down("gridpanel").getSelectionModel().getSelection();
        var selected = [];
        for (var i = 0; i < selection.length; i++) {
            var elem = selection[i].data;
            selected.push(elem);
        }
        return selected;
    },
    getSelectedModels: function () {
        return this.down("gridpanel").getSelectionModel().getSelection();
    },
    getModels: function () {
        return this.down("gridpanel").getStore().data.items;
    },
    setPanelOptions: function (buttons) {
        this.queryById("panelOptionsTitle").setVisible(true);
        this.queryById("panelOptionsContainer").add(buttons);
    },
    initComponent: function () {
        var me = this;
        var _selModel = null;

        if (this.allowMultiselect) {
            _selModel = Ext.create('Ext.selection.CheckboxModel');
        } else {
            _selModel = Ext.create('Ext.selection.RowModel');
        }
        var _columns = [];
        var column = null;
        for (var i = 0; i < me.fieldsNames.length; i++) {
            column = {header: me.fieldsNames[i][0], dataIndex: me.fieldsNames[i][1]};
            if (me.columnsWidth.length > i && me.columnsWidth[i] > 0) {
                column.width = me.columnsWidth[i];
            } else if (me.columnsWidth.length > i && me.columnsWidth[i] === -1) {
                column.flex = 1;
            } else {
                column.hidden = true;
            }
            _columns.push(column);
        }
        this.defaults = {width: "90%"};
        this.width = "90%";
        this.layout = {type: "vbox", align: "center"};
        this.items = [
            {xtype: 'box', html: "<h1 class='form_title'>" + this.title + "</h1>"},
            {xtype: 'box', itemId: "panelOptionsTitle", hidden: true, html: "<h2 class='form_subtitle'>Options</h2>"},
            {xtype: 'container', itemId: "panelOptionsContainer", items: []},
            {xtype: 'box', html: "<h2 class='form_subtitle'>Filter</h2>"},
            {xtype: 'container', layout: {type: "hbox", padding: 5}, items: [
                    {xtype: 'combo', cls: 'combobox', editable: false, name: 'filteredField', displayField: 'name', valueField: 'value',
                        store: Ext.create('Ext.data.ArrayStore', {fields: ["name", "value"], data: me.fieldsNames}),
                        value: me.fieldsNames[0][1]
                    },
                    {xtype: 'textfield', name: 'searchField', hideLabel: true, width: 200},
                    {xtype: 'checkbox', boxLabel: 'Regular expression', margin: '0 0 0 4px', handler: me.regExpToggle, scope: me},
                    {xtype: 'checkbox', boxLabel: 'Case sensitive', disabled: true, margin: '0 0 0 4px', handler: me.caseSensitiveToggle, scope: me},
                    {xtype: 'button', text: '<i class="fa fa-plus-circle"></i> Add filter', tooltip: 'Add new filter', handler: me.addNewFilter, scope: me}
                ]},
            {xtype: "box", html: '<i class="panelHelpTip"><i class="fa fa-info-circle"></i> Click on each filter to remove.</i>'},
            {xtype: 'FilterList', fieldLabel: 'Current filters', name: 'current_filters',
                store: Ext.create('Ext.data.ArrayStore', {fields: ["value"], data: []}),
                displayField: 'value', valueField: 'value',
                listeners: {
                    changed: function (filterList) {
                        this.nextNode('gridpanel').store.clearFilter();
                        var filters = filterList.getAllInsertedFilters();
                        this.nextNode('gridpanel').store.filter(filters);
                    }
                }
            },
            //THE GRID PANEL THAT WILL CONTAIN THE SEARCH RESULTS
            {xtype: 'gridpanel', margin: 10, flex: 1, viewConfig: {stripeRows: true, markDirty: false},
                store: me.store, loading: true, selModel: _selModel,
                autoScroll: true, columns: _columns, plugins: me.gridPlugins,
                features: (me.groupRows === true) ? [{ftype: 'grouping'}] : null,
                listeners: {itemdblclick: me.gridpanelDblClickHandler}
            }
        ];

        if (this.title === "") {
            this.items.shift();
        }

        this.callParent(arguments);
    }
});

Ext.define('SL.view.senchaExtensions.ElementSelectorField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.ElementSelectorField',
    layout: {type: 'vbox', align: 'stretch'},
    fieldBodyCls: "elementSelectorFieldBody",
    buttonActions: null,
    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            defaults: {labelWidth: 220, labelAlign: 'right'}, writable: true, scope: me,
            buttonsText: ["Show details", "Browse"], fieldLabel: 'MyData',
            items: [
                {xtype: 'textfield', maxWidth: 600, name: me.name, itemId: "elementSelectorFieldTextField", fieldLabel: '', emptyText: "Not specified", allowBlank: false, readOnly: !me.writable},
                {xtype: 'label', itemId: "labelInvalid", html: '<b style="font-size: 12px;line-height:20px; color:red;"><i class="fa fa-exclamation-triangle"></i> This field is required.</b>'},
                {xtype: 'container', layout: {type: 'hbox', align: 'stretch'}, items: [
                        {xtype: 'button', action: 'searchElement',
                            margins: '0 5 0 0', maxHeight: 22, maxWidth: 30,
                            text: '<i class="fa fa-search"></i>', itemId: 'element_list_selector_edit_button', tooltip: 'Browse',
                            handler: ((me.buttonActions !== null) ? me.buttonActions[0] : undefined), scope: me.scope
                        },
                        {xtype: "label", html: "<i style='line-height:22px'>" + me.buttonsText[1] + "</i>", itemId: 'element_list_selector_edit_label'},
                        {xtype: 'button', action: 'inspectElement', itemId: 'element_list_selector_inspect_button',
                            margins: '0 5 0 5', maxHeight: 22, maxWidth: 30, text: '<i class="fa fa-search"></i> ',
                            handler: ((me.buttonActions !== null) ? me.buttonActions[1] : undefined), scope: me.scope
                        },
                        {xtype: "label", html: "<i style='line-height:22px'>" + me.buttonsText[0] + "</i>"}
                    ]
                }
            ]
        });
        me.callParent(arguments);
    },
    isValid: function () {
        var isValid = this.queryById("elementSelectorFieldTextField").validate() || this.isDisabled();
        this.queryById("labelInvalid").setVisible(!isValid);
        return isValid;
    },
    setText: function (_text) {
        this.queryById("elementSelectorFieldTextField").setFieldLabel(_text);
    },
    setValue: function (value) {
        this.value = value;
        this.queryById("elementSelectorFieldTextField").setRawValue(value);
        this.isValid();
    },
    setDisplayedValue: function (displayedValue) {
        this.queryById("elementSelectorFieldTextField").setRawValue(displayedValue);
        this.isValid();
    },
    getValue: function () {
        return this.value;
    },
    setName: function (name) {
        this.queryById("elementSelectorFieldTextField").name = name;
    },
    setInspectButtonEvent: function (_function) {
        this.queryById("element_list_selector_inspect_button").setHandler(_function);
    },
    setEditButtonEvent: function (_function) {
        this.queryById("element_list_selector_edit_button").setHandler(_function);
    },
    setSelectedObjects: function (_selectedObjects) {
        this.selectedObjects = _selectedObjects;
    },
    getSelectedObjects: function () {
        if (this.selectedObjects == null) {
            this.selectedObjects = [];
        }
        return this.selectedObjects;
    },
    setEditableMode: function (mode) {
        this.queryById("element_list_selector_edit_button").setVisible(mode);
        this.queryById("element_list_selector_edit_label").setVisible(mode);
        this.down("textfield").setReadOnly(!this.writable);
    },
    setEnabled: function (enabled) {
        this.setDisabled(!enabled);
    },
    clear: function () {
    }
});