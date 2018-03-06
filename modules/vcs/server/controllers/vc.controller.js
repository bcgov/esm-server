'use strict';
// =========================================================================
//
// Controller for vcs
//
// =========================================================================
var path = require('path');
var DBModel = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var Artifact = require (path.resolve('./modules/artifacts/server/controllers/artifact.controller'));
var mongoose = require('mongoose');
var ArtifactModel = mongoose.model('Artifact');
var CommentModel = mongoose.model('Comment');
var VcModel = mongoose.model('Vc');

module.exports = DBModel.extend ({
  name : 'Vc',
  plural : 'vcs',
  sort: 'name title',
  getForProject: function (projectId) {
    return this.list ({project:projectId},{},{name:1});
  },
  // -------------------------------------------------------------------------
  //
  // get all vcs from a supplied list
  //
  // -------------------------------------------------------------------------
  getList : function (list) {
    return this.list ({_id : {$in : list }});
  },
  getVcList : function (vclist) {
    return VcModel.find ({_id: { $in: vclist.split(',')}}, { _id: 1, name: 1, isPublished: 1});
  },
  publish: function (vc) {
    var artifact = new Artifact(this.opts);
    return new Promise(function (resolve, reject) {
      vc.publish();
      vc.save()
        .then(function(){
          return artifact.oneIgnoreAccess({_id: vc.artifact});
        })
        .then(function (art) {
          return artifact.publish(art);
        })
        .then(function () {
          return vc;
        })
        .then(resolve, reject);
    });
  },
  unpublish: function(vc) {
    var artifact = new Artifact(this.opts);
    return new Promise(function (resolve, reject) {
      vc.unpublish();
      vc.save()
        .then(function(){
          return artifact.oneIgnoreAccess({_id: vc.artifact});
        })
        .then(function (art) {
          return artifact.unpublish(art);
        })
        .then(function () {
          return vc;
        })
        .then(resolve, reject);
    });
  },

  deleteCheck : function(vc) {
    var self = this;
    var result = {
      canDelete: true,
      artifacts: [],
      comments: [],
      vcs: []
    };

    return ArtifactModel.find({valuedComponents : vc._id, _id: {$ne : vc.artifact} })
      .exec()
      .then(function(data) {
        if (data && data.length > 0) {
          result.artifacts = data;
          result.canDelete = false;
        }
        return CommentModel.find({valuedComponents : vc._id}).exec();
      })
      .then(function(data) {
        if (data && data.length > 0) {
          result.comments = data;
          result.canDelete = false;
        }
        return self.model.find({subComponents : vc._id}).exec();
      })
      .then(function(data) {
        if (data && data.length > 0) {
          result.vcs = data;
          result.canDelete = false;
        }
        return result;
      });
  },

  deleteWithCheck: function(vc) {
    var self = this;

    return self.deleteCheck(vc)
      .then(function(data) {
        if (data && !data.canDelete) {
          return Promise.reject(data);
        } else {
          return data;
        }
      })
      .then(function(/* data */) {
        return self.delete(vc);
      })
      .then(function(data) {
        return new Promise(function(resolve, reject) {
          ArtifactModel.remove({_id: data.artifact}, function(err) {
            if (err) {reject(new Error(err));}
            resolve(data.artifact);
          });
        });
      })
      .then(function(/* data */) {
        return Promise.resolve(vc);
      }, function(err) {
        return Promise.reject(err);
      });
  }
});

