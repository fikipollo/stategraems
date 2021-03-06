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
        'ang-dialogs',
        'ang-tags',
        'users.directives.user-list',
        'samples.directives.sample-views',
        'protocols.directives.protocol-views',
        'files.directives.file-list',
        'ngSanitize'
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
                        if (model.type === "subtitle") {
                            template +=
                                    '<h4 class="ng-binding" style=" margin-left: 20px; color: #408ccd; ">{{field.label}}</h4>';
                        } else if (model.type === "text") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<input class="col-sm-9" type="text" placeholder="Not specified" ' +
                                    '       name="{{field.name}}" ' +
                                    '       ng-model="model.' + model.name + '"' +
                                    '       ' + (model.required ? 'ng-required="' + model.required + '"' : "") +
                                    '       ng-readonly="viewMode === \'view\'">' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                        } else if (model.type === "password") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<input class="col-sm-9" type="password" ' +
                                    '       name="{{field.name}}" ' +
                                    '       ng-model="model.' + model.name + '"' +
                                    '       ' + (model.required ? 'ng-required="' + model.required + '"' : "") +
                                    '       ng-readonly="viewMode === \'view\'">' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                        } else if (model.type === "number") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<input class="col-sm-9" type="number"' +
                                    '       name="{{field.name}}" ' +
                                    '       ng-model="model.' + model.name + '"' +
                                    '       ' + (model.min ? 'min="' + model.min + '"' : '') +
                                    '       ' + (model.max ? 'max="' + model.max + '"' : '') +
                                    '       ' + (model.step ? 'step="' + model.step + '"' : '') +
                                    '       ' + (model.required ? 'ng-required="' + model.required + '"' : "") +
                                    '       ng-readonly="viewMode === \'view\'">' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                        } else if (model.type === "textarea") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<textarea class="col-sm-9" rows="8" cols="50" ' +
                                    '          name="{{field.name}}" ' +
                                    '          ng-model="model.' + model.name + '"' +
                                    '          ' + (model.required ? "required" : "") +
                                    '          ng-readonly="viewMode === \'view\'">' +
                                    '</textarea>' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                        } else if (model.type === "select") {
                            if (model.free === false) {
                                template +=
                                        '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                        '<select class="col-sm-9" placeholder="Not specified" ' +
                                        '        name="{{field.name}}"' +
                                        '        ng-disabled="viewMode === \'view\'"' +
                                        '        ng-model="model.' + model.name + '"' +
                                        '        ng-options="option.value as option.label for option in options.' + model.name.replace(/\./g, "_") + '"' +
                                        '        ' + (model.required ? "required" : "") + '>' +
                                        '</select>' +
                                        '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                            } else {
                                template +=
                                        '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                        '<input class="col-sm-9" type="text" placeholder="Not specified" name="{{field.name}}" ' +
                                        '       ng-model="model.' + model.name + '"' +
                                        '       typeahead-min-length=0 uib-typeahead="option.label for option in options.' + model.name.replace(/\./g, "_") + ' | filter:$viewValue:startsWith"' +
                                        '       ' + (model.required ? "required" : "") +
                                        '       ng-readonly="viewMode === \'view\'">' +
                                        '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                            }

                            if (model.source) {
                                $http({
                                    method: 'GET',
                                    url: model.source,
                                }).success(function (options) {
                                    $scope.options[model.name.replace(/\./g, "_")] = options[model.name];
                                });
                            } else if (model.options) {
                                $scope.options[model.name.replace(/\./g, "_")] = model.options;
                            }
                        } else if (model.type === "checkbox") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> </label>' +
                                    '<div class="col-sm-9" style="padding-left: 0px;">' +
                                    '  <input type="checkbox" ' +
                                    '       name="{{field.name}}"' +
                                    '       ng-model="model.' + model.name + '"' +
                                    '       ' + (model.required ? "required" : "") +
                                    '       ng-readonly="viewMode === \'view\'">' +
                                    '  <b> {{field.label}}</b>' +
                                    '  <i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>'+
                                    '</div>';
                        } else if (model.type === "date") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<div style=" max-width: 155px; " class="col-sm-7 input-group">' +
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
                                    '<i style="margin-top:-20px; position: absolute; top: 30px;" ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                            '</div>';
                        } else if (model.type === "tag") {
                            if (model.source) {
                                $scope.options[model.name.replace(/\./g, "_")] = [];
                                $http({
                                    method: 'GET',
                                    url: model.source,
                                }).success(function (options) {
                                    for (var i in options[model.name]) {
                                        $scope.options[model.name.replace(/\./g, "_")].push(options[model.name][i]);
                                    }
                                });
                            }

                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<tag-field class="col-sm-9" ' +
                                    '                      name="{{field.name}}" ' +
                                    '                      ng-model="model.' + model.name + '" ' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      ' + (model.options ? "options=\'" + JSON.stringify(model.options) + "\'" : "") +
                                    '                      ' + (model.source ? "options=\'options[\"" + model.name.replace(/\./g, "_") + "\"]\'" : "") +
                                    '                      ' + (model.popular ? "popular=\'" + JSON.stringify(model.popular) + "\'" : "") +
                                    '                      editable="viewMode !== \'view\'">' +
                                    '</tag-field>' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';

                        } else if (model.type === "display") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<input class="col-sm-9" type="text" disabled' +
                                    (model.name ? ' ng-model="model.' + model.name + '"' : '') +
                                    (model.value ? ' value="' + model.value + '"' : '') +
                                    '       ng-readonly="viewMode === \'view\'">' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                        }  else if (model.type === "hidden") {
                            template +=
                                    '<input class="col-sm-9" type="text" ' +
                                    (model.name ? ' ng-model="model.' + model.name + '"' : '') +
                                    (model.value ? ' ng-value="\'' + model.value + '\'"' : '') +
                                    (model.force ? ' ng-init="model.' + model.name + ' = \'' + model.value + '\'"' : '') +
                                    '       ng-show="false">' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                        } else if (model.type === "user_selector") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<user-selector-field  class="col-sm-9" ' +
                                    '                      name="{{field.name}}" ' +
                                    '                      ng-init="models=model.' + model.name + '"' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      ng-readonly="viewMode === \'view\'">' +
                                    '</user-selector-field>' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                        } else if (model.type === "output_files_selector") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<output-files-selector-field  class="col-sm-9" ' +
                                    '                      name="{{field.name}}" ' +
                                    '                      ng-init="models=model.' + model.name + '"' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      ng-readonly="viewMode === \'view\'">' +
                                    '</output-files-selector-field>' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                        } else if (model.type === "input_files_selector") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<input-files-selector-field  class="col-sm-9" ' +
                                    '                      name="{{field.name}}" ' +
                                    '                      ng-init="models=model.' + model.name + '"' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      ng-readonly="viewMode === \'view\'">' +
                                    '</input-files-selector-field>' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                        } else if (model.type === "reference_files_selector") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<reference-files-selector-field  class="col-sm-9" ' +
                                    '                      name="{{field.name}}" ' +
                                    '                      ng-init="models=model.' + model.name + '"' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      ng-readonly="viewMode === \'view\'">' +
                                    '</reference-files-selector-field>' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                        } else if (model.type === "sample_selector") {
                            template +=
                                    '<sample-selector-field name="{{field.name}}" ' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      ng-readonly="viewMode === \'view\'">' +
                                    '</sample-selector-field>' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                        } else if (model.type === "protocol_selector") {
                            template +=
                                    '<protocol-selector-field name="{{field.name}}" ' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      ng-readonly="viewMode === \'view\'">' +
                                    '</protocol-selector-field>' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';
                        } else if (model.type === "box_list") {
                            template +=
                                    '<label class="col-sm-2" for="{{field.name}}"> {{field.label}}</label>' +
                                    '<box-list-field class="col-sm-9" ' +
                                    '                      name="{{field.name}}" ' +
                                    '                      ng-model="model.' + model.name + '" ' +
                                    '                      ' + (model.required ? "required" : "") +
                                    '                      label="' + model.label + '"' +
                                    '                      editable="viewMode !== \'view\'">' +
                                    '</box-list-field>' +
                                    '<i ng-show="' + (model.help !== undefined) + '"  uib-tooltip-html="\'' + model.help + '\'" class="fa fa-question-circle form-help-tip" aria-hidden="true"></i>';

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

    app.directive("boxListField", ['$compile', function ($compile) {
            return {
                restrict: 'E',
                require: 'ngModel',
                scope: {
                    editable: "=",
//                    label : "="
                },
                template:
                        '<div class="">' +
                        '  <input class="col-sm-9" type="text" placeholder="Not specified" readonly ng-show="boxes=== undefined || boxes.length === 0">' +
                        '  <div ng-repeat="box in boxes">' +
                        '     <b>{{label}}</b>'+ 
                        '     <div class="field-group row">' +
                        '         <label class="col-sm-2"> Name: </label>' +
                        '         <input class="col-sm-8" type="text" placeholder="Not specified" ng-model="box.name" ng-readonly="editable===false">' +
                        '         <a class="col-sm-1 text-danger clickable" ng-click="removeBox(box)"><i class="fa fa-trash" ng-show="editable" aria-hidden="true"></i></a>' +
                        '     </div>' +
                        '     <div class="field-group row">' +
                        '         <label class="col-sm-2"> Description: </label>' +
                        '         <textarea class="col-sm-8" rows="8" cols="50" ng-model="box.description" ng-readonly="editable===false"></textarea>' +
                        '     </div>' +
                        '  </div>' +
                        '  <a class="btn btn-sm btn-success" ng-show="editable" ng-click="addBox()" style="padding:2px 5px;">+ Add</a>' +
                        '</div>',
                link: function ($scope, element, attrs, ngModel) {
                    if (!ngModel) {
                        return
                    }

                    ngModel.$render = function () {
                        $scope.boxes = ngModel.$modelValue || [];
                    };

                    function updateModel() {
                        ngModel.$setViewValue($scope.boxes);
                        ngModel.$render();
                    }

                    $scope.addBox = function () {
                        $scope.boxes = $scope.boxes.concat({name: "", description: ""});
                        updateModel();
                    };

                    $scope.removeBox = function (box) {
                        var pos = $scope.boxes.indexOf(box);
                        if (pos !== -1) {
                            $scope.boxes.splice(pos, 1);
                            $scope.boxes = $scope.boxes.concat(); //force input updating
                            updateModel();
                        }
                    };

                    try {
                        $scope.options = JSON.parse(attrs.options.replace(/\'/g, "\"")) || [];
                    } catch (e) {
                        $scope.options = [];
                    }
                    $scope.editable = $scope.editable || (attrs.editable === "true");
                    $scope.optionsID = Math.random().toString(36).substr(2, 16);
                }
            };
        }]);
})();
