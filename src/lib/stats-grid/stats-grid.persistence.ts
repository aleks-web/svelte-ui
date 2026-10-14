export const STATS_GRID_PREFERENCES_COOKIE = 'saas-stats-grid-preferences-v1';
export const STATS_GRID_PREFERENCES_CONTEXT = Symbol('stats-grid-preferences');

export type StatsGridPreferences = Readonly<Record<string, boolean>>;

export type StatsGridPreferencesContext = {
	getPreferences: () => StatsGridPreferences;
	setPreference: (storageKey: string, collapsed: boolean) => void;
};

const MAX_PREFERENCES = 64;
const MAX_KEY_LENGTH = 120;

export function parseStatsGridPreferences(rawValue?: string | null): Record<string, boolean> {
	if (!rawValue) return {};

	try {
		const parsed = JSON.parse(decodeURIComponent(rawValue)) as unknown;
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

		return Object.fromEntries(
			Object.entries(parsed)
				.filter(
					([key, value]) =>
						key.length > 0 && key.length <= MAX_KEY_LENGTH && typeof value === 'boolean'
				)
				.slice(0, MAX_PREFERENCES)
		) as Record<string, boolean>;
	} catch {
		return {};
	}
}

function readBrowserPreferences(): Record<string, boolean> {
	const cookiePrefix = `${STATS_GRID_PREFERENCES_COOKIE}=`;
	const cookieValue = document.cookie
		.split(';')
		.map((part) => part.trim())
		.find((part) => part.startsWith(cookiePrefix))
		?.slice(cookiePrefix.length);

	return parseStatsGridPreferences(cookieValue);
}

export function writeStatsGridPreference(storageKey: string, collapsed: boolean): void {
	if (!storageKey || storageKey.length > MAX_KEY_LENGTH) return;

	const preferences = readBrowserPreferences();
	preferences[storageKey] = collapsed;
	const entries = Object.entries(preferences).slice(-MAX_PREFERENCES);
	const value = encodeURIComponent(JSON.stringify(Object.fromEntries(entries)));
	const secure = window.location.protocol === 'https:' ? '; Secure' : '';

	document.cookie = `${STATS_GRID_PREFERENCES_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}
