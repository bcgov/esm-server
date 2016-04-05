'use strict';
// =========================================================================
//
// Routes for comments
//
// =========================================================================
var policy  = require ('../policies/comment.policy');
var CommentModel  = require ('../controllers/comment.controller');
var CommentPeriod  = require ('../controllers/commentperiod.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'comment', CommentModel, policy);
	helpers.setCRUDRoutes (app, 'commentperiod', CommentPeriod, policy);
	// =========================================================================
	//
	// special routes for comments
	//
	// =========================================================================
	//
	// resolve, publish, unpublish comment chains
	//
	app.route ('/api/commentperiod/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			(new CommentPeriod (req.user)).getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/publish/comment/:comment').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new CommentModel (req.user);
			p.publishCommentChain (req.Comment.ancestor, true)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/unpublish/comment/:comment').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new CommentModel (req.user);
			p.publishCommentChain (req.Comment.ancestor, false)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/resolve/comment/:comment').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new CommentModel (req.user);
			p.resolveCommentChain (req.Comment.ancestor, false)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get comments of a certain type for a certain target
	//
	app.route ('/api/comments/type/:type/target/:targettype/:targetid').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new CommentModel (req.user);
			p.getCommentsForTarget (req.params.targettype, req.params.targetid, req.params.type)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get an entire comment chain
	//
	app.route ('/api/comments/ancestor/:commentId').all(policy.isAllowed)
		.get (function (req, res) {
			var p = new CommentModel (req.user);
			p.getCommentsForTarget (req.params.targettype, req.params.targetid, req.params.type)
			.then (helpers.success(res), helpers.failure(res));
		});
	// =========================================================================
	//
	// special routes for comment periods
	//
	// =========================================================================
	//
	// resolve, publish, unpublish comment periods
	//
	app.route ('/api/publish/commentperiod/:commentperiod').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new CommentPeriod (req.user);
			p.publishCommentPeriod (req.CommentPeriod.ancestor, true)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/unpublish/commentperiod/:commentperiod').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new CommentPeriod (req.user);
			p.publishCommentPeriod (req.CommentPeriod.ancestor, false)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/resolve/commentperiod/:commentperiod').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new CommentPeriod (req.user);
			p.resolveCommentPeriod (req.CommentPeriod.ancestor, false)
			.then (helpers.success(res), helpers.failure(res));
		});

};

