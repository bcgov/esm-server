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
    .controller('controllerModalRecipientList', controllerModalRecipientList)
    .controller('controllerModalUserContactInfo', controllerModalUserContactInfo)
    .controller('controllerModalSelectItems', controllerModalSelectItems)
    .controller('controllerModalDayCalculator', controllerModalDayCalculator)
    .controller('controllerModalDatePicker', controllerModalDatePicker);





// -----------------------------------------------------------------------------------
//
// CONTROLLER: Quick Links
//
// -----------------------------------------------------------------------------------
controllerQuickLinks.$inject = ['Utils', 'Authentication'];
/* @ngInject */
function controllerQuickLinks(Utils, Authentication) {
	var qlPanel = this;

	qlPanel.auth = Authentication;

	Utils.getQuickLinks().then( function(res) {
		qlPanel.quickLinks = res.data;
	});
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Projects Recent News
//
// -----------------------------------------------------------------------------------
controllerRecentActivity.$inject = ['Utils', 'Authentication'];
/* @ngInject */
function controllerRecentActivity(Utils, Authentication) {
	var raPanel = this;
	//
	raPanel.auth = Authentication;
	//
	Utils.getRecentActivity().then( function(res) {
		raPanel.recentActivity = res.data.slice(0,4);
	});
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Panel Sort
//
// -----------------------------------------------------------------------------------
controllerPanelSort.$inject = ['$scope', '$filter'];
/* @ngInject */
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
/* @ngInject */
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
/* @ngInject */
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
/* @ngInject */
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
			templateUrl: 'modules/utils/client/views/partials/modal-users-select.html',
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
		modalUsersView.result.then(function (users) {
	// console.log('callback', $scope.callback, users);
		}, function () {});
	};

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Roles Select
//
// -----------------------------------------------------------------------------------
controllerModalUsersSelect.$inject = ['$scope', 'users', 'orgs', 'project', 'config', '$modalInstance', 'Utils', 'OrganizationModel', '_'];
/* @ngInject */
function controllerModalUsersSelect($scope, users, orgs, project, config, $modalInstance, Utils, OrganizationModel, _) {
	var utilUsers = this;

	$scope._ = _;

	utilUsers.form = {filtered:null};

	// collection of users.
	utilUsers.users = project.team; // all possible users
	utilUsers.selected = users || []; // selected users
	utilUsers.orgs = orgs;
	// remove a user from the selected list.
	utilUsers.removeUserFromSelected = function(user) {
		if( _.contains(utilUsers.selected, user) ) {
			// remove
			_.remove(utilUsers.selected, function(item) {
				return item === user;
			});
		}
	};

	// change the dropdown source, get the users that corresponds to the source.
	utilUsers.selectSource = function() {
		var usrc = utilUsers.form.selectedSource.split(':');
		// org selected, get the users for that org.
		if (usrc[0] === 'org') {
			OrganizationModel.getUsers (usrc[1]).then( function(data) {
				utilUsers.users = data;
				$scope.$apply();
			});
		}
	};

	// add the user to the selected list
	utilUsers.addUserToSelected = function(user) {
		if(!_.includes(utilUsers.selected, user)) {
			utilUsers.selected.push(user);
		}
	};

	utilUsers.config = config || {allowChoice: false, allowTeam:true, viaEmail:true};

	// default to add if there's no team to select.
	if (!utilUsers.config.allowTeam) {
		utilUsers.form.filteredUsers = 'add';
	}

	// new contact
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
// CONTROLLER: Modal Day Calculator
//
// -----------------------------------------------------------------------------------
controllerModalDayCalculator.$inject = ['$scope', '$modalInstance', 'moment', '$modal'];
/* @ngInject */
function controllerModalDayCalculator($scope, $modalInstance, moment, $modal) {
	var dayCalculator = this;

	dayCalculator.startDate = "";
	dayCalculator.endDate = "";
	dayCalculator.numDays = 0;

	dayCalculator.startDateAlert = "";
	dayCalculator.endDateAlert = "";

	dayCalculator.suspendDate = "";
	dayCalculator.resumeDate = "";

	dayCalculator.suspendDateAlert = "";
	dayCalculator.resumeDateAlert = "";

	dayCalculator.errorAlert = "";

	dayCalculator.showRules = false;

	var types = [
		{ displayName: "Day Zero",   value: "dayZero"   },
		{ displayName: "Regular",    value: "regular"   },
		{ displayName: "Suspension", value: "suspended" },
	];
	dayCalculator.types = types;
	dayCalculator.type = types[0];

	var isNonBCBusinessDay = function(date) {
		// No date is acceptible
		if (!date) return "";

		// Valid date?
		date = moment(date);
		if (!date.isValid()) return "Invalid date";

		// Weekend?
		var day = date.day();
		if (day === 0) return "Sunday";
		if (day === 6) return "Saturday";

		// Holiday?
		var month = date.month() + 1;
		var monthDay = date.date();
		var isMonday = day === 1;

		// New Year's Day
		if (month === 1 && monthDay === 1) return "New Year's Day";

		// Family Day: Second Monday of February
		if (month === 2 && isMonday && monthDay > 7 && monthDay < 15) return "Family Day";

		// Good Friday: Hard-coded.
		var year = date.year();
		if ((year === 2017 && month === 4 && monthDay === 14) ||
		    (year === 2018 && month === 3 && monthDay === 30) ||
		    (year === 2019 && month === 4 && monthDay === 19) ||
		    (year === 2020 && month === 4 && monthDay === 10) ||
		    (year === 2021 && month === 4 && monthDay === 2 ) ||
		    (year === 2022 && month === 4 && monthDay === 15) ||
		    (year === 2023 && month === 4 && monthDay === 7 ) ||
		    (year === 2024 && month === 3 && monthDay === 29) ||
		    (year === 2025 && month === 4 && monthDay === 18) ||
		    (year === 2026 && month === 4 && monthDay === 3 ) ||
		    (year === 2027 && month === 3 && monthDay === 26)) return "Good Friday";

		// Easter Monday: Hard-coded.
		if ((year === 2017 && month === 4 && monthDay === 17) ||
		    (year === 2018 && month === 4 && monthDay === 2 ) ||
		    (year === 2019 && month === 4 && monthDay === 22) ||
		    (year === 2020 && month === 4 && monthDay === 13) ||
		    (year === 2021 && month === 4 && monthDay === 5 ) ||
		    (year === 2022 && month === 4 && monthDay === 18) ||
		    (year === 2023 && month === 4 && monthDay === 10) ||
		    (year === 2024 && month === 4 && monthDay === 1 ) ||
		    (year === 2025 && month === 4 && monthDay === 21) ||
		    (year === 2026 && month === 4 && monthDay === 6 ) ||
		    (year === 2027 && month === 3 && monthDay === 29)) return "Easter Monday";

		// Victoria Day: Penultimate Monday of May
		if (month === 5 && isMonday && monthDay > 17 && monthDay < 25) return "Victoria Day";

		// Canada Day: will fall on the 2nd if the 1st is a Sunday
		if ((month === 7 && monthDay === 1) || (month === 7 && monthDay === 2 && isMonday)) return "Canada Day";

		// B.C. Day: First Monday of August
		if (month === 8 && isMonday && monthDay < 8) return "B.C. Day";

		// Labour Day: First Monday of September
		if (month === 9 && isMonday && monthDay < 8) return "Labour Day";

		// Thanksgiving Day: Second Monday of October
		if (month === 10 && isMonday && monthDay > 7 && monthDay < 15) return "Thanksgiving Day";

		// Remembrance Day
		if (month === 11 && monthDay === 11) return "Remembrance Day";

		// Christmas Day
		if (month === 12 && monthDay === 25) return "Christmas Day";

		// Boxing Day
		if (month === 12 && monthDay === 26) return "Boxing Day";

		// Otherwise
		return "";
	};

	var getDateAlert = function(date) {
		var alert = isNonBCBusinessDay(date);
		if (alert) {
			// TODO: Use alert text for better description.
			return "Non-BC Business Day";
		}
		return "";
	};

	// Update alert text when a date changes

	$scope.$watch('dayCalculator.startDate', function(newDate) {
		dayCalculator.startDateAlert = getDateAlert(newDate);
	});

	$scope.$watch('dayCalculator.endDate', function(newDate) {
		dayCalculator.endDateAlert = getDateAlert(newDate);
	});

	$scope.$watch('dayCalculator.suspendDate', function(newDate) {
		dayCalculator.suspendDateAlert = getDateAlert(newDate);
	});

	$scope.$watch('dayCalculator.resumeDate', function(newDate) {
		dayCalculator.resumeDateAlert = getDateAlert(newDate);
	});

	dayCalculator.ok = function() { $modalInstance.dismiss('cancel'); };

	dayCalculator.reset = function() {
		dayCalculator.startDate = "";
		dayCalculator.endDate = "";
		dayCalculator.numDays = 0;
		dayCalculator.startDateAlert = "";
		dayCalculator.endDateAlert = "";
		dayCalculator.suspendDate = "";
		dayCalculator.resumeDate = "";
		dayCalculator.suspendDateAlert = "";
		dayCalculator.resumeDateAlert = "";
		dayCalculator.errorAlert = "";
		dayCalculator.showRules = false;
		dayCalculator.type = types[0];
	};

	dayCalculator.toggleRules = function() {
		dayCalculator.showRules = !dayCalculator.showRules;
	};

	dayCalculator.go = function() {
		var regular = dayCalculator.type.value === "regular";
		var suspended = dayCalculator.type.value === "suspended";
		var numDays;

		dayCalculator.errorAlert = "";

		if (suspended && dayCalculator.suspendDate && dayCalculator.resumeDate && dayCalculator.suspendDate >= dayCalculator.resumeDate) {
			// Show error if resume date is later than suspend date
			dayCalculator.errorAlert = "The suspension date must come before the resumption date.";
			return;
		}

		// Given two of Start Date, End Date, and Number of Days, calculate the third field.

		if (dayCalculator.startDate && dayCalculator.endDate) {
			if (dayCalculator.startDate >= dayCalculator.endDate) {
				// Show error if start date is later than end date
				dayCalculator.errorAlert = "The start date must come before the end date.";
				return;
			}

			// Include the start date in the calculation.
			dayCalculator.numDays = regular ? 1 : 0;

			// Count the number of days between start and end dates
			var date = moment(dayCalculator.startDate);

			// Look at every date between
			while (date < dayCalculator.endDate) {
				date.add(1, 'd');

				// Factor in a suspension
				if (suspended && dayCalculator.suspendDate && date >= dayCalculator.suspendDate) {
					// Stop if the suspension goes past the end date
					if (!dayCalculator.resumeDate || dayCalculator.endDate < dayCalculator.resumeDate) return;

					// Don't count days in the suspension range
					if (date < dayCalculator.resumeDate) continue;
				}

				// If we've made it this far, count the day
				dayCalculator.numDays++;
			}
		} else if (dayCalculator.startDate && dayCalculator.numDays) {
			// Find the end date from the start date and number of days
			dayCalculator.endDate = moment(dayCalculator.startDate);

			// Include the start date in the calculation.
			numDays = regular ? 1 : 0;

			// Start counting the days
			while (numDays < dayCalculator.numDays) {
				dayCalculator.endDate.add(1, 'd');

				// Factor in a suspension
				if (suspended && dayCalculator.suspendDate && dayCalculator.endDate >= dayCalculator.suspendDate) {
					if (!dayCalculator.resumeDate) {
						// Can't find an end date if there is no resume date
						dayCalculator.endDate = "";
						return;
					}

					// Don't count days in the suspension range
					if (dayCalculator.endDate < dayCalculator.resumeDate) continue;
				}

				// If we've made it this far, count the day
				numDays++;
			}
		} else if (dayCalculator.endDate && dayCalculator.numDays) {
			// Find the start date from the end date and number of days
			dayCalculator.startDate = moment(dayCalculator.endDate);

			// Include the start date in the calculation.
			numDays = regular ? 1 : 0;

			// Start counting back the days
			while (numDays < dayCalculator.numDays) {
				dayCalculator.startDate.subtract(1, 'd');

				// Factor in a suspension
				if (suspended && dayCalculator.suspendDate && dayCalculator.startDate >= dayCalculator.suspendDate) {
					if (!dayCalculator.resumeDate) {
						// Can't find a start date if there is no resume date
						dayCalculator.startDate = "";
						return;
					}

					// Don't count days in the suspension range
					if (dayCalculator.startDate < dayCalculator.resumeDate) continue;
				}

				// If we've made it this far, count the day
				numDays++;
			}
		}
	};
}

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Requirement Completion Calculation
// provide Project and list of requirements, response is reqCheckList.reqs with a list of requirements completed
//
// -----------------------------------------------------------------------------------
controllerRequirementCalculation.$inject = ['$scope', '_'];
/* @ngInject */
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
controllerModalRecipientList.$inject = ['$modalInstance', 'rUsers', '_'];
/* @ngInject */
function controllerModalRecipientList($modalInstance, rUsers, _) {
	var utilRecipientList = this;

	// put all the users into a string and display in a textarea
	utilRecipientList.users='';

	_.each(rUsers, function(user, idx) {
		utilRecipientList.users += '"' + user.displayName + '","' + user.address1 + ' ' + user.address2 + '","' + user.city + '","' + user.province.toUpperCase() + '","' + user.postalCode + '"\n';
	});

	utilRecipientList.cancel = function () { $modalInstance.dismiss('cancel'); };
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: Show a list of user records and allow them to be copied
//
// -----------------------------------------------------------------------------------
controllerModalUserContactInfo.$inject = ['$modalInstance', 'user'];
/* @ngInject */
function controllerModalUserContactInfo($modalInstance, user) {
	var utilUserContactInfo = this;

	utilUserContactInfo.user = user;

	utilUserContactInfo.cancel = function () { $modalInstance.dismiss('cancel'); };
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Select Items
//
// -----------------------------------------------------------------------------------
controllerModalSelectItems.$inject = ['$modalInstance', 'rAllItems', 'rSelectedItems', 'rItemName', 'rSingle', 'rUnique', '_'];
/* @ngInject */
function controllerModalSelectItems($modalInstance, rAllItems, rSelectedItems, rItemName, rSingle, rUnique, _) {
	var selectItems = this;

	// constrain selection to just one.  Directive needs to have x-single=true
	selectItems.modeSingle = rSingle;

	//
	//
	//
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

	//
	//
	// remove an item from the temporary list.
	selectItems.removeItemFromSelection = function(idx) {
		selectItems.selectedItems.splice(idx, 1);
		selectItems.refreshSource();
	};

	//
	//
	// add the item to the project
	selectItems.addItemToSelection = function(item) {
		if (selectItems.modeSingle) {
			selectItems.selectedItems = [item];
		} else {
			selectItems.selectedItems.push(item);
		}
		selectItems.refreshSource();
	};
	//
	//
	// set local var to passed project
	selectItems.itemName = rItemName;
	//
	//
	// copy the original values so we can cancel the changes and revert back.
	if (!rSelectedItems) {
		selectItems.selectedItems = [];
	} else {
		selectItems.selectedItems = angular.copy(rSelectedItems);
	}
	//
	//
	//
	selectItems.itemList = rAllItems || [];
	selectItems.refreshSource();

	//
	//
	//
	selectItems.selectAll = function () {
		selectItems.selectedItems = rAllItems;
		selectItems.refreshSource();
	};

	//
	//
	//
	selectItems.deselectAll = function () {
		selectItems.selectedItems = [];
		selectItems.refreshSource();
	};


	//
	//
	//
	selectItems.cancel = function () {
		// since we took a copy of the rSelectedItems, no need to overwrite originals, just cancel it.
		//selectItems.selectedItems = angular.copy(rSelectedItems);
		$modalInstance.dismiss('cancel');
	};
	//
	//
	//
	selectItems.ok = function () {
		// saving so pass back new data and a reference to the destination
		$modalInstance.close(selectItems.selectedItems, rSelectedItems);
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: Add Anon Comment
//
// -----------------------------------------------------------------------------------
controllerModalDatePicker.$inject = ['$modalInstance', 'rChosenDate', 'rHeader', 'moment', 'mindate', 'maxdate', 'showTime'];
/* @ngInject */
function controllerModalDatePicker($modalInstance, rChosenDate, rHeader, moment, mindate, maxdate, showTime) {
	var modalDatePick = this;

	modalDatePick.chosenDate = rChosenDate || moment().set({'hour':9, 'minute':0, 'second': 0, 'millisecond': 0});
	modalDatePick.header = rHeader || '';
	modalDatePick.showSelector = true;
	// directive: shows time section by default
	modalDatePick.showTime = showTime;

	modalDatePick.toggleMin = function() {
 		modalDatePick.minDate = mindate;  //if start date is selected
  	};
	modalDatePick.toggleMax = function() {
		modalDatePick.maxDate = maxdate;  //if end date is selected
	};

	if (maxdate !== null) {
		modalDatePick.toggleMax();
	}
	if (mindate !== null) {
		modalDatePick.toggleMin();
	}

	modalDatePick.onTimeSet = function() {
		modalDatePick.showSelector = false;
	};

	modalDatePick.enableSelector = function() {
		modalDatePick.showSelector = true;
	};

	modalDatePick.ok = function () { $modalInstance.close(modalDatePick.chosenDate); };
	modalDatePick.cancel = function () { $modalInstance.dismiss('cancel'); };
	modalDatePick.none = function() { modalDatePick.chosenDate = undefined; };
}
