'use strict';
// =========================================================================
//
// this is a reworking of the broken menu system to use permissions rather
// than roles
//
// =========================================================================

//Menu service used for managing  menus
angular.module('core').service('Menus', ['Application',
	function (Application) {

	// Define the menus object
	this.menus = {};

	// -------------------------------------------------------------------------
	//
	// a simple function that checks a permission string as defined on the menu
	// to the 'userCan' permissions supplied on the application or the context
	// (which is always a project) opts.permissions .application .project
	//
	// -------------------------------------------------------------------------
	var checkPermission = function (opts) {
		var p = opts.permission.split ('.');
		return opts[p[0]][p[1]];
	};

	// -------------------------------------------------------------------------
	//
	// decide whether to render by checking if the user has each permission then
	// OR those results together. essentially does the user have ANY permission?
	//
	// -------------------------------------------------------------------------
	var shouldRender = function (user, project) {
			// console.log ('shouldRender : title  :', this.title);
			// console.log ('shouldRender : user   :', user);
			// console.log ('shouldRender : project:', project);
			// console.log ('shouldRender : perms  :', this.permissions);
		return this.permissions.map (function (p) {

			return checkPermission ({
				permission  : p,
				application : Application,
				project     : project
			});
		}).reduce (function (prev, current) {
			return (prev || current);
		});
	};

	// Validate menu existance
	this.validateMenuExistance = function (menuId) {
		if (menuId && menuId.length) {
		if (this.menus[menuId]) {
			return true;
		} else {
			throw new Error('Menu does not exist');
		}
		} else {
		throw new Error('MenuId was not provided');
		}

		return false;
	};

	// Get the menu object by menu id
	this.getMenu = function (menuId) {
		// Validate that the menu exists
		this.validateMenuExistance(menuId);

		// Return the menu object
		return this.menus[menuId];
	};

	// Add new menu object by menu id
	this.addMenu = function (menuId, options) {
		options = options || {};

		// Create the new menu
		this.menus[menuId] = {
		roles: options.roles || this.defaultRoles,
		items: options.items || [],
		shouldRender: shouldRender
		};

		// Return the menu object
		return this.menus[menuId];
	};

	// Remove existing menu object by menu id
	this.removeMenu = function (menuId) {
		// Validate that the menu exists
		this.validateMenuExistance(menuId);

		// Return the menu object
		delete this.menus[menuId];
	};

	// Add menu item object
	this.addMenuItem = function (menuId, options) {
		options = options || {};

		// Validate that the menu exists
		this.validateMenuExistance(menuId);

		// Push new menu item
		this.menus[menuId].items.push({
		permissions: options.permissions,
		title: options.title || '',
		state: options.state || '',
		type: options.type || 'item',
		class: options.class,
		roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
		position: options.position || 0,
		items: [],
		shouldRender: shouldRender
		});

		// Add submenu items
		if (options.items) {
		for (var i in options.items) {
			this.addSubMenuItem(menuId, options.state, options.items[i]);
		}
		}

		// Return the menu object
		return this.menus[menuId];
	};

	// Add submenu item object
	this.addSubMenuItem = function (menuId, parentItemState, options) {
		options = options || {};

		// Validate that the menu exists
		this.validateMenuExistance(menuId);

		// Search for menu item
		for (var itemIndex in this.menus[menuId].items) {
		if (this.menus[menuId].items[itemIndex].state === parentItemState) {
			// Push new submenu item
			this.menus[menuId].items[itemIndex].items.push({
			title: options.title || '',
			state: options.state || '',
			roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
			position: options.position || 0,
			shouldRender: shouldRender
			});
		}
		}

		// Return the menu object
		return this.menus[menuId];
	};

	// Remove existing menu object by menu id
	this.removeMenuItem = function (menuId, menuItemState) {
		// Validate that the menu exists
		this.validateMenuExistance(menuId);

		// Search for menu item to remove
		for (var itemIndex in this.menus[menuId].items) {
		if (this.menus[menuId].items[itemIndex].state === menuItemState) {
			this.menus[menuId].items.splice(itemIndex, 1);
		}
		}

		// Return the menu object
		return this.menus[menuId];
	};

	// Remove existing menu object by menu id
	this.removeSubMenuItem = function (menuId, submenuItemState) {
		// Validate that the menu exists
		this.validateMenuExistance(menuId);

		// Search for menu item to remove
		for (var itemIndex in this.menus[menuId].items) {
		for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
			if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
			this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
			}
		}
		}

		// Return the menu object
		return this.menus[menuId];
	};

	//Adding the system menu
	this.addMenu('systemMenu', {
		permissions: ['application.viewSystemMenu']
	});

	//Adding the projects menu
	this.addMenu('projectsMenu', {
		permissions: ['application.viewProjectsMenu']
	});

	//Adding the project menu
	this.addMenu('projectTopMenu', {
		permissions: ['application.viewProjectTopMenu']
	});

	//Adding the project menu
	this.addMenu('projectMenu', {
		permissions: ['application.viewProjectMenu']
	});

	}
]);
