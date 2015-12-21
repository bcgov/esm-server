#!/bin/bash

git pull origin develop

grunt buildprod

export NODE_ENV=production

forever stop server.js
forever start server.js


