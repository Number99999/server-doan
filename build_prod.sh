#!/bin/bash
date_now=$(date +%d%m%Y'_'%H%M%S)
echo $date_now
docker build -t rest:$date_now --platform linux/amd64 .
docker tag rest:$date_now registry.gitlab.com/yunero/xninja:rest-$date_now
docker login registry.gitlab.com
docker push registry.gitlab.com/yunero/xninja:rest-$date_now