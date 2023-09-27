#!/bin/sh


#=====================================
# HOST_IP  controlled by jenkins env
# HOST_USER controlled by jenkins envs
# PORT controlled by jenkins envs
#=====================================

# Get current git commit number
LABEL=$(git log -1 --format=%h)

CONTAINER_NAME=genesislab-admin-backend
CONTAINER_CURRENT=rnssolutions/$CONTAINER_NAME:$LABEL
    docker stop $CONTAINER_NAME-$BRANCH_NAME
    docker rm -f $CONTAINER_NAME-$BRANCH_NAME
    docker run --restart=always -v /var/rns/genesislab-admin-backend/.env:/app/.env -v  /var/rns/genesislab-admin-backend/uploads:/app/uploads -d -p $PORT:4000 --name $CONTAINER_NAME-$BRANCH_NAME $CONTAINER_CURRENT
