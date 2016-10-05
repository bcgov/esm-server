#!/bin/bash

git pull origin develop

npm install

bower --allow-root install

grunt buildprod

NODE_ENV=production node --debug server.js



