'use strict';
// =========================================================================
//
// Controller for invitations
//
// =========================================================================
var path = require('path');
var DBModel = require(path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var Roles = require(path.resolve('./modules/roles/server/controllers/role.controller'));
var email = require(path.resolve('./modules/core/server/controllers/email.server.controller'));

var _ = require('lodash'),
  config = require(path.resolve('./config/config')),
  mongoose = require('mongoose'),
  Project = mongoose.model('Project'),
  User = mongoose.model('User'),
  Invitation = mongoose.model('Invitation'),
  Role = mongoose.model('Role');


var getProject = function(id) {
  return new Promise(function (fulfill, reject) {
    Project.findOne({
      _id: id
    }).exec(function (error, p) {
      if (error) {
        reject(new Error(error));
      } else if (!p) {
        reject(new Error('Project not found.'));
      } else {
        fulfill(p);
      }
    });
  });
};

var getProjectFromRole = function (role) {
  return getProject(role.projects[0]);
};

var getUsersByIds = function (ids) {
  return new Promise(function (fulfill, reject) {
    var userIdArray = _.isArray(ids) ? ids : [ids];
    var q = {'_id': {$in: userIdArray}};

    User.find(q).populate('org').exec(function (err, users) {
      if (err) {
        reject(err);
      } else if (!users) {
        reject(new Error('Failed to load Users: ' + userIdArray.toString()));
      } else {
        fulfill(users);
      }
    });
  });
};

var getAllInvitations = function (project, users) {
	return new Promise(function (fulfill, reject) {
		Invitation.find({user: {$in: users}, project: project}).exec(function (err, invitations) {
			if (err) {
				reject(err);
			} else if (!invitations) {
				reject(new Error('Failed to load Invitations for users in project : "' + project.name + '".'));
			} else {
				fulfill(invitations);
			}
		});
	});
};


var getInvitation = function (id) {
	return new Promise(function (fulfill, reject) {
		Invitation.findOne({_id: id.toString()}).populate('project').populate('user').exec(function (err, invitations) {
			if (err) {
				reject(err);
			} else if (!invitations) {
				reject(new Error('Failed to find Invitation'));
			} else {
				fulfill(invitations);
			}
		});
	});
};

var acceptInvitation = function(invite) {
	return new Promise(function(fulfill, reject) {
		if (invite.accepted !== undefined) {
			// already accepted, just carry on...
			fulfill(invite);
		} else {
			invite.accepted = new Date();
			invite.save(function (error, inv) {
				if (error) {
					reject(new Error(error));
				} else if (!inv) {
					reject(new Error('Invitation not accepted.'));
				} else {
					fulfill(inv);
				}
			});
		}
	});
};

module.exports = DBModel.extend({
  name: 'Invitation',

  createProjectInvitations: function (project, users) {
    var self = this;
    var a = users.map(function (user) {
      var invite = new self.model();

      invite.project = project;
      invite.user = user;
      invite.accepted = undefined;
      return self.create(invite);
    });
    return Promise.all(a);
  },

  deleteProjectInvitations: function (invitations) {
    var self = this;
    var a = invitations.map(function (invite) {
      return self.deleteDocument(invite);
    });
    return Promise.all(a);
  },

  findProjectInvitations: function (project, users) {
    var self = this;
    var q = {user: {$in: users}, project: project};
    return self.findMany(q);
  },

  handleInvitations: function (req, role, users) {
    var self = this;
    return new Promise(function (fulfill, reject) {
      var allUserIds, assignedUserIds, addedUserIds, droppedUserIds, project, allUsers, existingInvitations;
			
			var userIds = _.map(users, function (u) {
				return u._id.toString();
			});
			
			var inviteeRoles = [];

      if (role.isSystem) {
        // system role, we don't worry about invitations then.
        return fulfill({role: role, users: userIds});
      } else {
        assignedUserIds = role.users.map(function (o) {
          return o.toString();
        });
        addedUserIds = _.difference(userIds, assignedUserIds);
        droppedUserIds = _.difference(assignedUserIds, userIds);
        allUserIds = [].concat(assignedUserIds).concat(addedUserIds).concat(droppedUserIds);

        return getUsersByIds(allUserIds)
          .then(function (result) {
            allUsers = result;
            return getProjectFromRole(role);
          })
          .then(function (result) {
            project = result;
						// figure out the invitation that this current user will assign people to
						// which invitee role????
						if (req.user.orgCode && req.user.orgCode === 'eao') {
							inviteeRoles.push(project.eaoInviteeRole); // make this inviteeRoles[0] - the one we want to assign to
							inviteeRoles.push(project.proponentInviteeRole);
						} else {
							inviteeRoles.push(project.proponentInviteeRole); // make this inviteeRoles[0] - the one we want to assign to
							inviteeRoles.push(project.eaoInviteeRole); //
						}
						return getAllInvitations(project, allUsers);
          })
          .then(function (result) {
            existingInvitations = result;
            var unacceptedInvitations = _.filter(existingInvitations, function (i) {
              return i.accepted === undefined;
            });

            var addedUsers = _.filter(allUsers, function (u) {
              return _.includes(addedUserIds, u._id.toString());
            });

            var droppedUsers = _.filter(allUsers, function (u) {
              return _.includes(droppedUserIds, u._id.toString());
            });

            var toAssignUsers = _.filter(allUsers, function (u) {
              return _.includes(userIds, u._id.toString());
            });

            // check addedUsers... if they don't have an (unaccepted) invitation, they need one.
            var createInvitationsForUsers = [];
            _.each(addedUsers, function (u) {
              if (_.size(unacceptedInvitations) === 0 || _.find(unacceptedInvitations, function (i) {
                  return i.user.toString() === u._id.toString();
                }) === undefined) {
                createInvitationsForUsers.push(u);
              }
            });

            // if a dropped user has no other roles (or only the invitee role), then we need to drop remove their invite.
            var deleteInvitationsForUsers = [];
            _.each(droppedUsers, function (u) {
							var usersProjectRoles = _.filter(u.roles, function(r) {
								return r.projectCode === project.code;
							});
							var usersNonInviteeRoles = _.without(usersProjectRoles, inviteeRoles[0],inviteeRoles[1]);
							if (_.size(usersNonInviteeRoles) <=1 ) {
								// only have this role, or invitation roles, so delete the invitations and this role
								deleteInvitationsForUsers.push(u);
							}
            });

            self.createProjectInvitations(project, createInvitationsForUsers)
              .then(function (data) {
                if (!_.includes(inviteeRoles, role.code)) {
                  return Roles.userRoles({
                    method: 'add',
                    users: createInvitationsForUsers,
                    roles: [inviteeRoles[0]]
                  });
                } else {
                  // we will be added to the invitee role by the role controller...
                  return userIds;
                }
              })
              .then(function (data) {
								// remove from both invitee roles, just in case...
                return Roles.userRoles({
                  method: 'remove',
                  users: deleteInvitationsForUsers,
                  roles: [project.proponentInviteeRole,project.eaoInviteeRole]
                });
              })
              .then(function (data) {
                return self.findProjectInvitations(project, deleteInvitationsForUsers);
              })
              .then(function (invitations) {
                return self.deleteProjectInvitations(invitations);
              })
              .then(function (data) {
                // add this role to the users that need them...
                return Roles.userRoles({method: 'add', users: toAssignUsers, roles: [role.code]});
              })
              .then(function (data) {
                // if we were dropped from the invitee role specifically, then we shouldn't be in any roles...
                if (role.code === project.proponentInviteeRole || role.code === project.eaoInviteeRole) {
                  // make sure that they never signed in...
                  var removeFromProjectUsers = _.filter(droppedUsers, function (u) {
                    return _.isEmpty(u.userGuid);
                  });
                  return Roles.userRoles({method: 'remove', users: removeFromProjectUsers, roles: project.roles});
                } else {
                  // remove this role from the users no longer being assigned to the role.
                  return Roles.userRoles({method: 'remove', users: droppedUsers, roles: [role.code]});
                }
              })
              .then(function (data) {
                return fulfill({project: project, role: role, users: userIds});
              });
          });
      }
    });
  },
  
  sendInvitations: function(req) {
    var invitationData = req.body;
    var currentUser = req.user;
    
    return new Promise(function(fulfill, reject) {
      // load project
      // load users
      // find project invitations for users
      // create package for emailer....
      // subject, content, from user, array of template data (to user, to user invitation, project meta data)
      var project;
      var users;
      var invitations;

      return getProject(invitationData.projectId)
        .then(function(p) {
          project = p;
          return getUsersByIds(invitationData.userIds);
        })
        .then(function(u) {
          users = u;
          return getAllInvitations(project, users);
        })
        .then(function(inv) {
          invitations = inv;
          var templateData = [];
          _.each(users, function(u) {
            var invitation = _.find(invitations, function (i) {
              return i.user.toString() === u._id.toString();
            });
            if (invitation !== undefined) {
              templateData.push({
                appTitle: config.app.title,
                appDescription: config.app.description,
                toUserId: u._id.toString(),
                toDisplayName: u.displayName || u.username || u.email,
                toEmail: u.email,
                invitationUrl: invitationData.url.replace(/\/$/, "") + '/authentication/accept/' + invitation._id.toString(),
                projectName: project.name,
                projectTitle: project.name,
                projectCode: project.code
              });
            }
          });
          return email.populateAndSend(invitationData.subject, invitationData.content, templateData, currentUser);
        })
        .then (function(data){
          // ok, examine the returned data, mark each user with success of not...
          return fulfill(data);
        });
    });
  },

	acceptInvitation: function(req) {
		// find invitation
		// remove user from that project's invitation role
		// add the system user role
		// may add in an idir role?
		var invitation;
		
		return new Promise(function(fulfill, reject) {
			return getInvitation(req.params.token)
				.then(function(inv) {
					invitation = inv;
					return acceptInvitation(invitation);
				})
				.then(function(data) {
					// since they have accepted, remove them from the project invitee role...
					return Roles.userRoles({
						method: 'remove',
						users: invitation.user,
						roles: [invitation.project.eaoInviteeRole, invitation.project.proponentInviteeRole]
					});				
				})
				.then(function(data) {
					// make sure they are in the user role...
					return Roles.userRoles({
						method: 'add',
						users: invitation.user,
						roles: ['user']
					});
				})
				.then(function(data) {
					return fulfill(invitation);
				});
		});
	}
});


