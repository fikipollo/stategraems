(function(){var app=angular.module("analysis.controllers",["ang-dialogs","angular.backtop","analysis.services.analysis-list","analysis.directives.analysis-views","templates.directives.template","ui.bootstrap"]);app.directive("ngEnter",function(){return function(scope,element,attrs){element.bind("keydown keypress",function(event){if(event.which===13){scope.$apply(function(){scope.$eval(attrs.ngEnter)});event.preventDefault()}})}});app.controller("AnalysisListController",function($state,$rootScope,$scope,$http,$stateParams,$dialogs,APP_EVENTS,AnalysisList){this.retrieveAnalysisData=function(group,force){$scope.setLoading(true);if(AnalysisList.getOld()>1||force){$http($rootScope.getHttpRequestConfig("POST","analysis-list",{headers:{"Content-Type":"application/json"},data:$rootScope.getCredentialsParams()})).then(function successCallback(response){$scope.analysis=AnalysisList.setAnalysis(response.data).getAnalysis();for(var i in $scope.analysis){if($scope.analysis[i].status==="pending"){$scope.review=true;break}}$scope.tags=AnalysisList.updateTags().getTags();$scope.analysisTypes=AnalysisList.updateAnalysisTypes().getAnalysisTypes();$scope.filteredAnalysis=$scope.analysis.length;if(window.innerWidth>1500){$scope.visibleAnalysis=14}else if(window.innerWidth>1200){$scope.visibleAnalysis=10}else{$scope.visibleAnalysis=6}$scope.visibleAnalysis=Math.min($scope.filteredAnalysis,$scope.visibleAnalysis);$scope.setLoading(false)},function errorCallback(response){$scope.setLoading(false);debugger;var message="Failed while retrieving the analysis list.";$dialogs.showErrorDialog(message,{logMessage:message+" at AnalysisListController:retrieveAnalysisData."});console.error(response.data)})}else{$scope.analysis=AnalysisList.getAnalysis();$scope.tags=AnalysisList.getTags();$scope.filteredAnalysis=$scope.analysis.length;for(var i in $scope.analysis){if($scope.analysis[i].status==="pending"){$scope.review=true;break}}$scope.setLoading(false)}return this};$scope.filterAnalysis=function(){$scope.filteredAnalysis=0;$scope.user_id=$scope.user_id||Cookies.get("loggedUserID");return function(item){if($scope.show!=="All analysis types"&&item.analysis_type!==$scope.show){return false}if(!$scope.showDeleted&&item.remove_requests.indexOf($scope.user_id)!==-1){return false}var filterAux,item_tags;for(var i in $scope.filters){filterAux=$scope.filters[i].toLowerCase();item_tags=item.tags.join("");if(!(item.analysis_name.toLowerCase().indexOf(filterAux)!==-1||item.analysis_type.toLowerCase().indexOf(filterAux)!==-1||item_tags.toLowerCase().indexOf(filterAux)!==-1)){return false}}$scope.filteredAnalysis++;return true}};$scope.getTagColor=function(_tag){var tag=AnalysisList.getTag(_tag);if(tag!==null){return tag.color}return""};$scope.isMember=function(analysis){$scope.user_id=$scope.user_id||Cookies.get("loggedUserID");return AnalysisList.isOwner(analysis,$scope.user_id)||AnalysisList.isMember(analysis,$scope.user_id)};this.filterByTag=function(tag){if(tag!=="All"){var filters=arrayUnique($scope.filters.concat(tag));$scope.filters=AnalysisList.setFilters(filters).getFilters()}};$scope.$on(APP_EVENTS.experimentDeleted,function(event,args){this.retrieveExperimentsData("",true)});this.showAnalysisChooserChangeHandler=function(){this.retrieveAnalysisData($scope.show)};this.applySearchHandler=function(){var filters=arrayUnique($scope.filters.concat($scope.searchFor.split(" ")));$scope.filters=AnalysisList.setFilters(filters).getFilters()};this.removeFilterHandler=function(filter){$scope.filters=AnalysisList.removeFilter(filter).getFilters()};this.showMoreAnalysisHandler=function(){if(window.innerWidth>1500){$scope.visibleAnalysis+=10}else if(window.innerWidth>1200){$scope.visibleAnalysis+=6}else{$scope.visibleAnalysis+=4}$scope.visibleAnalysis=Math.min($scope.filteredAnalysis,$scope.visibleAnalysis)};this.name="AnalysisListController";var me=this;if(!Cookies.get("currentExperimentID")){$dialogs.showInfoDialog('Please, choose first an study at the "Browse studies" section.');$state.go("experiments");return}$scope.analysis=AnalysisList.getAnalysis();$scope.tags=AnalysisList.getTags();$scope.analysisTypes=AnalysisList.getAnalysisTypes();$scope.filters=AnalysisList.getFilters();$scope.filteredAnalysis=$scope.analysis.length;for(var i in $scope.analysis){if($scope.analysis[i].status==="pending"){$scope.review=true;break}}if(window.innerWidth>1500){$scope.visibleAnalysis=14}else if(window.innerWidth>1200){$scope.visibleAnalysis=10}else{$scope.visibleAnalysis=6}$scope.visibleAnalysis=Math.min($scope.filteredAnalysis,$scope.visibleAnalysis);if($scope.analysis.length===0||$stateParams.force){this.retrieveAnalysisData("my_analysis",true)}});app.controller("AnalysisDetailController",function($state,$rootScope,$scope,$http,$stateParams,$timeout,$uibModal,$dialogs,APP_EVENTS,AnalysisList,TemplateList){this.retrieveAnalysisDetails=function(analysis_id,force){$scope.setLoading(true);$scope.model=AnalysisList.findAnalysis(analysis_id);if($scope.model===null||force===true||$scope.model.non_processed_data===undefined&&$scope.model.processed_data===undefined){$http($rootScope.getHttpRequestConfig("POST","analysis-info",{headers:{"Content-Type":"application/json"},data:$rootScope.getCredentialsParams({analysis_id:analysis_id})})).then(function successCallback(response){$scope.model=AnalysisList.addAnalysis(response.data);AnalysisList.adaptInformation([$scope.model])[0];$scope.diagram=me.generateWorkflowDiagram($scope.model,$scope.diagram);$scope.setLoading(false)},function errorCallback(response){debugger;var message="Failed while retrieving the analysis's details.";$dialogs.showErrorDialog(message,{logMessage:message+" at AnalysisDetailController:retrieveAnalysisDetails."});console.error(response.data);$scope.setLoading(false)})}else{$scope.diagram=me.generateWorkflowDiagram($scope.model,$scope.diagram);$scope.setLoading(false)}};this.send_create_analysis=function(callback_caller,callback_function){$scope.setLoading(true);$http($rootScope.getHttpRequestConfig("POST","analysis-create",{headers:{"Content-Type":"application/json"},data:$rootScope.getCredentialsParams({analysis_json_data:$scope.model})})).then(function successCallback(response){console.info((new Date).toLocaleString()+"Analysis "+$scope.model.analysis_id+" successfully saved in server");$scope.model.analysis_id=response.data.newID;AnalysisList.addAnalysis($scope.model);$scope.setLoading(false);callback_caller[callback_function](true)},function errorCallback(response){debugger;var message="Failed while creating a new analysis.";$dialogs.showErrorDialog(message,{logMessage:message+" at AnalysisDetailController:send_create_analysis."});console.error(response.data);$scope.taskQueue.unshift({command:"create_new_analysis",object:null});$scope.setLoading(false);callback_caller[callback_function](false)})};this.send_update_analysis=function(callback_caller,callback_function){$scope.setLoading(true);$http($rootScope.getHttpRequestConfig("POST","analysis-update",{headers:{"Content-Type":"application/json"},data:$rootScope.getCredentialsParams({analysis_json_data:$scope.model})})).then(function successCallback(response){console.info((new Date).toLocaleString()+"Analysis "+$scope.model.analysis_id+" successfully updated in server");$scope.setLoading(false);callback_caller[callback_function](true)},function errorCallback(response){debugger;var message="Failed while updating the analysis.";$dialogs.showErrorDialog(message,{logMessage:message+" at AnalysisDetailController:send_update_analysis."});console.error(response.data);$scope.taskQueue.unshift({command:"update_analysis",object:null});$scope.setLoading(false);callback_caller[callback_function](false)})};this.send_lock_analysis=function(newViewMode){$scope.setLoading(true);$http($rootScope.getHttpRequestConfig("POST","analysis-lock",{headers:{"Content-Type":"application/json"},data:$rootScope.getCredentialsParams({analysis_id:$scope.model.analysis_id})})).then(function successCallback(response){if(response.data.success){console.info((new Date).toLocaleString()+"object locked successfully");if(newViewMode==="edition"){$scope.initializeCountdownDialogs()}$scope.setViewMode(newViewMode||"view");$scope.setLoading(false)}else{$dialogs.showErrorDialog("Apparently user "+response.data.user_id+" opened this object for editing. </br>Please, try again later. If the problem persists, please contact with tecnical support.",{logMessage:(new Date).toLocaleString()+"EDITION DENIED FOR Analysis "+$scope.model.analysis_id});$scope.setLoading(false)}},function errorCallback(response){debugger;var message="Failed while sending lock request.";$dialogs.showErrorDialog(message,{logMessage:message+" at AnalysisDetailController:send_lock_analysis."});console.error(response.data);$scope.setLoading(false)});return this};this.send_unlock_analysis=function(callback_caller,callback_function){$scope.setLoading(true);$http($rootScope.getHttpRequestConfig("POST","analysis-unlock",{headers:{"Content-Type":"application/json"},data:$rootScope.getCredentialsParams({analysis_id:$scope.model.analysis_id})})).then(function successCallback(response){console.info((new Date).toLocaleString()+"object unlocked successfully");$scope.setLoading(false);if(callback_caller){callback_caller[callback_function](true)}else{$scope.setViewMode("view",true)}},function errorCallback(response){debugger;var message="Failed while sending unlock request.";$dialogs.showErrorDialog(message,{logMessage:message+" at AnalysisDetailController:send_unlock_analysis."});console.error(response.data);callback_caller[callback_function](false);$scope.setLoading(false)});return this};this.clean_task_queue=function(tasks_queue){console.info((new Date).toLocaleString()+"CLEANING TASK QUEUE");try{if(tasks_queue.length===0){return tasks_queue}if(tasks_queue[0].command==="create_new_analysis"){var tasks_queue_temp=[tasks_queue[0]];return tasks_queue_temp}else{var tasks_queue_temp=[];tasks_queue_temp.push({command:"update_analysis",object:null});tasks_queue_temp.push({command:"clear_locked_status",object:null});return tasks_queue_temp}}catch(error){$dialogs.showErrorDialog("ERROR CLEANING TASK QUEUE: "+error,{soft:false});return tasks_queue}};this.execute_tasks=function(status){var error_message="";var current_task=$scope.getTaskQueue().shift();if(current_task!=null&&status){try{switch(current_task.command){case"create_new_analysis":console.info((new Date).toLocaleString()+"SENDING SAVE NEW analysis REQUEST TO SERVER");this.send_create_analysis(this,"execute_tasks");console.info((new Date).toLocaleString()+"SAVE NEW analysis REQUEST SENT TO SERVER");break;case"update_analysis":console.info((new Date).toLocaleString()+"SENDING UPDATE Analysis REQUEST TO SERVER");this.send_update_analysis(this,"execute_tasks");console.info((new Date).toLocaleString()+"UPDATE Analysis REQUEST SENT TO SERVER");break;case"clear_locked_status":console.info((new Date).toLocaleString()+"SENDING UNLOCK Analysis "+$scope.model.analysis_id+" REQUEST TO SERVER");this.send_unlock_analysis(this,"execute_tasks");console.info((new Date).toLocaleString()+"UNLOCK Analysis "+$scope.model.analysis_id+" REQUEST SENT TO SERVER");break;default:status=false;break}}catch(error){error_message=error.message;status=false;$scope.taskQueue.unshift(current_task)}if(!status){$dialogs.showErrorDialog("Failed trying to saved the changes.</br>Please try again.</br>Error: "+error_message)}}else if(status){$scope.setViewMode("view",true);$dialogs.showSuccessDialog("Analysis "+$scope.model.analysis_id+" saved successfully")}else{status=false;$scope.taskQueue.unshift(current_task);$scope.setLoading(false)}};this.generateWorkflowDiagram=function(analysis,diagram){var step=null,edge_id="",edges={},nodes={};analysis=analysis||$scope.analysis;try{var steps=analysis.non_processed_data.concat(analysis.processed_data);for(var i in steps){step=steps[i];if(!step.status||step.status.indexOf("deleted")===-1){nodes[step.step_id]={id:step.step_id,label:step.step_number+". "+step.step_name,x:step.x||0,y:step.y||0,step_type:step.type,step_subtype:step.raw_data_type||step.intermediate_data_type,size:12}}}for(var i in steps){step=steps[i];if(nodes[step.step_id]){for(var j in step.used_data){if(nodes[step.used_data[j]]){edge_id=step.step_id+""+step.used_data[j];edges[edge_id]={id:edge_id,source:step.used_data[j],target:step.step_id,type:"arrow"}}}}}for(var i in steps){step=steps[i];if(nodes[step.step_id]){for(var j in step.reference_data){if(nodes[step.reference_data[j]]){edge_id=step.step_id+""+step.reference_data[j];edges[edge_id]={id:edge_id,source:step.reference_data[j],target:step.step_id,type:"dotted"}}}}}diagram=diagram||$scope.diagram;if(!diagram){diagram={hasChanged:0,nodes:Object.values(nodes),edges:Object.values(edges)}}else{diagram.nodes=Object.values(nodes);diagram.edges=Object.values(edges);diagram.hasChanged++}}catch(e){debugger}return diagram};this.showStepDetails=function(stepModel){$scope.displayedSteps=$scope.displayedSteps||[];for(var i=0;i<$scope.displayedSteps.length;i++){if($scope.displayedSteps[i].step_id===stepModel.step_id){$scope.activeTab=i+2;return}}$scope.displayedSteps.push(stepModel);$timeout(function(){$scope.activeTab=$scope.displayedSteps.length+1},300);return this};this.closeStepDetails=function(stepModel){$scope.displayedSteps=$scope.displayedSteps||[];for(var i=0;i<$scope.displayedSteps.length;i++){if($scope.displayedSteps[i].step_id===stepModel.step_id){$scope.displayedSteps.splice(i,1);if($scope.activeTab===i+2){$scope.activeTab=1}return}}return this};this.closeAllDetailsViews=function(){$scope.displayedSteps=[];return this};$scope.setViewMode=function(mode,restore){if(mode==="view"){$scope.panel_title="Analysis details.";$scope.clearCountdownDialogs();if(restore===true){me.retrieveAnalysisDetails($scope.model.analysis_id,true)}}else if(mode==="creation"){$scope.panel_title="Analysis creation.";$scope.addNewTask("create_new_analysis",null)}else if(mode==="edition"){$scope.panel_title="Analysis edition.";this.addNewTask("clear_locked_status",null)}$scope.viewMode=mode;return $scope.viewMode};$scope.initializeCountdownDialogs=function(){console.error("initializeCountdownDialogs NOT IMPLEMENTED")};$scope.clearCountdownDialogs=function(){console.error("cleanCountdownDialogs NOT IMPLEMENTED")};$scope.filterSteps=function(type){return function(item){if(type&&item.type!==type||$scope.show.steps!=="all"&&item.type!==$scope.show.steps){return false}return true}};$scope.countStepsByClassification=function(classification){var count=0;for(var i in $scope.model.non_processed_data){if($scope.model.non_processed_data[i].type===classification){count++}}for(var i in $scope.model.processed_data){if($scope.model.processed_data[i].type===classification){count++}}return count};$scope.$on(APP_EVENTS.stepChanged,function(){if(!$scope.isModal){AnalysisList.updateStepIndexes($scope.model);$scope.diagram=me.generateWorkflowDiagram($scope.model,$scope.diagram)}});this.addNewStepButtonHandler=function(){$scope.typesInfo={};$scope.isModal=true;$scope.createStepDialog=$uibModal.open({templateUrl:"app/analysis/new-step-dialog.tpl.html",size:"md",controller:"AnalysisDetailController",controllerAs:"controller",scope:$scope});$scope.createStepDialog.result.then(function(reason){var step={step_name:"Unnamed step",step_id:$scope.model.analysis_id+"."+$scope.model.nextStepID,submission_date:new Date,last_edition_date:new Date,step_owners:[{user_id:Cookies.get("loggedUserID")}],files_location:[],status:"new"};if($scope.typesInfo.step_type==="rawdata"){step.type="rawdata";step.raw_data_type=$scope.typesInfo.step_subtype.replace(/ /g,"_");step.step_name="Unnamed "+step.raw_data_type+" step";step.analyticalReplicate_id=null;step.extractionMethod={extraction_method_type:$scope.typesInfo.step_subtype.replace(/ /g,"_"),separationMethod:{}};$scope.model.non_processed_data.push(step);$scope.model.nextStepID++}else if($scope.typesInfo.step_type==="intermediate_data"){step.type="intermediate_data";step.intermediate_data_type=$scope.typesInfo.step_subtype.replace(/ /g,"_");step.step_name="Unnamed "+step.intermediate_data_type+" step";step.used_data=[];$scope.model.non_processed_data.push(step);$scope.model.nextStepID++}else if($scope.typesInfo.step_type==="external_source"){step.type="external_source";$scope.model.non_processed_data.push(step);$scope.model.nextStepID++}else if($scope.typesInfo.step_type==="processed_data"){step.type="processed_data";step.processed_data_type=$scope.typesInfo.step_subtype.replace(/ /g,"_");step.step_name="Unnamed "+step.processed_data_type+" step";step.used_data=[];step.reference_data=[];$scope.model.processed_data.push(step);$scope.model.nextStepID++}delete $scope.typesInfo;delete $scope.isModal;$rootScope.$broadcast(APP_EVENTS.stepChanged);me.showStepDetails(step)},function(result){});return this};this.addNewStepAcceptButtonHandler=function(){$scope.createStepDialog.close("cancel");delete $scope.createStepDialog};this.updateStepSubtypes=function(){if($scope.typesInfo.step_type){$http($rootScope.getHttpRequestConfig("GET","analysis-step-subtypes",{params:{step_type:$scope.typesInfo.step_type}})).then(function successCallback(response){$scope.typesInfo.step_subtypes=response.data.subtypes},function errorCallback(response){var message="Failed while retrieving the step subtypes.";$dialogs.showErrorDialog(message,{logMessage:message+" at AnalysisDetailController:updateStepSubtypes."});console.error(response.data);debugger})}};this.deleteAnalysisHandler=function(){var me=this;var current_user_id=""+Cookies.get("loggedUserID");if(AnalysisList.isOwner($scope.model,current_user_id)||current_user_id==="admin"){$scope.setLoading(true);$http($rootScope.getHttpRequestConfig("POST","analysis-delete",{headers:{"Content-Type":"application/json; charset=utf-8"},data:$rootScope.getCredentialsParams({analysis_id:$scope.model.analysis_id,loggedUserID:current_user_id})})).then(function successCallback(response){$scope.setLoading(false);if(response.data.removed){$dialogs.showSuccessDialog("The analysis was successfully deleted.")}else{$dialogs.showSuccessDialog("The analysis is now in deletion process and it will be completely deleted as soon as the other owners confirm this action.")}$rootScope.$emit(APP_EVENTS.analysisDeleted);$state.go("analysis",{force:true})},function errorCallback(response){$scope.setLoading(false);var message="Failed while deleting the analysis.";$dialogs.showErrorDialog(message,{logMessage:message+" at AnalysisDetailController:deleteAnalysisHandler."});console.error(response.data);debugger})}};this.editButtonHandler=function(){var current_user_id=""+Cookies.get("loggedUserID");if(!AnalysisList.isOwner($scope.model,current_user_id)&&current_user_id!=="admin"){console.error((new Date).toLocaleString()+" EDITION REQUEST DENIED. Error message: User "+current_user_id+" has not Edition privileges over the Analysis "+$scope.model.analysis_id);$dialogs.showErrorDialog("Your user is not allowed to edit this analysis");return}console.info((new Date).toLocaleString()+"SENDING EDIT REQUEST FOR Analysis "+$scope.model.analysis_id+" TO SERVER");this.send_lock_analysis("edition");return this};this.acceptButtonHandler=function(){if(!$scope.analysisForm.$valid){$dialogs.showErrorDialog("Invalid form, please check the form and fill the empty fields.");return false}this.closeAllDetailsViews();$scope.setTaskQueue(this.clean_task_queue($scope.getTaskQueue()));this.execute_tasks(true);return this};this.cancelButtonHandler=function(){$scope.clearTaskQueue();AnalysisList.setNewAnalysis(null);if($scope.viewMode==="view"){$state.go("analysis")}else if($scope.viewMode==="edition"){this.closeAllDetailsViews();this.send_unlock_analysis()}else{$state.go("analysis")}};this.updateMainDiagramHandler=function(){if($scope.diagram){setTimeout(function(){$scope.diagram.hasChanged--;$scope.$digest()},500)}};this.exportAnalysisHandler=function(format){var config=$rootScope.getHttpRequestConfig("GET","analysis-rest",{extra:"export/"+"?analysis_id="+$scope.model.analysis_id+"&format="+format});var a=document.createElement("a");a.href=config.url;a.target="_blank";a.click();return this};this.name="AnalysisDetailController";var me=this;if(!Cookies.get("currentExperimentID")){$dialogs.showInfoDialog('Please, choose first an study at the "Browse studies" section.');$state.go("experiments");return}if(!$scope.isModal){$scope.loadingComplete=false;$scope.model={};$scope.setViewMode($stateParams.viewMode||"view");$scope.getFormTemplate("analysis-form");if($stateParams.analysis_id!==null){AnalysisList.setNewAnalysis(null);this.retrieveAnalysisDetails($stateParams.analysis_id)}else if($stateParams.analysis_id===null&&$scope.viewMode==="view"){$state.go("analysis")}else{$scope.model.analysis_id="ANxxxx";$scope.model.analysis_name="Unnamed analysis";$scope.model.submission_date=new Date;$scope.model.last_edition_date=new Date;$scope.model.analysis_owners=[{user_id:Cookies.get("loggedUserID")}];$scope.model.tags=[];$scope.model.non_processed_data=[];$scope.model.processed_data=[];$scope.model.nextStepID=1;AnalysisList.setNewAnalysis($scope.model)}}});app.controller("StepDetailController",function($state,$rootScope,$scope,$http,$uibModal,$dialogs,APP_EVENTS,AnalysisList,SampleList,TemplateList){this.removableModel=function(){return $scope.viewMode!=="view"&&($scope.model.status===undefined||$scope.model.status.indexOf("deleted")===-1)};this.unremovableModel=function(){return $scope.viewMode!=="view"&&($scope.model.status!==undefined&&$scope.model.status.indexOf("deleted")!==-1)};this.showStepDetailsHandler=function(){var controller=$scope.getParentController("AnalysisDetailController");if(controller!==null){controller.showStepDetails($scope.model)}};this.changeInputFilesHandler=function(propertyName){$scope.isDialog=true;$scope.propertyName=propertyName||"used_data";$scope.browseDialog=$uibModal.open({templateUrl:"app/analysis/analysis-step-selector.tpl.html",size:"lg",controller:"StepDetailController",controllerAs:"controller",scope:$scope});return this};this.addSelectedInputFileHandler=function(added_step_id,doDigest){var propertyName=$scope.propertyName||"used_data";var pos=$scope.model[propertyName].indexOf(added_step_id);var isLoop=AnalysisList.checkLoop(added_step_id,$scope.model.step_id,propertyName);if(!isLoop&&pos===-1){$scope.model[propertyName].push(added_step_id);if(doDigest===true){$scope.$digest()}}else{console.log("Loop detected, ignoring...")}return true};this.removeSelectedInputFileHandler=function(removed_step_id,doDigest){var propertyName=$scope.propertyName||"used_data";var pos=$scope.model[propertyName].indexOf(removed_step_id);if(pos!==-1){$scope.model[propertyName].splice(pos,1);if(doDigest===true){$scope.$digest()}}return true};this.removeStepHandler=function(){AnalysisList.updateModelStatus($scope.model,"deleted");$rootScope.$broadcast(APP_EVENTS.stepChanged)};this.unremoveStepHandler=function(){AnalysisList.updateModelStatus($scope.model,"undo");$rootScope.$broadcast(APP_EVENTS.stepChanged)};this.sendStepToGalaxyHandler=function(){$scope.files_selection={source_id:"",selection:"all",files:[]};$scope.modalInstance=$uibModal.open({templateUrl:"app/analysis/send-step-dialog.tpl.html",scope:$scope,backdrop:"static",size:"lg"})};this.changeFileSelection=function(file){var pos=$scope.files_selection.files.indexOf(file);if(pos!==-1){$scope.files_selection.files.splice(pos,1)}else{$scope.files_selection.files.push(file)}};$scope.filterValidTools=function(item){return item.type==="galaxy_server"||item.type==="other"};this.closeSendStepDialogHandler=function(option){if(option==="send"){$scope.setLoading(true);if($scope.files_selection.selection==="all"){$scope.files_selection.files=$scope.model.files_location}if($scope.files_selection.username!==undefined&&$scope.files_selection.username!==""){$scope.files_selection.username=btoa($scope.files_selection.username+":"+$scope.files_selection.pass)}if($scope.remember){}$http($rootScope.getHttpRequestConfig("POST","file-rest",{headers:{"Content-Type":"application/json; charset=utf-8"},data:{source_id:$scope.files_selection.source_id,credentials:$scope.files_selection.username,apikey:$scope.files_selection.apikey,files:$scope.files_selection.files},extra:"send"})).then(function successCallback(response){$scope.setLoading(false);if(response.data.errors===""){$dialogs.showSuccessDialog("The selected files were successfully sent.");$scope.modalInstance.close();delete $scope.modalInstance;delete $scope.files_selection}else{$dialogs.showWarningDialog("Some errors were found while sending the selected files: "+response.data.errors)}},function errorCallback(response){$scope.setLoading(false);var message="Failed while sending the files.";$dialogs.showErrorDialog(message,{logMessage:message+" at AnalysisDetailController:closeSendStepDialogHandler."});console.error(response.data);debugger})}else{$scope.modalInstance.close();delete $scope.modalInstance;delete $scope.files_selection}};this.downloadStepFilesHandler=function(step){alert("Not implemented!!")};this.exportStepHandler=function(step,format){alert("Not implemented!!")};$scope.$watch("model",function(newValues,oldValues){var hasChanged=AnalysisList.hasChangedStep(newValues,oldValues);if(hasChanged){AnalysisList.updateModelStatus($scope.model,"edited");$rootScope.$broadcast(APP_EVENTS.stepChanged);return true}return false},true);this.name="StepDetailController";var me=this;var current_user_id=""+Cookies.get("loggedUserID");if(!AnalysisList.isStepOwner($scope.model,current_user_id)&&current_user_id!=="admin"){$scope.viewMode="view"}$scope.getFormTemplate($scope.model.type+"-form");if($scope.summary!==true){var secondTemplate="";if($scope.model&&$scope.model.type==="rawdata"){secondTemplate=$scope.model.type+"/"+$scope.model.raw_data_type+"-form"}else if($scope.model&&$scope.model.type==="intermediate_data"){secondTemplate=$scope.model.type+"/"+$scope.model.intermediate_data_type+"-form";secondTemplate=secondTemplate.split("/");secondTemplate=secondTemplate[0]+"/"+secondTemplate[1][0].toUpperCase()+secondTemplate[1].substr(1);secondTemplate=secondTemplate.replace("_step","")}else if($scope.model&&$scope.model.type==="processed_data"){secondTemplate=$scope.model.type+"/"+$scope.model.processed_data_type+"-form";secondTemplate=secondTemplate.split("/");secondTemplate=secondTemplate[0]+"/"+secondTemplate[1][0].toUpperCase()+secondTemplate[1].substr(1);secondTemplate=secondTemplate.replace("_step","")}$scope.getFormTemplate(secondTemplate,"subtemplate")}})})();