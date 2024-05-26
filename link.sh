#!/bin/sh

if [ "$1" == "laptop" ]; then
	stow .
	ln -sf ~/dotfiles/.config/hypr/hyprland_laptop.conf ~/.config/hypr/hyprland.conf
	ln -sf ~/dotfiles/.config/hypr/hypridle_laptop.conf ~/.config/hypr/hypridle.conf
	ln -sf ~/dotfiles/.config/hypr/hyprpaper_laptop.conf ~/.config/hypr/hyprpaper.conf
	ln -sf ~/dotfiles/.config/hypr/hyprlock_laptop.conf ~/.config/hypr/hyprlock.conf

	ln -sf ~/dotfiles/.config/waybar/style_laptop.css ~/.config/waybar/style.css
	ln -sf ~/dotfiles/.config/waybar/config_laptop.jsonc ~/.config/waybar/config.jsonc

elif [ "$1" == "desktop" ]; then
	stow .
	ln -sf ~/dotfiles/.config/hypr/hyprland_desktop.conf ~/.config/hypr/hyprland.conf
	ln -sf ~/dotfiles/.config/hypr/hyprpaper_desktop.conf ~/.config/hypr/hyprpaper.conf

	ln -sf ~/dotfiles/.config/waybar/style_desktop.css ~/.config/waybar/style.css
	ln -sf ~/dotfiles/.config/waybar/config_desktop.jsonc ~/.config/waybar/config.jsonc

else
	echo "Ievadi ko tu gribi linkot - laptop, desktop, wsl"
fi
