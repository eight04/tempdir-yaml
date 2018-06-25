const path = require("path");
const yaml = require("js-yaml");
const temp = require("temporarily");
const dedent = require("dedent");

function buildDir(name, children) {
  if (!Array.isArray(children)) {
    children = Object.entries(children);
  }
  return temp.dir({name}, [...genChildren()]);

  function* genChildren() {
    for (const child of children) {
      if (typeof child === "string") {
        yield temp.file({name: child});
      } else {
        const list = Array.isArray(child) ? [child] : Object.entries(child);
        for (const [name, data] of list) {
          if (typeof data === "string") {
            yield temp.file({name, data});
          } else {
            yield buildDir(name, data || []);
          }
        }
      }
    }
  }
}

function makeDir(text) {
  const dir = buildDir(undefined, yaml.safeLoad(dedent(text)));
  return file => path.resolve(dir.filepath, file);
}

module.exports = {
  makeDir
};
