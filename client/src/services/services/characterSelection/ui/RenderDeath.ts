// View: overlay "You Died".
// This function is serialized with FunctionInfo and runs INSIDE the browser.

declare const document: any;
declare const text: string;

export const renderDeath = () => {
  
  const prev = document.getElementById("skymp-death");
  if (prev) prev.remove();

  const root = document.createElement("div");
  root.id = "skymp-death";
  root.setAttribute("style", [
    "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;",
    "background:rgba(0,0,0,.75);pointer-events:none;",
    "font-family:Georgia,'Times New Roman',serif;",
  ].join(""));

  const msg = document.createElement("div");
  msg.setAttribute("style", [
    "text-align:center;color:#c9b27e;letter-spacing:4px;",
    "text-shadow:0 2px 12px rgba(0,0,0,.9);",
    "animation:deathFade 1.2s ease;",
  ].join(""));

  const big = document.createElement("div");
  big.setAttribute("style", "font-size:52px;letter-spacing:10px;text-transform:uppercase;color:#a83e2e;margin-bottom:18px;");
  big.textContent = "You Died";

  const sub = document.createElement("div");
  sub.setAttribute("style", "font-size:18px;color:#d9c690;");
  sub.textContent = text;

  msg.appendChild(big);
  msg.appendChild(sub);
  root.appendChild(msg);

  if (!document.getElementById("skymp-death-css")) {
    const st = document.createElement("style");
    st.id = "skymp-death-css";
    st.textContent = "@keyframes deathFade{from{opacity:0}to{opacity:1}}";
    document.head.appendChild(st);
  }

  document.body.appendChild(root);
};