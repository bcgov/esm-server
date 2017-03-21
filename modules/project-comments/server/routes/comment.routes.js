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

			// base query / filter
			var periodId;
			var eaoStatus;
			var proponentStatus;
			var isPublished;

			// filter By Fields...
			var commentId;
			var authorComment;
			var location;
			var pillar;
			var topic;

			// pagination stuff
			var skip = 0;
			var limit = 50;
			var sortby = {};

			if (req.body) {

				// base query / filter
				if (!_.isEmpty(req.body.periodId)) {
					periodId = req.body.periodId;
				}
				if (!_.isEmpty(req.body.eaoStatus)) {
					eaoStatus = req.body.eaoStatus;
				}
				if (!_.isEmpty(req.body.proponentStatus)) {
					proponentStatus = req.body.proponentStatus;
				}
				if (req.body.isPublished !== undefined) {
					isPublished = Boolean(req.body.isPublished);
				}

				// filter By Fields...
				if (!_.isEmpty(req.body.commentId)) {
					try {
						commentId = parseInt(req.body.commentId);
					} catch(e) {

					}
				}
				if (!_.isEmpty(req.body.authorComment)) {
					authorComment = req.body.authorComment;
				}
				if (!_.isEmpty(req.body.location)) {
					location = req.body.location;
				}
				if (!_.isEmpty(req.body.pillar)) {
					pillar = req.body.pillar;
				}
				if (!_.isEmpty(req.body.topic)) {
					topic = req.body.topic;
				}

				// pagination stuff
				try {
					skip = parseInt(req.body.start);
					limit = parseInt(req.body.limit);
				} catch(e) {

				}
				if (req.body.orderBy) {
					sortby[req.body.orderBy] = req.body.reverse ? -1 : 1;
				}
			}

			return model.getCommentsForPeriod (periodId, eaoStatus, proponentStatus, isPublished, commentId, authorComment, location, pillar, topic, skip, limit, sortby);
		}));

	app.route ('/api/comments/period/:periodId/perms/sync').all(policy ('user'))
		.put (routes.setAndRun (CommentModel, function (model, req) {

			// base query / filter
			var periodId;

			// pagination stuff
			var skip = 0;
			var limit = 50;

			var projectId; // will need this to check for createCommentPeriod permission

			if (req.body) {

				// base query / filter
				if (!_.isEmpty(req.body.periodId)) {
					periodId = req.body.periodId;
				}

				// pagination stuff
				try {
					skip = parseInt(req.body.start);
					limit = parseInt(req.body.limit);
				} catch(e) {
					console.log('Invalid skip/start or limit value passed in (skip/start =',  req.body.start, ', limit = ', req.body.limit, '); using defaults: skip/start = ', skip, ', limit =', limit);
				}

				if (!_.isEmpty(req.body.projectId)) {
					projectId = req.body.projectId;
				}

			}
			return model.updatePermissionBatch(projectId, periodId, skip, limit);
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

