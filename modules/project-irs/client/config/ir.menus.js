'use strict';

angular.module('irs').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectMenu', {
			title: 'Inspection Reports',
			state: 'p.ir.list',
			roles: ['user']
		});
	}
]);
