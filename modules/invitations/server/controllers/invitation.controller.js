'use strict';
// =========================================================================
//
// Controller for invitations
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');
var chalk = require('chalk'),
  mongoose = require('mongoose'),
  Project = mongoose.model('Project'),
  User = mongoose.model('User'),
  Invitation = mongoose.model('Invitation'),
  Role = mongoose.model('Role');


var Roles = require (path.resolve('./modules/roles/server/controllers/role.controller'));

module.exports = DBModel.extend ({
	name : 'Invitation'
});


var findProject = function(req) {
  var projectCode = req.query.p.toLowerCase();
  return new Promise(function (fulfill, reject) {
    Project.findOne({
      code: projectCode
    }).exec(function (error, p) {
      if (error) {
        reject(new Error(error));
      } else if (!p) {
        reject(new Error('findProject: Project not found for code "' +  projectCode + '".'));
      } else {
        fulfill(p);
      }
    });
  });
};

var findUser = function(req) {
  var username = req.query.u.toLowerCase();
  return new Promise(function (fulfill, reject) {
    User.findOne({
      username: username
    }).populate('org').exec(function (error, u) {
      if (error) {
        reject(new Error(error));
      } else if (!u) {
        reject(new Error('findUser: User not found for username "' +  username + '".'));
      } else {
        fulfill(u);
      }
    });
  });
};

var generateInvitation = function(currentUser, project, user, roleCodes) {
  
  return new Promise(function(fulfill, reject) {

    var orgCode = (currentUser && _.includes(currentUser.roles, 'eao')) ? 'eao' : 'pro';
    var roleCodesArray = _.isArray (roleCodes) ? roleCodes : [roleCodes];
    var rolesArray = [];
    _.forEach(roleCodesArray, function(roleCode){
      rolesArray.push(Roles.generateCode(project.code, orgCode, roleCode));
    });

    var invite = new Invitation();
    invite.project = project;
    invite.user = user;
    invite.accepted = undefined;
    invite.roles = rolesArray;
    invite.save(function(error, inv) {
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

module.exports.generate = function(req, res) {
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


