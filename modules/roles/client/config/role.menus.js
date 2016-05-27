'use strict';

angular.module('roles').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('systemMenu', {
			title: 'System Roles',
			state: 'admin.roles.list',
			roles: MenuControl.menuRolesBuilder(['admin'])
		});
	}
]);
