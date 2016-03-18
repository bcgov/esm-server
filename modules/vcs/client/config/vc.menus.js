'use strict';

angular.module('recent-activity').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectMenu', {
			title: 'Value Components',
			state: 'p.vc.list',
			roles: ['user']
		});
	}
]);
