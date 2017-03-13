'use strict';

var _                       = require('lodash');
var TreeModel               = require('tree-model');
var MongoClient             = require('mongodb').MongoClient;
var defaultConnectionString = "mongodb://localhost:27017/mean-dev";
var username                = "";
var password                = "";
var host                    = "";
var db                      = "";

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

MongoClient.connect(defaultConnectionString, function (err, db) {
    if (err) {
        console.error(err);
        process.exit(-1);
    }

    var collection = db.collection('projects');
    var c_folders = db.collection('folders');

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
                    c_folders.insertOne(obj, function (o) {
                        console.log("Inserted:", o);
                    });
                });
            });
        }
    });
});
