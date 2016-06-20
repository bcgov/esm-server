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
	Menus.addMenuItem('systemMenu', {
		title: 'Conditions',
		state: 'admin.condition.list',
		permissions: ['application.listConditions']
	});
	Menus.addMenuItem('systemMenu', {
		title: 'Configuration',
		state: 'configuration',
		permissions: ['application.viewConfiguration']
	});
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
	Menus.addMenuItem('systemMenu', {
		title: 'System Roles',
		state: 'admin.roles.list',
		permissions: ['application.listRoles']
	});
	Menus.addMenuItem('systemMenu', {
		title: 'Templates',
		state: 'admin.template.list',
		permissions: ['application.listTemplates']
	});
	Menus.addMenuItem('systemMenu', {
		title: 'Valued Components',
		state: 'admin.topic.list',
		permissions: ['application.listTopics']
	});
	Menus.addMenuItem('systemMenu', {
		title: 'Users / Contacts',
		state: 'admin.user.list',
		permissions: ['application.listUsers']
	});
	// -------------------------------------------------------------------------
	//
	// Projects Menu
	//
	// -------------------------------------------------------------------------
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
	Menus.addMenuItem('projectTopMenu', {
		title: 'Edit Project',
		state: 'p.edit',
		permissions: ['project.edit']
	});

	// Specific to EAO.
	if (ENV === 'EAO') {
		Menus.addMenuItem('projectTopMenu', {
			title: 'Schedule',
			state: "p.schedule",
			permissions: ['project.viewSchedule']
		});
		Menus.addMenuItem('projectTopMenu', {
			title: 'Compliance Oversight',
			state: "p.enforcements",
			permissions: ['project.listEnforcements']
		});
		Menus.addMenuItem('projectMenu', {
			title: 'Comment Periods',
			state: "p.commentperiod.list",
			permissions: ['project.listCommentPeriods']
		});
	}

	// -------------------------------------------------------------------------
	//
	// Add Project Menu Items
	//
	// -------------------------------------------------------------------------
	Menus.addMenuItem('projectMenu', {
		title: 'Documents',
		state: 'p.documents',
		permissions: ['project.listDocuments']
	});
	if (ENV === 'EAO') {
		Menus.addMenuItem('projectMenu', {
			title: 'Project Invitations',
			state: 'p.invitations',
			permissions: ['project.listProjectInvitations']
		});
		Menus.addMenuItem('projectMenu', {
			title: 'Complaints',
			state: 'p.complaint.list',
			permissions: ['project.listProjectComplaints']
		});
		Menus.addMenuItem('projectMenu', {
			title: 'Conditions',
			state: 'p.projectcondition.list',
			permissions: ['project.listProjectConditions']
		});
		Menus.addMenuItem('projectMenu', {
			title: 'Inspection Reports',
			state: 'p.ir.list',
			permissions: ['project.listInspectionReports']
		});
		Menus.addMenuItem('projectMenu', {
			title: 'Project Roles',
			state: 'p.roles.list',
			permissions: ['project.listProjectRoles']
		});
		Menus.addMenuItem('projectMenu', {
			title: 'Valued Components',
			state: 'p.vc.list',
			permissions: ['project.listValuedComponents']
		});
	}

}]);

