// View: character selection (cards + create new + delete).
// Serialized with FunctionInfo, runs INSIDE the browser.

declare const window: any;
declare const document: any;
declare const events: Record<string, string>;
declare const canCreate: boolean;
declare const characters: { id: number; name: string }[];

export const renderCharacterSelection = () => {
  const prev = document.getElementById("skymp-charselect");
  if (prev) prev.remove();

  if (!document.getElementById("skymp-charselect-css")) {
    const style = document.createElement("style");
    style.id = "skymp-charselect-css";
    style.textContent = [
      "#skymp-charselect{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;",
        "align-items:center;justify-content:center;",
        "background:radial-gradient(circle at 50% 40%,rgba(20,18,14,.92),rgba(5,5,6,.96));",
        "font-family:Georgia,'Times New Roman',serif;color:#e8e0cc;user-select:none;}",
      "#skymp-charselect .cs-title{font-size:32px;letter-spacing:12px;text-transform:uppercase;color:#d9c690;}",
      "#skymp-charselect .cs-count{font-size:11px;letter-spacing:5px;text-transform:uppercase;color:#9a8f74;margin-bottom:26px;}",
      "#skymp-charselect .cs-row{display:flex;gap:22px;}",
      "#skymp-charselect .cs-card{position:relative;width:190px;height:300px;cursor:pointer;",
        "border:1px solid rgba(190,165,110,.35);background:linear-gradient(180deg,rgba(40,36,28,.6),rgba(15,14,12,.6));",
        "display:flex;flex-direction:column;align-items:center;transition:all .15s ease;}",
      "#skymp-charselect .cs-card:hover{border-color:#d9c690;transform:translateY(-4px);box-shadow:0 10px 30px rgba(0,0,0,.5);}",
      "#skymp-charselect .cs-portrait{flex:1;width:100%;display:flex;align-items:center;justify-content:center;",
        "font-size:84px;color:#bcae86;background:radial-gradient(circle at 50% 35%,rgba(80,72,54,.5),transparent 70%);}",
      "#skymp-charselect .cs-name{font-size:18px;letter-spacing:3px;text-transform:uppercase;color:#ece4cf;padding-top:10px;}",
      "#skymp-charselect .cs-sub{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#9a8f74;padding:4px 0 16px;}",
      "#skymp-charselect .cs-del{position:absolute;top:8px;right:8px;width:24px;height:24px;",
        "border:1px solid rgba(190,120,100,.4);background:rgba(0,0,0,.4);color:#c98b7e;font-size:12px;cursor:pointer;opacity:0;transition:opacity .15s;}",
      "#skymp-charselect .cs-card:hover .cs-del{opacity:1;}",
      "#skymp-charselect .cs-del:hover{background:rgba(120,40,30,.6);color:#fff;}",
      "#skymp-charselect .cs-create{border-style:dashed;justify-content:center;gap:14px;}",
      "#skymp-charselect .cs-plus{font-size:46px;color:#bcae86;width:64px;height:64px;border:1px solid rgba(190,165,110,.5);",
        "border-radius:50%;display:flex;align-items:center;justify-content:center;}",
      "#skymp-charselect .cs-hint{margin-top:30px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#7d735c;}",
    ].join("");
    document.head.appendChild(style);
  }

  const root = document.createElement("div");
  root.id = "skymp-charselect";

  const title = document.createElement("div");
  title.className = "cs-title";
  title.textContent = "Select Character";
  root.appendChild(title);

  const count = document.createElement("div");
  count.className = "cs-count";
  count.textContent = characters.length + " / 2 Characters";
  root.appendChild(count);

  const row = document.createElement("div");
  row.className = "cs-row";

  characters.forEach((c, i) => {
    const name = c && c.name ? String(c.name) : "Character " + (i + 1);

    const card = document.createElement("div");
    card.className = "cs-card";
    card.addEventListener("click", () =>
      window.skyrimPlatform.sendMessage((events as any)["selectSlot" + i])
    );

    const portrait = document.createElement("div");
    portrait.className = "cs-portrait";
    portrait.textContent = name.charAt(0).toUpperCase();
    card.appendChild(portrait);

    const nm = document.createElement("div");
    nm.className = "cs-name";
    nm.textContent = name;
    card.appendChild(nm);

    const sub = document.createElement("div");
    sub.className = "cs-sub";
    sub.textContent = "Adventure";
    card.appendChild(sub);

    const del = document.createElement("button");
    del.className = "cs-del";
    del.textContent = "✕";
    del.addEventListener("click", (e: any) => {
      e.stopPropagation();
      window.skyrimPlatform.sendMessage((events as any)["deleteSlot" + i]);
    });
    card.appendChild(del);

    row.appendChild(card);
  });

  if (canCreate) {
    const add = document.createElement("div");
    add.className = "cs-card cs-create";
    add.style.pointerEvents = "auto";
    add.onclick = () => {
      window.skyrimPlatform.sendMessage(events.createNew);
    };

    const plus = document.createElement("div");
    plus.className = "cs-plus";
    plus.textContent = "+";
    plus.style.pointerEvents = "none";
    add.appendChild(plus);

    const lbl = document.createElement("div");
    lbl.className = "cs-name";
    lbl.textContent = "Create New";
    lbl.style.pointerEvents = "none";
    add.appendChild(lbl);

    row.appendChild(add);
  }

  root.appendChild(row);

  const hint = document.createElement("div");
  hint.className = "cs-hint";
  hint.textContent = "Click MOUSE 1 to play  •  ✕ to delete";
  root.appendChild(hint);

  document.body.appendChild(root);
};