#!/bin/sh

apk add --update py-pip
pip install awscli

eval `aws ecr get-login --no-include-email --region ap-northeast-1` || exit 1
