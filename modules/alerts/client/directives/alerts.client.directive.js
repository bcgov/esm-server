'use strict';

angular.module('alerts')      
	.directive('modalAlertsViewer', directiveModalAlertsViewer)
	.directive('modalAlertViewer', directiveModalAlertViewer) 
	.directive('modalAlertNew', directiveModalAlertNew)
	.directive('tmplAlertList', directiveAlertList);

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Alerts viewer
//
// -----------------------------------------------------------------------------------
directiveModalAlertsViewer.$inject = ['$modal', 'Alerts'];
/* @ngInject */
function directiveModalAlertsViewer($modal, Alerts) {
	var directive = {
		restrict:'A',
		scope : {
			divider: '=',
			project: '='
		},                         
		link : function(scope, element, attrs) {

			Alerts.getAlerts().then( function(res) {
				element.html('<i class="glyphicon glyphicon-alert"></i>&nbsp;&nbsp;' + res.data.length + " alerts");
				if( scope.divider ) {
					angular.element(element).after("&nbsp;|&nbsp;");
				}
				element.on('click', function() {
					var modalAlertsView = $modal.open({
						animation: true,
						templateUrl: 'modules/alerts/client/views/partials/modal-alerts-viewer.html',
						controller: 'controllerModalAlertsViewer',
						controllerAs: 'alertsView',
						size: 'lg',
						resolve: {
							rAlerts: function() { return res.data; },
							rProject: function() { return scope.project; }
						}
					});
					modalAlertsView.result.then(function () {}, function () {});
				});
			});
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Alert viewer
//
// -----------------------------------------------------------------------------------
directiveModalAlertViewer.$inject = ['$modal', 'Alerts'];
/* @ngInject */
function directiveModalAlertViewer($modal, Alerts) {
	var directive = {
		restrict:'A',
		scope : {
			divider: '='
		},                         
		link : function(scope, element, attrs) {

			Alerts.getAlert().then( function(res) {
				element.on('click', function() {
					var modalAlertView = $modal.open({
						animation: true,
						templateUrl: 'modules/alerts/client/views/partials/modal-alert-viewer.html',
						controller: 'controllerModalAlertViewer',
						controllerAs: 'alertView',
						size: 'md',
						resolve: {
							rAlert: function() {return res.data; }
						}
					});
					modalAlertView.result.then(function () {}, function () {});
				});
			});
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal New Alert
//
// -----------------------------------------------------------------------------------
directiveModalAlertNew.$inject = ['$modal'];
/* @ngInject */
function directiveModalAlertNew($modal) {
	var directive = {
		restrict:'A',
		scope : {
			project: '='
		},       
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalAlertNew = $modal.open({
					animation: true,
					templateUrl: 'modules/alerts/client/views/partials/modal-alert-new.html',
					controller: 'controllerModalAlertNew',
					controllerAs: 'alertNew',
					size: 'md',
					resolve: {
						rProject: function() { return scope.project; }
					}
				});
				modalAlertNew.result.then(function () {}, function () {});
			});
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Alert List
//
// -----------------------------------------------------------------------------------
directiveAlertList.$inject = ['$modal', 'Alerts'];
/* @ngInject */
function directiveAlertList($modal, Alerts) {
	var directive = {
		restrict:'E',
		templateUrl: 'modules/alerts/client/views/partials/alert-list.html',
		controller: 'controllerAlertList',
		controllerAs: 'alertList',
		scope : {
			project: '='
		}
	};
	return directive;
}
