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
 * - formField
 *
 */
(function () {
    var app = angular.module('templates.directives.template', [
        'common.dialogs',
        'bootstrap-tagsinput'
    ]);

    /***************************************************************************/
    /*DIRECTIVES ***************************************************************/
    /***************************************************************************/
    app.directive("formField", ['$compile', '$dialogs', function ($compile, $dialogs) {
            return {
                restrict: 'E',
                replace: true,
                link: function (scope, element) {
                    var model = scope.field;
                    var template = '<div class="control-group">';

                    try {
                        if (model.type === "text") {
                            template +=
                                    '<label for="{{field.name}}"> {{field.label}}</label>' +
                                    '<div class="controls">' +
                                    '  <input type="text" name="{{field.name}}" ng-model="model.' + model.name + '" ' + (model.required ? "required" : "") + ' ng-readonly="viewMode === \'view\'">' +
                                    '</div>';
                        } else if (model.type === "select") {
                            template =
                                    '<label for="{{field.name}}"> {{field.label}}</label>' +
                                    '<div class="controls">' +
                                    '  <select class="form-control" name="{{field.name}}"' +
                                    '        ng-model="input.value"' +
                                    '        ng-options="option[1] as option[0] for option in input.options"' +
                                    '        required>' +
                                    '  </select>' +
                                    '</div>';
                        } else if (model.type === "checkbox") {
                            template +=
                                    '<input type="checkbox" name="{{field.name}}" ng-model="input.value">' +
                                    '<div class="controls">' +
                                    '  <label for="{{field.name}}"> {{field.label}}</label>' +
                                    '</div>';
                        } else if (model.type === "date") {
                            template +=
                                    '<label for="{{field.name}}"> {{field.label}}</label>' +
                                    '<div class="controls">' +
                                    '  <p class="input-group">' +
                                    '    <input type="text" class="form-control" uib-datepicker-popup="yyyy/MM/dd" ng-model="model.' + model.name + '" ' + (model.required ? "required" : "") + 'is-open="' + model.name + '_popup.opened"   close-text="Close" />' +
                                    '    <span class="input-group-btn">' +
                                    '     <button type="button" class="btn btn-default" ng-click="' + model.name + '_popup.opened = true;"><i class="glyphicon glyphicon-calendar"></i></button>' +
                                    '    </span>' +
                                    '  </p>' +
                                    '</div>';
                        } else if (model.type === "tag") {
                            template +=
                                    '<label for="{{field.name}}"> {{field.label}}</label>' +
                                    '<div class="controls">' +
                                    '  <bootstrap-tagsinput tagClass="label label-info" itemvalue="value" itemtext="text" name="{{field.name}}" ng-model="model.' + model.name + '" ' + (model.required ? "required" : "") + ' ng-readonly="viewMode === \'view\'"></<bootstrap-tagsinput>' +
                                    '</div>';
                        } else if (model.type === "data") {
                            template +=
                                    '<label for="{{field.name}}"> {{field.label}}</label><i name="{{field.name}}  ng-model="model.' + model.name + '"></i>';
                        } else {
                            throw 'Unknown input type ' + model.type + ' : ' + JSON.stringify(model);
                        }

                        template += '</div>'
                    } catch (err) {
                        debugger;
                        template = '<b color="red">Unknown input</b>';
                        $dialogs.showErrorDialog("Error while creating the form: " + err.split(":")[0], {
                            title: "Error while creating the form",
                            reportButton: true,
                            logMessage: err
                        });
                    }

                    $compile($(template).appendTo(element))(scope);
                }
            };
        }]);
})();
