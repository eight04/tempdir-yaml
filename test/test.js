/* eslint-env mocha */
const assert = require("assert");
const fs = require("fs");

const {makeDir} = require("..");

describe("makeDir", () => {
  it("list example", () => {
    const resolve = makeDir(`
      - package.json
      - sub-dir:
        - foo.txt: |
           content of foo
    `);
    assert(fs.statSync(resolve("package.json")).isFile());
    assert(fs.statSync(resolve("sub-dir")).isDirectory());
    const content = fs.readFileSync(resolve("sub-dir/foo.txt"), "utf8");
    assert.equal(content, "content of foo\n");
  });
  
  it("map example", () => {
    const resolve = makeDir(`
      package.json: ""
      sub-dir:
        foo.txt: |
          content of foo
    `);
    assert(fs.statSync(resolve("package.json")).isFile());
    assert(fs.statSync(resolve("sub-dir")).isDirectory());
    const content = fs.readFileSync(resolve("sub-dir/foo.txt"), "utf8");
    assert.equal(content, "content of foo\n");
  });
  
  it("empty dir", () => {
    const resolve = makeDir(`
      - foo:
    `);
    assert(fs.statSync(resolve("foo")).isDirectory());
  });
});
