source ./lib/extended-oc.sh

PARAMS_FOLDER=./params/VENV/
PARAMS_FILE=admin-0.config
ARGS_FILE=${PARAMS_FOLDER}${PARAMS_FILE}

# ====================================================================================
# Order dependent
# No spaces
# Set these in the above config file
TOOLS_PROJECT=the-tools-project
TARGET_PROJECT=the-target-destination-environment-project
ADMIN_SERVER_NODEJS_BUILD=the-build-tied-to-the-github-code-branch-for-the-admin-server
ADMIN_SERVER_NODEJS_DEPLOYMENT=the-deployment-of-the-admin-server-website
ADMIN_SERVER_MONGODB_DEPLOYMENT=the-database-for-the-admin-server
ADMIN_SERVER_MINIO_DEPLOYMENT=the-minio-filesystem-proxy-for-the-admin-server-filesystem
ADMIN_SERVER_NGINX_BUILD=the-build-of-the-network-routing-proxy-for-the-admin-server
ADMIN_SERVER_NGINX_DEPLOYMENT=the-deployment-of-the-network-routing-proxy-for-the-admin-server
ADMIN_SERVER_BC_TEMPLATE=the-admin-server-build-config-json-template
ADMIN_SERVER_BC_PARAMS=the-admin-server-build-config-settings
ADMIN_SERVER_DC_TEMPLATE=the-admin-server-deployment-config-json-template
ADMIN_SERVER_DC_PARAMS=the-admin-server-deployment-config-settings
NGINX_BC_TEMPLATE=the-nginx-build-config-json-template
NGINX_BC_PARAMS=the-nginx-build-config-settings
NGINX_DC_TEMPLATE=the-nginx-deployment-config-json-template
NGINX_DC_PARAMS=the-nginx-deployment-config-settings
# ====================================================================================


runDeployAll() {
    checkOpenshiftSession
    checkFileExists "config" ${ARGS_FILE}

    local tools_project target_project admin_server_nodejs_build admin_server_nodejs_deployment \
        admin_server_mongodb_deployment admin_server_minio_deployment admin_server_nginx_build \
        admin_server_nginx_deployment admin_server_bc_template admin_server_bc_params admin_server_dc_template \
        admin_server_dc_params nginx_bc_template nginx_bc_params nginx_dc_template nginx_dc_params
    extractArgument tools_project "runDeployAll" "TOOLS_PROJECT" "${1}"
    extractArgument target_project "runDeployAll" "TARGET_PROJECT" "${2}"
    extractArgument admin_server_nodejs_build "runDeployAll" "ADMIN_SERVER_NODEJS_BUILD" "${3}"
    extractArgument admin_server_nodejs_deployment "runDeployAll" "ADMIN_SERVER_NODEJS_DEPLOYMENT" "${4}"
    extractArgument admin_server_mongodb_deployment "runDeployAll" "ADMIN_SERVER_MONGODB_DEPLOYMENT" "${5}"
    extractArgument admin_server_minio_deployment "runDeployAll" "ADMIN_SERVER_MINIO_DEPLOYMENT" "${6}"
    extractArgument admin_server_nginx_build "runDeployAll" "ADMIN_SERVER_NGINX_BUILD" "${7}"
    extractArgument admin_server_nginx_deployment "runDeployAll" "ADMIN_SERVER_NGINX_DEPLOYMENT" "${8}"
    extractArgument admin_server_bc_template "runDeployAll" "ADMIN_SERVER_BC_TEMPLATE" "${9}"
    extractArgument admin_server_bc_params "runDeployAll" "ADMIN_SERVER_BC_PARAMS" "${10}"
    extractArgument admin_server_dc_template "runDeployAll" "ADMIN_SERVER_DC_TEMPLATE" "${11}"
    extractArgument admin_server_dc_params "runDeployAll" "ADMIN_SERVER_DC_PARAMS" "${12}"
    extractArgument nginx_bc_template "runDeployAll" "NGINX_BC_TEMPLATE" "${13}"
    extractArgument nginx_bc_params "runDeployAll" "NGINX_BC_PARAMS" "${14}"
    extractArgument nginx_dc_template "runDeployAll" "NGINX_DC_TEMPLATE" "${15}"
    extractArgument nginx_dc_params "runDeployAll" "NGINX_DC_PARAMS" "${16}"

    checkProjectExists ${tools_project}
    checkProjectExists ${target_project}

    checkFileExists "template", ${admin_server_bc_template}
    checkFileExists "template", ${admin_server_dc_template}
    checkFileExists "template", ${nginx_bc_template}
    checkFileExists "template", ${nginx_dc_template}

    local admin_server_bc_params_path=${PARAMS_FOLDER}${admin_server_bc_params}
    local admin_server_dc_params_path=${PARAMS_FOLDER}${admin_server_dc_params}
    local nginx_bc_params_path=${PARAMS_FOLDER}${nginx_bc_params}
    local nginx_dc_params_path=${PARAMS_FOLDER}${nginx_dc_params}

    checkFileExists "parameters", ${admin_server_bc_params_path}
    checkFileExists "parameters", ${admin_server_dc_params_path}
    checkFileExists "parameters", ${nginx_bc_params_path}
    checkFileExists "parameters", ${nginx_dc_params_path}

    echo -e \\n"deploy-all: Starting deployment."\\n

    local original_namespace=$(oc project --short=true)

    oc project ${tools_project}
    oc -n ${tools_project} process -f ${admin_server_bc_template} --param-file=${admin_server_bc_params_path} | oc create -f -
    oc project ${target_project}
    oc -n ${target_project} process -f ${admin_server_dc_template} --param-file=${admin_server_dc_params_path} | oc create -f -
    oc project ${tools_project}
    oc -n ${tools_project} process -f ${nginx_bc_template} --param-file=${nginx_bc_params_path} | oc create -f -
    oc project ${target_project}
    oc -n ${target_project} process -f ${nginx_dc_template} --param-file=${nginx_dc_params_path} | oc create -f -

    oc project ${original_namespace}

    echo -e \\n"deploy-all: Completed deployment."\\n
}

runDeployAll $(<${ARGS_FILE})
