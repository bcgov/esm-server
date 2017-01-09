'use strict';
/*

	Document Templates
	==================
	-------------------------------------------------------------------------

	Template meta-data structure

	-------------------------------------------------------------------------
	This is the way that the template is stored
	{
		documentType  : { type:String, default: '' , index:true},
		versionNumber : { type:Number, default:0, index:true },
		sections      : [{
			name     : { type:String, default:'' },
			optional : { type:Boolean, default:false },
			multiple : { type:Boolean, default:false },
			isheader : { type:Boolean, default:false },
			isfooter : { type:Boolean, default:false },
			template : { type:String, default:'' },
			header   : { type:String, default:'' },
			footer   : { type:String, default:'' },
			meta     : [{
				name     : { type:String, default:'' },
				type     : { type:String, default:'Text', enum:['Text', 'Html'] },
				label    : { type:String, default:'' },
				default  : { type:String, default:'' }
			}]
		}]
	}

	Whereby a section is flat (no repeating portions), or has a header and footer
	with a repeating middle section.

	-------------------------------------------------------------------------

	Template DATA structure

	-------------------------------------------------------------------------
	When data is recorded against a template itwill be stored in a format that
	matches the template structure
	{
		sectionName : {
			name : value,
			name : value,
		},
		sectionName : [{
			name : value,
			name : value,
		}]

	}

	Where a flat section merely has named data elements, while a repeating
	section has those for the header and footer, but has a data array with
	one object full of named data elements for each repeated section

	-------------------------------------------------------------------------

	Generating display template

	-------------------------------------------------------------------------
	The display template should be the simplest to create. The section
	templates need to be strung together in order and the various repeating
	mechanisms need to be created so that they will work with normal angular
	templating.  That is, no real logic, just binding and repeats.

	since sections are meant to be repeated without adding unecessary elements
	which could inadvertently upset the intendedrendering and flow of the
	template we will use the following:

	<div ng-if="0" ng-repeat-start="var in vars"></div>
	<div ng-if="0" ng-repeat-end></div>

	-------------------------------------------------------------------------

	Generating display template

	-------------------------------------------------------------------------


*/
angular.module ('templates')

// -------------------------------------------------------------------------
//
// directive for listing templates
//
// -------------------------------------------------------------------------
.directive ('tmplTemplateRender', function ($compile, templateCompile, templateData, $location, $anchorScroll, _) {
	return {
		restrict: 'E',
		scope: {
			template: '=',
			document: '=',
			project: '=',
			mode:     '=',
			sidewidth: '=?'
		},
		link: function (scope, element, attrs) {
			// console.log ('render template = ', scope.template);
			// console.log ('render document = ', scope.document);
			var leftWidth = angular.isDefined(scope.sidewidth) ? scope.name : 2;
			var rightWidth = 12 - leftWidth;
			var usemode = scope.mode;
			if (scope.mode === 'print') {
				usemode = 'view';
			}
			var template = templateCompile (scope.template, usemode);
			var wrapperClass= 'template';

			var header = {
				edit:'<div class="template-container" du-scroll-container="templateContainer">'+
						'<div class="template-nav">'+
							'<div class="list-group no-border">'+
								'<li class="list-group-item" du-scrollspy="{{ name }}" du-smooth-scroll ng-repeat="section in allsections">'+
									'<a href="#{{ section.name }}" du-smooth-scroll>{{ section.label }}</a>'+
									'<button class="btn btn-link btn-xs" ng-if="section.repeatable" ng-click="append(section.name)">+ Append New</button>'+
								'</li>'+
							'</div>'+
						'</div>'+
						'<div class="template" id="templateContainer"',
				view:
					'<div class="template-container" du-scroll-container="templateContainer">'+
						'<div class="template-nav">'+
							'<ul class="list-group no-border">'+
								'<li class="list-group-item" du-scrollspy="{{ section.name }}" ng-repeat="section in allsections">'+
									'<a href="#{{ section.name }}" x-offset=10 du-smooth-scroll>{{ section.label }}</a>'+
								'</li>'+
							'</ul>'+
						'</div>'+
						'<div class="template" id="templateContainer">'
			};

			var footer = '</div></div>';
			// if (scope.project) scope.document._project = scope.project;
			var tData = templateData (scope.template, scope.document, scope.project);
			scope.allsections = tData.sectionList ();
			// console.log (scope.allsections);
			// scope.repeatsections = tData.repeatable ();
			scope.gosection = '';
			scope.newsection = '';
			// scope.goto = function (sectionname) {
			// 	// console.log ('goto ', sectionname);
			// 	$location.hash (sectionname);
			// 	$anchorScroll ();
			// 	scope.gosection = '';
			// };
			scope.append = function (sectionname) {
				// console.log ('append ', sectionname);
				tData.push (sectionname);
				scope.newsection = '';
				// console.log ('document = ',scope.document);
				// console.log ('tdata    = ',tData.document);
			};

			template = header[usemode]+''+template+''+footer;
			// console.log ('template = ', template);
			element.html (template);
			$compile (element.contents())(scope);
		}
	};
})

