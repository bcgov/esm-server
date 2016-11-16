'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider', 'uiGmapGoogleMapApiProvider',
	function ($locationProvider, $httpProvider, uiGmapGoogleMapApiProvider) {
		$locationProvider.html5Mode(true).hashPrefix('!');

		$httpProvider.interceptors.push('authInterceptor');

		$httpProvider.defaults.cache = false;
		if (!$httpProvider.defaults.headers.get) {
			$httpProvider.defaults.headers.get = {};
		}
		// disable IE ajax request caching
		$httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

		uiGmapGoogleMapApiProvider.configure({
			key: 'AIzaSyCTbJdM2XHNQ6ybqPzyaT-242tIAgIbk8w',
			v: '3.24',
			// libraries: 'weather,geometry,visualization'
		});
	}
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(function ($window, $rootScope, $state, Authentication, _, $cookies, Application, ContextService, ADMIN_FEATURES, FEATURES) {


	// Check authentication before changing state
	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
		//console.log('> $stateChangeStart(to = ' +  toState.name + ', from = ' + fromState.name + ')');
		//console.log('> $stateChangeStart');
		//console.log('  toState = ', JSON.stringify(toState));
		//console.log('  toParams = ', JSON.stringify(toParams));
		//console.log('  fromState = ', JSON.stringify(fromState));
		//console.log('  fromParams = ', JSON.stringify(fromParams));
		//
		// for some states just go, no pre-processing
		//
		//console.log('ContextService.synced = ', ContextService.isSynced(toState, toParams));
		if (!!~['authentication.signin', 'forbidden', 'not-found'].indexOf (toState.name)) {
			return true;
		}
		else {
			var isRouteEnabled = function() {
				//console.log('isRouteEnabled: ', toState.name);
				//console.log('ADMIN_FEATURES: ', JSON.stringify(ADMIN_FEATURES));
				//console.log('FEATURES: ', JSON.stringify(FEATURES));
				var enabled = false;
				var str = toState.name;
				switch(str) {
					// core.client.menus -> systemMenu
					case String(str.match(/^admin.emailtemplate.*/)):
						enabled = 'true' === ADMIN_FEATURES.enableEmailTemplates;
						break;
					case String(str.match(/^admin.organization.*/)):
						enabled = 'true' === ADMIN_FEATURES.enableOrganizations;
						break;
					case String(str.match(/^admin.recentactivity.*/)):
						enabled = 'true' === ADMIN_FEATURES.enableNews;
						break;
					case String(str.match(/^admin.template.*/)):
						enabled = 'true' === ADMIN_FEATURES.enableTemplates;
						break;
					case String(str.match(/^admin.topic.*/)):
						enabled = 'true' === ADMIN_FEATURES.topic;
						break;
					case String(str.match(/^admin.user.*/)):
						enabled = 'true' === ADMIN_FEATURES.enableContacts;
						break;

					// core.client.menus -> projectTopMenu
					case String(str.match(/^p.schedule/)):
						enabled = 'true' === FEATURES.enableSchedule;
						break;
					case String(str.match(/^p.commentperiod.*/)):
						enabled = 'true' === FEATURES.enablePcp;
						break;

					// core.client.menus -> projectMenu
					case String(str.match(/^p.documents$/)):
						enabled = 'true' === FEATURES.enableDocuments;
						break;
					case String(str.match(/^p.invitation.*/)):
						enabled = 'true' === FEATURES.enableInvitations;
						break;
					case String(str.match(/^p.group.*/)):
						enabled = 'true' === FEATURES.enableGroups;
						break;
					case String(str.match(/^p.communication.*/)):
						enabled = 'true' === FEATURES.enableUpdates;
						break;
					case String(str.match(/^p.complaint.*/)):
						enabled = 'true' === FEATURES.enableComplaints;
						break;
					case String(str.match(/^p.projectcondition.*/)):
						enabled = 'true' === FEATURES.enableConditions;
						break;
					case String(str.match(/^p.ir.*/)):
						enabled = 'true' === FEATURES.enableCompliance;
						break;
					case String(str.match(/^p.vc.*/)):
						enabled = 'true' === FEATURES.enableVcs;
						break;

					default:
						enabled = true;
						break;
				}
				return enabled;
			};

			var prototypeEnabled = 'true' === ADMIN_FEATURES.enablePrototype;
			var handleCssLoad = function() {
				var handled = !prototypeEnabled;
				if (!handled) {
					if (fromState.name === 'prototype-load-error') {
						event.preventDefault();
						// go to MEM Projects / Home
						$window.location.href = $window.location.origin;
						handled = true;
					} else {
						if (toState.name === 'admin.prototype.actions') {
							// let this one through for now
						} else {
							if (_.startsWith(toState.name, 'admin.prototype.') && !_.startsWith(fromState.name, 'admin.prototype.')) {
								if ($window.location.search !== '?cssload=true') {
									event.preventDefault();
									$window.location.href = $window.location.origin + '/admin/prototype/project-main?cssload=true'; // go to our prototype main page...
									handled = true;
								}
							} else if (!_.startsWith(toState.name, 'admin.prototype.') && _.startsWith(fromState.name, 'admin.prototype.')) {
								if ($window.location.search !== '?cssload=true') {
									event.preventDefault();
									$window.location.href = $window.location.origin + '/?cssload=true'; // go to application main page (projects)
									handled = true;
								}
							}

						}
					}
				}
				return handled;
			};


			if (isRouteEnabled()) {
				if (!ContextService.isSynced(toState, toParams)) {
					//console.log('halt!');
					event.preventDefault();
					ContextService.sync(toState, toParams).then(function(ok) {
						//console.log('sync good, go!');
						if (ContextService.isAllowed(toState.data)) {
							if (prototypeEnabled) {
								if (!handleCssLoad()) {
									$state.go(toState, toParams);
								}
							} else {
								$state.go(toState, toParams);
							}
						} else {
							$state.go('forbidden');
						}
					}, function(bad) {
						//console.log('sync bad...:| ', JSON.stringify(bad));
						return false;
					});
				} else {
					// proceed...
					//console.log('synced... proceed if allowed!');
					if (ContextService.isAllowed(toState.data)) {
						if (prototypeEnabled) {
							return handleCssLoad();
						} else {
							return true;
						}
					} else {
						event.preventDefault();
						$state.go('forbidden');
					}
				}

			} else {
				event.preventDefault();
				$state.go('not-found');
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

	$rootScope.$on( "$stateChangeError", function( event, toState, toParams, fromState, fromParams, rejection){
		console.log('$stateChangeError(to = ' +  toState.name + ', from = ' + fromState.name + ')');
		if (_.startsWith(toState.name, 'admin.prototype.')) {
			console.log('  error loading prototype, go to prototype data error page.');
			$state.go('prototype-load-error');
		} else {
			console.log('  other state change error, just log it.');
		}
	});

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
