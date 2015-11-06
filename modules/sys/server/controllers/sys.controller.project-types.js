'use strict';
var path         = require('path');
var mongoose     = require ('mongoose');
var ProjectType  = mongoose.model ('ProjectType');
var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

exports.byid = function (req, res, next, id) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send ({
			message: 'Article is invalid'
		});
  	}
  	ProjectType.findById(id).exec (function (err, result) {
  		if (err) {
  			return next (err);
  		} else if (!result) {
  			return res.status(404).send ({
  				message: "No result"
  			});
  		}
  	});
};
