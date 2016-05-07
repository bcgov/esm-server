'use strict';

angular.module('recent-activity').run(['Menus','MenuControl',
	function (Menus, MenuControl) {
		Menus.addMenuItem('systemMenu', {
			title: 'Recent Activity',
			state: 'admin.recentactivity.list',
			roles: MenuControl.menuRolesBuilder(['admin','eao'])
		});
	}
]);
