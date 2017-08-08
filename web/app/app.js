(function () {

    var app = angular.module('stategraemsApp', [
        'ang-dialogs',
        'ui.router',
        'angular-toArrayFilter',
        'users.directives.user-session',
        'messages.controllers',
        'experiments.controllers',
        'samples.controllers',
        'protocols.controllers',
        'analysis.controllers',
        'files.controllers',
        'admin.controllers',
        'templates.services.template-list'
    ]);

    var pathname = window.location.pathname.split("/");
    if (pathname.length > 1 && pathname[1] !== "" && pathname[1].indexOf(".html") === -1) {
        pathname = pathname[1] + "/";
    } else {
        pathname = "";
    }
    app.constant('myAppConfig', {
        VERSION: '0.9',
        EMS_SERVER: "/" + pathname
    });
    //Define the events that are fired when an user login, log out etc.
    app.constant('APP_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        experimentCreated: 'experiment-created',
        experimentDeleted: 'experiment-deleted',
        sampleCreated: 'sample-created',
        sampleDeleted: 'sample-deleted',
        samplesChanged: 'samples-changes',
        protocolCreated: 'protocol-created',
        protocolDeleted: 'protocol-deleted',
        protocolSelection: 'protocol-selection',
        messageCreated: 'message-created',
        messageDeleted: 'message-deleted',
        analysisCreated: 'analysis-created',
        analysisDeleted: 'analysis-deleted',
        stepChanged: "step-changed",
        userCreated: 'user-created',
    });

    //DEFINE THE ENTRIES FOR THE WEB APP
    app.config([
        '$stateProvider',
        '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            // For any unmatched url, redirect to /login
            $urlRouterProvider.otherwise("/");
            var signin = {
                name: 'signin',
                url: '/signin',
                templateUrl: "app/users/user-sign-in.tpl.html",
                data: {requireLogin: false}
            }, home = {
                name: 'home',
                url: '/',
                templateUrl: "app/home/home.tpl.html",
                data: {requireLogin: true}
            }, admin = {
                name: 'admin',
                url: '/',
                templateUrl: "app/admin/admin.tpl.html",
                data: {requireLogin: true}
            }, messages = {
                name: 'messages',
                url: '/messages',
                templateUrl: "app/messages/message-list.tpl.html",
                params: {
                    force: false
                },
                data: {requireLogin: true}
            }, experiments = {
                name: 'experiments',
                url: '/experiments',
                templateUrl: "app/experiments/experiment-list.tpl.html",
                params: {
                    force: false
                },
                data: {requireLogin: true}
            }, experimentDetail = {
                name: 'experimentDetail',
                url: '/experiment-detail/',
                templateUrl: "app/experiments/experiment-form.tpl.html",
                params: {
                    viewMode: 'view', //creation, edition
                    experiment_id: null,
                },
                data: {requireLogin: true}
            }, samples = {
                name: 'samples',
                url: '/samples',
                templateUrl: "app/samples/sample-list.tpl.html",
                params: {
                    force: false
                },
                data: {requireLogin: true}
            }, sampleDetail = {
                name: 'sampleDetail',
                url: '/sample-detail/',
                templateUrl: "app/samples/biocondition-form.tpl.html",
                params: {
                    viewMode: 'view', //creation, edition
                    biocondition_id: null
                },
                data: {requireLogin: true}
            }, protocols = {
                name: 'protocols',
                url: '/protocols',
                templateUrl: "app/protocols/protocol-list.tpl.html",
                params: {
                    force: false
                },
                data: {requireLogin: true}
            }, protocolDetail = {
                name: 'protocolDetail',
                url: '/protocol-detail/',
                templateUrl: "app/protocols/protocol-form.tpl.html",
                params: {
                    viewMode: 'view', //creation, edition
                    protocol_id: null
                },
                data: {requireLogin: true}
            }, externalSampleDetail = {
                name: 'externalSampleDetail',
                url: '/ext-sample-detail/',
                templateUrl: "app/samples/external-sample-form.tpl.html",
                params: {
                    viewMode: 'view', //creation, edition
                    biocondition_id: null
                },
                data: {requireLogin: true}
            }, analysis = {
                name: 'analysis',
                url: '/analysis',
                templateUrl: "app/analysis/analysis-list.tpl.html",
                params: {
                    force: false
                },
                data: {requireLogin: true}
            }, analysisDetail = {
                name: 'analysisDetail',
                url: '/analysis-detail/',
                templateUrl: "app/analysis/analysis-form.tpl.html",
                params: {
                    viewMode: 'view', //creation, edition
                    analysis_id: null,
                },
                data: {requireLogin: true}
            };
            $stateProvider.state(signin);
            $stateProvider.state(home);
            $stateProvider.state(admin);
            $stateProvider.state(messages);
            $stateProvider.state(experiments);
            $stateProvider.state(experimentDetail);
            $stateProvider.state(samples);
            $stateProvider.state(sampleDetail);
            $stateProvider.state(protocols);
            $stateProvider.state(protocolDetail);
            $stateProvider.state(externalSampleDetail);
            $stateProvider.state(analysis);
            $stateProvider.state(analysisDetail);
        }]);

    app.controller('MainController', function ($rootScope, $scope, $state, $http, $dialogs, myAppConfig, TemplateList) {
        var me = this;
        $rootScope.myAppConfig = myAppConfig;
        $scope.currentPage = 'home';

        this.pages = [
            {name: 'home', title: 'Home', icon: 'home', isParent: true},
            {name: 'messages', title: 'Messages', icon: 'envelope', isParent: false},
            {name: '', title: 'Studies', icon: 'book', isParent: true},
            {name: 'experiments', title: 'Browse studies', icon: 'angle-right', isParent: false},
            {name: 'experimentDetail', title: 'Show current study', icon: 'angle-right', isParent: false, params: {viewMode: 'view', experiment_id: "promise"}},
            {name: 'experimentDetail', title: 'Annotate new study', icon: 'angle-right', isParent: false, params: {viewMode: 'creation'}},
            {name: '', title: 'Samples', icon: 'flask', isParent: true},
            {name: 'samples', title: 'Browse samples', icon: 'angle-right', isParent: false},
            {name: 'sampleDetail', title: 'Annotate new samples', icon: 'angle-right', isParent: false, params: {viewMode: 'creation'}},
            {name: '', title: 'Protocols', icon: 'file-powerpoint-o', isParent: true},
            {name: 'protocols', title: 'Browse protocols', icon: 'angle-right', isParent: false},
            {name: 'protocolDetail', title: 'Annotate new protocol', icon: 'angle-right', isParent: false, params: {viewMode: 'creation'}},
            {name: '', title: 'Analysis', icon: 'sitemap', isParent: true},
            {name: 'analysis', title: 'Browse analysis', icon: 'angle-right', isParent: false},
            {name: 'analysisDetail', title: 'Annotate new analysis', icon: 'angle-right', isParent: false, params: {viewMode: 'creation'}}
        ];

        $rootScope.getRequestPath = function (service, extra) {
            extra = (extra !== undefined ? "/" + extra : "");
            switch (service) {
                /*
                 * USER REQUESTS
                 */
                case "user-rest":
                    return myAppConfig.EMS_SERVER + "rest/users" + extra;
                    /*
                     * EXPERIMENT REQUESTS
                     */
                case "experiment-list":
                    return myAppConfig.EMS_SERVER + "get_all_experiments";
                case "experiment-info":
                    return myAppConfig.EMS_SERVER + "get_experiment";
                case "experiment-create":
                    return myAppConfig.EMS_SERVER + "add_experiment";
                case "experiment-update":
                    return myAppConfig.EMS_SERVER + "update_experiment";
                case "experiment-delete":
                    return myAppConfig.EMS_SERVER + "remove_experiment";
                case "experiment-member-request":
                    return myAppConfig.EMS_SERVER + "experiment_member_request";
                case "experiment-lock":
                    return myAppConfig.EMS_SERVER + "lock_experiment";
                case "experiment-unlock":
                    return myAppConfig.EMS_SERVER + "unlock_experiment";
                case "experiment-selection":
                    return myAppConfig.EMS_SERVER + "change_current_experiment";
                case "experiments-rest":
                    return myAppConfig.EMS_SERVER + "rest/experiments" + extra;                   /*
                     * SAMPLE REQUESTS
                     */
                case "sample-list":
                    return myAppConfig.EMS_SERVER + "get_all_bioconditions";
                case "sample-info":
                    return myAppConfig.EMS_SERVER + "get_biocondition";
                case "sample-create":
                    return myAppConfig.EMS_SERVER + "add_biocondition";
                case "sample-update":
                    return myAppConfig.EMS_SERVER + "update_biocondition";
                case "sample-delete":
                    return myAppConfig.EMS_SERVER + "remove_biocondition";
                case "sample-lock":
                    return myAppConfig.EMS_SERVER + "lock_biocondition";
                case "sample-unlock":
                    return myAppConfig.EMS_SERVER + "unlock_biocondition";
                case "sample-service-host-list":
                    return myAppConfig.EMS_SERVER + "get_sample_service_host_list";
                case "sample-service-list":
                    return myAppConfig.EMS_SERVER + "get_sample_service_list";
                case "samples-rest":
                    return myAppConfig.EMS_SERVER + "rest/samples" + extra;
                    /*
                     * ANALYSIS REQUESTS
                     */
                case "analysis-list":
                    return myAppConfig.EMS_SERVER + "get_all_analysis";
                case "analysis-info":
                    return myAppConfig.EMS_SERVER + "get_analysis";
                case "analysis-create":
                    return myAppConfig.EMS_SERVER + "add_analysis";
                case "analysis-update":
                    return myAppConfig.EMS_SERVER + "update_analysis";
                case "analysis-delete":
                    return myAppConfig.EMS_SERVER + "remove_analysis";
                case "analysis-lock":
                    return myAppConfig.EMS_SERVER + "lock_analysis";
                case "analysis-unlock":
                    return myAppConfig.EMS_SERVER + "unlock_analysis";
                case "analysis-step-subtypes":
                    return myAppConfig.EMS_SERVER + "get_step_subtypes";
                case "analysis-rest":
                    return myAppConfig.EMS_SERVER + "rest/analysis" + extra;
                    /*
                     * PROTOCOL REQUESTS
                     */
                case "protocol-list":
                    return myAppConfig.EMS_SERVER + "get_all_protocols";
                case "protocol-info":
                    return myAppConfig.EMS_SERVER + "get_protocol";
                case "protocol-create":
                    return myAppConfig.EMS_SERVER + "add_protocol";
                case "protocol-update":
                    return myAppConfig.EMS_SERVER + "update_protocol";
                case "protocol-delete":
                    return myAppConfig.EMS_SERVER + "remove_protocol";
                case "protocol-lock":
                    return myAppConfig.EMS_SERVER + "lock_protocol";
                case "protocol-unlock":
                    return myAppConfig.EMS_SERVER + "unlock_protocol";
                    /*
                     * MESSAGE REQUESTS
                     */
                case "message-rest":
                    return myAppConfig.EMS_SERVER + "rest/messages" + extra;
                    /*
                     * EXTERNAL SOURCES REQUESTS
                     */
                case "external-sources-rest":
                    return myAppConfig.EMS_SERVER + "rest/externalsources" + extra;
                    /*
                     * FILE REQUESTS
                     */
                case "file-rest":
                    return myAppConfig.EMS_SERVER + "rest/files" + extra;
                    /*
                     * ADMIN REQUESTS
                     */
                case "admin-rest":
                    return myAppConfig.EMS_SERVER + "rest/admin" + extra;
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
                data: options.data,
                config: options.config
            };
            if (options.transformRequest !== undefined) {
                requestData.transformRequest = options.transformRequest;
            }

            return requestData;
        };

        /********************************************************************************      
         * The Object has a queue of TASKs in which we will add each step carried out 
         * during an user interaction. 
         * Using this queue, we can repeat each change in the local information 
         * over the remote information (server side). 
         * Each Task has a command, a string that identifies the action and an object that 
         * could be an added model, panel... 
         *   E.g. When a new Bioreplicate is added to a BioConditionModel, a new task will 
         *   be added as “{command: “add_new_bioreplicate”, object: bioreplicate_model}”
         * All the task are executed when the user press the button Accept, using the function
         * execute_tasks located in the BioConditionController.	
         *
         * Using these tasks we can also UNDO/REDO local changes TODO
         *  
         * @param  command, a string that identifies the action
         * @param  object, an object related with the action (an added model, panel...)
         * @return      
         ********************************************************************************/
        $rootScope.addNewTask = function (_command, _object) {
            this.getTaskQueue().push({command: _command, object: _object});
        };
        $rootScope.getTaskQueue = function () {
            if (this.taskQueue === undefined) {
                this.taskQueue = [];
            }
            return this.taskQueue;
        };
        $rootScope.clearTaskQueue = function () {
            this.taskQueue = [];
        };
        $rootScope.setTaskQueue = function (_taskQueue) {
            this.taskQueue = _taskQueue;
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
        $rootScope.getCredentialsParams = function (request_params) {
            var credentials = {
            };

            if (request_params != null) {
                credentials = request_params;
            }
            if (!Cookies.get("session")) {
                return  credentials;
            }
            var apiCode = atob(Cookies.get("session"));
            credentials['sessionToken'] = apiCode.substring(apiCode.indexOf(":") + 1);
            credentials['loggedUser'] = apiCode.substring(0, apiCode.indexOf(":"));
            credentials['loggedUserID'] = Cookies.get("loggedUserID");
            credentials['currentExperimentID'] = Cookies.get('currentExperimentID');
            return credentials;
        };
        $rootScope.getFormTemplate = function (template_name, propertyName) {
            if (template_name) {
                var scope = this;
                propertyName = propertyName || "template";
                var template_id = template_name.split("/");
                template_id = template_id[template_id.length - 1];

                scope[propertyName] = TemplateList.getTemplate(template_id);

                if (this[propertyName] === null) {
                    $http({method: 'GET', url: 'data/templates/' + template_name + '.json'}).then(
                            function successCallback(response) {
                                TemplateList.addTemplate(response.data);
                                scope[propertyName] = TemplateList.getTemplate(template_id);
                            },
                            function errorCallback(response) {
                                debugger;
                                var message = "Failed while retrieving the template for type " + template_name;
                                $dialogs.showErrorDialog(message, {
                                    logMessage: message + " at MainController:getFormTemplate."
                                });
                                console.error(response.data);
                            }
                    );
                }
            }
        };
        $rootScope.options = {};
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            var requireLogin = toState.data.requireLogin;

            var session = Cookies.get("session");

            //Check if the user is logged in, redirect to signin panel
            if (requireLogin && session === undefined) {
                event.preventDefault();
                Cookies.remove("session");
                $state.go('signin');
            }
        });

        this.setPage = function (page) {
            if (page.params && page.params.experiment_id !== undefined) {
                page.params.experiment_id = Cookies.get("currentExperimentID");
            }

            if (page.name) {
                $state.go(page.name, page.params);
                $scope.currentPage = page.name;
            }
        };

        this.getPageTitle = function (page) {
            return
        };

        this.setCurrentPageTitle = function (page) {
            $scope.currentPageTitle = page;
        };

        this.toogleMenuCollapseHandler = function () {
            $("#wrapper").toggleClass("toggled")
        }

        this.checkInstallationValidity = function () {
            $http($rootScope.getHttpRequestConfig("POST", "check-install", {
                headers: {'Content-Type': 'application/json'}
            })).then(
                    function successCallback(response) {
                        if (!response.data.success) {
                            document.location = "install.html";
                        }
                    },
                    function errorCallback(response) {
                        debugger;
                        var message = "Failed while checking the validity of this emsinstance.";
                        $dialogs.showErrorDialog(message, {
                            logMessage: message + " at MainController:check-install."
                        });
                        console.error(response.data);
                    }
            );
        };

        this.checkInstallationValidity();
    });
})();
