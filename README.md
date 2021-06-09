# module map nodejs

Module map lets you discover size, last edited and content of a module. It also shows the dependencies of a module.


## Installation

```console
npm install --save module-map-nodejs
```

## Usage

```js
const modules = moduleMap({
  source: "./your-path",
});
```

## Example

```js
const vm = require("vm");
const moduleMap = require("./index");

const modules = moduleMap({
  source: "./test2",
});

for (let [key, value] of Object.entries(modules)) {
  const context = {
    require: () => {},
    module: {
      exports: {},
    },
    ...value.exports,
  };

  vm.createContext(context);
  vm.runInContext(value.content, context);
  console.log(context, "YAY");
}

```