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
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_ApSystemsEz1Client = require("./lib/ApSystemsEz1Client");
class ApSystemsEz1 extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "ap-systems-ez1"
    });
    this.pollIntervalInMilliSeconds = 60;
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    var _a, _b, _c;
    this.log.info("config ipAddress: " + this.config.ipAddress);
    this.log.info("config port: " + this.config.port);
    this.log.info("config pollIntervalInSeconds: " + this.config.pollIntervalInSeconds);
    if (!((_a = this.config) == null ? void 0 : _a.ipAddress) || !((_b = this.config) == null ? void 0 : _b.port) || !((_c = this.config) == null ? void 0 : _c.pollIntervalInSeconds)) {
      this.log.error("Can not start with in valid config. Please open config.");
      return;
    }
    this.pollIntervalInMilliSeconds = this.config.pollIntervalInSeconds * 1e3;
    this.apiClient = new import_ApSystemsEz1Client.ApSystemsEz1Client(this.log, this.config.ipAddress, this.config.port);
    setInterval(() => {
      this.setDeviceInfoStates();
      this.setOutputDataStates();
      this.setAlarmInfoStates();
      this.setOnOffStatusState();
      this.setMaxPowerState();
    }, this.pollIntervalInMilliSeconds);
  }
  setDeviceInfoStates() {
    this.apiClient.getDeviceInfo().then(async (deviceInfo) => {
      this.log.info(`deviceInfo: ${JSON.stringify(deviceInfo)}`);
      if (deviceInfo !== void 0) {
        const res = deviceInfo.data;
        const strings = [
          { name: "DeviceId", value: res.deviceId },
          { name: "DevVer", value: res.devVer },
          { name: "Ssid", value: res.ssid },
          { name: "IpAddr", value: res.ipAddr }
        ];
        strings.forEach(async (element) => {
          if (!await this.getStateAsync(element.name)) {
            this.createState(
              "DeviceInfo",
              "",
              element.name,
              {
                type: "string",
                role: "text",
                read: true,
                write: false
              },
              () => this.log.info(`state ${element.name} created`)
            );
          }
          await this.setStateAsync(`DeviceInfo.${element.name}`, { val: element.value, ack: true });
        });
        const numbers = [
          { name: "MaxPower", value: res.maxPower },
          { name: "MinPower", value: res.minPower }
        ];
        numbers.forEach(async (element) => {
          if (!await this.getStateAsync(element.name)) {
            this.createState(
              "DeviceInfo",
              "",
              element.name,
              {
                type: "number",
                role: "value",
                read: true,
                write: false
              },
              () => this.log.info(`state ${element.name} created`)
            );
          }
          await this.setStateAsync(`DeviceInfo.${element.name}`, { val: element.value, ack: true });
        });
      }
    });
  }
  setOutputDataStates() {
    this.apiClient.getOutputData().then(async (outputData) => {
      this.log.info(`outputData: ${JSON.stringify(outputData)}`);
      if (outputData !== void 0) {
        const res = outputData.data;
        const numbers = [
          { name: "CurrentPower_1", value: res.p1 },
          { name: "CurrentPower_2", value: res.p2 },
          { name: "CurrentPower_Total", value: res.p1 + res.p2 },
          { name: "EnergyToday_1", value: res.e1 },
          { name: "EnergyToday_2", value: res.e2 },
          { name: "EnergyToday_Total", value: res.e1 + res.e2 },
          { name: "EnergyLifetime_1", value: res.te1 },
          { name: "EnergyLifetime_2", value: res.te2 },
          { name: "EnergyLifetime_Total", value: res.te1 + res.te2 }
        ];
        numbers.forEach(async (element) => {
          if (!await this.getStateAsync(element.name)) {
            this.createState(
              "OutputData",
              "",
              element.name,
              {
                type: "number",
                role: "value",
                read: true,
                write: false
              },
              () => this.log.info(`state ${element.name} created`)
            );
          }
          await this.setStateAsync(`OutputData.${element.name}`, { val: element.value, ack: true });
        });
      }
    });
  }
  setAlarmInfoStates() {
    this.apiClient.getAlarmInfo().then(async (alarmInfo) => {
      this.log.info(`alarmInfo: ${JSON.stringify(alarmInfo)}`);
      if (alarmInfo !== void 0) {
        const res = alarmInfo.data;
        const numbers = [
          { name: "OffGrid", value: res.og },
          { name: "ShortCircuitError_1", value: res.isce1 },
          { name: "ShortCircuitError_2", value: res.isce2 },
          { name: "OutputFault", value: res.oe }
        ];
        numbers.forEach(async (element) => {
          if (!await this.getStateAsync(element.name)) {
            this.createState(
              "AlarmInfo",
              "",
              element.name,
              {
                type: "string",
                role: "text",
                read: true,
                write: false
              },
              () => this.log.info(`state ${element.name} created`)
            );
          }
          const value = element.value === "0" ? "Normal" : "Alarm";
          await this.setStateAsync(`AlarmInfo.${element.name}`, { val: value, ack: true });
        });
      }
    });
  }
  setOnOffStatusState() {
    this.apiClient.getOnOffStatus().then(async (onOffStatus) => {
      this.log.info(`onOffStatus: ${JSON.stringify(onOffStatus)}`);
      if (onOffStatus !== void 0) {
        const res = onOffStatus.data;
        if (!await this.getStateAsync("OnOffStatus")) {
          this.createState(
            "OnOffStatus",
            "",
            "OnOffStatus",
            {
              type: "string",
              role: "text",
              read: true,
              write: false
            },
            () => this.log.info(`state OnOffStatus created`)
          );
          const value = res.status === "0" ? "on" : "off";
          await this.setStateAsync(`OnOffStatus.OnOffStatus`, { val: value, ack: true });
        }
      }
    });
  }
  setMaxPowerState() {
    this.apiClient.getMaxPower().then(async (maxPower) => {
      this.log.info(`maxPower: ${JSON.stringify(maxPower)}`);
      if (maxPower !== void 0) {
        const res = maxPower.data;
        if (!await this.getStateAsync("MaxPower")) {
          this.createState(
            "MaxPower",
            "",
            "MaxPower",
            {
              type: "string",
              role: "text",
              read: true,
              write: false
            },
            () => this.log.info(`state MaxPower created`)
          );
          await this.setStateAsync(`MaxPower.MaxPower`, { val: res.maxPower, ack: true });
        }
      }
    });
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload(callback) {
    try {
      callback();
    } catch (e) {
      callback();
    }
  }
  // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
  // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
  // /**
  //  * Is called if a subscribed object changes
  //  */
  // private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
  // 	if (obj) {
  // 		// The object was changed
  // 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
  // 	} else {
  // 		// The object was deleted
  // 		this.log.info(`object ${id} deleted`);
  // 	}
  // }
  /**
   * Is called if a subscribed state changes
   */
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
  // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
  // /**
  //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
  //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
  //  */
  // private onMessage(obj: ioBroker.Message): void {
  // 	if (typeof obj === "object" && obj.message) {
  // 		if (obj.command === "send") {
  // 			// e.g. send email or pushover or whatever
  // 			this.log.info("send command");
  // 			// Send response in callback if required
  // 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
  // 		}
  // 	}
  // }
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
