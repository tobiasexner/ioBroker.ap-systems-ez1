/*
 * Created with @iobroker/create-adapter v2.5.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";
import { ApSystemsEz1Client } from "./lib/ApSystemsEz1Client";

// Load your modules here, e.g.:
// import * as fs from "fs";

class ApSystemsEz1 extends utils.Adapter {

	private pollIntervalInMilliSeconds: number = 60;
	private apiClient!: ApSystemsEz1Client;

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: "ap-systems-ez1",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		this.log.info("config ipAddress: " + this.config.ipAddress);
		this.log.info("config port: " + this.config.port);
		this.log.info("config pollIntervalInSeconds: " + this.config.pollIntervalInSeconds);

		if (!this.config?.ipAddress || !this.config?.port || !this.config?.pollIntervalInSeconds) {
			this.log.error("Can not start with in valid config. Please open config.");
			return;
		}

		this.pollIntervalInMilliSeconds = this.config.pollIntervalInSeconds * 1000;
		this.apiClient = new ApSystemsEz1Client(this.log, this.config.ipAddress, this.config.port);

		setInterval(() => {
			this.setDeviceInfoStates();
			this.setOutputDataStates();
			this.setAlarmInfoStates();
			this.setOnOffStatusState();
			this.setMaxPowerState();
		}, this.pollIntervalInMilliSeconds); // poll every <60> seconds


		// // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		// this.subscribeStates("testVariable");
		// // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// // this.subscribeStates("lights.*");
		// // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// // this.subscribeStates("*");

		// /*
		// 	setState examples
		// 	you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		// */
		// // the variable testVariable is set to true as command (ack=false)
		// await this.setStateAsync("testVariable", true);

		// // same thing, but the value is flagged "ack"
		// // ack should be always set to true if the value is received from or acknowledged from the target system
		// await this.setStateAsync("testVariable", { val: true, ack: true });

		// // same thing, but the state is deleted after 30s (getState will return null afterwards)
		// await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });
	}

	private setDeviceInfoStates() : void {
		this.apiClient.getDeviceInfo().then(async (deviceInfo) => {
			this.log.info(`deviceInfo: ${JSON.stringify(deviceInfo)}`);

			if (deviceInfo !== undefined) {
				const res = deviceInfo.data;
				const strings = [
					{ name: "DeviceId", value: res.deviceId },
					{ name: "DevVer", value: res.devVer },
					{ name: "Ssid", value: res.ssid },
					{ name: "IpAddr", value: res.ipAddr }
				];

				strings.forEach(async (element) => {
					if (!(await this.getStateAsync(element.name))) {
						this.createState("DeviceInfo", "", element.name,
							{
								type: "string",
								role: "text",
								read: true,
								write: false
							}, () => this.log.info(`state ${element.name} created`));
					}
					await this.setStateAsync(`DeviceInfo.${element.name}`, { val: element.value, ack: true });
				});

				const numbers = [
					{ name: "MaxPower", value: res.maxPower },
					{ name: "MinPower", value: res.minPower }
				];

				numbers.forEach(async (element) => {
					if (!(await this.getStateAsync(element.name))) {
						this.createState("DeviceInfo", "", element.name,
							{
								type: "number",
								role: "value",
								read: true,
								write: false
							}, () => this.log.info(`state ${element.name} created`));
					}
					await this.setStateAsync(`DeviceInfo.${element.name}`, { val: element.value, ack: true });
				});
			}
		});
	}

	private setOutputDataStates() : void {
		this.apiClient.getOutputData().then(async (outputData) => {
			this.log.info(`outputData: ${JSON.stringify(outputData)}`);

			if (outputData !== undefined) {
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
					{ name: "EnergyLifetime_Total", value: res.te1 + res.te2 },
				];

				numbers.forEach(async (element) => {
					if (!(await this.getStateAsync(element.name))) {
						this.createState("OutputData", "", element.name,
							{
								type: "number",
								role: "value",
								read: true,
								write: false
							}, () => this.log.info(`state ${element.name} created`));
					}
					await this.setStateAsync(`OutputData.${element.name}`, { val: element.value, ack: true });
				});
			}
		});
	}

	private setAlarmInfoStates() : void {
		this.apiClient.getAlarmInfo().then(async (alarmInfo) => {
			this.log.info(`alarmInfo: ${JSON.stringify(alarmInfo)}`);

			if (alarmInfo !== undefined) {
				const res = alarmInfo.data;
				const numbers = [
					{ name: "OffGrid", value: res.og },
					{ name: "ShortCircuitError_1", value: res.isce1 },
					{ name: "ShortCircuitError_2", value: res.isce2 },
					{ name: "OutputFault", value: res.oe },
				];

				numbers.forEach(async (element) => {
					if (!(await this.getStateAsync(element.name))) {
						this.createState("AlarmInfo", "", element.name,
							{
								type: "string",
								role: "text",
								read: true,
								write: false
							}, () => this.log.info(`state ${element.name} created`));
					}

					const value = element.value === "0" ? "Normal" : "Alarm";
					await this.setStateAsync(`AlarmInfo.${element.name}`, { val: value, ack: true });
				});
			}
		});
	}

	private setOnOffStatusState() : void {
		this.apiClient.getOnOffStatus().then(async (onOffStatus) => {
			this.log.info(`onOffStatus: ${JSON.stringify(onOffStatus)}`);

			if (onOffStatus !== undefined) {
				const res = onOffStatus.data;
				if (!(await this.getStateAsync("OnOffStatus"))) {
					this.createState("OnOffStatus", "", "OnOffStatus",
						{
							type: "string",
							role: "text",
							read: true,
							write: false
						}, () => this.log.info(`state OnOffStatus created`));
					const value = res.status === "0" ? "on" : "off";
					await this.setStateAsync(`OnOffStatus.OnOffStatus`, { val: value, ack: true });
				}
			}
		});
	}

	private setMaxPowerState() : void {
		this.apiClient.getMaxPower().then(async (maxPower) => {
			this.log.info(`maxPower: ${JSON.stringify(maxPower)}`);

			if (maxPower !== undefined) {
				const res = maxPower.data;
				if (!(await this.getStateAsync("MaxPower"))) {
					this.createState("MaxPower", "", "MaxPower",
						{
							type: "string",
							role: "text",
							read: true,
							write: false
						}, () => this.log.info(`state MaxPower created`));
					await this.setStateAsync(`MaxPower.MaxPower`, { val: res.maxPower, ack: true });
				}
			}
		});
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

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
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
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

	private async handleClientError(error: unknown): Promise<void> {
		if (error instanceof Error) {
			this.log.error(`Unknown error: ${error}. Stack: ${error.stack}`)
		} else {
			this.log.error(`Unknown error: ${error}`)
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new ApSystemsEz1(options);
} else {
	// otherwise start the instance directly
	(() => new ApSystemsEz1())();
}