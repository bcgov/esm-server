'use strict';

angular.module('utils')
    .controller('controllerQuickLinks', controllerQuickLinks)
    .controller('controllerRecentActivity', controllerRecentActivity)   
    .controller('controllerPanelSort', controllerPanelSort)
    .controller('controllerModalResearchDetail', controllerModalResearchDetail)
    .controller('controllerRolesSelect', controllerRolesSelect)
    .controller('controllerUsersSelect', controllerUsersSelect)
    .controller('controllerModalUsersSelect', controllerModalUsersSelect)
    .controller('controllerRequirementCalculation', controllerRequirementCalculation)
    .controller('controllerModalUserList', controllerModalUserList)
    .controller('controllerModalUserContactInfo', controllerModalUserContactInfo)
    .controller('controllerModalSelectItems', controllerModalSelectItems)
    .controller('controllerModalDatePicker', controllerModalDatePicker);
    
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Quick Links
//
// -----------------------------------------------------------------------------------
controllerQuickLinks.$inject = ['logger', 'Utils'];
/* @ngInject */
function controllerQuickLinks(logger, Utils) {
	var qlPanel = this;
	//
	Utils.getQuickLinks().then( function(res) {
		qlPanel.quickLinks = res.data;
	});
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Projects Recent News
//
// -----------------------------------------------------------------------------------
controllerRecentActivity.$inject = ['logger', 'Utils'];
/* @ngInject */
function controllerRecentActivity(logger, Utils) {
	var raPanel = this;
	//
	Utils.getRecentActivity().then( function(res) {
		raPanel.recentActivity = res.data;
	});
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Panel Sort
//
// -----------------------------------------------------------------------------------
controllerPanelSort.$inject = ['$scope', '$filter'];
//
function controllerPanelSort($scope, $filter) { 
	var panelSort = this;
	var orderBy = $filter('orderBy');
	
	panelSort.fields = $scope.fields;
	
	panelSort.column = '';
	panelSort.direction = '-';
	panelSort.field = '';
	
	panelSort.sort = function(field) {
		if (field === panelSort.column) {
			if (panelSort.direction === '-') {
				panelSort.direction = '+';
			} else {
				panelSort.direction = '-';				
			}
// 				if (panelSort.direction === '') {
// 					panelSort.direction = '-';
// 				} else if (panelSort.direction === '-') {
// 					panelSort.direction = '+';				
// 				} else if (panelSort.direction === '+') {
// 					panelSort.direction = '';
// 				}
		} else {
			panelSort.column = field;
			panelSort.direction = '-';
		}
		if (panelSort.direction === '') {
			panelSort.field = '';
		} else {
			panelSort.field = panelSort.direction + panelSort.column;
		}
		$scope.data = orderBy($scope.data, panelSort.field, false);
	};
}	
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Project Research Detail
//
// -----------------------------------------------------------------------------------    
controllerModalResearchDetail.$inject = ['$scope', 'Utils', '$modalInstance'];
//
function controllerModalResearchDetail($scope, Utils, $modalInstance) {
	var rd = this;
	
	$scope.$watchGroup(['seed', 'term'], function(newValue) {
		if (newValue[0] && newValue[1]) {
			rd.term = newValue[1];
			// array of terms is sent to service
			Utils.getProjectResearchDetail({'seed': newValue[0], 'term': newValue[1]}).then( function(res) {
				rd.relatedData = res.data;
			});
		}
	});

	rd.cancel = function () { $modalInstance.dismiss('cancel'); };
}     
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Roles Select
//
// -----------------------------------------------------------------------------------    
controllerRolesSelect.$inject = ['$scope', 'Utils', '_'];
//
function controllerRolesSelect($scope, Utils, _) {
	var utilRolesSelect = this;

	$scope.$watch('selectedRoles', function(newValue) {
		if (newValue) {
			utilRolesSelect.access = newValue;
		}
	});

	$scope._ = _;

	// get roles
	Utils.getRoles().then( function(res) {
		utilRolesSelect.roles = res.data;
	});

	// 
	utilRolesSelect.toggleAccess = function(role) {
		if( _.contains(utilRolesSelect.access, role) ) {
			// remove
			_.remove(utilRolesSelect.access, function(item) {
				return item === role;
			});
		} else {
			utilRolesSelect.access.push(role);
		}
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Users Select
//
// -----------------------------------------------------------------------------------    
controllerUsersSelect.$inject = ['$scope', '$modal'];
//
function controllerUsersSelect($scope, $modal) {
	var utilUsersSelect = this;

	utilUsersSelect.users = [];

	$scope.$watch('selectedUsers', function(newValue) {
		utilUsersSelect.users = newValue;
	});

	$scope.$watch('project', function(newValue) {
		utilUsersSelect.project = newValue;
	});

	utilUsersSelect.userChooser = function() {
		var modalUsersView = $modal.open({
			animation: true,
			templateUrl: 'components/utils/partials/modal-users-select.html',
			controller: 'controllerModalUsersSelect',
			controllerAs: 'utilUsers',
			size: 'lg',
			resolve: {
				rUsers: function() {
					return utilUsersSelect.users;
				},
				rProject: function() {
					return utilUsersSelect.project;
				},
				rConfig: function() {
					return null; // user defaults
				}
			}
		});
		modalUsersView.result.then(function () {}, function () {});
	};

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Roles Select
//
// -----------------------------------------------------------------------------------    
controllerModalUsersSelect.$inject = ['$scope', 'rUsers', 'rProject', 'rConfig', '$modalInstance', 'Project', 'Utils', '_'];
//
function controllerModalUsersSelect($scope, rUsers, rProject, rConfig, $modalInstance, Project, Utils, _) {
	var utilUsers = this;

	$scope._ = _;

	utilUsers.form = {filtered:null};

	Utils.getRoles().then( function(res) {
		utilUsers.roles = res.data;
	});

	// collection of users.
	utilUsers.users = rProject.team; // all possible users
	utilUsers.selected = rUsers || []; // selected users

	// remove a user from the selected list.
	utilUsers.removeUserFromSelected = function(user) {
		if( _.contains(utilUsers.selected, user) ) {
			// remove
			_.remove(utilUsers.selected, function(item) {
				return item === user;
			});
		}
	};

	// add the user to the selected list
	utilUsers.addUserToSelected = function(user) {
		if(!_.includes(utilUsers.selected, user)) {
			utilUsers.selected.push(user);
		}
	};

	// setup new users
	if (!rConfig) {
		utilUsers.config = {allowChoice: false, allowTeam:true, viaEmail:true};
	} else {
		utilUsers.config = rConfig;
	}
	// default to add if there's no team to select.
	if (!utilUsers.config.allowTeam) {
		utilUsers.form.filteredUsers = 'add';
	}
	utilUsers.newUser = {};
	utilUsers.newUser.viaEmail = angular.copy(utilUsers.config.viaEmail) || false;
	utilUsers.newUser.viaMail = angular.copy(utilUsers.config.viaMail) || false;

	// add a new 
	utilUsers.addNewUser = function() {
		// TODO: validate user record.
		utilUsers.selected.push( angular.copy(utilUsers.userNew) );
		// if new user is invited to register, flag that with a token.
		// and resolve later on.
	};

	utilUsers.ok = function () { $modalInstance.close(utilUsers.selected); };
	utilUsers.cancel = function () { $modalInstance.dismiss('cancel'); };


	// utilRolesSelect.toggleAccess = function(role) {
	// 	if( _.contains(utilRolesSelect.access, role) ) {
	// 		// remove
	// 		_.remove(utilRolesSelect.access, function(item) {
	// 			return item === role;
	// 		});
	// 	} else {
	// 		utilRolesSelect.access.push(role);
	// 	}
	// };
}

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Requirement Completion Calculation
// provide Project and list of requirements, response is reqCheckList.reqs with a list of requirements completed
//
// -----------------------------------------------------------------------------------
controllerRequirementCalculation.$inject = ['$scope', '_'];
//
function controllerRequirementCalculation($scope, _) { 
	var reqChecklist = this;
	reqChecklist.reqs = [];

	var indicateRequirements = function() {
		if (reqChecklist.requiredList && reqChecklist.project) {
			_.each(reqChecklist.requiredList, function(req, idx) {
				var found = _.findWhere(reqChecklist.project.requirements, { 'code': req });
				if (found) {
					reqChecklist.reqs.push( found );
				} else {
					reqChecklist.reqs.push({'code':req, 'status':'invalid'});
				}
			});
		}
	};

	$scope.$watch('required', function(newValue) {
		reqChecklist.requiredList = newValue;
		indicateRequirements();
	});

	$scope.$watch('project', function(newValue) {
		reqChecklist.project = newValue;
		indicateRequirements();
	});

	// search through the project requirements and see if the requirements passed in by the task have been met.

}

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: Show a list of user records and allow them to be copied
//
// -----------------------------------------------------------------------------------
controllerModalUserList.$inject = ['$modalInstance', 'rUsers', '_'];
//
function controllerModalUserList($modalInstance, rUsers, _) { 
	var utilUserList = this;

	// put all the users into a string and display in a textarea
	utilUserList.users='';

	_.each(rUsers, function(user, idx) {
		utilUserList.users += '"' + user.name + '","' + user.address + '","' + user.city + '","' + user.province + '","' + user.postal + '"\n';
	});

	utilUserList.ok = function () { $modalInstance.close(); };
	utilUserList.cancel = function () { $modalInstance.dismiss('cancel'); };
}

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: Show a list of user records and allow them to be copied
//
// -----------------------------------------------------------------------------------
controllerModalUserContactInfo.$inject = ['$modalInstance', 'rUser'];
//
function controllerModalUserContactInfo($modalInstance, rUser) { 
	var utilUserContactInfo = this;

	utilUserContactInfo.user = rUser;

	utilUserContactInfo.cancel = function () { $modalInstance.dismiss('cancel'); };
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Select Items
//
// -----------------------------------------------------------------------------------
controllerModalSelectItems.$inject = ['$modalInstance', 'rAllItems', 'rSelectedItems', 'rItemName', 'rSingle', 'rUnique', '_'];
//
function controllerModalSelectItems($modalInstance, rAllItems, rSelectedItems, rItemName, rSingle, rUnique, _) { 
	var selectItems = this;

	// constrain selection to just one.  Directive needs to have x-single=true
	selectItems.modeSingle = rSingle;

	selectItems.refreshSource = function() {
		if (rUnique) {
			selectItems.itemList = [];
			_.each( rAllItems, function(obj) {
				if (!_.some(selectItems.selectedItems, _.matchesProperty('code', obj.code))) {
					selectItems.itemList.push(obj);
				}	
			});
		}
	};

	// remove an item from the temporary list.
	selectItems.removeItemFromSelection = function(idx) {
		selectItems.selectedItems.splice(idx, 1);
		selectItems.refreshSource();
	};

	// add the item to the project
	selectItems.addItemToSelection = function(item) {
		if (selectItems.modeSingle) {
			selectItems.selectedItems = [item];
		} else {
			selectItems.selectedItems.push(item);
		}
		selectItems.refreshSource();
	};

	// set local var to passed project
	selectItems.itemName = rItemName;

	// copy the original values so we can cancel the changes and revert back.
	if (!rSelectedItems) {
		selectItems.selectedItems = [];
	} else {
		selectItems.selectedItems = angular.copy(rSelectedItems);
	}

	selectItems.itemList = rAllItems || [];
	selectItems.refreshSource();


	selectItems.cancel = function () {
		selectItems.selectedItems = angular.copy(rSelectedItems);
		$modalInstance.dismiss('cancel');
	};
	selectItems.ok = function () { 
		// saving so write the new data.
		$modalInstance.close(selectItems.selectedItems);
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: Add Anon Comment
//
// -----------------------------------------------------------------------------------
controllerModalDatePicker.$inject = ['$modalInstance', 'rChosenDate'];
//
function controllerModalDatePicker($modalInstance, rChosenDate) { 
	var modalDatePick = this;
	
	modalDatePick.chosenDate = rChosenDate;
	modalDatePick.showSelector = true;

	modalDatePick.onTimeSet = function() {
		modalDatePick.showSelector = false;
	};

	modalDatePick.enableSelector = function() {
		modalDatePick.showSelector = true;
	};

	modalDatePick.ok = function () { $modalInstance.close(modalDatePick.chosenDate); };
	modalDatePick.cancel = function () { $modalInstance.dismiss('cancel'); };
}