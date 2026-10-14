import type { RadioGroup } from 'melt/builders';

export type RadioGroupContext = {
	group: RadioGroup;
};

export const RADIO_GROUP_CONTEXT = Symbol('saas-radio-group');
