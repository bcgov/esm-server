#!/bin/bash

if [ "$#" -lt 1 ]; then
    echo "Please an image to deploy as the first command-line argument."
    exit -1
fi

proxy=false
proxyParams=""

if [ "$#" -eq 2]; then
    if [ $2 = "PROXY" ]; then
        if [ "$#" -lt 3]; then
            echo "PROXY must be followed by a virtual host."
            exit -1
        else
            proxy=true
            proxyParams="-e VIRTUAL_PORT=3000 -e VIRTUAL_HOST=$3"
        fi
    fi
fi

# pull the referenced image from our private registry
docker pull $1

# find the id of the prior container, if it exists
priorContainer=`docker ps -f label=appname=esm-server-ajax -f status=running | awk '{if(NR>1)print $1;}'`

# stop the previously deployed instance of the app
if [ -n "$priorContainer" ] ; then
    echo "Stopping previously deployed container..."
    docker stop $priorContainer
fi;

if  [ (proxy) ]; then
    echo "Running with proxy."
    docker run -p 3000:3000 -v /data/esm-uploads:/uploads -d --link mongo:db_1 --name esm-server-ajax  $proxyParams -l appname=esm-server-ajax $1
else
    echo "Running without proxy."
    docker run -p 3000:3000 -v /data/esm-uploads:/uploads -d --link mongo:db_1 --name esm-server-ajax -l appname=esm-server-ajax $1
fi
