#!/bin/bash

# check if .env exists
if [ ! -f .env ]; then
    echo "Missing .env file"
    echo "Run cp .env.schema .env"
    exit 1
fi

NODE_PATH=src react-scripts start
$SHELL