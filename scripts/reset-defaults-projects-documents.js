'use strict';

var MongoClient = require('mongodb').MongoClient;
var Promise = require('Promise');
var _ = require('lodash');
var path = require('path');
// var resetdefaults = require(path.resolve('reset-defaults-collection'));

var url = 'mongodb://localhost/mem-dev';

var convertDefaults = function(dflt) {
	var obj = {
		read: dflt.defaults.permissions.read,
		write: dflt.defaults.permissions.write,
		delete: dflt.defaults.permissions.delete,
		userCan: {}
	};
	_.each(_.keys(dflt.defaults.permissions), function(p) {
		obj.userCan[p] = false;
	});
	//if (dflt.defaults.permissions.publish) {
	//	obj.publish = dflt.defaults.permissions.publish;
	//	obj.unPublish = dflt.defaults.permissions.unPublish;
	//}
	//console.log('convertDefaults ', JSON.stringify(obj, null, 4));
	return obj;
};

var projectRoleOwners = function(dflt) {
	return _.keys(dflt.defaults.roles);
};

var roleList = function(dflt, resource) {
	var roleowners = projectRoleOwners(dflt);
	//console.log('roles owners', JSON.stringify(roleowners, null, 4));
	var result = [];
	_.each(roleowners, function(o) {
		_.each(dflt.defaults.roles[o], function(r) {
			result.push({context: resource, user: null, owner: o, role: r});
		});
	});
	//console.log('roleList ', JSON.stringify(result, null, 4));
	return result;
};

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


var find = function(collectionName, query, fields) {
	return new Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {

			var collection = db.collection(collectionName);

			collection.find(query, fields).toArray(function(err, docs) {
				if (err) reject(err);
				db.close();
				resolve(docs);
			});

		});
	});
};

var findOne = function(collectionName, query) {
	return new Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {

			var collection = db.collection(collectionName);

			collection.findOne(query, function(err, docs) {
				if (err) reject(err);
				db.close();
				resolve(docs);
			});

		});
	});
};

var remove = function(collectionName, query) {
	return new Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {

			var collection = db.collection(collectionName);

			collection.remove(query, function(err, numberOfRemovedDocs) {
				if (err) reject(err);
				db.close();
				console.log('removed ' + numberOfRemovedDocs + ' from ' + collectionName);
				resolve(numberOfRemovedDocs);
			});

		});
	});
};

var update = function(collectionName, query, doc) {
	return new Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {

			var collection = db.collection(collectionName);

			collection.update(query, {$set: doc} , {multi: true}, function(err, numberUpdated) {
				if (err) reject(err);
				db.close();
				console.log('updated result' + numberUpdated + ' from ' + collectionName);
				resolve(numberUpdated);
			});

		});
	});
};

var bulkInsert = function(db, collectionName, entries, callback) {

	// Get the collection and bulk api artefacts
	var collection = db.collection(collectionName),
		bulk = collection.initializeOrderedBulkOp();// Initialize the Ordered Batch

	var chunk_size = 1000;
	var arr = entries;
	var batches = arr.map( function(e,i){
		return i%chunk_size===0 ? arr.slice(i,i+chunk_size) : null;
	}).filter(function(e){ return e; });

	var batchesExecuted = 0;

	_.each(batches, function(b) {
		_.each(b, function(obj) {
			//console.log('insert ', JSON.stringify(obj));
			bulk.find(obj).upsert().replaceOne(obj);
		});

		// Execute the operation
		//console.log('insert execute');
		bulk.execute({w:1}, function(err, result) {
			batchesExecuted++;
			//console.log('executed bulkInsert batch ', batchesExecuted, ' of ', _.size(batches));
			// re-initialise batch operation
			if (err) console.log('bulkInsert: ', JSON.stringify(err));
			bulk = collection.initializeOrderedBulkOp();
			if (result) {
				//console.log('bulkInsert result.ok ', result.ok);
				//console.log('bulkInsert result.nInserted ', result.nInserted);
				//console.log('bulkInsert result.nUpserted ', result.nUpserted);
				//console.log('bulkInsert result.nMatched ', result.nMatched);
				//console.log('bulkInsert result.nModified ', result.nModified);
				//console.log('bulkInsert result.nRemoved ', result.nRemoved);
				if (batchesExecuted === _.size(batches)){
					callback(result);
				}
			}
		});

	});
};


var bulkRemove = function(db, collectionName, entries, callback) {

	// Get the collection and bulk api artefacts
	var collection = db.collection(collectionName),
		bulk = collection.initializeOrderedBulkOp();// Initialize the Ordered Batch

	var chunk_size = 1000;
	var arr = entries;
	var batches = arr.map( function(e,i){
		return i%chunk_size===0 ? arr.slice(i,i+chunk_size) : null;
	}).filter(function(e){ return e; });

	var batchesExecuted = 0;

	_.each(batches, function(b) {
		_.each(b, function(obj) {
			//console.log('remove ', JSON.stringify(obj));
			bulk.find(obj).remove(obj);
		});

		// Execute the operation
		//console.log('remove execute');
		bulk.execute({w:1}, function(err, result) {
			batchesExecuted++;
			//console.log('executed bulkRemove batch ', batchesExecuted, ' of ', _.size(batches));
			// re-initialise batch operation
			if (err) console.log('bulkRemove: ', JSON.stringify(err));
			bulk = collection.initializeOrderedBulkOp();
			if (result) {
				//console.log('bulkRemove result.ok ', result.ok);
				//console.log('bulkRemove result.nInserted ', result.nInserted);
				//console.log('bulkRemove result.nUpserted ', result.nUpserted);
				//console.log('bulkRemove result.nMatched ', result.nMatched);
				//console.log('bulkRemove result.nModified ', result.nModified);
				//console.log('bulkRemove result.nRemoved ', result.nRemoved);
				if (batchesExecuted === _.size(batches)){
					callback(result);
				}
			}
		});

	});
};

