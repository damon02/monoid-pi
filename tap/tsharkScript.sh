#!/bin/bash

IP_ADDR=$(ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1)

FILTER_STRING="host not $IP_ADDR"

echo $FILTER_STRING

tshark -i eth0  -c 100 -w outputFile
