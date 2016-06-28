'use strict';
// =========================================================================
//
// a central area for dealing with error handling
//
// =========================================================================
angular.module('core').service ('EsmLog', ['$http', '_', function ($http, _) {
	// -------------------------------------------------------------------------
	//
	// some sort of error occured, just pass it in and do something with it
	//
	// -------------------------------------------------------------------------
	this.logError = function (err) {
		// console.log ('Error received:', err);
	};
	// -------------------------------------------------------------------------
	//
	// this is to be used as a reject replacement in a then or catch call
	//
	// -------------------------------------------------------------------------
	this.reject = function (rejectFunction) {
		var self = this;
		return function (err) {
			self.logError (err);
			rejectFunction (err);
		};
	};

}]);
