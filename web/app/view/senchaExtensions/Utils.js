Ext.define('SL.view.senchaExtensions.Observable', {
    alias: 'widget.Observable',
    observers: null,
    changed: false,
    getObservers: function () {
        if (this.observers === null) {
            this.observers = [];
        }
        return this.observers;
    },
    addObserver: function (observer) {
        if (observer.updateObserver !== undefined) {
            //TODO: REMOVE THIS CODE
            if (debugging === true) {
                nObservers += 1;
                console.info("New observer added " + observer.id + " TOTAL OBSERVERS: " + nObservers);
            }
            this.getObservers().push(observer);
        }
    },
    clearChanged: function () {
        this.changed = false;
    },
    countObservers: function () {
        return this.getObservers().length;
    },
    deleteObserver: function (observer) {
        var _observers = this.getObservers();
        for (var i in _observers) {
            if (_observers[i] == observer) {
                //TODO: REMOVE THIS CODE
                if (debugging === true) {
                    nObservers -= 1;
                    console.info("Observer removed " + observer.id + " TOTAL OBSERVERS: " + nObservers);
                }
                this.getObservers().splice([i], 1);
            }
        }
    },
    hasChanged: function () {
        return this.changed;
    },
    notifyObservers: function () {
        if (this.changed) {
            var _observers = this.getObservers();
            for (var i in _observers) {
                _observers[i].updateObserver();
            }
            this.changed = false;
        }
    },
    setChanged: function () {
        this.changed = true;
    }
});

Ext.define('SL.view.senchaExtensions.Observer', {
    alias: 'widget.Observer',
    name: "",
    updateObserver: function () {
        console.error("Observer:updateObserver : Not implemented yet");
    },
    getViewName: function () {
        return this.name;
    }
});

Ext.define('SL.view.senchaExtensions.Command', {
    alias: 'widget.Command',
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
    addNewTask: function (_command, _object) {
        this.getTaskQueue().push({command: _command, object: _object});
    },
    getTaskQueue: function () {
        if (this.taskQueue === undefined) {
            this.taskQueue = [];
        }
        return this.taskQueue;
    },
    clearTaskQueue: function () {
        this.taskQueue = [];
    },
    setTaskQueue: function (_taskQueue) {
        this.taskQueue = _taskQueue;
    }
});

