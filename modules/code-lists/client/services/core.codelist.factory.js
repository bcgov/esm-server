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

		var isActive = function(list, value) {
			var item = _.find(list, function(o) { return o.value === value; });
			return item ? item.active : false;
		};

		var getDisplay = function(list, value) {
			var item = _.find(list, function(o) { return o.value === value; });
			return item ? item.display : '';
		};

		var getListItems = function(data, name) {
			var list = _.find(data, function(l) { return name.toLowerCase() === l.name.toLowerCase(); });
			if (list) {
				var items = list.items || [];
				return _.sortByOrder(items, ['active', 'displayPriority', 'display'], ['desc', 'desc', 'asc']);
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
		};

		// refresh all the lists, parse and sort the data...
		//
		var refresh = function() {
			return new Promise(function(resolve, reject) {
				$http.get('api/codelists?date=' + new Date().getTime())
					.then(function(response) {
						parseLists(response.data);
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

		// initialize the lists from the start up data...
		//
		parseLists(InitDataCodeLists);

		return {
			// management functions
			refresh: refresh,
			salutations: {
				all: salutations,
				active: _.filter(salutations, function(o) { return o.active === true; }),
				display: function(value) { return getDisplay(salutations, value); },
				isActive: function(value) { return isActive(salutations, value); },
				fetch: function() { return fetch('salutations'); },
				update: update
			},
			organizationTypes: {
				all: organizationTypes,
				active: _.filter(organizationTypes, function(o) { return o.active === true; }),
				display: function(value) { return getDisplay(organizationTypes, value); },
				isActive: function(value) { return isActive(organizationTypes, value); },
				fetch: function() { return fetch('organizationTypes'); },
				update: update
			},
			organizationRegisteredIns: {
				all: organizationRegisteredIns,
				active: _.filter(organizationRegisteredIns, function(o) { return o.active === true; }),
				display: function(value) { return getDisplay(organizationRegisteredIns, value); },
				isActive: function(value) { return isActive(organizationRegisteredIns, value); },
				fetch: function() { return fetch('organizationRegisteredIns'); },
				update: update
			},
			emailTemplateGroups: {
				all: emailTemplateGroups,
				active: _.filter(emailTemplateGroups, function(o) { return o.active === true; }),
				display: function(value) { return getDisplay(emailTemplateGroups, value); },
				isActive: function(value) { return isActive(emailTemplateGroups, value); },
				fetch: function() { return fetch('emailTemplateGroups'); },
				update: update
			},
			documentTypes: {
				all: documentTypes,
				active: _.filter(documentTypes, function(o) { return o.active === true; }),
				display: function(value) { return getDisplay(documentTypes, value); },
				isActive: function(value) { return isActive(documentTypes, value); },
				fetch: function() { return fetch('documentTypes'); },
				update: update
			},
			projectGroupTypes: {
				all: projectGroupTypes,
				active: _.filter(projectGroupTypes, function(o) { return o.active === true; }),
				display: function(value) { return getDisplay(projectGroupTypes, value); },
				isActive: function(value) { return isActive(projectGroupTypes, value); },
				fetch: function() { return fetch('projectGroupTypes'); },
				update: update
			},
			inspectionReportFollowUpTypes: {
				all: inspectionReportFollowUpTypes,
				active: _.filter(inspectionReportFollowUpTypes, function(o) { return o.active === true; }),
				display: function(value) { return getDisplay(inspectionReportFollowUpTypes, value); },
				isActive: function(value) { return isActive(inspectionReportFollowUpTypes, value); },
				fetch: function() { return fetch('inspectionReportFollowUpTypes'); },
				update: update
			}
		};

	}])
;
