'use strict';

angular.module('otherdocuments').factory ('OtherDocumentModel', function (ModelBase, _) {
	var ProjectClass = ModelBase.extend ({
		urlName : 'otherdocs',

		forProject: function(projectId) {
			return this.get('/api/otherdocs/project/' + projectId);
		},

		forProjectCode: function(projectCode) {
			return this.get('/api/otherdocs/project/projectCode/' + projectCode);
		}

	});
	return new ProjectClass ();
});





