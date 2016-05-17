'use strict';

angular.module('templates').run(['Menus','MenuControl',
	function (Menus, MenuControl) {
		Menus.addMenuItem('systemMenu', {
			title: 'Templates',
			state: 'admin.template.list',
			roles: MenuControl.menuRolesBuilder(['admin'])
		});
	}
]);
