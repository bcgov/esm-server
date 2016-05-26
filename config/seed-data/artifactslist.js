
var artifacttypes = [{
    name: 'Valued Component',
    multiple: false,
    code: 'valued-component',
    milestone: 'valued-component',
    versions : [
        'Submission',
        'Draft for Public Comment Period',
        'Draft VC (DAIR)',
        'Final Draft (DAIR)',
        'Final (AIR)'
    ]
},{
    name: 'Valued Component Package',
    multiple: true,
    isTemplate: false,
    isArtifactCollection: true,
    isDocument: false,
    code: 'valued-component-package',
    milestone: 'valued-component-package',
    versions : [
        'Final'
    ],
    stages: [{
        name: 'Edit',
        next: 'Decision',
        prev: '',
        activity: 'edit'
    },{
        name: 'Decision',
        next: 'Publishing',
        prev: 'Edit',
        activity: 'decision'
    },{
        name: 'Publishing',
        next: '',
        prev: 'Decision',
        activity: 'publish'
    }]
},{
    name: 'Project Description',
    code: 'project-description',
    milestone: 'project-description',
    multiple: false,
    versions : [
        'Submission',
        'Draft',
        'Final',
        'Draft for Draft AIR',
        'Final for Draft AIR',
        'Draft for AIR',
        'Final for AIR',
        'Draft for Application',
        'Certified (Schedule A)'
    ]
},{
    name: 'Section 10(1)(a) Order',
    milestone: 'section-10-1-a-order',
    code: 'section-10-1-a-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'Section 10(1)(b) Order',
    milestone: 'section-10-1-b-order',
    code: 'section-10-1-b-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'Section 10(1)(c) Order',
    milestone: 'section-10-1-c-order',
    code: 'section-10-1-c-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'Section 7(3) Order',
    milestone: 'section-7-3-order',
    code: 'section-7-3-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'Section 11 Order',
    milestone: 'section-11-order',
    code: 'section-11-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'CC Test Templated',
    code: 'cc-test-template',
    milestone: 'section-11-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'CC Test Document',
    code: 'cc-test-document',
    milestone: 'section-11-order',
    isDocument:true,
    isTemplate:false,
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'Section 11 Schedule A',
    milestone: 'section-11-schedule-a',
    code: 'section-11-schedule-a',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'Section 34 Order',
    milestone: 'section-34-order',
    code: 'section-34-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'Section 36 Order',
    milestone: 'section-36-order',
    code: 'section-36-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'Section 36 Schedule A',
    milestone: 'section-36-schedule-a',
    code: 'section-36-schedule-a',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'Section 36 Schedule B',
    milestone: 'section-36-schedule-b',
    code: 'section-36-schedule-b',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'Inspection Report',
    milestone: 'inspection-report',
    code: 'inspection-report',
    multiple: true,
    versions : [
        'Draft',
        'Final'
    ]
},{
    name: 'Environmental Assessment Certificate',
    milestone: 'environmental-assessment-certificate',
    code: 'environmental-assessment-certificate',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
}];
var stages = [{
		name: 'Edit',
        next: 'Review',
        prev: '',
		activity: 'edit'
	},{
		name: 'Review',
        next: 'Approval',
        prev: 'Edit',
		activity: 'review'
	},{
		name: 'Approval',
        next: 'Executive Approval',
        prev: 'Review',
		activity: 'approve'
	},{
		name: 'Executive Approval',
        next: 'Publishing',
        prev: 'Approval',
		activity: 'executive'
	},{
		name: 'Publishing',
        next: 'Notification',
        prev: 'Executive Approval',
		activity: 'publish'
	},{
		name: 'Notification',
        next: '',
        prev: 'Publishing',
		activity: 'notify'
	}];


module.exports = {
	templates:require('./jtemplates.json'),
	stages:stages,
	artifacttypes:artifacttypes
};
