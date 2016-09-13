h1. How to configure a CI/CD pipeline for ESM on OpenShift

- Create a project to house the Jenkins instance that will be responsible for promoting application images (via OpenShift ImageStreamTagS) across environment; the exact project name used was "esm".
- Create the BuildConfiguration within this project using the ```oc``` command and "esm-build-template.json" file in the templates directory:

```oc create -f esm-build-template.json```

- Deploy a Jenkins instance with persistent storage into the esm project using the web gui
- Install the Promoted Builds Jenkins plugin
- Configure a job that has an OpenShift ImageStream Watcher as its SCM source and promotion states for each environment
- In each promotion configuration, tag the target build's image to the appropriate promotion level; this was done using a shell command because the OpenShift plugins do not appear to handle parameter subsitution inside promotions properly.
- Create an OpenShift project for each "environment" (e.g. DEV, TEST, PROD, DEMO, TRAIN); Exact names used were esm-dev, esm-test, esm-prod, esm-demo, esm-train
- Configure the access controls to allow the Jenkins instance to tag imagestreams in the environment projects, and to allow the environment projects to pull images from the esm project:
 
```
oc policy add-role-to-user system:image-puller system:serviceaccount:esm-<env-name>:default -n esm
oc policy add-role-to-user edit system:serviceaccount:esm:default -n esm-<env-name>
```
 
- Use the JSON files in this directory  and `oc` tool to create the necessary resources within each project:

```
oc process -f esm-environment-template.json -v NAME=esm-<env-name>,APPLICATION_DOMAIN=esm-<env-name>.pathfinder.bcgov,APP_IMAGE_NAMESPACE=esm-<env-name>,APP_DEPLOYMENT_TAG=<env-name> | oc create -f -
```

For example:

```
oc process -f esm-environment-template.json -v NAME=esm-prod,APPLICATION_DOMAIN=esm-prod.pathfinder.bcgov,APP_IMAGE_NAMESPACE=esm-prod,APP_DEPLOYMENT_TAG=prod,DOCUMENT_VOLUME_CAPACITY=200Gi,DATABASE_VOLUME_CAPACITY=10Gi
```
  

   
