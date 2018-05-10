'use strict';
const monk = require('monk');

var url;
if (process.argv[2] && process.argv[2].trim()) {
  url = process.argv[2];
} else {
  throw Error('No mongodb connection url provided!');
}
console.log('\nUsing mongodb connection url: ' + url + '\n');

/**
 * The collections that have been identified as containing arrays of roles, which need to be updated.
 *
 * applications // dont need to run
 * artifacts - read/write/delete
 * collectiondocuments - read/write/delete
 * collections - read/write/delete
 * commentperiods - read/write/delete/vettingRoles/classificationRoles/downloadRoles/commenterRoles
 * comments - read/write/delete
 * communications - read/write/delete
 * documents - read/write/delete/publish/unPublish
 * folders - read/write/delete
 * projectgroups - read/write/delete
 * projects - read/write/delete
 * vcs - read/write/delete
 */
const collectionsToUpdate = [
  'artifacts',
  'collectiondocuments',
  'collections',
  'commentperiods',
  'comments',
  'communications',
  'documents',
  'folders',
  'projectgroups',
  'projects',
  'vcs'
];

/**
 * Array of known properties whose value is an array of roles that needs to be updated.
 */
const keyArray = [
  'delete',
  'write',
  'read',
  'publish',
  'unPublish',
  'vettingRoles',
  'classificationRoles',
  'downloadRoles',
  'commenterRoles'
];

/**
 * Old roles that should be removed wherever found.
 */
var rolesToDelete = [
  'eao',
  'project-technical-working-group',
  'project-working-group',
  'aboriginal-group',
  'minister',
  'minister-office',
  'project-participant',
  'assessment-ceaa',
  'proponent-team',
  'compliance-officer',
  'compliance-lead',
  'project-qa-officer',
  'assistant-dmo',
  'associate-dm',
  'associate-dmo',
  'assistant-dm',
  'testrole'
];

/**
 * A mapping between old roles and new roles.
 * These old roles should be updated to their corresponding new roles wherever found.
 */
var rolesToUpdate = [
  { old: 'sysadmin', new: 'system-admin' },
  { old: 'project-eao-staff', new: 'system-eao' },
  { old: 'proponent', new: 'system-proponent' },
  { old: 'proponent-lead', new: 'project-proponent' },
  { old: 'project-epd', new: 'project-team' },
  { old: 'assessment-lead', new: 'project-team' },
  { old: 'assessment-team', new: 'project-team' },
  { old: 'assessment-admin', new: 'project-admin' }
];

/**
 * Delete records that use old roles.
 * @param String collectionName
 * @param [String] deletes array of roles to delete whenever found.
 */
var deleteOldRoles = function(collectionName, deletes) {
  const db = monk(url);
  const collection = db.get(collectionName, { castIds: true });
  collection.remove({ role: { $in: deletes } }).then(function(data) {
    db.close();
  });
};

/**
 *
 * @param String collectionName
 * @param String field
 * @param [String] updates array of roles to update whenever found.
 */
var updateRoles = function(collectionName, field, updates) {
  updates.forEach(function(pair) {
    var matchQuery = {};
    matchQuery[field] = pair.old;
    var updateQuery = {};
    updateQuery[field] = pair.new;
    const db = monk(url);
    const collection = db.get(collectionName, { castIds: true });
    collection.update(matchQuery, { $set: updateQuery }, { multi: true }).then(function(data) {
      db.close();
    });
  });
};

/**
 * Iterate over the collectionsToUpdate array.
 * For each collection:
 *  - Connect
 *  - Get all records
 *  - Run traverseAndUpdate on each record
 *  - sa the record back into the collection
 *  - Disconnect
 * @param [String] collections an array of collections that contain arrays of roles that need updating.
 * @param [String] keys array of keys whose values are arrays of roles that need updating.
 * @param [String] deletes array of roles to delete whenever found.
 * @param [String] updates array of roles to update whenever found.
 */

var updateRolesArrays = function(collections, keys, deletes, updates) {
  var i;
  for (i = 0; i < collections.length; i++) {
    const db = monk(url);
    const collection = db.get(collections[i], { castIds: true });
    collection
      .find()
      .each(function(record) {
        record = traverseAndUpdateObject(record, keys, deletes, updates);
        collection.update({ _id: record._id }, record);
      })
      .then(function(data) {
        db.close();
      });
  }
};

/**
 * Traverses the object and looks for properties that match the ones in keys.
 * If a matching property is found, and its value is an array, it updates the array.
 * If a property does not match, and is an object, it recurses into that object.
 * If a property does not match, and is not an object or is null, it does nothing to it.
 * @param Object record monk collection record
 * @param [String] keys array of keys whose values are arrays of roles that need updating.
 * @param [String] deletes array of roles to delete whenever found.
 * @param [String] updates array of roles to update whenever found.
 */
