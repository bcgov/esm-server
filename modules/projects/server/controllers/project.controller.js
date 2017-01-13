'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path                = require ('path');
var DBModel             = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var UserClass           = require (path.resolve('./modules/users/server/controllers/admin.server.controller'));
var PhaseClass          = require (path.resolve('./modules/phases/server/controllers/phase.controller'));
var PhaseBaseClass      = require (path.resolve('./modules/phases/server/controllers/phasebase.controller'));
var OrganizationClass   = require (path.resolve('./modules/organizations/server/controllers/organization.controller'));
var StreamClass         = require (path.resolve('./modules/streams/server/controllers/stream.controller'));
var RecentActivityClass = require (path.resolve('./modules/recent-activity/server/controllers/recent-activity.controller'));
var _                   = require ('lodash');
var Role        				= require ('mongoose').model ('_Role');
var util = require('util');
var CommentPeriod = require (path.resolve('./modules/project-comments/server/models/commentperiod.model'));
var access = require(path.resolve('./modules/core/server/controllers/core.access.controller'));

var mongoose				= require('mongoose');
var ArtifactModel			= mongoose.model('Artifact');
var DocumentModel			= mongoose.model('Document');
var ProjectModel			= mongoose.model('Project');
var VcModel					= mongoose.model('Vc');
var ProjectConditionModel	= mongoose.model('ProjectCondition');
var MilestoneModel			= mongoose.model('Milestone');
var InspectionreportModel	= mongoose.model('Inspectionreport');
var TreeModel				= require ('tree-model');


