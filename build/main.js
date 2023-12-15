"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
class ApSystemsEz1 extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "ap-systems-ez1"
    });
    this.pollIntervalInSeconds = 60;
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    var _a, _b, _c;
    this.log.info("config ipAddress: " + this.config.ipAddress);
    this.log.info("config port: " + this.config.port);
    this.log.info("config pollIntervalInSeconds: " + this.config.pollIntervalInSeconds);
    if (!((_a = this.config) == null ? void 0 : _a.ipAddress) || !((_b = this.config) == null ? void 0 : _b.port) || !((_c = this.config) == null ? void 0 : _c.pollIntervalInSeconds)) {
      this.log.error("Can not start with in valid config. Please open config.");
      return;
    }
    this.pollIntervalInSeconds = this.config.pollIntervalInSeconds;
    await this.setObjectNotExistsAsync("testVariable", {
      type: "state",
      common: {
        name: "testVariable",
        type: "boolean",
        role: "indicator",
        read: true,
        write: true
      },
      native: {}
    });
    this.subscribeStates("testVariable");
    await this.setStateAsync("testVariable", true);
    await this.setStateAsync("testVariable", { val: true, ack: true });
    await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });
    try {
      this.setupRefreshTimeout();
    } catch (error) {
      await this.handleClientError(error);
    }
  }
  onUnload(callback) {
    try {
      callback();
    } catch (e) {
      callback();
    }
  }
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
  setupRefreshTimeout() {
    this.log.debug("setupRefreshTimeout");
    const refreshIntervalInMilliseconds = this.pollIntervalInSeconds * 1e3;
    this.log.debug(`refreshIntervalInMilliseconds=${refreshIntervalInMilliseconds}`);
    this.refreshTimeout = setTimeout(this.refreshTimeoutFunc.bind(this), refreshIntervalInMilliseconds);
  }
  async refreshTimeoutFunc() {
    this.log.debug("refreshTimeoutFunc started.");
    try {
      this.setupRefreshTimeout();
    } catch (error) {
      await this.handleClientError(error);
    }
  }
  async handleClientError(error) {
    if (error instanceof Error) {
      this.log.error(`Unknown error: ${error}. Stack: ${error.stack}`);
    } else {
      this.log.error(`Unknown error: ${error}`);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new ApSystemsEz1(options);
} else {
  (() => new ApSystemsEz1())();
}
//# sourceMappingURL=main.js.map
