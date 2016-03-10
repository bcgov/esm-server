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
						console.log ('replacing ', field);
						var r = '\\{\\{' + field.name + '\\}\\}';
						console.log ('r = ', r);
						var regex = new RegExp (r, 'g');
						// regex = '{{'+field.name+'}}';
						temp = temp.replace (regex, '{{document.'+section.name+'.'+field.name+'}}');
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
							header = header.replace (regex, '{{document.'+section.name+'.'+field.name+'}}');
						});
						t += header;
					}
					//
					// template
					//
					_.each (section.meta, function (field) {
						var regex = new RegExp ('\{\{ *' + field.name + ' *\}\}', 'g');
						temp = temp.replace (regex, '{{_v.'+field.name+'}}');
					});
					t += '<div ng-if="0" ng-repeat-start="var in vars"></div>';
					t += temp;
					t += '<div ng-if="0" ng-repeat-end></div>';
					//
					// footer
					//
					if (section.isfooter) {
						var footer = section.footer;
						_.each (section.meta, function (field) {
							var regex = new RegExp ('\{\{ *' + field.name + ' *\}\}', 'g');
							footer = footer.replace (regex, '{{document.'+section.name+'.'+field.name+'}}');
						});
						t += footer;
					}
				}
			});
		}
		else {

		}
		return t;
	};
});

