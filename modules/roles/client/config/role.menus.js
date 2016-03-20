'use strict';

angular.module('roles').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectMenu', {
			title: 'Roles',
			state: 'p.roles.list',
			roles: ['user']
		});
	}
]);
