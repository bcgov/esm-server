'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path = require('path');
var DBModel = require(path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var Template = require(path.resolve('./modules/templates/server/controllers/template.controller'));
var ArtifactType = require('./artifact.type.controller');
var MilestoneClass = require(path.resolve('./modules/milestones/server/controllers/milestone.controller'));
var ActivityClass = require(path.resolve('./modules/activities/server/controllers/activity.controller'));
var PhaseClass = require(path.resolve('./modules/phases/server/controllers/phase.controller'));
// var Roles               = require (path.resolve('./modules/roles/server/controllers/role.controller'));
var _ = require('lodash');
var DocumentClass  = require (path.resolve('./modules/documents/server/controllers/core.document.controller'));
var Access    = require (path.resolve ('./modules/core/server/controllers/core.access.controller'));
var ObjectID = require('mongodb').ObjectID;

var mongoose = require ('mongoose');
var Role = mongoose.model ('_Role');
var Project = mongoose.model ('Project');

module.exports = DBModel.extend({
	name: 'Artifact',
	plural: 'artifacts',
	populate: [{path: 'artifactType'}, {path: 'template'}, {path: 'document'}, {path: 'valuedComponents'}, {path: 'phase'}, { path: 'addedBy', select: '_id displayName username email orgName' }, { path: 'updatedBy', select: '_id displayName username email orgName' }],
	bind: ['getCurrentTypes'],
	getForProject: function (projectid) {
		return this.list({project: projectid}, {
			name: 1,
			version: 1,
			stage: 1,
			typeCode: 1,
			isPublished: 1,
			userPermissions: 1,
			valuedComponents: 1,
			author: 1,
			shortDescription: 1,
			dateUpdated: 1,
			dateAdded: 1,
			addedBy: 1,
			updatedBy: 1
		});
	},
	// If we want artifacts that do not equal a certain type
	getForProjectFilterType: function (projectid, qs) {
		var q = {project: projectid};
		q.isPublished = qs.isPublished;
		q.typeCode = { '$nin': qs.typeCodeNe.split(',') };

		// we need the userCan populated so we can set permissions from these results, do not limit the result set fields...
		return this.findMany(q);
	},
	// We want to specifically get these types
	getForProjectType: function (projectid, type) {
		return this.list({project: projectid, typeCode: type},
		{
			name: 1,
			version: 1,
			stage: 1,
			isPublished: 1,
			userPermissions: 1,
			valuedComponents: 1,
			author: 1,
			shortDescription: 1,
			dateUpdated: 1,
			dateAdded: 1,
			addedBy: 1,
			updatedBy: 1
		});
	},
	// -------------------------------------------------------------------------
	//
	// make a new artifact from a given type.
	// this will make the new artifact and put it in the first stage and the
	// first version as supplied in the type model
	// if it is of type template, then the most current version of the template
	// that matches the type will be used
	//
	// -------------------------------------------------------------------------
	newFromType: function (code, project) {
		var types = new ArtifactType(this.opts);
		var template = new Template(this.opts);
		var self = this;
		var artifactType;
		var artifact;
		var prefix = 'Add Artifact Error: ';
		return new Promise(function (resolve, reject) {
			//
			// first off, lets check and make sure that we have everything we need
			// in order to continue
			//
			//console.log ('project: ',JSON.stringify (project, null, 4));
			if (!project) return reject(new Error(prefix + 'missing project'));
			if (!project.currentPhase) return reject(new Error(prefix + 'missing current phase'));
			//
			// default a new artifact
			//
			self.newDocument().then(function (a) {
				artifact = a;
				return types.findOne({code: code});
			})
			//
			// check that we have an artifact type
			//
			.then(function (atype) {
				if (!atype) return reject(new Error(prefix + 'cannot locate artifact type'));
				else {
					artifactType = atype;
					//console.log ('getting template');
					//
					// if this is a template artifact get the latest version of the template
					//
					if (artifactType.isTemplate) return template.findFirst({code: code}, null, {versionNumber: -1});
				}
			})
			//
			// if template, check that have it as well
			//
			.then(function (t) {
				//console.log ('setting template', t);
				//
				// if its a template, but the template was not found then fail
				//
				if (artifactType.isTemplate && !t) return reject(prefix + 'cannot find template');
				//
				// otherwise set the template if required and retun the artifact for next step
				//
				else {
					// For now, only artifacts which are templates of a certain type have signatureStages.
					if (artifactType.isTemplate) {
						artifact.signatureStage = t[0].signatureStage;
					}
					artifact.template = (artifactType.isTemplate) ? t[0] : null;
					artifact.isTemplate = artifactType.isTemplate;
					artifact.isArtifactCollection = artifactType.isArtifactCollection;
					return artifact;
				}
			})
			//
			// now add the milestone associated with this artifact
			//
			.then(function (m) {
				// Remove the magic w.r.t. schedule
				return null;
				//console.log("artifact type:",artifactType);
				// Don't add milestones for artifacts of type 'valued-component' or 'inspection-report'
				// if (artifactType.code === 'valued-component' || artifactType.code === 'inspection-report') {
				// 	return null;
				// }

				// // not sure if this is right or we need more data on the templates...
				// if (_.isEmpty(artifactType.milestone))
				// 	return null;

				// var p = new MilestoneClass(self.opts);
				// return p.fromBase(artifactType.milestone, project.currentPhase);
			})
			//
			// now set up and save the new artifact
			//
			.then(function (milestone) {
				//console.log('newFromType milestone ' + JSON.stringify(milestone, null, 4));
				// Happens when we skip adding a milestone.
				if (milestone) {
					artifact.milestone = milestone._id;
				}
				artifact.typeCode = artifactType.code;
				artifact.name = artifactType.name;
				artifact.project = project._id;
				artifact.phase = project.currentPhase._id;
				artifact.artifactType = artifactType;
				artifact.version = artifactType.versions[0];
				artifact.stage = artifactType.stages[0].name;
				return artifact;
			})
			.then (function (a) {
				var pc = new PhaseClass(self.opts);
				if (!a.artifactType.phase) {
					a.originalPhaseName = "Any Phase";
					return a;
				} else {
					return pc.getPhaseBase(a.artifactType.phase)
					.then( function (phasebase) {
						a.originalPhaseName = phasebase.name;
						return a;
					});
				}
			})
			.then ( function (m) {
				return self.applyModelPermissionDefaults(m);
			})
			.then(function(a) {
				//console.log('newFromType call saveDocument');
				self.setForce(true);
				return self.saveDocument(artifact);
			})
			.then(function(a) {
				//console.log('newFromType saveDocument returns: ' + JSON.stringify(a, null, 4));
				return a;
			})
			.then(resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// return a list of avaible types based upon the table, but also what the
	// project already has.  So, any artifaacts that can only appear once,
	// such as the project description, cannot be returned if they have already
	// been established within the project
	//
	// -------------------------------------------------------------------------
	availableTypes: function (projectId) {
		//
		// get a list of all multiple types, those can be used
		// get a list of non-multiples
		// get a list of already used types in the project
		// get the disjoint of the latter two and add those to the list of available
		//
		var self = this;
		var Types = new ArtifactType(self.opts);
		var multiples = [];
		var nonmultiples = [];
		var artifactTypeDefaults =  {};
		return new Promise(function (resolve, reject) {
			self.getModelPermissionDefaults ()
				.then(function (result) {
					console.log (JSON.stringify(result.defaults.permissions));
					if (result) artifactTypeDefaults = result.defaults.permissions;
				})
			.then(Types.getMultiples)
			.then(function (result) {
				//console.log (result);
				if (result) multiples = result;
				//console.log ('multiples = ', JSON.stringify(multiples,null,4));
			})
			.then(Types.getNonMultiples)
			.then(function (result) {
				//console.log (result);
				if (result) nonmultiples = result;
				//console.log ('non-multiples = ', JSON.stringify(nonmultiples,null,4));
				return projectId;
			})
			.then(self.getCurrentTypes)
			.then(function (currenttypes) {
				var allowed = [];
				if (currenttypes) {
					_.each(nonmultiples, function (val) {
						if (!~currenttypes.indexOf(val.code)) {
							allowed.push(val);
						}
					});
					// Add in the multiples
					_.each(multiples, function (item) {
						if (item.code === 'inspection-report') {
							// Skip it
						} else {
							allowed.push(item);
						}
					});
				}
				//console.log ('nallowed = ', JSON.stringify(allowed,null,4));
				return allowed;
			})
			.then(function(types) {
				// since all artifact use the same permissions, just check for write permission and add all
				if (_.intersection(self.userRoles, artifactTypeDefaults.write).length > 0) {
					return types;
				} else {
					return [];
				}
			})
			.then(resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// get all the current types used for a project
	//
	// -------------------------------------------------------------------------
	getCurrentTypes: function (projectId) {
		//console.log ('getCurrentTypes for ', projectId);
		var self = this;
		return new Promise(function (resolve, reject) {
			self.findMany({project: projectId}, {typeCode: 1})
			.then(function (result) {
				return result.map(function (e) {
					return e.typeCode;
				});
			})
			.then(resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// these save the passed in document and then progress it to the next stage
	// doc is a json object while oldDoc is a proper mongoose schema
	//
	// -------------------------------------------------------------------------
	nextStage: function (doc, oldDoc) {
		var self = this;
		var documentClass = new DocumentClass(this.opts);

		var stage = _.find(doc.artifactType.stages, function (s) {
			return s.name === doc.stage;
		});

		//console.log("stage = ", stage);
		//console.log("cur stage role:", stage.role);
		//console.log("cur opts userRoles:", this.opts.userRoles);

		// If the user is currently in the role that this role requires for progressing
		// to the next stage, then lets give them write on this object.
		_.find(this.opts.userRoles, function (role) {
			if (role === stage.role) {
				// Add write, this user is in the right role.
				self.setForce(true);
			}
		});
		if (stage.next) {
			var next = _.find(doc.artifactType.stages, function (s) {
				return s.activity === stage.next;
			});
			if (_.isEmpty(next.role)) {
				return this.newStage(doc, oldDoc, next);
			} else {
				var model;
				return this.newStage(doc, oldDoc, next)
					.then(function(m) {
						// whomever manages the next stage will need read/write on this artifact...
						m.read = _.uniq(_.concat(m.read, next.role));
						//console.log("adding read on artifact for the next role:", next.role);
						return self.saveDocument(m);
					})
					.then(function(m) {
						model = m;
						// and on all documents but internal...
						// so get the ids and fetch them...
						var ids = _.concat(model.additionalDocuments, model.supportingDocuments) || [];
						if (model.document) {
							if (ObjectID.isValid(model.document)) {
								ids.push(model.document);
							} else {
								ids.push(model.document._id);
							}
						}
						return documentClass.getListIgnoreAccess(ids);
					})
					.then(function (list) {
						// and set read access on all of these documents...
						var a = _.forEach(list, function (d) {
							return new Promise(function (resolve, reject) {
								d.read = _.uniq(_.concat(d.read, next.role));
								resolve(documentClass.saveDocument(d));
							});
						});
						return Promise.all(a);
					})
					.then(function() {
						// finally, return the artifact.
						return model;
					});
			}
		}
	},
	prevStage: function (doc, oldDoc) {
		var stage = _.find(doc.artifactType.stages, function (s) {
			return s.name === doc.stage;
		});
		if (stage.prev) {
			var prev = _.find(doc.artifactType.stages, function (s) {
				return s.activity === stage.prev;
			});
			return this.newStage(doc, oldDoc, prev);
		}
	},
	newStage: function (doc, oldDoc, next) {
		doc.stage = next.name;
		//console.log (doc);
		//console.log (doc.reviewnote);
		//
		// if there is a new review note then push it
		//
		if (doc.reviewnote) {
			doc.reviewNotes.push({
				username: this.user.username,
				date: Date.now(),
				note: doc.reviewnote
			});
		}
		//
		// if there is a new approval note then push it
		//
		if (doc.approvalnote) {
			doc.approvalNotes.push({
				username: this.user.username,
				date: Date.now(),
				note: doc.approvalnote
			});
		}
		//
		// if there is a new decision note then push it
		//
		if (doc.decisionnote) {
			doc.decisionNotes.push({
				username: this.user.username,
				date: Date.now(),
				note: doc.decisionnote
			});
		}
		//
		// if this is a publish step, then publish the artifact
		//
		// doc.read = _.union (doc.read, 'public');
		// doc.isPublished = true;
		//
		// save the document
		//
		//console.log ('about to attempt to save saveDocument', doc);
		if (_.isEmpty(doc.document)) doc.document = null;

		var self = this;
		return this.update(oldDoc, doc)
			.then(function (model) {
				//
				// once saved go and create the new activity if one is listed under
				// this stage
				//
				//console.log ('document saved, now add the activity ', model.milestone, next.activity);

				///////////////////////////////////////////////////////////////////////////////
				// NB: This will never run since milestones should not be automatically created
				///////////////////////////////////////////////////////////////////////////////

				if (model.milestone && next.activity) {
					var ativity;
					var m = new MilestoneClass(self.opts);
					var a = new ActivityClass(self.opts);
					return m.findById(model.milestone)
						.then(function (milestone) {
							//console.log ('found the milestone, now adding attivity');
							//
							// this is where we should/would set special permisions, but they
							// really should be on the default base activity (which this does do)
							//
							return a.fromBase(next.activity, milestone, {artifactId: model._id});
						})
						.then(function () {
							return model;
						});
				} else {
					return model;
				}
			});
	},
	// -------------------------------------------------------------------------
	//
	// this gets the most current version of each artifact
	//
	// -------------------------------------------------------------------------
	currentArtifacts: function () {
		var self = this;
		return new Promise(function (resolve, reject) {
			self.model.aggregate([
				{"$sort": {"versionNumber": -1}},
				{
					"$group": {
						"_id": "$typeCode",
						"id": {"$first": "$_id"},
						"name": {"$first": "$name"},
						"documentType": {"$first": "$typeCode"},
						"versionNumber": {"$first": "$versionNumber"},
						"dateUpdated": {"$first": "$dateUpdated"},
						"stage": {"$first": "$stage"}
					}
				}
			], function (err, result) {
				if (err) return reject(err);
				else resolve(result);
			});
		});
	},
	// -------------------------------------------------------------------------
	//
	// create a new version of the supplied artifact in the passed in project
	// in its current phase.
	//
	// -------------------------------------------------------------------------
	createNewArtifactInProject: function (type, project) {

	},
	// -------------------------------------------------------------------------
	//
	// for the given artifact, assumed already created in a base form, create
	// the initial activity set using the milestonebase attached to the artifact
	// meta
	//
	// -------------------------------------------------------------------------
	createMilestoneForArtifact: function (artifact) {

	},
	// -------------------------------------------------------------------------
	//
	// publish / unpublish
	//
	// -------------------------------------------------------------------------
	publish: function (artifact) {
		var documentClass = new DocumentClass(this.opts);
		return new Promise(function (resolve, reject) {
			artifact.name = artifact.name.replace(/Template/gi, '').trim();
			artifact.publish();
			artifact.save()
				.then(function () {
					// publish document, additionalDocuments, supportingDocuments
					//console.log('documentClass.publish(artifact.document): ' + JSON.stringify(artifact.document, null, 4));
					return documentClass.publish(artifact.document);
				})
				.then(function () {
					return documentClass.getListIgnoreAccess(artifact.additionalDocuments);
				})
				.then(function (list) {
					//console.log('documentClass.publishList(artifact.additionalDocuments): ' + JSON.stringify(list, null, 4));
					var a = _.forEach(list, function (d) {
						return new Promise(function (resolve, reject) {
							resolve(documentClass.publish(d));
						});
					});
					return Promise.all(a);
				})
				.then(function () {
					return documentClass.getListIgnoreAccess(artifact.supportingDocuments);
				})
				.then(function (list) {
					//console.log('documentClass.publishList(artifact.supportingDocuments): ' + JSON.stringify(list, null, 4));
					var a = _.forEach(list, function (d) {
						return new Promise(function (resolve, reject) {
							resolve(documentClass.publish(d));
						});
					});
					return Promise.all(a);
				})
				.then(function () {
					return documentClass.getListIgnoreAccess(artifact.internalDocuments);
				})
				.then(function (list) {
					//console.log('documentClass.unpublishList(artifact.internalDocuments): ' + JSON.stringify(list, null, 4));
					var a = _.forEach(list, function (d) {
						return new Promise(function (resolve, reject) {
							resolve(documentClass.unpublish(d));
						});
					});
					return Promise.all(a);
				})
				.then(function () {
					//console.log('< save()');
					return artifact;
				})
				.then(resolve, reject);
		});
	},
	unpublish: function (artifact) {
		var documentClass = new DocumentClass(this.opts);
		return new Promise(function (resolve, reject) {
			artifact.unpublish();
			artifact.save()
				.then(function () {
					// publish document, additionalDocuments, supportingDocuments
					//console.log('documentClass.unpublish(artifact.document): ' + JSON.stringify(artifact.document, null, 4));
					return documentClass.unpublish(artifact.document);
				})
				.then(function () {
					return documentClass.getListIgnoreAccess(artifact.additionalDocuments);
				})
				.then(function (list) {
					//console.log('documentClass.unpublishList(artifact.additionalDocuments): ' + JSON.stringify(list, null, 4));
					var a = _.forEach(list, function (d) {
						return new Promise(function (resolve, reject) {
							resolve(documentClass.unpublish(d));
						});
					});
					return Promise.all(a);
				})
				.then(function () {
					return documentClass.getListIgnoreAccess(artifact.supportingDocuments);
				})
				.then(function (list) {
					//console.log('documentClass.unpublishList(artifact.supportingDocuments): ' + JSON.stringify(list, null, 4));
					var a = _.forEach(list, function (d) {
						return new Promise(function (resolve, reject) {
							resolve(documentClass.unpublish(d));
						});
					});
					return Promise.all(a);
				})
				.then(function () {
					return documentClass.getListIgnoreAccess(artifact.internalDocuments);
				})
				.then(function (list) {
					//console.log('documentClass.unpublishList(artifact.internalDocuments): ' + JSON.stringify(list, null, 4));
					var a = _.forEach(list, function (d) {
						return new Promise(function (resolve, reject) {
							resolve(documentClass.unpublish(d));
						});
					});
					return Promise.all(a);
				})
				.then(function () {
					//console.log('< save()');
					return artifact;
				})
				.then(resolve, reject);
		});
	},
	checkPermissions: function(artifactId) {
		var self = this;

		return self.findById(artifactId)
			.then(function(artifact) {
				var permissions = {};
				artifact.artifactType.stages.forEach(function(stage) {
					//console.log('stage = ', JSON.stringify(stage));
					//console.log('userRoles = ', JSON.stringify(self.opts.userRoles));
					permissions[stage.name] = (!stage.role) ? true : _.includes(self.opts.userRoles, stage.role);
				});

				return permissions;
			});
	},
	mine: function () {
		return new Promise(function(resolve, reject) {
			resolve([]);
		});
		/*
		var self = this;

		var findMyRoles = function (username) {
			return new Promise(function (fulfill, reject) {
				Role.find({
					user: username
				}).exec(function (error, data) {
					if (error) {
						reject(new Error(error));
					} else if (!data) {
						reject(new Error('findMyRoles: Roles not found for username: ' + username));
					} else {
						fulfill(data);
					}
				});
			});
		};

		var getIncompleteProjects = function(roles) {
			var projectIds = _.uniq(_.map (roles, 'context'));
			// don't want to query for 'application', it's not a project id...
			_.remove(projectIds, function(o) { return o === 'application'; } );

			var q = {
				_id: { "$in": projectIds },
				dateCompleted: { "$eq": null }
			};
			return Project.find (q, { _id: 1, code: 1, name: 1, region: 1, status: 1, currentPhase: 1, lat: 1, lon: 1, type: 1, description: 1 }).populate('currentPhase').exec();
		};

		var getMyArtifacts = function(projects) {
			var projectIds = _.uniq(_.map (projects, '_id'));
			var q = {
				project: { "$in": projectIds },
				stage:   { "$ne" : "Edit"}
			};
			return self.model.find(q, { _id: 1, code: 1, name: 1, stage: 1, version: 1, phase: 1, project: 1, artifactType: 1, description: 1, dateUpdated: 1, updatedBy: 1, isPublished: 1  }).populate('artifactType', 'stages.name stages.activity stages.role').populate('phase', 'name').populate('project', 'code name').populate('updatedBy', 'displayName').exec();
		};

		var roles = [];
		var projects = [];
		var artifacts = [];
		return findMyRoles(self.user.username)
			.then(function(data) {
				//console.log("artifacts.mine - roles = ", JSON.stringify(data, null, 4));
				roles = data;
				return getIncompleteProjects(roles);
			})
			.then(function(data) {
				//console.log("artifacts.mine - projects = ", JSON.stringify(data, null, 4));
				projects = data;
				return getMyArtifacts(projects);
			})
			.then(function(data) {
				//console.log("artifacts.mine - artifacts(all) = ", JSON.stringify(data, null, 4));
				// need to filter out which artifacts we have a role in the current stage....
				_.each(data, function(a) {
					//console.log(" artifact = " + a.name + ', stage = ' + a.stage);
					if (a.project && a.project._id && a.artifactType && a.artifactType.stages && a.artifactType.stages.length > 0) {
						var projectRoles = _.filter(roles, function(r) { return r.context.toString() === a.project._id.toString(); });
						var currentStage = _.find(a.artifactType.stages, function(s) { return s.name === a.stage; });
						//console.log("   projectRoles = " + JSON.stringify(projectRoles, null, 4));
						//console.log("   currentStage = " + JSON.stringify(currentStage, null, 4));

						if (projectRoles && projectRoles.length > 0 && currentStage && currentStage.role) {
							var roleNames = _.map(projectRoles, 'role');
							//console.log("   roleNames = " + JSON.stringify(roleNames, null, 4));
							//console.log("   currentStage.role = " + JSON.stringify(currentStage.role, null, 4));
							var mine = roleNames.indexOf(currentStage.role) > -1;
							//onsole.log("   is this my artifact? ", (mine ? "YUP!" : "NOPE!"));
							if (mine) {
								//console.log("   currentStage.activity = " + _.toLower(currentStage.activity));
								//console.log("   isPublished = " + a.isPublished);
								if (_.toLower(currentStage.activity) === 'publish' && a.isPublished) {
									//console.log("     this artifact is in the publish stage and has been published, so consider it done.  Do not add to list of pending activities");
								} else {
									artifacts.push(a);
								}
							}
						}
					} else {
						//console.log(" SKIP artifact = " + a.name + '. Either project is not populated or artifactType/stages is not populated.');
					}
				});
				//console.log("artifacts.mine - artifacts(mine) = ", JSON.stringify(artifacts, null, 4));
				return artifacts;
			}, function(err) {
				//console.log("ERROR - artifacts.mine - artifacts(all): ", JSON.stringify(err));
				return [];
			}).then(function(data) {
				return data;
			}, function(err) {
				//console.log("ERROR - artifacts.mine - artifacts(mine): ", JSON.stringify(err));
				return [];
			});
			*/
	},

});
