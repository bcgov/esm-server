module.exports = {
	eao : [
		{
			username    : 'admin',
			firstName   : 'admin',
			lastName    : 'admin',
			password    : 'admin',
			roles       : ['admin'],
      userGuid    : 'admin',
      userType    : 'internal'
		},
		{
			username    : 'eaouser',
			firstName   : 'Eao',
			lastName    : 'User'
		},
		{
			username    : 'eaomining',
			firstName   : 'Eao',
			lastName    : 'Mining',
			roles       : ['sector:mining']
		},
		{
			username    : 'eaoenergy',
			firstName   : 'Eao',
			lastName    : 'Energy',
			roles       : ['sector:energy']
		},
	],
	ajax : [
		{
			username    : 'ajaxadmin',
			firstName   : 'Ajax',
			lastName    : 'Admin',
			roles       : ['ajax:admin']
		},
		{
			username    : 'ajaxuser',
			firstName   : 'Ajax',
			lastName    : 'User'
		},
	],
	acme : [
		{
			username    : 'acmeadmin',
			firstName   : 'Acme',
			lastName    : 'Admin',
			roles       : ['acme:admin']
		},
		{
			username    : 'acmeuser',
			firstName   : 'Acme',
			lastName    : 'User'
		},
	]
};

