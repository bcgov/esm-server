'use strict';

angular.module('conditions').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		// Menus.addMenuItem('systemMenu', {
		// 	title: 'Conditions',
		// 	state: 'admin.condition.list',
		// 	roles: MenuControl.menuRolesBuilder(['admin', 'eao'], '*', '*', ['qa-officer', 'ce-lead', 'ce-officer'])
		// });
	}
]);
