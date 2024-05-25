#!/bin/sh

if [ "$1" == "laptop" ]; then
	stow .

elif [ "$1" == "desktop" ]; then
	stow .
	ln -sf ~/dotfiles/.config/hypr/hyprland_desktop.conf ~/.config/hypr/hyprland.conf
	ln -sf ~/dotfiles/.config/waybar/style_desktop.css ~/.config/waybar/style.css
	ln -sf ~/dotfiles/.config/waybar/config_desktop.jsonc ~/.config/waybar/config.jsonc
	# ln -s ~/dotfiles/.config/hypr/hyprland_desktop.conf ~/.config/hypr/hyprland.conf

else
	echo "Ievadi ko tu gribi linkot - laptop, desktop, wsl"
fi
