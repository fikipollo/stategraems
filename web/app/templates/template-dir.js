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
        'bootstrap-tagsinput',
        'users.directives.user-list'
    ]);

    /***************************************************************************/
    /*DIRECTIVES ***************************************************************/
    /***************************************************************************/
    app.directive("formField", ['$compile', '$dialogs', '$http', function ($compile, $dialogs, $http) {
            return {
                restrict: 'E',
                replace: true,
                link: function (scope, element) {
                    var model = scope.field;
                    var template = '<div class="field-group row">';
                    try {
                        if (model.type === "text") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<input class="col-sm-9" type="text" placeholder="Not specified" name="{{field.name}}" ng-model="model.' + model.name + '" ' + (model.required ? "required" : "") + ' ng-readonly="viewMode === \'view\'">';
                        } else if (model.type === "textarea") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<textarea class="col-sm-9" rows="8" cols="50" name="{{field.name}}" ng-model="model.' + model.name + '" ' + (model.required ? "required" : "") + ' ng-readonly="viewMode === \'view\'">';
                        } else if (model.type === "select") {
                            if (model.free === false) {
                                template +=
                                        '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                        '<select  placeholder="Not specified" class="col-sm-9" class="form-control" name="{{field.name}}"' +
                                        '      ng-disabled="viewMode === \'view\'"' +
                                        '      ng-model="model.' + model.name + '" ' +
                                        '      ng-options="option.value as option.label for option in ' + model.name + '_options"' +
                                        '      ' + (model.required ? "required" : "") + '>' +
                                        '</select>';
                            } else {
                                template +=
                                        '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                        '<input class="col-sm-9" type="text" placeholder="Not specified" name="{{field.name}}" ' +
                                        '       ng-model="model.' + model.name + '" ' +
                                        '       uib-typeahead="option.label for option in ' + model.name + '_options | filter:$viewValue:startsWith"' +
                                        '   ' + (model.required ? "required" : "") +
                                        '       ng-readonly="viewMode === \'view\'">';
                            }

                            if (model.source) {
                                $http({
                                    method: 'GET',
                                    url: model.source,
                                }).success(function (options) {
                                    scope[model.name + "_options"] = options[model.name];
                                });
                            } else if (model.options) {
                                scope[model.name + "_options"] = model.options;
                            }
                        } else if (model.type === "checkbox") {
                            template +=
                                    '<input type="checkbox" name="{{field.name}}" ng-model="input.value" ' + (model.required ? "required" : "") + '> ' +
                                    '<label for="{{field.name}}"> {{field.label}}</label>';
                        } else if (model.type === "date") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<p style=" max-width: 155px; " class="col-sm-7 input-group">' +
                                    '  <input type="text" class="form-control" uib-datepicker-popup="yyyy/MM/dd" readonly="true" ng-model="model.' + model.name + '" ' + (model.required ? "required" : "") + 'is-open="' + model.name + '_popup.opened" close-text="Close" />' +
                                    '  <span class="input-group-btn" ng-hide="viewMode === \'view\'">' +
                                    '    <button type="button" class="btn btn-default" ng-click="' + model.name + '_popup.opened = true;"><i class="glyphicon glyphicon-calendar"></i></button>' +
                                    '  </span>' +
                                    '</p>';
                        } else if (model.type === "tag") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<bootstrap-tagsinput  class="col-sm-9" tagClass="label label-info" ' +
                                    '                      name="{{field.name}}" ' +
                                    '                      readOnly="(viewMode === \'view\')" ' +
                                    '                      ng-model="model.' + model.name + '" ' +
                                    '                      ' + (model.required ? "required" : "") + '>' +
                                    '</<bootstrap-tagsinput>';
                        } else if (model.type === "display") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<input class="col-sm-9" type="text" ng-model="model.' + model.name + '" ng-readonly="viewMode === \'view\'" disabled>';
                        } else if (model.type === "user_selector") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<user-selector-field  class="col-sm-9" name="{{field.name}}" ng-init="models=model.' + model.name + '"></user-selector-field>';
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
