'use strict';
// =========================================================================
//
// this is intended to be a sort of base class for all crud services in the
// client, just to avoid retyping everything over and over again
//
// =========================================================================
angular.module('core').service ('MenuControl', ['Authentication', '$state', '$http', '_', function (Authentication, $state, $http, _) {

	var buildAllowedArray = function(systemRoleCodes, projectCode, orgCode, roleCodes) {
		var allowedArray = [];
		if (systemRoleCodes) {
			var src = _.isArray(systemRoleCodes) ? systemRoleCodes : [systemRoleCodes];
			_.each(src, function (c) {
				allowedArray.push({systemRoleCode: c});
			});
		}
		if (roleCodes) {
			var rc = _.isArray(roleCodes) ? roleCodes : [roleCodes];
			_.each(rc, function (c) {

				// little twist here...
				// the roleCode may be (eao|pro):roleCode, so let's split that up
				if (_.includes(c, ':')) {
					var oc = c.split(':');
					allowedArray.push({projectCode: projectCode, orgCode: oc[0], roleCode: oc[1]});
				} else {
					allowedArray.push({projectCode: projectCode, orgCode: orgCode, roleCode: c});
				}
			});
		}
		return allowedArray;
	};

	this.userHasOne = function(roles) {
		var hasOne = false;
		_.each(roles, function (role) {
			if (Authentication.user.roles !== undefined) {
				_.each(Authentication.user.roles, function(r) {
					if (r.match(role)) {
						hasOne = true;
						return true;
					}
				});
			}
		});
		return hasOne;
	};

	this.publicAccess = function(roles) {
		var isPublic = false;
		_.each(roles, function(role) {
			if ('public'.match(role)) {
				isPublic = true;
				return true;
			}
		});
		return isPublic;
	};

	this.canAccess = function (roles) {
		var allowed = this.userHasOne(roles) || this.publicAccess(roles);
// console.log (allowed, roles);
		if (!allowed) {
			if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
				$state.go('forbidden');
			} else {
				$state.go('authentication.signin');
			}
		}
	};

	//
	// allowedArray
	//
	// systemRoleCode: string or array - set if this is a system role (admin, eao, pro, user)
	// projectCode: string - any/all/* or set to a limit to that project code
	// orgCode: string -  any/all/* or set to a specific org code: eao or pro
	// roleCode: string -  any/all/* or set to a specific role code
	//
	this.menuRoles = function (allowedArray) {
		// convert all the incoming allowed roles into Regular Expressions...

		// do not include admin by default...
		// new RegExp('^admin$', 'g')

		var roles = [];

		_.each(allowedArray, function(a) {
			if (a.systemRoleCode) {
				roles.push(new RegExp('^' + a.systemRoleCode + '$', 'gi'));
			} else {
				// if nothing is set, don't bother...
				if (a.projectCode || a.orgCode || a.roleCode) {

					var allFilters = ['any', 'all', '*'];

					var projectPattern = '[a-zA-Z0-9\-]+';
					var orgPattern = '(eao|pro)';

					// Ensure the orgPattern default limits to the orgCode as we follow through.
					if (a.orgCode !== '*') {
						// console.log("setting orgCode:",a.orgCode);
						orgPattern = a.orgCode;
					}

					var rolePattern = '[a-zA-Z0-9\-]+';

					if (a.projectCode) {
						if (!_.includes(allFilters, a.projectCode)) {
							// a specific project code was provided, so limit to it...
							projectPattern = '^(' + a.projectCode + ')';
						}
						// we've specified an project, so include the project admin roles...
						roles.push(new RegExp([projectPattern, orgPattern, 'admin$'].join(':'), 'gi'));
					}

					if (a.orgCode) {
						if (!_.includes(allFilters, a.orgCode)) {
							// a specific org was provided, so limit to it...
							orgPattern = '(' + a.orgCode + ')';
						}
						// we've specified an org, so include the project admin roles...
						roles.push(new RegExp([projectPattern, orgPattern, 'admin$'].join(':'), 'gi'));
					}

					if (a.roleCode && (!_.includes(allFilters, a.roleCode))) {
							// a specific role was provided, so limit to it...
							rolePattern = a.roleCode + '$';
					}

					roles.push(new RegExp([projectPattern, orgPattern, rolePattern].join(':'), 'gi'));
				}
			}
		});

		// console.log ('roles:', roles);
		// unigue this list because we probably have several project admin roles listed.
		return _.uniq(roles);
	};

	this.menuRolesBuilder = function(systemRoleCodes, projectCode, orgCode, roleCodes) {
		var allowedArray = buildAllowedArray(systemRoleCodes, projectCode, orgCode, roleCodes);
		var roles = this.menuRoles(allowedArray);
		return roles;
	};

	this.routeAccess = function (allowedArray) {
		var roles = this.menuRoles(allowedArray);
		this.canAccess (roles);
	};

	this.routeAccessBuilder = function (systemRoleCodes, projectCode, orgCode, roleCodes) {
		var allowedArray = buildAllowedArray(systemRoleCodes, projectCode, orgCode, roleCodes);
		this.routeAccess (allowedArray);
	};
}]);
