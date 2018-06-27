/* eslint-env mocha */
const assert = require("assert");
const fs = require("fs");

const {withDir} = require("..");

describe("makeDir", () => {
  it("list example", () =>
    withDir(`
      - package.json
      - sub-dir:
        - foo.txt: |
           content of foo
    `, resolve => {
      assert(fs.statSync(resolve("package.json")).isFile());
      assert(fs.statSync(resolve("sub-dir")).isDirectory());
      const content = fs.readFileSync(resolve("sub-dir/foo.txt"), "utf8");
      assert.equal(content, "content of foo\n");
    })
  );
  
  it("map example", () =>
    withDir(`
      package.json: ""
      sub-dir:
        foo.txt: |
          content of foo
    `, resolve => {
      assert(fs.statSync(resolve("package.json")).isFile());
      assert(fs.statSync(resolve("sub-dir")).isDirectory());
      const content = fs.readFileSync(resolve("sub-dir/foo.txt"), "utf8");
      assert.equal(content, "content of foo\n");
    })
  );
  
  it("empty dir", () =>
    withDir(`
      - foo:
    `, resolve => {
      assert(fs.statSync(resolve("foo")).isDirectory());
    })
  );
  
  it("duplicated filename", () =>
    withDir(`
      - foo.txt
      - foo:
        - foo.txt
    `, resolve => {
      assert(fs.statSync(resolve("foo.txt")).isFile());
      assert(fs.statSync(resolve("foo/foo.txt")).isFile());
    })
  );
});
