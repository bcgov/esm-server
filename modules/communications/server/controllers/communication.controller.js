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
var InvitationController = require (path.resolve('./modules/invitations/server/controllers/invitation.controller'));


module.exports = DBModel.extend ({
	name: 'Communication',
	plural: 'communications',
	sort: {dateUpdated:-1},
	populate: [{ path: 'documents'}, { path: 'emailTemplate', select: '_id name' }],


	preprocessAdd : function (model) {
		var self = this;
		//console.log('Communication.preprocessAdd: ', JSON.stringify(model, null, 4));
		return new Promise (function (resolve, reject) {


			if (model.type === 'Invitation') {
				// communications are for updates and invitations at this point.
				// invitations have different defaults than udpates - which are what are the stored defaults
				model.read = ['proponent-lead', 'assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-system-admin'];
				model.write = ['proponent-lead', 'assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'];
				model.delete = ['assessment-admin', 'project-intake', 'assessment-lead', 'project-epd', 'project-system-admin'];
			}

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
		return this.list({project: id},{},{dateSent:-1});
	},

	getForGroup: function (id) {
		return this.list({group: {$in: [id] }});
	},

	deliver: function(model) {
		var emailList = _.filter(model.recipients, function(o) { return o.viaEmail; });
		var recipients = [], to = [], cc = [], bcc = [];
		_.forEach(emailList, function(o) {
			var recip = {name: o.displayName, address: o.email};
			recipients.push(recip);
			switch(o.type) {
				case 'cc':
					cc.push(recip);
					break;
				case 'bcc':
					bcc.push(recip);
					break;
				default:
					to.push(recip);
			}
		});

		if (model.personalized) {
			return EmailController.sendEach(model.subject, '', model.content, recipients).
			then(function(res) {
				model.status = 'Sent';
				model.dateSent = Date.now();
				return model.save();
			}).catch(function(err) {
				//console.log(JSON.stringify(err));
			});
		} else {
			return EmailController.sendAll(model.subject, '', model.content, to, cc, bcc).
			then(function(res) {
				model.status = 'Sent';
				model.dateSent = Date.now();
				return model.save();
			}).catch(function(err) {
				//console.log(JSON.stringify(err));
			});
		}
	},

	deliverInvitation: function(model) {
		var emailList = _.filter(model.recipients, function(o) { return o.viaEmail; });
		var userIds = _.map(emailList, 'userId');
		var recipients = [];
		_.forEach(emailList, function(o) {
			recipients.push({name: o.displayName, address: o.email});
		});

		var invitationController = new InvitationController(this.opts);

		// this should always be personalized...
		if (model.personalized) {
			// get the invitations, or create a new ones...
			// we need to add that to each email...
			return invitationController.findOrCreate(userIds)
				.then(function(invites) {
					var invitationData = [];
					_.forEach(emailList, function(r) {
						var invite = _.find(invites, function(i) { return i.user.toString() === r.userId; });
						invitationData.push({ to: {name: r.displayName, address: r.email}, invitation: invite });
					});
					return EmailController.sendInvitations(model.subject, '', model.content, invitationData);
				})
			.then(function(res) {
				model.status = 'Sent';
				model.dateSent = Date.now();
				return model.save();
			}).catch(function(err) {
				//console.log(JSON.stringify(err));
			});
		}
	}
});
