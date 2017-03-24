'use strict';

var mongoose    = require('mongoose');
var Defaults    = mongoose.model('_Defaults');

module.exports = function () {
    console.log("seeding :Folder Default Conversion");
    return new Promise (function (resolve, reject) {
       var defaultRoles = {
            'sysadmin' : ['proponent-lead', 'project-lead'],
            'project-lead' : ['public', 'proponent-lead', 'project-lead']
        };

        var defaultFolderObj = {
            context: 'project',
            resource: 'folder',
            level: 'global',
            type: 'default-permissions',
            defaults: {
                roles: defaultRoles,
                permissions: {
                    'read' : ['sysadmin', 'team', 'proponent-lead', 'project-lead'],
                    'write' : ['sysadmin'],
                    'delete' : ['sysadmin'],
                    'publish' : ['sysadmin'],
                    'unPublish' : ['sysadmin']
                }
            }
        };

        return Defaults.find({context: 'project', resource: 'folder'})
        .then(function (defaultFolderContext) {
            // console.log("Results of folder defaults:", defaultFolderContext);
            if (defaultFolderContext.length === 0) {
                return Defaults.create(defaultFolderObj)
                .then(function (def) {
                    console.log("Created Default:", def);
                    resolve();
                });
            } else {
                // STUB: We have no purpose yet.
                resolve();
            }
        });
    });
};