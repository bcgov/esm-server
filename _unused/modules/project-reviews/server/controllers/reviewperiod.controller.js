'use strict';
// =========================================================================
//
// Controller for reviews
//
// =========================================================================
var path       = require('path');
var DBModel    = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var PhaseModel = require (path.resolve('./modules/phases/server/controllers/phase.controller'));
var _          = require ('lodash');

module.exports = DBModel.extend ({
	name : 'ReviewPeriod',
	plural : 'reviewperiods',
	postprocessAdd: function (period) {
		var self=this;
		var p;
		if (period.type === 'Public') {
			//
			// add the base milestone for public reviews
			//
			p = PhaseModel.addMilestoneFromCode (period.phase, 'public-review', {write:period.roles});
		}
		else if (period.type === 'Working Group') {
			//
			// add the base milestone for working group reviews
			//
			p = PhaseModel.addMilestoneFromCode (period.phase, 'working-group-review', {write:period.roles});
		}
		return new Promise (function (resolve, reject) {
			p.then (function () { resolve (period); }).catch(reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// resolve an ENTIRE period, all review chains at once. returns the period
	//
	// -------------------------------------------------------------------------
	resolveReviewPeriod: function (reviewPeriod) {
		var self    = this;
		var Review = this.mongoose.model('Review');
		var update  = { resolved: true };
		var query   = { period: reviewPeriod._id };
		return new Promise (function (resolve, reject) {
			Review.update (query, update, {multi: true}).exec()
			.then (function () {
				reviewPeriod.set ({resolved:true});
				return self.saveDocument (reviewPeriod);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// publish an ENTIRE period, all review chains at once. returns the period
	//
	// -------------------------------------------------------------------------
	publishReviewPeriod: function (reviewPeriod, value) {
		var self    = this;
		var Review = this.mongoose.model('Review');
		var query   = { period: reviewPeriod._id };
		var update;
		if (value) {
			update = {
				published: true,
				$addToSet: {read: 'public'}
			};
		} else {
			update = {
				published: false,
				$pull: {read: 'public'}
			};
		}
		return new Promise (function (resolve, reject) {
			Review.update (query, update, {multi: true}).exec()
			.then (function () {
				reviewPeriod.set ({ published: value });
				return self.saveDocument (reviewPeriod);
			})
			.then (resolve, reject);
		});
	}
});

