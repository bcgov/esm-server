'use strict';

var path          = require ('path');
var routes = require('../../../core/server/controllers/core.routes.controller');
var policy = require('../../../core/server/controllers/core.policy.controller');
var DocumentController = require (path.resolve('./modules/documents/server/controllers/core.document.controller'));
var ProjectController = require (path.resolve('./modules/projects/server/controllers/project.controller'));
var _        = require ('lodash');
var ObjectId = require('mongodb').ObjectId;

module.exports = function (app) {

    app.route('/api/v2/search')
        .all(policy('guest'))
        .get (function (req, res) {
            routes.setSessionContext(req)
            .then( function (opts) {
                // console.log("req:", JSON.stringify(req.query));
                if (req.query.types === 'document') {
                    var o = new DocumentController(opts);
                    var results = [];
                    var projects = null;
                    var p = new ProjectController(opts);
                    var projectQuery = {};
                    // TODO: Make sure this is a valid objectID, wrap with try/catches.
                    if (req.query.project) {
                        projectQuery = { _id: req.query.project };
                    }
                    // TBD
                    // if (req.query.oweneroperator) {
                    //     projectQuery = { _id: req.query.project };
                    // }
                    return p.findMany(projectQuery,"_id type name code ownership proponent")
                    .then(function (pdata) {
                        console.log("pdata:", pdata.length);
                        projects = pdata;
                        return o.searchMany(req.query.search,
                                            req.query.datestart,
                                            req.query.dateend,
                                            req.query.project,
                                            req.query.fields);
                    })
                    .then(function (docs) {
                        _.each(docs, function (doc) {
                            results.push(doc);
                        });
                        console.log("docs", docs.length);
                        return results;
                    })
                    // .then(function (res) {
                    //     var p = new ProjectController(opts);
                    //     return p.findMany({},"_id type name code ownership proponent");
                    // })
                    .then(function (prjs) {
                        console.log("prjs:", projects.length);
                        _.each(results, function (r) {
                            var obj = _.find(projects, function (p) {
                                return (p._id.equals(r.project));
                            });
                            if (obj) {
                                r.project = obj;
                            }
                        });
                        // console.log("results:", results);
                        return res.json(results);
                    });
                }
            });

        });
};
