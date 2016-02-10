'use strict';
// =========================================================================
//
// Controller for streams
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));


module.exports = DBModel.extend ({
	name : 'Stream',
	populate: 'phases',
	addPhaseToStream : function (stream, phasebase) {
		var self = this;
		return new Promise (function (resolve, reject) {
			stream.phases.push (phasebase._id);
			self.saveAndReturn(stream)
			.then (resolve, reject);
		});
	}
});


