#!/bin/bash

export NODE_ENV=production
forever stop server.js
forever start server.js


