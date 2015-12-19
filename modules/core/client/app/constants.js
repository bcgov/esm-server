/* global _ */

'use strict';

angular
	.module('core')
	.constant('_', _)
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
			'okanagan': 'Okanagan',
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
	.value('Global', {
		user:{name:{}, _id:undefined},
		public: true
	})
	.value('ProcessCodes', []);
