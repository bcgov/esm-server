'use strict';

angular.module('topics').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('systemMenu', {
			title: 'Valued Components',
			state: 'admin.topic.list',
			roles: ['admin','eao']
		});
	}
]);
