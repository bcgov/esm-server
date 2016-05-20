'use strict';

angular.module('topics').run(['Menus','MenuControl',
	function (Menus, MenuControl, ENV) {
		if (ENV === 'EAO') {
			Menus.addMenuItem('systemMenu', {
				title: 'Valued Components',
				state: 'admin.topic.list',
				roles: MenuControl.menuRolesBuilder(['admin'])
			});
		}
	}
]);
