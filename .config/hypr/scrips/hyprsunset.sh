#!/bin/bash

case "$1" in
    "on")
        # Kill any existing instances first
        pkill hyprsunset
        # Start hyprsunset
        hyprsunset &
        ;;
    "off")
        # Kill hyprsunset using pkill
        pkill hyprsunset
        ;;
    *)
        echo "Usage: $0 {on|off}"
        exit 1
        ;;
esac

