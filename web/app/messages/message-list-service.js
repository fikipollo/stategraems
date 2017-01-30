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
 *     and others.
 *
 * THIS FILE CONTAINS THE FOLLOWING MODULE DECLARATION
 * - messages.services.message-list
 *
 */
(function () {
    var app = angular.module('messages.services.message-list', []);

    app.factory("MessageList", ['$rootScope', function ($rootScope) {
            var messages = [];
            var filters = [];
            var old = new Date(0);
            return {
                getMessages: function () {
                    return messages;
                },
                setMessages: function (_messages) {
                    messages = this.adaptInformation(_messages);
                    old = new Date();
                    return this;
                },
                getMessage: function (message_id) {
                    for (var i in messages) {
                        if (messages[i].message_id === message_id) {
                            return messages[i];
                        }
                    }
                    return null;
                },
                addMessage: function (message) {
                    var previous = this.getMessage(message.message_id);
                    if (previous === null) {
                        messages.push(message);
                    } else {
                        return this.updateMessage(message);
                    }
                    return message;
                },
                updateMessage: function (_message) {
                    var previous = this.getMessage(_message.message_id);
                    if (previous !== null) {
                        for (var i in _message) {
                            previous[i] = _message[i];
                        }
                    }
                    return previous;
                },
                deleteMessage: function (message_id) {
                    for (var i in messages) {
                        if (messages[i].message_id === message_id) {
                            messages.splice(i, 1);
                            break;
                        }
                    }
                    this.update();
                    return this;
                },
                getFilters: function () {
                    return filters;
                },
                setFilters: function (_filters) {
                    filters = _filters;
                    return this;
                },
                removeFilter: function (_filter) {
                    var pos = filters.indexOf(_filter);
                    if (pos !== -1) {
                        filters.splice(pos, 1);
                    }
                    return this;
                },
                getOld: function () {
                    return (new Date() - old) / 60000;
                },
                adaptInformation: function (_messages) {
                    return _messages;
                }
            };
        }]);
})();
