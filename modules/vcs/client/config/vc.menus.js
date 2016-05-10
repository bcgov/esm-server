'use strict';

angular.module('recent-activity').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectMenu', {
			title: 'Valued Components',
			state: 'p.vc.list',
			roles: MenuControl.menuRolesBuilder (undefined, '*', '*', ['eao:admin', 'eao:member', 'responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer', 'pro:admin', 'pro:member', 'sub'])
		});
	}
]);
