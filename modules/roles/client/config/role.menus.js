'use strict';

angular.module('roles').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		// Menus.addMenuItem('projectMenu', {
		// 	title: 'Project Roles',
		// 	state: 'p.roles.list',
		// 	roles: MenuControl.menuRolesBuilder (['admin'], '*', '*', ['project-lead', 'project-intake', 'pro:admin', 'pro:member', 'sub'])
		// });
		Menus.addMenuItem('systemMenu', {
			title: 'System Roles',
			state: 'admin.roles.list',
			roles: MenuControl.menuRolesBuilder(['admin'])
		});
	}
]);
