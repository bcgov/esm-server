'use strict';
var helpers  = require ('../controllers/core.helpers.controller');
var mongoose = require ('mongoose');
var _        = require ('lodash');


exports.put = function (req, res) {
	var data  = req.body.data;
	var query = req.body.query;
	var model = mongoose.model (req.body.model);
	//
	// update all models matching the query
	//
	model.find (query, function (err, documents) {
		if (err) return helers.sendError (res, err);
		else {
			Promise.all (documents.map (function (document) {
				document.set (data);
				return document.save ();
			}))
			.then (helpers.success(res), helpers.failure(res));
		}
	});
};
exports.post = function (req, res) {
	var data  = req.body.data;
	var model = mongoose.model (req.body.model);
	//
	// insert the model
	//
	model.new (data).save ()
	.then (helpers.success(res), helpers.failure(res));
};
exports.delete = function (req, res) {
	var query = req.body.query;
	var model = mongoose.model (req.body.model);
	//
	// remove all models matching the query
	//
	model.find (query).remove ()
	.then (helpers.success(res), helpers.failure(res));
};
