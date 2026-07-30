// View: mining panel + gem mini-game.
// This function is serialized with FunctionInfo and runs INSIDE the browser.
// It can only use browser globals and injected variables (events, ore, stock).
// The `declare const` statements exist only for TypeScript compilation.

declare const window: any;
declare const document: any;
declare const setTimeout: any;
declare const clearTimeout: any;
declare const events: Record<string, string>;
declare const ore: string;
declare const stock: number;

export const renderMining = () => {
  
  const prev = document.getElementById("skymp-mining");
  if (prev) prev.remove();

  if (!document.getElementById("skymp-mining-css")) {
    const style = document.createElement("style");
    style.id = "skymp-mining-css";
    style.textContent = [
      "#skymp-mining{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;",
        "background:rgba(0,0,0,.45);font-family:Georgia,'Times New Roman',serif;color:#e8e0cc;user-select:none;}",
      "#skymp-mining .m-panel{position:relative;background:linear-gradient(180deg,rgba(30,27,21,.98),rgba(12,11,9,.98));",
        "border:1px solid rgba(190,165,110,.5);border-radius:4px;padding:24px 28px;",
        "box-shadow:0 12px 40px rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;}",
      "#skymp-mining .m-title{font-size:20px;letter-spacing:8px;text-transform:uppercase;color:#d9c690;margin-bottom:6px;}",
      "#skymp-mining .m-sub{font-size:11px;letter-spacing:3px;color:#9a8f74;margin-bottom:16px;}",
      "#skymp-mining .m-counter{font-size:13px;letter-spacing:2px;color:#d9c690;margin-bottom:14px;min-height:16px;}",
      "#skymp-mining .m-arena{position:relative;width:420px;height:300px;",
        "border:1px solid rgba(190,165,110,.2);background:rgba(0,0,0,.25);overflow:hidden;}",
      "#skymp-mining .m-diamond{position:absolute;width:64px;height:64px;cursor:pointer;",
        "transition:transform .08s,filter .12s;}",
      "#skymp-mining .m-diamond:hover{transform:scale(1.12);",
        "filter:drop-shadow(0 0 6px rgba(255,255,255,.55));}",
      "#skymp-mining .m-diamond svg{display:block;width:100%;height:100%;}",
      "#skymp-mining .m-close{margin-top:18px;width:38px;height:38px;border:1px solid rgba(190,165,110,.5);",
        "background:rgba(0,0,0,.4);color:#d9c690;font-size:16px;cursor:pointer;font-family:Georgia,serif;}",
      "#skymp-mining .m-close:hover{background:rgba(120,40,30,.55);color:#fff;}",
      "#skymp-mining .m-depleted{font-size:26px;letter-spacing:6px;color:#d6442e;}",
    ].join("");
    document.head.appendChild(style);
  }

  const root = document.createElement("div");
  root.id = "skymp-mining";

  const panel = document.createElement("div");
  panel.className = "m-panel";

  const title = document.createElement("div");
  title.className = "m-title";
  title.textContent = ore + " Vein";
  panel.appendChild(title);

  const sub = document.createElement("div");
  sub.className = "m-sub";
  sub.textContent = "Click on crystals to mine";
  panel.appendChild(sub);

  const counter = document.createElement("div");
  counter.className = "m-counter";
  counter.textContent = "Ore: 0";
  panel.appendChild(counter);

  const arena = document.createElement("div");
  arena.className = "m-arena";
  panel.appendChild(arena);

  const close = document.createElement("button");
  close.className = "m-close";
  close.textContent = "✕";
  close.addEventListener("click", () => {
    (window as any).__miningSession = 0;
    window.skyrimPlatform.sendMessage(events.closeMining);
  });
  panel.appendChild(close);

  root.appendChild(panel);
  document.body.appendChild(root);

  // mining mini-game logic
  const CLICKS_PER_ORE = 5;
  const LIFETIME_MS = 1500;
  const COLORS = ["#d9c690", "#7ec98b", "#7e9bc9", "#c97e9b", "#c9b27e", "#9b7ec9"];
  const GEM = 64;
  let clicks = 0;
  let oreMined = 0;


  // generates the SVG of a faceted gem from a base color
  const gemSvg = (base: string): string => {
    const shade = (hex: string, f: number): string => {
      const n = parseInt(hex.slice(1), 16);
      let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      if (f >= 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
      else { r *= (1 + f); g *= (1 + f); b *= (1 + f); }
      const h = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
      return "#" + h(r) + h(g) + h(b);
    };
    const light = shade(base, 0.45), mid = base, table = shade(base, 0.7);
    const medDark = shade(base, -0.35), dark = shade(base, -0.7), edge = shade(base, -0.8);

    return [
      "<svg viewBox='-48 -48 96 96' xmlns='http://www.w3.org/2000/svg'>",
        "<polygon points='-42,0 0,-42 0,-16 -16,0' fill='", light, "'/>",
        "<polygon points='0,-42 42,0 16,0 0,-16' fill='", mid, "'/>",
        "<polygon points='42,0 0,42 0,16 16,0' fill='", dark, "'/>",
        "<polygon points='0,42 -42,0 -16,0 0,16' fill='", medDark, "'/>",
        "<polygon points='0,-16 16,0 0,16 -16,0' fill='", table, "'/>",
        "<path d='M0,-42 L0,-16 M42,0 L16,0 M0,42 L0,16 M-42,0 L-16,0 M0,-16 L16,0 L0,16 L-16,0 Z' ",
          "fill='none' stroke='#ffffff' stroke-opacity='0.45' stroke-width='0.75'/>",
        "<polygon points='-42,0 0,-42 0,42 42,0' fill='none' stroke='", edge, "' stroke-width='1'/>",
        "<polygon points='-6,-30 -1,-30 -11,-9 -16,-9' fill='#ffffff' opacity='0.3'/>",
      "</svg>",
    ].join("");
  };


  // every opening has its own session; loops from old sessions stop themselves
  const mySession = (((window as any).__miningSession as number) || 0) + 1;
  (window as any).__miningSession = mySession;
  (window as any).__miningDepleted = false;
  const isCurrent = () => (window as any).__miningSession === mySession;

  const spawnNext = () => {
    if (!isCurrent()) return;
    if ((window as any).__miningDepleted) {
      arena.innerHTML =
        "<div class='m-depleted' style='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)'>DEPLETED</div>";
      return;
    }

    const dia = document.createElement("div");
    dia.className = "m-diamond";
    const x = Math.floor(Math.random() * (420 - GEM));
    const y = Math.floor(Math.random() * (300 - GEM));
    dia.style.left = x + "px";
    dia.style.top = y + "px";
    dia.innerHTML = gemSvg(COLORS[Math.floor(Math.random() * COLORS.length)]);
    arena.appendChild(dia);

    let alive = true;
    const remove = () => { if (dia.parentNode) dia.remove(); };

    const timer = setTimeout(() => {
      if (!alive || !isCurrent()) return;
      alive = false;
      remove();
      spawnNext();
    }, LIFETIME_MS);

    dia.addEventListener("click", () => {
      if (!alive || !isCurrent()) return;
      if ((window as any).__miningDepleted) {
        alive = false; clearTimeout(timer); remove(); spawnNext(); return;
      }
      alive = false;
      clearTimeout(timer);
      remove();
      clicks++;
      counter.textContent = "Ore: " + oreMined + "  (" + clicks + "/5)";
      if (clicks >= CLICKS_PER_ORE) {
        clicks = 0;
        oreMined++;
        counter.textContent = "Ore: " + oreMined;
        window.skyrimPlatform.sendMessage(events.mineProgress);
      }
      spawnNext();
    });
  };

  // if the vein is already empty, open directly in DEPLETED
  if (stock <= 0) {
    (window as any).__miningDepleted = true;
  }

  spawnNext();
};