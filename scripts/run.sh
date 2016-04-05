#!/bin/bash
COUNTER=0
while [  $COUNTER -lt 60000 ]; do
  echo The counter is $COUNTER
  let COUNTER=COUNTER+1 
  MONGO_CONNECTION=mongodb://localhost:27017/mean-dev LIMIT=10 node dcv.js
done
