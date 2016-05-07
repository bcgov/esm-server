'use strict';

angular.module('roles').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectMenu', {
			title: 'Project Roles',
			state: 'p.roles.list',
			roles: MenuControl.menuRolesBuilder ('admin', '*', '*', '*')
		});
		Menus.addMenuItem('systemMenu', {
			title: 'System Roles',
			state: 'admin.roles.list',
			roles: MenuControl.menuRolesBuilder(['admin'])
		});
	}
]);
