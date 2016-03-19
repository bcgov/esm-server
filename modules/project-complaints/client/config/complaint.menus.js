'use strict';

angular.module('recent-activity').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectMenu', {
			title: 'Complaints',
			state: 'p.complaint.list',
			roles: ['user']
		});
	}
]);
