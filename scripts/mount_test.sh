#!/bin/sh
echo "Starting file write test."
echo "Checking: $MOUNT_POINT_CHECK for $MOUNT_POINT_TIMEOUT seconds."

TOUCHFILE=${MOUNT_POINT_CHECK}/.mount_test_$(date +%Y-%m-%d--%H-%M-%S).$RANDOM.$$
touch ${TOUCHFILE} &>/dev/null &
TOUCHPID=$!
for (( i=1 ; i<$MOUNT_POINT_TIMEOUT ; i++ )) ; do
	if ps -p $TOUCHPID > /dev/null ; then
		sleep 1
	else
		break
	fi
done
if ps -p $TOUCHPID > /dev/null ; then
	$(kill -s SIGTERM $TOUCHPID &>/dev/null)
	echo "Could not write in ${MOUNT_POINT_CHECK} in $MOUNT_POINT_TIMEOUT sec."
	exit 1
else
	if [ ! -f ${TOUCHFILE} ]; then
		echo "CRIT: ${TOUCHFILE} is not writable."
		exit 1
	else
		rm ${TOUCHFILE} &>/dev/null
		echo "File test write success"
		exit 0
	fi
fi
