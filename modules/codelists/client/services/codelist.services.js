// jshint latedef: false
'use strict';

angular.module('core')
	.factory('CodeLists', ['$rootScope', '$log', '$http', 'INIT_DATA.CODE_LISTS', '_', function($rootScope, $log, $http, InitDataCodeLists, _) {
		var lists = [];

		var salutations = [];
		var organizationTypes = [];
		var emailTemplateGroups = [];
		var organizationRegisteredIns = [];
		var documentTypes = [];
		var projectGroupTypes = [];
		var inspectionReportFollowUpTypes = [];
		var ceaaInvolvementTypes = [];

		var serviceDef = {};


		var isActive = function(list, value) {
			var item = _.find(list, function(o) { return o.value === value; });
			return item ? item.active : false;
		};

		var getDisplay = function(list, value) {
			var item = _.find(list, function(o) { return o.value === value; });
			return item ? item.display : '';
		};

		var getListItems = function (data, name) {
			var list = _.find(data, function (l) { return name.toLowerCase() === l.name.toLowerCase(); });
			if (list) {
				var items = list.items || [];
				var sortedArray = _.sortByOrder(items, ['active', 'displayPriority', 'display'], ['desc', 'desc', 'asc']);
				//move blank on top of array
				_.forEach(sortedArray, function (value, key) {
					if (value.display === "") {
						if (key > 0) {
							sortedArray.splice(key, 1);
							sortedArray.unshift(value); //add the element to start of array
						}
					}
				});
				return sortedArray;
				//return _.sortBy(items, 'order');
			}
			return [];
		};

		var parseLists = function(data) {
			lists = data;
			salutations = getListItems(lists, 'salutations');
			organizationTypes = getListItems(lists, 'organizationTypes');
			emailTemplateGroups = getListItems(lists, 'emailTemplateGroups');
			organizationRegisteredIns = getListItems(lists, 'organizationRegisteredIns');
			documentTypes = getListItems(lists, 'documentTypes');
			projectGroupTypes = getListItems(lists, 'projectGroupTypes');
			inspectionReportFollowUpTypes = getListItems(lists, 'inspectionReportFollowUpTypes');
			ceaaInvolvementTypes = getListItems(lists, 'ceaaInvolvementTypes');
		};

		// refresh all the lists, parse and sort the data...
		//
		var refresh = function() {
			return new Promise(function(resolve, reject) {
				$http.get('api/codelists?date=' + new Date().getTime())
					.then(function(response) {
						parseLists(response.data);
						refreshDefs();
						resolve(lists);
					}, function(err) {
						$log.error('codelist refresh error: ', JSON.stringify(err, null, 4));
						reject(err);
					});
			});
		};

		// get one list from the db...
		//
		var fetch = function(name) {
			return new Promise(function(resolve, reject) {
				$http.get('api/query/codelists?name=' + name)
					.then(function(response) {
						if (_.size(response.data) === 1) {
							resolve(response.data[0]);
						} else {
							$log.error(name, ' list get error: list not found');
							reject(new Error(name + ' list get error: list not found'));
						}
					}, function(err) {
						$log.error(name, ' list get error: ', JSON.stringify(err, null, 4));
						reject(err);
					});
			});

		};

		// save one list, then refresh ALL lists
		// return the saved list...
		var update = function(list) {
			return new Promise(function(resolve, reject) {
				var result = {};
				$http.put('api/codelists/' + list._id, list)
					.then(function(response) {
						$log.debug('list saved: ', JSON.stringify(response.data, null, 4));
						result = response.data;
					}, function(err) {
						$log.error('list save error: ', JSON.stringify(err, null, 4));
						reject(err);
					})
					.then(refresh)
					.then(resolve(result));
			});
		};

		var define = function (serviceDef, codename, list) {
			serviceDef[codename] = {
				all: list,
				active: _.filter(list, function(o) { return o.active === true; }),
				display: function(value) { return getDisplay(list, value); },
				isActive: function(value) { return isActive(list, value); },
				fetch: function() { return fetch(codename); },
				update: update
			};
		};

		var refreshDefs = function () {
			define(serviceDef,'salutations', salutations);
			define(serviceDef,'organizationTypes', organizationTypes);
			define(serviceDef,'organizationRegisteredIns', organizationRegisteredIns);
			define(serviceDef,'emailTemplateGroups', emailTemplateGroups);
			define(serviceDef,'documentTypes', documentTypes);
			define(serviceDef,'projectGroupTypes', projectGroupTypes);
			define(serviceDef,'inspectionReportFollowUpTypes', inspectionReportFollowUpTypes);
			define(serviceDef,'ceaaInvolvementTypes', ceaaInvolvementTypes);
		};

		// initialize the lists from the start up data...
		serviceDef.refresh = refresh;
		parseLists(InitDataCodeLists);
		refreshDefs();

		return serviceDef;

	}])
;
