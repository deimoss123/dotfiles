import { Variable, GLib, bind, execAsync } from "astal";
import { Astal, Gtk, Gdk } from "astal/gtk4";
import Hyprland from "gi://AstalHyprland";
import Wp from "gi://AstalWp";
import Apps from "gi://AstalApps";
import SysTrayA from './Tray';

function WorkspaceChild({
  apps,
  clients,
  workspace,
}: {
  apps: Apps.Application[];
  clients: Hyprland.Client[];
  workspace: Hyprland.Workspace;
}) {
  const filteredClients = clients.filter(
    (c) => c.workspace.id === workspace.id,
  );

  const wsApps: Apps.Application[] = [];

  for (const c of filteredClients) {
    const foundApp = apps.find(
      (a) =>
        a.entry.toLowerCase() === `${c.initialClass.toLowerCase()}.desktop` ||
        a.wm_class?.toLowerCase() === c.initialClass.toLowerCase(),
    );

    if (foundApp) {
      wsApps.push(foundApp);
    }
  }

  return (
    <box hexpand vertical spacing={2}>
      <label css="padding: 4px 0" label={`${workspace.id}`} />
      {wsApps.length && (
        <box vertical>
          <box vertical css="padding: 0" spacing={4}>
            {wsApps.map((app) => (
              <icon css="font-size: 18px" icon={app.icon_name} />
            ))}
          </box>
        </box>
      )}
    </box>
  );
}

function Workspaces() {
  const hypr = Hyprland.get_default();

  const clients = bind(hypr, "clients");
  const workspaces = bind(hypr, "workspaces");

  const apps = bind(new Apps.Apps(), "list");

  const wsElements = Variable.derive(
    [workspaces, clients, apps],
    (wss, cl, a) =>
      wss
        .filter((ws) => !(ws.id >= -99 && ws.id <= -2)) // filter out special workspaces
        .sort((a, b) => a.id - b.id)
        .map((ws) => (
          <button
            className={bind(hypr, "focusedWorkspace").as(
              (fw) => `bar__ws_item ${ws === fw ? "focused" : "not_focused"}`,
            )}
            onClicked={() => ws.focus()}
          >
            <WorkspaceChild apps={a} clients={cl} workspace={ws} />
          </button>
        )),
  );

  return (
    <box spacing={12} vertical className="bar__item">
      {wsElements()}
    </box>
  );
}

function FocusedClient() {
  const hypr = Hyprland.get_default();
  const focused = bind(hypr, "focusedClient");

  return (
    <box className="bar__item" visible={focused.as(Boolean)}>
      {focused.as(
        (client) =>
          client && <label label={bind(client, "title").as(String)} />,
      )}
    </box>
  );
}

function Volume() {
  const speaker = Wp.get_default()?.audio.defaultSpeaker!;

  return (
    <button
      onClick={(_, { button }) => {
        if (button === 1) execAsync("pavucontrol");
        else if (button === 3)
          execAsync("pactl set-sink-mute @DEFAULT_SINK@ toggle");
      }}
      className="bar__item"
    >
      <box>
        <icon icon={bind(speaker, "volumeIcon")} />
        <label
          label={bind(speaker, "volume").as((v) => `${Math.round(v * 100)}%`)}
        ></label>
      </box>
    </button>
  );
}

function SysTray3() {
  const tray = Tray.get_default();

  return (
    <box vertical className="">
      {bind(tray, "items").as((items) =>
        items.map((item) => {
          const menu = item.get_menu_model();
          return (
            <button
              tooltipMarkup={bind(item, "tooltipMarkup")}
              onClickRelease={(self, event) => {
                if (event.button === 1) {
                } else if (event.button === 3) {
                }
              }}
            >
              <icon css="background-color: red;" gicon={bind(item, "gicon")} />
            </button>
          );
        }),
      )}
    </box>
  );
}

function SysTray2() {
  const tray = Tray.get_default();

  return (
    <box className="SysTray">
      {bind(tray, "items").as((items) =>
        items.map((item) => (
          <menubutton
            tooltipMarkup={bind(item, "tooltipMarkup")}
            usePopover={false}
            actionGroup={bind(item, "action-group").as((ag) => [
              "dbusmenu",
              ag,
            ])}
            menuModel={bind(item, "menu-model")}
          >
            <icon gicon={bind(item, "gicon")} />
          </menubutton>
        )),
      )}
    </box>
  );
}

function SysTray() {
  const tray = Tray.get_default();

  return (
    <box spacing={1} className="bar__item">
      {bind(tray, "items").as((items) =>
        items.map((item) => {
          const menu = createMenu(item.menu_model, item.action_group) as Gtk.PopoverMenu;
          return (
            <button
              className="bar__tray-item"
              tooltipMarkup={bind(item, "tooltipMarkup")}
              onDestroy={() => menu.destroy()}
              onClickRelease={(self, { button }) => {
                if (button === 1) {
                  item.secondary_activate(1, 1);
                } else if (button === 3) {
                  menu.popup();
                  // menu?.popup_at_widget(
                  //   self,
                  //   Gdk.Gravity.SOUTH,
                  //   Gdk.Gravity.NORTH,
                  //   null,
                  // );
                }
              }}
            >
              <icon css="font-size: 18px" gIcon={bind(item, "gicon")} />
            </button>
          );
        }),
      )}
    </box>
  );
}

function Time({ format = "%d.%m.%Y  %H:%M" }) {
  const time = Variable({
    day: "",
    month: "",
    year: "",
    hour: "",
    minute: "",
  }).poll(1000, () => {
    const t = GLib.DateTime.new_now_local();
    return {
      day: t.format("%d")!.replaceAll("0", "O"),
      month: t.format("%m")!.replaceAll("0", "O"),
      year: t.format("%y")!.replaceAll("0", "O"),
      hour: t.format("%H")!.replaceAll("0", "O"),
      minute: t.format("%M")!.replaceAll("0", "O"),
    };
  });

  return (
    <box
      css="padding: 0 4px"
      className="bar__item"
      onDestroy={() => time.drop()}
      vertical
    >
      {bind(time).as(({ day, month, year, hour, minute }) => (
        <box vexpand vertical>
          <label css="font-weight: 400" label={day} />
          <label css="font-weight: 400" label={month} />
          <label css="font-weight: 400" label={year} />

          <label css="font-weight: 700; margin-top: 12px" label={hour} />
          <label css="font-weight: 700" label={minute} />
        </box>
      ))}
    </box>
  );
}

export default function Bar(monitor: Gdk.Monitor) {
  const { BOTTOM, LEFT, RIGHT, TOP } = Astal.WindowAnchor;

  return (
    <window
      className="Bar"
      gdkmonitor={monitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | RIGHT | BOTTOM}
      widthRequest={32}
    >
      <centerbox vertical>
        <box vexpand valign={Gtk.Align.START}>
          <Workspaces />
        </box>
        <box></box>
        <box vertical vexpand valign={Gtk.Align.END}>
          <SysTrayA />
          <Time />
        </box>
      </centerbox>
    </window>
  );
}
