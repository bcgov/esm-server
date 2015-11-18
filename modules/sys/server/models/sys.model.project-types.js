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
			{name:'Coal & Aggregates'       , code:'coal'},
			{name:'Food Processing'         , code:'food'},
			{name:'Waste & Water Management', code:'waste'},
			{name:'Destination Resorts'     , code:'resort'},
			{name:'Transportation Projects' , code:'transport'},
			{name:'Power and Industrial'    , code:'power'},
			{name:'Metal Mining'            , code:'metal'},
			{name:'Oil and Gas'             , code:'oil'}
		], function (err) {
			console.log ('insertion of base project type data OK');
		});
	}
});

module.exports = ProjectType;
