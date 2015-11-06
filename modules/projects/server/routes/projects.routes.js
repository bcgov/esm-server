'use strict';

var mongoose = require ('mongoose');
var Project = mongoose.model ('Project');

var getProjectById = function (id, cb) {
	Project.findById(id).exec(cb);
};

module.exports = function (app) {
app.use (require ('express-cors')({
	allowedOrigins : ['*']
}));
	// -------------------------------------------------------------------------
	//
	// get a brand new empty project
	//
	// -------------------------------------------------------------------------
	app.get ('/esm/project/new', function (req, res) {
		var project = new Project ();
		project = project.toJSON ();
res.set ({
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type'
	});
		res.status(200).send (project);
	});

	app.get ('/esm/project/:projectid', function (req, res) {
		getProjectById (req.params.projectid, function (err, project) {
	        if (err) res.status(500).send(err);
	        else res.status(200).send(project);
		});
	});

	app.post ('/esm/project', function (req, res) {
		console.log ('body = ',req.body);
		var project = new Project (req.body);
		project.save (function (err, doc) {
            if (err) res.status(500).send(err);
            else res.status(200).send(doc);
        });
	});

	app.put ('/esm/project/:projectid', function (req, res) {
		getProjectById (req.body._id, function (err, project) {
			if (project) {
				project.set(req.body);
			}
			project.save (function (err, doc) {
	            if (err) res.status(500).send(err);
	            else res.status(200).send(doc);
	        });
		});
	});
};

