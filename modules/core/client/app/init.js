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

angular.module(ApplicationConfiguration.applicationModuleName).run(function ($rootScope, $state, Authentication, _, MenuControl, $cookies, Application) {

	// Check authentication before changing state
	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
		//
		// for some states just go, no pre-processing
		//
		if (!!~['authentication.signin','forbidden'].indexOf (toState.name)) {
			return true;
		}
		else {
			//
			// if changing to this route indicates a change of context (from a security
			// point of view) set the context cookie. Otherwise set it to application
			//
			$cookies.context = 'application';
			if (toState.context) {
				//
				// the context is the name of the psrameter on the ui-route, we fetch that
				// value from the route url using toParams
				//
				var c = (_.isFunction (toState.context)) ? toState.context () : toState.context;
				$cookies.context = toParams[c] || 'application';
			}
			//
			// now check to see if we need to reload the application
			//
			Application.reload (Authentication.user ? Authentication.user._id : 0)
			.then (function () {
				console.log ('Applicaiton.userCan = ', Application.userCan);
				return true;
				//
				// CC: this is where to apply route level security if we decide to
				//
				// if the user fails, then if they are logged in send them to forbidden
				// otherwise send them to signin
				//
				// if (!allowed) {
				// 	event.preventDefault();
				// 	if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
				// 		$state.go('forbidden');
				// 	} else {
				// 		$state.go('authentication.signin');
				// 	}
				//  return false;
				// }
			})
			.catch (function () {
				alert ('Error setting application object');
				return true;
			});
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
