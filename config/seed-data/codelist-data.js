var lists = [
	{
		name: 'salutations',
		items: [
			{ value: 'Mr', display: 'Mr', order: 1 },
			{ value: 'Mrs', display: 'Mrs', order: 2 },
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
		items: [
			{ value: 'British Columbia', display: 'British Columbia', order: 1 },
			{ value: 'Canada', display: 'Canada', order: 2 },
			{ value: 'United States', display: 'United States', order: 3 },
			{ value: 'Other', display: 'Other', order: 4 },
			{ value: '', display: '', order: 999 }
		]
	},
	{
		name: 'documentTypes',
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
			{ value: '', display: '', order: 999 }
		]
	},
	{
		name: 'projectGroupTypes',
		items: [
			{ value: 'Proponent', display: 'Proponent', order: 1 },
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
