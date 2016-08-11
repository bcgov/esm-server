'use strict';

angular.module('communications').factory ('CommunicationModel', function (ModelBase, _) {
	var Class = ModelBase.extend ({
		urlName : 'communication',
		forProject: function (id) {
			return this.get ('/api/communication/for/project/'+id);
		},
		forGroup: function (id) {
			return this.get ('/api/communication/for/group/'+id);
		}
	});
	return new Class ();
});
