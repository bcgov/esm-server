'use strict';
// =========================================================================
//
// Controller for orgs
//
// =========================================================================
var path        = require('path');
var DBModel     = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _           = require ('lodash');
var mongoose    = require ('mongoose');
var Model       = mongoose.model ('RecentActivity');
var ProjectModel       = mongoose.model ('Project');

module.exports = DBModel.extend ({
	name : 'RecentActivity',
	plural : 'recentactivities',
	// -------------------------------------------------------------------------
	//
	// get activities which are active, sorted by Public Comment period, then
	// subsorted on type
	//
	// -------------------------------------------------------------------------
	getRecentActivityActive: function () {
		var p = Model.find ({active:true},
							{},
							{}).sort({dateAdded: -1}).limit(10); // Quick hack to limit the front page loads.
		return new Promise (function (resolve, reject) {
			p.then(function (doc) {
				var pcSort = _.partition(doc, { type: "Public Comment Period" });
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
		return new Promise (function (resolve, reject) {
			var p = Model.find ({ active: true, project: id },
								{},
								{}).sort({dateAdded: -1}).limit(25);
			p.then(function (doc) {
				var pcSort = _.partition(doc, { type: "Public Comment Period" });
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
	}
});
