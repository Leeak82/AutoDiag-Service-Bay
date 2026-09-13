module.exports = {
  daemon: true,
  run: [{
    method: "shell.run",
    params: {
      path: "app",
      message: '"{{which("node")}}" server.mjs',
      on: [{ event: "/(http:\/\/[0-9.:]+)/", done: true }]
    }
  }, {
    method: "local.set",
    params: { url: "{{input.event[1]}}" }
  }]
}
