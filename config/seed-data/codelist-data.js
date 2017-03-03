var lists = [
	{
		name: 'salutations',
		displayName: 'Salutations',
		whereUsed: 'Contacts',
		items: [
			{ value: 'Mr', display: 'Mr', order: 1, displayPriority: true },
			{ value: 'Mrs', display: 'Mrs', order: 2, displayPriority: true },
			{ value: 'Miss', display: 'Miss', order: 3 },
			{ value: 'Chief', display: 'Chief', order: 4 , active: false},
			{ value: 'Councillor', display: 'Councillor', order: 5, active: false },
			{ value: 'Honourable', display: 'Honourable', order: 6, active: false },
			{ value: 'Dr', display: 'Dr', order: 7 },
			{ value: 'Capt', display: 'Capt', order: 8 },
			{ value: 'Prof', display: 'Prof', order: 9 },
			{ value: 'Rev', display: 'Rev', order: 10 },
			{ value: 'Other', display: 'Other', order: 11, active: false },
			{ value: '', display: '', order: 999 }
		]
	},
	{
		name: 'organizationTypes',
		displayName: 'Organization Types',
		whereUsed: 'Organizations',
		items: [
			{ value: 'Aboriginal Group', display: 'Aboriginal Group', order: 1 },
			{ value: 'Association/NGO', display: 'Association/NGO', order: 2 },
			{ value: 'Consultant', display: 'Consultant', order: 3 },
			{ value: 'Federal Agency', display: 'Federal Agency', order: 4 },
			{ value: 'Local Government', display: 'Local Government', order: 5 },
			{ value: 'Ministry', display: 'Ministry', order: 6 },
			{ value: 'MLA', display: 'MLA', order: 7 },
			{ value: 'Municipality', display: 'Municipality', order: 8 },
			{ value: 'Other Agency', display: 'Other Agency', order: 9 },
			{ value: 'Other Government', display: 'Other Government', order: 10 },
			{ value: 'Proponent', display: 'Proponent', order: 11 },
			{ value: '', display: '', order: 999 }
		]
	},
	{
		name: 'emailTemplateGroups',
		displayName: 'Email Template Group',
		whereUsed: 'Email Templates',
		items: [
			{ value: 'Invitation', display: 'Invitation', order: 1 },
			{ value: 'Notification', display: 'Notification', order: 2 },
			{ value: 'Update', display: 'Update', order: 3 },
			{ value: 'Other', display: 'Other', order: 4 },
			{ value: '', display: '', order: 999 }
		]
	},
	{
		name: 'organizationRegisteredIns',
		displayName: 'Organization Registered In',
		whereUsed: 'Organizations',
		items: [
			{ value: 'British Columbia', display: 'British Columbia', order: 1, displayPriority: true },
			{ value: 'Canada', display: 'Canada', order: 2 },
			{ value: 'United States', display: 'United States', order: 3 },
			{ value: 'Other', display: 'Other', order: 4 },
			{ value: '', display: '', order: 999 }
		]
	},
	{
		name: 'documentTypes',
		displayName: 'Document Types',
		whereUsed: 'Documents',
		items: [
			{ value: 'Assessment', display: 'Assessment', order: 1 },
			{ value: 'Certificate Information', display: 'Certificate Information', order: 2 },
			{ value: 'Comments/Submissions', display: 'Comments/Submissions', order: 3 },
			{ value: 'Correspondence', display: 'Correspondence', order: 4 },
			{ value: 'Letter', display: 'Letter', order: 5 },
			{ value: 'Notice/News Release', display: 'Notice/News Release', order: 6 },
			{ value: 'Notification', display: 'Notification', order: 7 },
			{ value: 'Order', display: 'Order', order: 8 },
			{ value: 'Project Information', display: 'Project Information', order: 9 },
			{ value: '', display: '', order: 999 },
			// MMTI values
			{ value: 'Inspection Report', display: 'Inspection Report', order: 10 },
			{ value: 'Certificate', display: 'Certificate', order: 11 },
			{ value: 'Certificate Amendment', display: 'Certificate Amendment', order: 12 },
			{ value: 'Permit', display: 'Permit', order: 13 },
			{ value: 'Permit Amendment', display: 'Permit Amendment', order: 14 },
			{ value: 'Mine Manager Response', display: 'Mine Manager Response', order: 15 },
			{ value: 'Annual Report', display: 'Annual Report', order: 16 },
			{ value: 'Annual Reclamation Report', display: 'Annual Reclamation Report', order: 17 },
			{ value: 'Dam Safety Inspection', display: 'Dam Safety Inspection', order: 18 }

		]
	},
	{
		name: 'projectGroupTypes',
		displayName: 'Project Group Types',
		whereUsed: 'Project',
		items: [
			{ value: 'Proponent', display: 'Proponent', order: 1, displayPriority: true },
			{ value: 'Aboriginal Group', display: 'Aboriginal Group', order: 2 },
			{ value: 'Working Group', display: 'Working Group', order: 3 },
			{ value: 'Technical Working Group', display: 'Technical Working Group', order: 4 },
			{ value: 'Agency', display: 'Agency', order: 5 },
			{ value: 'Notification', display: 'Notification', order: 6 },
			{ value: 'Referral', display: 'Referral', order: 7 },
			{ value: 'Other', display: 'Other', order: 8 },
			{ value: '', display: '', order: 999 }
		]
	},
	{
		name: 'inspectionReportFollowUpTypes',
		displayName: 'Inspection Report Follow Up Types',
		whereUsed: 'TBD',
		items: [
			{ value: 'Inspection Complete', display: 'Inspection Complete', order: 1 },
			{ value: 'Mine Manager Response', display: 'Mine Manager Response', order: 2 },
			{ value: '', display: '', order: 999 }
		]
	}

];

module.exports = {
	lists: lists
};
