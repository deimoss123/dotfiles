#!/bin/bash

case "$1" in
    "on")
        pkill wlsunset
        systemd-run --user wlsunset
        ;;
    "off")
        pkill wlsunset
        ;;
    *)
        echo "Usage: $0 {on|off}"
        exit 1
        ;;
esac