Ext.define('SL.view.senchaExtensions.View', {
    alias: 'widget.View',
    controller: null,
    timerID1: null,
    timerID2: null,
    getController: function () {
        return this.controller;
    },
    setController: function (controller) {
        this.controller = controller;
    },
    initializeCountdownDialogs: function () {
        var me = this;
        //SET THE BEHAVIOUR WHEN THE BLOCKED TIME END
        //FIRST, CALCULATE THE TIMEOUT --> IF THE USER HAS 30 MINUTES FOR EDITING THE OBJECT,
        //WHEN ONLY A MINUTE LEFT, A MESSAGE IS SHOWN ASKING THE USER WHAT TO DO
        var _time = (LOCKED_TIME - 5) * 60 * 1000;

        var dialogButtons = [
            {text: '<i class="fa fa-clock-o"></i> Get more edition time', cls: "editButton", handler: function () {
                    me.getController().getMoreTimeButtonHandler(me);
                    //WHERE THIS IS THE DIALOG
                    this.close();
                }
            },
            {text: '<i class="fa fa-remove"></i> Close', cls: "cancelButton", handler: function () {
                    //WHERE THIS IS THE DIALOG
                    this.close();
                }
            }
        ];
        var noSelectionHandler = function (dialog) {
            //WHERE THIS IS THE DIALOG
            dialog.close();
        };

        var beforeShowAction = function () {
            application.getMainView().changeMainView(me.getViewName());
        };

        me.timerID1 = showTimeCountMessage(
                /*TITLE*/ "Are you still there? Your locking time will expire soon.",
                /*MESSAGE*/ 'By default users can lock a objects for edition during ' + LOCKED_TIME + ' minutes. </br> Your locking time will expire in <b>5</b> minutes. Please, save changes or request more time.',
                /*TIME TO SHOW THE DIALOG*/ _time,
                /*ACTION BEFORE SHOW THE DIALOG*/ beforeShowAction,
                /*HANDLERS FOR DIALOGS BUTTONS*/ dialogButtons,
                /*ACTION WHEN NO SELECTION*/ noSelectionHandler
                );


        dialogButtons = [
            {text: '<i class="fa fa-check"></i> Save changes and close', cls: "acceptButton", handler: function () {
                    Ext.WindowManager.each(function () {
                        if (this.close !== undefined && (this.preventAutoClose === undefined || this.preventAutoClose === false)) {
                            this.close();
                        }
                    })
                    me.getController().acceptButtonPressedHandler(me);
                    //WHERE THIS IS THE DIALOG
                    this.close();
                }
            },
            {text: '<i class="fa fa-clock-o"></i> Get more time', cls: "editButton", handler: function () {
                    me.getController().getMoreTimeButtonHandler(me);
                    //WHERE THIS IS THE DIALOG
                    this.close();
                }
            },
            {text: '<i class="fa fa-remove"></i> Cancel changes and close', cls: "cancelButton", handler: function () {
                    Ext.WindowManager.each(function () {
                        if (this.close !== undefined && (this.preventAutoClose === undefined || this.preventAutoClose === false)) {
                            this.close();
                        }
                    })
                    me.getController().cancelButtonPressedHandler(me, true);
                    //WHERE THIS IS THE DIALOG
                    this.close();
                }
            }
        ];

        noSelectionHandler = function (dialog) {
            Ext.WindowManager.each(function () {
                if (this.close !== undefined && (this.preventAutoClose === undefined || this.preventAutoClose === false)) {
                    this.close();
                }
            });
            showWarningMessage("Your edition time expired and the panel closed automatically without saving changes.</br>" +
                    'By default users can lock a objects for edition during ' + LOCKED_TIME + ' minutes.</br>' +
                    'You were asked about get more edition time or save changes but no answer was obtained, sorry for the inconveniences.',
                    {softError: false, preventAutoClose: true});
            me.getController().cancelButtonPressedHandler(me, true);
            //WHERE THIS IS THE DIALOG
            dialog.close();
        };

        beforeShowAction = function () {
            application.getMainView().changeMainView(me.getViewName());
        };

        _time = (LOCKED_TIME) * 60 * 1000;

        me.timerID2 = showTimeCountMessage(
                /*TITLE*/ "Expired locking time",
                /*MESSAGE*/ 'The locking time has expired and the panel will be closed.',
                /*TIME TO SHOW THE DIALOG*/ _time,
                /*ACTION BEFORE SHOW THE DIALOG*/ beforeShowAction,
                /*HANDLERS FOR DIALOGS BUTTONS*/ dialogButtons,
                /*ACTION WHEN NO SELECTION*/ noSelectionHandler
                );
    },
    cleanCountdownDialogs: function () {
        if (this.timerID1 != null) {
            window.clearTimeout(this.timerID1);
            console.info('Removed count-down timer 1 (ID ' + this.timerID1 + ')');
            this.timerID1 = null;
        }
        if (this.timerID2 != null) {
            window.clearTimeout(this.timerID2);
            console.info('Removed count-down timer 2 (ID ' + this.timerID2 + ')');
            this.timerID2 = null;
        }
    }
});


