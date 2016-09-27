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
 * - User
 */
Ext.define('SL.model.User', {
    extend: 'Ext.data.Model',
    alias: 'widget.User',
    //Extends the Observable class
    mixins: {Observable: 'SL.view.senchaExtensions.Observable'},
    /**BC********************************************************************
     **
     **ATTRIBUTES
     **
     *EC********************************************************************/
    fields: [
        {name: 'user_id'},
        {name: 'email'},
        {name: 'role'},
        {name: 'loggedIn'}
    ],
    /**BC********************************************************************
     **
     **GETTERS AND SETTERS
     **
     *EC********************************************************************/
    getID: function() {
        return this.get('user_id');
    },
    setID: function(user_id) {
        this.set('user_id', user_id);
    },
    getEmail: function() {
        return this.get('email');
    },
    setEmail: function(email) {
        this.set('email', email);
    },
    getRole: function() {
        return this.get('role');
    },
    setRole: function(role) {
        this.set('role', role);
    },
    /**BC********************************************************************
     **
     **OTHER METHODS
     **
     *EC********************************************************************/
    toSimpleJSON: function() {
        var JSON_DATA = this.data;
        return JSON_DATA;
    },
    /********************************************************************************      
     * This function creates a new user MODEL using the information provided as a JSON
     *  
     * @param jsonData, the data for the user model in JSON format
     * @return the model with the loaded data    
     ********************************************************************************/
    statics: {
        loadFromJSON: function(jsonData) {
            var model = Ext.create('SL.model.User');
            model.set(jsonData);
            return model;
        }
    }
});