'use strict';

angular.module('control')
	.directive('tmplInvitations',  directiveProcessInvitations)
    .directive('emailTemplateChooser', directiveEmailTemplateChooser);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveProcessInvitations.$inject = [];
/* @ngInject */
function directiveProcessInvitations() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/email-templates/controls/invitations/client/invitations.html',
        controller: 'controllerProcessInvitations',
        controllerAs: 'taskInvitations',
        scope: {
        	anchor: '@',
          project: '='
        }
    };
    return directive;
}

directiveEmailTemplateChooser.$inject = ['EmailTemplateModel', '$modal', '_'];
/* @ngInject */
function directiveEmailTemplateChooser(EmailTemplateModel, $modal, _) {
    return {
        restrict: 'A',
        scope: {
            project: '=',
			current: '='
        },
        link : function(scope, element, attrs) {
            element.on('click', function () {
                $modal.open ({
                    animation: true,
                    templateUrl: 'modules/email-templates/client/views/email-template-chooser.html',
                    controllerAs: 's',
                    size: 'md',
                    windowClass: 'vc-chooser-view',
                    resolve: {
                        templates: function (EmailTemplateModel) {
                            return EmailTemplateModel.all ();
                        }
                    },
                    controller: function ($scope, $modalInstance, templates) {
                        var s = this;

						s.templates = templates;
                        s.selected = [];

						s.isSelected = function(id) {
							var item =  _.find(s.selected, function(o) { return o._id === id; });
							return !_.isEmpty(item);
						};

						s.select = function(id) {
							var item =  _.find(s.selected, function(o) { return o._id === id; });
							if (item) {
								_.remove(s.selected, function(o) { return o._id === id; });
							} else {
								s.selected = [_.find(s.templates, function(o) { return o._id === id; })];
							}
						};

                        s.cancel = function () { $modalInstance.dismiss ('cancel'); };

                        s.ok = function () {
                            $modalInstance.close (s.selected);
                        };

						// if current, then we need to select
						if (scope.current && scope.current._id) {
							s.select(scope.current._id);
						}

					}
                }).result.then (function (data) {
                	scope.current = data[0];
                 	console.log('Email Template Chooser.selected = ', JSON.stringify(scope.current, 4, null));
                }).catch (function (err) { });
            });
        }
    };
}
