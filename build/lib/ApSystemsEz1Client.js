"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var ApSystemsEz1Client_exports = {};
__export(ApSystemsEz1Client_exports, {
  ApSystemsEz1Client: () => ApSystemsEz1Client
});
module.exports = __toCommonJS(ApSystemsEz1Client_exports);
var import_axios = __toESM(require("axios"));
class ApSystemsEz1Client {
  constructor(logger, ipAddress, port, ignoreConnectionErrorMessages = false) {
    this.log = logger;
    this.baseUrl = `http://${ipAddress}:${port}`;
    this.ignoreConnectionErrorMessages = ignoreConnectionErrorMessages;
  }
  async getRequest(endpoint) {
    try {
      const url = `${this.baseUrl}/${endpoint}`;
      this.log.info(`url: ${url}`);
      const response = await import_axios.default.get(url);
      this.log.info(`Response: ${JSON.stringify(response.data)}`);
      if (response.status !== 200) {
        this.handleClientError(response.statusText);
      } else {
        const result = response.data;
        return result;
      }
    } catch (error) {
      if (!this.ignoreConnectionErrorMessages) {
        await this.handleClientError(error);
      }
    }
  }
  async getDeviceInfo() {
    const result = await this.getRequest("getDeviceInfo");
    return result;
  }
  async getAlarmInfo() {
    const result = await this.getRequest("getAlarm");
    return result;
  }
  async getOnOffStatus() {
    const result = await this.getRequest("getOnOff");
    return result;
  }
  async getOutputData() {
    const result = await this.getRequest("getOutputData");
    return result;
  }
  async getTotalOutput() {
    const outputData = await this.getOutputData();
    if (outputData == null ? void 0 : outputData.data) {
      return outputData.data.p1 + outputData.data.p2;
    }
    return void 0;
  }
  async getTotalEnergyToday() {
    const outputData = await this.getOutputData();
    if (outputData == null ? void 0 : outputData.data) {
      return outputData.data.e1 + outputData.data.e2;
    }
    return void 0;
  }
  async getTotalEnergyLifetime() {
    const outputData = await this.getOutputData();
    if (outputData == null ? void 0 : outputData.data) {
      return outputData.data.te1 + outputData.data.te2;
    }
    return void 0;
  }
  async getMaxPower() {
    const result = await this.getRequest("getMaxPower");
    return result;
  }
  async handleClientError(error) {
    if (error instanceof Error) {
      this.log.error(`Unknown error: ${error}. Stack: ${error.stack}`);
    } else {
      this.log.error(`Unknown error: ${error}`);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApSystemsEz1Client
});
//# sourceMappingURL=ApSystemsEz1Client.js.map
