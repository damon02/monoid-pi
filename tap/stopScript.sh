#!/bin/bash

ps -eo pid | grep "sendData"

pkill -f "startScript.sh"
pkill -f "tsharkScript"
pkill -f "sendData"
pkill -f "inotifywait -m"
pkill -f "tshark -i"
