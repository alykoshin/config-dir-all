#!/usr/bin/env bash

echo -e '\nSetting NODE_CONFIG variable (1)'
NODE_CONFIG='{"test":"test"}' node app

echo -e '\nSetting NODE_CONFIG variable (2)'
NODE_CONFIG="{\"test\":\"test\"}" node app

echo -e '\nPassing NODE_CONFIG argument (1)'
node app --NODE_CONFIG='{"test":"test1=test2"}'

echo -e '\nPassing NODE_CONFIG argument (2)'
node app --NODE_CONFIG="{\"test\":\"test1=test2\"}"

echo -e '\nSetting NODE_ENV variable (1)'
NODE_ENV=production node app

echo -e '\nSetting NODE_ENV variable (2)'
NODE_ENV=development node app

