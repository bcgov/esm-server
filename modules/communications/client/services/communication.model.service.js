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
		},
		prepareAddressCSV: function (tableParams) {
			return new Promise (function (resolve, reject) {
				var data = "";
				var header = [
					"Salutation",
					"Name",
					"Address 1",
					"Address 2",
					"City",
					"Province",
					"Country",
					"Postal Code"
				];
				data += '"' + header.join ('","') + '"' + "\r\n";
				_.each (tableParams, function (row) {
					if (row.viaMail === true) {
						var a = [];
						a.push (row.salutation);
						a.push (row.displayName);
						a.push (row.address1);
						a.push (row.address2);
						a.push (row.city);
						a.push (row.province);
						a.push (row.country);
						a.push (row.postalCode);
						data += '"' + a.join ('","') + '"' + "\r\n";
					}
				});
				resolve(data);
			});
		}
	});
	return new Class ();
});
