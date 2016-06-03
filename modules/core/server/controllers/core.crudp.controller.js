'use strict';
// =========================================================================
//
// Base controller for all simple CRUD stuff, just to save some typing
// THis version uses and returns promises where appropriate. this makes
// decorating much easier as well (pre and post processing)
//
// =========================================================================
var helpers  = require('./core.helpers.controller');
var mongoose = require ('mongoose');
// var access   = require('./core.access.controller');
var _ = require ('lodash');

// -------------------------------------------------------------------------
//
// options are
// {
// 	populate : the populate string
// 	sort : the sort string
// }
//
// -------------------------------------------------------------------------
module.exports = function (Model, options) {
	this.Model = Model;
	options = options || {};
	this.options = {};
	this.options.sort = options.sort || '';
	this.options.populate = options.populate || '';
	// -------------------------------------------------------------------------
	//
	// Used by a bunch of functions
	//
	// -------------------------------------------------------------------------
	this.respond = helpers.queryResponse;
	// -------------------------------------------------------------------------
	//
	// find etc returns promises
	//
	// -------------------------------------------------------------------------
	this.findOne = function (id, populate) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.Model.findById (id)
			.populate (populate)
			.exec ()
			.then (resolve, reject);
		});
	};
	this.findMany = function (query, sort, populate) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.Model.find (query)
			.sort (sort)
			.populate (populate)
			.exec ()
			.then (resolve, reject);
		});
	};
	this.saveDocument = function (doc) {
		return new Promise (function (resolve, reject) {
			doc.save ().then (resolve, reject) ;
		});
	};
	this.saveAndDecorate = function (doc, decorate) {
		if (!decorate) return this.saveDocument (doc);
		else return this.saveDocument.then (decorate);
	};
	this.decorateMany = function (models, decorate) {
		return Promise.all (models.map (decorate));
	};
	this.newDocument = function (o) {
		var self = this;
		return new Promise (function (resolve, reject) {
			return new self.Model (o);
		});
	};
	this.emptyPromise = function (thing) {
		return new Promise (function (resolve, reject) {
			resolve (thing);
		});
	};
	// -------------------------------------------------------------------------
	//
	// GET new (decorate must return a promise)
	//
	// -------------------------------------------------------------------------
	this.new = function (decorate) {
		var self = this;
		decorate = decorate || this.emptyPromise;
		return function (req, res) {
			self.newDocument ()
			.then (decorate)
			.then (helpers.successFunction (res))
			.catch (helpers.errorFunction (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// POST (preprocess/decorate must return a promise)
	//
	// -------------------------------------------------------------------------
	this.create = function (preprocess, decorate) {
		var self = this;
		preprocess = preprocess || this.emptyPromise;
		decorate = decorate || this.emptyPromise;
		return function (req, res) {
			self.newDocument (req.body)
			.then (preprocess)
			.then (self.saveDocument)
			.then (decorate)
			.then (helpers.successFunction (res))
			.catch (helpers.errorFunction (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// GET
	//
	// -------------------------------------------------------------------------
	this.read = function (decorate) {
		var self = this;
		decorate = decorate || this.emptyPromise;
		return function (req, res) {
			decorate (req[ self.Model.modelName ])
			.then (helpers.successFunction (res))
			.catch (helpers.errorFunction (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// PUT
	//
	// -------------------------------------------------------------------------
	this.update = function (preprocess, decorate) {
		var self = this;
		preprocess = preprocess || this.emptyPromise;
		decorate = decorate || this.emptyPromise;
		return function (req, res) {
			var datamodel = req[ self.Model.modelName ];
			datamodel.set (req.body);
			preprocess (datamodel)
			.then (self.saveDocument)
			.then (decorate)
			.then (helpers.successFunction (res))
			.catch (helpers.errorFunction (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// DELETE
	//
	// -------------------------------------------------------------------------
	this.delete = function () {
		var self = this;
		return function (req, res) {
			var datamodel = req[ self.Model.modelName ];
			datamodel.remove (helpers.queryResponse (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// GET *
	//
	// -------------------------------------------------------------------------
	this.list = function (q) {
		options = _.extend ({}, {
			query : {},
			sort: '',
			populate : '',
			decorate : this.emptyPromise
		},
		options);
		var self = this;
		return function (req, res) {
			self.findMany (options.query, options.sort, options.populate)
			.then (function (models) {
				return Promise.all (models.map (options.decorate));
			})
			.then (helpers.successFunction (res))
			.catch (helpers.errorFunction (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// Automatic variable replacement from URL parameters
	//
	// -------------------------------------------------------------------------
	this.getObject = function (options) {
		options = _.extend ({}, {
			populate : '',
			decorate : function () {}
		},
		options);
		var self = this;
		return function (req, res, next, id) {
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return helpers.sendErrorMessage (res, 'Invalid object id supplied');
			}
			self.Model.findById(id).populate(options.populate).exec(function (err, model) {
				if (err) {
					return next (err);
				} else if (!model) {
					return helpers.sendNotFound (res, self.Model.modelName+' not found');
				} else {
					// var userid = (req.user) ? req.user._id : 'guest';
					// access.userHasPermission (userid, id, 'read', function (err, ok) {
					// 	if (err) return next (err);
					// 	if (!ok) return helpers.sendNotFound (res, self.Model.modelName+' not authorized');
						req[ self.Model.modelName ] = model;
						next ();

					// });
				}
			});
		};
	};
};
