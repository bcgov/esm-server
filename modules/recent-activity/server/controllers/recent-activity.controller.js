'use strict';
// =========================================================================
//
// Controller for orgs
//
// =========================================================================
var path        = require('path');
var DBModel     = require (path.resolve('./modules/core/server/controllers/cc.dbmodel.controller'));
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
							{}).sort({dateUpdated: -1}).limit(10); // Quick hack to limit the front page loads.
		return new Promise (function (resolve, reject) {
			p.then(function (doc) {
				var pcSort = _.partition(doc, { type: "Public Comment Period" });
				var pcp = pcSort[0];
				var news = pcSort[1];
				var pcSortPriority = _.sortBy(pcp, function (o) {
					return o.priority;
				});
				var newsSortPriority = _.sortBy(news, function (o) {
					return o.priority;
				});

				resolve(pcSortPriority.concat(newsSortPriority));
			}, reject);
		});
	},
	getRecentActivityByProjectId: function (id) {
		return new Promise (function (resolve, reject) {
			var p = Model.find ({ active: true, project: id },
								{},
								{}).sort({dateUpdated: -1}).limit(25);
			p.then(function (doc) {
				var pcSort = _.partition(doc, { type: "Public Comment Period" });
				var pcp = pcSort[0];
				var news = pcSort[1];
				var pcSortPriority = _.sortBy(pcp, function (o) {
					return o.priority;
				});
				var newsSortPriority = _.sortBy(news, function (o) {
					return o.priority;
				});

				resolve(pcSortPriority.concat(newsSortPriority));
			}, reject);
		});
	}
});
