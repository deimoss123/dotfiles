import { Variable, GLib, bind, execAsync } from "astal";
import { Astal, Gtk, Gdk } from "astal/gtk3";
import Hyprland from "gi://AstalHyprland";
import Wp from "gi://AstalWp";
import Tray from "gi://AstalTray";
import Apps from "gi://AstalApps";

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
    <box spacing={2}>
      <label css="padding: 0 4px" label={`${workspace.id}`} />
      {wsApps.length && (
        <box>
          <label css="color: #8D7F71" label="~" />
          <box css="padding: 0 4px" spacing={1}>
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
    <box spacing={12} className="bar__item">
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

function SysTray() {
    const tray = Tray.get_default()

    return <box className="SysTray">
        {bind(tray, "items").as(items => items.map(item => (
            <menubutton
                tooltipMarkup={bind(item, "tooltipMarkup")}
                usePopover={false}
                actionGroup={bind(item, "action-group").as(ag => ["dbusmenu", ag])}
                menuModel={bind(item, "menu-model")}>
                <icon gicon={bind(item, "gicon")} />
            </menubutton>
        )))}
    </box>
}

function SysTray2() {
  const tray = Tray.get_default();

  return (
    <box spacing={1} className="bar__item">
      {bind(tray, "items").as((items) =>
        items.map((item) => {
          const menu = item.get_menu_model();
          return (
            <button
              className="bar__tray-item"
              tooltipMarkup={bind(item, "tooltipMarkup")}
              onDestroy={() => menu?.destroy()}
              onClickRelease={(self, { button }) => {
                if (button === 1) {
                  item.secondary_activate(1, 1);
                } else if (button === 3) {
                  menu?.popup_at_widget(
                    self,
                    Gdk.Gravity.SOUTH,
                    Gdk.Gravity.NORTH,
                    null,
                  );
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
  const time = Variable<string>("").poll(
    1000,
    () => GLib.DateTime.new_now_local().format(format)!,
  );

  return (
    <label className="bar__item" onDestroy={() => time.drop()} label={time()} />
  );
}

export default function Bar(monitor: Gdk.Monitor) {
  const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      className="Bar"
      gdkmonitor={monitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={BOTTOM | LEFT | RIGHT}
    >
      <centerbox>
        <box hexpand halign={Gtk.Align.START}>
          <Workspaces />
        </box>
        <box>
          <FocusedClient />
        </box>
        <box hexpand halign={Gtk.Align.END}>
          <Volume />
          <SysTray />
          <Time />
        </box>
      </centerbox>
    </window>
  );
}

