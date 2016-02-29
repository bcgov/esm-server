'use strict';
// =========================================================================
//
// Controller for comments
//
// =========================================================================
var path       = require('path');
var DBModel    = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var PhaseModel = require (path.resolve('./modules/phases/server/controllers/phase.controller'));
var _          = require ('lodash');

module.exports = DBModel.extend ({
	name : 'CommentPeriod',
	postprocessAdd: function (period) {
		var self=this;
		var p;
		if (period.type === 'Public') {
			//
			// add the base milestone for public comments
			//
			p = PhaseModel.addMilestoneFromCode (period.phase, 'public-comment', {write:period.roles});
		}
		else if (period.type === 'Working Group') {
			//
			// add the base milestone for working group comments
			//
			p = PhaseModel.addMilestoneFromCode (period.phase, 'working-group-comment', {write:period.roles});
		}
		return new Promise (function (resolve, reject) {
			p.then (function () { resolve (period); }).catch(reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// resolve an ENTIRE period, all comment chains at once. returns the period
	//
	// -------------------------------------------------------------------------
	resolveCommentPeriod: function (commentPeriod) {
		var self    = this;
		var Comment = this.mongoose.model('Comment');
		var update  = { resolved: true };
		var query   = { period: commentPeriod._id };
		return new Promise (function (resolve, reject) {
			Comment.update (query, update, {multi: true}).exec()
			.then (function () {
				commentPeriod.set ({resolved:true});
				return self.saveDocument (commentPeriod);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// publish an ENTIRE period, all comment chains at once. returns the period
	//
	// -------------------------------------------------------------------------
	publishCommentPeriod: function (commentPeriod, value) {
		var self    = this;
		var Comment = this.mongoose.model('Comment');
		var query   = { period: commentPeriod._id };
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
			Comment.update (query, update, {multi: true}).exec()
			.then (function () {
				commentPeriod.set ({ published: value });
				return self.saveDocument (commentPeriod);
			})
			.then (resolve, reject);
		});
	}
});

