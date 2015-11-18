'use strict';
// =========================================================================
//
// Base controller for all simple CRUD stuff, just to save some typing
//
// =========================================================================
var errorHandler = require('./errors.server.controller');
var mongoose     = require ('mongoose');

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
	this.respond = function (res) {
		return function (err, model) {
			if (err) {
				return res.status(400).send ({
					message: errorHandler.getErrorMessage (err)
				});
			} else {
				res.json (model);
			}
		};
	};
	// -------------------------------------------------------------------------
	//
	// GET new
	//
	// -------------------------------------------------------------------------
	this.new = function () {
		var self = this;
		return function (req, res) {
			res.json (new self.Model ());
		};
	};
	// -------------------------------------------------------------------------
	//
	// POST
	//
	// -------------------------------------------------------------------------
	this.create = function () {
		var self = this;
		return function (req, res) {
			var Model = new self.Model (req.body);
			Model.save (self.respond (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// GET
	//
	// -------------------------------------------------------------------------
	this.read = function () {
		var self = this;
		return function (req, res) {
			res.json (req[ self.Model.modelName ]);
		};
	};
	// -------------------------------------------------------------------------
	//
	// PUT
	//
	// -------------------------------------------------------------------------
	this.update = function () {
		var self = this;
		return function (req, res) {
			var datamodel = req[ self.Model.modelName ];
			datamodel.set (req.body);
			datamodel.save (self.respond (res));
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
			datamodel.remove (self.respond (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// GET *
	//
	// -------------------------------------------------------------------------
	this.list = function () {
		var self = this;
		return function (req, res) {
			var s = '';
			var p = '';
			self.Model.find().sort(self.options.sort).populate(self.options.populate).exec(self.respond (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// Automatic variable replacement from URL parameters
	//
	// -------------------------------------------------------------------------
	this.byId = function () {
		var self = this;
		return function (req, res, next, id) {
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return res.status(400).send ({
					message: 'Invalid object id supplied on url'
				});
			}
			self.Model.findById(id).populate(self.options.populate).exec(function (err, model) {
				if (err) {
					return next (err);
				} else if (!model) {
					return res.status(404).send ({
						message: 'No model with that identifier has been found'
					});
				}
				req[ self.Model.modelName ] = model;
				next ();
			});
		};
	};
};
