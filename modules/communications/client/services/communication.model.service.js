'use strict';

angular.module('communications').factory ('CommunicationModel', function (ModelBase, _) {
	var Class = ModelBase.extend ({
		urlName : 'communication',
		forProject: function (id) {
			return this.get ('/api/communication/for/project/'+id);
		},
		forGroup: function (id) {
			return this.get ('/api/communication/for/group/'+id);
		},
		send: function(model) {
			return this.put ('/api/communication/for/delivery/'+model._id, model);
		},
		sendInvitation: function(model) {
			return this.put ('/api/communication/for/rsvp/'+model._id, model);
		}
	});
	return new Class ();
});
