checkJqPresent(){
    if jq --version | grep -q '^sh: jq: command not found'; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # Mac OSX
            brew install jq
        elif [[ "$OSTYPE" == "cygwin" ]]; then
            # POSIX compatibility layer and Linux environment emulation for Windows
            choco install jq -y
        #elif [[ "$OSTYPE" == "linux-gnu" ]]; then
            # ...
        #elif [[ "$OSTYPE" == "msys" ]]; then
             # Lightweight shell and GNU utilities compiled for Windows (part of MinGW)
        #elif [[ "$OSTYPE" == "win32" ]]; then
            # I'm not sure this can happen.
        #elif [[ "$OSTYPE" == "freebsd"* ]]; then
            # ...
        else
            echo -e \\n"Could not detect jq on system.  Are you sure it has been installed?\\nMac OSX Brew: brew install jq\\nWindows Chocolatey: choco install jq\\nDebian: sudo apt-get install jq\\nFedora: sudo dnf install jq\\n"\\n
            exit 1
        fi
    fi
}

checkOpenshiftSession(){
    local output=$(oc whoami 2>&1)
    if echo "$output" | grep 'You must be logged in to the server'; then
        echo -e \\n"Not connected to OpenShift.\nIn your OpenShift Web Console, upper right corner, click on the down arrow next to user name. From the menu, select 'Copy Login Command'.\nPaste the buffer contents into this terminal and hit [ENTER]."\\n
        exit 1
    fi
}

checkDeploymentIsUp(){
    local _application=$1
    local _project=$2
    local _iterations=$3

    if [ -z "${_iterations}" ]; then
        _iterations=6   # 2^6 factorial = 127 seconds
    fi

    local _maxWaitSeconds=$(((1<<_iterations+1)-1))
    echo "Detecting pods for project \"${_project}\" deployment \"${_application}\".  Waiting for up to ${_maxWaitSeconds} seconds..."

    for ((bit=0;bit<_iterations+1;bit++)) do
        local _delay=$((1<<bit))
        sleep $_delay
        local _pods=$(oc get pods --selector app=${_application} -n ${_project} -o name 2>&1)
        if ! [ -z "${_pods}" ]; then
            echo "Detected pods for project \"${_project}\" deployment \"${_application}\".  Pods: ${_pods}"
            return 1
        fi
    done
    echo -e \\n"Tried to detect running pods for project \"${_project}\" deployment \"${_application}\" and failed."\\n
}

checkNginxExists(){
    local _proxy=$1

    if oc describe dc/${_proxy} | grep -q '^Error from server'; then
        echo -e \\n"Could not find nginx deployment '${_proxy}'.  Are you sure it exists?"\\n
        exit 1
    fi
}

checkProjectExists(){
    local _project=$1

    if oc describe project ${_project} | grep -q '^Error from server'; then
        echo -e \\n"Could not find project '${_project}'.  Are you sure it exists?"\\n
        exit 1
    fi
}

checkFileExists(){
    local _file_kind=$1
    local _file=$2

    if ! test -f ${_file}; then
        echo -e \\n"Missing ${_file_kind} file '${_file}'!"\\n
        exit 1
    fi
}

outputRelevantOnly(){
    local _cli_output=$1
    if ! echo "${_cli_output}" | grep -q -e '^Error from server' -e '^No resources found'; then
        echo -e "${_cli_output}"
    fi
}

cleanProject(){
    local _application_name=$1
    local _namespace=$2

    local _cli_output
    _cli_output=$(oc delete all -l ${_application_name} -n ${_namespace} 2>&1)
    outputRelevantOnly "${_cli_output}"
    _cli_output=$(oc delete build ${_application_name} -n ${_namespace} 2>&1)
    outputRelevantOnly "${_cli_output}"
    _cli_output=$(oc delete buildconfig ${_application_name} -n ${_namespace} 2>&1)
    outputRelevantOnly "${_cli_output}"
    _cli_output=$(oc delete imagestream ${_application_name} -n ${_namespace} 2>&1)
    outputRelevantOnly "${_cli_output}"
    _cli_output=$(oc delete service ${_application_name} -n ${_namespace} 2>&1)
    outputRelevantOnly "${_cli_output}"
    _cli_output=$(oc delete route ${_application_name} -n ${_namespace} 2>&1)
    outputRelevantOnly "${_cli_output}"
    _cli_output=$(oc delete deploymentConfig ${_application_name} -n ${_namespace} 2>&1)
    outputRelevantOnly "${_cli_output}"
    _cli_output=$(oc delete configmap ${_application_name} -n ${_namespace} 2>&1)
    outputRelevantOnly "${_cli_output}"
    _cli_output=$(oc delete all -l ${_application_name} -n ${_namespace} 2>&1)
    outputRelevantOnly "${_cli_output}"
}
