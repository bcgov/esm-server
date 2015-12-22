'use strict';
// =========================================================================
//
// Routes for publicComments

// public can post
// when sending back remember to include buckets array and issues array and documents array

// when saving a comment check if any of the documents are in deferred status, if so the coment
// overall status stays as deferred. if all of the documents are either publiched or rejected
// then the status can be published (so long as the commetn is too)
//
// =========================================================================
var policy     = require ('../policies/publicComment.policy');
var controller = require ('../controllers/publicComment.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/publiccomment').all (policy.isAllowed)
	//	.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/publiccomment/:publiccomment').all (policy.isAllowed)
		// .put    (controller.update)
		.get    (controller.read);
		// .delete (controller.delete);
	app.route ('/api/new/publiccomment').all (policy.isAllowed)
		.get (controller.new);




	app.route ('/api/publiccomment/project/:projectid/published').all (policy.isAllowed)
		.get (controller.allPublished);
	app.route ('/api/publiccomment/project/:projectid/published/limit/:limit/offset/:offset').all (policy.isAllowed)
		.get (controller.allPublished);
	app.route ('/api/publiccomment/project/:projectid/unpublished').all (policy.isAllowed)
		.get (controller.allUnPublished);
	app.route ('/api/publiccomment/project/:projectid/unpublished/limit/:limit/offset/:offset').all (policy.isAllowed)
		.get (controller.allUnPublished);
	//
	// action routes
	//
	app.route ('/api/publiccomment/:publiccomment/eao/defer').all (policy.isAllowed)
		.put (controller.eaodefer);
	app.route ('/api/publiccomment/:publiccomment/eao/accept').all (policy.isAllowed)
		.put (controller.eaoaccept);
	app.route ('/api/publiccomment/:publiccomment/eao/reject').all (policy.isAllowed)
		.put (controller.eaoreject);
	app.route ('/api/publiccomment/:publiccomment/eao/publish').all (policy.isAllowed)
		.put (controller.eaopublish);
	app.route ('/api/publiccomment/:publiccomment/eao/spam').all (policy.isAllowed)
		.put (controller.eaospam);
	//
	// save a copy
	//
	app.route ('/api/publiccomment/:publiccomment/eao/edit').all (policy.isAllowed)
		.put (controller.eaoedit);
	//
	// get set for vetting
	//
	app.route ('/api/publiccomment/project/:projectid/vett/start').all (policy.isAllowed)
		.get (controller.vettingStart);
	app.route ('/api/publiccomment/project/:projectid/vett/claim').all (policy.isAllowed)
		.get (controller.vettingClaim);
	//
	// get set for classifying
	//
	app.route ('/api/publiccomment/project/:projectid/classify/start').all (policy.isAllowed)
		.get (controller.classifyStart);
	app.route ('/api/publiccomment/project/:projectid/classify/claim').all (policy.isAllowed)
		.get (controller.classifyClaim);
	//
	// proponent action routes
	//
	app.route ('/api/publiccomment/:publiccomment/proponent/defer').all (policy.isAllowed)
		.put (controller.proponentdefer);
	app.route ('/api/publiccomment/:publiccomment/proponent/classify').all (policy.isAllowed)
		.put (controller.proponentclassify);
	//
	// count the number of unclaimed unvetted comments for a project
	//
	app.route ('/api/publiccomment/project/:projectid/unvetted').all (policy.isAllowed)
		.get (controller.unvetted);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('publiccomment', controller.getObject);
	//app.param ('publicCommentId', controller.getId);
};

