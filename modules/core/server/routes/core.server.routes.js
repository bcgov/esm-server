'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.server.controller');

  // Define error pages
  app.route('/server-error').get(core.renderServerError);

  // Allow the prototype styling through....
  app.route('/:url(modules/prototype/client/styles|modules/prototype/client/images)/*').get(function (req, res) {
    res.render(req.url, {user: req.user || null });
  });

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);

  // Define application route
  app.route('/admin/prototype/*').get(core.renderIndexPrototype);
  app.route('/*').get(core.renderIndex);


};