// -------------------------------------------------------------------------
//
// directive to edit text field in template
//
// -------------------------------------------------------------------------
.directive('contentInline', ['$sce', function($sce) {
	return {
		restrict: 'A', // only activate on element attribute
		require: '?ngModel', // get a hold of NgModelController,
		scope: {
			// default: '=',
			curVal: '=ngModel'
		},
		replace: true,
		template: '<span class="text-block" ng-keypress="cancelReturn($event)" contenteditable="true"></span>',
		link: function(scope, element, attrs, ngModel) {
			if (!ngModel) return; // do nothing if no ng-model

			// element.html($sce.getTrustedHtml(scope.curVal || scope.default || ''));
			element.html($sce.getTrustedHtml(scope.curVal || ''));

			// Specify how UI should be updated
			ngModel.$render = function() {
				element.html($sce.getTrustedHtml(ngModel.$viewValue));
			};

			// Listen for change events to enable binding
			element.on('blur keyup change', function() {
				scope.$evalAsync(read);
			});
			read(); // initialize

			// Write data to the model
			function read() {
				var html = element.html() || ngModel.$modelValue;
				// When we clear the content editable the browser leaves a <br> behind
				// If strip-br attribute is provided then we strip this out
				if ( attrs.stripBr && html === '<br>' ) {
					html = '';
				}
				element.html($sce.getTrustedHtml( html ));
				ngModel.$setViewValue(html);
			}
		},
		controller: function($scope) {
			$scope.cancelReturn = function(event) {
				if (event.keyCode === 13) {
					event.preventDefault();
					return false;
				}
				return true;
			};
		}
	};
}])
// -------------------------------------------------------------------------
//
// directive to edit html field in template
//
// -------------------------------------------------------------------------
.directive ('contentHtml', ['$sce', function($sce) {
	return {
		restrict: 'A', // only activate on element attribute
		require: '?ngModel', // get a hold of NgModelController
		scope: {
			// default: '=',
			curVal: '=ngModel'
		},
		replace: true,
		templateUrl: 'modules/templates/client/views/template-html-editor.html',
		link: function (scope, element, attrs, ngModel) {
			scope.activeItem = false;
		},
		controller: function($scope) {
			$scope.tinymceOptions = {
		        resize: true,
		        width: '100%',  // I *think* its a number and not '400' string
		        height: 100,
		        menubar:'',
		        elementpath: false,
		        plugins: 'textcolor',
		        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | forecolor backcolor'

		    };
		}
	};
}])
// -------------------------------------------------------------------------
//
// directive to edit / view document field in template
//
// -------------------------------------------------------------------------
.directive ('contentDocument', function (Document, Authentication) {
	return {
		restrict: 'A', // only activate on element attribute
		require: '?ngModel', // get a hold of NgModelController
		scope: {
			curVal: '=ngModel',
			editable: '=',
			project: '=',
			artifact: '=',
			title: '=',
			docLocationCode: '@'
		},
		replace: true,
		templateUrl: 'modules/templates/client/views/template-document-editor.html',
		link: function(scope, element, attrs, ngModel, filelist) {
			scope.filelist = [];
			scope.authentication = Authentication;
			scope.originals = angular.copy(scope.curVal) || [];

			var addDocument = function(data) {
				//
			};
			var removeDocument = function(data) {
				//
			};
			var resetLibrary = function(data) {
				var ids = data || scope.originals || [];
				Document.getDocumentsInList (ids)
					.then (function (result) {
						scope.curVal = ids;
						scope.filelist = result;
						scope.$apply();
					});
			};
			var updateLibrary = function(data) {
				var ids = data || [];
				Document.getDocumentsInList (ids)
					.then (function (result) {
						scope.curVal = ids;
						scope.filelist = result;
						scope.$apply();
					});
			};

			scope.documentsControl = {
				add: addDocument,
				remove: removeDocument,
				reset: resetLibrary,
				update: updateLibrary
			};

			Document.getDocumentsInList (scope.originals)
				.then (function (result) {
					scope.filelist = result;
					scope.$apply();
				});
		}
	};
})
// -------------------------------------------------------------------------
//
// directive to edit / view document field in template
//
// -------------------------------------------------------------------------
.directive ('contentArtifact', [ 'ArtifactModel', 'Authentication', function (ArtifactModel, Authentication) {
	return {
		restrict : 'A', // only activate on element attribute
		require  : '?ngModel', // get a hold of NgModelController
		scope    : {
			curVal   : '=ngModel',
			editable : '=',
			project  : '=',
			title    : '='
		},
		replace     : true,
		templateUrl : 'modules/templates/client/views/template-artifact-editor.html',
		link : function (scope, element, attrs, NgModelController) {
			scope.authentication = Authentication;

			scope.expanded = false;
			scope.loading  = false;
			scope.loaded   = false;
			//
			// watch the artifact to see if it has changed, if so, we have
			// to load it up in full
			//
			scope.$watch ('artifact._id', function (newval, oldval) {
				if (!newval) return;
				//
				// display the loading icon until loading done
				//
				scope.loading = false;
				scope.loaded  = false;
				scope.curVal  = scope.artifact._id;
				//
				// load the full artifact and then swap out the display
				//
				ArtifactModel.getModel (newval).then (function (model) {
					// console.log (model);
					scope.loading  = false;
					scope.loaded   = true;
					scope.artifact = model;
					scope.$apply();
				});
			});
			scope.expand = function () {
				scope.expanded = !scope.expanded;
			};


			scope.artifact = {};
			scope.artifact._id = scope.curVal;

		}
	};
}])



;


