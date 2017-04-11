var lists = [
	{
		name: 'salutations',
		displayName: 'Salutations',
		whereUsed: 'Contacts',
		items: [
			{ value: 'Mr', display: 'Mr', displayPriority: true },
			{ value: 'Mrs', display: 'Mrs', displayPriority: true },
			{ value: 'Miss', display: 'Miss' },
			{ value: 'Chief', display: 'Chief' , active: false},
			{ value: 'Councillor', display: 'Councillor', active: false },
			{ value: 'Honourable', display: 'Honourable', active: false },
			{ value: 'Dr', display: 'Dr' },
			{ value: 'Capt', display: 'Capt' },
			{ value: 'Prof', display: 'Prof' },
			{ value: 'Rev', display: 'Rev' },
			{ value: 'Other', display: 'Other', active: false },
			{ value: '', display: '' }
		]
	},
	{
		name: 'organizationTypes',
		displayName: 'Organization Types',
		whereUsed: 'Organizations',
		items: [
			{ value: 'Aboriginal Group', display: 'Aboriginal Group' },
			{ value: 'Association/NGO', display: 'Association/NGO' },
			{ value: 'Consultant', display: 'Consultant' },
			{ value: 'Federal Agency', display: 'Federal Agency' },
			{ value: 'Local Government', display: 'Local Government' },
			{ value: 'Ministry', display: 'Ministry' },
			{ value: 'MLA', display: 'MLA' },
			{ value: 'Municipality', display: 'Municipality' },
			{ value: 'Other Agency', display: 'Other Agency' },
			{ value: 'Other Government', display: 'Other Government' },
			{ value: 'Proponent', display: 'Proponent' },
			{ value: '', display: '' }
		]
	},
	{
		name: 'emailTemplateGroups',
		displayName: 'Email Template Group',
		whereUsed: 'Email Templates',
		items: [
			{ value: 'Invitation', display: 'Invitation' },
			{ value: 'Notification', display: 'Notification' },
			{ value: 'Update', display: 'Update' },
			{ value: 'Other', display: 'Other' },
			{ value: '', display: '' }
		]
	},
	{
		name: 'organizationRegisteredIns',
		displayName: 'Organization Registered In',
		whereUsed: 'Organizations',
		items: [
			{ value: 'British Columbia', display: 'British Columbia', displayPriority: true },
			{ value: 'Canada', display: 'Canada' },
			{ value: 'United States', display: 'United States' },
			{ value: 'Other', display: 'Other' },
			{ value: '', display: '' }
		]
	},
	{
		name: 'documentTypes',
		displayName: 'Document Types',
		whereUsed: 'Documents',
		items: [
			{ value: 'Certificate Amendment', display: 'Amendment' },
			{ value: 'Assessment', display: 'Assessment' },
			{ value: 'Certificate', display: 'Certificate' },
			{ value: 'Comments/Submissions', display: 'Comments/Submissions' },
			{ value: 'Correspondence', display: 'Correspondence' },
			{ value: 'Inspection Report', display: 'Inspection Report' },
			{ value: 'Letter', display: 'Letter' },
			{ value: 'Notice/News Release', display: 'Notice/News Release' },
			{ value: 'Notification', display: 'Notification' },
			{ value: 'Order', display: 'Order' },
			{ value: 'Project Information', display: 'Project Information' },
			{ value: 'Report/Plan', display: 'Report/Plan' },
			{ value: 'Request', display: 'Request' },
			{ value: '', display: '' }
		]
	},
	{
		name: 'projectGroupTypes',
		displayName: 'Project Group Types',
		whereUsed: 'Project',
		items: [
			{ value: 'Proponent', display: 'Proponent', displayPriority: true },
			{ value: 'Aboriginal Group', display: 'Aboriginal Group' },
			{ value: 'Working Group', display: 'Working Group' },
			{ value: 'Technical Working Group', display: 'Technical Working Group' },
			{ value: 'Agency', display: 'Agency' },
			{ value: 'Notification', display: 'Notification' },
			{ value: 'Referral', display: 'Referral' },
			{ value: 'Other', display: 'Other' },
			{ value: '', display: '' }
		]
	},
	{
		name: 'inspectionReportFollowUpTypes',
		displayName: 'Inspection Report Follow Up Types',
		whereUsed: 'TBD',
		items: [
			{ value: 'Inspection Complete', display: 'Inspection Complete' },
			{ value: 'Mine Manager Response', display: 'Mine Manager Response' },
			{ value: '', display: '' }
		]
	}

];

module.exports = {
	lists: lists
};
