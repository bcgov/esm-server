The purpose of this script is to update the mongodb collections in various ways as part of an update to roles and permissions.

The original jira ticket for this effor: EM-824
- Includes code changes to removed references to old roles, and update remaining roles to the new names.
- Includes necessary mongodb changes, which are enacted by running the updateRoles.js script.  These are the same changes that are needed for EM-919.

A ticket for additional changes: EM-919
- Includes code changes to removed references to old roles, and update remaining roles to the new names.
- Includes necessary mongodb changes, which are enacted by running the updateRoles.js script.  These are the same changes that are needed for EM-824.

A quick overview of the changes:
- Delete old roles.
  - Delete _roles records that use an old role.
  - Delete _permissions records that use an old role.
  - Many collections contain arrays of roles, remove from the array any old roles.
- Update remaining roles to the new names.
  - Update the role field in _roles records
  - Update the role field in _permissions records
  - Many collections contain arrays of roles, update the roles in the array to use the new role names.

To Execute:

run `node updateRolesAndPermissions.js mongodb-connection-url`
