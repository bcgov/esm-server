'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider', 'uiGmapGoogleMapApiProvider',
	function ($locationProvider, $httpProvider, uiGmapGoogleMapApiProvider) {
		$locationProvider.html5Mode(true).hashPrefix('!');

		$httpProvider.interceptors.push('authInterceptor');

		uiGmapGoogleMapApiProvider.configure({
			key: 'AIzaSyCTbJdM2XHNQ6ybqPzyaT-242tIAgIbk8w',
			v: '3.22',
			libraries: 'weather,geometry,visualization'
		});
	}
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(function ($rootScope, $state, Authentication, _, MenuControl) {

	// Check authentication before changing state
	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
		if (toState.data && toState.data.roles) {
			if (_.isFunction (toState.data.roles)) toState.data.roles = toState.data.roles ();
			if (toState.data.roles.length > 0) {
				// toState.data.roles = MenuControl.canAccess (toState.data.roles);
				var allowed = false;
				toState.data.roles.forEach(function (role) {
					if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
						allowed = true;
						return true;
					}
				});

				if (!allowed) {
					event.preventDefault();
					if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
						$state.go('forbidden');
					} else {
						$state.go('authentication.signin');
					}
				}
			}
		}
	});

	// Record previous state
	$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
		document.body.scrollTop = document.documentElement.scrollTop = 0;
		if (!fromState.data || !fromState.data.ignoreState) {
			$state.previous = {
				state: fromState,
				params: fromParams,
				href: $state.href(fromState, fromParams)
			};
		}

	});

	$rootScope.$on('$stateChangeError', console.log.bind(console));

});

//Then define the init function for starting up the application
angular.element(document).ready(function () {
	//Fixing facebook bug with redirect
	if (window.location.hash && window.location.hash === '#_=_') {
		if (window.history && history.pushState) {
			window.history.pushState('', document.title, window.location.pathname);
		} else {
			// Prevent scrolling by storing the page's current scroll offset
			var scroll = {
				top: document.body.scrollTop,
				left: document.body.scrollLeft
			};
			window.location.hash = '';
			// Restore the scroll offset, should be flicker free
			document.body.scrollTop = scroll.top;
			document.body.scrollLeft = scroll.left;
		}
	}

  // make sure we don't have any issues in ie getting the location.origin...
  if (!window.location.origin) {
    window.location.origin = window.location.protocol + "//" +
      window.location.hostname +
      (window.location.port ? ':' + window.location.port : '');
  }

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
