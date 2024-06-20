// This file extends the AdapterConfig type from "@types/iobroker"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
	namespace ioBroker {
		interface AdapterConfig {
			ipAddress: string;
			port: number;
			pollIntervalInSeconds: number;
			ignoreConnectionErrorMessages: boolean;
		}
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};