'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var Promise = require('Promise');
var _ = require('lodash');
var path = require('path');

var _URL = 'mongodb://localhost/esm';
var _PERIOD = '58a78c4d67c58c1fe391ac5b';//'58a4c6b3c9ef5008c9512c96';
var _COUNT = 1000; //10000;


var findOne = function(url, collectionName, query, fields) {
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

var find = function(url, collectionName, query, fields) {
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

var lastComment = function(url, period) {
	return new Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {

			var collection = db.collection('comments');
			var options = {
				limit: 1,
				sort: { commentId: -1 }
			};
			collection.findOne({ period: ObjectID(period) }, options, function(err, doc) {
				if (err) reject(err);
				db.close();
				resolve(doc);
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
			console.log('executed bulkInsert batch ', batchesExecuted, ' of ', _.size(batches));
			// re-initialise batch operation
			if (err) console.log('bulkInsert: ', JSON.stringify(err));
			bulk = collection.initializeOrderedBulkOp();
			if (result) {
				console.log('bulkInsert result.ok ', result.ok);
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

var insertAll = function(url, collectionName, entries) {
	if (_.isEmpty(entries)) {
		return Promise.resolve();
	}
	return new Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {
			// this has it's own bulk operations handling
			bulkInsert(db, collectionName, entries, function(res) {
				if (res.ok) {
					db.close();
					resolve('ok');
				}
			});
		});
	});
};

var run = function() {

	var url = _URL;
	var period = _PERIOD;
	var count = _COUNT;

	process.argv.forEach(function (val, index, array) {
		if (_.startsWith(val, 'url=')) {
			url = val.split('=')[1];
		}
		if (_.startsWith(val, 'period=')) {
			period = val.split('=')[1];
		}
		if (_.startsWith(val, 'count=')) {
			count = val.split('=')[1];
		}
	});

	var randomIntFromInterval = function(min,max)
	{
		return Math.floor(Math.random()*(max-min+1)+min);
	};

	var getRandomCollection = function(collection) {
		var count  = randomIntFromInterval(1, _.size(collection));
		return collection.slice(0, count);
	};
	var getRandomItemCollection = function(collection) {
		var index  = randomIntFromInterval(1, _.size(collection));
		return collection[index-1];
	};

	return new Promise(function(resolve, reject) {

		console.log('start');
		console.log('url = ', url);
		console.log('period = ', period);
		console.log('count = ', count);

		var commentPeriod, recentComment, commentId;
		var vcs, docs, users;

		var topics = ["Air quality", "Birds", "Rare plants", "Wetlands", "Labour force", "Odour", "Heritage resources"];
		var pillars = ["Environment", "Economic", "Social", "Heritage"];
		var eaoStatus = ["Unvetted", "Deferred", "Published", "Rejected"];
		var proponentStatus = ["Classified", ""];
		var dates = _.map([1,2,3,4,5,6,7], function(i) {
			return new Date((new Date()).valueOf() - 1000*60*60*24*i);
		});

		findOne(url, 'commentperiods', {_id: ObjectID(period)})
			.then(function(data) {
				commentPeriod = data;
				return lastComment(url, commentPeriod._id);
			})
			.then(function(data) {
				recentComment = data;
				commentId = recentComment ? recentComment.commentId + 1 : 1;
				return find(url, 'vcs', {project: commentPeriod.project});
			})
			.then(function(data) {
				vcs = data;
				return find(url, 'documents', {project: commentPeriod.project, isPublished: true});
			})
			.then(function(data) {
				docs = data;
				return find(url, 'users', {});
			})
			.then(function(data) {
				users = data;
				return;
			})
			.then(function() {
				// generate count comments, starting with commentId.
				var comments = [];
				var i;
				for(i = 0; i < count; i++){
					var _vcs = getRandomCollection(vcs);
					var _vcids = _.map(_vcs, function(o) {
						return o._id;
					});
					var _topics = _.map(_vcs, function(o) { return o.title; });
					var _pillars = _.uniq(_.map(_vcs, function(o) { return o.pillar; }));
					var _docs = _.map(getRandomCollection(docs), function(o) {
						return o._id;
					});
					var _user = getRandomItemCollection(users)._id;
					var _eaoStatus =  getRandomItemCollection(eaoStatus);
					var _isPublished = _eaoStatus === 'Published';

					var _read = [
						"project-system-admin",
						"proponent-lead",
						"proponent-team",
						"assessment-admin",
						"project-eao-staff",
						"assessment-lead",
						"assessment-team",
						"assistant-dm",
						"project-epd",
						"assistant-dmo",
						"associate-dm",
						"associate-dmo",
						"compliance-lead",
						"compliance-officer",
						"project-working-group",
						"project-technical-working-group"
					];
					if (_isPublished) _read.push('public');

					var comment = {
						"commentId" :commentId,
						"_schemaName" : "Comment",
						"userCan" : {
							"delete" : true,
							"write" : true,
							"read" : true
						},
						"isPublished" : _isPublished,
						"delete" : [
							"assessment-lead",
							"assessment-team",
							"project-epd",
							"project-system-admin"
						],
						"write" : [
							"project-system-admin",
							"assessment-lead",
							"assessment-team",
							"project-epd"
						],
						"read" : [
							"public",
							"project-system-admin",
							"proponent-lead",
							"proponent-team",
							"assessment-admin",
							"project-eao-staff",
							"assessment-lead",
							"assessment-team",
							"assistant-dm",
							"project-epd",
							"assistant-dmo",
							"associate-dm",
							"associate-dmo",
							"compliance-lead",
							"compliance-officer",
							"project-working-group",
							"project-technical-working-group"
						],
						"updatedBy" : getRandomItemCollection(users)._id,
						"addedBy" : getRandomItemCollection(users)._id,
						"dateUpdated" : getRandomItemCollection(dates),
						"dateAdded" : getRandomItemCollection(dates),
						"response" : null,
						"resolvedNotes" : "",
						"resolvedBy" : null,
						"isResolved" : false,
						"proponentNotes" : "",
						"proponentStatus" : getRandomItemCollection(proponentStatus),
						"publishedNotes" : "Publish Notes " + commentId,
						"rejectedReason" : "Personally Identifying Information",
						"rejectedNotes" : "Rejection Note " + commentId,
						"eaoNotes" : "Deferral Note " + commentId,
						"eaoStatus" : _eaoStatus,
						"location" : "Location " + commentId,
						"isAnonymous" : Math.random() >= 0.5,
						"author" : "Author " + commentId,
						"topics" : _topics,
						"pillars" : _pillars,
						"valuedComponents" : _vcids,
						"documents" : _docs,
						"comment" : "Comment " + commentId,
						"original" : null,
						"ancestor" : null,
						"parent" : null,
						"period" : commentPeriod._id,
						"project" : commentPeriod.project
					};
					comments.push(comment);
					commentId++;
				}
				return comments;
			})
			.then(function(data) {
				return insertAll(url, 'comments', data);
			})
			.then(function(data) {
				resolve(data);
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