var insertAll = function(collectionName, entries) {
	if (_.isEmpty(entries)) {
		return Promise.resolve();
	}
	return new Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {
			// this has it's own bulk operations handling
			bulkInsert(db, collectionName, entries, function(res) {
				if (res.ok) {
					db.close();
					resolve();
				}
			});
		});
	});
};

var removeAll = function(collectionName, entries) {
	if (_.isEmpty(entries)) {
		return Promise.resolve();
	}
	return new Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {
			// this has it's own bulk operations handling
			bulkRemove(db, collectionName, entries, function(res) {
				if (res.ok) {
					db.close();
					resolve();
				}
			});
		});
	});
};

var run = function() {
	return new Promise(function (resolve, reject) {

		var projectDefaults, projectTemplate, projects;
		var documentDefaults, documentTemplate, documents;
		console.log('start');
		Promise.resolve()
			.then(function() {
				console.log('1 - get project default roles and permissions');
				return findOne('_defaults', {context: 'project', resource: 'project', type: 'default-permissions'});
			})
			.then(function(data) {
				console.log('2 - convert defaults, get projects');
				//console.log('2 data = ', JSON.stringify(data));
				//console.log('projectDefaults defaults ', JSON.stringify(data, null, 4));
				projectDefaults = data;
				projectTemplate = convertDefaults(projectDefaults);
				return find('projects', {}, {'_id' :1, 'isPublished' : 1});;
			})
			.then(function(data) {
				projects = data;
				console.log('found ' + _.size(projects) + ' projects');
				return projects;
			})
			.then(function() {
				console.log('3 - remove project roles');
				//console.log('3 data = ', JSON.stringify(data));
				return remove('_roles', {context: {$ne: 'application'}, user: null });
			})
			.then(function(data) {
				console.log('4 - add project roles');
				//console.log('4 data = ', JSON.stringify(data));
				var entries = [];
				_.each(projects, function(d) {
					var arr = roleList(projectDefaults, d._id.toString());
					_.each(arr, function(a) {
						entries.push(a);
					});
				});

				console.log('roles to insert: ', _.size(entries));
				return insertAll('_roles', entries);
			})
			.then(function(data) {
				console.log('5 - remove project permissions');
				//console.log('5 data = ', JSON.stringify(data));

				var entries = _.map(projects, function(d) {
					return {resource: d._id.toString()};
				});

				//console.log('projects to remove permissions: ', _.size(entries));
				return removeAll('_permissions', entries);
			})
			.then(function(data) {
				console.log('6 - add project permissions');
				//console.log('6 data = ', JSON.stringify(data));
				var entries = [];
				_.each(projects, function(d) {
					var arr = permissionList(projectDefaults, d._id.toString(), d.isPublished);
					_.each(arr, function(a) {
						entries.push(a);
					});
				});
				console.log('permissions to insert: ', _.size(entries));
				return insertAll('_permissions', entries);
			})
			.then(function(data) {
				console.log('7 - update unpublished projects');
				//console.log('7 data = ', JSON.stringify(data));
				return update('projects', {isPublished: false}, projectTemplate);
			})
			.then(function(data) {
				console.log('8 - update published projects');
				//console.log('8 data = ', JSON.stringify(data));
				projectTemplate.read.push('public');
				return update('projects', {isPublished: true}, projectTemplate);
			})
			//
			// Documents
			//
			.then(function() {
				console.log('9 - get document default roles and permissions');
				return findOne('_defaults', {context: 'project', resource: 'document', type: 'default-permissions'});
			})
			.then(function(data) {
				console.log('10 - convert defaults, get documents');
				//console.log('10 data = ', JSON.stringify(data));
				documentDefaults = data;
				documentTemplate = convertDefaults(documentDefaults);
				return find('documents', {}, {'_id' :1, 'isPublished' : 1});
			})
			.then(function(data) {
				documents = data;
				console.log('found ' + _.size(documents) + ' documents.');
				return documents
			})
			.then(function(data) {
				console.log('11 - remove document permissions');
				//console.log('11 data = ', JSON.stringify(data));

				var entries = _.map(documents, function(d) {
					return {resource: d._id.toString()};
				});

				//console.log('projects to remove permissions: ', _.size(entries));
				return removeAll('_permissions', entries);
			})
			.then(function(data) {
				console.log('12 - add document permissions');
				//console.log('12 data = ', JSON.stringify(data));
				var entries = [];
				_.each(documents, function(d) {
					var arr = permissionList(documentDefaults, d._id.toString(), d.isPublished);
					_.each(arr, function(a) {
						entries.push(a);
					});
				});
				console.log('permissions to insert: ', _.size(entries));
				return insertAll('_permissions', entries);
			})
			.then(function(data) {
				console.log('13 - update unpublished documents');
				//console.log('13 data = ', JSON.stringify(data));
				return update('documents', {isPublished: false}, documentTemplate);
			})
			.then(function(data) {
				console.log('14 - update published documents');
				//console.log('14 data = ', JSON.stringify(data));
				documentTemplate.read.push('public');
				return update('documents', {isPublished: true}, documentTemplate);
			})
			.then(function(data) {
				console.log('end');
				//console.log('end data = ', JSON.stringify(data));
				resolve(':)');
			}, function(err) {
				console.log('ERROR: end');
				console.log('ERROR: end err = ', JSON.stringify(err));
				reject(err);
			});


	});
};


run()
	.then(function(success) {
		console.log('success ', success);
		process.exit();
	})
	.catch(function(error) {
		console.error('error ', error);
		process.exit();
	});

