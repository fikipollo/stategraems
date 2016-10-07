(function () {

    var app = angular.module('stategraemsApp', [
        'common.dialogs',
        'ui.router',
        'angular-toArrayFilter',
        'users.directives.user-session',
        'experiments.controllers',
        'samples.controllers',
        'analysis.controllers',
        'templates.services.template-list'
    ]);

    app.constant('myAppConfig', {
        VERSION: '0.8',
        EMS_SERVER: "/"
    });
    //Define the events that are fired when an user login, log out etc.
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });
    app.constant('INFO_EVENTS', {
        experimentDeleted: 'experiment-deleted',
        sampleCreated: 'sample-created',
        analysisCreated: 'analysis-created',
        userCreated: 'user-created'
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
            },
            home = {
                name: 'home',
                url: '/',
                templateUrl: "app/home/home.tpl.html",
                data: {requireLogin: true}
            },
            experiments = {
                name: 'experiments',
                url: '/experiments',
                templateUrl: "app/experiments/experiment-list.tpl.html",
                data: {requireLogin: true}
            },
            experimentDetail = {
                name: 'experimentDetail',
                url: '/experiment-detail/',
                templateUrl: "app/experiments/experiment-form.tpl.html",
                params: {
                    viewMode: 'view', //creation, edition
                    experiment_id: null,
                },
                data: {requireLogin: true}
            },
            samples = {
                name: 'samples',
                url: '/samples',
                templateUrl: "app/samples/sample-list.tpl.html",
                data: {requireLogin: true}
            },
            sampleDetail = {
                name: 'sampleDetail',
                url: '/sample-detail/',
                templateUrl: "app/samples/biocondition-form.tpl.html",
                params: {
                    viewMode: 'view', //creation, edition
                    biocondition_id: null,
                },
                data: {requireLogin: true}
            },
            analysis = {
                name: 'analysis',
                url: '/analysis',
                templateUrl: "app/analysis/analysis-list.tpl.html",
                data: {requireLogin: true}
            },
            analysisDetail = {
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
            $stateProvider.state(experiments);
            $stateProvider.state(experimentDetail);
            $stateProvider.state(samples);
            $stateProvider.state(sampleDetail);
            $stateProvider.state(analysis);
            $stateProvider.state(analysisDetail);
        }]);

    app.controller('MainController', function ($rootScope, $scope, $state, $http, $dialogs, myAppConfig, TemplateList) {
        var me = this;
        $rootScope.myAppConfig = myAppConfig;
        $scope.currentPage = 'home';

        this.pages = [
            {name: 'home', title: 'Home', icon: 'home', isParent: true},
            {name: '', title: 'Experiments', icon: 'book', isParent: true},
            {name: 'experiments', title: 'Browse experiments', icon: 'angle-right', isParent: false},
            {name: 'experimentDetail', title: 'Show current experiment', icon: 'angle-right', isParent: false, params: {viewMode: 'view', experiment_id: "promise"}},
            {name: 'experimentDetail', title: 'Annotate new Experiment', icon: 'angle-right', isParent: false, params: {viewMode: 'creation'}},
            {name: '', title: 'Samples', icon: 'flask', isParent: true},
            {name: 'samples', title: 'Browse samples', icon: 'angle-right', isParent: false},
            {name: 'sampleDetail', title: 'Annotate new samples', icon: 'angle-right', isParent: false, params: {viewMode: 'creation'}},
            {name: '', title: 'Analysis', icon: 'sitemap', isParent: true},
            {name: 'analysis', title: 'Browse analysis', icon: 'angle-right', isParent: false},
            {name: 'analysisDetail', title: 'Annotate new analysis', icon: 'angle-right', isParent: false, params: {viewMode: 'creation'}}
        ];

        $rootScope.getRequestPath = function (service, extra) {
            extra = (extra || "");
            switch (service) {
                case "user-sign-in":
                    return myAppConfig.EMS_SERVER + "login";
                case "user-sign-out":
                    return myAppConfig.EMS_SERVER + "logout";
                case "user-sign-up":
                    return null;
                case "user-info":
                    return myAppConfig.EMS_SERVER + "get_user";
                case "user-list":
                    return myAppConfig.EMS_SERVER + "get_user_list";
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
                case "experiment-lock":
                    return myAppConfig.EMS_SERVER + "lock_experiment";
                case "experiment-unlock":
                    return myAppConfig.EMS_SERVER + "unlock_experiment";
                case "experiment-selection":
                    return myAppConfig.EMS_SERVER + "change_current_experiment";
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
                case "analysis-list":
                    return myAppConfig.EMS_SERVER + "get_all_analysis";
                case "analysis-info":
                    return myAppConfig.EMS_SERVER + "get_analysis";
//                case "sample-create":
//                    return myAppConfig.EMS_SERVER + "add_biocondition";
//                case "sample-update":
//                    return myAppConfig.EMS_SERVER + "update_biocondition";
//                case "sample-delete":
//                    return myAppConfig.EMS_SERVER + "remove_biocondition";
//                case "sample-lock":
//                    return myAppConfig.EMS_SERVER + "lock_biocondition";
//                case "sample-unlock":
//                    return myAppConfig.EMS_SERVER + "unlock_biocondition";
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
        $rootScope.setLoading = function (loading) {
            //TODO:
            if (loading === true) {
                //$dialogs.showInfoDialog("Loading!", {title: "Hello world!"});
            } else {
                //$dialogs.showInfoDialog("This is a dialog!", {title: "Hello world!"});
            }
        };
        $rootScope.getCredentialsParams = function (request_params) {
            var credentials = {};
            if (request_params != null) {
                credentials = request_params;
            }

            credentials['sessionToken'] = Cookies.get("sessionToken");
            credentials['loggedUser'] = Cookies.get("loggedUser");
            credentials['loggedUserID'] = Cookies.get("loggedUserID");
            credentials['currentExperimentID'] = Cookies.get('currentExperimentID');
            return credentials;
        };
        $rootScope.getFormTemplate = function (childScope, template_id) {
            if (template_id) {
                childScope.template = TemplateList.getTemplate(template_id);

                if (childScope.template === null) {
                    $http({method: 'GET', url: 'data/templates/' + template_id + '.json'}).then(
                            function successCallback(response) {
                                TemplateList.addTemplate(response.data);
                                childScope.template = TemplateList.getTemplate(template_id);
                            },
                            function errorCallback(response) {
                                debugger;
                                var message = "Failed while retrieving the template for type " + template_id;
                                $dialogs.showErrorDialog(message, {
                                    logMessage: message + " at MainController:getFormTemplate."
                                });
                                console.error(response.data);
                            }
                    );
                }
            }
        };
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            var requireLogin = toState.data.requireLogin;

            var loggedUser = Cookies.get("loggedUser");
            var sessionToken = Cookies.get("sessionToken");

            //Check if the user is logged in, redirect to signin panel
            if (requireLogin && (loggedUser === undefined || sessionToken === undefined)) {
                event.preventDefault();
                Cookies.remove("sessionToken");
                $state.go('signin');
            }
        });


        this.setPage = function (page) {
            if (page.params && page.params.experiment_id !== undefined) {
                page.params.experiment_id = Cookies.get("currentExperimentID");
            }

            $state.go(page.name, page.params);
            $scope.currentPage = page.name;
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
    });
})();