function showMessageDialog(message, _arguments, type) {
    var title = _arguments.title;
    var softMsg = _arguments.soft;
    var delay = _arguments.delay;
    var callback = (_arguments.callback == null) ? null : _arguments.callback;

    if (softMsg) {
        if (type === "error" || type === "warning") {
            console.warn((new Date()).toLocaleString() + " " + message);
        } else {
            console.info((new Date()).toLocaleString() + " " + message);
        }
        Ext.messages.showMessage(message, delay, type);
    } else {
        if (type === "error" || type === "warning") {
            console.error((new Date()).toLocaleString() + " " + message);
        } else {
            console.info((new Date()).toLocaleString() + " " + message);
        }

        var icon = 'MessageBox_SUCCESS';
        if (type === "error") {
            icon = Ext.Msg.ERROR;
        } else if (type === "warning") {
            icon = Ext.Msg.WARNING;
        }

        Ext.MessageBox.show({title: title, msg: message, buttons: Ext.MessageBox.OK, icon: icon, fn: callback});
    }
}

function showErrorMessage(message, _arguments) {
    var errorCode = (_arguments == null || _arguments.errorCode == null) ? '' : '' + _arguments.errorCode;
    var arguments = {};
    arguments.title = (_arguments == null || _arguments.title == null) ? 'Error' : '' + _arguments.title;
    arguments.soft = (_arguments == null || _arguments.soft == true) ? true : false;
    arguments.delay = (_arguments == null || _arguments.delay == null) ? 5000 : _arguments.delay;
    arguments.callback = (_arguments == null || _arguments.callback == null) ? null : _arguments.callback;

    if (errorCode !== "") {
        message += '<br>Error code: <b>' + errorCode + '</b>';
    }
    var messageText = message;
    if (message.indexOf("ERROR MESSAGE:") !== -1) {
        messageText = message.split("ERROR MESSAGE:")[1];
    }

    showMessageDialog(messageText, arguments, "error");
}

function showWarningMessage(message, _arguments) {
    var errorCode = (_arguments == null || _arguments.errorCode == null) ? '' : '' + _arguments.errorCode;
    var arguments = {};
    arguments.title = (_arguments == null || _arguments.title == null) ? 'Warning' : '' + _arguments.title;
    arguments.soft = (_arguments == null || _arguments.soft == true) ? true : false;
    arguments.delay = (_arguments == null || _arguments.delay == null) ? 5000 : _arguments.delay;
    arguments.callback = (_arguments == null || _arguments.callback == null) ? null : _arguments.callback;

    if (errorCode !== "") {
        message += '<br>Error code: <b>' + errorCode + '</b>';
    }

    showMessageDialog(message, arguments, "warning");
}


function showSuccessMessage(message, _arguments) {
    var arguments = {};
    arguments.title = (_arguments == null || _arguments.title == null) ? 'Success' : '' + _arguments.title;
    arguments.soft = (_arguments == null || _arguments.soft == true) ? true : false;
    arguments.delay = (_arguments == null || _arguments.delay == null) ? 5000 : _arguments.delay;
    arguments.callback = (_arguments == null || _arguments.callback == null) ? null : _arguments.callback;

    showMessageDialog(message, arguments, false);
}


