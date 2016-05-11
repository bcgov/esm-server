'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
	Menus.addMenuItem('systemMenu', {
		title: 'Users / Contacts',
		state: 'admin.user.list',
		roles: MenuControl.menuRolesBuilder(['admin'])
	});
}
]);
