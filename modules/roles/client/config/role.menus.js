'use strict';

angular.module('roles').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectMenu', {
			title: 'Project Roles',
			state: 'p.roles',
			roles: ['user']
		});
		Menus.addMenuItem('systemMenu', {
			title: 'System Roles',
			state: 'admin.roles.list',
			roles: ['user']
		});		
	}
]);
