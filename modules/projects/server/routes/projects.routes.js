'use strict';

var mongoose = require ('mongoose');
var Project = mongoose.model ('Project');



module.exports = function (Projects, app) {
	// -------------------------------------------------------------------------
	//
	// get a brand new empty project
	//
	// -------------------------------------------------------------------------
	app.get ('/esm/project/new', function (req, res) {
		var project = new Project ();
		project = project.toJSON ();
		res.status(200).send (project);
	});
};

