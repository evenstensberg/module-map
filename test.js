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
