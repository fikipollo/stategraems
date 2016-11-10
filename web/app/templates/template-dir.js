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
        'users.directives.user-list',
        'samples.directives.sample-views',
        'files.directives.file-list'
    ]);

    /***************************************************************************/
    /*DIRECTIVES ***************************************************************/
    /***************************************************************************/
    app.directive("formField", ['$compile', '$dialogs', '$http', function ($compile, $dialogs, $http) {
            return {
                restrict: 'E',
                replace: true,
                link: function ($scope, element) {
                    var model = $scope.field;
                    var template = '<div class="field-group row" ' + (model.dependency ? 'ng-show="model.' + model.dependency + '"' : '') + ">";
                    try {
                        if (model.type === "text") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<input class="col-sm-9" type="text" placeholder="Not specified" ' +
                                    '       name="{{field.name}}" ' +
                                    '       ng-model="model.' + model.name + '"' +
                                    '       ' + (model.required ? "required" : "") +
                                    '       ng-readonly="viewMode === \'view\'">';
                        } else if (model.type === "number") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<input class="col-sm-9" type="number"' +
                                    '       name="{{field.name}}" ' +
                                    '       ng-model="model.' + model.name + '"' +
                                    '       ' + (model.min ? 'min="' + model.min + '"' : '') +
                                    '       ' + (model.max ? 'max="' + model.max + '"' : '') +
                                    '       ' + (model.step ? 'step="' + model.step + '"' : '') +
                                    '       ' + (model.required ? "required" : "") +
                                    '       ng-readonly="viewMode === \'view\'">';
                        } else if (model.type === "textarea") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<textarea class="col-sm-9" rows="8" cols="50" ' +
                                    '          name="{{field.name}}" ' +
                                    '          ng-model="model.' + model.name + '"' +
                                    '          ' + (model.required ? "required" : "") +
                                    '          ng-readonly="viewMode === \'view\'">' +
                                    '</textarea>';
                        } else if (model.type === "select") {
                            if (model.free === false) {
                                template +=
                                        '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                        '<select class="col-sm-9" placeholder="Not specified" ' +
                                        '        name="{{field.name}}"' +
                                        '        ng-disabled="viewMode === \'view\'"' +
                                        '        ng-model="model.' + model.name + '"' +
                                        '        ng-options="option.value as option.label for option in options.' + model.name.replace(/\./, "_") + '"' +
                                        '        ' + (model.required ? "required" : "") + '>' +
                                        '</select>';
                            } else {
                                template +=
                                        '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                        '<input class="col-sm-9" type="text" placeholder="Not specified" name="{{field.name}}" ' +
                                        '       ng-model="model.' + model.name + '"' +
                                        '       uib-typeahead="option.label for option in options.' + model.name.replace(/\./, "_") + ' | filter:$viewValue:startsWith"' +
                                        '       ' + (model.required ? "required" : "") +
                                        '       ng-readonly="viewMode === \'view\'">';
                            }

                            if (model.source) {
                                $http({
                                    method: 'GET',
                                    url: model.source,
                                }).success(function (options) {
                                    $scope.options[model.name.replace(/\./, "_")] = options[model.name];
                                });
                            } else if (model.options) {
                                $scope.options[model.name.replace(/\./, "_")] = model.options;
                            }
                        } else if (model.type === "checkbox") {
                            template +=
                                    '<input type="checkbox" ' +
                                    '       name="{{field.name}}"' +
                                    '       ng-model="input.value"' +
                                    '       ' + (model.required ? "required" : "") +
                                    '       ng-readonly="viewMode === \'view\'">' +
                                    '<label for="{{field.name}}"> {{field.label}}</label>';
                        } else if (model.type === "date") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<p style=" max-width: 155px; " class="col-sm-7 input-group">' +
                                    '  <input type="text" class="form-control"' +
                                    '         uib-datepicker-popup="yyyy/MM/dd" ' +
                                    '         is-open="' + model.name + '_popup.opened" close-text="Close"' +
                                    '         ng-model="model.' + model.name + '"' +
                                    '         ' + (model.required ? "required" : "") +
                                    '         ng-readonly="true">' +
                                    '  <span class="input-group-btn" ng-hide="viewMode === \'view\'">' +
                                    '    <button type="button" class="btn btn-default"' +
                                    '            ng-click="' + model.name + '_popup.opened = true;"><i class="glyphicon glyphicon-calendar"></i>' +
                                    '    </button>' +
                                    '  </span>' +
                                    '</p>';
                        } else if (model.type === "tag") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<bootstrap-tagsinput  class="col-sm-9" tagClass="label label-info" ' +
                                    '                      name="{{field.name}}" ' +
                                    '                      ng-model="model.' + model.name + '" ' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      ng-readonly="viewMode === \'view\'">' +
                                    '</bootstrap-tagsinput>';
                        } else if (model.type === "display") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<input class="col-sm-9" type="text" disabled' +
                                    '       ng-model="model.' + model.name + '"' +
                                    '       ng-readonly="viewMode === \'view\'">';
                        } else if (model.type === "user_selector") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<user-selector-field  class="col-sm-9" ' +
                                    '                      name="{{field.name}}" ' +
                                    '                      ng-init="models=model.' + model.name + '"' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      ng-readonly="viewMode === \'view\'">' +
                                    '</user-selector-field>';
                        } else if (model.type === "output_files_selector") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<output-files-selector-field  class="col-sm-9" ' +
                                    '                      name="{{field.name}}" ' +
                                    '                      ng-init="models=model.' + model.name + '"' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      ng-readonly="viewMode === \'view\'">' +
                                    '</output-files-selector-field>';
                        } else if (model.type === "input_files_selector") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<input-files-selector-field  class="col-sm-9" ' +
                                    '                      name="{{field.name}}" ' +
                                    '                      ng-init="models=model.' + model.name + '"' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      ng-readonly="viewMode === \'view\'">' +
                                    '</input-files-selector-field>';
                        } else if (model.type === "sample_selector") {
                            template +=
                                    '<sample-selector-field name="{{field.name}}" ' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      ng-readonly="viewMode === \'view\'">' +
                                    '</sample-selector-field>';
                        } else {
                            throw 'Unknown input type ' + model.type + ' : ' + JSON.stringify(model);
                        }

                        template += '</div>';
                    } catch (err) {
                        debugger;
                        template = '<b color="red">Unknown input</b>';
                        $dialogs.showErrorDialog("Error while creating the form: " + err.split(":")[0], {
                            title: "Error while creating the form",
                            reportButton: true,
                            logMessage: err
                        });
                    }

                    $compile($(template).appendTo(element))($scope);
                }
            };
        }]);
})();
