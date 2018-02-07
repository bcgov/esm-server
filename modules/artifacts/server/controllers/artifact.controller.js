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
var _ = require('lodash');
var DocumentClass = require (path.resolve('./modules/documents/server/controllers/core.document.controller'));
var ObjectID = require('mongodb').ObjectID;

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
      if (!project) {return reject(new Error(prefix + 'missing project'));}
      if (!project.currentPhase) {return reject(new Error(prefix + 'missing current phase'));}
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
          if (!atype) {return reject(new Error(prefix + 'cannot locate artifact type'));}
          else {
            artifactType = atype;
            //
            // if this is a template artifact get the latest version of the template
            //
            if (artifactType.isTemplate) {return template.findFirst({code: code}, null, {versionNumber: -1});}
          }
        })
      //
      // if template, check that have it as well
      //
        .then(function (t) {
          //
          // if its a template, but the template was not found then fail
          //
          if (artifactType.isTemplate && !t) {return reject(prefix + 'cannot find template');}
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
        .then(function () {
          // Remove the magic w.r.t. schedule
          return null;
        })
      //
      // now set up and save the new artifact
      //
        .then(function (milestone) {
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
        .then(function() {
          self.setForce(true);
          return self.saveDocument(artifact);
        })
        .then(function(a) {
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
    var artifactTypeDefaults = {};
    return new Promise(function (resolve, reject) {
      self.getModelPermissionDefaults ()
        .then(function (result) {
          if (result) {artifactTypeDefaults = result.defaults.permissions;}
        })
        .then(Types.getMultiples)
        .then(function (result) {
          if (result) {multiples = result;}
        })
        .then(Types.getNonMultiples)
        .then(function (result) {
          if (result) {nonmultiples = result;}
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
              return new Promise(function (resolve/* , reject */) {
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
    if (_.isEmpty(doc.document)) {doc.document = null;}

    var self = this;
    return this.update(oldDoc, doc)
      .then(function (model) {
        //
        // once saved go and create the new activity if one is listed under
        // this stage
        //

        ///////////////////////////////////////////////////////////////////////////////
        // NB: This will never run since milestones should not be automatically created
        ///////////////////////////////////////////////////////////////////////////////

        if (model.milestone && next.activity) {
          var m = new MilestoneClass(self.opts);
          var a = new ActivityClass(self.opts);
          return m.findById(model.milestone)
            .then(function (milestone) {
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
        if (err) {return reject(err);}
        else {resolve(result);}
      });
    });
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
          return documentClass.publish(artifact.document);
        })
        .then(function () {
          return documentClass.getListIgnoreAccess(artifact.additionalDocuments);
        })
        .then(function (list) {
          var a = _.forEach(list, function (d) {
            return new Promise(function (resolve/* , reject */) {
              resolve(documentClass.publish(d));
            });
          });
          return Promise.all(a);
        })
        .then(function () {
          return documentClass.getListIgnoreAccess(artifact.supportingDocuments);
        })
        .then(function (list) {
          var a = _.forEach(list, function (d) {
            return new Promise(function (resolve/* , reject */) {
              resolve(documentClass.publish(d));
            });
          });
          return Promise.all(a);
        })
        .then(function () {
          return documentClass.getListIgnoreAccess(artifact.internalDocuments);
        })
        .then(function (list) {
          var a = _.forEach(list, function (d) {
            return new Promise(function (resolve/* , reject */) {
              resolve(documentClass.unpublish(d));
            });
          });
          return Promise.all(a);
        })
        .then(function () {
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
          return documentClass.unpublish(artifact.document);
        })
        .then(function () {
          return documentClass.getListIgnoreAccess(artifact.additionalDocuments);
        })
        .then(function (list) {
          var a = _.forEach(list, function (d) {
            return new Promise(function (resolve/* , reject */) {
              resolve(documentClass.unpublish(d));
            });
          });
          return Promise.all(a);
        })
        .then(function () {
          return documentClass.getListIgnoreAccess(artifact.supportingDocuments);
        })
        .then(function (list) {
          var a = _.forEach(list, function (d) {
            return new Promise(function (resolve/* , reject */) {
              resolve(documentClass.unpublish(d));
            });
          });
          return Promise.all(a);
        })
        .then(function () {
          return documentClass.getListIgnoreAccess(artifact.internalDocuments);
        })
        .then(function (list) {
          var a = _.forEach(list, function (d) {
            return new Promise(function (resolve/* , reject */) {
              resolve(documentClass.unpublish(d));
            });
          });
          return Promise.all(a);
        })
        .then(function () {
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
          permissions[stage.name] = (!stage.role) ? true : _.includes(self.opts.userRoles, stage.role);
        });

        return permissions;
      });
  },
  mine: function () {
    return new Promise(function(resolve/* , reject */) {
      resolve([]);
    });
  },
});
