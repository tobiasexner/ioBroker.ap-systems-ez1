// Information about possible point of failures
export interface ReturnAlarmInfo {
	// Off-Grid Status (normal/0 when okay)
	og: string;

	// DC 1 Short Circuit Error status (normal/0 when okay)
	isce1: string;

	// DC 2 Short Circuit Error status (normal/0 when okay)
	isce2: string;

	// Output fault status (normal/0 when okay)
	oe: string;
}
