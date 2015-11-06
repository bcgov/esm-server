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
			{name:'Staff'    , code:'s'},
			{name:'Team'     , code:'t'},
			{name:'Team Lead', code:'tl'},
			{name:'Minister' , code:'m'}
		], function (err) {
			console.log ('insertion of base project role data OK');
		});
	}
});

module.exports = ProjectRole;
