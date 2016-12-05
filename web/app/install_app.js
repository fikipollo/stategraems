(function () {

    var app = angular.module('stategraemsApp', [
        'common.dialogs',
    ]);

    app.constant('myAppConfig', {
        VERSION: '0.8',
        EMS_SERVER: "/"
    });
    //Define the events that are fired when an user login, log out etc.
    app.constant('APP_EVENTS', {
    });

    app.controller('InstallController', function ($rootScope, $scope, $http, $dialogs, myAppConfig) {

        this.sendInstallDataHandler = function () {
            $scope.isLoading = true;

            $http($rootScope.getHttpRequestConfig("POST", "send-install", {
                headers: {'Content-Type': 'application/json'},
                data: $scope.config
            })).then(
                    function successCallback(response) {
                        $scope.isLoading = false;
                        var message = "STATegra EMS was successfully installed. Please restart your Tomcat instance now to start working.";
                        alert(message);
                        document.location = "/";
                    },
                    function errorCallback(response) {
                        $scope.isLoading = false;
                        var message = "Failed while installing the application.<br><b>Error Message:</b> " + response.data.reason;
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at InstallController:sendInstallData."
                        });
                        console.error(response.data);
                    }
            );

            return this;
        };

        $rootScope.getRequestPath = function (service, extra) {
            extra = (extra || "");
            switch (service) {
                case "send-install":
                    return myAppConfig.EMS_SERVER + "install";
                default:
                    return "";
            }
        };

        $rootScope.getHttpRequestConfig = function (method, service, options) {
            options = (options || {});
            options.params = (options.params || {});

            if (options.urlEncodedRequest === true) {
                //CONVERT TO URL ENCODE DATA
                options.transformRequest = function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                };
            }
            var requestData = {
                method: method,
                headers: options.headers,
                url: this.getRequestPath(service, options.extra),
                params: options.params,
                data: options.data
            };
            if (options.transformRequest !== undefined) {
                requestData.transformRequest = options.transformRequest;
            }

            return requestData;
        };

        $rootScope.setLoading = function (loading) {
            //TODO:
            if (loading === true) {
                //$dialogs.showInfoDialog("Loading!", {title: "Hello world!"});
            } else {
                //$dialogs.showInfoDialog("This is a dialog!", {title: "Hello world!"});
            }
        };
        $rootScope.getParentController = function (controllerName) {
            if (this.controller.name === controllerName) {
                return this.controller;
            } else if (this.$parent && this.$parent.getParentController) {
                return this.$parent.getParentController(controllerName);
            }
            return  null;
        };

        var me = this;
        $rootScope.myAppConfig = myAppConfig;

        $scope.config = {
            installation_type: 'install',
            dbname: 'STATegraDB',
            dbhost : 'localhost',
            mysqladminUser : 'root',
            emsusername: 'emsuser',
            emsuserpass : Math.random().toString(36).substr(2, 16),
            data_location: '/data/stategraems_app_data/'
        };
    });
})();
