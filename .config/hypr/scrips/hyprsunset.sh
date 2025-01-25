#!/bin/bash

case "$1" in
    "on")
        pkill hyprsunset
        exec hyprsunset
        ;;
    "off")
        pkill hyprsunset
        ;;
    *)
        echo "Usage: $0 {on|off}"
        exit 1
        ;;
esac

