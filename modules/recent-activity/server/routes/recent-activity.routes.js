'use strict';
// =========================================================================
//
// Routes for orgs
//
// =========================================================================
var RecentActivity = require('../controllers/recent-activity.controller');
var Project = require(require('path').resolve('./modules/projects/server/controllers/project.controller'));
var _ = require('lodash');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function(app) {
	routes.setCRUDRoutes(app, 'recentActivity', RecentActivity, policy);

	//
	// all active activities
	//
	app.route('/api/recentactivity/active/list')
		.all (policy ('guest'))
		.get (routes.setAndRun (RecentActivity, function (model, req) {
			return model.getRecentActivityActive ();
		}));
	app.route('/api/recentactivity/active/rss')
		.all (policy ('guest'))
		.all (routes.setModel (Project, 'prj'))
		.all (routes.setModel (RecentActivity, 'rac'))
		.get (function(req, res) {
			var myHost = req.protocol + '://' + req.get('host');
			var myURL = myHost + req.originalUrl;
			var projects = [];
			var prj = req.prj;
			prj.list()
				.then(function(projectObjects) {
				var p = req.rac;
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
								url: prjCode ? myHost + "/p/" + prjCode + "/detail" : "",
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
	app.route('/api/recentactivity/get/rss/:projectcode')
		.all (policy ('guest'))
		.all (routes.setModel (Project, 'prj'))
		.all (routes.setModel (RecentActivity, 'rac'))
		.get (function(req, res) {
			var code = req.params.projectcode;
			var myHost = req.protocol + '://' + req.get('host');
			var myURL = myHost + req.originalUrl;
			var projects = [];
			var prj = req.prj;
			prj.list({code: code})
			.then(function (projectObjects) {
				if (projectObjects.length > 0) {
					var theProject = projectObjects[0];
					var p = req.rac;
					p.getRecentActivityByProjectId(theProject._id)
					.then(function(data) {
						var RSS = require('rss');
						var feedOptions = {
							title: 'Environmental Assessment Office - News & Announcements for ' + theProject.name,
							description: 'News & Announcements for the Environmental Assessment Office' + theProject.name,
							link: myHost,
							feed_url: myURL,
							site_url: myHost,
							image_url: myHost + "/favicon.ico",
							pubDate: new Date(),
							ttl: '60'
						};
						var feed = new RSS(feedOptions);

						_.forEach(data, function(item) {
							feed.item({
								date: item.dateUpdated,
								url: myHost + "/p/" + code + "/detail",
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
				}
			});
		});
};
