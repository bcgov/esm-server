source ./lib/extended-oc.sh

checkOpenshiftSession

TOOLS_PROJECT=l8g1vt-tools
TARGET_PROJECT=l8g1vt-dev

checkProjectExists ${TOOLS_PROJECT}
checkProjectExists ${TARGET_PROJECT}

oc project ${TOOLS_PROJECT}
_cli_output=$(oc delete all -l stir-admin-1-nodejs-server -n ${TOOLS_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"

_cli_output=$(oc delete all --selector app=stir-admin-1-nodejs-server -n ${TOOLS_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete build stir-admin-1-nodejs-server -n ${TOOLS_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete buildconfig stir-admin-1-nodejs-server -n ${TOOLS_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete imagestream stir-admin-1-nodejs-server -n ${TOOLS_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"


oc project ${TARGET_PROJECT}
_cli_output=$(oc delete service stir-admin-server -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete route stir-admin-server -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete deploymentConfig stir-admin-server -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete configmap stir-admin-server -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete secret stir-admin-server -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete all -l stir-admin-server -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"

_cli_output=$(oc delete imagestream stir-admin-mongodb -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete service stir-admin-mongodb -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete route stir-admin-mongodb -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete deploymentConfig stir-admin-mongodb -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete configmap stir-admin-mongodb -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete secret stir-admin-mongodb -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete all -l stir-admin-mongodb -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"

_cli_output=$(oc delete pvc stir-admin-mongodb-data -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"


oc project ${TARGET_PROJECT}
_cli_output=$(oc delete imagestream stir-admin-minio -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete service stir-admin-minio -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete route stir-admin-minio -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete deploymentConfig stir-admin-minio -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete configmap stir-admin-minio -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete secret stir-admin-minio -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete all -l stir-admin-minio -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"

_cli_output=$(oc delete pvc stir-admin-minio -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"


oc project ${TOOLS_PROJECT}
_cli_output=$(oc delete all -l stir-admin-2-nginx -n ${TOOLS_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete all --selector app=stir-admin-2-nginx -n ${TOOLS_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete build stir-admin-2-nginx -n ${TOOLS_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete buildconfig stir-admin-2-nginx -n ${TOOLS_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete imagestream stir-admin-2-nginx -n ${TOOLS_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"


oc project ${TARGET_PROJECT}
_cli_output=$(oc delete service stir-admin-nginx -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete service mongodb -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete route stir-admin-nginx -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete deploymentConfig stir-admin-nginx -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete deploymentConfig mongodb -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete configmap stir-admin-nginx -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete secret stir-admin-nginx -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"
_cli_output=$(oc delete all -l stir-admin-nginx -n ${TARGET_PROJECT} 2>&1) 
outputRelevantOnly "${_cli_output}"

