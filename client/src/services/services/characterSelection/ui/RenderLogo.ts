// View: Logo (SkyrimMP logo).
// This function is serialized with FunctionInfo and runs INSIDE the browser.

declare const url: string;
declare const document: any;

export const renderLogo = () => {

  const prev = document.getElementById("skymp-logo");
  if (prev) prev.remove();

  const img = document.createElement("img");
  img.id = "skymp-logo";
  img.src = url;
  img.setAttribute("style", [
    "position:fixed;top:4px;right:4px;z-index:9999;",
    "width:90px;height:auto;pointer-events:none;",
    "opacity:0.9;filter:drop-shadow(0 2px 8px rgba(0,0,0,.8));",
  ].join(""));

  document.body.appendChild(img);
};