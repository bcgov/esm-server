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
var FolderClass = require (path.resolve('./modules/folders/server/controllers/core.folder.controller'));

module.exports = DBModel.extend ({
	name : 'Project',
	plural : 'projects',
	sort: {name:1},
	populate: [{path: 'currentPhase'}, {path: 'phases'}, {path: 'phases.milestones'}, {path: 'phases.milestones.activities'}, {path: 'proponent'}, {path: 'primaryContact', select: { 'salt': 0, 'password': 0}}],
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
		// console.log("adding dir:", folderName);
		var self = this;
		var newNodeId;
		return new Promise(function (resolve, reject) {
			return self.findById(projectId)
			.then(function(project) {
				// check for manageFolders permission
				if (!project.userCan.manageFolders) {
					return Promise.reject(new Error ("User is not permitted to manage folders for '" + project.name + "'."));
				} else {
					return project;
				}
			})
			.then(function (project) {
				// Check if the folder name already exists.
				var f = new FolderClass (self.opts);
				return f.findOne({parentID: parentId, project: projectId, displayName: folderName})
				.then(function (folder) {
					if (folder) {
						return Promise.reject(new Error("Folder name already exists."));
					} else {
						return project;
					}
				});
			})
			.then(function (project) {
				// console.log("current structure:", project.directoryStructure);
				var tree = new TreeModel();
				if (!project.directoryStructure) {
					// console.log("setting default");
					// TODO: bring this in from DB instead of hardcoding
					project.directoryStructure = {id: 1, name: 'ROOT', lastId: 1, published: true};
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
					// Need to add order property to the folder item to apply alternate sorting
					var node = theNode.addChild(tree.parse({id: root.model.lastId, name: folderName, order: 0, published: false}));
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
					var f = new FolderClass (self.opts);
					return f.create({displayName: folderName, directoryID: newNodeId, parentID: parentId, project: p})
					.then(function () {
						resolve(p.directoryStructure);
					});
				} else {
					reject(new Error("ERR: Couldn't create directory."));
				}
			})
			.catch(function (err) {
				reject(err);
			});
		});
	},
	// Used for managing folder structures in the application.
	removeDirectory: function (projectId, folderId) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var f = new FolderClass (self.opts);
			// First find any documents that have this id as a parent.
			return DocumentModel.find({directoryID: parseInt(folderId), project: projectId})
			.then(function (doc) {
				// console.log("doc:", doc);
				if (doc.length !== 0) {
					// bail - this folder contains published files.
					return Promise.reject(doc);
				}
				return self.findById(projectId); 
			})
			.then(function (project) {
				//create the tree model
				var tree = new TreeModel();
				if (!project.directoryStructure) {
					return project;
				}
				//parse the tree
				var root = tree.parse(project.directoryStructure);
				// Walk until the right folder is found
				var theNode = root.first(function (node) {
					return node.model.id === parseInt(folderId);
				});
				//check if it has children
				if (theNode.hasChildren()) {
					return Promise.reject(project); //need to have an object inside the promise
				}
				return project; //fetch the database again for project
			})
			.then(function (project) {
				// check for manageFolders permission
				if (!project.userCan.manageFolders) {
					return Promise.reject(project);
					//reject(new Error ("User is not permitted to manage folders for '" + project.name + "'."));
				} else {
					return f.findOne({directoryID: folderId, project: projectId});
				}
			})
			.then(function (dir) {
				// console.log("dir:");
				return f.oneIgnoreAccess({_id: dir._id})
				.then(function (d) {
					return f.delete(d);
				})
				.then(function () {
					return self.findById(projectId);
				});
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
			})
			.catch(function (err) {
				reject(err);
			});
		});
	},
	// Used for managing folder structures in the application.
	renameDirectory: function (projectId, folderId, newName) {
		var self = this;
		return new Promise(function(resolve, reject) {
			var f = new FolderClass (self.opts);
			var _dir = null;
			return f.findOne({directoryID: folderId, project: projectId})
				.then(function (dir) {
					// console.log("dir:", dir);
					return f.oneIgnoreAccess({_id: dir._id})
					.then(function (d) {
						d.displayName = newName;
						_dir = d;
						return self.findById(projectId);
					});
				})
				.then(function (project) {
					// check for manageFolders permission
					if (!project.userCan.manageFolders) {
						return Promise.reject(new Error ("User is not permitted to manage folders for '" + project.name + "'."));
					} else {
						return project;
					}
				})
				.then(function (project) {
					// Check if the folder name already exists.
					return f.findOne({parentID: folderId, project: projectId, displayName: newName})
					.then(function (folder) {
						if (folder) {
							return Promise.reject(new Error("Folder name already exists."));
						} else {
							return project;
						}
					});
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
					if (p) {
						_dir.save()
						.then(function () {
							resolve(p.directoryStructure);
						});
					} else {
						reject(new Error("ERR: Couldn't rename directory."));
					}
				})
				.catch(function (err) {
					reject(err);
				});
		});
	},
	moveDirectory: function (projectId, folderId, newParentId) {
		var self = this;
		return new Promise(function(resolve, reject) {
			var f = new FolderClass (self.opts);
			var _dir = null;
			return f.findOne({directoryID: folderId, project: projectId})
				.then(function (dir) {
					// console.log("dir:", dir);
					return f.oneIgnoreAccess({_id: dir._id})
					.then(function (d) {
						d.parentID = newParentId;
						_dir = d;
						return self.findById(projectId);
					});
				})
				.then(function (project) {
					// check for manageFolders permission
					if (!project.userCan.manageFolders) {
						return Promise.reject(new Error ("User is not permitted to manage folders for '" + project.name + "'."));
					} else {
						return project;
					}
				})
				.then(function (project) {
					//console.log("current structure:", project.directoryStructure);
					var tree = new TreeModel();
					if (!project.directoryStructure) {
						return project;
					}
					var root = tree.parse(project.directoryStructure);
					// Walk until the right folder is found
					var theNode = root.first(function (node) {
						return node.model.id === parseInt(folderId);
					});
					var theParent = root.first(function(node) {
						return node.model.id === parseInt(newParentId);
					});
					// If we found it, rename it as long as it's not the root.
					if (theParent && theNode && !theNode.isRoot()) {
						//console.log("found node:", theNode.model.id);
						//console.log("found new parent:", theParent.model.id);
						var newKid = theNode.drop();
						theParent.addChild(newKid);
					}
					project.directoryStructure = {};
					project.directoryStructure = root.model;
					//console.log("new structure:", project.directoryStructure);
					return project.save();
				})
				.then(function (p) {
					if (p) {
						_dir.save()
						.then(function () {
							resolve(p.directoryStructure);
						});
					} else {
						reject(new Error("ERR: Couldn't move directory."));
					}
				})
				.catch(function () {
					reject(new Error("ERR: Couldn't move directory."));
				});
		});
	},
	getDirectoryStructure: function (projectId) {
		var self = this;
		var folders = [];
		return new Promise(function (resolve, reject) {
			var f = new FolderClass (self.opts);
			return f.list({project: projectId})
			.then(function (foldersViewable) {
				// console.log("Folders viewable:", foldersViewable);
				folders = foldersViewable;
				return self.findById(projectId);
			})
			.then(function (project) {
				var tree = new TreeModel();
				if (!project.directoryStructure) {
					project.directoryStructure = {id: 1, name: 'ROOT', lastId: 1, published: true};
				}
				var root = tree.parse(project.directoryStructure);
				root.all(function (node) {
				    return true;
				    // return node.model.published !== true;
				}).forEach( function (n) {
					// console.log("n:", n.model.id);
					var found = folders.find(function (el) {
						// console.log("el:", el.directoryID);
						return el.directoryID === parseInt(n.model.id);
					});
					// Make sure we could have read that folder, otherwise consider it dropped.
					// console.log("FOUND:", found);
					if (!found) {
						// console.log("dropping node:", n);
						n.drop();
					}
				});

				resolve(root.model);
			})
			.catch(function (err) {
				console.log("Err:", err);
				resolve({id: 1, name: 'ROOT', lastId: 1, published: true});
			});
		});
	},
	publishDirectory: function (projectId, directoryId) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var root = null;
			var _dir = null;
			var f = new FolderClass (self.opts);
			return f.findOne({directoryID: directoryId, project: projectId})
			.then(function (dir) {
				return f.oneIgnoreAccess({_id: dir._id})
				.then(function (d) {
					_dir = d;
					return self.findById(projectId);
				});
			})
			.then(function (project) {
				// check for manageFolders permission
				if (!project.userCan.manageFolders) {
					return Promise.reject(new Error ("User is not permitted to manage folders for '" + project.name + "'."));
				} else {
					return project;
				}
			})
			.then(function (project) {
				var tree = new TreeModel();
				if (!project.directoryStructure) {
					project.directoryStructure = {id: 1, name: 'ROOT', lastId: 1, published: true};
					return project.directoryStructure;
				}
				root = tree.parse(project.directoryStructure);
				var node = root.first(function (n) {
					// Do it this way because parseInt(directoryId) strips away string chars and leaves
					// the numbers, resulting in potentially unintended consequence
					return ('' + n.model.id) === directoryId;
				});
				if (node) {
					// set it to published.
					node.model.published = true;
					project.directoryStructure = {};
					project.directoryStructure = root.model;
					return self.saveAndReturn(project);
				} else {
					// console.log("couldn't find requested node.");
					return null;
				}
			}).then(function (p) {
				if (p) {
					_dir.publish();
					_dir.save()
					.then(function () {
						resolve(root.model);
					});
				} else {
					reject(root.model);
				}
			})
			.catch(function () {
				reject(new Error ("Could not publish directory."));
			});
		});
	},
	unPublishDirectory: function (projectId, directoryId) {
		var self = this;
		return new Promise(function(resolve, reject) {
			var root = null;
			var _dir = null;
			var f = new FolderClass (self.opts);
			return f.findOne({directoryID: directoryId, project: projectId})
			.then(function (dir) {
				return f.oneIgnoreAccess({_id: dir._id})
				.then(function (d) {
					_dir = d;
					return self.findById(projectId);
				});
			})
			.then(function (project) {
				// check for manageFolders permission
				if (!project.userCan.manageFolders) {
					return Promise.reject(new Error ("User is not permitted to manage folders for '" + project.name + "'."));
				} else {
					return project;
				}
			})
			.then(function (project) {
				var tree = new TreeModel();
				if (!project.directoryStructure) {
					project.directoryStructure = {id: 1, name: 'ROOT', lastId: 1, published: true};
					return project.directoryStructure;
				}
				root = tree.parse(project.directoryStructure);
				var node = root.first(function (n) {
					// Do it this way because parseInt(directoryId) strips away string chars and leaves
					// the numbers, resulting in potentially unintended consequence
					return ('' + n.model.id) === directoryId;
				});
				if (node) {
					// Check if it contains published items first.
					var pnode = node.first(function (w) {
						if (node.model.id !== w.model.id && w.model.published === true) return true;
					});
					if (pnode) {
						return null;
					}
					// See if any documents are published.
					// console.log("finding:", {directoryID: parseInt(directoryId), isPublished: true})
					return DocumentModel.find({project: projectId, directoryID: parseInt(directoryId), isPublished: true})
					.then( function (doc) {
						// console.log("doc:", doc);
						if (doc.length !== 0) {
							// bail - this folder contains published files.
							return Promise.reject(doc);
						}
						// set it to unpublished.
						node.model.published = false;
						project.directoryStructure = {};
						project.directoryStructure = root.model;
						return self.saveAndReturn(project);
					});
				} else {
					// console.log("couldn't find requested node.");
					return null;
				}
			}).then(function (p) {
				if (p) {
					_dir.unpublish();
					_dir.save()
					.then(function () {
						resolve(root.model);
					});
				} else {
					reject(root.model);
				}
			})
			.catch(function (err) {
				reject(err);
			});
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
				headline: project.name,
				content: project.description,
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

		var getPCPs = new Promise(function(resolve, reject) {
			CommentPeriod.find ()
				.exec(function(err, recs) {
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
				return getPCPs;
			})
				.then(function(data) {
					pcps = data;
					//console.log('pcps = ' + JSON.stringify(pcps, null, 4));
					var results = [];
					_.forEach(projects, function(p) {
						var proj = JSON.parse(JSON.stringify(p));

						var pcp = _.filter(pcps, function(o) {
							//console.log("filter", o.project, p._id.toString());
							return o.project.toString() === p._id.toString();
						});
						proj.openCommentPeriod = CommentPeriod.MaxOpenState(pcp);

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
		if (!self.user.username) {
			// console.log("No user name ", self.user);
			return Promise.reject("Unauthorized");
		}
		// For comprehensive description of the rules see EPIC-1035
		var isProjectIntake = _.find(self.opts.userRoles, function(r) { return r === 'project-intake'; }) !== undefined;

		//Ticket ESM-640.  If these are the user's only roles on a project, don't show the project.
		// This is because these roles are added to all projects.
		var ignoredSystemRoles = ['compliance-lead', 'project-eao-staff', 'project-qa-officer', 'project-intake'];
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
						var readProjects = [];
						_.each(data, function(d) {
							var projRoles = _.filter(projectRoles, function(x) { return x.context === d._id.toString(); });
							var roles = _.uniq(_.map(projRoles, 'role'));
							var read = d.read;
							var matched = _.intersection(read, roles);
							if (matched.length > 0) {
								readProjects.push(d);
							}
						});
						fulfill(readProjects);
					}
				});
			});
		};

		var getUnpublishedProjects = function() {
			if (!isProjectIntake) {
				return Promise.resolve([]);
			} else {
				var q = {
					dateCompleted: { "$eq": null },
					isPublished: false
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
								fulfill(data);
							}
						});
				});
			}
		};

		var addAllMyProjectRoles = function (username, projList) {
			var projectIds = _.uniq(_.map(projList, '_id'));
			return new Promise(function (fulfill, reject) {
				Role.find({ user: username, context: {$in: projectIds} })
				.select ({context: 1, role: 1})
				.exec(function (error, data) {
					if (error) {
						reject(new Error(error));
					} else if (!data) {
						reject(new Error('findAllMyProjectRoles: Project IDs not found for username, no project roles assigned for: ' + username));
					} else {
						_.forEach(projList, function (project) {
							var projRoles = _.filter(data, function(x) { return x.context === project._id.toString(); });
							project.userProjectRoles = _.uniq(_.map(projRoles, 'role'));

							var proponentRoles = _.filter(project.userProjectRoles, function(role) {
								return _.indexOf(["project-system-admin", "proponent-lead", "proponent-team"],role) > -1;
							});
							project.userCanUpload = _.size(proponentRoles) > 0;

							var staffRoles = _.filter(project.userProjectRoles, function(role) {
								return _.indexOf(["project-system-admin", "assessment-admin", "assessment-lead", "assessment-team", "project-epd"],role) > -1;
							});
							project.userCanMove = _.size(staffRoles) > 0;
						});
						fulfill(projList);
					}
				});
			});
		};

		var addDropZoneDocumentsForProjects =  function (projList) {
			var projectIds = _.uniq(_.map(projList, '_id'));
			var query = {
				project: {$in: projectIds},
				$and: [
					{documentSource: 'DROPZONE'},
					{directoryID: 0} // not yet moved into the project directory structure
				]
			};
			var sort = { dateUploaded: 'descending'};
			return new Promise(function(fulfill, reject) {
				DocumentModel.find (query)
				.sort(sort)
				.exec (function(error, data) {
					if (error) {
						reject(new Error(error));
					} else if (!data) {
						fulfill([]);
					} else {
						_.forEach(projList, function (project) {
							project.dropZoneFiles = _.filter(data, function (doc) {
								return doc.project.toString() === project._id.toString();
							});
						});
						fulfill(projList);
					}
				});
			});
		};

		var projects, unpublishedprojects, allprojects = [];
		return findMyProjectRoles(self.user.username)
			.then(function(prs) {
				return getMyProjects(prs);
			})
			.then(function(results) {
				projects = results || [];
				return getUnpublishedProjects();
			})
			.then(function(results) {
				unpublishedprojects = results || [];

				allprojects = projects;

				_.each(unpublishedprojects, function(o) {
					if (_.find(projects, function(p) { return p._id.toString() === o._id.toString(); }) === undefined) {
						allprojects.push(o);
					}
				});

				allprojects = _.sortBy(allprojects, function(o) { return o.name; });

				// The following will extend each project with new properties to be used by clients.
				// The Mongoose object can not be extended so convert all projects to plain JS objects
				allprojects = _.map(allprojects,function(p) {return p.toObject();});
				return allprojects;
			})
			.then(function(results){
				return addDropZoneDocumentsForProjects(results);
			})
			.then(function(results){
				return addAllMyProjectRoles(self.user.username, results);
			})
			.then(function(results){
				return results;
			})
		;
	},
	forProponent: function (id) {
		// show this list for an org in the system/management screens.
		// mimic the resuts found on front screen, except for an org and don't care about being published
		var self = this;
		var date = new Date(); // date we want to find open PCPs for... TODAY.

		var orgProjects = new Promise(function(resolve, reject) {
			self.model.find ({ proponent: id }, {_id: 1, code: 1, name: 1, region: 1, status: 1, eacDecision: 1, currentPhase: 1, lat: 1, lon: 1, type: 1, description: 1, memPermitID: 1, isPublished: 1})
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
					{$match: {"isPublished" : true, "dateStarted": {'$lte': new Date(date)}, "dateCompleted": {'$gte': new Date(date)}}},
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
			orgProjects.then(function(data) {
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
