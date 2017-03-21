(function () {

    var app = angular.module('stategraemsApp', [
        'ang-dialogs',
    ]);
    
    var pathname = window.location.pathname.split("/");
    if(pathname.length > 1 && pathname[1] !== ""){
        pathname = pathname[1] + "/";
    }else{
        pathname = "";
    }
    app.constant('myAppConfig', {
        VERSION: '0.8',
        EMS_SERVER: "/" + pathname
    });
    
    //Define the events that are fired when an user login, log out etc.
    app.constant('APP_EVENTS', {
    });

    app.controller('InstallController', function ($rootScope, $scope, $http, $dialogs, myAppConfig) {
        this.sendInstallDataHandler = function () {
            $scope.installing = true;
            $http($rootScope.getHttpRequestConfig("POST", "send-install", {
                headers: {'Content-Type': 'application/json'},
                data: $scope.config
            })).then(
                    function successCallback(response) {
                        $scope.install_done = true;
                        setTimeout(function () {
                            document.location = "/";
                        }, 3000);
                    },
                    function errorCallback(response) {
                        $scope.installing = false;
                        var message = "Failed while installing the application.<br><b>Error Message:</b> " + response.data.reason;
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at InstallController:sendInstallData."
                        });
                        console.error(response.data);
                    }
            );

            return this;
        };

        this.sendAutoInstallDataHandler = function () {
            $http($rootScope.getHttpRequestConfig("POST", "send-autoinstall", {
                headers: {'Content-Type': 'application/json'},
                data: $scope.config
            })).then(
                    function successCallback(response) {
                        $scope.install_done = true;
                        setTimeout(function () {
                            document.location = "/";
                        }, 3000);
                    },
                    function errorCallback(response) {
                        $scope.installing = false;
                        var message = "Failed while autoinstalling the application.<br><b>Error Message:</b> " + response.data.reason;
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at InstallController:sendAutoInstallDataHandler."
                        });
                        console.error(response.data);
                    }
            );

            return this;
        };

        this.checkInstallationValidity = function () {
            $http($rootScope.getHttpRequestConfig("POST", "check-install", {
                headers: {'Content-Type': 'application/json'}
            })).then(
                    function successCallback(response) {
                        if (response.data.success) {
                            document.location = "/";
                        }
                        $scope.config.installation_type = response.data.installation_type;

                        if (response.data.is_docker) {
                            $scope.installing = true;
                            me.sendAutoInstallDataHandler();
                        }
                    },
                    function errorCallback(response) {
                        $scope.isLoading = false;

                        debugger;
                        var message = "Failed while checking the validity of this emsinstance.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at InstallController:checkInstallationValidity."
                        });
                        console.error(response.data);
                    }
            );
        };

        $rootScope.getRequestPath = function (service, extra) {
            extra = (extra || "");
            switch (service) {
                case "send-install":
                    return myAppConfig.EMS_SERVER + "install";
                case "send-autoinstall":
                    return myAppConfig.EMS_SERVER + "autoinstall";
                case "check-install":
                    return myAppConfig.EMS_SERVER + "is_valid_installation";
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

        $rootScope.setLoading = function (loading, message, title) {
            if (loading === true) {
                $dialogs.showWaitDialog((message || "Wait please..."), {title: (title || "")});
            } else {
                $dialogs.closeDialog();
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
            MYSQL_DATABASE_NAME: 'STATegraDB',
            MYSQL_HOST: 'localhost',
            MYSQL_ROOT_USER: 'root',
            MYSQL_EMS_USER: 'emsuser',
            MYSQL_EMS_PASS: Math.random().toString(36).substr(2, 16),
            data_location: '/data/stategraems_app_data/'
        };

        this.checkInstallationValidity();
    });
})();
