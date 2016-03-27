
var artifacttypes = [{
    type: 'Valued Component',
    multiple: true,
    milestone: 'valued-component',
    versions : [
        'Submission',
        'Draft for Public Comment Period',
        'Draft VC (DAIR)',
        'Final Draft (DAIR)',
        'Final (AIR)'
    ]
},{
    type: 'Project Description',
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
    type: 'Section 10(1)(a) Order',
    milestone: 'section-10-1-a-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    type: 'Section 10(1)(b) Order',
    milestone: 'section-10-1-b-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    type: 'Section 10(1)(c) Order',
    milestone: 'section-10-1-c-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    type: 'Section 7(3) Order',
    milestone: 'section-7-3-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    type: 'Section 11 Order',
    milestone: 'section-11-order',
    multiple: false,
    versions : [
        'Draft',
        'Final'
    ]
},{
    type: 'Schedule A',
    milestone: 'schedule-a',
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
