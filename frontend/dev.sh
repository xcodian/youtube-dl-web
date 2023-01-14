#!/bin/bash

# Run the frontend files with react's watcher

if [[ ! -f $(pwd)/package.json ]]
then 
    echo "error: no package.json in current working directory!"
    exit 1
fi

if [[ -d ./build ]]
then
    echo "warn: build directory already exists!"
fi

docker run -it --rm -v $(pwd):/mnt -w /mnt -u node --net host node:17 sh -c "yarn install; yarn start"

# starts on host network port 3000