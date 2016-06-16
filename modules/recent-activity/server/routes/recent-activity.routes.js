'use strict';
// =========================================================================
//
// Routes for orgs
//
// =========================================================================
var policy = require('../policies/recent-activity.policy');
var RecentActivity = require('../controllers/recent-activity.controller');
var Project = require(require('path').resolve('./modules/projects/server/controllers/project.controller'));
var helpers = require('../../../core/server/controllers/core.helpers.controller');
var _ = require('lodash');

module.exports = function(app) {
	helpers.setCRUDRoutes(app, 'recentActivity', RecentActivity, policy);

	//
	// all active activities
	//
	app.route('/api/recentactivity/active/list')
		.all(policy.isAllowed)
		.get(function(req, res) {
			var p = new RecentActivity();
			p.getRecentActivityActive()
				.then(helpers.success(res), helpers.failure(res));
		});
	app.route('/api/recentactivity/active/rss')
		.all(policy.isAllowed)
		.get(function(req, res) {
			var myHost = req.protocol + '://' + req.get('host');
			var myURL = myHost + req.originalUrl;
			var projects = [];
			var prj = new Project(req.user);
			prj.list()
				.then(function(projectObjects) {
					var p = new RecentActivity();
					p.getRecentActivityActive()
						.then(function(data) {
							var RSS = require('rss');
							var feedOptions = {
								title: 'Environmental Assessment Office - News & Announcements',
								description: 'News & Announcements for the Environmental Assessment Office',
								link: myHost,
								feed_url: myURL,
								site_url: myHost,
								image_url: myHost + "/favicon.ico",
								pubDate: new Date(),
								ttl: '60'
							};
							var feed = new RSS(feedOptions);

							_.forEach(data, function(item) {
								var prjCode = _.result(_.find(projectObjects, function(value) {
									return value._id.equals(item.project);
								}), 'code');
								feed.item({
									date: item.dateUpdated,
									url: myHost + "/p/" + prjCode + "/detail",
									description: item.content,
									title: item.headline,
									// custom_elements: [{
									// 	'dateAdded': item.dateAdded
									// }, {
									// 	'type': item.type
									// }, {
									// 	'active': item.active
									// }, {
									// 	'project': item.priority
									// }, {
									// 	'priority': item.project
									// }]
								});
							});
							var xml = feed.xml({
								indent: true
							});
							res.write(xml);
							res.end();
						});
				});
		});
};