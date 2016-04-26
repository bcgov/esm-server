#!/bin/bash

npm install

COUNTER=0
while [  $COUNTER -lt 60000 ]; do
  echo Conversion loop count is $COUNTER
  let COUNTER=COUNTER+1 
  LIMIT=10 node dcv.js
  if [ $? -ne 0 ]; then
    echo "done."
    break
fi
done
