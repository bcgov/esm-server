'use strict';
// =========================================================================
//
// this was all getting very, very messy. So now this is the ONE AND ONLY
// place to put menu definitions.  Menus are now defined as visible through
// a permision, or set of permissions, assigned to them
//
// =========================================================================
angular.module('core').run(['Menus','ENV', function (Menus, ENV) {
	// -------------------------------------------------------------------------
	//
	// System Menu
	//
	// -------------------------------------------------------------------------
	Menus.addMenu('systemMenu', {
		permissions: [
		//'application.listConditions',
		'application.listEmailTemplates',
		'application.listOrganizations',
		'application.listNews',
		'application.listTemplates',
		'application.listValuedComponents',
		'application.manageCodeLists',
		'application.listContacts'
		]
	});
	//Menus.addMenuItem('systemMenu', {
	//	title: 'Conditions',
	//	state: 'admin.condition.list',
	//	permissions: ['application.listConditions']
	//});
	// Menus.addMenuItem('systemMenu', {
	// 	title: 'Configuration',
	// 	state: 'configuration',
	// 	permissions: ['application.viewConfiguration']
	// });
	Menus.addMenuItem('systemMenu', {
		title: 'Email Templates',
		state: 'admin.emailtemplate.list',
		permissions: ['application.listEmailTemplates']
	});
	Menus.addMenuItem('systemMenu', {
		title: 'Organizations',
		state: 'admin.organization.list',
		permissions: ['application.listOrganizations']
	});
	Menus.addMenuItem('systemMenu', {
		title: 'News & Announcements',
		state: 'admin.recentactivity.list',
		permissions: ['application.listNews']
	});
	// Menus.addMenuItem('systemMenu', {
	// 	title: 'System Roles',
	// 	state: 'admin.roles.list',
	// 	permissions: ['application.listRoles']
	// });
	// Menus.addMenuItem('systemMenu', {
	// 	title: 'Templates',
	// 	state: 'admin.template.list',
	// 	permissions: ['application.listTemplates']
	// });
	Menus.addMenuItem('systemMenu', {
		title: 'Valued Components',
		state: 'admin.topic.list',
		permissions: ['application.listValuedComponents']
	});
	Menus.addMenuItem('systemMenu', {
		title: 'Contacts',
		state: 'admin.user.list',
		permissions: ['application.listContacts']
	});
	Menus.addMenuItem('systemMenu', {
		title: 'Field Management',
		state: 'admin.codelist.list',
		permissions: ['application.manageCodeLists']
	});
	// -------------------------------------------------------------------------
	//
	// Projects Menu
	//
	// -------------------------------------------------------------------------
	Menus.addMenu('projectsMenu', {
		permissions: ['application.createProject','application.viewSchedule']
	});
	Menus.addMenuItem('projectsMenu', {
		title: 'Add Project',
		state: "p.edit({projectid:'new'})",
		permissions: ['application.createProject']
	});
	Menus.addMenuItem('projectsMenu', {
		title: 'Schedule',
		state: "projects.schedule",
		permissions: ['application.viewSchedule']
	});
	// -------------------------------------------------------------------------
	//
	// Add Project Top Menu Items
	//
	// -------------------------------------------------------------------------
	Menus.addMenu('projectTopMenu', {
		permissions: ['context.editProject','context.viewSchedule','context.listEnforcements','context.listCommentPeriods']
	});
	Menus.addMenuItem('projectTopMenu', {
		title: 'Edit Project',
		state: 'p.edit',
		permissions: ['context.editProject']
	});

	// Specific to EAO.
	if (ENV === 'EAO') {
		Menus.addMenuItem('projectTopMenu', {
			title: 'Schedule',
			state: "p.schedule",
			permissions: ['context.viewSchedule']
		});
		Menus.addMenuItem('projectTopMenu', {
			title: 'Comment Periods',
			state: "p.commentperiod.list",
			permissions: ['context.listCommentPeriods']
		});
	}

	// -------------------------------------------------------------------------
	//
	// Add Project Menu Items
	//
	// -------------------------------------------------------------------------
	Menus.addMenu('projectMenu', {
		permissions: [
			'context.listDocuments',
			'context.listValuedComponents',
			'context.listProjectRoles',
			'context.listInspectionReports',
			'context.listProjectConditions',
			'context.listProjectComplaints',
			'context.listProjectInvitations',
			'context.listProjectUpdates',
			'context.listProjectGroups'
		]
	});
	Menus.addMenuItem('projectMenu', {
		title: 'Documents',
		state: 'p.docs',
		permissions: ['context.listDocuments']
	});
	if (ENV === 'EAO') {
		Menus.addMenuItem('projectMenu', {
			title: 'Invitations',
			state: 'p.invitation.list',
			permissions: ['context.listProjectInvitations']
		});
		Menus.addMenuItem('projectMenu', {
			title: 'Groups',
			state: 'p.group.list',
			permissions: ['context.listProjectGroups']
		});
		Menus.addMenuItem('projectMenu', {
			title: 'Updates',
			state: 'p.communication.list',
			permissions: ['context.listProjectUpdates']
		});
		// Menus.addMenuItem('projectMenu', {
		// 	title: 'Complaints',
		// 	state: 'p.complaint.list',
		// 	permissions: ['context.listProjectComplaints']
		// });
		Menus.addMenuItem('projectMenu', {
			title: 'Conditions',
			state: 'p.projectcondition.list',
			permissions: ['context.listProjectConditions']
		});
		Menus.addMenuItem('projectMenu', {
			title: 'Compliance Oversight',
			state: 'p.ir.list',
			permissions: ['context.listInspectionReports']
		});
		// Menus.addMenuItem('projectMenu', {
		// 	title: 'Project Roles',
		// 	state: 'p.roles.list',
		// 	permissions: ['context.listProjectRoles']
		// });
		Menus.addMenuItem('projectMenu', {
			title: 'Valued Components',
			state: 'p.vc.list',
			permissions: ['context.listValuedComponents']
		});
	}

}]);