var traverseAndUpdateObject = function(record, keys, deletes, updates) {
  const recordKeys = Object.keys(record);
  var i;
  for (i = 0; i < recordKeys.length; i++) {
    const key = recordKeys[i];
    const value = record[key];
    // if key is in the keys and its value is an array
    if (keys.indexOf(key) >= 0 && Array.isArray(value)) {
      // set its value to an updated version of the array
      record[key] = getNewRolesArray(value, deletes, updates);
    } else if (value && typeof value === 'object') {
      // if the value is an object, recurse
      record[key] = traverseAndUpdateObject(value, keys, deletes, updates);
    }
  }
  return record;
};

/**
 * Given a role, checks it against the updates array and returns the new version if a match is found.
 * Returns the original role if no match is found.
 * @param String role the role to update if it has a match in the updates array.
 * @param [String] updates array of roles to update whenever found.
 */
var getNewRole = function(role, updates) {
  var i;
  for (i = 0; i < updates.length; i++) {
    if (role === updates[i].old) {
      return updates[i].new;
    }
  }
  return role;
};

/**
 * Given an array of roles, returns a new array of roles that:
 *  - no longer contains any roles found in the deletes array.
 *  - has had all matching roles found in the updates array updated
 *  - has no duplicates.
 * @param [String] oldRolesArray array of roles to process.
 * @param [String] deletes array of roles to delete whenever found.
 * @param [String] updates array of roles to update whenever found.
 */
var getNewRolesArray = function(oldRolesArray, deletes, updates) {
  var newRolesArray = [];
  var i;
  for (i = 0; i < oldRolesArray.length; i++) {
    var oldRole = oldRolesArray[i];
    // only add the role if it is not found in the
    if (deletes.indexOf(oldRole) === -1) {
      // check if the role has an updated name
      var newRole = getNewRole(oldRole, updates);
      newRolesArray.push(newRole);
    }
  }
  // remove duplicates
  return newRolesArray.filter(function(item, pos) {
    return newRolesArray.indexOf(item) == pos;
  });
};

/**
 * Custom update logic, similar to the above, for the _defaults table due to its unique structure.
 */
var updateDefaultsCollection = function(deletes, updates) {
  const db = monk(url);
  const collection = db.get('_defaults', { castIds: true });

  collection
    .find()
    .each(function(record) {
      if (record.type === 'global-project-roles') {
        var oldRolesArray = record.defaults.roles;
        var newRolesArray = getNewRolesArray(oldRolesArray, deletes, updates);
        collection.update({ _id: record._id }, { $set: { defaults: { roles: newRolesArray } } });
      }

      if (record.type === 'rolePermissions') {
        // Only 1 record of this type exists, so creating this object manually.
        var newRolesPermissionsObj = {
          'application:system-admin': {
            'project-intake': ['createProject'],
            'system-proponent': [
              'listEmailTemplates',
              'listOrganizations',
              'listNews',
              'listRoles',
              'listTemplates',
              'listValuedComponents',
              'listContacts'
            ],
            'system-admin': [
              'listEmailTemplates',
              'listOrganizations',
              'listNews',
              'listRoles',
              'listTemplates',
              'listValuedComponents',
              'listContacts',
              'createEmailTemplate',
              'createOrganization',
              'createNews',
              'createTemplate',
              'createValuedComponent',
              'createContact',
              'createProject',
              'manageRoles',
              'manageCodeLists',
              'managePermissions',
              'addUsersToContext'
            ]
          }
        };
        collection.update({ _id: record._id }, { $set: { defaults: newRolesPermissionsObj } });
      }

      if (record.type === 'default-permissions') {
        var newDefaultsObj = { roles: {}, permissions: {} };

        var keys = Object.keys(record.defaults);
        var i;
        for (i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (key === 'permissions') {
            var oldPermissionsObj = record.defaults.permissions;
            for (var property in oldPermissionsObj) {
              var newArray = getNewRolesArray(oldPermissionsObj[property], deletes, updates);
              newDefaultsObj.permissions[property] = newArray;
            }
          }
          if (key === 'roles') {
            var oldRolesObj = record.defaults.roles;
            for (var property in oldRolesObj) {
              var newArray = getNewRolesArray(oldRolesObj[property], deletes, updates);
              var newRole = getNewRole(property, updates);
              newDefaultsObj.roles[newRole] = newArray;
            }
          }
        }
        var result = collection.update({ _id: record._id }, { $set: { defaults: newDefaultsObj } });
      }
    })
    .then(function(data) {
      db.close();
    });
};

// delete old _roles
deleteOldRoles('_roles', rolesToDelete);

// delete old _permissions
deleteOldRoles('_permissions', rolesToDelete);

// update remaining _roles
updateRoles('_roles', 'role', rolesToUpdate);

// update remaining _permissions
updateRoles('_permissions', 'role', rolesToUpdate);

// update roles arrays
updateRolesArrays(collectionsToUpdate, keyArray, rolesToDelete, rolesToUpdate);

// update roles in _defaults collection
updateDefaultsCollection(rolesToDelete, rolesToUpdate);
