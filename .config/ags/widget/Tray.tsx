import { Gdk, Gtk } from "astal/gtk4";
import { bind, Variable, timeout, Gio, GLib, AstalIO } from "astal";
import AstalTray from "gi://AstalTray";

// export default function () {
// 	const tray = AstalTray.get_default()
// 	let clickTimeout: AstalIO.Time;
// 	let clickCount = 0;

// 	return <box cssClasses={["tray container"]} halign={CENTER} valign={CENTER} expand vertical={true}>
// 		{bind(tray, "items").as(items => items.map(item => (
// 			<menubutton
// 				tooltipMarkup={bind(item, "tooltipMarkup")}
// 				usePopover={false} // do not change, will cause crash
// 				actionGroup={bind(item, "action-group").as(ag => ["dbusmenu", ag])}
// 				menuModel={bind(item, "menu-model")}
// 				direction={Gtk.ArrowType.RIGHT}
// 			>
// 				<icon gIcon={bind(item, "gicon")} />
// 			</menubutton>
// 		)))}
// 	</box>
// }

type TrayItem = ReturnType<ReturnType<typeof AstalTray.Tray.get_default>["get_item"]>;

function createMenu(menuModel: Gio.MenuModel, actionGroup: Gio.ActionGroup): Gtk.PopoverMenu {
	const menu: Gtk.PopoverMenu = Gtk.PopoverMenu.new_from_model(menuModel);
	menu.insert_action_group("dbusmenu", actionGroup);
	menu.set_css_classes(["menu"]);
	menu.has_arrow = false;
	return menu;
}

const SysTrayItem = (item: TrayItem) => {
	let menu: Gtk.PopoverMenu = createMenu(item.menu_model, item.action_group);
	let clickTimeout: AstalIO.Time;
	let clickCount = 0;

	const button = (
		<button
			cssClasses={["systray-item"]}
			halign={CENTER}
			valign={CENTER}
			tooltip_markup={bind(item, "tooltip_markup").as((t) => t)}
			use_underline={false}
			onButtonPressed={(self, event) => {
				if (event.get_button() === Gdk.BUTTON_PRIMARY) {
					clickCount++;
					if (clickCount === 1) {
						clickTimeout = timeout(400, () => {
							clickCount = 0;
						});
					} else if (clickCount === 2) {
						clickTimeout.cancel();
						clickCount = 0;
						item.activate(0, 0);
					}
				}
				if (event.get_button() === Gdk.BUTTON_SECONDARY) {
					menu.set_position(Gtk.PositionType.BOTTOM);
					menu.set_parent(self);
					menu.popup();
				}
			}}
		>
			<image gicon={bind(item, "gicon")} halign={CENTER} valign={CENTER} />
		</button>
	);

	item.connect("notify::menu-model", () => {
		const newMenu = createMenu(item.menu_model, item.action_group);
		menu.unparent();
		menu = newMenu;
	});

	item.connect("notify::action-group", () => {
		const newMenu = createMenu(item.menu_model, item.action_group);
		menu.unparent();
		menu = newMenu;
	});

	return button;
};

const setupTray = (box: Gtk.Box) => {
	const systemTray = AstalTray.Tray.get_default();
	const items = new Map<string, ReturnType<typeof SysTrayItem>>();

	const addItem = (id: string) => {
		const item = systemTray.get_item(id);
		if (item) {
			const trayItem = SysTrayItem(item);
			items.set(id, trayItem);
			box.append(trayItem);
			trayItem.show();
		}
	};

	const removeItem = (id: string) => {
		const trayItem = items.get(id);
		if (trayItem) {
			trayItem.unparent();
			items.delete(id);
		}
	};

	systemTray
		.get_items()
		.sort((a, b) => a.item_id.localeCompare(b.item_id))
		.forEach((item) => addItem(item.item_id));
	systemTray.connect("item_added", (_, id) => addItem(id));
	systemTray.connect("item_removed", (_, id) => removeItem(id));
};

export default () => <box cssClasses={["tray", "container"]} halign={CENTER} valign={CENTER} vexpand hexpand setup={setupTray} />;
