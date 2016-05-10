'use strict';

angular.module('projectconditions').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectMenu', {
			title: 'Conditions',
			state: 'p.projectcondition.list',
			roles: MenuControl.menuRolesBuilder (undefined, '*', '*', ['eao:admin', 'eao:member', 'responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer'])
		});
	}
]);
