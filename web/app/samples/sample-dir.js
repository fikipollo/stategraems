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
 * - bioconditionCard
 * - bioreplicateForm
 * - sampleSelectorField
 *
 */
(function () {
    var app = angular.module('samples.directives.sample-views', [
    ]);

    /***************************************************************************/
    /*DIRECTIVES ***************************************************************/
    /***************************************************************************/
    app.directive("bioconditionCard", function ($timeout) {
        return {
            restrict: 'E',
            templateUrl: "app/samples/biocondition-card.tpl.html",
            link: function (scope, element, attrs) {
                //Execute the afterRender function (linked to a controller function)
                $timeout(scope.$eval(attrs.afterRender), 0);
            }
        };
    });

    app.directive("bioreplicateForm", function () {
        return {
            restrict: 'E',
            templateUrl: "app/samples/bioreplicate-form.tpl.html"
        };
    });

    app.directive("sampleSelectorField", function () {
        return {
            restrict: 'E',
            replace: true,
            template:
                    '<div ng-controller="BioconditionDetailController as controller">' +
                    '   <div class="field-group row">' +
                    '    <label class="col-sm-2" for="title">Biological condition title: </label>' +
                    '    <input class="col-sm-9" type="text" disabled ng-model="model.title">' +
                    '   </div>' +
                    '   <div class="field-group row" ng-show="bioreplicate !== undefined">' +
                    '    <label class="col-sm-2" for="title">Sample name: </label>' +
                    '    <input class="col-sm-9" type="text" disabled ng-model="bioreplicate.bioreplicate_name">' +
                    '   </div>' +
                    '   <div class="field-group row" ng-show="analytical_rep !== undefined">' +
                    '    <label class="col-sm-2" for="title">Aliquout name: </label>' +
                    '    <input class="col-sm-9" type="text" disabled ng-model="analytical_rep.analytical_rep_name">' +
                    '   </div>' +
                    '   <div class="col-sm-11">' +
                    '      <a style="float:right; margin-left: 15px;" class="btn btn-primary" ng-show="viewMode !== \'view\'" ng-click="controller.changeSelectedSampleButtonHandler();">' +
                    '        <i class="fa fa-pencil-square-o" aria-hidden="true"></i> Choose sample' +
                    '      </a>' +
                    '      <a style="float:right" class="btn btn-default" ng-show="biocondition_id !== undefined" ng-click="controller.showSelectedSampleDetailsButtonHandler();">' +
                    '        <i class="fa fa-search" aria-hidden="true"></i> Show sample details' +
                    '      </a>' +
                    '   </div>' +
                    '</div>'
        };
    });
})();