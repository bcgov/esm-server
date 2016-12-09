'use strict';

angular.module('core').factory('ContextService', ['$interval', '$log', '$http', '$cookies', '$window', '_', 'Authentication', 'Application', 'AccessModel', function($interval, $log, $http, $cookies, $window, _, Authentication, Application, AccessModel) {

	return {
		isSynced: isSynced,
		sync: sync,
		isAllowed: isAllowed
	};

	function getToContext(state, params) {
		//$log.debug('> getToContext(state = ' + state.name + ')');
		var toContext;
		if (state.name.substr (0, 2) === 'p.' || state.name === 'p') {
			//$log.debug('params.projectid = ', params.projectid);
			toContext = params.projectid;
		} else if (state.context) {
			//$log.debug('state.context = ', state.context);
			var c = (_.isFunction (state.context)) ? state.context () : state.context;
			//$log.debug('params[c] = ', params[c]);
			toContext = params[c];
		}
		//$log.debug('< getToContext(state = ' + state.name + ') = ', (toContext || 'application'));
		return toContext || 'application';
	}

	function isSynced(state, params) {
		var toContext = getToContext(state, params);
		var contextMatch = $cookies.get('context') === toContext;

		var currentUserId = Authentication.user ? Authentication.user._id : 0;
		var userMatch = $window.application.user === currentUserId;

		var result = contextMatch && userMatch;
		//$log.debug('ContextService.contextMatch ($cookies.get('context')=' + $cookies.get('context')+', context=' + toContext + ') = ', contextMatch);
		//$log.debug('ContextService.userMatch ($window.application.user=' + $window.application.user+', currentUserId=' + currentUserId + ') = ', userMatch);
		//$log.debug('ContextService.isSynced () = ', result);
		return result;
	}

	function sync(state, params) {
		//console.log('> ContextService.sync(state = ' + state.name + ')');
		// need to set the cookies.get('context'), it gets used on the server side...
		$window.sessionStorage.removeItem('userRoles');
		$cookies.put('context', getToContext(state, params));
		var currentUserId = Authentication.user ? Authentication.user._id : 0;
		return Application.reload(currentUserId, true)
			.then(function(ok) {
				//$log.debug('Application.reload(currentUserId, true) = ', JSON.stringify(ok));
				return AccessModel.resetSessionContext();
			}, function(bad) {
				$log.error('Error in ContextService reloading the application: ', JSON.stringify(bad));
			})
			.then(function(opts) {
				// return value from session context...
				//$log.debug('AccessModel.resetSessionContext() = ', JSON.stringify(opts));
				$window.sessionStorage.setItem('userRoles', opts.userRoles);
				var result = isSynced(state, params);
				//$log.debug('< ContextService.sync done = ', result);
				return result;
			}, function(bad) {
				$log.error('Error in ContextService resetting the context: ', JSON.stringify(bad));
				var result = isSynced(state, params);
				//$log.debug('< ContextService.sync done = ', result);
				return result;
			});
	}

	function isAllowed(data)  {
		if (!data) {
			return true;
		}

		var roleSpecified = (data.roles && _.size(data.roles) > 0);
		var permissionSpecified = (data.permissions && _.size(data.permissions) > 0);

		if (roleSpecified || permissionSpecified) {
			var hasRole = !roleSpecified;
			var hasPermission = !permissionSpecified;

			if (roleSpecified) {
				//$log.debug('ContextService.isAllowed(roles = ' + JSON.stringify(data.roles) + ').');
				var userRoles = $window.sessionStorage.getItem('userRoles');
				var roles = userRoles ? userRoles.split(',') : [];
				//$log.debug('ContextService.isAllowed(userRoles = ' + JSON.stringify(userRoles) + ').');
				var sameRoles = _.intersection(data.roles, roles);
				hasRole = _.size(sameRoles) > 0;
				//$log.debug('ContextService.isAllowed(hasRole = ' + hasRole + ').');
			}

			if (permissionSpecified) {
				// will only apply to application/system level items...
				//$log.debug('ContextService.isAllowed(permissions = ' + JSON.stringify(data.permissions) + ').');
				var userCan = $window.application.userCan;
				var permissions = [];
				_.transform(userCan, function (result, value, key) {
					if (value) {
						permissions.push(key);
					}
				}, {});
				//$log.debug('ContextService.isAllowed(userPermissions = ' + JSON.stringify(permissions) + ').');
				var samePermissions = _.intersection(data.permissions, permissions);
				hasPermission = _.size(samePermissions) > 0;
				//$log.debug('ContextService.isAllowed(hasPermission = ' + hasPermission + ').');
			}
			var result = hasRole && hasPermission;
			//$log.debug('ContextService.isAllowed() = ', result);
			return result;
		} else {
			// no roles, no permissions, so it's all good.
			return true;
		}
	}
}]);
