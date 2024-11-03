const hyprland = await Service.import("hyprland");
const audio = await Service.import("audio");
const battery = await Service.import("battery");
const systemtray = await Service.import("systemtray");
const applications = await Service.import("applications");

const date = Variable("", {
  poll: [1000, 'date "+%d.%m.%Y  %H:%M"'],
});

const apps = [...applications.list];

function wsChildren(clients, workspace) {
  const wsApps = [];
  const filteredClients = clients.filter((c) => c.workspace.id === workspace);

  for (const c of filteredClients) {
    const foundApp = apps.find(
      (a) =>
        a.desktop === `${c.initialClass}.desktop` ||
        a.wm_class === c.initialClass.toLowerCase(),
    );

    if (foundApp) {
      wsApps.push(foundApp);
    }
  }

  /** @type {(Label | Box)[]} */
  const children = [
    Widget.Label({
      label: `${workspace}`,
      class_name: "ws-label",
      justification: "center",
      widthRequest: wsApps.length ? 0 : 24,
    }),
  ];

  if (wsApps.length) {
    children.push(
      Widget.Label({
        label: `~`,
        class_name: "ws-label-seperator",
        xalign: 1,
      }),
      Widget.Box({
        class_name: "ws-icon-box",
        spacing: 4,
        children: wsApps.map((app) =>
          Widget.Icon({
            icon: app.icon_name || "",
            size: 16,
          }),
        ),
      }),
    );
  }

  return children;
}

function Workspaces() {
  const workspaces = Utils.merge(
    [
      hyprland.bind("workspaces"),
      hyprland.bind("clients"),
      hyprland.active.workspace.bind("id"),
    ],
    (ws, clients, activeId) =>
      ws
        .toSorted((a, b) => a.id - b.id)
        .map(({ id }) => {
          return Widget.Button({
            on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
            class_name: `ws-btn ${activeId === id ? "focused" : ""}`,
            child: Widget.Box({
              children: wsChildren(clients, id),
              spacing: 8,
            }),
          });
        }),
  );

  return Widget.Box({
    class_name: "workspaces",
    children: workspaces,
    spacing: 12,
  });
}

function ClientTitle() {
  return Widget.Label({
    class_name: "client-title",
    label: hyprland.active.client.bind("title"),
  });
}

function Clock() {
  return Widget.Label({
    class_name: "clock",
    label: date.bind(),
  });
}

const notifs = Variable(
  { text: "0", alt: "none", class: "none" },
  {
    listen: ["swaync-client -swb", (msg) => JSON.parse(msg)],
  },
);

function notificationLabels({ text, alt }) {
  let str = text;

  if (["dnd-notification", "dnd-none"].includes(alt)) str += " ";
  else str += " ";

  const labels = [
    Widget.Label({
      class_name: "notification-label",
      label: str,
    }),
  ];

  if (["notification", "dnd-notification"].includes(alt)) {
    labels.push(
      Widget.Label({
        class_name: "notification-label-circle",
        yalign: 0,
        label: "",
      }),
    );
  }

  return labels;
}

function Notifications() {
  return Widget.Button({
    class_name: "notification-label-btn",
    on_primary_click: () => Utils.exec("swaync-client -t -sw"),
    on_secondary_click: () => Utils.exec("swaync-client -d -sw"),
    child: Widget.Box({
      children: notifs.bind().as(notificationLabels),
    }),
  });
}

function getVolumeChildren(speaker) {
  const icons = {
    101: "overamplified",
    67: "high",
    34: "medium",
    1: "low",
    0: "muted",
  };

  const icon = audio.speaker.is_muted
    ? 0
    : [101, 67, 34, 1, 0].find(
        (threshold) => threshold <= audio.speaker.volume * 100,
      );

  return [
    Widget.Icon({
      icon: `audio-volume-${icons[icon]}-symbolic`,
      size: 16,
    }),
    Widget.Label({
      label: `${Math.round(audio.speaker.volume * 100)}%`,
    }),
  ];
}

function Volume() {
  return Widget.Button({
    on_primary_click: () => Utils.execAsync("pavucontrol"),
    on_secondary_click: () => Utils.execAsync("pactl set-sink-mute @DEFAULT_SINK@ toggle"),
    child: Widget.Box({
      class_name: "volume",
      spacing: 4,
      children: Utils.merge(
        [audio.speaker.bind("is_muted"), audio.speaker.bind("volume")],
        (speaker) => getVolumeChildren(speaker),
      ),
    }),
  });
}

function BatteryLabel() {
  const value = battery.bind("percent").as((p) => (p > 0 ? p / 100 : 0));
  const icon = battery
    .bind("percent")
    .as((p) => `battery-level-${Math.floor(p / 10) * 10}-symbolic`);

  return Widget.Box({
    class_name: "battery",
    visible: battery.bind("available"),
    children: [
      Widget.Icon({ icon }),
      Widget.LevelBar({
        widthRequest: 140,
        vpack: "center",
        value,
      }),
    ],
  });
}

function SysTray() {
  const items = systemtray.bind("items").as((items) =>
    items.map((item) =>
      Widget.Button({
        child: Widget.Icon({ icon: item.bind("icon"), size: 16 }),
        css: "padding: 0",
        on_primary_click: (_, event) => item.activate(event),
        on_secondary_click: (_, event) => item.openMenu(event),
        tooltip_markup: item.bind("tooltip_markup"),
      }),
    ),
  );

  return Widget.Box({
    spacing: 4,
    children: items,
  });
}

// layout of the bar
function Left() {
  return Widget.Box({
    spacing: 8,
    children: [Workspaces()],
  });
}

function Center() {
  return Widget.Box({
    spacing: 8,
    children: [ClientTitle()],
  });
}

function Right() {
  return Widget.Box({
    hpack: "end",
    spacing: 8,
    children: [SysTray(), Volume(), Clock(), Notifications()],
  });
}

function Bar(monitor = 0) {
  return Widget.Window({
    name: `ags-${monitor}`, // name has to be unique
    class_name: "bar",
    monitor,
    // margins: [0, 4, 4, 4], // [TOP, RIGHT, BOTTOM, LEFT]
    anchor: ["bottom", "left", "right"],
    exclusivity: "exclusive",
    heightRequest: 28,
    child: Widget.CenterBox({
      start_widget: Left(),
      center_widget: Center(),
      end_widget: Right(),
    }),
  });
}

App.resetCss();

App.config({
  style: "./style.css",
  windows: [
    Bar(),

    // you can call it, for each monitor
    // Bar(0),
    // Bar(1)
  ],
});

export {};
