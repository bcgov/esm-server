'use strict';
// =========================================================================
//
// this is a service that takes a given template and returns an angular
// template function that can be used for either rendering or editing
// the document that the template represents
//
// =========================================================================
angular.module('templates').factory ('templateCompile', function (_) {
	return function (template, purpose) {
		var t = '';
		if (purpose === 'view') {
			_.each (template.sections, function (section) {
				var name = section.name;
				var temp = section.template;
				console.log ('- sname = ', name);
				console.log ('- temp = ', temp);
				//
				// in a non-multiple section, just replace variable names with what
				// the data structure will look like
				//
				if (!section.multiple) {
					_.each (section.meta, function (field) {
						var r = '\\{\\{ *' + field.name + ' *\\}\\}';
						var regex = new RegExp (r, 'g');
						var dataname = 'document.'+section.name+'.'+field.name;
						temp = temp.replace (regex, '{{'+dataname+'}}');
					});
					console.log ('+ temp = ', temp);
					t += temp;
				}
				//
				// in a repeat section, do the header, body, footer and the repeat
				// angular stuff
				//
				else {
					//
					// header
					//
					if (section.isheader) {
						var header = section.header;
						_.each (section.meta, function (field) {
							var regex = new RegExp ('\{\{ *' + field.name + ' *\}\}', 'g');
							var dataname = 'document.'+section.name+'.'+field.name;
							header = header.replace (regex, '{{'+dataname+'}}');
						});
						t += header;
					}
					//
					// template
					//
					_.each (section.meta, function (field) {
						var regex = new RegExp ('\{\{ *' + field.name + ' *\}\}', 'g');
						var dataname = '_v.'+section.name+'.'+field.name;
						temp = temp.replace (regex, '{{'+dataname+'}}');
					});
					t += '<div ng-if="0" ng-repeat-start="_v in document.'+section.name+'._data"></div>';
					t += temp;
					t += '<div ng-if="0" ng-repeat-end></div>';
					//
					// footer
					//
					if (section.isfooter) {
						var footer = section.footer;
						_.each (section.meta, function (field) {
							var regex = new RegExp ('\{\{ *' + field.name + ' *\}\}', 'g');
							var dataname = 'document.'+section.name+'.'+field.name;
							footer = footer.replace (regex, '{{'+dataname+'}}');
						});
						t += footer;
					}
				}
			});
		}
		//
		// in the edit mode we will replace the temmplate variables with directives that
		// will do the work of editing. those could simply put up inpiut controls or do
		// something more fancy
		// for now, the two directives will be:
		// <span x-content-inline ng-model="" />
		// <div x-content-html  ng-model="" />
		//
		else {
			var dirs = {
				'Text' : {
					a:'<span x-content-inline ng-model="',
					b:'" x-default="',
					c:'" />'
				},
				'Html' : {
					a:'<span x-content-inline ng-model="',
					b:'" x-default="',
					c:'" />'
				}
			};
			var editVariable = function (template, root, section, field, type, def) {
				var dataname = root+section+'.'+field;
				var regex = new RegExp ('\\{\\{ *' + field + ' *\\}\\}', 'g');
				var directive = dirs[type].a + dataname + dirs[type].b + def + dirs[type].c;
				return template.replace (regex, directive);
			};
			_.each (template.sections, function (section) {
				var name = section.name;
				var temp = section.template;
				console.log ('- sname = ', name);
				console.log ('- temp = ', temp);
				//
				// in a non-multiple section, just replace variable names with what
				// the data structure will look like
				//
				if (!section.multiple) {
					_.each (section.meta, function (field) {
						temp = editVariable (temp, 'document.', section.name, field.name, field.type, field.default);
					});
					console.log ('+ temp = ', temp);
					t += temp;
				}
				//
				// in a repeat section, do the header, body, footer and the repeat
				// angular stuff
				//
				else {
					//
					// header
					//
					if (section.isheader) {
						var header = section.header;
						_.each (section.meta, function (field) {
							header = editVariable (header, 'document.', section.name, field.name, field.type, field.default);
						});
						t += header;
					}
					//
					// template
					//
					_.each (section.meta, function (field) {
						temp = editVariable (temp, '', '_v', field.name, field.type, field.default);
					});
					t += '<div ng-if="0" ng-repeat-start="_v in document.'+section.name+'._data"></div>';
					t += temp;
					t += '<div ng-if="0" ng-repeat-end></div>';
					//
					// footer
					//
					if (section.isfooter) {
						var footer = section.footer;
						_.each (section.meta, function (field) {
							footer = editVariable (footer, 'document.', section.name, field.name, field.type, field.default);
						});
						t += footer;
					}
				}
			});
		}
		return t;
	};
});

