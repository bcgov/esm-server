'use strict';

angular.module('topics').run(['Menus','MenuControl',
	function (Menus, MenuControl) {
		// Menus.addMenuItem('systemMenu', {
		// 	title: 'Valued Components',
		// 	state: 'admin.topic.list',
		// 	roles: MenuControl.menuRolesBuilder(['admin'])
		// });
	}
]);
