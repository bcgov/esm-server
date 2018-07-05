'use strict';

var mongoose = require('mongoose');
var Defaults = mongoose.model('_Defaults');
var promise = require('promise');

module.exports = function () {
  var defaultsArray = [];

  var defaultRoles = {
    'project-system-admin': ['project-proponent', 'project-admin', 'system-eao', 'project-intake', 'project-team', 'project-system-admin', 'public'],
  };

  // DEFAULT PROJECT
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'project',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'addUsersToContext': ['project-admin', 'project-intake', 'project-team', 'project-system-admin', 'system-admin'],
        'createRole': ['project-system-admin'],
        'managePermissions': ['project-system-admin'],
        'manageRoles': ['project-admin', 'project-intake', 'project-team', 'project-system-admin', 'system-admin'],
        'listContacts': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'viewTombstone': ['project-proponent', 'project-admin', 'system-eao', 'project-intake', 'project-team', 'project-system-admin'],
        'viewEAOTombstone': ['project-admin', 'system-eao', 'project-intake', 'project-team', 'project-system-admin'],
        'editTombstone': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'listArtifacts': ['project-proponent', 'project-admin', 'system-eao', 'project-intake', 'project-team', 'project-system-admin'],
        'listValuedComponents': ['public', 'project-proponent', 'project-admin', 'system-eao', 'project-team', 'project-system-admin'],
        'listInspectionReports': ['project-system-admin'],
        'listProjectConditions': ['project-proponent', 'project-admin', 'system-eao', 'project-team', 'project-system-admin'],
        'listProjectComplaints': ['project-system-admin'],
        'listProjectInvitations': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'listDocuments': ['public', 'project-proponent', 'project-admin', 'system-eao', 'project-intake', 'project-team', 'project-system-admin'],
        'listCommentPeriods': ['public', 'project-proponent', 'project-admin', 'system-eao', 'project-team', 'project-system-admin'],
        'listEnforcements': ['project-system-admin'],
        'listProjectUpdates': ['project-admin', 'project-team', 'project-system-admin'],
        'listProjectGroups': ['project-admin', 'system-eao', 'project-team', 'project-system-admin'],
        'viewSchedule': ['project-proponent', 'project-admin', 'system-eao', 'project-intake', 'project-team', 'project-system-admin'],
        'editSchedule': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'createArtifact': ['project-proponent', 'project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'createValuedComponent': ['project-proponent', 'project-team', 'project-system-admin'],
        'createInspectionReport': ['project-system-admin'],
        'createProjectCondition': ['project-proponent', 'project-team', 'project-system-admin'],
        'createProjectComplaint': ['project-system-admin'],
        'createProjectInvitation': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'createDocument': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'createCommentPeriod': ['project-team', 'project-system-admin'],
        'createEnforcement': ['project-system-admin'],
        'createProjectUpdate': ['project-admin', 'project-team', 'project-system-admin'],
        'createProjectGroup': ['project-team', 'project-system-admin'],
        'read': ['project-proponent', 'project-admin', 'system-eao', 'project-intake', 'project-team', 'project-system-admin'],
        'write': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'delete': ['project-system-admin', 'project-intake'],
        'publish': ['project-admin', 'project-team', 'project-system-admin'],
        'unPublish': ['project-admin', 'project-team', 'project-system-admin'],
        'manageFolders': ['project-admin', 'project-team', 'project-system-admin'],
        'manageDocumentPermissions': ['project-system-admin']
      }
    }
  }));

  // ACTIVTIES AND UPDATES
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'activity',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-system-admin'],
        'write': ['project-system-admin'],
        'delete': ['project-system-admin'],
        'publish': ['project-system-admin'],
        'unPublish': ['project-system-admin']
      }
    }
  }));

  // ARTIFACTS
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'artifact',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': [
          'project-proponent',
          'project-admin',
          'system-eao',
          'project-intake',
          'project-team',
          'project-system-admin'
        ],
        'write': [
          'project-proponent',
          'project-admin',
          'project-intake',
          'project-team',
          'project-system-admin'
        ],
        'delete': [
          'project-admin',
          'project-intake',
          'project-team',
          'project-system-admin'
        ],
        'publish': ['project-admin'],
        'unPublish': ['project-admin']
      }
    }
  }));

  // COMMUNICATION
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'communication',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-proponent', 'project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'write': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'delete': ['project-admin', 'project-team', 'project-system-admin']
      }
    }
  }));

  // CONDITIONS
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'condition',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['system-admin'],
        'write': ['system-admin'],
        'delete': ['system-admin']
      }
    }
  }));

  // DOCUMENTS
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'document',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'write': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'delete': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'publish': ['project-admin', 'project-team', 'project-system-admin'],
        'unPublish': ['project-admin', 'project-team', 'project-system-admin']
      }
    }
  }));

  // COLLECTIONS
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'collection',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'write': ['project-admin', 'project-system-admin'],
        'delete': ['project-admin', 'project-system-admin'],
        'publish': ['project-admin', 'project-system-admin'],
        'unPublish': ['project-admin', 'project-system-admin']
      }
    }
  }));

  // COLLECTION DOCUMENTS
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'collectiondocument',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'write': ['project-admin', 'project-system-admin'],
        'delete': ['project-admin', 'project-system-admin'],
        'publish': ['project-admin', 'project-system-admin'],
        'unPublish': ['project-admin', 'project-system-admin']
      }
    }
  }));

  // PROJECT FOLDERS (DOCUMENTS)
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'folder',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-admin', 'project-intake', 'project-team', 'project-system-admin'],
        'write': ['project-admin', 'project-team', 'project-system-admin'],
        'delete': ['project-admin', 'project-system-admin'],
        'publish': ['project-admin', 'project-system-admin'],
        'unPublish': ['project-admin', 'project-system-admin']
      }
    }
  }));

  // PROJECT GROUPS
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'projectgroup',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-admin', 'system-eao', 'project-intake', 'project-team', 'project-system-admin'],
        'write': ['project-admin', 'project-team', 'project-system-admin'],
        'delete': ['project-admin', 'project-team', 'project-system-admin']
      }
    }
  }));

  // INSPECTION REPORT
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'inspectionreport',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-system-admin'],
        'write': ['project-system-admin'],
        'delete': ['project-system-admin'],
        'publish': ['project-system-admin'],
        'unPublish': ['project-system-admin']
      }
    }
  }));

  // INSPECTION REPORT DETAILS
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'inspectionreportdetail',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-system-admin'],
        'write': ['project-system-admin'],
        'delete': ['project-system-admin'],
        'publish': ['project-system-admin'],
        'unPublish': ['project-system-admin']
      }
    }
  }));

  // COMMENT
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'comment',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-proponent', 'project-admin', 'system-eao', 'project-team', 'project-system-admin'],
        'write': ['project-team', 'project-system-admin'],
        'delete': ['project-team', 'project-system-admin'],
        'publish': ['project-team', 'project-system-admin'],
        'unPublish': ['project-team', 'project-system-admin']
      }
    }
  }));

  // COMMENT PERIOD
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'commentperiod',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-proponent', 'project-admin', 'system-eao', 'project-team', 'project-system-admin'],
        'write': ['project-team', 'project-system-admin'],
        'delete': ['project-team', 'project-system-admin'],
        'publish': ['project-team', 'project-system-admin'],
        'unPublish': ['project-team', 'project-system-admin']
      }
    }
  }));

  // COMPLAINTS
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'complaint',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-system-admin'],
        'write': ['project-system-admin'],
        'delete': ['project-system-admin']
      }
    }
  }));

  // PROJECT CONDITIONS
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'projectcondition',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-proponent', 'project-admin', 'system-eao', 'project-team', 'project-system-admin'],
        'write': ['project-proponent', 'project-team', 'project-system-admin'],
        'delete': ['project-team', 'project-system-admin'],
        'publish': ['project-team', 'project-system-admin'],
        'unPublish': ['project-team', 'project-system-admin']
      }
    }
  }));

  // INSPECTION REPORTS
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'ir',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-system-admin'],
        'write': ['project-system-admin'],
        'delete': ['project-system-admin'],
        'publish': ['project-system-admin'],
        'unPublish': ['project-system-admin']
      }
    }
  }));

  // VALUED COMPONENTS
  defaultsArray.push(new Defaults({
    context: 'project',
    resource: 'vc',
    level: 'global',
    type: 'default-permissions',
    defaults: {
      roles: defaultRoles,
      permissions: {
        'read': ['project-proponent', 'project-admin', 'system-eao', 'project-team', 'project-system-admin'],
        'write': ['project-proponent', 'project-team', 'project-system-admin'],
        'delete': ['project-team', 'project-system-admin'],
        'publish': ['project-team', 'project-system-admin'],
        'unPublish': ['project-team', 'project-system-admin']
      }
    }
  }));

  // DEFAULT APPLICATION PERMISSIONS
  defaultsArray.push(new Defaults({
    context: 'application',
    resource: 'application',
    level: 'global',
    type: 'default-permissions',
    //
    // this goes owner, role, permissions
    //
    defaults: {
      roles: {
        'system-admin': ['system-admin', 'system-proponent', 'project-intake', 'system-eao']
      },
      permissions: {
        'listConditions': ['system-admin'],
        'listEmailTemplates': ['system-admin'],
        'listOrganizations': ['system-admin'],
        'listNews': ['system-admin'],
        'listRoles': ['system-admin'],
        'listTemplates': ['system-admin'],
        'listValuedComponents': ['system-admin'],
        'listContacts': ['system-admin'],
        'createProject': ['system-admin', 'project-intake'],
        'createCondition': ['system-admin'],
        'createEmailTemplate': ['system-admin'],
        'createOrganization': ['system-admin'],
        'createNews': ['system-admin'],
        'createRole': [], // jsherman - 2016-09-01 - don't want anyone to create new system level roles at this time. locking down roles and permissions so we don't have to worry about adding new defaults to a new role.
        'createTemplate': ['system-admin'],
        'createValuedComponent': ['system-admin'],
        'createContact': ['system-admin'],
        'manageRoles': ['system-admin'],
        'manageCodeLists': ['system-admin'],
        'managePermissions': ['system-admin'],
        'addUsersToContext': ['system-admin']
      }
    }
  }));

  // APPLICATION
  defaultsArray.push(new Defaults({
    context: 'application',
    resource: 'application',
    level: 'global',
    type: 'rolePermissions',
    //
    // this goes owner, role, permissions
    //
    defaults: {
      'application:system-admin': {
        'system-admin': [
          //'listConditions',
          'listEmailTemplates',
          'listOrganizations',
          'listNews',
          'listRoles',
          'listTemplates',
          'listValuedComponents',
          'listContacts',
          //'createCondition',
          'createEmailTemplate',
          'createOrganization',
          'createNews',
          //'createRole',
          'createTemplate',
          'createValuedComponent',
          'createContact',
          'createProject',
          'manageRoles',
          'manageCodeLists',
          'managePermissions',
          'addUsersToContext'
        ],
        'system-proponent': [
          //'listConditions',
          'listEmailTemplates',
          'listOrganizations',
          'listNews',
          'listRoles',
          'listTemplates',
          'listValuedComponents',
          'listContacts'
        ],
        'project-intake': ['createProject']
      }
    }
  }));

  // APPLICATION
  defaultsArray.push(new Defaults({
    context: 'application',
    resource: 'application',
    level: 'global',
    type: 'global-project-roles',
    defaults: {
      'roles': ['project-intake', 'system-eao']
    }
  }));

  //
  //
  //  Do the work...
  //  Delete all existing defaults first, then add in all the ones above.
  //
  //
  return new promise(function (resolve, reject) {
    Defaults.remove({}, function (err, removed) {
      if (err) {
        console.log('Error deleting defaults: ' + JSON.stringify(err)); // eslint-disable-line
        reject(new Error(err));
      } else {
        console.log('Deleted exiting defaults: ' + JSON.stringify(removed)); // eslint-disable-line
        resolve(removed);
      }
    });
  }).then(function () {
    console.log('Defaults deleted, starting permission seeding...'); // eslint-disable-line
    return promise.all(defaultsArray.map(function (d) {
      return new promise(function (resolve, reject) {
        d.save(function (err) {
          if (err) {
            console.log('Error adding default: context=' + d.context + ', resource=' + d.resource + ', type=' + d.type + ': ' + JSON.stringify(err)); // eslint-disable-line
            reject(new Error(err));
          } else {
            console.log('Default saved. _id=' + d._id + ', context=' + d.context + ', resource=' + d.resource + ', type=' + d.type); // eslint-disable-line
            resolve(d);
          }
        });
      });
    }));
  }).then(function (/* test */) {
    console.log('Default permission seeding done.'); // eslint-disable-line
  });
};
