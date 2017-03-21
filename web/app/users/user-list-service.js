/*
* (C) Copyright 2016 SLU Global Bioinformatics Centre, SLU
* (http://sgbc.slu.se) and the B3Africa Project (http://www.b3africa.org/).
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
*     Rafael Hernandez de Diego <rafahdediego@gmail.com>
*     Tomas Klingström
*     Erik Bongcam-Rudloff
*     and others.
*
* THIS FILE CONTAINS THE FOLLOWING MODULE DECLARATION
* - users.services.user-list
*
*/
(function(){
  var app = angular.module('users.services.user-list', []);

  app.factory("UserList", ['$rootScope', function($rootScope) {
    var users = [];
    var filters = [];
    var old = new Date(0);
    return {
      getUsers: function() {
        return users;
      },
      setUsers: function(_users) {
        users = _users;
        old = new Date();
        return this;
      },
      getUser: function(user_id) {
        for(var i in users){
          if(users[i].user_id === user_id){
            return users[i];
          }
        }
        return null;
      },
      getFilters: function() {
        return filters;
      },
      setFilters: function(_filters) {
        filters = _filters;
        return this;
      },
      removeFilter: function(_filter){
        var pos = filters.indexOf(_filter);
        if(pos !== -1){
          filters.splice(pos,1);
        }
        return this;
      },
      getOld: function(){
        return (new Date() - old)/60000;
      },
      getMemento : function(model){
          var memento = {};
          for(var key in model){
              memento[key] = model[key];
          }
          return memento;
      },
      restoreFromMemento : function(model, memento){
          for(var key in model){
              model[key] = memento[key];
          }
          return model;
      }
    };
  }]);
})();
