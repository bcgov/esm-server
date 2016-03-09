'use strict';
// =========================================================================
//
// Controller for conditions
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Condition',
	plural : 'conditions',
	decorate: function (model) {
		model = (model.toObject) ? model.toObject(): model;
		model.stageString = model.stages.join (', ');
		model.pillarString = model.pillars.join (', ');
		console.log ('decorating');
		return model;
	}
});

