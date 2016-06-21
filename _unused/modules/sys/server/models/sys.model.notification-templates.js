'use strict';
// =========================================================================
//
// model for NotificationTemplate
//
// =========================================================================

var mongoose = require ('mongoose');

module.exports = mongoose.model ('NotificationTemplate', new mongoose.Schema ({
	name : { type:String, default:'New NotificationTemplate' }
}));
