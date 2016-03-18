'use strict';
// =========================================================================
//
// Routes for orgs
//
// =========================================================================
var policy  = require ('../policies/recent-activity.policy');
var RecentActivity  = require ('../controllers/recent-activity.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'recentActivity', RecentActivity, policy);

    //
    // all active activities
    //
    app.route ('/api/recentactivity/active/list')
        //.all (policy.isAllowed)
        .get (function (req, res) {
            var p = new RecentActivity ();
            p.getRecentActivityActive ()
            .then (helpers.success(res), helpers.failure(res));
        });
};
