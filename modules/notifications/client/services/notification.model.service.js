'use strict';

angular.module('notifications').factory ('NotificationModel', function (ModelBase, _) {
	var Class = ModelBase.extend ({
		urlName : 'notification',
		forProject: function (id) {
			return this.get ('/api/notification/for/project/'+id);
		},
		forGroup: function (id) {
			return this.get ('/api/notification/for/group/'+id);
		}
	});
	return new Class ();
});
