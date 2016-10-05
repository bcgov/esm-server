#!/bin/bash

rm -rf /tmp/mongodump && mkdir /tmp/mongodump
docker run -it --rm --link $3:mongo -v /tmp/mongodump:/tmp mongo bash -c 'mongodump -v --host $MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT --db '$1' --out=/tmp'
tar -cvf $2 -C /tmp/mongodump *
rm -rf /tmp/mongodump
