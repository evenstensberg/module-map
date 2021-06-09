const path = require("path");
const fs = require("fs");
const vm = require("vm");
const SandboxedModule = require("sandboxed-module");

function recFindByExt(base, ext, files, result) {
  files = files || fs.readdirSync(base);
  result = result || [];
  files.forEach(function (file) {
    var newbase = path.join(base, file);
    if (fs.statSync(newbase).isDirectory()) {
      result = recFindByExt(newbase, ext, fs.readdirSync(newbase), result);
    } else {
      if (file.substr(-1 * (ext.length + 1)) == "." + ext) {
        result.push(newbase);
      }
    }
  });
  return result;
}

function moduleMap(options) {
  const { source } = options;
  const base = path.resolve(source);
  const files = recFindByExt(base, "js");
  let map = new Map();
  files.forEach((file) => {
    const fileMetaData = fs.statSync(file);
    let mapObject = map.get(file);
    if (mapObject) {
      const newMapItemWithFileContent = Object.assign(mapObject, {
        metaData: fileMetaData,
        filePath: file,
      });
      map.delete(file);
      map.set(file, newMapItemWithFileContent);
      return;
    }
    map.set(file, {
      metaData: fileMetaData,
    });
    const fileContent = fs.readFileSync(file, "utf8");
    mapObject = map.get(file);
    if (mapObject) {
      const newMapItemWithFileContent = Object.assign(mapObject, {
        content: fileContent,
        filePath: file,
      });
      map.delete(file);
      map.set(file, newMapItemWithFileContent);
      return;
    }
    map.set(file, {
      content: fileContent,
    });
  });
  let newMap = new Map();
  map.forEach((mapItem) => {
    const code = mapItem.content;
    const mod = SandboxedModule.load(mapItem.filePath, {});
    let mapObject = map.get(mapItem.filePath);
    map.delete(mapObject.filePath);
    mapObject.id = mod.locals.id;
    mapObject.exports = mod.locals.exports;
    newMap.set(mapObject.filePath, mapObject);
  });
  return Object.fromEntries(newMap);
}

module.exports = moduleMap;
