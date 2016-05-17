'use strict';

angular.module('email-template').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('systemMenu', {
			title: 'Email Templates',
			state: 'admin.emailtemplate.list',
			roles: MenuControl.menuRolesBuilder(['admin'])
		});
	}
]);
