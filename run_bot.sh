#!/bin/bash

cd $(dirname $0)

while read line; do export "$line";
done < .env

/home/v21/.nvm/v0.10.38/bin/node main.js