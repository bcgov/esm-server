'use strict';

angular.module('core')
	.filter('shouldDisplayPanel', filterShouldDisplayPanel);
// -----------------------------------------------------------------------------------
//
// Filter: Display Panel
// return true or false if the panel is valid for the context, project supplied
//
// -----------------------------------------------------------------------------------
filterShouldDisplayPanel.$inject = ['Authentication', '_'];
/* @ngInject */
function filterShouldDisplayPanel(Authentication, _) {

	var vis = {
		"project":{
			"admin":{
				"Initiated":["initiated", "documents",  "map"],
				"Submitted":["tombstone", "stream", "edit",  "map","documents", "doc-approvals"],
				"In Progress":["tombstone", "map", "edit", "activities", "documents", "doc-approvals"]
			},
			"eao":{
				"Initiated":["initiated",  "map","documents"],
				"Submitted":["tombstone", "stream", "edit",  "map","documents", "doc-approvals"],
				"In Progress":["tombstone", "map", "edit", "activities", "documents", "doc-approvals"]
			},
			"guest":{
				"Initiated":[],
				"Submitted":[],
				"In Progress":["tombstone", "map", "public-comments", "documents"]
			}
		}
	};

	return function(context, panel, key) {
		var panels = [];
		var roles = [];

		// no authenticated user so just show guest access.
		if (!Authentication.user.roles) {
			roles = ['guest'];
		} else {
			roles = Authentication.user.roles;
		}

		if (!vis[context]) {
			return false;
		}

		// if everything is there, see if this user is allowed to see the context.
		if (context && panel && key) {
			_.each(roles, function(role) {
				if (vis[context][role]) {
					if (vis[context][role][key]) {
						panels = _.union(panels, vis[context][role][key]);
					}
				}
			});
			return (panels.indexOf(panel) > -1);
		} else {
			return false;
		}
	};

}
