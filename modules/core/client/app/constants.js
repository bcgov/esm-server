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
			'lowermainland': 'Lower Mainland',
			'thompsonokanagan': 'Thompson Okanagan',
			'omnieca': 'Omineca',
			'peace': 'Peace',
			'skeena': 'Skeena',
			'thompson': 'Thompson',
			'vancouverisland': 'Vancouver Island'
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
			'Health'
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
			'Tourist Destination'
		]
	)
	.value('ProcessCodes', []);
