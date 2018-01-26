'use strict';

var path = require('path');
var DBModel = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));

module.exports = DBModel.extend ({
  name: 'ProjectGroup',
  plural: 'projectgroups',
  populate: 'members members.org',
  sort: 'type name',

  getForProject: function (id) {
    return this.list({project: id});
  }

});
