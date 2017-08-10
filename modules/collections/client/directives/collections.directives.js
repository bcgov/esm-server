'use strict';

angular.module('control')
	.directive('collectionChooser', directiveCollectionsChooser);

directiveCollectionsChooser.$inject = ['CollectionModel', '$modal', '_'];

function directiveCollectionsChooser(CollectionModel, $modal, _) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			docs: '=',
			current: '=',
			onOk: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/collections/client/views/collections-select.html',
					controllerAs: 's',
					size: 'lg',
					resolve: {
						collections: function(CollectionModel) {
							return CollectionModel.lookupProject(scope.project.code);
						}
					},
					controller: function($scope, $modalInstance, collections) {
						var s = this;

						s.items = collections;
						s.selected = [];

						s.multiple = _.isArray(scope.docs);

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
									s.selected.push(existingItem);
								}
							}
						};

						s.cancel = function() { $modalInstance.dismiss('cancel'); };

						s.ok = function() {
							$modalInstance.close(s.selected);
						};

						// if current, then we need to select
						if (scope.current) {
							_.forEach(scope.current, function(o) {
								s.select(o._id);
							});
						}
					}
				}).result.then(function(collections) {
					if (scope.onOk) {
						scope.onOk(collections, scope.docs);
					}
				})
				.catch (function(err) {});
			});
		}
	};
}
