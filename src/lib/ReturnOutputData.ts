// Information about energy/power-related information
export interface ReturnOutputData {
	// Power output status of inverter input 1
	p1: number;

	// Energy reading for inverter input 1
	e1: number;

	// Total energy for inverter input 1
	te1: number;

	// Power output status of inverter input 2
	p2: number;

	// Energy reading for inverter input 2
	e2: number;

	// Total energy for inverter input 2
	te2: number;
}
