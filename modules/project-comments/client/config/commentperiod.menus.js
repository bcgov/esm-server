'use strict';

angular.module('recent-activity').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectMenu', {
			title: 'Comment Period',
			state: 'p.commentperiod.list',
			roles: ['user']
		});
	}
]);
