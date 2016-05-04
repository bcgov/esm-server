'use strict';

angular.module('roles').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectMenu', {
			title: 'Project Roles',
			state: 'p.roles.list',
			roles: MenuControl.menuRoles ('', 'any', 'edit-roles')
		});
		Menus.addMenuItem('systemMenu', {
			title: 'System Roles',
			state: 'admin.roles.list',
			roles: ['admin','edit-sys-roles']
		});
	}
]);
