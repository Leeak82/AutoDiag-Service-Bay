module.exports = {
  version: "7.0",
  title: "AutoDiag · Service Bay",
  description: "Hands-on vehicle diagnostics. Connect tools, trace circuits and carry out a verified repair.",
  icon: "icon.svg",
  menu: async (kernel, info) => {
    for (const [script,text] of [["install.js","Installing"],["update.js","Updating"],["reset.js","Resetting"]]) {
      if (info.running(script)) return [{default:true,icon:"fa-solid fa-terminal",text,href:script}]
    }
    if (!info.exists("app/.installed")) return [{default:true,icon:"fa-solid fa-plug",text:"Install",href:"install.js"}]
    if (info.running("start.js")) {
      const local = info.local("start.js")
      return local && local.url ? [{default:true,icon:"fa-solid fa-car",text:"Enter service bay",href:local.url},{icon:"fa-solid fa-terminal",text:"Terminal",href:"start.js"}] : [{default:true,icon:"fa-solid fa-terminal",text:"Starting",href:"start.js"}]
    }
    return [{default:true,icon:"fa-solid fa-power-off",text:"Start",href:"start.js"},{icon:"fa-solid fa-rotate",text:"Update",href:"update.js"},{icon:"fa-solid fa-plug",text:"Install",href:"install.js"},{icon:"fa-solid fa-broom",text:"Reset setup",href:"reset.js"}]
  }
}
