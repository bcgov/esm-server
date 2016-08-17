'use strict';
// =========================================================================
//
// Controller for vcs
//
// =========================================================================
var path      = require('path');
var _         = require ('lodash');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var EmailController   = require (path.resolve('./modules/core/server/controllers/email.server.controller'));


module.exports = DBModel.extend ({
	name: 'Communication',
	plural: 'communications',
	sort: {dateUpdated:-1},
	populate: 'artifacts artifacts.name artifacts.version artifacts.versionNumber',


	preprocessAdd : function (model) {
		var self = this;
		//console.log('Communication.preprocessAdd: ', JSON.stringify(model, null, 4));
		return new Promise (function (resolve, reject) {

			model.code = model.name.toLowerCase();
			model.code = model.code.replace(/\W/g, '-');
			model.code = model.code.replace(/-+/, '-');
			//
			// this does the work of that and returns a promise
			//
			self.guaranteeUniqueCode(model.code)
				.then(function (code) {
					return model;
				}).then(resolve, reject);
		});
	},

	getForProject: function (id) {
		return this.list({project: id});
	},

	getForGroup: function (id) {
		return this.list({group: {$in: [id] }});
	},

	deliver: function(model) {
		var emailList = _.filter(model.recipients, function(o) { return o.viaEmail; });
		var recipients = [];
		_.forEach(emailList, function(o) {
			recipients.push({name: o.displayName, address: o.email});
		});

		if (model.personalized) {
			return EmailController.sendEach(model.subject, '', model.content, recipients);
		} else {

			return EmailController.sendAll(model.subject, '', model.content, [], [], recipients);
		}
	}
});
