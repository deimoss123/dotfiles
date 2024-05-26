#!/bin/bash

discharging=`acpi | grep Discharging | wc -l` # will be 1 if discharging and 0 if chargin

percentage_remaining=`acpi | grep -o [0-9]*% | sed s/%//g`

battery_icon=""
if [ $percentage_remaining -lt 20 ]; then
    battery_icon=""
elif [ $percentage_remaining -lt 40 ]; then
    battery_icon=""
elif [ $percentage_remaining -lt 60 ]; then
    battery_icon=""
elif [ $percentage_remaining -lt 80 ]; then
    battery_icon=""
fi

if [ $discharging -eq 0 ]; then
    battery_icon="󱐋 ${battery_icon}"
fi



echo "${battery_icon}  ${percentage_remaining}%"

# echo "Remaining ${percentage_remaining}"
# if [ $percentage_remaining -lt $warn_on ]; then
#     echo "Warning, battery is discharging and at ${percentage_remaining}%!"
# elif [ $debug -eq 1 ]; then
#     echo "Battery is discharging, but at ${percentage_remaining}% so it's grand!"
# fi
