// View: emote wheel (donut SVG).
// This function is serialized with FunctionInfo and runs INSIDE the browser.

declare const window: any;
declare const document: any;
declare const events: Record<string, string>;
declare const emotes: { g: string; n: string; a: string }[];

export const renderEmotes = () => {
  
  const prev = document.getElementById("skymp-emotes");
  if (prev) prev.remove();

  if (!document.getElementById("skymp-emotes-css")) {
    const style = document.createElement("style");
    style.id = "skymp-emotes-css";
    style.textContent = [
      "#skymp-emotes{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;",
        "background:rgba(0,0,0,.4);font-family:Georgia,'Times New Roman',serif;color:#e8e0cc;user-select:none;}",
      "#skymp-emotes .w-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);",
        "width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(30,27,21,.95),rgba(12,11,9,.95));",
        "border:1px solid rgba(190,165,110,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;",
        "text-align:center;pointer-events:none;z-index:2;}",
      "#skymp-emotes .w-center .wc-title{font-size:13px;letter-spacing:4px;text-transform:uppercase;color:#d9c690;}",
      "#skymp-emotes .w-center .wc-label{font-size:11px;color:#9a8f74;margin-top:6px;min-height:14px;padding:0 8px;}",
      "#skymp-emotes svg{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);}",
      "#skymp-emotes .w-seg{cursor:pointer;transition:fill .12s;}",
      "#skymp-emotes .w-seg:hover{fill:rgba(120,108,72,.55);}",
      "#skymp-emotes .w-txt{fill:#e8e0cc;font-size:12px;font-family:Georgia,serif;pointer-events:none;text-anchor:middle;}",
      "#skymp-emotes .w-foot{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);display:flex;gap:10px;}",
      "#skymp-emotes .w-btn{padding:8px 18px;border:1px solid rgba(190,165,110,.5);cursor:pointer;",
        "background:rgba(0,0,0,.5);color:#d9c690;font-size:12px;letter-spacing:2px;font-family:Georgia,serif;}",
      "#skymp-emotes .w-btn:hover{background:rgba(120,40,30,.55);color:#fff;}",
    ].join("");
    document.head.appendChild(style);
  }

  const root = document.createElement("div");
  root.id = "skymp-emotes";

  const SIZE = 460;
  const cx = SIZE / 2, cy = SIZE / 2;
  const rOuter = 220, rInner = 70, rText = 150;
  const n = emotes.length;
  const step = (Math.PI * 2) / n;
  const start = -Math.PI / 2 - step / 2;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", String(SIZE));
  svg.setAttribute("height", String(SIZE));
  svg.setAttribute("viewBox", "0 0 " + SIZE + " " + SIZE);

  const pt = (r: number, a: number) => (cx + r * Math.cos(a)) + "," + (cy + r * Math.sin(a));

  emotes.forEach((e, i) => {
    const a0 = start + i * step;
    const a1 = a0 + step;
    const large = step > Math.PI ? 1 : 0;

    // (donut)
    const d = [
      "M", pt(rInner, a0),
      "L", pt(rOuter, a0),
      "A", rOuter, rOuter, 0, large, 1, pt(rOuter, a1),
      "L", pt(rInner, a1),
      "A", rInner, rInner, 0, large, 0, pt(rInner, a0),
      "Z",
    ].join(" ");

    const seg = document.createElementNS(svgNS, "path");
    seg.setAttribute("d", d);
    seg.setAttribute("class", "w-seg");
    seg.setAttribute("fill", "rgba(30,27,21,0.92)");
    seg.setAttribute("stroke", "rgba(190,165,110,0.35)");
    seg.setAttribute("stroke-width", "1");
    seg.addEventListener("click", () => {
      window.skyrimPlatform.sendMessage("emote:" + e.a);
    });


    // update central label on hover
    const mid = a0 + step / 2;
    seg.addEventListener("mouseenter", () => {
      const lbl = document.getElementById("wc-label");
      if (lbl) lbl.textContent = e.n;
    });
    seg.addEventListener("mouseleave", () => {
      const lbl = document.getElementById("wc-label");
      if (lbl) lbl.textContent = "";
    });
    svg.appendChild(seg);


    // text in the middle of the slice
    const mx = cx + rText * Math.cos(mid);
    const my = cy + rText * Math.sin(mid);
    const txt = document.createElementNS(svgNS, "text");
    txt.setAttribute("x", String(mx));
    txt.setAttribute("y", String(my + 4));
    txt.setAttribute("class", "w-txt");
    txt.textContent = e.n;
    svg.appendChild(txt);
  });

  root.appendChild(svg);


  // central circle with title and label
  const center = document.createElement("div");
  center.className = "w-center";
  const ct = document.createElement("div");
  ct.className = "wc-title";
  ct.textContent = "Emotes";
  const cl = document.createElement("div");
  cl.className = "wc-label";
  cl.id = "wc-label";
  cl.textContent = "";
  center.appendChild(ct);
  center.appendChild(cl);
  root.appendChild(center);


  // bottom buttons
  const foot = document.createElement("div");
  foot.className = "w-foot";

  const stop = document.createElement("button");
  stop.className = "w-btn";
  stop.textContent = "STOP";
  stop.addEventListener("click", () => {
    window.skyrimPlatform.sendMessage("emote:IdleForceDefaultState");
  });
  foot.appendChild(stop);

  const close = document.createElement("button");
  close.className = "w-btn";
  close.textContent = "CLOSE";
  close.addEventListener("click", () => {
    window.skyrimPlatform.sendMessage(events.closeEmotes);
  });
  foot.appendChild(close);

  root.appendChild(foot);
  document.body.appendChild(root);
};