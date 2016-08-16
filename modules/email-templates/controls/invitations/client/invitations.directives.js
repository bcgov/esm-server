'use strict';

angular.module('control')
	.directive('tmplInvitations',  directiveProcessInvitations)
    .directive('emailTemplateChooser', directiveEmailTemplateChooser)
	.directive('addNewRecipient', directiveAddNewRecipient);
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
                    size: 'lg',
                    resolve: {
                        items: function (EmailTemplateModel) {
                            return EmailTemplateModel.all ();
                        }
                    },
					controller: function ($scope, $modalInstance, items) {
						var s = this;

						var isArray = _.isArray(scope.current);

						s.items = items;
						s.selected = scope.current;
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
								var existingItem = _.find(s.items, function(o) { return o._id === id; });
								if (!_.isEmpty(existingItem)) {
									if (isArray) {
										s.selected.push(existingItem);
									} else {
										s.selected = [existingItem];
									}
								}
							}
						};

						s.cancel = function () { $modalInstance.dismiss ('cancel'); };

						s.ok = function () {
							$modalInstance.close (s.selected);
						};

						// if current, then we need to select
						if (scope.current) {
							if (isArray) {
								_.forEach(scope.current, function(o) {
									s.select(o._id);
								});
							} else {
								s.select(scope.current._id);
							}
						}
					}
				}).result.then (function (data) {
					if (_.isArray(scope.current)) {
						scope.current = data;
					} else {
						scope.current = data[0];
					}
				})
					.catch (function (err) {});
			});
        }
    };
}


directiveAddNewRecipient.$inject = ['$modal', '_'];
/* @ngInject */
function directiveAddNewRecipient($modal, _) {
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
					templateUrl: 'modules/email-templates/client/views/add-new-recipient-modal.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
					},
					controller: function ($scope, $modalInstance) {
						var s = this;
						s.name = undefined;
						s.email = undefined;

						s.cancel = function () { $modalInstance.dismiss ('cancel'); };

						s.submit = function (isValid) {
							if (!isValid) {
								$scope.$broadcast('show-errors-check-validity', 'newRecipientForm');
								return false;
							}
							$modalInstance.close ({name: s.name, email: s.email});
						};
					}
				}).result.then (function (data) {
					scope.current = data;
				})
					.catch (function (err) {});
			});
		}
	};
}
