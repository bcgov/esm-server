'use strict';
// =========================================================================
//
// Model for orgs
//
// =========================================================================
var validator = require('validator');
var _ = require('lodash');

var validateSubject = function(subject) {
  return !_.isEmpty(subject);
};

module.exports = require ('../../../core/server/controllers/cc.schema.controller')
('EmailTemplate', {
	__audit    : true,
	__codename : true,
	subject    : { type: String, validate: [validateSubject, 'Please fill in a Subject'] },
	content    : { type: String, default:'' },
	group      : { type: String, default:'General' }
});

