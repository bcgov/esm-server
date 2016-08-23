h1. How to deploy on OpenShift

- Create an OpenShift project for each "environment" (e.g. DEV, TEST, PROD, DEMO, TRAIN)
- Use the JSON files in this directory  and `oc` tool to create the necessary resources within each project.
  
  ```oc create -f <file>.json```  
