'use strict';
// =========================================================================
//
// Controller for contacts
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

var Org = require('mongoose').model('Organization');

module.exports = DBModel.extend ({
	name : 'User',
	plural : 'users',
	populate: 'org',
	sort: 'lastName firstName',

	guaranteeUniqueUsername : function (code) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findUniqueUsername (code, '', function (err, newcode) {
				if (err) return reject (err);
				else resolve (newcode);
			});
		});
	},
	findUniqueUsername: function (code, suffix, callback) {
		var self = this;
		var trialCode = code + (suffix || '');
		self.model.findOne ({username:trialCode}, function (err, result) {
			if (!err) {
				if (!result) {
					callback (null, trialCode);
				} else {
					return self.findUniqueUsername (code, (suffix || 0) + 1, callback);
				}
			} else {
				callback (err, null);
			}
		});
	},

	preprocessAdd: function(o) {
		var self = this;
		//console.log('preprocessAdd = ', JSON.stringify(o, null, 4));

		// we no longer specify the username in our UI, so we need to build a unique one.
		if (_.isEmpty(o.username)) {
			o.username = o.displayName.toLowerCase ();
			o.username = o.username.replace (/\W/g,'-');
			o.username = o.username.replace (/^-+|-+(?=-|$)/g, '');
		}
		if (_.endsWith(o.username, '-')) {
			o.username = o.username.slice(0, -1);
		}

		return new Promise(function(resolve, reject) {
			self.guaranteeUniqueUsername (o.username)
				.then (function (username) {
					//console.log('username = ', username);
					o.username = username;
					if (!_.isEmpty(o.org)) {
						var orgId = _.has(o.org, '_id') ? o.org._id : o.org;
						return new Promise(function(resolve, reject) {
							Org.findOne({_id: orgId}).exec()
								.then(function(res) {
									o.orgName = res.name;
									resolve(o);
								}, function(err) {
									reject(err);
								});
						});
					} else {
						o.orgName = '';
						resolve(o);
					}
				})
				.then (resolve, reject);
		});
	},

	preprocessUpdate: function(o) {
		//console.log('preprocessUpdate = ', JSON.stringify(o, null, 4));
		if (!_.isEmpty(o.org)) {
			var orgId = _.has(o.org, '_id') ? o.org._id : o.org;
			return new Promise(function(resolve, reject) {
				Org.findOne({_id: orgId}).exec()
					.then(function(res) {
						o.orgName = res.name;
						resolve(o);
					}, function(err) {
						reject(err);
					});
			});
		} else {
			o.orgName = '';
			return o;
		}
	}
});