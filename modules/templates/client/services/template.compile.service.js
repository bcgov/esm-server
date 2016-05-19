'use strict';
angular.module('templates')
// =========================================================================
//
// this is a service that takes a given template and returns an angular
// template function that can be used for either rendering or editing
// the document that the template represents
//
// in the edit mode we will replace the temmplate variables with directives that
// will do the work of editing. those could simply put up input controls or do
// something more fancy
// for now, the two directives will be:
// <span x-content-inline ng-model="" />
// <div x-content-html  ng-model="" />
//
// Also, we will put named anchors beside each section
//
// =========================================================================
.factory ('templateCompile', function (_) {
	return function (template, purpose) {
		// console.log ('purpose = ', purpose);
		if (!template) return;
		var temp;
		var compiled    = '';
		var t           = '';
		var repeatStart = '\n<div ng-if="0" ng-repeat-start="_v in document.sectionname"></div>\n';
		var repeatEnd   = '\n<div ng-if="0" ng-repeat-end></div>\n';
		var replaceVar = function (mode, template, modelname, field) {
			var regex      = new RegExp ('\\{\\{ *' + field.name + ' *\\}\\}', 'g');
			var ftype      = field.type.toLowerCase ();
			var istext     = (ftype === 'text');
			var isdocument = (ftype === 'document list');
			var isartifact = (ftype === 'artifact');
			var isview     = (mode.toLowerCase () === 'view');
			var directive  = '';
			// if (ftype !== 'auto')
			//
			// if this is an auto field do not mess with the name scope
			//
			// var dataname = (ftype === 'auto') ? 'document.'+field.name : modelname+'.'+field.name;
			var dataname = modelname+'.'+field.name;
			if (ftype === 'auto') isview = true;
			if (isview) {
				if (istext) directive = '{{'+dataname+'}}';
				else if (isdocument) directive = '<div x-content-document ng-model="'+dataname+'" title="\''+field.label+'\'" project="project" editable="false"></div>';
				else if (isartifact) directive = '<div x-content-artifact ng-model="'+dataname+'" title="\''+field.label+'\'" project="project" editable="false"></div>';
				else directive = '<div ng-bind-html="'+dataname+'"></div>';

			} else {
				if (istext) directive = '<span x-content-inline ng-model="'+dataname+'"></span>';
				else if (isdocument) directive = '<div x-content-document ng-model="'+dataname+'" title="\''+field.label+'\'" project="project" editable="true"></div>';
				else if (isartifact) directive = '<div x-content-artifact ng-model="'+dataname+'" title="\''+field.label+'\'" project="project" editable="true"></div>';
				else directive = '<div x-content-html ng-model="'+dataname+'"></div>';
			}
			return template.replace (regex, directive);
		};
		//
		// for each section put together its template
		//
		_.each (template.sections, function (section) {
			//
			// go through each field defined in the section and perform
			// a contextual replace of that field in the template with
			// either its display or edit angular template version
			//
			compiled = '<a name="'+section.name+'"></a>';
			temp = section.template;
			_.each (section.meta, function (field) {
				//
				// if the template is repeatable, then put the angular
				// model reference as being under '_v' instead of 'document'
				// as it will be nested inside an angular repeat
				//
				// console.log ('++++++ ', temp);
				temp = (section.multiple) ?
					replaceVar (purpose, temp, '_v', field) :
					replaceVar (purpose, temp, 'document.' + section.name, field) ;
				// console.log ('------ ', temp);
			});
			if (section.multiple) {
				if (section.isheader) compiled += section.header;
				compiled += repeatStart.replace (/sectionname/, section.name);
				compiled += temp;
				compiled += repeatEnd;
				if (section.isfooter) compiled += section.footer;
			} else {
				compiled += temp;
			}
			// console.log ('+++START: section='+section.name);
			// console.log (compiled);
			// console.log ('---END');
			t += compiled;
		});
		return t;
	};
})
// =========================================================================
//
// this is a service that takes a given template and returns a ready to go
// dataset class that will operate on this data in conjunction with the
// edit view. it includes managing the optional sections and adding or
// removing or moving multi-sections within the document
//
// Further, this class ensures that there is sufficient data to render the
// template.  It also takes in the project data, and, if the document is
// not yet published, it will insert the appropriate automatic variables
// from the passed in project data. If no project data is passed in then
// it will simply use the current values for those fields (assuming they
// were already populated at last edit). The rules for saving are not the
// concern of this class, it will always insert the curent value unless
// no project data is provided
//
// =========================================================================
.factory ('templateData', function (_) {
	return function (template, input, project) {
		if (!template) return;
		var TemplateClass = function (template, inputData, projectData) {
			this.sections    = {};
			this.document    = {};
			this.mindata     = {};
			this.order       = [];
			this.hasProject  = (!!projectData);
			this.projectData = projectData || {};
			this._init (template, inputData);
		};
		_.extend (TemplateClass.prototype, {
			// -------------------------------------------------------------------------
			//
			// initialize our internal section/var structure
			//
			// -------------------------------------------------------------------------
			_init: function (template, inputData) {
				// console.log ('++inside init function of TemplateData');
				// inputData        = inputData || {};
				//console.log ('initializing with template:', template);
				// console.log ('initializing with inputData:', _.cloneDeep (inputData));
				//
				// first make a structure of all sections with
				// all variables (just meta data) and, while doing
				// so, make a minimum possible data structure that
				// contains all non-optional sections
				//
				var _this = this;
				_.each (template.sections, function (s) {
					var section = {
						name     : s.name,
						label    : s.label,
						optional : s.optional,
						multiple : s.multiple,
						isheader : s.isheader,
						isfooter : s.isfooter,
						fields   : [],
						data     : {}
					};
					//
					// go through each variable in the section and set the value of
					// it based upon the default setting
					//
					_.each (s.meta, function (f) {
						//
						// calculate the default value. its either the set one, the
						// label, or an automatic value
						//
						var def;
						switch (f.type) {
							case 'Artifact':
								def = '';
								break;
							case 'Document List':
								def = [];
								break;
							case 'Auto':
								def = _.get (_this.projectData, def, '');
								break;
							default:
								def = f.default || '[ '+f.label+' ]';
						}
						//
						// set the section data for the field (default value calculated above)
						//
						section.data[f.name] = def;
						//
						// set the section field meta data
						//
						section.fields.push ({
							name    : f.name,
							label   : f.label,
							type    : f.type,
							default : def
						});
					});
					_this.sections[s.name] = section;
					_this.order.push (section);
				});
				this.mindata  = this.ensureData ({});
				this.document = this.ensureData (inputData);
				// console.log ('sections = ', this.sections);
				// console.log ('this.mindata :', this.mindata);
				//console.log ('this.document :', this.document);
			},
			// -------------------------------------------------------------------------
			//
			// on a given object, ensure that it fulfills the minimum data requirements
			// as defined by the template. This function mutates the passed document
			// as well as returns it
			//
			// -------------------------------------------------------------------------
			ensureData: function (document) {
				// Safety Check
				if (!document)
					return document;
				_.each (this.sections, function (section) {
					// if (!section.optional) {
						if (section.multiple) {
							if (!document[section.name] || (document[section.name].length) === 0) {
								document[section.name] = [ _.assign ({}, section.data) ];
							}
						}
						else {
							if (!document[section.name] || _.isEmpty (document[section.name])) {
								document[section.name] = _.assign ({}, section.data);
							}
						}
					// }
				});
				return document;
			},
			// -------------------------------------------------------------------------
			//
			// for multi sections, append an empty section
			//
			// -------------------------------------------------------------------------
			push: function (sectionName) {
				this.document[sectionName].push (_.clone (this.sections[sectionName].data));
			},
			pop: function (sectionName) {
				this.document[sectionName].pop ();
			},
			unshift: function (sectionName) {
				this.document[sectionName].unshift (_.clone (this.sections[sectionName].data));
			},
			shift: function (sectionName) {
				this.document[sectionName].shift ();
			},
			// -------------------------------------------------------------------------
			//
			// return a list of sections for use in a select box or something, these
			// are in the roper order as they appear in the document
			//
			// -------------------------------------------------------------------------
			sectionList: function () {
				return this.order.map (function (section) {
					return {
						name: section.name,
						label: section.label || section.name,
						repeatable: section.multiple
					};
				});
			},
			// -------------------------------------------------------------------------
			//
			// return a list of sections that are repeatable, in the order of the document
			//
			// -------------------------------------------------------------------------
			repeatable: function () {
				return this.order.filter (function (section) {
					return section.multiple;
				})
				.map (function (section) {
					return {
						name: section.name,
						label: section.label || section.name
					};
				});
			}
		});
		return new TemplateClass (template, input, project);
	};
})

;











