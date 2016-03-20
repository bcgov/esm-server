'use strict';

angular.module('complaints').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectMenu', {
			title: 'Complaints',
			state: 'p.complaint.list',
			roles: ['user']
		});
	}
]);
