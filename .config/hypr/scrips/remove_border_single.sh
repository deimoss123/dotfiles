#!/bin/sh

function handle {
  # echo ${1:0:10}

  if [ ${1:0:10} == "closewindo" ] || [ ${1:0:10} == "openwindow" ] || [ ${1:0:10} == "workspace>" ]; then
    # echo "aizvērās/atvērās"
    COUNT=$(hyprctl activeworkspace -j | jq -r ".windows")

    if [ $COUNT == 1 ]; then
      # hyprctl keyword general:border_size 0
      hyprctl keyword general:col.active_border "rgba(7aa2f700) rgba(c0caf500) 45deg"
      # hyprctl keyword general:gaps_out 0
      # echo "viens"
    else
      # hyprctl keyword general:border_size 1
      hyprctl keyword general:col.active_border "rgba(7aa2f7ee) rgba(c0caf5ee) 45deg"
      # hyprctl keyword general:gaps_out 6
      # echo "vairāki"
    fi
    # if [[ ${1:12:4} == "DP-1" ]]; then
    #   hyprctl keyword general:gaps_out 20
    # else
    #   hyprctl keyword general:gaps_out 30
    # fi
  fi
}

socat - "UNIX-CONNECT:/tmp/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock" | while read -r line; do handle "$line"; done
