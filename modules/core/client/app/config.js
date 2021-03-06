'use strict';

// Init the application configuration module for AngularJS application
// eslint-disable-next-line no-unused-vars
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = [
    'ngResource',
    'ngAnimate',
    'ngMessages',
    'ui.router',
    'ui.bootstrap',
    'ui.utils',
    'ui.tinymce',
    'uiGmapgoogle-maps',
    'ngTable',
    'ad3',
    'angularMoment',
    'mwl.confirm',
    'ngFileUpload',
    'duScroll',
    'ngPDFViewer',
    'ngCookies',
    'smart-table',
    'ngclipboard',
    'dndLists'
  ];


  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();
