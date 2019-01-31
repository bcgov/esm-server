source ./lib/extended-oc.sh

checkOpenshiftSession

TOOLS_PROJECT=l8g1vt-tools
TARGET_PROJECT=l8g1vt-dev
PARAMS_FOLDER=./params/STIR/

checkProjectExists ${TOOLS_PROJECT}
checkProjectExists ${TARGET_PROJECT}

ADMIN_SERVER_BC_TEMPLATE=admin-1-admin-server-on-tools.json
ADMIN_SERVER_DC_TEMPLATE=admin-2-admin-server-on-env.json
NGINX_BC_TEMPLATE=admin-3-nginx-on-tools.json
NGINX_DC_TEMPLATE=admin-4-nginx-on-env.json

checkFileExists "template", ${ADMIN_SERVER_BC_TEMPLATE}
checkFileExists "template", ${ADMIN_SERVER_DC_TEMPLATE}
checkFileExists "template", ${NGINX_BC_TEMPLATE}
checkFileExists "template", ${NGINX_DC_TEMPLATE}

ADMIN_SERVER_BC_PARAMS=${PARAMS_FOLDER}admin-1-admin-server-on-tools.params
ADMIN_SERVER_DC_PARAMS=${PARAMS_FOLDER}admin-2-admin-server-on-env.dev.params
NGINX_BC_PARAMS=${PARAMS_FOLDER}admin-3-nginx-on-tools.params
NGINX_DC_PARAMS=${PARAMS_FOLDER}admin-4-nginx-on-env.dev.params

checkFileExists "parameters", ${ADMIN_SERVER_BC_PARAMS}
checkFileExists "parameters", ${ADMIN_SERVER_DC_PARAMS}
checkFileExists "parameters", ${NGINX_BC_PARAMS}
checkFileExists "parameters", ${NGINX_DC_PARAMS}

oc project ${TOOLS_PROJECT}
oc process -f ${ADMIN_SERVER_BC_TEMPLATE} --param-file=${ADMIN_SERVER_BC_PARAMS} -n ${TOOLS_PROJECT} | oc create -f -
oc project ${TARGET_PROJECT}
oc process -f ${ADMIN_SERVER_DC_TEMPLATE} --param-file=${ADMIN_SERVER_DC_PARAMS} -n ${TARGET_PROJECT} | oc create -f -
oc project ${TOOLS_PROJECT}
oc process -f ${NGINX_BC_TEMPLATE} --param-file=${NGINX_BC_PARAMS} -n ${TOOLS_PROJECT} | oc create -f -
oc project ${TARGET_PROJECT}
oc process -f ${NGINX_DC_TEMPLATE} --param-file=${NGINX_DC_PARAMS} -n ${TARGET_PROJECT} | oc create -f -
