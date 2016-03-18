'use strict';

angular.module('recent-activity').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('systemMenu', {
			title: 'Recent Activity',
			state: 'admin.recentactivity.list',
			roles: ['admin']
		});
	}
]);
