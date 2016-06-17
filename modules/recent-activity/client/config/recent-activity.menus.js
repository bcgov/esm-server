'use strict';

angular.module('recent-activity').run(['Menus','MenuControl',
	function (Menus, MenuControl) {
		// Menus.addMenuItem('systemMenu', {
		// 	title: 'News & Announcements',
		// 	state: 'admin.recentactivity.list',
		// 	roles: MenuControl.menuRolesBuilder(['admin'])
		// });
	}
]);
