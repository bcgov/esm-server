#!/bin/bash

git pull origin develop

npm install

bower --allow-root install

grunt buildprod

export NODE_ENV=production

forever stop server.js
forever start server.js


