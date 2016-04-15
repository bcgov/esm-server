'use strict';
// =========================================================================
//
// Controller for invitations
//
// =========================================================================
var path = require('path');
var DBModel = require(path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));

var _ = require('lodash');
var chalk = require('chalk'),
  mongoose = require('mongoose'),
  Project = mongoose.model('Project'),
  User = mongoose.model('User'),
  Invitation = mongoose.model('Invitation'),
  Role = mongoose.model('Role');


var Roles = require(path.resolve('./modules/roles/server/controllers/role.controller'));

var getProjectFromRole = function (role) {
  return new Promise(function (fulfill, reject) {
    Project.findOne({
      _id: role.projects[0]
    }).exec(function (error, p) {
      if (error) {
        reject(new Error(error));
      } else if (!p) {
        reject(new Error('Project not found for role "' + role.code + '".'));
      } else {
        fulfill(p);
      }
    });
  });
};

var findProject = function (req) {
  var projectCode = req.query.p.toLowerCase();
  return new Promise(function (fulfill, reject) {
    Project.findOne({
      code: projectCode
    }).exec(function (error, p) {
      if (error) {
        reject(new Error(error));
      } else if (!p) {
        reject(new Error('findProject: Project not found for code "' + projectCode + '".'));
      } else {
        fulfill(p);
      }
    });
  });
};

var findUser = function (req) {
  var username = req.query.u.toLowerCase();
  return new Promise(function (fulfill, reject) {
    User.findOne({
      username: username
    }).populate('org').exec(function (error, u) {
      if (error) {
        reject(new Error(error));
      } else if (!u) {
        reject(new Error('findUser: User not found for username "' + username + '".'));
      } else {
        fulfill(u);
      }
    });
  });
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

var doCreateInvitations = function (project, role, users, sender) {
  var a = users.map(function (user) {
    return new Promise(function (fulfill, reject) {

      var invite = new Invitation();
      invite.project = project;
      invite.user = user;
      invite.accepted = undefined;
      invite.roles = [role];
      invite.save(function (error, inv) {
        if (error) {
          reject(new Error('Could not save invitation.  ' + error.message));
        } else if (!inv) {
          reject(new Error('Could not save invite.'));
        } else {
          fulfill(inv);
        }
      });
    });
  });
  return Promise.all(a);
};

var generateInvitation = function (currentUser, project, user, roleCodes) {

  return new Promise(function (fulfill, reject) {

    var orgCode = (currentUser && _.includes(currentUser.roles, 'eao')) ? 'eao' : 'pro';
    var roleCodesArray = _.isArray(roleCodes) ? roleCodes : [roleCodes];
    var rolesArray = [];
    _.forEach(roleCodesArray, function (roleCode) {
      rolesArray.push(Roles.generateCode(project.code, orgCode, roleCode));
    });

    var invite = new Invitation();
    invite.project = project;
    invite.user = user;
    invite.accepted = undefined;
    invite.roles = rolesArray;
    invite.save(function (error, inv) {
      if (error) {
        reject(new Error('Could not save invitation.  ' + error.message));
      } else if (!inv) {
        reject(new Error('generateInvitation: Could not save invite.'));
      } else {
        fulfill(inv);
      }
    });
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

  handleInvitations: function (req, role, userIds) {
    var self = this;
    return new Promise(function (fulfill, reject) {
      var allUserIds, assignedUserIds, addedUserIds, droppedUserIds, project, allUsers, existingInvitations;

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
              if ((role.code === project.inviteeRole) || ((_.size(u.roles) === 2 && _.includes(u.roles, project.inviteeRole)) || (_.size(u.roles) === 1))) {
                deleteInvitationsForUsers.push(u);
              }
            });

            self.createProjectInvitations(project, createInvitationsForUsers)
              .then(function (data) {
                if (role.code !== project.inviteeRole) {
                  return Roles.userRoles({
                    method: 'add',
                    users: createInvitationsForUsers,
                    roles: [project.inviteeRole]
                  });
                } else {
                  // we will be added to the invitee role by the role controller...
                  return userIds;
                }
              })
              .then(function (data) {
                return Roles.userRoles({
                  method: 'remove',
                  users: deleteInvitationsForUsers,
                  roles: [project.inviteeRole]
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
                if (role.code === project.inviteeRole) {
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
  }
});

module.exports.generate = function (req, res) {
  // this is just so i can try out and test accepting an invite...
  // this will not be in prod.
  var project, user;
  findProject(req)
    .then(function (p) {
      project = p;
      return findUser(req);
    })
    .then(function (u) {
      user = u;
      return generateInvitation(req.user, project, user, req.query.r);
    })
    .then(function (inv) {
      res.send(JSON.stringify({token: inv._id}));
    })
    .catch(function (err) {
      console.error(chalk.red('Error: handleRsvp(): ' + err.message));
      // should we do something differently here?
      res.send(JSON.stringify(err));
    });
};

module.exports.createInvitations = function (project, role, userIds, sender) {
  // for each user - do they have the role? return them
  // - do they have an unaccepted invitation for the project/role? - create an invite
  return new Promise(function (fulfill, reject) {
    var allUsers = [];
    var roleUsers = [];
    var nonRoleUsers = [];
    var nonRoleUsersWithoutInvitation = [];
    getUsersByIds(userIds)
      .then(function (userlist) {

        var partUsers = _.partition(userlist, function (u) {
          return _.includes(u.roles, role.code);
        });
        allUsers = userlist;
        roleUsers = partUsers[0];
        nonRoleUsers = (_.size(partUsers) === 2) ? partUsers[1] : [];
        return getAllInvitations(project, role.code, nonRoleUsers);
      })
      .then(function (invs) {
        var allInvitations = _.flatten(invs);
        // ok, any user that has an unnaccepted invite doesn't need a new one...
        _.each(nonRoleUsers, function (u) {
          var myInvitations = _.filter(allInvitations, function (i) {
            return i.user.toString() === u._id.toString();
          });
          if (_.size(myInvitations) === 0) {
            nonRoleUsersWithoutInvitation.push(u);
          } else {

            var myUnacceptedInvitations = _.filter(myInvitations, function (i) {
              return i.accepted === undefined;
            });
            if (_.size(myUnacceptedInvitations) === 0) {
              nonRoleUsersWithoutInvitation.push(u);
            }
          }
        });
        return doCreateInvitations(project, role.code, nonRoleUsersWithoutInvitation, sender);
      })
      .then(function () {
        return fulfill(roleUsers);
      });
  });
};


