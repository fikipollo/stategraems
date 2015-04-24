//@ sourceURL=ExtJS_extensions.js
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
 *     Rafael Hernandez de Diego
 *     rhernandez@cipf.es
 *     Ana Conesa Cegarra
 *     aconesa@cipf.es
 * 
 * THIS FILE CONTAINS THE FOLLOWING COMPONENT DECLARATION
 * - Ext.grid.column.CheckColumnCustom
 * - Ext.grid.column.ActionCustom
 * - Ext.grid.LiveSearchGridPanel
 */
Ext.define('Ext.grid.column.CheckColumn', {
    extend: 'Ext.grid.column.CheckColumn',
    alias: 'widget.customcheckcolumn',
    innerCls: Ext.baseCSSPrefix + 'grid-cell-inner-checkcolumn customcheckcolumn',
    renderer: function (value, meta) {
        var classes = "";
        if (this.disabled) {
            meta.tdCls += ' ' + this.disabledCls;
        }
        if (value) {
            classes = "fa-check-square fa-checkedcheckcolumn";
        } else {
            classes = "fa-square-o";
        }

        return '<i class="fa ' + classes + '"></i>';
    }
});

Ext.define('Ext.grid.column.ActionCustom', {
    extend: 'Ext.grid.column.Action',
    alias: ['widget.customactioncolumn'],
    innerCls: Ext.baseCSSPrefix + 'grid-cell-inner-action-col customactioncolumn',
    defaultRenderer: function (v, meta, record, rowIdx, colIdx, store, view) {
        var me = this, prefix = Ext.baseCSSPrefix,
                scope = me.origScope || me,
                items = me.items,
                len = items.length,
                i = 0,
                item, ret, disabled, tooltip;
        ret = Ext.isFunction(me.origRenderer) ? me.origRenderer.apply(scope, arguments) || '' : '';

        meta.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';
        for (; i < len; i++) {
            item = items[i];

            disabled = item.disabled || (item.isDisabled ? item.isDisabled.call(item.scope || scope, view, rowIdx, colIdx, item, record) : false);
            tooltip = disabled ? null : (item.tooltip || (item.getTip ? item.getTip.apply(item.scope || scope, arguments) : null));

            // Only process the item action setup once.
            if (!item.hasActionConfiguration) {
                // Apply our documented default to all items
                item.stopSelection = me.stopSelection;
                item.disable = Ext.Function.bind(me.disableAction, me, [i], 0);
                item.enable = Ext.Function.bind(me.enableAction, me, [i], 0);
                item.hasActionConfiguration = true;
            }
            ret += '<a href="javascript:void(0)" ' + ((item.style !== undefined) ? 'style="' + item.style + '"' : '') + ' class="' + prefix + 'action-col-icon ' + prefix + 'action-col-' + String(i) + ' ' + (disabled ? prefix + 'item-disabled' : ' ') +
                    ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || scope, arguments) : (item.iconCls || me.iconCls || '')) + '"' +
                    (tooltip ? ' data-qtip="' + tooltip + '</br>"' : '') + '>' + '<i class="fa ' + item.icon + '"></i> ' + item.text + '</a>';
        }
        return ret;
    }
});

Ext.define('Ext.grid.LiveSearchGridPanel', {
    extend: 'Ext.grid.Panel',
    alias: ['widget.livesearchgrid'],
    requires: ['Ext.toolbar.TextItem', 'Ext.form.field.Checkbox', 'Ext.form.field.Text'],
    searchValue: null, //search value initialization
    searchRegExp: null, //The generated regular expression used for searching.
    caseSensitive: false, //Case sensitive mode.
    regExpMode: false, //Regular expression mode.
    matchCls: 'x-livesearch-match', //The matched string css classe.
    tagsRe: /<[^>]*>/gm, // detects html tag
    tagsProtect: '\x0f', // DEL ASCII code
    regExpProtect: /\\|\/|\+|\\|\.|\[|\]|\{|\}|\?|\$|\*|\^|\|/gm, // detects regexp reserved word
    // Component initialization override: adds the top and bottom toolbars and setup headers renderer.
    initComponent: function () {
        var me = this;
        me.tbar = ['Search', {
                xtype: 'textfield',
                name: 'searchField',
                hideLabel: true,
                width: 200,
                listeners: {change: {fn: me.onTextFieldChange, scope: this, buffer: 100}}
            }, '-', {
                xtype: 'checkbox',
                hideLabel: true,
                margin: '0 0 0 4px',
                handler: me.regExpToggle,
                scope: me
            }, 'Regular expression', {
                xtype: 'checkbox',
                hideLabel: true,
                margin: '0 0 0 4px',
                handler: me.caseSensitiveToggle,
                scope: me
            }, 'Case sensitive'];

        me.callParent(arguments);
    },
    // afterRender override: it adds textfield and statusbar reference and start monitoring keydown events in textfield input 
    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        me.textField = me.down('textfield[name=searchField]');
    },
    /**
     * In normal mode it returns the value with protected regexp characters.
     * In regular expression mode it returns the raw value except if the regexp is invalid.
     * @return {String} The value to process or null if the textfield value is blank or invalid.
     * @private
     */
    getSearchValue: function () {
        var me = this;
        var value = me.textField.getValue();

        if (value === '') {
            return null;
        }
        if (!me.regExpMode) {
            value = value.replace(me.regExpProtect,
                    function (m) {
                        return '\\' + m;
                    });
        } else {
            try {
                new RegExp(value);
            } catch (error) {
                return null;
            }
            // this is stupid
            if (value === '^' || value === '$') {
                return null;
            }
        }

        return value;
    },
    /**
     * Finds all strings that matches the searched value in each grid cells.
     * @private
     */
    onTextFieldChange: function () {
        var me = this, count = 0;

        me.view.refresh();
        me.searchValue = me.getSearchValue();
        me.indexes = [];
        me.currentIndex = null;

        if (me.searchValue !== null) {
            me.searchRegExp = new RegExp(me.searchValue, (me.caseSensitive ? '' : 'i'));
            me.store.addFilter({id: "livesearch", property: "title", value: me.searchRegExp, root: 'data'});
        } else {
            me.store.removeFilter('livesearch');
        }
        me.getSelectionModel().deselectAll();
        me.textField.focus();
    },
    /**
     * Switch to case sensitive mode.
     * @private
     */
    caseSensitiveToggle: function (checkbox, checked) {
        this.caseSensitive = checked;
        this.onTextFieldChange();
    },
    /**
     * Switch to regular expression mode
     * @private
     */
    regExpToggle: function (checkbox, checked) {
        this.regExpMode = checked;
        this.onTextFieldChange();
    }
});

