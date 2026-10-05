const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
// Keep native bundling within the memory available on local Windows builds.
config.maxWorkers = 1;
const blockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(blockList) ? blockList : blockList ? [blockList] : []),
  /[/\\]test-results[/\\].*/,
];
module.exports = config;
