'use strict';

angular.module('roles').run(['Menus', 'MenuControl', function (Menus, MenuControl, ENV) {
		Menus.addMenuItem('systemMenu', {
			title: 'System Roles',
			state: 'admin.roles.list',
			roles: MenuControl.menuRolesBuilder(['admin', 'eao'])
		});
	}
]);
