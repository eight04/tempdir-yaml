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
  return Promise.all(children.map(async child => {
    if (child.type === "file") {
      const name = path.resolve(base, child.name);
      return await writeFile(name, child.data || "");
    }
    if (child.type === "dir") {
      const name = path.resolve(base, child.name);
      await mkdir(name);
      return await tree2dir(name, child.children);
    }
    throw new TypeError(`unknown type: '${child.type}'`);
  }));
}

async function makeDir(text) {
  // text could be null
  const children = text && yaml2tree(text);
  const {path: base, cleanup} = await getTmpDir();
  if (children) {
    await tree2dir(base, children);
  }
  return {
    resolve: (...args) => path.resolve(base, ...args),
    cleanup
  };
}

async function withDir(text, onReady) {
  if (typeof text === "function") {
    onReady = text;
    text = null;
  }
  let dir;
  try {
    dir = await makeDir(text);
    return await onReady(dir.resolve);
  } finally {
    if (dir) {
      await new Promise(resolve => {
        dir.cleanup(resolve);
      });
    }
  }
}

module.exports = {
  makeDir,
  withDir,
  yaml2tree,
  tree2dir
};
