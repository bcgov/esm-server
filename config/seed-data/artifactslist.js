var artifacttypes = [{
	name: 'Valued Component',
	isTemplate: false,
	multiple: false,
	code: 'valued-component',
	milestone: 'valued-component',
	versions: [
		'Submission',
		'Draft for Public Comment Period',
		'Draft VC (DAIR)',
		'Final Draft (DAIR)',
		'Final (AIR)'
	],
	phase: ''
}, {
	name: 'Valued Component Package',
	multiple: true,
	isTemplate: false,
	isArtifactCollection: true,
	isDocument: false,
	code: 'valued-component-package',
	milestone: 'valued-component-package',
	versions: [
		'Final'
	],
	stages: [{
		name: 'Edit',
		next: 'Decision',
		prev: '',
		activity: 'edit'
	}, {
		name: 'Decision',
		next: 'Publishing',
		prev: 'Edit',
		activity: 'decision'
	}, {
		name: 'Publishing',
		next: '',
		prev: 'Decision',
		activity: 'publish'
	}],
	phase: ''
}, {
	name: 'Project Description Template',
	code: 'project-description-template',
	milestone: 'project-description-template',
	multiple: false,
	versions: [
		'Submission',
		'Draft',
		'Final',
		'Draft for Draft AIR',
		'Final for Draft AIR',
		'Draft for AIR',
		'Final for AIR',
		'Draft for Application',
		'Certified (Schedule A)'
	],
	phase: ''
}, {
	name: 'Project Description',
	multiple: false,
	isTemplate: false,
	code: 'project-description',
	versions: [
		'Submission',
		'Draft',
		'Final',
		'Draft for Draft AIR',
		'Final for Draft AIR',
		'Draft for AIR',
		'Final for AIR',
		'Draft for Application',
		'Certified (Schedule A)'
	],
	phase: ''
}, {
	name: 'Section 10(1)(a) Order Template',
	milestone: 'section-10-1-a-order',
	code: 'section-10-1-a-order',
	multiple: false,
	versions: [
		'Draft',
		'Final'
	],
	phase: ''
}, {
	name: 'Section 10(1)(b) Order Template',
	milestone: 'section-10-1-b-order',
	code: 'section-10-1-b-order',
	multiple: false,
	versions: [
		'Draft',
		'Final'
	],
	phase: ''
}, {
	name: 'Section 10(1)(c) Order Template',
	milestone: 'section-10-1-c-order',
	code: 'section-10-1-c-order',
	multiple: false,
	versions: [
		'Draft',
		'Final'
	],
	phase: ''
}, {
	name: 'Section 7(3) Order Template',
	milestone: 'section-7-3-order',
	code: 'section-7-3-order',
	multiple: false,
	versions: [
		'Draft',
		'Final'
	],
	phase: ''
}, {
	name: 'Section 11 Order Template',
	milestone: 'section-11-order',
	code: 'section-11-order',
	multiple: false,
	versions: [
		'Draft',
		'Final'
	],
	phase: ''
}, {
	name: 'Section 11 Schedule A Template',
	milestone: 'section-11-schedule-a',
	code: 'section-11-schedule-a',
	multiple: false,
	versions: [
		'Draft',
		'Final'
	],
	phase: ''
}, {
	name: 'Section 34 Order Template',
	milestone: 'section-34-order',
	code: 'section-34-order',
	multiple: false,
	versions: [
		'Draft',
		'Final'
	],
	phase: ''
}, {
	name: 'Section 36 Order Template',
	milestone: 'section-36-order',
	code: 'section-36-order',
	multiple: false,
	versions: [
		'Draft',
		'Final'
	],
	phase: ''
}, {
	name: 'Section 36 Schedule A Template',
	milestone: 'section-36-schedule-a',
	code: 'section-36-schedule-a',
	multiple: false,
	versions: [
		'Draft',
		'Final'
	],
	phase: ''
}, {
	name: 'Section 36 Schedule B Template',
	milestone: 'section-36-schedule-b',
	code: 'section-36-schedule-b',
	multiple: false,
	versions: [
		'Draft',
		'Final'
	],
	phase: ''
}, {
	name: 'Inspection Report Template',
	milestone: 'inspection-report',
	code: 'inspection-report',
	multiple: true,
	versions: [
		'Draft',
		'Final'
	],
	phase: ''
}, {
	name: 'Environmental Assessment Certificate Template',
	milestone: 'environmental-assessment-certificate',
	code: 'environmental-assessment-certificate',
	multiple: false,
	versions: [
		'Draft',
		'Final'
	],
	phase: ''
}];
var stages = [{
	name: 'Edit',
	next: 'Review',
	prev: '',
	activity: 'edit'
}, {
	name: 'Review',
	next: 'Approval',
	prev: 'Edit',
	activity: 'review'
}, {
	name: 'Approval',
	next: 'Executive Approval',
	prev: 'Review',
	activity: 'approve'
}, {
	name: 'Executive Approval',
	next: 'Publishing',
	prev: 'Approval',
	activity: 'executive'
}, {
	name: 'Publishing',
	next: 'Notification',
	prev: 'Executive Approval',
	activity: 'publish'
}, {
	name: 'Notification',
	next: '',
	prev: 'Publishing',
	activity: 'notify'
}];


module.exports = {
	templates: require('./jtemplates.json'),
	stages: stages,
	artifacttypes: artifacttypes
};
