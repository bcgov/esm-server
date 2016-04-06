'use strict';

module.exports = function (app) {
    // Root routing
  var core = require('../controllers/core.protected.user.controller');

  app.route('/sm/*').get(core.renderAsSiteminderIndex);
};
