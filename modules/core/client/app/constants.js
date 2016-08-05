/* global _ */

'use strict';

angular
	.module('core')
	.constant('_', window._)
	.constant('d3', window.d3)
	.constant('google', window.google)
	.constant('moment', window.moment)
	.constant('PROVINCES',
		{
			'ab': 'Alberta',
			'bc': 'British Columbia',
			'mb': 'Manitoba',
			'nb': 'New Brunswick',
			'nl': 'Newfoundland and Labrador',
			'ns': 'Nova Scotia',
			'on': 'Ontario',
			'pe': 'Prince Edward Island',
			'qc': 'Quebec',
			'sk': 'Saskatchewan',
			'nt': 'Northwest Territories',
			'nu': 'Nunavut',
			'yt': 'Yukon'
		}
	)
	.constant('REGIONS',
		{
			'cariboo': 'Cariboo',
			'kootenay': 'Kootenay',
			'lower mainland': 'Lower Mainland',
			'okanagan': 'Okanagan',
			'thompson okanagan': 'Thompson Okanagan',
			'thompson-nicola': 'Thompson-Nicola',
			'omineca': 'Omineca',
			'peace': 'Peace',
			'skeena': 'Skeena',
			'vancouver island': 'Vancouver Island',
			'south central (kamloops office)': 'South Central (Kamloops Office)',
			'southeast (cranbrook office)': 'Southeast (Cranbrook Office)',
			'northwest (smithers office)': 'Northwest (Smithers Office)',
			'central-northeast (prince george office)': 'Central-Northeast (Prince George Office)',
			'southwest (victoria office)': 'Southwest (Victoria Office)',
			'southeast (cranbrook)': 'Southeast (Cranbrook)'
		}
	)
	.constant('COMPANY_TYPES',
		{
			'private': 'Privately Owned',
			'public': 'Publically Traded',
		}
	)
	.constant('TASK_STATUS',
		[
			'Not Required',
			'Not Started',
			'In Progress',
			'Complete'
		]
	)
	.constant('VC_ASSESSMENT_CATEGORIES',
		[
			'Environment',
			'Economic',
			'Social',
			'Heritage',
			'Health',
			'Other',
			'Requirements'
		]
	)
	.constant('VCTYPES',
		[ 'Valued Component',
		'Pathway Component'
		]
	)
	.constant('PILLARS',
		[
			'Environment',
			'Economic',
			'Social',
			'Heritage',
			'Health',
			'Other',
			'Requirements'
		]
	)
	.constant('PROJECT_TYPES',
		[
			'Mining',
			'Energy',
			'Transportation',
			'Water Management',
			'Industrial',
			'Waste Management',
			'Waste Disposal',
			'Food Processing',
			'Tourist Destination',
			'Other'
		]
	)
	.constant('CE_STAGES',
		[
			'Pre-Construction',
			'Construction',
			'Operations',
			'Decommissioning'
		]
	)
	.constant('DOCUMENT_TEMPLATE_TYPES',
		[
			'Project Description',
			'Schedule A',
			'Section 7(3) Order',
			'Section 10(1)(a) Order',
			'Section 10(1)(b) Order',
			'Section 10(1)(c) Order',
			'Section 11 Order',
			'Valued Component',
			'AIR',
			'Application',
			'Conditions List',
			'Section 34 Order',
			'Section 36 Order',
			'Environmental Assessment Certificate'
		]
	)
	.constant('COMMENT_REJECT',
		[
			'Unsuitable Language',
			'Quoting Third Parties',
			'Petitions',
			'Personally Identifying Information'
		]
	)
	.constant('PROJECT_ROLES',
		[
			{'code':'project:staff','name':'Staff'},
			{'code':'project:wg','name':'Working Group'},
			{'code':'project:proponent','name':'Proponent'}
		]
	)
	.constant('PROJECT_STATUS',
		{
			'initiated' : 'Initiated',
			'submitted' : 'Submitted',
			'inprogress' : 'In Progress',
			'certified' : 'Certified',
			'decommissioned' : 'Decommissioned'
		}
	)
	.constant('PROJECT_STATUS_ARRAY',
		[
			'Initiated',
			'Submitted',
			'In Progress',
			'Certified',
			'Not Certified',
			'Decommissioned'
		]
	)
	.constant('PROJECT_STATUS_PUBLIC',
		{
			'inprogress' : 'In Progress',
			'certified' : 'Certified',
			'decommissioned' : 'Decommissioned'
		}
	)
	.constant('PROJECT_DECISION',
		{
			'pre-ea-act-approval' : 'Pre-EA Act Approval',
			'in-progress' : 'In Progress',
			'certificate-not-required' : 'Certificate Not Required',
			'further-assessment-required' : 'Further Assessment Required',
			'certificate-issued' : 'Certificate Issued',
			'certificate-refused' : 'Certificate Refused',
			'terminated' : 'Terminated',
			'withdrawn' : 'Withdrawn'
		}
	)	.factory('ENV', function () {
		 // MEM, EAO
		if (	window.location.href.indexOf('mem.') >= 0 ||
			window.location.href.indexOf('mem-') >= 0 ||
			window.location.href.indexOf('mines.') >= 0 ) return 'MEM';
		else return 'EAO';
	})
	.constant('RELEASE',
		{
			'enableEnforcements': false,
			'enableDecisions': false,
			'enableSchedule': false,
			'enableComplaints': false,
			'enableConditions': false,
			'enableInspectionReports': false,
			'redirectHomepageToGeorgeMassey': false
		}
	)
	.factory('LOGO', function (ENV) {
		// Use the env from above to determine the logo.
		if (ENV === 'EAO') {
			return 'modules/core/client/img/brand/bc_logo_transparent.png'; // BC Logo
		}
		if (ENV === 'MEM') {
			return 'modules/core/client/img/brand/mem-logo-inverted.png'; // EAO Logo
		}
	})
	.constant('SALUTATIONS', ['Mr','Mrs','Miss','Ms','Dr','Capt','Prof','Rev','Other'])
	.factory ('codeFromTitle', function () {
		return function (title) {
			var s = title.toLowerCase ();
			s = s.replace (/\W/g,'-');
			s = s.replace (/-+/,'-');
			return s;
		};
	})
	.value('ProcessCodes', []);
