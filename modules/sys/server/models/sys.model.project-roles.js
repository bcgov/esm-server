'use strict';
// =========================================================================
//
// model for ProjectRole
//
// =========================================================================

var mongoose = require ('mongoose');

var ProjectRole = mongoose.model ('ProjectRole', new mongoose.Schema ({
	name : { type:String, default:'New Project Role' },
	code : { type:String, default:''}
}));

ProjectRole.count ({}, function (err, count) {
	if (count === 0) {
		ProjectRole.collection.insert ([
			{name:'Staff'    , code:'staff'},
			{name:'Team'     , code:'team'},
			{name:'Team Lead', code:'teamlead'},
			{name:'Minister' , code:'minister'}
		], function (err) {
			console.log ('insertion of base project role data OK');
		});
	}
});

module.exports = ProjectRole;
