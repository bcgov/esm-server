'use strict';
// =========================================================================
//
// Routes for comments
//
// =========================================================================
var CommentModel  = require ('../controllers/comment.controller');
var CommentPeriod  = require ('../controllers/commentperiod.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');
var _ = require ('lodash');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'comment', CommentModel, policy, null, { all:'guest', get:'guest', paginate:'guest' });
	routes.setCRUDRoutes (app, 'commentperiod', CommentPeriod, policy);
	// =========================================================================
	//
	// special routes for comments
	//
	// =========================================================================
	//
	// resolve, publish, unpublish comment chains
	//
	app.route ('/api/commentperiod/for/public/:id').all (policy ('guest'))
		.get (routes.setAndRun (CommentPeriod, function (model, req) {
			return model.getForPublic (req.params.id);
		}));
	app.route ('/api/commentperiod/for/project/:projectid').all (policy ('guest'))
		.get (routes.setAndRun (CommentPeriod, function (model, req) {
			return model.getForProject (req.params.projectid);
		}));
	app.route ('/api/commentperiod/for/project/:projectid/withstats').all (policy ('guest'))
	.get (routes.setAndRun (CommentPeriod, function (model, req) {
		return model.getForProjectWithStats (req.params.projectid);
	}));
	app.route ('/api/publish/comment/:comment').all(policy ('user'))
		.put (routes.setAndRun (CommentModel, function (model, req) {
			return model.publishCommentChain (req.Comment.ancestor, true);
		}));
	app.route ('/api/unpublish/comment/:comment').all(policy ('user'))
		.put (routes.setAndRun (CommentModel, function (model, req) {
			return model.publishCommentChain (req.Comment.ancestor, false);
		}));
	app.route ('/api/resolve/comment/:comment').all(policy ('user'))
		.put (routes.setAndRun (CommentModel, function (model, req) {
			return model.resolveCommentChain (req.Comment.ancestor, false);
		}));
	//
	// get comments of a certain type for a certain target
	//
	app.route ('/api/comments/type/:type/target/:targettype/:targetid').all(policy ('user'))
		.put (routes.setAndRun (CommentModel, function (model, req) {
			return model.getCommentsForTarget (req.params.targettype, req.params.targetid, req.params.type);
		}));
	//
	// get an entire comment chain
	//
	app.route ('/api/comments/ancestor/:commentId').all(policy ('user'))
		.get (routes.setAndRun (CommentModel, function (model, req) {
			return model.getCommentsForTarget (req.params.targettype, req.params.targetid, req.params.type);
		}));
	app.route ('/api/comments/period/:periodId/all').all(policy ('guest'))
		.get (routes.setAndRun (CommentModel, function (model, req) {
			return model.getAllCommentsForPeriod (req.params.periodId);
		}));
	app.route ('/api/comments/period/:periodId/published').all(policy ('guest'))
		.get (routes.setAndRun (CommentModel, function (model, req) {
			return model.getPublishedCommentsForPeriod (req.params.periodId);
		}));
	app.route ('/api/eaocomments/period/:periodId').all(policy ('user'))
		.get (routes.setAndRun (CommentModel, function (model, req) {
			return model.getEAOCommentsForPeriod (req.params.periodId);
		}));
	app.route ('/api/proponentcomments/period/:periodId').all(policy ('user'))
		.get (routes.setAndRun (CommentModel, function (model, req) {
			return model.getProponentCommentsForPeriod (req.params.periodId);
		}));

	app.route ('/api/comments/period/:periodId/paginate').all(policy ('guest'))
		.put (routes.setAndRun (CommentModel, function (model, req) {
			return model.getPeriodPaginate(req.body);
		}));
	app.route ('/api/comments/period/:periodId/perms/sync').all(policy ('user'))
		.put (routes.setAndRun (CommentModel, function (model, req) {
			return model.getPeriodPermsSync(req.body);
		}));

	// =========================================================================
	//
	// special routes for comment periods
	//
	// =========================================================================
	//
	// resolve, publish, unpublish comment periods
	//
	app.route ('/api/publish/commentperiod/:commentperiod').all(policy ('user'))
		.put (routes.setAndRun (CommentPeriod, function (model, req) {
			return model.publishCommentPeriod (req.CommentPeriod, true);
		}));
	app.route ('/api/unpublish/commentperiod/:commentperiod').all(policy ('user'))
		.put (routes.setAndRun (CommentPeriod, function (model, req) {
			return model.publishCommentPeriod (req.CommentPeriod, false);
		}));
	app.route ('/api/resolve/commentperiod/:commentperiod').all(policy ('user'))
		.put (routes.setAndRun (CommentPeriod, function (model, req) {
			return model.resolveCommentPeriod (req.CommentPeriod.ancestor, false);
		}));
	
	app.route ('/api/comment/:commentId/documents').all(policy ('guest'))
	.get (routes.setAndRun (CommentModel, function (model, req) {
		return model.getCommentDocuments(req.params.commentId);
	}));

	// special delete method
	app.route ('/api/commentperiod/:commentperiod/remove')
		.all (policy ('user'))
		.delete (routes.setAndRun (CommentPeriod, function (model, req) {
			return model.removePeriod (req.CommentPeriod);
		}));

};

