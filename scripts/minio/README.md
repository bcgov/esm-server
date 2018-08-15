# Minio update scripts

This folder contains scripts that can/should be used to update teh database data in order to make it compatible with Minio.

To execute the script, copy the file to the container running mongo and then issue the following command:
`mongo -u admin -p $MONGODB_ADMIN_PASSWORD --authenticationDatabase=admin localhost:27017/$MONGODB_DATABASE updateInternalURL.js`