module.exports = DBModel.extend ({
	name : 'Project',
	plural : 'projects',
	sort: {name:1},
	populate: 'currentPhase phases phases.milestones phases.milestones.activities proponent primaryContact',
	// bind: ['addPrimaryUser','addProponent'],
	init: function () {
		this.recent = new RecentActivityClass (this.opts);
	},
	postMessage: function (obj) {
		this.recent.create (_.extend ({
			headline: 'news headline',
			content: 'news content',
			project: 'project_id',
			type: 'News'
		}, obj));
	},
	// -------------------------------------------------------------------------
	//
	// Before adding a project this is what must happen:
	//
	// set up the eao and proponent admin and member roles
	// add them to the project
	// reverse add the project to the roles
	// add the project admin role to the current user, eao if internal, proponent
	//    otherwise
	// reset the user roles in this object so the user can save it
	//
	// -------------------------------------------------------------------------
	preprocessAdd : function (project) {
		//console.log('project.preprocessAdd project(1) = ' + JSON.stringify(project, null, 4));
		var self = this;
		//
		// return a promise, we have lots of work to do
		//
		if (_.isEmpty(project.shortName)) {
			project.shortName = project.name.toLowerCase ();
			project.shortName = project.shortName.replace (/\W/g,'-');
			project.shortName = project.shortName.replace (/^-+|-+(?=-|$)/g, '');
		}

		return new Promise (function (resolve, reject) {
			//
			// first generate a project code that can be used internally
			//
			project.code = project.shortName.toLowerCase ();
			project.code = project.code.replace (/\W/g,'-');
			project.code = project.code.replace(/^-+|-+(?=-|$)/g, '');
			if (_.endsWith(project.code, '-')) {
				project.code = project.code.slice(0, -1);
			}			//
			//
			// this does the work of that and returns a promise
			//
			self.guaranteeUniqueCode (project.code)
			//
			// then go about setting up the default admin roles on both
			// sides of the fence
			//
			.then (function (projectCode) {
				//
				// if the project hasn't an orgCode yet then copy in the user's
				//
				if (!project.orgCode) project.orgCode = self.user.orgCode;

				return self.initDefaultRoles(project);
			})
			//.then(function() {
			//	// add all eao-intake users to this project's intake role.
			//	return self.addIntakeUsers(project);
			//})
			.then(function() {
				//console.log('project.preprocessAdd project(2) = ' + JSON.stringify(project, null, 4));
				// since we know that only special people can create projects...
				// let's force this save/create.
				// at this point someone with eao-intake has been put in this project's intake role...
				// however, this controller has been initialized with this user's old roles... so saveDocument will fail.
				// we could do this two ways
				//
				// self.userRoles.push('intake');
				//
				// or
				//
				// self.force = true;
				//
				self.force = true;
				return project;
			})
			//
			// add a pre submission phase (intake)
			//
			.then (function (proj) {
				//console.log('project.preprocessAdd project(3) = ' + JSON.stringify(project, null, 4));

				if (!project.phases || project.phases.length === 0) {
					// Add default phases to project.
					return ['intake', 'determination', 'scope', 'evaluation', 'review', 'decision', 'post-certification'].reduce(function (promise, phase, index) {
						return promise.then(function () {
							return self.addPhase(project, phase);
						});
					}, Promise.resolve())
					// Assign current phase, and start.
					.then(function (m) {
						var Phase = new PhaseClass(self.opts);
						if (m.phases[0].name) {
							// console.log ('new phase = ', m.phases[0].code, m.phases[0].name, m.phases[0]._id);
							m.currentPhase = m.phases[0];
							m.currentPhaseCode = m.phases[0].code;
							m.currentPhaseName = m.phases[0].name;
							Phase.start(m.currentPhase);
							return m;
						} else {
							return Phase.findById(m.phases[0])
								.then(function (p) {
									m.currentPhase = p._id;
									m.currentPhaseCode = p.code;
									m.currentPhaseName = p.name;
									Phase.start(p);
									return m;
								});
						}
					});
				} else {
					return Promise.resolve();
				}
			})
			.then (resolve, reject);
		});
	},
	postprocessAdd: function(project) {
		return access.addGlobalProjectUsersToProject(project._id)
			.then(function() { return Promise.resolve(project); }, function(err) { return Promise.reject(err); });
	},
	preprocessUpdate: function(project) {
		var self = this;
		//console.log('preprocessUpdate = ', JSON.stringify(project, null, 4));
		if (!project.userCan.manageFolders) {
			//console.log('preprocessUpdate. user does not have manageFolders, set directory structure to current stored value...');
			return new Promise(function (resolve, reject) {
				return self.findById(project._id)
					.then(function (p) {
						//console.log('p.directoryStructure = ', JSON.stringify(p.directoryStructure));
						//console.log('this.directoryStructure = ', JSON.stringify(project.directoryStructure));
						project.directoryStructure = p.directoryStructure;
						//console.log('this.directoryStructure = ', JSON.stringify(project.directoryStructure));
						resolve(project);
					});
			});
		} else {
			//console.log('preprocessUpdate. user has manageFolders, so let them adjust the directoryStructure.');
			return project;
		}
	},
	// -------------------------------------------------------------------------
	//
	// Utility method for API convenience.
	//
	// -------------------------------------------------------------------------
	addPhaseWithId: function (projectId, baseCode) {
		var self = this;
		return self.findById(projectId)
			.then(function(project) {
				return self.addPhase(project, baseCode);
			});
	},
	// Used for managing folder structures in the application.
	addDirectory: function (projectId, folderName, parentId) {
		console.log("adding dir:", folderName);
		var self = this;
		var newNodeId;
		return new Promise(function (resolve, reject) {
			return self.findById(projectId)
			.then(function(project) {
				// check for manageFolders permission
				if (!project.userCan.manageFolders) {
					reject(new Error ("User is not permitted to manage folders for '" + project.name + "'."));
				} else {
					return project;
				}
			})
			.then(function (project) {
				// console.log("current structure:", project.directoryStructure);
				var tree = new TreeModel();
				if (!project.directoryStructure) {
					// console.log("setting default");
					// TODO: bring this in from DB instead of hardcoding
					project.directoryStructure = {id: 1, name: 'ROOT', lastId: 1};
				}
				var root = tree.parse(project.directoryStructure);
				// Walk until the right folder is found
				var theNode = root.first(function (node) {
					return node.model.id === parseInt(parentId);
				});
				// If we found it, add it
				if (theNode) {
					// Check if this already exists.
					var bFound = theNode.first(function (node) {
						// NB: Exclude myself
					    return (node.model.name === folderName) && (node.model.id !== theNode.model.id);
					});

					// If found, return error in creating.
					if (bFound) {
						return null;
					}

					root.model.lastId += 1;
					var node = theNode.addChild(tree.parse({id: root.model.lastId, name: folderName}));
					newNodeId = node.model.id;
				} else {
					// If we didn't find the node, this is an error.
					return null;
				}
				project.directoryStructure = {};
				project.directoryStructure = root.model;
				return project.save();
			})
			.then(function (p) {
				if (p) {
					p.directoryStructure.createdNodeId = newNodeId;
					resolve(p.directoryStructure);
				} else {
					reject(new Error("ERR: Couldn't create directory."));
				}
			});
		});
	},
	// Used for managing folder structures in the application.
	removeDirectory: function (projectId, folderId) {
		var self = this;
		return new Promise(function(resolve, reject) {
			return self.findById(projectId)
				.then(function(project) {
					// check for manageFolders permission
					if (!project.userCan.manageFolders) {
						reject(new Error ("User is not permitted to manage folders for '" + project.name + "'."));
					} else {
						return project;
					}
				})
				.then(function (project) {
					// console.log("current structure:", project.directoryStructure);
					var tree = new TreeModel();
					if (!project.directoryStructure) {
						return project;
					}
					var root = tree.parse(project.directoryStructure);
					// Walk until the right folder is found
					var theNode = root.first(function (node) {
						return node.model.id === parseInt(folderId);
					});
					// If we found it, remove it as long as it's not the root.
					if (theNode && !theNode.isRoot()) {
						// console.log("found node:", theNode.model.id);
						// console.log("parent Node:", theNode.parent.model.id);

						var droppedNode = theNode.drop();
						droppedNode.walk(function (node) {
							// MBL TODO: Go through the rest of the tree and update the documents to
							// be part of the parent folder.
							// console.log("node:", node.model.id);
						});
					}
					project.directoryStructure = {};
					project.directoryStructure = root.model;
					return project.save();
				})
				.then(function (p) {
					resolve(p.directoryStructure);
				});
		});
	},
	// Used for managing folder structures in the application.
	renameDirectory: function (projectId, folderId, newName) {
		var self = this;
		return new Promise(function(resolve, reject) {
			return self.findById(projectId)
				.then(function(project) {
					// check for manageFolders permission
					if (!project.userCan.manageFolders) {
						reject(new Error ("User is not permitted to manage folders for '" + project.name + "'."));
					} else {
						return project;
					}
				})
				.then(function (project) {
					// console.log("current structure:", project.directoryStructure);
					var tree = new TreeModel();
					if (!project.directoryStructure) {
						return project;
					}
					var root = tree.parse(project.directoryStructure);
					// Walk until the right folder is found
					var theNode = root.first(function (node) {
						return node.model.id === parseInt(folderId);
					});
					// If we found it, rename it as long as it's not the root.
					if (theNode && !theNode.isRoot()) {
						// console.log("found node:", theNode.model.id);
						// do not rename if there is a name conflict with siblings....
						var nname = _.trim(newName);
						var nameOk = true;
						var siblings = root.all(function (n) {
							if (n.parent && n.parent.model.id  === theNode.parent.model.id) {
								// console.log(n.model.name + ' is a sibling to ' + theNode.model.name + ' (' + nname + ')');
								if (_.toLower(n.model.name) === _.toLower(nname)) {
									// console.log('name conflict... do not rename.');
									nameOk = false;
								}
								return true;
							}
							return false;
						});
						if (nameOk) {
							theNode.model.name = _.trim(nname);
						}
					}
					project.directoryStructure = {};
					project.directoryStructure = root.model;
					return project.save();
				})
				.then(function (p) {
					resolve(p.directoryStructure);
				});
		});
	},
	moveDirectory: function (projectId, folderId, newParentId) {
		// TODO: Implement
		console.log("****Implement me****");
	},
	getDirectoryStructure: function (projectId) {
		return this.findById(projectId)
		.then(function (project) {
			return project.directoryStructure;
		});
	},
	// -------------------------------------------------------------------------
	//
	// Add a phase to the project from a baseCode.
	//
	// -------------------------------------------------------------------------
	addPhase: function (project, baseCode) {
		var self = this;
		var Phase = new PhaseClass (this.opts);
		var PhaseBase = new PhaseBaseClass(this.opts);
		var phases;
		// Load all phases.
		return PhaseBase.list()
			.then(function(allPhases) {
				phases = allPhases;
				// Initialize new Phase.
				return Phase.fromBase(baseCode, project);
			})
			.then(function (phase) {
				// Find correct ordering of new phase.
				var insertIndex = _.sortedIndexBy(project.phases, phase,
					function (p) {
						return _.findIndex(phases, { code: p.code });
					});

				project.phases.splice(insertIndex, 0, phase);
				
				return project;
			})
			.then(function(project) {
				return self.updateCurrentPhaseAndSave(project);
			});
	},
	// -------------------------------------------------------------------------
	//
	// Remove a phase from the project
	//
	// -------------------------------------------------------------------------
	removePhase: function (projectId, phaseId) {
		var self = this;
		var Phase = new PhaseClass (this.opts);
		var project;

		return self.findById(projectId)
			.then(function (p) {
				project = p;
				// Remove phase model.
				return Phase.findById(phaseId);
			})
			.then(function(phase) {
				return Phase.delete(phase);
			})
			.then(function() {
				var phaseIndex = _.findIndex(project.phases, function (p) {
					return p._id.equals(phaseId);
				});
				// Decrement currentPhase if current deleted.
				if (!project.currentPhase || project.currentPhase._id.equals(phaseId)) {
					var prevIndex = phaseIndex - 1;
					project.currentPhase = project.phases[prevIndex];
					project.currentPhaseCode = project.phases[prevIndex].code;
					project.currentPhaseName = project.phases[prevIndex].name;
				}

				// Remove phase reference.
				project.phases.splice(phaseIndex, 1);

				return project;
			})
			.then(function(project) {
				return self.updateCurrentPhaseAndSave(project);
			});
	},
	// -------------------------------------------------------------------------
	//
	// complete the current phase (does not start the next, just completes the
	// current but leaves it as the current phase)
	//
	// -------------------------------------------------------------------------
	completePhase: function (projectId, phaseId) {
		var self = this;
		var Phase = new PhaseClass(self.opts);
		return Phase.findById(phaseId)
			.then(function (phase) {
				return Phase.completePhase(phase);
			})
			.then(function () {
				return self.findById(projectId);
			})
			.then (function(project) {
				return self.updateCurrentPhaseAndSave(project);
			});
	},
	// -------------------------------------------------------------------------
	//
	// complete the current phase (does not start the next, just completes the
	// current but leaves it as the current phase)
	//
	// -------------------------------------------------------------------------
	uncompletePhase: function (projectId, phaseId) {
		var self = this;
		var Phase = new PhaseClass(self.opts);
		return Phase.findById(phaseId)
			.then(function (phase) {
				return Phase.uncompletePhase(phase);
			})
			.then(function () {
				return self.findById(projectId);
			})
			.then (function(project) {
				return self.updateCurrentPhaseAndSave(project);
			});
	},
	// -------------------------------------------------------------------------
	//
	// start the next phase (if the current phase is not completed then complete
	// it first)
	//
	// -------------------------------------------------------------------------
	startNextPhase: function (projectId) {
		var self = this;
		var Phase = new PhaseClass(self.opts);
		var project;

		return self.findById(projectId)
			.then(function(p) {
				project = p;

				if (!project.currentPhase) {
					return project;
				}
				//
				// this is a no-op if the phase is already completed so its ok
				//
				return Phase.completePhase(project.currentPhase);
			})
			.then(function () {
				if (!project.currentPhase) {
					return project;
				}

				var nextIndex = _.findIndex(project.phases, function (phase) {
						return phase._id.equals(project.currentPhase._id);
					}) + 1;

				project.currentPhase = project.phases[nextIndex];
				project.currentPhaseCode = project.phases[nextIndex].code;
				project.currentPhaseName = project.phases[nextIndex].name;

				return Phase.start(project.currentPhase);
			})
			.then(function () {
				return self.saveAndReturn(project);
			})
			.then(function () {
				return self.findById(project._id);
			});
	},
	// -------------------------------------------------------------------------
	//
	// publish, unpublish
	//
	// -------------------------------------------------------------------------
	updateCurrentPhaseAndSave: function (project) {
		for (var i = 0; i < project.phases.length - 1; ++i) {
			var curr = project.phases[i];
			var next = project.phases[i + 1];

			if (curr.status === 'In Progress') {
				break;
			}

			if (curr.status === 'Complete' && next.status === 'Not Started') {
				break;
			}
		}

		project.currentPhase = project.phases[i];
		project.currentPhaseCode = project.phases[i].code;
		project.currentPhaseName = project.phases[i].name;
		return this.saveAndReturn(project);
	},
	// -------------------------------------------------------------------------
	//
	// set a project to submitted
	//
	// -------------------------------------------------------------------------
	submit: function (project) {
		project.status = 'Submitted';
		//
		// select the right sector lead role
		//
		project.sectorRole = project.type.toLowerCase ();
		project.sectorRole = project.sectorRole.replace (/\W/g,'-');
		project.sectorRole = project.sectorRole.replace (/^-+|-+(?=-|$)/g, '');
		return this.saveDocument (project).then (function (p) {
			//
			// add the project to the roles and the roles to the project
			// this is where the project first becomes visible to EAO
			// through the project admin role and the sector lead role
			// (we dont wait on the promise here, just trust it)
			//
			//
			// TBD ROLES
			//
			return p;
			// return Roles.objectRoles ({
			// 	method      : 'add',
			// 	objects     : p,
			// 	type        : 'projects',
			// 	permissions : {submit : [p.adminRole, p.sectorRole]}
			// });
		});
	},
	// -------------------------------------------------------------------------
	//
	// publish, unpublish
	//
	// -------------------------------------------------------------------------
	publish: function (project, value) {
		var self = this;
		if (value) {
			//
			// add a news item
			//
			self.postMessage ({
				headline: 'New Assessment: '+project.name,
				content: 'New Environmental Assessment: '+project.name+'\n'+project.description,
				project: project._id,
				type: 'News'
			});
			project.publish ();
		}
		else project.unpublish ();
		return this.saveAndReturn (project);
	},
	// -------------------------------------------------------------------------
	//
	// only published projects, minimal get
	//
	// -------------------------------------------------------------------------
	published: function () {
		var self = this;
		var date = new Date(); // date we want to find open PCPs for... TODAY.

		var publishedProjects = new Promise(function(resolve, reject) {
			self.model.find ({ isPublished: true }, {_id: 1, code: 1, name: 1, region: 1, status: 1, eacDecision: 1, currentPhase: 1, lat: 1, lon: 1, type: 1, description: 1, memPermitID: 1})
				.sort ({ name: 1 })
				.populate ( 'currentPhase', 'name' )
				.exec(function(err, recs) {
					if (err) {
						reject(new Error(err));
					} else {
						resolve(recs);
					}
				});
		});

		var openPCPs = new Promise(function(resolve, reject) {
			CommentPeriod
				.aggregate([
					{$match: {"dateStarted": {'$lte': new Date(date)}, "dateCompleted": {'$gte': new Date(date)}}},
					{$group: {_id: '$project', count: {$sum: 1}}}
				], function(err, recs) {
					if (err) {
						reject(new Error(err));
					} else {
						resolve(recs);
					}
				});
		});


		return new Promise(function(resolve, reject) {
			var projects, pcps;
			publishedProjects.then(function(data) {
				projects = data;
				//console.log('projects = ' + JSON.stringify(projects, null, 4));
				return openPCPs;
			})
				.then(function(data) {
					pcps = data;
					//console.log('pcps = ' + JSON.stringify(pcps, null, 4));
					var results = [];
					_.forEach(projects, function(p) {
						var proj = JSON.parse(JSON.stringify(p));

						var pcp = _.find(pcps, function(o) { return o._id.toString() === p._id.toString();  });
						proj.openCommentPeriod = pcp ? pcp.count > 0 : false;

						results.push(proj);
					});
					return results;
				})
				.then(function(data) {
					//console.log('data = ' + JSON.stringify(data, null, 4));
					resolve(data);
				});
		});
	},
	// -------------------------------------------------------------------------
	//
	// just what I can write to
	//
	// -------------------------------------------------------------------------
	mine: function () {
		var self = this;

		//Ticket ESM-640.  If these are the user's only roles on a project, don't show the project.
		var ignoredSystemRoles = ['compliance-lead', 'project-eao-staff', 'project-qa-officer'];
		var findMyProjectRoles = function (username) {
			return new Promise(function (fulfill, reject) {
				// find all my projects where i have a role other than an ignored system role.
				Role.find({ user: username, role: {$nin: ignoredSystemRoles}, context: {$ne: 'application'} })
					.select ({context: 1, role: 1})
					.exec(function (error, data) {
					if (error) {
						reject(new Error(error));
					} else if (!data) {
						reject(new Error('findMyProjectRoles: Project IDs not found for username, no project roles assigned for: ' + username));
					} else {
						fulfill(data);
					}
				});
			});
		};
		var getMyProjects = function(projectRoles) {
			//console.log('projectRoles ',JSON.stringify(projectRoles));
			var projectIds = _.uniq(_.map(projectRoles, 'context'));
			//console.log('projectIds ',JSON.stringify(projectIds));
			var q = {
				_id: { "$in": projectIds },
				dateCompleted: { "$eq": null }
			};
			return new Promise(function(fulfill, reject) {
				ProjectModel.find (q)
					.select ({_id: 1, code: 1, name: 1, region: 1, status: 1, currentPhase: 1, lat: 1, lon: 1, type: 1, description: 1, read: 1 })
					.populate ('currentPhase', 'name')
					.sort ('name')
					.exec (function(error, data) {
					if (error) {
						reject(new Error(error));
					} else if (!data) {
						fulfill([]);
					} else {
						// this mimics querying to see if we have read access to this project.
						// because we have the project/roles, we can skip the overhead of going through the db controller and
						// adding the permissions and userCan to determine user access.
						// we need to save that overhead and waits as those operations read from users/roles/permissions tables.
						var readProjects = _.map(data, function(d) {
							var projRoles = _.filter(projectRoles, function(x) { return x.context === d._id.toString(); });
							var roles = _.uniq(_.map(projRoles, 'role'));
							var read = d.read;
							var matched = _.intersection(read, roles);
							if (matched.length > 0) {
								return d;
							}
						});
						fulfill(readProjects);
					}
				});
			});
		};

		return findMyProjectRoles(self.user.username)
			.then(function(prs) {
				return getMyProjects(prs);
			})
			.then(function(projects) {
				return projects;
			});
	},

	initDefaultRoles : function(project) {
		console.log('initDefaultRoles(' + project.code + ')');
		var defaultRoles = [];

		project.adminRole = 'project-system--admin';
		project.proponentAdminRole = 'proponent-lead';
		//project.eaoInviteeRole = undefined;
		//project.proponentInviteeRole = undefined;
		project.eaoMember = 'project-eao-staff';
		project.proMember = 'proponent-team';

		defaultRoles.push(project.eaoMember);
		defaultRoles.push(project.proMember);

		return Promise.resolve (project);
	},

	removeProject: function (project) {
		// Get all the artifacts and delete them
		// console.log("deleting artifacts for project: ", project._id)
		return ArtifactModel.find({project : project })
		.then( function (arts) {
			var deleteDocs = [];
			_.each(arts, function (art) {
				_.each(art.internalDocuments, function (doc) {
					deleteDocs.push(doc);
				});
				_.each(art.additionalDocuments, function (doc) {
					deleteDocs.push(doc);
				});
				_.each(art.supportingDocuments, function (doc) {
					deleteDocs.push(doc);
				});
				// Delete document
				if (art.document) {
					deleteDocs.push(art.document);
				}
			});
			// console.log("docs to delete:", deleteDocs);
			return _.uniq(deleteDocs);
		})
		.then( function (promises) {
			var deleteDocs = function(item, query) {
				return new Promise(function (rs, rj) {
					// Delete it!
					// console.log("deleting doc:", item);
					DocumentModel.findOne({_id: item})
					.then( function (doc) {
						// console.log("found doc to delete:", doc);
						var fs = require('fs');
						fs.unlinkSync(doc.internalURL);
						return doc._id;
					})
					.then( function (docID) {
						return DocumentModel.remove({_id: docID});
					})
					.then(rs, rj);
				});
			};

			Promise.resolve ()
			.then (function () {
				return promises.reduce (function (current, item) {
					return current.then (function () {
						return deleteDocs(item);
					});
				}, Promise.resolve());
			});
		})
		.then( function () {
			return ArtifactModel.remove({project: project._id});
		})
		.then( function () {
			return VcModel.remove({project: project._id});
		})
		.then( function () {
			return ProjectConditionModel.remove({project: project._id});
		})
		.then( function () {
			return MilestoneModel.remove({project: project._id});
		})
		.then( function () {
			return InspectionreportModel.remove({project: project._id});
		})
		//
		// TBD: Need to purge more colleciton types from project?
		//
		.then( function () {
			// console.log("deleting project:", project._id);
			return ProjectModel.remove({_id: project._id});
		});
	}
});
