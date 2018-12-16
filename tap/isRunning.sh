#!/bin/bash

# Check if gedit is running
# -x flag only match processes whose name (or command line if -f is
# specified) exactly match the pattern. 

if pgrep -x "startScript.sh" > /dev/null
then
    echo true
else
    echo false
fi