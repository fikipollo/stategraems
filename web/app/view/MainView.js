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
 * THIS FILE CONTAINS THE FOLLOWING COMPONENT DECLARATION
 * - MainView
 * - HomePanel
 * - LoginPanel
 * 
 */
Ext.define('SL.view.MainView', {
    extend: 'Ext.container.Viewport',
    id: 'mainView',
    currentView: null,
    subViews: null,
    name: "MainView",
    getViewName: function () {
        return this.name;
    },
    changeMainView: function (aViewName) {
        var aView = null;
        var me = this;
        if (aViewName === "") {
            return;
        } else if (me.currentView !== null && me.currentView.getViewName() === aViewName) {
            return me.currentView;
        } else if (me.currentView !== null && me.currentView.inEditionMode !== undefined && me.currentView.inEditionMode === true) {
            me.queryById("cancelButton").fireEvent("click");
            return;
        } else if (aViewName === "browseExperiments") {
            application.getController("ExperimentController").browseExperimentButtonHandler();
            return;
        } else if (aViewName === "browseSamples") {
            if (Ext.util.Cookies.get('currentExperimentID') === "Not selected" || Ext.util.Cookies.get('currentExperimentID') === "undefined") {
                showErrorMessage("No experiment selected.\nPlease switch to an existing experiment or create a new one before continue.", {soft: true});
                return;
            }
            application.getController("BioConditionController").browseBioConditionButtonClickHandler();
            return;
        } else if (aViewName === "browseAnalysis") {
            if (Ext.util.Cookies.get('currentExperimentID') === "Not selected" || Ext.util.Cookies.get('currentExperimentID') === "undefined") {
                showErrorMessage("No experiment selected.\nPlease switch to an existing experiment or create a new one before continue.", {soft: true});
                return;
            }
            application.getController("AnalysisController").browseAnalysisButtonClickHandler();
            return;
        } else if (aViewName === "currentExperiment") {
            var currentExperimentID = Ext.util.Cookies.get("currentExperimentID");
            if (currentExperimentID === null || currentExperimentID === "Not selected" || currentExperimentID === "undefined") {
                showErrorMessage("No experiment selected.\nPlease switch to an existing experiment or create a new one before continue.", {soft: true});
                return;
            }

            application.getController("ExperimentController").inspectCurrentExperimentButtonHandler();
            return;
        } else if (aViewName === "newExperiment") {
            application.getController("ExperimentController").newExperimentButtonHandler();
            return;
        } else if (this.subviews[aViewName] == null) {
            //DELEGATE TO JobController
            aView = Ext.widget({xtype: aViewName});
            this.subviews[aViewName] = aView;
        }
        if (aViewName === "HomePanel") {
            var userCookie = Ext.util.Cookies.get("loggedUser");
            Ext.getCmp('InfoLoginPanel').setLoginState(true);
            me.enableTools(userCookie === 'admin');
        }

        this.setButtonsStatus(false);

        aView = this.subviews[aViewName];
        if (me.currentView !== null) {
            me.queryById("mainViewCenterPanel").remove(me.currentView, false);
        }

        me.currentView = aView;
        me.queryById("mainViewCenterPanel").add(aView);
        application.getController("ApplicationController").validateSession();

        return aView;
    },
    getCurrentView: function () {
        return this.currentView;
    },
    getView: function (aViewName) {
        return this.subviews[aViewName];
    },
    enableTools: function (isAdmin) {
        if (!isAdmin) {
            $("#adminToolsLink").remove();
        } else {
            $("#adminToolsLink").css({display: "block"});
        }

        $("#toolsWrapper").css({display: "block"});
    },
    setButtonsStatus: function (status) {
        if (status === false) {
            this.queryById('mainViewCenterPanelToolbar').setVisible(false);
            return;
        }
        //SET THE VISIBILITY OF THE TOOLBAR BUTTONS USING A BINARY CODE
        //0 NOT VISIBLE, 1 VISIBLE.
        //EACH BINARY POSITION REFERS TO A BUTTON, IN ORDER: EDIT, BACK, NEXT, ACCEPT AND CANCEL BUTTONS.
        this.queryById('editButton').setVisible((status.charAt(0) === "1"));
        this.queryById('backButton').setVisible((status.charAt(1) === "1"));
        this.queryById('nextButton').setVisible((status.charAt(2) === "1"));
        this.queryById('acceptButton').setVisible((status.charAt(3) === "1"));
        this.queryById('cancelButton').setVisible((status.charAt(4) === "1"));
        this.queryById('mainViewCenterPanelToolbar').setVisible(status !== "00000");
    },
    initComponent: function () {
        var me = this;
        me.border = 0;
        me.subviews = {};

        Ext.applyIf(me, {
            minWidth: 900, border: false, defaults: {border: 0}, layout: "border", id: 'mainView',
            items: [
                {xtype: "container", margin: 0, layout: {type: 'hbox', align: "middle"}, region: 'north', style: "border-bottom: 4px solid #333 !important;background-color: #F8F8F8;", items: [
                        {xtype: "box", flex: 1, html: '<div id="header">' + '<img src="resources/images/stategraems_logo_250x50.png" alt="STATegra EMS logo"></img><p style="display: inline-block;margin: 24px 0px 0px 5px;color: #999;">' + EMS_VERSION + '</p></div>'},
                        {xtype: 'InfoLoginPanel'}
                    ]
                },
                {xtype: "box", margin: 0, padding: 0, width: 205, cls: "myDataLateralMenu", region: 'west',
                    html: "   <ul class='menu'>"
                            + "<span id='toolsWrapper' style='display:none'>"
                            + " <li class='parentOption'><a name='HomePanel'><i class='fa fa-home'></i>  Home</a> </li>"
                            + " <li class='parentOption' id='adminToolsLink' style='display:none'><a name='AdminToolsPanel'><i class='fa fa-tachometer'></i>  Admin tools</a> </li>"
                            + " <li class='parentOption'><a ><i class='fa fa-book'></i>  Experiments</a> </li>"
                            + " <ul class='submenu'>"
                            + "   <li><i class='fa fa-angle-right'></i><a name='browseExperiments'>  Browse experiments</a> </li>"
                            + "   <li><i class='fa fa-angle-right'></i><a name='currentExperiment'>  Current Experiment details</a> </li>"
                            + "   <li><i class='fa fa-angle-right'></i><a name='newExperiment'>  Annotate new Experiment</a> </li>"
                            + " </ul>"
                            + " <li class='parentOption'><a ><i class='fa fa-flask'></i>  Samples</a> </li>"
                            + " <ul class='submenu'>"
                            + "   <li><i class='fa fa-angle-right'></i><a name='browseSamples'>  Browse samples</a> </li>"
                            + " </ul>"
                            + " <li class='parentOption'><a ><i class='fa fa-sitemap'></i>  Analysis</a> </li>"
                            + " <ul class='submenu'>"
                            + "   <li><i class='fa fa-angle-right'></i><a name='browseAnalysis'>  Browse analysis</a> </li>"
                            + " </ul>"
                            + "</span>"
                            + " <li class='parentOption'><a ><i class='fa fa-paper-plane-o'></i>  Documentation</a> </li>"
                            + " <ul class='submenu'>"
                            + "   <li style='font-size: 10px;'><a target='_blank' href='http://bioinfo.cipf.es/stategraems/introduction/'>  STATegra EMS documentation</a> </li>"
                            + "   <li style='font-size: 10px;'>Hernández-de-Diego R, Boix-Chova N, Gómez-Cabrero D, Tegner J, Abugessaisa I, Conesa A <b>STATegra EMS: an Experiment Management System for complex next-generation omics experiments</b>. <a href='http://www.biomedcentral.com/1752-0509/8/S2/S9'>BMC Systems Biology</a> doi:10.1186/1752-0509-8-S2-S9</li>"
                            + " </ul>"
                            + " <li class='parentOption'><a target='_blank' href='mailto:stategraemsdev@gmail.com'><i class='fa fa-envelope-o'></i>  Contact us</a> </li>"
                            + "</ul>"
                            + '<div id="feedbackButton"><a target="_blank" href="http://bioinfo.cipf.es/stategraems/contact/">Feedback</a></div>'
                },
                {xtype: 'panel', region: 'center', id: 'mainViewCenterPanel', itemId: 'mainViewCenterPanel', overflowY: "auto", defaults: {border: 0}, layout: 'fit', items: [],
                    dockedItems: [
                        {xtype: 'toolbar', itemId: "mainViewCenterPanelToolbar", dock: 'bottom', defaults: {minWidth: 90}, hidden: true, style: "background: #F8F8F8;",
                            items: [
                                {xtype: 'tbfill'},
                                {xtype: 'button', action: 'editButton', cls: 'editButton', itemId: 'editButton', pressedCls: 'editButtonPressed', text: '<i class="fa fa-edit"></i> Edit'},
                                {xtype: 'button', action: 'backButton', cls: 'button', itemId: 'backButton', text: '<i class="fa fa-arrow-circle-left"></i> Back'},
                                {xtype: 'button', action: 'nextButton', cls: 'button', itemId: 'nextButton', text: 'Next <i class="fa fa-arrow-circle-right"></i>'},
                                {xtype: 'button', action: 'acceptButton', cls: 'acceptButton', itemId: 'acceptButton', text: '<i class="fa fa-check"></i> Accept'},
                                {xtype: 'button', action: 'cancelButton', cls: 'cancelButton', itemId: 'cancelButton', text: '<i class="fa fa-remove"></i> Cancel'}
                            ]
                        }
                    ]
                }
//                {xtype: 'panel', minHeight: 20, border: 0, region: 'south', layout: {type: 'hbox', pack: 'end'}, items: [{xtype: "label", html: '<i style="font-size:10px; color: #7E7E7E;margin-right: 10px;">STATegra EMS ' + EMS_VERSION + ' </i>'}]}
            ],
            listeners: {
                boxready: function () {
                    $(".menu a").click(function () {
                        me.changeMainView(this.name);
                    });
                    //THIS FUNCTION CHECK IF EXISTS A COOKIE WITH THE LOGGED USER NAME
                    //IF SO, THE PRINCIPAL PANEL IS CHANGED TO THE MAIN MENU PANEL
                    //IF NOT, THE PRINCIPAL PANEL IS CHANGED TO THE LOGIN PANEL
                    var userCookie = Ext.util.Cookies.get("loggedUser");
                    if (userCookie != null) {
                        me.changeMainView("HomePanel");
                    } else {
                        me.changeMainView("LoginPanel");
                    }
                }}
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.HomePanel', {
    extend: 'Ext.container.Container',
    alias: 'widget.HomePanel',
    name: "HomePanel",
    requires: ['SL.view.UserViews.UserView', 'SL.view.SampleViews.BioConditionView', 'SL.view.AnalysisViews.AnalysisView', 'SL.view.ExperimentView'],
    getViewName: function () {
        return this.name;
    },
    updateHelpPanel: function (content) {
        this.queryById('helpPanel').update(content);
    },
    initComponent: function () {
        var me = this;
        me.border = 0;
        Ext.applyIf(me, {
            layout: {type: 'vbox', align: 'stretch'}, defaults: {border: 0},
            items: [
                {xtype: 'box', cls: "panelInPrincipalTabPanel", html: '<h1 class="form_title">Welcome to STATegra EMS</h1><h2 class="form_subtitle">Please choose an option below to start working</h2>'},
                {xtype: 'panel', layout: {type: 'hbox', align: 'middle', pack: 'center'}, flex: 2,
                    items: [
                        {xtype: 'splitbutton', cls: 'buttonHomePanel',
                            html: '<img style="margin:auto; display: block; padding-top: 20px;" src="resources/images/experiment_128x128.png"></img><p style="margin: 5px;">Experiment</p>',
                            action: 'showNavigatorOptions',
                            width: 250, height: 230, arrowAlign: 'bottom',
                            menu: {
                                xtype: 'menu', cls: 'menuItemHomePanel',
                                items: [
                                    {xtype: 'menuitem', itemId: 'browseExperiment', width: 250, text: '<i class="fa fa-search"></i> Experiment browse', handler:
                                                function () {
                                                    application.getMainView().changeMainView("browseExperiments");
                                                }},
                                    {xtype: 'menuitem', itemId: 'inspectExperiment', width: 250, text: '<i class="fa fa-search"></i> Current experiment details', handler:
                                                function () {
                                                    application.getMainView().changeMainView("currentExperiment");
                                                }}
                                ]
                            }
                        },
                        {xtype: 'splitbutton', cls: 'buttonHomePanel',
                            html: '<img style="margin:auto; display: block; padding-top: 20px;" src="resources/images/home_128x128.png"></img><p style="margin: 5px;">Samples</p>',
                            action: 'showBioConditionsOptions',
                            width: 250, height: 230, arrowAlign: 'bottom',
                            menu: {
                                xtype: 'menu', cls: 'menuItemHomePanel',
                                items: [{xtype: 'menuitem', width: 250, text: '<i class="fa fa-search"></i> Browse Samples', itemId: 'searchBioCondition', handler:
                                                function () {
                                                    application.getMainView().changeMainView("browseSamples");
                                                }}
                                ]
                            }
                        },
                        {
                            xtype: 'splitbutton', cls: 'buttonHomePanel',
                            html: '<img style="margin:auto; display: block; padding-top: 20px;" src="resources/images/diagram_128x128.png"></img><p style="margin: 5px;">Analysis</p>',
                            action: 'showAnalysisOptions',
                            width: 250, height: 230, arrowAlign: 'bottom',
                            menu: {
                                xtype: 'menu',
                                cls: 'menuItemHomePanel',
                                items: [{xtype: 'menuitem', itemId: 'searchAnalysis', width: 250, text: '<i class="fa fa-search"></i> Browse Analysis', handler:
                                                function () {
                                                    application.getMainView().changeMainView("browseAnalysis");
                                                }}
                                ]
                            }
                        }
                    ]
                },
                {xtype: 'panel', flex: 1, itemId: 'helpPanel',
                    border: 0, cls: 'PanelInPrincipalTabPanel', margin: '0 0 0 0', bodyStyle: 'font-size: 20px; text-align:center',
                    html: "<p>Current Experiment " + Ext.util.Cookies.get('currentExperimentID') + "<p style='font-size: 16px;color: #0081C9;'>" + Ext.util.Cookies.get('currentExperimentName') + "</p> "
                }
            ]
        });

        me.callParent(arguments);
    }
});

Ext.define('SL.view.LoginPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.LoginPanel',
    name: "LoginPanel",
    getViewName: function () {
        return this.name;
    },
    initComponent: function () {
        var me = this;

        Ext.applyIf(me, {
            height: 445, width: 652, layout: {align: 'center', type: 'vbox'},
            cls: 'PanelInPrincipalTabPanel',
            items: [
                {xtype: 'box', cls: "panelInPrincipalTabPanel", html: '<h1 class="form_title">Welcome to STATegra EMS</h1><h2 class="form_subtitle">Please login to start working</h2>'},
                {xtype: 'form', width: 350, cls: 'loginPanel', layout: {align: 'stretch', type: 'vbox'}, labelWidth: '90', monitorValid: 'true',
                    flex: 1, bodyPadding: 10, margin: 50, frameHeader: false,
                    items: [
                        {xtype: 'textfield', anchor: '100%', fieldLabel: 'Username', name: 'user_id', allowBlank: false},
                        {xtype: 'textfield', anchor: '100%', fieldLabel: 'Password', name: 'password', inputType: 'password', allowBlank: false},
                        {xtype: 'container', layout: {type: 'hbox', pack: 'end'}, items: [
                                {xtype: 'button', action: 'login', maxWidth: 110, formBind: true, itemId: "loginButton", cls: 'acceptButton', text: '<i class="fa fa-check-circle"></i> Login'}
                            ]}
                    ],
                    listeners: {
                        boxready: function (form, options) {
                            this.keyNav = Ext.create('Ext.util.KeyNav', this.el, {
                                enter: function () {
                                    var button = form.queryById('loginButton');
                                    button.fireEvent('click', button);
                                },
                                scope: this
                            });
                        }
                    }
                },
                {xtype: 'panel', minHeight: 20, border: 0, layout: {type: 'hbox', pack: 'end'}, items: [
                        {xtype: "label", html: '<i style="font-size:10px; color: #7E7E7E;margin-right: 10px;">STATegra EMS ' + EMS_VERSION + '</i>'}]}

            ]
        });
        me.callParent(arguments);
    }
});


Ext.define('SL.view.AdminToolsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.AdminToolsPanel',
    name: "AdminToolsPanel",
    getViewName: function () {
        return this.name;
    },
    updateHelpPanel: function (content) {
        this.queryById('helpPanel').update(content);
    },
    initComponent: function () {
        var me = this;
        me.border = 0;
        Ext.applyIf(me, {
            layout: {align: 'stretch', type: 'vbox'}, defaults: {border: 0},
            items: [
                {xtype: 'box', cls: "panelInPrincipalTabPanel", html: '<h1 class="form_title">STATegra EMS Admin</h1><h2 class="form_subtitle">Please choose an option below to start working</h2>'},
                {xtype: 'panel', layout: {type: 'hbox', align: 'middle', pack: 'center'}, flex: 2, defaults: {width: 250, height: 230, arrowAlign: 'bottom'},
                    items: [
                        {xtype: 'button', cls: 'buttonHomePanel', action: 'adminExperiments',
                            html: '<img style="margin:auto; display: block; padding-top: 20px;" src="resources/images/experiment_edit_128x128.png"></img><p style="margin: 5px;">Experiment admin</p>',
                            handler: function () {
                                application.getController("ExperimentController").adminExperimentsButtonHandler();
                            }
                        },
                        {xtype: 'button', cls: 'buttonHomePanel',
                            html: '<img style="margin:auto; display: block; padding-top: 20px;" src="resources/images/user_admin_128x128.png"></img><p style="margin: 5px;">User admin</p>',
                            itemId: 'adminUsers',
                            handler: function () {
                                application.getController("UserController").adminUsersButtonHandler();
                            }
                        },
                        {xtype: 'splitbutton', cls: 'buttonHomePanel',
                            html: '<img style="margin:auto; display: block; padding-top: 20px;" src="resources/images/database_tools_128x128.png"></img><p style="margin: 5px;">Database admin</p>',
                            action: 'adminDatabase',
                            menu: {
                                xtype: 'menu',
                                cls: 'menuItemHomePanel',
                                items: [{xtype: 'menuitem', itemId: 'dumpDatabase', action: 'dumpDatabase', width: 250, text: 'Backup database'}]
                            }
                        }
                    ]
                },
                {xtype: 'panel', flex: 1, itemId: 'helpPanel',
                    border: 0, cls: 'PanelInPrincipalTabPanel', margin: '0 0 0 0', bodyStyle: 'font-size: 20px; text-align:center',
                    html: "<p></p> "
                },
                {xtype: 'panel', minHeight: 20, border: 0, layout: {type: 'hbox', pack: 'end'}, items: [
                        {xtype: "label", html: '<i style="font-size:10px; color: #7E7E7E;margin-right: 10px;">STATegra EMS ' + EMS_VERSION + ' </i>'}
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }
});