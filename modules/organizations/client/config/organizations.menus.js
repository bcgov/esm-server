'use strict';

angular.module('organizations').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('systemMenu', {
			title: 'Organizations',
			state: 'admin.organization.list',
			roles: ['user', 'admin']
		});
	}
]);
