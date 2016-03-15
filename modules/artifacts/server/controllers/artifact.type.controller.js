'use strict';

var mongoose = require('mongoose');
var ArtifactType = mongoose.model ('ArtifactType');
var _ = require ('lodash');


var listTypes = function () {
	return new Promise (function (resolve, reject) {
		ArtifactType.find ({}).exec()
		.then (resolve, reject);
	});

}


