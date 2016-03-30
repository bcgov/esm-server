#!/bin/bash

environment_name=""
image_name=""
environment_variables=""

if [ "$#" -lt 2 ]; then
    echo "Please specify an environment name as the first argument and an image to deploy as the second command-line argument."
    exit -1
else
    environment_name=$1
    image_name=$2

    app_variant=$(echo $environment_name | cut -f1 -d-)
    promotion_level=$(echo $environment_name| cut -f2 -d-)

    echo "Starting deployment for environment $environment_name with image $image_name ..."
    echo "Variant is '$app_variant' and promotion level is '$promotion_level' ..."

    if [ ${app_variant} = "mem" ]; then
        environment_variables="-e MEM=true -e SEED_MEM=true"
    fi
fi

proxy="false"
proxyParams=""
proxyPort=""
virtualHost=""

if [ "$#" -ge 3 ]; then
    if [ $3 = "PROXY" ]; then
        if [ "$#" -lt 5 ]; then
            echo "PROXY must be followed by a port and a virtual host."
            exit -1
        else
            proxy="true"
            proxyPort="$4"
            virtualHost="$5"
            proxyParams="-e VIRTUAL_PORT=$proxyPort -e VIRTUAL_HOST=$virtualHost"
        fi
    fi
fi

# pull the referenced image from our private registry
docker pull $image_name

# find the id of the prior container, if it exists
priorContainer=`docker ps -a --filter name=app-$environment_name | awk '{if(NR>1)print $1;}'`

# stop the previously deployed instance of the app
if [ -n "$priorContainer" ] ; then
    priorContainerRunning=`docker ps -a --filter name=app-$environment_name -f status=running | awk '{if(NR>1)print $1;}'`
        if [ -n "$priorContainerRunning" ]; then
                echo "Stopping previously deployed container..."
                docker stop $priorContainer
        fi
    ts=`date +"%m-%d-%y_%s"`
    docker rename $priorContainer "$priorContainer-backup-$ts"
fi;

if  [ "$proxy" = "true" ]; then
    echo "Running with proxy."
    docker run -p $proxyPort:3000 -v /data/$environment_name/uploads:/uploads -d --restart=always --link webapp-proxy:webapp-proxy --link mongo-$environment_name:db_1 --name app-$environment_name  $proxyParams $environment_variables -l appname=$environment_name $image_name
else
    echo "Running without proxy."
    docker run -p $proxyPort:3000 -v /data/$environment_name/esm-uploads:/uploads -d --restart=always --link mongo-$environment_name:db_1 --name app-$environment_name -l appname=$environment_name $environment_variables $image_name
fi
