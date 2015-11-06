'use strict';
// =========================================================================
//
// model for ProjectType
//
// =========================================================================

var mongoose = require ('mongoose');

var ProjectType = mongoose.model ('ProjectType', new mongoose.Schema ({
	name : { type:String, default:'New ProjectType' },
	code : { type:String, default:''}
}));

ProjectType.count (function (err, count) {
	if (count === 0) {
		ProjectType.collection.insert ([
			{name:'LNG'                     , code:'lng'},
			{name:'Coal & Aggregates'       , code:'coa'},
			{name:'Food Processing'         , code:'foo'},
			{name:'Waste & Water Management', code:'was'},
			{name:'Destination Resorts'     , code:'des'},
			{name:'Transportation Projects' , code:'tra'},
			{name:'Power and Industrial'    , code:'pow'},
			{name:'Metal Mining'            , code:'met'},
			{name:'Oil and Gas'             , code:'oil'}
		], function (err) {
			console.log ('insertion of base project type data OK');
		});
	}
});

module.exports = ProjectType;
