'use strict';

const Koa = require('koa');

require("marko/node-require")
//require("marko/browser-refresh").enable()
//require('marko/hot-reload').enable();

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error);
});

let app = new Koa()

let decorator = require('./decorator.marko');
let index = require('./index.marko');
function getTemplate(path) {
  try {
    if (path == "/") return index;
    return require(`.${path}.marko`);
  }
  catch (e) {
    return null
  }
}

app.use((ctx, next) => {

  let template = getTemplate(ctx.path)
  if (template) {
    return new Promise((resolve, reject)=>{
      ctx.type = 'html';
      var stream = decorator.stream({template});
      stream.on("error", e => {
        console.error("Error rendering", ctx.request.href)
        console.error(e)
        reject()
      })
      stream.on("data", data => {
        if (data !== null) {
          ctx.res.write(data)
        }
      })
      stream.on("end", () => {
        ctx.res.end()
        resolve()
      })
    })
  }
  else {
    return next()
  }
});

app.listen(process.env.PORT || 8001)

if (process.send) {
    process.send('online');
}
