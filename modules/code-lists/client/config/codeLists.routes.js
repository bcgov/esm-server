(function () {

	'use strict';
// =========================================================================
//
// topic routes (under admin)
//
// =========================================================================
	angular.module('codelists').config(['$stateProvider', function ($stateProvider) {
		$stateProvider
		// -------------------------------------------------------------------------
		//
		// this is the abstract, top level view for topics.
		// we resolve topics to all sub-states
		//
		// -------------------------------------------------------------------------
			.state('admin.codelist', {
				data: {permissions: ['manageCodeLists']},
				abstract: true,
				url: '/codelists',
				template: '<ui-view></ui-view>',
				resolve: {
					codelists: function ($stateParams, CodeListModel) {
						return CodeListModel.getCollection();
					}
				}
			})
			// -------------------------------------------------------------------------
			//
			// the list state for codeLists
			//
			// -------------------------------------------------------------------------
			.state('admin.codelist.list', {
				url: '/:codelistName',
				templateUrl: 'modules/code-lists/client/views/code-list-list.html',
				controllerAs: 'vm',
				controller: function ($scope, $state, $stateParams, $modal, NgTableParams, AlertService, CodeListModel, codelists) {
					var vm = this;

					// UI selects which code list to work with. Reload the table:
					vm.changeFieldType = transition;

					vm.codelists = codelists;

					vm.codelistNames = _.pluck(vm.codelists, 'name');

					vm.codelistName = $stateParams.codelistName || 'salutations';

					vm.currentField = _.find(codelists, {name : vm.codelistName});

					vm.nonEmptyFields = _.filter(vm.currentField.items, function (o) {
						return o.value !== '';
					});

					vm.fields = _.sortByOrder(vm.nonEmptyFields, ['active', 'displayPriority', 'display'], ['desc', 'desc', 'asc']);

					// UI invokes add or edit item within current codelist
					vm.openAddEdit = function (item) {
						addEditModal($scope, $modal, vm.currentField, item, onSuccess);
					};

					vm.tableParams = new NgTableParams();
					vm.tableParams.settings({	dataset: vm.fields });

					function onSuccess(item, display, displayPriority, active) {
						var newItem = {
							value : item ? item.value : display,
							display : display,
							displayPriority: displayPriority,
							active : active
						};
						var others = !item ? vm.nonEmptyFields : _.filter(vm.nonEmptyFields, function (o) {
							return o.value !== item.value;
						});
						others.push(newItem);
						var newSorted = _.sortByOrder(others, ['active', 'displayPriority', 'display'], ['desc', 'desc', 'asc']);
						vm.currentField.items = newSorted;
						CodeListModel.save(vm.currentField)
							.then(function () {
								transition();
							})
							.catch(function (err) {
								console.error(err);
							});
					}

					function transition() {
						var name = vm.currentField.name;
						console.log("BG changeFieldType", name);
						$state.transitionTo('admin.codelist.list', {codelistName: name }, {
							reload: true, inherit: false, notify: true
						});
					}
				}
			});
	}]);

	function addEditModal($scope, $modal, currentField, item, onSuccess) {
		$modal.open({
			animation: true,
			templateUrl: 'modules/code-lists/client/views/codelist-add-edit-modal.html',
			controllerAs: 'vm',
			controller: function ($scope, $modalInstance, _) {
				var vm = this;
				vm.title = item ? "Edit" : "Add";
				vm.okText = item ? "Submit" : "Add";
				vm.name = item ? item.value : '';
				vm.display = item ? item.display : '';
				vm.displayPriority = item ? item.displayPriority : false;
				vm.active = item ? item.active : true;
				vm.editMode = !! item;
				vm.validationMessage = 'asdas';
				vm.otherItems = _.filter(currentField.items, function(o) {
					if(vm.editMode) {
						return o.value !== '' && o.value !== item.value;
					}
					return o.value !== '';
				});

				vm.cancel = function () {
					$modalInstance.dismiss('cancel');
				};

				$scope.$watch('vm.display',function(newVal, oldVal) {
					vm.validate(newVal);
				})

				vm.validate = function (newVal) {
					var existing = _.find(vm.otherItems, {value: newVal});
					vm.validationMessage = existing ? newVal + " already exists" : "";
					vm.isValid = vm.validationMessage.length === 0;
				}
				vm.ok = function () {
					onSuccess(item, vm.display, vm.displayPriority, vm.active);
					$modalInstance.close();//{resource: s.object._id, data: s.permissionRoleIndex});
				};

				// validate on the existing content
				vm.validate(vm.display);
			}
		});
	}
})();









