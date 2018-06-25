tempdir-yaml
============

[![Build Status](https://travis-ci.org/eight04/tempdir-yaml.svg?branch=master)](https://travis-ci.org/eight04/tempdir-yaml)
[![Coverage Status](https://coveralls.io/repos/github/eight04/tempdir-yaml/badge.svg?branch=master)](https://coveralls.io/github/eight04/tempdir-yaml?branch=master)
[![install size](https://packagephobia.now.sh/badge?p=tempdir-yaml)](https://packagephobia.now.sh/result?p=tempdir-yaml)

Build temporary directories and files with YAML definition. Inspired by [the filemaker of pydeps](https://github.com/thebjorn/pydeps/blob/83762459eed1d199af8ac580b2882189cbca1624/tests/filemaker.py).

Usage
-----

```js
const fs = require("fs");
const {makeDir} = require("tempdir-yaml");

describe("a test", () => {
  it("a case", () => {
    const resolve = makeDir(`
      - package.json
      - sub-dir:
        - foo.txt: |
           content of foo
    `);
    const data = fs.readFileSync(resolve("sub-dir/foo.txt"), "utf-8");
    assert.equal(data, "content of foo\n");
  });
});
```

Some quick examples:

* An empty folder:
  ```yaml
  - dirname:
  ```
* A directory with children:
  ```yaml
  - dirname:
    - child1
    - child2
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

Installation
------------
```
npm install -D tempdir-yaml
```

API reference
-------------

This module exports following members:

* `makeDir(definition)` - create a temporary file tree and return a resolve function.

### makeDir(yaml: String) => resolve

Create a temporary file tree and return a `resolve` function. `yaml` is [dedent](https://www.npmjs.com/package/dedent)ed before parsed.

The file tree is created according to the type of the value:

* *a list* - if the list item is:
  - *a string* - create an empty file. Use the item as its name.
  - *a map* - see below.
* *a map* - a list of `name: data` pairs. If `data` is:
  - *a string* - create a file that `name` is the name and `data` is the content.
  - *null* - create an empty folder.
  - *a list or a map* - create a folder and use `data` as the children.
  
The temporary folder would be cleaned up at the "exit" event.

### resolve(filename) => absoluteFilename

Resolve `filename` with the root of the temporary folder.

Changelog
---------

* 0.1.0 (Jun 26, 2018)

  - First release.
