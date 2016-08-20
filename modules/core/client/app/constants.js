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
	.constant('PROJECT_CONDITION_PHASES',
		[
			'Pre-Construction',
			'Construction',
			'Operations',
			'Decommissioning'
		]
	)
	.constant('PROJECT_TYPES',
		[
			'Mining',
			'Energy-Electrical',
			'Energy-Petroleum & Natural Gas',
			'Transportation',
			'Water Management',
			'Industrial',
			'Waste Disposal',
			'Food Processing',
			'Tourist Destination',
			'Other'
		]
	)
	.constant('PROJECT_SUB_TYPES',
		{
			'Mining': [
				'Coal Mines',
				'Construction Stone and Industrial Mineral Quarries',
				'Mineral Mines',
				'Off-shore Mines',
				'Placer Mineral Mines',
				'Sand and Gravel Pits'
			],
			'Energy-Electrical': [
				'Electric Transmission Lines',
				'Power Plants'
			],
			'Energy-Petroleum & Natural Gas': [
				'Energy Storage Facilities',
				'Natural Gas Processing Plants',
				'Off-shore Oil or Gas Facilities',
				'Transmission Pipelines'
			],
			'Transportation': [
				'Airports',
				'Ferry Terminals',
				'Marine Port Facilities',
				'Public Highways',
				'Railways'
			],
			'Water Management': [
				'Dams',
				'Dykes',
				'Groundwater Extraction',
				'Shoreline Modification',
				'Water Diversion'
			],
			'Industrial': [
				'Forest Products Industries',
				'Non-metallic Mineral Products Industries',
				'Organic and Inorganic Chemical Industry',
				'Other Industries',
				'Primary Metals Industry'
			],
			'Waste Disposal': [
				'Hazardous Waste Facilities',
				'Local Government Liquid Waste Management Facilities',
				'Local Government Solid Waste Management Facilities'
			],
			'Food Processing': [
				'Fish Products Industry',
				'Meat and Meat Products Industry',
				'Poultry Products Industry'
			],
			'Tourist Destination': [
				'Golf Resorts',
				'Marina Resorts',
				'Resort Developments',
				'Ski Resorts'
			],
			'Other': [
				'Other'
			]
		})
	.constant('CEAA_TYPES',
		[
			'None',
			'Comprehensive Study (Pre CEAA 2012)',
			'Cooperative (CEAA 2012)',
			'Cooperative (Pre CEAA 2012)',
			'Coordinated',
			'Equivalent (Provincial Lead)',
			'Equivilant (Federal Lead)',
			'Panel (CEAA 2012)',
			'Panel (Pre CEAA 2012)',
			'Screening (Pre CEAA 2012)',
			'Substituted (Federal Lead)',
			'Substituted (Provincial Lead)'
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
	.constant('ENFORCEMENT_ACTIONS',
		[
			'Warning',
			'Order to Cease',
			'Order to Remedy',
			'Compliance Agreement',
			'Referral',
			'Other'
		]
	)
	.constant('ENFORCEMENT_STATUS',
		[
			'Open',
			'Resolved',
			'Recinded'
		]
	)	.constant('PROJECT_DECISION',
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
			'enableEnforcements': true,
			'enableDecisions': true,
			'enableSchedule': true,
			'enableComplaints': true,
			'enableConditions': true,
			'enableInvitations': true,
			'enableInspectionReports': true,
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
