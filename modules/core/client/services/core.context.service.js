'use strict';

angular.module('core').factory('ContextService', ['$interval', '$log', '$http', '$cookies', '$window', '_', 'Authentication', 'Application', 'AccessModel', function($interval, $log, $http, $cookies, $window, _, Authentication, Application, AccessModel) {

  return {
    isSynced: isSynced,
    sync: sync,
    isAllowed: isAllowed
  };

  function getToContext(state, params) {
    var toContext;
    if (state.name.substr (0, 2) === 'p.' || state.name === 'p') {
      toContext = params.projectid;
    } else if (state.context) {
      var c = (_.isFunction (state.context)) ? state.context () : state.context;
      toContext = params[c];
    }
    return toContext || 'application';
  }

  function isSynced(state, params) {
    var toContext = getToContext(state, params);
    var contextMatch = $cookies.get('context') === toContext;

    var currentUserId = Authentication.user ? Authentication.user._id : 0;
    var userMatch = $window.application.user === currentUserId;
    $cookies.put('loggedIn', currentUserId !== 0, {domain: window.location.hostname});

    var result = contextMatch && userMatch;
    return result;
  }

  function sync(state, params) {
    // need to set the cookies.get('context'), it gets used on the server side...
    $window.sessionStorage.removeItem('userRoles');
    $cookies.put('context', getToContext(state, params));
    var currentUserId = Authentication.user ? Authentication.user._id : 0;
    return Application.reload(currentUserId, true)
      .then(function() {
        return AccessModel.resetSessionContext();
      }, function(bad) {
        $log.error('Error in ContextService reloading the application: ', JSON.stringify(bad));
      })
      .then(function(opts) {
        // return value from session context...
        $window.sessionStorage.setItem('userRoles', opts.userRoles);
        var result = isSynced(state, params);
        return result;
      }, function(bad) {
        $log.error('Error in ContextService resetting the context: ', JSON.stringify(bad));
        var result = isSynced(state, params);
        return result;
      });
  }

  function isAllowed(data) {
    if (!data) {
      return true;
    }

    var roleSpecified = (data.roles && _.size(data.roles) > 0);
    var permissionSpecified = (data.permissions && _.size(data.permissions) > 0);

    if (roleSpecified || permissionSpecified) {
      var hasRole = !roleSpecified;
      var hasPermission = !permissionSpecified;

      if (roleSpecified) {
        var userRoles = $window.sessionStorage.getItem('userRoles');
        var roles = userRoles ? userRoles.split(',') : [];
        var sameRoles = _.intersection(data.roles, roles);
        hasRole = _.size(sameRoles) > 0;
      }

      if (permissionSpecified) {
        // will only apply to application/system level items...
        var userCan = $window.application.userCan;
        var permissions = [];
        _.transform(userCan, function (result, value, key) {
          if (value) {
            permissions.push(key);
          }
        }, {});
        var samePermissions = _.intersection(data.permissions, permissions);
        hasPermission = _.size(samePermissions) > 0;
      }
      var result = hasRole && hasPermission;
      return result;
    } else {
      // no roles, no permissions, so it's all good.
      return true;
    }
  }
}]);
