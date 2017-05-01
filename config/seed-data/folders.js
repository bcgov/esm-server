'use strict';

var mongoose 	= require('mongoose');
var Project 	= mongoose.model('Project');
var Folder 		= mongoose.model('Folder');
var _ 			= require('lodash');
var Prom 		= require('promise');
var TreeModel	= require ('tree-model');

module.exports = function () {
	return new Prom (function (resolve, reject) {
		console.log ('Running folder conversion');

		Project.find({}, function (err, projects) {
			console.log("found", projects.length, "projects.");
			if (projects.length > 0) {
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
						p.directoryStructure = 	{
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

						// TODO: This needs to run separately on the host as it is a long running
						// process for large datasets.
						// var parentNodeID = 1;
						// var thePath = node.getPath();
						// if (thePath.length > 1) {
						// 	parentNodeID = thePath[thePath.length-2].model.id;
						// }

						// Folder.create({
						// 	read : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-system-admin'],
						// 	write : ['assessment-admin', 'project-system-admin'],
						// 	delete : ['assessment-admin', 'project-system-admin'],
						// 	displayName: node.model.name,
						// 	directoryID: node.model.id,
						// 	parentID: parentNodeID,
						// 	project: p})
						// .then(function (f) {
						// 	console.log("created:", f._id);
						// 	if (node.model.published === true || node.model.published === undefined) {
						// 		f.publish();
						// 		f.save()
						// 		.then(function (s) {
						// 			console.log("saved:", s._id);
						// 		});
						// 	}
						// });

						return (node.model.published === undefined);
					});
					_.each(nodes, function (n) {
						// Publish it.
						console.log("publishing:", n.model.id);
						n.model.published = true;
					});

					Project.update({_id: p._id}, {$set: { 'directoryStructure': root.model}}, function (err, doc) {
						if (!err) {
							console.log("updated project:", p._id);
						}
					});
				});
			}
		});
	});
};
