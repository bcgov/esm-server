'use strict';

var mongoose        = require('mongoose'),
	_               = require('lodash'),
	PublicComment   = mongoose.model('PublicComment'),
	P               = require('promise');

var logger;

var getComments = function () {
	return new P (function (resolve, reject) {
		PublicComment.find().populate('buckets', 'group name').then (resolve, reject);
	});
};

var populateTopicsGroups = function (commentarray) {
	return P.all (commentarray.map (function (comment) {
		comment.pillars = _.unique (_.pluck (comment.buckets, 'group'));
		comment.topics  = _.pluck (comment.buckets, 'name');
		logger ('-----------------------');
		logger (JSON.stringify (comment.buckets, null, 4));
		logger (JSON.stringify (comment.pillars, null, 4));
		logger (JSON.stringify (comment.topics, null, 4));
		comment.markModified ('pillars');
		comment.markModified ('topics');
		return comment.save ();
	}));
};


// -------------------------------------------------------------------------
//
// main
//
// -------------------------------------------------------------------------
module.exports = function (f) {
	logger = f;
	return new P (function (resolve, reject) {
		P.resolve ()
		.then (getComments)
		.then (populateTopicsGroups)
		// .then (saveCommentsSequential)
		.then (resolve, reject);
	});
};

