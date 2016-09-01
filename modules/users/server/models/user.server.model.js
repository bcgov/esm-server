'use strict';

/**
 * Module dependencies.
 */
var validator = require('validator');
var crypto = require('crypto');
var _ = require('lodash');
var uid = require('uid-safe');
var mongoose = require('mongoose');

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

var validateUniqueEmail = function (email) {
	return this.validateEmail(email);
};


/**
 * Hook a pre save method to hash the password
 */
var preSave = function (next) {
	if (this.password && this.isModified('password') && this.password.length >= 6) {
		this.salt = crypto.randomBytes(16).toString('base64');
		this.password = this.hashPassword(this.password);
	}

	if (this.userGuid === undefined || this.userGuid.trim() === '') {
		this.userGuid = 'ESM-' + uid.sync(18);
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

// newMethods.setUserRole = function (role) {
// 	this.roles.push (role);
// 	this.roles = _.uniq (this.roles);
// };
// newMethods.setUserRoles = function (roles) {
// 	this.roles = roles;
// };

newMethods.modRoles = function (method, rolearray) {
	if (method === 'add') {
		this.roles = _.union (this.roles, rolearray);
	}
	else if (method === 'remove') {
		_.remove (this.roles, function (code) {
			return _.indexOf (rolearray, code) !== -1;
		});
	}
	else {
		this.roles = _.union ([], rolearray);
	}
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

newStatics.validateEmail = function (email) {
	var _this = this;
	if (!_.isEmpty(email)) {

		if (validator.isEmail(email)) {
			// see if unique..
			mongoose.model ('User').findOne({
				email: new RegExp(email.trim(), 'i')
			}, function (err, user) {
				if (!err) {
					if (!user) {
						//console.log('validateEmail unique!');
						return true;
					} else {
						// not unique..
						//console.log('validateEmail this._id = ', JSON.stringify(_this._id));
						//console.log('validateEmail user._id = ', JSON.stringify(user._id));
						//console.log('validateEmail this._id === user._id = ', (_this._id.toString() === user._id.toString()));
						return _this._id.toString() === user._id.toString();
					}
				} else {
					//console.log('validateEmail err = ', JSON.stringify(err));
					return false;
				}
			});
		} else {
			//console.log('validateEmail invalid = ', email);
			return false;
		}
	} else {
		return true;
	}

};

module.exports = require ('../../../core/server/controllers/core.schema.controller')('User', {
	__audit                 : true,
	firstName               : { type: String, trim: true, default: ''},
	middleName              : { type: String, trim: true, default: null},
	lastName                : { type: String, trim: true, default: ''},
	displayName             : { type: String, trim: true },
	email                   : { type: String, trim: true, default: '' },
	username                : { type: String, unique: 'Username already exists', required: 'Please fill in a username', lowercase: true, trim: true	},
	password                : { type: String, default: '' },
	salt                    : { type: String },
	provider                : { type: String },
	providerData            : {},
	additionalProvidersData : {},
	roles                   : [{ type: String}],
	oldroles                : [{ type: String}],
	updated                 : { type: Date },
	created                 : { type: Date, default: Date.now },
	/* For reset password */
 	resetPasswordToken      : { type: String },
	resetPasswordExpires    : { type: Date },
	//contactName           : { type:String, default: '' }, REPLACED WITH DISPLAYNAME
	//code                  : type:String, default: ''}, REPLACED WITH USERNAME
	org                     : { type:'ObjectId', ref:'Organization', default:null, index:true },
	orgName                 : { type:String, default: '' },
	personId                : { type:Number, default: null }, // From ePIC
	title                   : { type:String, default: '' },
	homePhoneNumber         : { type:String, default: '' },
	phoneNumber             : { type:String, default: '' },
	// if groupId            = null, then this is a person (hack)
	eaoStaffFlag            : { type:Boolean, default: false },
	proponentFlag           : { type:Boolean, default: false },
	salutation              : { type:String, default: '' },
	department              : { type:String, default: '' },
	faxNumber               : { type:String, default: '' },
	cellPhoneNumber         : { type:String, default: '' },
	address1                : { type:String, default: '' },
	address2                : { type:String, default: '' },
	city                    : { type:String, default: '' },
	province                : { type:String, default: '' },
	country                 : { type:String, default: '' },
	postalCode              : { type:String, default: '' },
	notes                   : { type:String, default: '' },
	signature 				: { type:'ObjectId', default: null, ref:'Document' },
	// contact
	viaEmail                : { type:Boolean, default: true },
	viaMail                 : { type:Boolean, default: false },
	// Siteminder User Guid - smgov_userguid header
	userGuid                : { type: String, unique: 'User GUID already exists', lowercase: true, trim: true  },
	// Siteminder User Type   - smgov_usertype header
	userType                : { type: String, unique: false, lowercase: true, trim: true, default: '' },
	presave__               : preSave,
	methods__               : newMethods,
	statics__               : newStatics
});
