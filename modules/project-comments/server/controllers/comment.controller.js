'use strict';
// =========================================================================
//
// Controller for comments
//
// =========================================================================
var path     = require('path');
var Access    = require (path.resolve ('./modules/core/server/controllers/core.access.controller'));
var Period    = require ('./commentperiod.controller');
var DBModel   = require (path.resolve ('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');
// var Roles = require (path.resolve('./modules/roles/server/controllers/role.controller'));
var DocumentClass  = require (path.resolve('./modules/documents/server/controllers/core.document.controller'));
var mongoose = require('mongoose');

module.exports = DBModel.extend ({
	name : 'Comment',
	plural: 'comments',
	// populate : [{ path:'user', select:'_id displayName username orgCode'}, {path: 'valuedComponents', select: 'name'}],
	populate : [{ path:'user', select:'_id displayName username email orgName'},
				{ path:'updatedBy', select:'_id displayName username email orgName'},
				{ path:'documents', select:'_id eaoStatus'}],
	// -------------------------------------------------------------------------
	//
	// since public users may be saving comments we should temprarily allow
	// them permision to do so
	//
	// -------------------------------------------------------------------------
	preprocessAdd: function (comment) {
		// this.setForce (true);
		var self = this;
		var commentPeriod = new Period(this.opts);
		var documentClass = new DocumentClass(this.opts);
		return new Promise(function (resolve, reject) {
			//
			// get the period info
			//
			/*
			 'read' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
			 'write' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
			 'delete' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
			 'publish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
			 'unPublish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']

			 */
			commentPeriod.findById(comment.period)
				.then(function (period) {
					console.log('period = ' + JSON.stringify(period, null, 4));
					//
					// ROLES
					//
					return self.setModelPermissions(comment, {
						read: period.vettingRoles,
						delete: ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
						write: _.uniq(_.concat(period.commenterRoles, period.vettingRoles, period.classificationRoles, ['assessment-lead', 'assessment-team', 'project-epd', 'project-working-group', 'project-technical-working-group', 'project-system-admin']))
					});
				})
				.then(function (commentPermissions) {
					//console.log('commentPermissions = ' + JSON.stringify(commentPermissions, null, 4));
					// get all the associated documents and update their permissions as required.
					return new Promise(function (resolve, reject) {
						var q = {_id : {$in : comment.documents }};
						documentClass.listforaccess ('i do not want to limit my access because public people add comments with docs too.', q)
							.then(function (data) {
								resolve({commentPermissions: commentPermissions, docs: data});
							});
					});
				})
				.then(function (data) {
					//console.log('data = ' + JSON.stringify(data, null, 4));
					var commentPermissions = data.commentPermissions;
					var docs = data.docs;
					return docs.reduce(function (current, doc, index) {
						// not publishing, but changing the permissions to match the comment
						return new Promise(function (resolve, reject) {
							documentClass.setModelPermissions(doc, commentPermissions)
								.then(function () {
									return doc.save();
								}).then(resolve, reject);
						});
					}, Promise.resolve());
				})
				.then(function() {
					// get the max commentId for the period...
					return new Promise(function(resolve, reject) {
						self.model
						.find({period : comment.period})
						.sort({commentId : -1})
						.limit(1).exec(function(err, maxResult) {
							if (maxResult && maxResult.length === 1) {
								var commentId = _.isFinite(maxResult[0].commentId) ?  maxResult[0].commentId + 1 : 1;
								resolve(commentId);
							} else if(!err) {
								resolve(1);
							} else {
								reject(new Error(err));
							}
						});
					});
				})
			.then(function(cId) {
					comment.commentId = _.isFinite(cId) ? cId : 1; // just check again... make sure this is a number.
					return comment;
				})
				.then(resolve, reject);
		});
	},

	getPublishedCommentsForPeriod : function (periodId) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany ({
				period : periodId,
				isPublished: true
			})
			.then (resolve, reject);
		});
	},
	getAllCommentsForPeriod : function (periodId) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany ({
				period : periodId
			})
				.then (resolve, reject);
		});
	},
	getEAOCommentsForPeriod : function (periodId) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany ({
				period : periodId,
			})
			.then (function (data) {
				var ret = {
					totalPending  : 0,
					totalDeferred : 0,
					totalPublic   : 0,
					totalRejected : 0,
					totalAssigned : 0,
					totalUnassigned : 0,
					data          : data
				};
				data.reduce (function (prev, next) {
					ret.totalPending  += (next.eaoStatus === 'Unvetted' ? 1 : 0);
					ret.totalDeferred += (next.eaoStatus === 'Deferred' ? 1 : 0);
					ret.totalPublic   += (next.eaoStatus === 'Published' ? 1 : 0);
					ret.totalRejected += (next.eaoStatus === 'Rejected' ? 1 : 0);
					ret.totalAssigned += (next.proponentStatus === 'Classified' ? 1 : 0);
					ret.totalUnassigned += (next.proponentStatus !== 'Classified' ? 1 : 0);
				}, ret);
				resolve (ret);
			})
			.catch (reject);
		});
	},
	getProponentCommentsForPeriod : function (periodId) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.getPublishedCommentsForPeriod (periodId)
			.then (function (data) {
				var classified = data.reduce (function (prev, next) {
					return prev + (next.proponentStatus === 'Classified' ? 1 : 0);
				}, 0);
				resolve ({
					data: data,
					totalAssigned : classified,
					totalUnassigned : data.length - classified
				});
			})
			.catch (reject);
		});
	},
	getCommentsForPeriod: function(periodId, eaoStatus, proponentStatus, isPublished,
								   commentId, authorComment, location, pillar, topic,
								   start, limit, sortby) {
		var self = this;

		var query = {period: periodId};
		var filterByFields = {};

		// base query...
		if (isPublished !== undefined) {
			query = _.extend({}, query, {isPublished: isPublished});
		}
		if (eaoStatus !== undefined) {
			query = _.extend({}, query, {eaoStatus: eaoStatus});
		}
		if (proponentStatus !== undefined) {
			if ('Classified' === proponentStatus) {
				query = _.extend({}, query, {proponentStatus: 'Classified'});
			} else {
				query = _.extend({}, query, {proponentStatus: {$ne: 'Classified'} });
			}
		}

		// filer by fields...
		if (commentId !== undefined) {
			filterByFields = _.extend({}, filterByFields, {commentId: commentId});
		}
		if (authorComment !== undefined) {
			var authorCommentRe = new RegExp(authorComment, "i");
			filterByFields = _.extend({}, filterByFields, { $or: [{author: authorCommentRe}, {comment: authorCommentRe}] } );
		}
		if (location !== undefined) {
			var locationRe = new RegExp(location, "i");
			filterByFields = _.extend({}, filterByFields, {location: locationRe});
		}
		if (pillar !== undefined) {
			filterByFields = _.extend({}, filterByFields, {pillars: {$in: [pillar] }});
		}
		if (topic !== undefined) {
			filterByFields = _.extend({}, filterByFields, {topics: {$in: [topic] }});
		}

		var fields = null;
		var populate = null;
		var userCan = false;

		return self.paginate(query, filterByFields, start, limit, fields, populate, sortby, userCan);
	},
	// -------------------------------------------------------------------------
	//
	// pass in the target type (Project Description, Document, AIR, etc)
	// and its Id (all as taken from the period or wherever you came from)
	// and the type of comments you are looking for (public, wg, ciaa, etc)
	// and this will return an array of conversations, sorted chronologically
	// with the internal messages in conversations also sorted the same
	//
	// -------------------------------------------------------------------------
	getCommentsForTarget : function (targetType, targetId, commentType) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany ({
				targetType : targetType,
				target     : targetId,
				type       : commentType
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// resolve entire chain and return it
	//
	// -------------------------------------------------------------------------
	resolveCommentChain: function (ancestorId) {
		var self = this;
		var query = { ancestor: ancestorId };
		var update = { resolved: true };
		var promise = self.model.update (query, update, {multi: true}).exec();
		return new Promise (function (resolve, reject) {
			promise.then (function () {
				return self.getCommentChain (ancestorId);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// publish/unpublish entire chain and return it
	//
	// -------------------------------------------------------------------------
	publishCommentChain: function (ancestorId, value) {
		var self = this;
		var query = { ancestor: ancestorId };
		var update;
		if (value) {
			update = {
				published: true,
				$addToSet: {read: 'public'}
			};
		} else {
			update = {
				published: false,
				$pull: {read: 'public'}
			};
		}
		var promise = self.model.update (query, update, {multi: true}).exec();
		return new Promise (function (resolve, reject) {
			promise.then (function () {
				return self.getCommentChain (ancestorId);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// return entire chain
	//
	// -------------------------------------------------------------------------
	getCommentChain: function (ancestorId) {
		return this.findMany ({ ancestor: ancestorId });
	},
	getCommentDocuments: function(id) {
		var self = this;
		var doc = new DocumentClass (this.opts);
		return new Promise (function (resolve, reject) {
			self.one({_id : id})
				.then(function(c) {
					return doc.getList(c.documents);
				})
				.then (resolve, reject);
		});
	},
	bulkDeletePermissions: function(items) {
		var self = this;

		var _BATCH_SIZE = 1000;

		var PermissionModel = mongoose.model('_Permission');

		return new Promise(function(rs, rj) {

			var bulk = PermissionModel.collection.initializeOrderedBulkOp();

			var chunk_size = _BATCH_SIZE;
			var arr = items;
			var batches = arr.map( function(e,i){
				return i%chunk_size===0 ? arr.slice(i,i+chunk_size) : null;
			}).filter(function(e){ return e; });

			var batchesExecuted = 0;

			_.each(batches, function(b) {
				_.each(b, function(obj) {
					//console.log('obj = ', JSON.stringify(obj));
					bulk.find({ resource: obj._id.toString(), permission: {$in: ['read', 'write', 'delete']} }).remove();
				});

				// Execute the operation
				//console.log('insert execute');
				bulk.execute({w:1}, function(err, result) {
					batchesExecuted++;
					//console.log('executed bulkDeletePermissions batch ', batchesExecuted, ' of ', _.size(batches));
					if (err) {
						//console.log('bulkDeletePermissions: ', JSON.stringify(err));
						rj(err);
					}
					// re-initialise batch operation
					bulk = PermissionModel.collection.initializeOrderedBulkOp();
					if (result) {
						//console.log('bulkDeletePermissions result.ok ', result.ok);
						if (batchesExecuted === _.size(batches)){
							rs(result);
						}
					}
				});

			});
			if (_.size(items) === 0) {
				rs();
			}
		});
	},

	bulkInsertPermissions: function(items) {
		var self = this;

		var _BATCH_SIZE = 1000;

		var PermissionModel = mongoose.model('_Permission');

		return new Promise(function(rs, rj) {

		var bulk = PermissionModel.collection.initializeOrderedBulkOp();

		var chunk_size = _BATCH_SIZE;
		var arr = items;
		var batches = arr.map( function(e,i){
			return i%chunk_size===0 ? arr.slice(i,i+chunk_size) : null;
		}).filter(function(e){ return e; });

		var batchesExecuted = 0;

		_.each(batches, function(b) {
			_.each(b, function(obj) {
				//console.log('obj = ', JSON.stringify(obj));
				bulk.find(obj).upsert().replaceOne(obj);
			});

			// Execute the operation
			//console.log('insert execute');
			bulk.execute({w:1}, function(err, result) {
				batchesExecuted++;
				//console.log('executed bulkInsertPermissions batch ', batchesExecuted, ' of ', _.size(batches));
				if (err) {
					//console.log('bulkInsertPermissions: ', JSON.stringify(err));
					rj(err);
				}
				// re-initialise batch operation
				bulk = PermissionModel.collection.initializeOrderedBulkOp();
				if (result) {
					//console.log('bulkInsertPermissions result.ok ', result.ok);
					if (batchesExecuted === _.size(batches)){
						rs(result);
					}
				}
			});

		});
		if (_.size(items) === 0) {
			rs();
		}
	});
},

	permsList: function(items, readRoles, writeRoles, deleteRoles) {
	var perms = [];

	_.each(items, function(item) {
		_.each(readRoles, function(r) {
			perms.push({resource: item._id.toString(), permission: 'read', role: r});
		});
		_.each(writeRoles, function(r) {
			perms.push({resource: item._id.toString(), permission: 'write', role: r});
		});
		_.each(deleteRoles, function(r) {
			perms.push({resource: item._id.toString(), permission: 'delete', role: r});
		});
	});

	return perms;
},

	syncUnclassifiedComments: function(period, comment) {
		var self = this;

		var _BATCH_SIZE = 1000;

		var CommentModel = mongoose.model('Comment');

		var updateUnclassified = function(commentPeriod, comment) {
			return new Promise(function(res, rej) {

				var findComments = function() {
					if (comment) {
						return new Promise(function(rs, rj) {
							CommentModel.find({ $and: [
									{ _id: comment._id },
									{ valuedComponents: { $size: 0 }},
									{ proponentStatus: {$ne: 'Unclassified'} }
								] }, '_id',
								function (err, data){
									if (err) {
										rj(err);
									} else {
										rs(data);
									}
								});
						});
					} else {
						return new Promise(function(rs, rj) {
							CommentModel.find({ $and: [
									{ period: commentPeriod._id },
									{ valuedComponents: { $size: 0 }},
									{ proponentStatus: {$ne: 'Unclassified'} }
								] }, '_id',
								function (err, data){
									if (err) {
										rj(err);
									} else {
										rs(data);
									}
								});
						});
					}
				};

				var bulkUpdate = function(items) {
					return new Promise(function(rs, rj) {

						var bulk = CommentModel.collection.initializeOrderedBulkOp();

						var chunk_size = _BATCH_SIZE;
						var arr = items;
						var batches = arr.map( function(e,i){
							return i%chunk_size===0 ? arr.slice(i,i+chunk_size) : null;
						}).filter(function(e){ return e; });

						var batchesExecuted = 0;

						_.each(batches, function(b) {
							_.each(b, function(obj) {
								//console.log('obj = ', JSON.stringify(obj));
								bulk.find({ _id: obj._id }).updateOne({ $set: { proponentStatus: 'Unclassified' } });
							});

							// Execute the operation
							//console.log('insert execute');
							bulk.execute({w:1}, function(err, result) {
								batchesExecuted++;
								//console.log('executed bulkUpdate batch ', batchesExecuted, ' of ', _.size(batches));
								if (err) {
									console.log('bulkUpdate: ', JSON.stringify(err));
									rj(err);
								}
								// re-initialise batch operation
								bulk = CommentModel.collection.initializeOrderedBulkOp();
								if (result) {
									//console.log('bulkUpdate result.ok ', result.ok);
									if (batchesExecuted === _.size(batches)){
										rs(result);
									}
								}
							});

						});
						if (_.size(items) === 0) {
							rs();
						}
					});
				};

				findComments()
					.then(function(comments) {
						//console.log('Comments that need proponent status update: ', _.size(comments));
						return bulkUpdate(comments);
					})
					.then(function() {
						//console.log('done');
						res();
					}, function(err) {
						console.log(JSON.stringify(err));
						rej(err);
					});
			});
		};

		return new Promise(function(resolve, reject) {
			updateUnclassified(period, comment)
				.then(function() {
					resolve();
				}, function(err) {
					console.log(JSON.stringify(err));
					reject(err);
				});
		});
	},

	syncPermissionsPublishedComments: function(period, comment) {
		var self = this;

		var _BATCH_SIZE = 1000;

		var CommentModel = mongoose.model('Comment');

		var updatePublished = function(commentPeriod, comment) {
			return new Promise(function (res, rej) {

				var _comments;
				// permissions for reading published comments...
				var readRoles = _.uniq(_.concat(commentPeriod.read, 'public'));

				var findComments = function() {
					if (comment) {
						return new Promise(function(rs, rj) {
							CommentModel.find({ $and: [
									{ _id: comment._id},
									{ eaoStatus: { $eq: 'Published' }}
								] }, '_id',
								function (err, data){
									if (err) {
										rj(err);
									} else {
										rs(data);
									}
								});
						});

					} else {
						return new Promise(function(rs, rj) {
							CommentModel.find({ $and: [
									{ period: commentPeriod._id },
									{ eaoStatus: { $eq: 'Published' }}
								] }, '_id',
								function (err, data){
									if (err) {
										rj(err);
									} else {
										rs(data);
									}
								});
						});
					}
				};

				var bulkUpdate = function(items) {
					return new Promise(function(rs, rj) {

						var bulk = CommentModel.collection.initializeOrderedBulkOp();

						var chunk_size = _BATCH_SIZE;
						var arr = items;
						var batches = arr.map( function(e,i){
							return i%chunk_size===0 ? arr.slice(i,i+chunk_size) : null;
						}).filter(function(e){ return e; });

						var batchesExecuted = 0;

						_.each(batches, function(b) {
							_.each(b, function(obj) {
								//console.log('obj = ', JSON.stringify(obj));
								bulk.find({ _id: obj._id }).updateOne(
									{ $set:
										{
											isPublished: true,
											read: readRoles,
											write: commentPeriod.write,
											delete: commentPeriod.delete
										}
									});
							});

							// Execute the operation
							//console.log('insert execute');
							bulk.execute({w:1}, function(err, result) {
								batchesExecuted++;
								//console.log('executed bulkUpdate batch ', batchesExecuted, ' of ', _.size(batches));
								if (err) {
									console.log('bulkUpdate: ', JSON.stringify(err));
									rj(err);
								}
								// re-initialise batch operation
								bulk = CommentModel.collection.initializeOrderedBulkOp();
								if (result) {
									//console.log('bulkUpdate result.ok ', result.ok);
									if (batchesExecuted === _.size(batches)){
										rs(result);
									}
								}
							});

						});
						if (_.size(items) === 0) {
							rs();
						}
					});
				};

				findComments()
					.then(function(comments) {
						_comments = comments;
						//console.log('Comments eaoStatus = Published: ', _.size(_comments));
						return bulkUpdate(_comments);
					})
					.then(function() {
						return self.bulkDeletePermissions(_comments);
					})
					.then(function() {
						var perms = self.permsList(_comments, readRoles, commentPeriod.write, commentPeriod.delete);
						return self.bulkInsertPermissions(perms);
					})
					.then(function() {
						//console.log('done');
						res();
					}, function(err) {
						console.log(JSON.stringify(err));
						rej(err);
					});
			});
		};

		return new Promise(function(resolve, reject) {
			updatePublished(period, comment)
				.then(function () {
					resolve();
				}, function (err) {
					console.log(JSON.stringify(err));
					reject(err);
				});
		});
	},

	syncPermissionsUnpublishedComments: function(period, comment) {
		var self = this;

		var _BATCH_SIZE = 1000;

		var CommentModel = mongoose.model('Comment');

		var updateUnpublished = function(commentPeriod, comment) {
			return new Promise(function (res, rej) {

				var _comments;

				var findComments = function() {
					if (comment) {
						return new Promise(function(rs, rj) {
							CommentModel.find({ $and: [
									{ _id: comment._id },
									{ eaoStatus: { $ne: 'Published' }}
								] }, '_id',
								function (err, data){
									if (err) {
										rj(err);
									} else {
										rs(data);
									}
								});
						});
					} else {
						return new Promise(function(rs, rj) {
							CommentModel.find({ $and: [
									{ period: commentPeriod._id },
									{ eaoStatus: { $ne: 'Published' }}
								] }, '_id',
								function (err, data){
									if (err) {
										rj(err);
									} else {
										rs(data);
									}
								});
						});
					}
				};

				var bulkUpdate = function(comments) {
					return new Promise(function(rs, rj) {

						var bulk = CommentModel.collection.initializeOrderedBulkOp();

						var chunk_size = _BATCH_SIZE;
						var arr = comments;
						var batches = arr.map( function(e,i){
							return i%chunk_size===0 ? arr.slice(i,i+chunk_size) : null;
						}).filter(function(e){ return e; });

						var batchesExecuted = 0;

						_.each(batches, function(b) {
							_.each(b, function(obj) {
								//console.log('obj = ', JSON.stringify(obj));
								bulk.find({ _id: obj._id }).updateOne(
									{ $set:
										{
											isPublished: false,
											read: commentPeriod.vettingRoles,
											write: commentPeriod.write,
											delete: commentPeriod.delete
										}
									});
							});

							// Execute the operation
							//console.log('insert execute');
							bulk.execute({w:1}, function(err, result) {
								batchesExecuted++;
								//console.log('executed bulkUpdate batch ', batchesExecuted, ' of ', _.size(batches));
								if (err) {
									console.log('bulkUpdate: ', JSON.stringify(err));
									rj(err);
								}
								// re-initialise batch operation
								bulk = CommentModel.collection.initializeOrderedBulkOp();
								if (result) {
									//console.log('bulkUpdate result.ok ', result.ok);
									if (batchesExecuted === _.size(batches)){
										rs(result);
									}
								}
							});

						});
						if (_.size(comments) === 0) {
							rs();
						}
					});
				};

				findComments()
					.then(function(comments) {
						_comments = comments;
						//console.log('Comments eaoStatus != Published: ', _.size(_comments));
						return bulkUpdate(_comments);
					})
					.then(function() {
						return self.bulkDeletePermissions(_comments);
					})
					.then(function() {
						var perms = self.permsList(_comments, commentPeriod.vettingRoles, commentPeriod.write, commentPeriod.delete);
						return self.bulkInsertPermissions(perms);
					})
					.then(function() {
						//console.log('done');
						res();
					}, function(err) {
						console.log(JSON.stringify(err));
						rej(err);
					});
			});
		};

		return new Promise(function(resolve, reject) {
			updateUnpublished(period, comment)
				.then(function () {
					resolve();
				}, function (err) {
					console.log(JSON.stringify(err));
					reject(err);
				});
		});
	},

	syncPermissionsCommentDocuments: function(period, comment) {
		var self = this;

		var _BATCH_SIZE = 1000;

		var DocumentModel = mongoose.model('Document');
		var CommentModel = mongoose.model('Comment');

		var updateRejectedDocs = function(commentPeriod, comment) {
			// all comments that are Rejected, set their documents to Rejected
			return new Promise(function(res, rej) {

				var findDocuments = function() {
					return new Promise(function(rs, rj) {
						if (comment) {
							CommentModel.aggregate([
								{
									$match: {_id: comment._id, eaoStatus: 'Rejected'}
								},
								{$project: {_id: 1, period: 1, eaoStatus: 1, documents: 1}},
								{$unwind: '$documents'},
								{
									$lookup: {
										from: 'documents',
										localField: 'documents',
										foreignField: '_id',
										as: 'docs'
									}
								},
								{
									$project: {
										docs: {
											$filter: {
												input: '$docs',
												as: 'doc',
												cond: {$ne: ['$$doc.eaoStatus', 'Rejected']}
											}
										}
									}
								},
								{$unwind: '$docs'},
								{
									$group: {
										_id: '$period',
										docs: {$push: '$docs'}
									}
								}
							], function (err, data) {
								if (err) {
									console.log('error: ', JSON.stringify(err));
									rj(err);
								} else {
									if (data && data.length === 1) {
										console.log('documents for rejected comments, not rejected: ', data[0].docs.length);
										rs(data[0].docs);
									} else {
										rs([]);
									}
								}
							});
						} else {
							CommentModel.aggregate([
								{
									$match: { period: commentPeriod._id, eaoStatus: 'Rejected'}
								},
								{ $project: {_id: 1, period: 1, eaoStatus: 1, documents: 1 } },
								{ $unwind: '$documents'},
								{
									$lookup:
										{
											from: 'documents',
											localField: 'documents',
											foreignField: '_id',
											as: 'docs'
										}
								},
								{
									$project:
										{
											docs:
												{
													$filter:
														{
															input: '$docs',
															as: 'doc',
															cond: { $ne: [ '$$doc.eaoStatus', 'Rejected' ] }
														}
												}
										}
								},
								{ $unwind: '$docs'},
								{
									$group: {
										_id: '$period',
										docs: { $push: '$docs' }
									}
								}
							], function (err, data) {
								if (err) {
									console.log('error: ', JSON.stringify(err));
									rj(err);
								} else {
									if (data && data.length === 1) {
										console.log('documents for rejected comments, not rejected: ', data[0].docs.length);
										rs(data[0].docs);
									} else {
										rs([]);
									}
								}
							});
						}
					});
				};

				var bulkUpdate = function(items) {
					return new Promise(function(rs, rj) {

						var bulk = DocumentModel.collection.initializeOrderedBulkOp();

						var chunk_size = _BATCH_SIZE;
						var arr = items;
						var batches = arr.map( function(e,i){
							return i%chunk_size===0 ? arr.slice(i,i+chunk_size) : null;
						}).filter(function(e){ return e; });

						var batchesExecuted = 0;

						_.each(batches, function(b) {
							_.each(b, function(obj) {
								//console.log('obj = ', JSON.stringify(obj));
								bulk.find({ _id: obj._id }).updateOne(
									{ $set:
										{
											eaoStatus: 'Rejected'
										}
									});
							});

							// Execute the operation
							//console.log('insert execute');
							bulk.execute({w:1}, function(err, result) {
								batchesExecuted++;
								//console.log('executed bulkUpdate batch ', batchesExecuted, ' of ', _.size(batches));
								if (err) {
									console.log('bulkUpdate: ', JSON.stringify(err));
									rj(err);
								}
								// re-initialise batch operation
								bulk = DocumentModel.collection.initializeOrderedBulkOp();
								if (result) {
									//console.log('bulkUpdate result.ok ', result.ok);
									if (batchesExecuted === _.size(batches)){
										rs(result);
									}
								}
							});

						});
						if (_.size(items) === 0) {
							rs();
						}
					});
				};

				findDocuments()
					.then(function(items) {
						return bulkUpdate(items);
					})
					.then(function() {
						//console.log('done');
						res();
					}, function(err) {
						console.log(JSON.stringify(err));
						rej(err);
					});
			});
		};

		var updateDocs = function(commentPeriod, comment) {
			return new Promise(function (res, rej) {

				var _publishedDocs, _unpublishedDocs;
				var _publicDocs = [], _eaoPublishedDocs = [], _eaoUnpublishedDocs = [];

				var findPublishedDocuments = function() {
					return new Promise(function(rs, rj) {
						if (comment) {
							CommentModel.aggregate([
								{
									$match: { _id: comment._id }
								},
								{ $project: {_id: 1, period: 1, eaoStatus: 1, documents: 1 } },
								{ $unwind: '$documents'},
								{
									$lookup:
										{
											from: 'documents',
											localField: 'documents',
											foreignField: '_id',
											as: 'docs'
										}
								},
								{
									$project:
										{
											_id: '$_id',
											period: '$period',
											eaoStatus: '$eaoStatus',
											docs:
												{
													$filter:
														{
															input: '$docs',
															as: 'doc',
															cond: { $eq: [ '$$doc.eaoStatus', 'Published' ] }
														}
												}
										}
								},
								{ $unwind: '$docs'},
								{ $project: {_id: 1, period: 1, eaoStatus: 1, 'docs._id': 1, 'docs.eaoStatus':1 } },
								{
									$group: {
										_id: '$eaoStatus',
										docs: { $push: '$docs' }
									}
								}
							], function (err, data) {
								if (err) {
									console.log('error: ', JSON.stringify(err));
									rj(err);
								} else {
									if (data) {
										rs(data);
									} else {
										rs([]);
									}
								}
							});
						} else {
							CommentModel.aggregate([
								{
									$match: { period: commentPeriod._id }
								},
								{ $project: {_id: 1, period: 1, eaoStatus: 1, documents: 1 } },
								{ $unwind: '$documents'},
								{
									$lookup:
										{
											from: 'documents',
											localField: 'documents',
											foreignField: '_id',
											as: 'docs'
										}
								},
								{
									$project:
										{
											_id: '$_id',
											period: '$period',
											eaoStatus: '$eaoStatus',
											docs:
												{
													$filter:
														{
															input: '$docs',
															as: 'doc',
															cond: { $eq: [ '$$doc.eaoStatus', 'Published' ] }
														}
												}
										}
								},
								{ $unwind: '$docs'},
								{ $project: {_id: 1, period: 1, eaoStatus: 1, 'docs._id': 1, 'docs.eaoStatus':1 } },
								{
									$group: {
										_id: '$eaoStatus',
										docs: { $push: '$docs' }
									}
								}
							], function (err, data) {
								if (err) {
									console.log('error: ', JSON.stringify(err));
									rj(err);
								} else {
									if (data) {
										rs(data);
									} else {
										rs([]);
									}
								}
							});
						}
					});
				};

				var findUnpublishedDocuments = function() {
					return new Promise(function(rs, rj) {
						if (comment) {
							CommentModel.aggregate([
								{
									$match: { _id: comment._id }
								},
								{ $project: {_id: 1, period: 1, eaoStatus: 1, documents: 1 } },
								{ $unwind: '$documents'},
								{
									$lookup:
										{
											from: 'documents',
											localField: 'documents',
											foreignField: '_id',
											as: 'docs'
										}
								},
								{
									$project:
										{
											_id: '$_id',
											period: '$period',
											eaoStatus: '$eaoStatus',
											docs:
												{
													$filter:
														{
															input: '$docs',
															as: 'doc',
															cond: { $ne: [ '$$doc.eaoStatus', 'Published' ] }
														}
												}
										}
								},
								{ $unwind: '$docs'},
								{ $project: {_id: 1, period: 1, eaoStatus: 1, 'docs._id': 1, 'docs.eaoStatus':1 } },
								{
									$group: {
										_id: '$eaoStatus',
										docs: { $push: '$docs' }
									}
								}
							], function (err, data) {
								if (err) {
									console.log('error: ', JSON.stringify(err));
									rj(err);
								} else {
									if (data) {
										rs(data);
									} else {
										rs([]);
									}
								}
							});
						} else {
							CommentModel.aggregate([
								{
									$match: { period: commentPeriod._id }
								},
								{ $project: {_id: 1, period: 1, eaoStatus: 1, documents: 1 } },
								{ $unwind: '$documents'},
								{
									$lookup:
										{
											from: 'documents',
											localField: 'documents',
											foreignField: '_id',
											as: 'docs'
										}
								},
								{
									$project:
										{
											_id: '$_id',
											period: '$period',
											eaoStatus: '$eaoStatus',
											docs:
												{
													$filter:
														{
															input: '$docs',
															as: 'doc',
															cond: { $ne: [ '$$doc.eaoStatus', 'Published' ] }
														}
												}
										}
								},
								{ $unwind: '$docs'},
								{ $project: {_id: 1, period: 1, eaoStatus: 1, 'docs._id': 1, 'docs.eaoStatus':1 } },
								{
									$group: {
										_id: '$eaoStatus',
										docs: { $push: '$docs' }
									}
								}
							], function (err, data) {
								if (err) {
									console.log('error: ', JSON.stringify(err));
									rj(err);
								} else {
									if (data) {
										rs(data);
									} else {
										rs([]);
									}
								}
							});
						}
					});
				};

				var bulkUpdate = function(items, isPublished, readRoles) {
					return new Promise(function(rs, rj) {

						var bulk = DocumentModel.collection.initializeOrderedBulkOp();

						var chunk_size = _BATCH_SIZE;
						var arr = items;
						var batches = arr.map( function(e,i){
							return i%chunk_size===0 ? arr.slice(i,i+chunk_size) : null;
						}).filter(function(e){ return e; });

						var batchesExecuted = 0;

						_.each(batches, function(b) {
							_.each(b, function(obj) {
								//console.log('obj = ', JSON.stringify(obj));
								bulk.find({ _id: obj._id }).updateOne(
									{ $set:
										{
											isPublished: isPublished,
											read: readRoles,
											write: commentPeriod.write,
											delete: commentPeriod.delete
										}
									});
							});

							// Execute the operation
							//console.log('insert execute');
							bulk.execute({w:1}, function(err, result) {
								batchesExecuted++;
								//console.log('executed bulkUpdate batch ', batchesExecuted, ' of ', _.size(batches));
								if (err) {
									console.log('bulkUpdate: ', JSON.stringify(err));
									rj(err);
								}
								// re-initialise batch operation
								bulk = DocumentModel.collection.initializeOrderedBulkOp();
								if (result) {
									//console.log('bulkUpdate result.ok ', result.ok);
									if (batchesExecuted === _.size(batches)){
										rs(result);
									}
								}
							});

						});
						if (_.size(items) === 0) {
							rs();
						}
					});
				};

				findPublishedDocuments()
					.then(function(data) {
						// docs that are eaoStatus = Published, grouped by their comment eaoStatus.
						_publishedDocs = data || [];
						return findUnpublishedDocuments();
					})
					.then(function(data) {
						// docs that are NOT eaoStatus = Published, grouped by their comment eaoStatus.
						_unpublishedDocs = data || [];

						_.each(_publishedDocs, function(d) {
							if (d._id === 'Published') {
								_publicDocs = _.concat(_publicDocs, d.docs);
							} else {
								_eaoPublishedDocs = _.concat(_eaoPublishedDocs, d.docs);
							}
						});

						_.each(_unpublishedDocs, function(d) {
							_eaoUnpublishedDocs = _.concat(_eaoUnpublishedDocs, d.docs);
						});

						// publicDocs need to ensure their isPublished  = true and public can read.
						// eaoPublishedDocs are not public, they are marked as going to be public... isPublished = false, but more read access...
						// unpublishedDocs are not public, they are marked as going to be public... isPublished = false, no public access and only period vetting roles for read
						var allDocs = _.concat(_publicDocs, _eaoPublishedDocs, _eaoUnpublishedDocs);
						return self.bulkDeletePermissions(allDocs);
					})
					.then(function() {
						// ok do permissions insert...
						var publishReadRoles = _.uniq(_.concat(commentPeriod.read, 'public'));

						var pubPerms = self.permsList(_publicDocs, publishReadRoles, commentPeriod.write, commentPeriod.write);
						var eaopubPerms = self.permsList(_eaoPublishedDocs, commentPeriod.vettingRoles, commentPeriod.write, commentPeriod.write);
						var unpubPerms = self.permsList(_eaoUnpublishedDocs, commentPeriod.vettingRoles, commentPeriod.write, commentPeriod.write);

						var allPerms = _.concat(pubPerms, eaopubPerms, unpubPerms);
						return self.bulkInsertPermissions(allPerms);
					})
					.then(function() {
						var publishReadRoles = _.uniq(_.concat(commentPeriod.read, 'public'));
						return bulkUpdate(_publicDocs, true, publishReadRoles);
					})
					.then(function() {
						return bulkUpdate(_eaoPublishedDocs, false, commentPeriod.vettingRoles);
					})
					.then(function() {
						return bulkUpdate(_eaoUnpublishedDocs, false, commentPeriod.vettingRoles);
					})
					.then(function() {
						res();
					}, function(err) {
						console.log(JSON.stringify(err));
						rej(err);
					});
			});
		};

		return new Promise(function(resolve, reject) {
			updateRejectedDocs(period, comment)
				.then(function() {
					return updateDocs(period, comment);
				})
				.then(function() {
					resolve();
				}, function(err) {
					console.log(JSON.stringify(err));
					reject(err);
				});
		});
	},

	syncCommentPermissionsAll: function(periodId, commentId, stage) {
		var self = this;

		var CommentModel = mongoose.model('Comment');
		var PeriodModel = mongoose.model('CommentPeriod');
		var _thePeriod, _theComment;

		return new Promise(function(resolve, reject) {
			PeriodModel.findOne({_id: periodId})
				.then(function(result) {
					_thePeriod = result;
					if (commentId) {
						return CommentModel.findOne({_id: commentId});
					} else {
						return undefined;
					}
				})
				.then(function(result) {
					_theComment = result;
					if (!stage || ('1' === stage)) {
						return self.syncUnclassifiedComments(_thePeriod, _theComment);
					} else {
						return;
					}
				})
				.then(function() {
					if (!stage || ('2' === stage)) {
						return self.syncPermissionsPublishedComments(_thePeriod, _theComment);
					} else {
						return;
					}
				})
				.then(function() {
					if (!stage || ('3' === stage)) {
						return self.syncPermissionsUnpublishedComments(_thePeriod, _theComment);
					} else {
						return;
					}
				})
				.then(function() {
					if (!stage || ('4' === stage)) {
						return self.syncPermissionsCommentDocuments(_thePeriod, _theComment);
					} else {
						return;
					}
				})
				.then(function() {
					resolve();
				}, function(err) {
					console.log(JSON.stringify(err));
					reject(err);
				});
		});
	},

	syncCommentPermissions:  function(commentId) {
		var self = this;

		return new Promise(function(resolve, reject) {
			self.findOne({_id: commentId})
				.then(function(result) {
					return self.syncCommentPermissionsAll(result.period, commentId);
				})
				.then(function() {
					// return the updated comment...
					return self.findOne({_id: commentId});
				})
				.then(function(data) {
					resolve(data);
				}, function(err) {
					console.log(JSON.stringify(err));
					reject(err);
				});
		});
	},


});

