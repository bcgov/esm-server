'use strict';

var _                       = require('lodash');
var TreeModel               = require('tree-model');
var MongoClient             = require('mongodb').MongoClient;
var defaultConnectionString = "mongodb://localhost:27017/esm-master";
var username                = "";
var password                = "";
var host                    = "";
var db                      = "";

var defaultPerms = {
    unPublish : [
        "assessment-admin",
        "assessment-lead",
        "assessment-team",
        "project-epd",
        "project-system-admin"
    ],
    publish : [
        "assessment-admin",
        "assessment-lead",
        "assessment-team",
        "project-epd",
        "project-system-admin"
    ],
    delete : [
        "assessment-admin",
        "project-intake",
        "assessment-lead",
        "assessment-team",
        "project-epd",
        "project-system-admin"
    ],
    write : [
        "assessment-admin",
        "project-intake",
        "assessment-lead",
        "assessment-team",
        "project-epd",
        "project-system-admin"
    ],
    read : [
        "assessment-admin",
        "project-intake",
        "assessment-lead",
        "assessment-team",
        "assistant-dm",
        "project-epd",
        "assistant-dmo",
        "associate-dm",
        "associate-dmo",
        "compliance-lead",
        "compliance-officer",
        "project-system-admin"
    ]
};

console.log("Starting migration.");

var args = process.argv.slice(2);
if (args.length !== 4) {
    console.log("Using default localhost connection:", defaultConnectionString);
} else {
    username = args[0];
    password = args[1];
    host = args[2];
    db = args[3];
    defaultConnectionString = "mongodb://" + username + ":" + password + "@" + host + ":27017/" + db;
}

var permissionList = function(dflt, resource, isPublished) {
    var permissions = _.keys(dflt.defaults.permissions);
    //console.log('permissions ', JSON.stringify(permissions, null, 4));
    var result = [];
    _.each(permissions, function(p) {
        _.each(dflt.defaults.permissions[p], function(r) {
            result.push({resource: resource, permission: p, role: r});
        });
    });
    if (isPublished) {
        result.push({resource: resource, permission: 'read', role: 'public'});
    }
    //console.log('permissionList ', JSON.stringify(result, null, 4));
    return result;
};

MongoClient.connect(defaultConnectionString, function (err, db) {
    if (err) {
        console.error(err);
        process.exit(-1);
    }

    var collection = db.collection('projects');
    var c_folders = db.collection('folders');
    var _perms = db.collection('_permissions');

    collection.find({},{}).toArray(function (err, projects) {
        console.log("found", projects.length, "projects.");
        if (projects && projects.length > 0) {
            // Migrate
            console.log("ensuring published = true on folders that don't have anything specified.");

            // Go through the directory structure and if found element that doesn't have property published:
            // then give it to it, and assign public as a default since all folders currently created are
            // public.
            _.each(projects, function (p) {
                console.log("doing:", p._id);
                var tree = new TreeModel();
                if (p.directoryStructure === null) {
                    // It's null, and lets bake in the default:
                    p.directoryStructure =  {
                        id: 1,
                        lastId: 1,
                        name: 'ROOT',
                        published: true
                    };
                }
                var root = tree.parse(p.directoryStructure);
                var nodes = root.all(function (node) {
                    if (node.model.published === undefined) {
                        console.log("Node does not have published property:", node.model.id);
                    }

                    var parentNodeID = 1;
                    var thePath = node.getPath();
                    if (thePath.length > 1) {
                        parentNodeID = thePath[thePath.length-2].model.id;
                    }

                    var obj = {};
                    if (node.model.published === true || node.model.published === undefined) {
                        obj = {
                            _schemaName: "Folder",
                            __v: 1,
                            userCan : {
                                unPublish : false,
                                publish : false,
                                delete : false,
                                write : false,
                                read : false
                            },
                            addedBy : null,
                            keywords : [],
                            order : 0,
                            updatedBy : null,
                            dateUpdated : null,
                            dateAdded : null,
                            description : "",
                            read : ['public', 'assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-system-admin'],
                            write : ['assessment-admin', 'project-system-admin'],
                            delete : ['assessment-admin', 'project-system-admin'],
                            displayName: node.model.name,
                            directoryID: node.model.id,
                            parentID: parentNodeID,
                            isPublished: true,
                            project: p._id
                        };
                    } else {
                        obj = {
                            _schemaName: "Folder",
                            __v: 1,
                            userCan : {
                                unPublish : false,
                                publish : false,
                                delete : false,
                                write : false,
                                read : false
                                },
                            addedBy : null,
                            keywords : [],
                            order : 0,
                            updatedBy : null,
                            dateUpdated : null,
                            dateAdded : null,
                            description : "",
                            read : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-system-admin'],
                            write : ['assessment-admin', 'project-system-admin'],
                            delete : ['assessment-admin', 'project-system-admin'],
                            displayName: node.model.name,
                            directoryID: node.model.id,
                            parentID: parentNodeID,
                            project: p._id
                        };
                    }
                    c_folders.insertOne(obj)
                    .then(function (o) {
                        // console.log("Inserted:", o.ops[0]._id);
                        var entries = [];
                        var result = [];
                        _.each(defaultPerms, function (p) {
                            _.each(defaultPerms[p], function (r) {
                                result.push({resource: o.insertedId.toString(), permission: p, role: r});
                            });
                        });
                        if (o.ops[0].isPublished) {
                            console.log("published.");
                            result.push({resource: o.insertedId.toString(), permission: 'read', role: 'public'});
                        }
                        _.each(result, function (item) {
                            _perms.insertOne(item)
                            .then(function (z) {
                                console.log("Perm Inserted:", z.insertedId);
                            });
                        });
                    })
                });
            });
        }
    });
});
