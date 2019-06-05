/* eslint-env mocha */
const assert = require("assert");
const fs = require("fs");

const {withDir, tree2dir, makeDir} = require("..");

describe("makeDir", () => {
  it("cleanup is an async function", async () => {
    const {cleanup} = await makeDir();
    assert.equal(typeof cleanup, "function");
    const r = cleanup();
    assert(r.then);
    await r;
  });
});

describe("withDir", () => {
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
  
  it("no children", () =>
    withDir(resolve => {
      assert(fs.statSync(resolve(".")).isDirectory());
    })
  );
  
  it("cleanup on error", () => {
    let base;
    return assert.rejects(withDir(`
      - foo.txt
      - bar:
        - bar.txt: |
            BAR
    `, resolve => {
      base = resolve(".");
      assert(fs.statSync(base).isDirectory());
      throw new Error("must fail");
    }), /must fail/)
      .then(() => {
        assert.equal(typeof base, "string");
        assert.throws(() => fs.statSync(base));
      });
  });
  
  it("make file error", () =>
    assert.rejects(withDir(`
      - foo/bar.txt # invalid character
    `, () => {
      assert.fail();
    }), /ENOENT/)
  );
  
  it("work with async callback", () =>
    withDir(`
      - foo.txt: |
          FOO
    `, resolve =>
      Promise.resolve()
        .then(() => {
          assert.equal(fs.readFileSync(resolve("foo.txt"), "utf8"), "FOO\n");
        })
    )
  );
});

describe("tree2dir", () => {
  it("unknown type", () =>
    assert.rejects(tree2dir(".", [{type: "unknown"}]), /unknown type: 'unknown'/)
  );
});
