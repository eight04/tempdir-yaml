const fs = require("fs");
const path = require("path");
const {promisify} = require("util");

const yaml = require("js-yaml");
const dedent = require("dedent");
const tmp = require("tmp");

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

function getTmpDir() {
  return new Promise((resolve, reject) => {
    tmp.dir({unsafeCleanup: true}, (err, path, cleanup) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({path, cleanup});
    });
  });
}

function yaml2tree(text) {
  const result = yaml.safeLoad(dedent(text));
  return [...genChildren(result)];
  
  function* genChildren(children) {
    if (!children) {
      return;
    }
    if (!Array.isArray(children)) {
      children = Object.entries(children);
    }
    for (const child of children) {
      if (typeof child === "string") {
        yield {type: "file", name: child};
      } else {
        const list = Array.isArray(child) ? [child] : Object.entries(child);
        for (const [name, data] of list) {
          if (typeof data === "string") {
            yield {type: "file", name, data};
          } else {
            yield {type: "dir", name, children: [...genChildren(data)]};
          }
        }
      }
    }
  }
}

function tree2dir(base, children) {
  return Promise.all(children.map(child =>
    new Promise((resolve, reject) => {
      if (child.type === "file") {
        const name = path.resolve(base, child.name);
        writeFile(name, child.data || "").then(resolve, reject);
      } else if (child.type === "dir") {
        const name = path.resolve(base, child.name);
        mkdir(name)
          .then(() => tree2dir(name, child.children))
          .then(resolve, reject);
      } else {
        throw new Error(`unknown type: '${child.type}'`);
      }
    })
  ));
}

function makeDir(text) {
  return new Promise((resolve, reject) => {
    const children = yaml2tree(text);
    getTmpDir()
      .then(({path: base, cleanup}) =>
        tree2dir(base, children)
          .then(
            () => {
              resolve({
                resolve: (...args) => path.resolve(base, ...args),
                cleanup
              });
            },
            reject
          )
      );
  });
}

function withDir(text, onReady) {
  if (typeof text === "function") {
    onReady = text;
    text = "{}";
  }
  let cleanup;
  return makeDir(text)
    .then(dir => {
      cleanup = dir.cleanup;
      return onReady(dir.resolve);
    })
    .then(
      result => {
        cleanup();
        return result;
      },
      err => {
        if (cleanup) {
          cleanup();
        }
        throw err;
      }
    );
}

module.exports = {
  makeDir,
  withDir,
  yaml2tree,
  tree2dir
};