function showTimeCountMessage(title, message, timeOut, beforeShowAction, dialogButtons, noSelectionHandler) {
    //SET THEE TIMER THAT WILL SHOW THE DIALOG AFTER timeOut SECONDS
    var timer_id = window.setTimeout(
            function () {
                console.info('Creating messagebox...');
                var dialog = Ext.create('Ext.window.Window', {
                    title: title,
                    width: 520, bodyPadding: '0px 10px', layout: {type: 'vbox', align: "stretch"}, border: 0, modal: true, closable: false,
                    items: [
                        {xtype: "box", flex: 1, html:
                                    "<span style='font-size:16px; margin-bottom:15px;'>" +
                                    "<p>" + message + "</p>" +
                                    '<p>Panel will be automatically closed in <span id="timer_div" style="display:inline; font-weight:bold">' + 10 + '</span> seconds.</p>' +
                                    'You should save changes before close' +
                                    "<p>" + '</span>' + "</p>"
                        },
                        {xtype: "container", itemId: "buttonsContainer", layout: {type: 'hbox', pack: "center"},
                            items: []
                        },
                    ],
                    listeners: {
                        beforeshow: beforeShowAction,
                        boxready: function () {
                            var field = $("#timer_div");
                            //HERE THE THREAD TO UPDATE THE COUNTDOWN VALUE 
                            var me = this;
                            this.countDownInterval = window.setInterval(
                                    function () {
                                        var countDownValue = parseInt(field.html());
                                        if (countDownValue > 1) {
                                            field.html(countDownValue - 1);
                                        } else {
                                            noSelectionHandler(me);
                                        }
                                    }, 1000);
                        },
                        beforedestroy: function () {
                            console.info('Removed count-down timer for messagebox ' + this.getId() + '(ID ' + this.countDownInterval + ')');
                            window.clearInterval(this.countDownInterval);
                            console.info('Removed timeout for messagebox ' + this.getId() + '(ID ' + timer_id + ')');
                            window.clearTimeout(timer_id);
                        }
                    }
                });

                var buttons = [];
                for (var i in dialogButtons) {
                    buttons.push({xtype: "button", cls: dialogButtons[i].cls, text: dialogButtons[i].text, scope: dialog, handler: dialogButtons[i].handler});
                }

                dialog.queryById("buttonsContainer").add(buttons);

                dialog.preventAutoClose = true;
                dialog.show();
            }, timeOut);
    console.info("CREATED TIMECOUNT WITH ID " + timer_id);

    return timer_id;
}


Ext.messages = function () {
    var msgCt;

    function createBox(t, s, cls) {
        return '<div class="' + cls + '"><h3>' + t + '</h3><p>' + s + '</p></div>';
    }
    return {
        showMessage: function (text, _delay, mode, callback) {
            var cls = "msg";
            if (mode === "error") {
                cls = "error_msg"
            } else if (mode === "warning") {
                cls = "warning_msg"
            }
            if (!msgCt) {
                msgCt = Ext.DomHelper.insertFirst(document.body, {id: 'msg-div'}, true);
            }
            var s = Ext.String.format.apply(String, [""]);
            var m = Ext.DomHelper.append(msgCt, createBox(text, s, cls), true);
            m.hide();
            m.slideIn('t').ghost("t", {delay: _delay, remove: true, callback: callback});
        },
        init: function () {
            if (!msgCt) {
                msgCt = Ext.DomHelper.insertFirst(document.body, {id: 'msg-div'}, true);
            }
        }
    };
}();


function ajaxErrorHandler(className, functionName, ajax_response) {
    Ext.resumeLayouts(true);

    var jsonResponse = "Unknown [FAILED TRYING TO PARSE ERROR MESSAGE].";
    try {
        if (debugging === true)
            debugger;
        var jsonResponse_aux = Ext.JSON.decode(ajax_response.responseText.replace(/\n/g, "</br>"));
        jsonResponse = (jsonResponse_aux == null) ? jsonResponse : jsonResponse_aux;
        jsonResponse_aux = jsonResponse['reason'];
        jsonResponse = (jsonResponse_aux == null) ? jsonResponse : jsonResponse_aux;

        if (jsonResponse.indexOf("ERROR 0x00003") !== -1) {
            showErrorMessage("Invalid session. </br>Your current session is invalid, please login to the application again.", {soft: false, callback: function () {
                    Ext.util.Cookies.clear('loggedUser', location.pathname);
                    Ext.util.Cookies.clear('sessionToken', location.pathname);
                    Ext.util.Cookies.clear('currentExperimentID', location.pathname);
                    forceRefresh = true;
                    location.reload();
                }})
            return;
        }
    } catch (error) {
    }
    showErrorMessage(new Date() + ': Error at <i>' + className + ':' + functionName + '</i></br>Please try again later.</br>Error message: <i>' + jsonResponse + '</i>', {soft: false});
}

String.prototype.chomp = function () {
    return this.replace(/(\n|\r)+$/, '');
}

Object.values = function (obj) {
    var vals = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            vals.push(obj[key]);
        }
    }
    return vals;
}