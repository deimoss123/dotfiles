#!/bin/bash

date_of_screenshot="$(date +'%Y-%m-%d_%H-%M-%S')-$(date +'%N' | cut -b1-3)"
screenshot_file="$HOME/Pictures/Screenshots/$date_of_screenshot.png"

/usr/local/bin/flameshot screen --raw | tee "$screenshot_file" | wl-copy

# echo "Screenshot saved to: $screenshot_file and copied to clipboard"
dunstify "Screenshot taken!" "Saved as: $date_of_screenshot.png"
