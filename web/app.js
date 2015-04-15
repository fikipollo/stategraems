//@require @packageOverrides
Ext.Loader.setConfig({enabled: true});

forceRefresh = true;
nObservers = 0;
application = null;

if (debugging === true)
    console.warn("DEBUG MODE IS ON.")

Ext.application({
    name: 'SL',
    launch: function () {
        application = this;
        application.mainView = Ext.create('SL.view.MainView');
        if (Ext.isIE) {
            showWarningMessage("STATegra EMS was developed to work in Internet Explorer, however some features could not work properly.<br>We recommend to work with Chrome or Firefox.", {soft: true, delay: 8000});
        } else if (Ext.isGecko) {
            var version = navigator.userAgent.toLowerCase().split("firefox/");
            if (version.length > 1) {
                try {
                    var version = parseFloat(version[1]);
                    if (version >= 22) {
                        showWarningMessage("From version 22 of Firefox, the EMS application looks bigger in the screen.<br>Please, accommodate the application to your browser window using the zoom tool (Ctrl + +/-", {soft: true, delay: 8000});
                    }
                } catch (error) {

                }
            }
        } else if (Ext.isSafari) {
            showWarningMessage("STATegra EMS was developed to work in Safari, however some features could not work properly.<br>We recommend to work with Chrome or Firefox.", {soft: true, delay: 8000});
        }

        application.getMainView = function () {
            return this.mainView;
        };
    },
    stores: [],
    views: [],
    controllers: ['ApplicationController', 'UserController', 'BioConditionController', 'ExperimentController', 'AnalysisController'],
    loadControllers: function (controllerNames) {
        for (var i in controllerNames) {
            if (this.controllers.get(controllerNames[i]) === undefined) {
                var controller = this.getController(controllerNames[i]);
                controller.init(this);
                controller.onLaunch(this);
                if (debugging === true)
                    console.log('Initialized ' + controllerNames[i]);
            }
        }
    }
});