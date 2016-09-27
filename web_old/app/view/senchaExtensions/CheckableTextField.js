
Ext.define('SL.view.senchaExtensions.CheckableTextField' ,{
    extend: 'Ext.form.FieldContainer',
    alias : 'widget.CheckableTextField',
    
    combineErrors: true,
    msgTarget : 'side',
    layout: 'hbox',
    
    label: '',
    name: '',
    
    labelSize: 130,
    fieldSize: 200,
    

                    
    initComponent: function() {
        var me  = this;
        
        Ext.applyIf(this, {
            
            items: [
            {
                xtype: 'checkbox',
                name: me.name + 'Check',
                boxLabel: me.label,
                submitValue : false,
                width: me.labelSize,

                listeners: {
                    change: function(elem, newValue, oldValue, eOpts) {
                        if(newValue)
                            me.child('textfield').setDisabled(false);
                        else
                            me.child('textfield').setDisabled(true);
                    }
                }

            } , {
                xtype: 'textfield',
                name : me.name +'Field',
                disabled: true,
                allowBlank: false,
                width: me.fieldSize

            }
            ]
        });

        this.callParent(arguments);
    }

});