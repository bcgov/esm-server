'use strict';

module.exports = require('../../../core/server/controllers/core.schema.controller')
('OtherDocument', {


	source: {type: String, default: ''}, // ex. IMPORT, MEM, EPIC

	title: {type: String, default: ''}, // title for hyperlink...
	link: {type: String, default: ''} , //hyperlink...
	documentType: {type: String, default: ''},
	filename: {type: String, default: ''},
	date: {type: Date},

	agency : { type:'ObjectId', ref:'Organization', default:null, index:true },
	project : { type:'ObjectId', ref:'Project', default:null, index:true }

});
