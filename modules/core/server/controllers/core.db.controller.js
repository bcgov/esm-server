'use strict';
var helpers  = require ('../controllers/core.helpers.controller');
var mongoose = require ('mongoose');
var _        = require ('lodash');


exports.get = function(req, res) {
	//console.log('get model = ' + req.params.model);
	var model = mongoose.model (req.params.model);
	var query = JSON.parse(JSON.stringify(req.query)) || {};
	//console.log('get query = ' + JSON.stringify(query));
	model.find (query, function (err, documents) {
		if (err) return helpers.sendError (res, err);
		else {
			//console.log('returning ' + documents.length + ' records');
			return helpers.sendData (res, documents);
		}
	});
};

exports.put = function (req, res) {
	var data  = req.body.data;
	var query = req.body.query;
	var model = mongoose.model (req.body.model);
	//
	// update all models matching the query
	//
	model.find (query, function (err, documents) {
		if (err) return helpers.sendError (res, err);
		else {
			if (!data || _.isEmpty (data)) {
				return helpers.sendData (res, documents);
			} else {
				Promise.all (documents.map (function (document) {
					document.set (data);
					return document.save ();
				}))
				.then (helpers.success(res), helpers.failure(res));
			}
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
