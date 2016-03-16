'use strict';

/**
 * Module dependencies.
 */
var validator = require('validator');
var crypto = require('crypto');
var _ = require('lodash');
/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function (password) {
	return (this.provider !== 'local' || validator.isLength(password, 3));
};

/**
 * A Validation function for local strategy email
 */
var validateLocalStrategyEmail = function (email) {
	return ((this.provider !== 'local' && !this.updated) || validator.isEmail(email));
};



/**
 * Hook a pre save method to hash the password
 */
var preSave = function (next) {
	if (this.password && this.isModified('password') && this.password.length >= 6) {
		this.salt = crypto.randomBytes(16).toString('base64');
		this.password = this.hashPassword(this.password);
	}
	next();
};

/**
 * Create instance method for hashing a password
 */
var newMethods = {};
var newStatics = {};

newMethods.hashPassword = function (password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
newMethods.authenticate = function (password) {
	return this.password === this.hashPassword(password);
};

newMethods.setUserRole = function (role) {
	this.roles.push (role);
	this.roles = _.uniq (this.roles);
};


/**
 * Find possible not used username
 */
newStatics.findUniqueUsername = function (username, suffix, callback) {
	var _this = this;
	var possibleUsername = username.toLowerCase() + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function (err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

module.exports = require ('../../../core/server/controllers/core.models.controller').generateModel('User', {
	__audit     : true,
	__access    : true,
	__tracking  : true,

	firstName: 	{ type: String, trim: true, default: '', validate: [validateLocalStrategyProperty, 'Please fill in your first name'] },
	middleName: 	{ type: String, trim: true, default: null },
	lastName: 	{ type: String, trim: true, default: '', validate: [validateLocalStrategyProperty, 'Please fill in your last name'] },
	displayName: 	{ type: String, trim: true },
	email: 		{ type: String, unique: true, lowercase: true, trim: true, default: '', validate: [validateLocalStrategyEmail, 'Please fill a valid email address'] },
	username: 	{ type: String, unique: 'Username already exists', required: 'Please fill in a username', lowercase: true, trim: true	},
	password: 	{ type: String, default: '', validate: [validateLocalStrategyPassword, 'Password should be longer'] },
	salt: 		{ type: String },
	provider: 	{ type: String },
	providerData: 	{},
	additionalProvidersData: {},
	roles: 		[{type: String}],
	updated: 		{ type: Date },
	created: 		{ type: Date, default: Date.now },
	/* For reset password */
	resetPasswordToken: { type: String },
	resetPasswordExpires: { type: Date },

	//contactName : { type:String, default: '' }, REPLACED WITH DISPLAYNAME
	//code: 		{type:String, default: ''}, REPLACED WITH USERNAME
	org: 		{ type:'ObjectId', ref:'Org', default:null, index:true },
	orgName: 		{ type:String, default: '' },
	personId: 	{ type:Number, default: null }, // From ePIC
	title: 		{ type:String, default: '' },
	phoneNumber: 	{ type:String, default: '' },
	
	// if groupId == null, then this is a person (hack)
	eaoStaffFlag: 	{ type:Boolean, default: false },
	proponentFlag: { type:Boolean, default: false },
	salutation  : 	{ type:String, default: '' },
	department  : 	{ type:String, default: '' },
	faxNumber   : 	{ type:String, default: '' },
	cellPhoneNumber : { type:String, default: '' },
	address1    : 	{ type:String, default: '' },
	address2    : 	{ type:String, default: '' },
	city        : 	{ type:String, default: '' },
	province    : 	{ type:String, default: '' },
	country     : 	{ type:String, default: '' },
	postalCode  : 	{ type:String, default: '' },
	notes       : 	{ type:String, default: '' },

	// contact newMethods
	viaEmail: 	{ type:Boolean, default: true },
	viaMail: 		{ type:Boolean, default: false },

	__preSave: preSave,
	__methods: newMethods,
	__statics: newStatics
});
