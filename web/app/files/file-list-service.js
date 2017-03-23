(function(){var app=angular.module("files.services.file-list",[]);app.factory("FileList",["$rootScope",function($rootScope){var filesTree={};var files=[];var filters=[];var old=new Date(0);return{getFilesTree:function(){return filesTree},setFilesTree:function(_filesTree){filesTree=this.extendFilesTreeData(_filesTree);files=this.getFilesFromTree(filesTree,[]);old=new Date;return this},getFilesFromTree:function(node,list){list.push(node.text);for(var i in node.nodes){this.getFilesFromTree(node.nodes[i],list)}return list},extendFilesTreeData:function(node){if(node.nodes!==undefined){node.selectable=false;node.icon="glyphicon glyphicon-folder-close";for(var i in node.nodes){this.extendFilesTreeData(node.nodes[i])}}return node},getFiles:function(){return files},setFiles:function(_files){files=_files;return this},getFile:function(file_id){for(var i in files){if(files[i]===file_id){return files[i]}}return null},getFilters:function(){return filters},setFilters:function(_filters){filters=_filters;return this},removeFilter:function(_filter){var pos=filters.indexOf(_filter);if(pos!==-1){filters.splice(pos,1)}return this},getOld:function(){return(new Date-old)/6e4}}}])})();