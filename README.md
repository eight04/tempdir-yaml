tempdir-yaml
============

[![Build Status](https://travis-ci.org/eight04/tempdir-yaml.svg?branch=master)](https://travis-ci.org/eight04/tempdir-yaml)
[![codecov](https://codecov.io/gh/eight04/tempdir-yaml/branch/master/graph/badge.svg)](https://codecov.io/gh/eight04/tempdir-yaml)
[![install size](https://packagephobia.now.sh/badge?p=tempdir-yaml)](https://packagephobia.now.sh/result?p=tempdir-yaml)

Build temporary directories and files with YAML definition. Inspired by [the filemaker of pydeps](https://github.com/thebjorn/pydeps/blob/83762459eed1d199af8ac580b2882189cbca1624/tests/filemaker.py).

Installation
------------
```
npm install -D tempdir-yaml
```

Usage
-----

```js
const fs = require("fs");
const {withDir} = require("tempdir-yaml");

describe("a test", () => {
  it("a case", () =>
    withDir(`
      - package.json
      - sub-dir:
        - foo.txt: |
           content of foo
    `, resolve => {
      const data = fs.readFileSync(resolve("sub-dir/foo.txt"), "utf-8");
      assert.equal(data, "content of foo\n");
    })
  );
});
```

Some quick examples:

* An empty folder:
  ```yaml
  - my-dir:
  ```
* A directory containing some files:
  ```yaml
  - my-dir:
    - file1
    - file2
  ```
* An empty file:
  ```yaml
  - file
  ```
* A file with content:
  ```yaml
  - file: |
     the content of the file
  ```

API
----

### makeDir

```js
async makeDir(yaml: String) =>
  ({
    resolve: (...args) => absPath: String,
    cleanup: async () => undefined
  })
```

Create a temporary file tree and return a `resolve` function and a `cleanup` function. `yaml` is [dedent](https://www.npmjs.com/package/dedent)ed before parsed.

The file tree is created according to the type of the value:

* *a list* - if the list item is:
  - *a string* - create an empty file. Use the item as its name.
  - *a map* - see below.
* *a map* - a list of `name: data` pairs. If `data` is:
  - *a string* - create a file that `name` is the name and `data` is the content.
  - *null* - create an empty folder.
  - *a list or a map* - create a folder and use `data` as the children.
  
`resolve` function resolves relative paths to an absolute path based on the temporary folder. You can get the root path with `resolve(".")`.

`cleanup` function would remove the temporary folder. If `cleanup` is not called, the temporary folder would be removed at the "exit" event.

### withDir

```js
async withDir(yaml:String, async onReady(resolve))
```

A wrapper of `makeDir` that would automatically cleanup when `onReady` returns/throws.

```js
it("my test", () =>
  withDir(`
    - foo.txt: |
        FOO
    - bar.txt: |
        BAR
  `, resolve => {
    // test something with the files...
  })
);
```

Changelog
---------

* 0.3.0 (Jun 5, 2019)

  - Bump dependencies.
  - **Breaking: now `cleanup` is an async function.**

* 0.2.1 (Jun 27, 2018)

  - Fix: ENOENT error when `onReady` is async in `withDir`.

* 0.2.0 (Jun 27, 2018)

  - **Change: the signature of `makeDir` is changed.**
  - Add: `withDir`.

* 0.1.0 (Jun 26, 2018)

  - First release.
