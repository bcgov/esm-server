'use strict';
// =========================================================================
//
// Routes for reviews
//
// =========================================================================
var policy       = require ('../policies/review.policy');
var ReviewModel  = require ('../controllers/review.controller');
var ReviewPeriod = require ('../controllers/reviewperiod.controller');
var helpers      = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'review', ReviewModel, policy);
	helpers.setCRUDRoutes (app, 'reviewperiod', ReviewPeriod, policy);
	// =========================================================================
	//
	// special routes for reviews
	//
	// =========================================================================
	//
	// resolve, publish, unpublish review chains
	//
	app.route ('/api/publish/review/:review').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new ReviewModel (req.user);
			p.publishReviewChain (req.Review.ancestor, true)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/unpublish/review/:review').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new ReviewModel (req.user);
			p.publishReviewChain (req.Review.ancestor, false)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/resolve/review/:review').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new ReviewModel (req.user);
			p.resolveReviewChain (req.Review.ancestor, false)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get reviews of a certain type for a certain target
	//
	app.route ('/api/reviews/type/:type/target/:targettype/:targetid').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new ReviewModel (req.user);
			p.getReviewsForTarget (req.params.targettype, req.params.targetid, req.params.type)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get an entire review chain
	//
	app.route ('/api/reviews/ancestor/:reviewId').all(policy.isAllowed)
		.get (function (req, res) {
			var p = new ReviewModel (req.user);
			p.getReviewsForTarget (req.params.targettype, req.params.targetid, req.params.type)
			.then (helpers.success(res), helpers.failure(res));
		});
	// =========================================================================
	//
	// special routes for review periods
	//
	// =========================================================================
	//
	// resolve, publish, unpublish review periods
	//
	app.route ('/api/publish/reviewperiod/:reviewperiod').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new ReviewPeriod (req.user);
			p.publishReviewPeriod (req.ReviewPeriod.ancestor, true)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/unpublish/reviewperiod/:reviewperiod').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new ReviewPeriod (req.user);
			p.publishReviewPeriod (req.ReviewPeriod.ancestor, false)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/resolve/reviewperiod/:reviewperiod').all(policy.isAllowed)
		.put (function (req, res) {
			var p = new ReviewPeriod (req.user);
			p.resolveReviewPeriod (req.ReviewPeriod.ancestor, false)
			.then (helpers.success(res), helpers.failure(res));
		});

};

