'use strict';

module.exports = function (app) {
	var path    = require('path');
	var core    = require('../controllers/core.server.controller');
	var policy  = require (path.resolve('./modules/core/server/controllers/core.policy.controller'));
	var routes 	= require (path.resolve('./modules/core/server/controllers/core.routes.controller'));

	// Root routing

	// http://localhost:3000/api/search?collection=documents&projectId=588511a0aaecd9001b82316d&searchText=%22First%22&start=0&limit=5
	app.route('/api/search')
		.all (policy ('guest'))
		.all (routes.setModelByQuery())
		.get (routes.searchMiddle);

	// Define error pages
  app.route('/server-error').get(core.renderServerError);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);

  // Define application route
  app.route('/*').get(core.renderIndex);

};
