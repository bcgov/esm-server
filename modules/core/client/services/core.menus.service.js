'use strict';
// =========================================================================
//
// this is a reworking of the broken menu system to use permissions.
//
// permissions are attached to the men itself, as well as menu items
// permissions are of the form:
// 'application.permission' or 'context.permissions'
// an item can have multiple permissions set which would mean that if the
// user had ANY of those permissions they would see the menu or menu item
//
// this menu system only has 3 levels, menu, menuItem, menuSubItem
//
// =========================================================================


//Menu service used for managing  menus
angular.module('core').service('Menus', ['Application',
	function (Application) {
		// Define the menus object
		// -------------------------------------------------------------------------
		//
		// a simple function that checks a permission string as defined on the menu
		// to the 'userCan' permissions supplied on the application or the context
		// (which is always a project) opts.permissions .application .context
		// opts: {
		//  permission: 'permission',
		// 	application: { permission: true},
		// 	context: {permission:false}
		// }
		//
		// -------------------------------------------------------------------------
		var checkPermission = function (opts) {
			var p = opts.permission.split ('.'); // get the permission prefix and name
			return opts[p[0]][p[1]]; // check the prefix object for name
		};
		// -------------------------------------------------------------------------
		//
		// decide whether to render by checking if the user has each permission then
		// OR those results together. essentially does the user have ANY permission?
		// Applicaiton is the users current Application permission and context
		// is the current context permissions (usually a project)
		//
		// -------------------------------------------------------------------------
		var shouldRender = function (user, context) {
			var applicationPermissions = (Application && Application.userCan) ? Application.userCan : {};
			var contextPermissions     = (context && context.userCan) ? context.userCan : {};
			// allows a logged in user not on the project to get some menu items.
			//contextPermissions['public'] = true;
			//console.log ('applicationPermissions:',applicationPermissions);
			//console.log ('contextPermissions:',contextPermissions);
			//console.log ('this.permissions:',this.permissions);
			var result = this.permissions.map (function (p) {
				return checkPermission ({
					permission  : p,
					application : applicationPermissions,
					context     : contextPermissions
				});
			}).reduce (function (prev, current) {
				return (prev || current);
			});
			// console.log ('checking for :', this.title, result);
			return result;
		};
		// -------------------------------------------------------------------------
		//
		// Now define some constants and the root menu
		//
		// -------------------------------------------------------------------------
		this.menus    = {};
		// this.defaults = {
		// 	permissions  : [],
		// 	shouldRender : shouldRender,
		// 	title        : '',
		// 	state        : '',
		// 	class        : '',
		// 	position     : 0,
		// 	items        : [],
		// 	type         : 'item'
		// };
		// -------------------------------------------------------------------------
		//
		// menu exists?
		//
		// -------------------------------------------------------------------------
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
		// -------------------------------------------------------------------------
		//
		// get menu
		//
		// -------------------------------------------------------------------------
		this.getMenu = function (menuId) {
			this.validateMenuExistance(menuId);
			return this.menus[menuId];
		};
		// -------------------------------------------------------------------------
		//
		// remove menu
		//
		// -------------------------------------------------------------------------
		this.removeMenu = function (menuId) {
			this.validateMenuExistance(menuId);
			delete this.menus[menuId];
		};
		// -------------------------------------------------------------------------
		//
		// add a new menu, also add all passed in items if they are present
		//
		// -------------------------------------------------------------------------
		this.addMenu = function (menuId, options) {
			// var self = this;
			// self.menus[menuId] = _.extend ({}, self.defaults, options);
			// self.menus[menuId].items = self.menus[menuId].items.map (function (def) {
			// 	return self.addMenuItem (menuId, def);
			// });
			options       = options || {};
			options.items = options.items || [];
			// Create the new menu
			this.menus[menuId] = {
				permissions  : options.permissions || [],
				items        : [],
				shouldRender : shouldRender
			};
			// Add menu items
			for (var i in options.items) {
				this.addMenuItem(menuId, options.items[i]);
			}
			return this.menus[menuId];
		};

		// -------------------------------------------------------------------------
		//
		// add menu item
		//
		// -------------------------------------------------------------------------
		this.addMenuItem = function (menuId, options) {
			options       = options || {};
			options.items = options.items || [];
			this.validateMenuExistance(menuId);
			// Push new menu item
			this.menus[menuId].items.push({
				permissions  : options.permissions || [],
				title        : options.title || '',
				state        : options.state || '',
				type         : options.type || 'item',
				class        : options.class,
				position     : options.position || 0,
				items        : [],
				shouldRender : shouldRender
			});
			// Add submenu items
			for (var i in options.items) {
				this.addSubMenuItem(menuId, options.state, options.items[i]);
			}
			return this.menus[menuId];
		};
		// -------------------------------------------------------------------------
		//
		// add sub item
		//
		// -------------------------------------------------------------------------
		this.addSubMenuItem = function (menuId, parentItemState, options) {
			options = options || {};
			this.validateMenuExistance(menuId);
			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].state === parentItemState) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						permissions  : options.permissions || [],
						title        : options.title || '',
						state        : options.state || '',
						position     : options.position || 0,
						shouldRender : shouldRender
					});
				}
			}
			return this.menus[menuId];
		};
		// -------------------------------------------------------------------------
		//
		// remove menu item
		//
		// -------------------------------------------------------------------------
		this.removeMenuItem = function (menuId, menuItemState) {
			this.validateMenuExistance(menuId);
			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].state === menuItemState) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}
			return this.menus[menuId];
		};
		// -------------------------------------------------------------------------
		//
		// remove sub item
		//
		// -------------------------------------------------------------------------
		this.removeSubMenuItem = function (menuId, submenuItemState) {
			this.validateMenuExistance(menuId);
			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}
			return this.menus[menuId];
		};


	}
]);
