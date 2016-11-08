'use strict';

var mongoose = require('mongoose');
var phases   = require ('./memphases');
var Phase    = mongoose.model('Phase');
var _ = require ('lodash');

module.exports = function () {

	_.each (phases, function (ph) {
		var phase = new Phase (ph);
		phase.save ();
	});
};
