'use strict';

var MongoClient = require('mongodb').MongoClient;
var Promise     = require('promise');
var _           = require('lodash');

var defaultConnectionString = 'mongodb://localhost:27017/mean-dev';
var username                = '';
var password                = '';
var host                    = '';
var db                      = '';
var url                     = '';

var args = process.argv.slice(2);
if (args.length < 4) {
	console.log('using default localhost connection:', defaultConnectionString);
	url       = defaultConnectionString;
} else {
	username   = args[0];
	password   = args[1];
	host       = args[2];
	db         = args[3];
	url        = 'mongodb://' + username + ':' + password + '@' + host + ':27017/' + db;
}

var getProjects = function(db) {
	return new Promise(function(resolve, reject) {
		db.collection('projects').find().toArray(function(err, object) {
			if (err) {
				console.log('x failed to find projects');
				reject(err);
			} else {
				console.log(': found ' + object.length + ' projects');
				resolve(object);
			}
		});
	});
};

var scanProject = function(db, project, index) {
	return new Promise(function(resolve, reject) {
		// Get root-level folders for this project.
		console.log(': scanning project ' + index + ' - ' + project.name + '...');
		db.collection('folders').find({ project: project._id, parentID: 1 }).toArray(function(err, folders) {
			if (err) {
				console.log('x failed to find folders');
				reject(err);
			} else {
				// Don't count the root directory.
				var promises = [];
				folders.forEach(function(folder) {
					// Skip the root directory.
					if (folder.directoryID != 1) {
						// Scan the folders
						promises.push(function() { return scanFolder(db, project.name + ' > ' + folder.displayName, folder, !folder.isPublished); });
					}
				});
				promiseAllSync(promises).then(function() {
					resolve();
				});
			}
		});
	});
};

var scanFolder = function(db, path, folder, unpublishedPath) {
	return new Promise(function(resolve, reject) {
		// Drill down into sub folders
		getChildFolders(db, path + ' > ' + folder.displayName, folder)
			.then(function(folders) {
				var promises = [];
				folders.forEach(function(folder) {
					if (unpublishedPath && folder.isPublished) {
						console.log('!!! Published folder in unpublished path: ' + path + ' > ' + folder.displayName);
					}
					// Scan the sub folder
					promises.push(function() { return scanFolder(db, path + ' > ' + folder.displayName, folder, unpublishedPath || !folder.isPublished); });
				});
				return promiseAllSync(promises);
			})
			.then(function() {
				if (unpublishedPath) {
					// Look for published documents in this unpublished path
					getChildPublishedDocuments(db, path, folder)
						.then(function(docs) {
							docs.forEach(function(doc) {
								console.log('!!! Published document in unpublished path: ' + path + ' > ' + doc.displayName);
							});
							resolve();
					 	});
				} else {
					resolve();
				}
			}).catch(function (error) {
				console.error('x error ', error);
				reject(error);
			});
	});
};

var getChildFolders = function(db, path, folder) {
	return new Promise(function(resolve, reject) {
		db.collection('folders').find({ project: folder.project, parentID: folder.directoryID }).toArray(function(err, folders) {
			if (err) {
				console.log('x failed while finding folders for ' + path);
				reject(err);
			} else {
				resolve(folders);
			}
		});
	});
};

var getChildPublishedDocuments = function(db, path, folder) {
	return new Promise(function(resolve, reject) {
		db.collection('documents').find({ project: folder.project, directoryID: folder.directoryID, isPublished: true }).toArray(function(err, docs) {
			if (err) {
				console.log('x failed while finding published documents for ' + path);
				reject(err);
			} else {
				resolve(docs);
			}
		});
	});
};

var promiseAllSync = function(promises) {
	var chain = Promise.resolve();
	promises.forEach(function(promise) {
		chain = chain.then(promise);
	});
	return chain;
};

var run = function () {
	var database = null;
	return new Promise(function (resolve, reject) {
		console.log('start');
		MongoClient.connect(url)
			.then(function(db) {
				console.log(': db connected');
				return db;
			})
			.then(function(db) {
				database = db;
				console.log(': getting projects');
				return getProjects(database);
			})
			.then(function(projects) {
				var promises = [];
				projects.forEach(function(project, index) {
					promises.push(function() { return scanProject(database, project, index + 1); });
				});
				return promiseAllSync(promises);
			})
			.then(function(data) {
				console.log('end');
				resolve(':)');
			}, function (err) {
				console.log('ERROR: end err = ', JSON.stringify(err));
				reject(err);
			});
	});
};

run().then(function(success) {
	console.log('success ', success);
	process.exit();
}).catch(function (error) {
	console.error('error ', error);
	process.exit();
});
