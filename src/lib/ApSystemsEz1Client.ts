import axios, { AxiosResponse } from "axios";
import { ReturnAlarmInfo } from "./ReturnAlarmInfo";
import { ReturnDeviceInfo } from "./ReturnDeviceInfo";
import { ReturnOutputData } from "./ReturnOutputData";
import { TypedReturnDto } from "./TypedReturnDto";
import { ReturnOnOffStatus } from "./ReturnOnOffStatus";
import { ReturnMaxPower } from "./ReturnMaxPower";

export class ApSystemsEz1Client {
	private baseUrl: string | undefined;
	private log!: ioBroker.Logger;

	constructor(logger : ioBroker.Logger, ipAddress: string, port: number) {
		this.log = logger;
		this.baseUrl = `http://${ipAddress}:${port}`;
	}


	/**
	 * A private method to send HTTP requests to the specified endpoint of the microinverter.
	 * This method is used internally by other class methods to perform GET requests.
	 * @param endpoint - The API endpoint to make the request to.
	 * @returns The JSON response from the microinverter as a dictionary.
	 * Prints an error message if the HTTP request fails for any reason.
 	 */
	private async getRequest<TResult>(endpoint: string): Promise<TResult | undefined> {
		try {
			const url: string = `${this.baseUrl}/${endpoint}`;
			this.log.info(`url: ${url}`)

			const response: AxiosResponse = await axios.get(url);

			// Handle the response data
			this.log.info(`Response: ${JSON.stringify(response.data)}`);
			if (response.status !== 200) {
				this.handleClientError(response.statusText);
			} else {
				const result: TResult = response.data as TResult;
				return result;
			}
		} catch (error) {
			// Handle any errors that occurred during the request
			await this.handleClientError(error);
		}
	}

	/**
	 * Retrieves detailed information about the device. This method sends a request to the
	 * "getDeviceInfo" endpoint and returns a dictionary containing various details about the device.
	 * @returns The returned data includes the device ID, device version, the SSID it is connected to, its IP
	 *  address, and its minimum and maximum power settings. This information can be used for monitoring
	 *  and configuring the device.
	 */
	public async getDeviceInfo(): Promise<TypedReturnDto<ReturnDeviceInfo> | undefined> {
		const result: TypedReturnDto<ReturnDeviceInfo> | undefined = await this.getRequest<TypedReturnDto<ReturnDeviceInfo>>("getDeviceInfo");
		return result;
	}

	/**
	 * Retrieves the alarm status information for various components of the device. This method
	 * makes a request to the "getAlarm" endpoint and returns a dictionary containing the alarm
	 * status for different parameters.
	 *
	 * @returns The 'data' field in the returned dictionary includes the status of several components,
	 * each represented as a string indicating whether there is an alarm ('1') or normal operation ('0').
	 */
	public async getAlarmInfo(): Promise<TypedReturnDto<ReturnAlarmInfo> | undefined> {
		const result: TypedReturnDto<ReturnAlarmInfo> | undefined = await this.getRequest<TypedReturnDto<ReturnAlarmInfo>>("getAlarm");
		return result;
	}

	/**
	 * Retrieves the On/Off of EZ1 device.
	 *
	 * @returns The 'data' field in the returned dictionary includes the status of the device.
	 * "0" means on, "1" means off.
	 */
	public async getOnOffStatus(): Promise<TypedReturnDto<ReturnOnOffStatus> | undefined> {
		const result: TypedReturnDto<ReturnOnOffStatus> | undefined = await this.getRequest<TypedReturnDto<ReturnOnOffStatus>>("getOnOff");
		return result;
	}


	/**
	 * Retrieves the current output data for the device. This method
	 * makes a request to the "getOutputData" endpoint to fetch the device's output data.
	 *
	 * @returns The returned data includes various parameters such as power output status ('p1', 'p2'),
	 * energy readings ('e1', 'e2'), and total energy ('te1', 'te2') for two different inputs
	 * of the inverter. Additionally, it provides a status message and the device ID.
	 */
	public async getOutputData(): Promise<TypedReturnDto<ReturnOutputData> | undefined> {
		const result: TypedReturnDto<ReturnOutputData> | undefined = await this.getRequest<TypedReturnDto<ReturnOutputData>>("getOutputData");
		return result;
	}

	/**
	 * Retrieves and calculates the combined power output status of inverter inputs 1 and 2.
	 * This method first calls getOutputData() to fetch the output data from the device, which
	 * includes individual power output values for 'p1' and 'p2'. It then sums these values to
	 * provide the total combined power output.
	 * @returns The total sum of power output values 'p1' and 'p2' as a number.
	 */
	public async getTotalOutput(): Promise<number | undefined> {
		const outputData: TypedReturnDto<ReturnOutputData> | undefined = await this.getOutputData();
		if (outputData?.data) {
			return outputData.data.p1 + outputData.data.p2;
		}
		return undefined;
	}

	/**
	 * Retrieves and calculates the total energy generated today by both inverter inputs, 1 and 2.
	 * This method first calls getOutputData() to fetch the output data from the device, which
	 * includes individual energy readings for 'e1' and 'e2', each representing the energy in
	 * kilowatt-hours (kWh) generated by the respective inverter inputs.
	 * @returns The total sum of power output values 'e1' and 'e2' as a number.
	 */
	public async getTotalEnergyToday(): Promise<number | undefined> {
		const outputData: TypedReturnDto<ReturnOutputData> | undefined = await this.getOutputData();
		if (outputData?.data) {
			return outputData.data.e1 + outputData.data.e2;
		}
		return undefined;
	}

	/**
	 * Retrieves and calculates the total lifetime energy generated by both inverter inputs 1 and 2.
	 * This method first calls getOutputData() to fetch the output data from the device, which
	 * includes individual lifetime energy readings for 'te1' and 'te2'. Each of these values
	 * represents the total lifetime energy generated by the respective inverter inputs, reported
	 * in kilowatt-hours (kWh).
	 * @returns The total sum of power output values 'te1' and 'te2' as a number.
	 */
	public async getTotalEnergyLifetime(): Promise<number | undefined> {
		const outputData: TypedReturnDto<ReturnOutputData> | undefined = await this.getOutputData();
		if (outputData?.data) {
			return outputData.data.te1 + outputData.data.te2;
		}
		return undefined;
	}

	/**
	 * Retrieves the set maximum power setting of the device. This method makes a request to the
	 * "getMaxPower" endpoint and returns a dictionary containing the maximum power limit of the device set by the user.
	 * @returns Max output power in watts
	 */
	public async getMaxPower(): Promise<TypedReturnDto<ReturnMaxPower> | undefined> {
		const result: TypedReturnDto<ReturnMaxPower> | undefined = await this.getRequest<TypedReturnDto<ReturnMaxPower>>("getMaxPower");
		return result;
	}

	private async handleClientError(error: unknown): Promise<void> {
	    if (error instanceof Error) {
			this.log.error(`Unknown error: ${error}. Stack: ${error.stack}`)
		} else {
			this.log.error(`Unknown error: ${error}`)
		}
	}
}