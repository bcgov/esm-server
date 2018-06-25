'use strict';
// =========================================================================
//
// Controller for orgs
//
// =========================================================================
var path = require('path');
var DBModel = require(path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _ = require('lodash');
var mongoose = require('mongoose');
var Model = mongoose.model('RecentActivity');
var ProjectModel = mongoose.model('Project');
var CommentPeriodModel = mongoose.model('CommentPeriod');

module.exports = DBModel.extend({
  name: 'RecentActivity',
  plural: 'recentactivities',
  populate: [{
    path: 'project',
    select: {
      'code': 1,
      'name': 1
    }
  }],
  // -------------------------------------------------------------------------
  //
  // get activities which are active, sorted by Public Comment period, then
  // subsorted on type
  //
  // -------------------------------------------------------------------------
  getRecentActivityActive: function () {
    var p = Model.find({
      active: true
    }, {}, {}).sort({
      dateAdded: -1
    }).limit(10); // Quick hack to limit the front page loads.
    return new Promise(function (resolve, reject) {
      p.then(function (doc) {
        var pcSort = _.partition(doc, {
          type: "Public Comment Period"
        });
        var pcp = pcSort[0];
        var news = pcSort[1];
        // sort by date Added descending, then by priority ascending..., then by dateUpdated descending
        pcp.sort(function (a, b) {
          return (b.dateAdded - a.dateAdded) || (a.priority - b.priority) || (b.dateUpdated - a.dateUpdated);
        });

        news.sort(function (a, b) {
          return (b.dateAdded - a.dateAdded) || (a.priority - b.priority) || (b.dateUpdated - a.dateUpdated);
        });

        resolve(pcp.concat(news));
      }, reject);
    });
  },

  getRecentActivityByProjectId: function (id) {
    return new Promise(function (resolve, reject) {
      var p = Model.find({
        active: true,
        project: id
      }, {}, {}).sort({
        dateAdded: -1
      }).limit(25);
      p.then(function (doc) {
        var pcSort = _.partition(doc, {
          type: "Public Comment Period"
        });
        var pcp = pcSort[0];
        var news = pcSort[1];
        // sort by date Added descending, then by priority ascending..., then by dateUpdated descending
        pcp.sort(function (a, b) {
          return (b.dateAdded - a.dateAdded) || (a.priority - b.priority) || (b.dateUpdated - a.dateUpdated);
        });

        news.sort(function (a, b) {
          return (b.dateAdded - a.dateAdded) || (a.priority - b.priority) || (b.dateUpdated - a.dateUpdated);
        });

        resolve(pcp.concat(news));
      }, reject);
    });
  },

  // Make this activity pinned.
  pinActivity: function (activityId) {
    var self = this;
    return self.findById(activityId)
      .then(function (a) {
        // Find the activity
        a.pinned = !a.pinned;
        return a;
      })
      .then(function (activity) {
        // Pinning or not
        if (activity.pinned) {
          return self.findMany({
            pinned: true
          }).then(function (activities) {
            if (activities.length >= 4) {
              return Promise.reject(new Error("You are only allowed a maximum of four (4) pinned items in this list. Please remove one before assigning another pinned item."));
            } else {
              return activity.save();
            }
          });
        } else {
          // Just save it, we're un-pin mode.
          return activity.save();
        }
      });
  },
  /*
   * Retirns all the active recent activities for the specified project
   */
  getRecentActivityForProject: function (projectCode) {
    var self = this;

    return ProjectModel.findOne({
      code: projectCode
    }).then(function (project) {
      return self.model.find({
        project: project._id
      }).sort({
        date: -1
      }).exec();
    })
  },

  /**
   * Returns all comment periods for the specified projectId.
   * @param projectId the project._id.
   */
  getCommentPeriodsForProject: function (projectId) {
    return CommentPeriodModel.find({
      project: projectId
    }).populate('project', 'code').exec();
  }
});
