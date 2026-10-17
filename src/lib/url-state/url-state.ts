export type UrlStateHistory = "push" | "replace";

export type UrlStateNavigateOptions = {
  history: UrlStateHistory;
  keepFocus: boolean;
  noScroll: boolean;
};

export type UrlStateAdapter = {
  getUrl: () => URL;
  navigate: (
    url: URL,
    options: UrlStateNavigateOptions,
  ) => void | Promise<void>;
};

export type UrlStatePatchValue =
  string | number | boolean | readonly string[] | null | undefined;

export type UrlStatePatch = Record<string, UrlStatePatchValue>;

export type UrlOverlay = {
  kind: string;
  id: string;
};

export type UrlStateWriteOptions = {
  history?: UrlStateHistory;
  keepFocus?: boolean;
  noScroll?: boolean;
};

export type UrlStateController = ReturnType<typeof createUrlState>;

function cloneCurrentUrl(adapter: UrlStateAdapter): URL {
  return new URL(adapter.getUrl().toString());
}

function validOverlayPart(value: string): boolean {
  return /^[A-Za-z0-9._~-]+$/.test(value);
}

export function parseUrlOverlay(value: string): UrlOverlay | null {
  const separator = value.indexOf(":");
  if (separator <= 0 || separator === value.length - 1) return null;
  const kind = value.slice(0, separator);
  const id = value.slice(separator + 1);
  return validOverlayPart(kind) && validOverlayPart(id) ? { kind, id } : null;
}

export function serializeUrlOverlay(overlay: UrlOverlay): string {
  if (!validOverlayPart(overlay.kind) || !validOverlayPart(overlay.id)) {
    throw new Error(
      "Overlay kind and id may contain only URL-safe identifier characters.",
    );
  }
  return `${overlay.kind}:${overlay.id}`;
}

export function createUrlState(adapter: UrlStateAdapter) {
  function getString(
    key: string,
    fallback = "",
    allowed?: readonly string[],
  ): string {
    const value = adapter.getUrl().searchParams.get(key);
    if (value === null || (allowed && !allowed.includes(value)))
      return fallback;
    return value;
  }

  function getStrings(key: string): string[] {
    return adapter.getUrl().searchParams.getAll(key);
  }

  function getBoolean(key: string, fallback = false): boolean {
    const value = adapter.getUrl().searchParams.get(key);
    if (value === null) return fallback;
    if (["1", "true", "yes"].includes(value)) return true;
    if (["0", "false", "no"].includes(value)) return false;
    return fallback;
  }

  function getNumber(
    key: string,
    fallback: number,
    options: { min?: number; max?: number; integer?: boolean } = {},
  ): number {
    const value = Number(adapter.getUrl().searchParams.get(key));
    if (!Number.isFinite(value)) return fallback;
    const normalized = options.integer === false ? value : Math.trunc(value);
    if (options.min !== undefined && normalized < options.min) return fallback;
    if (options.max !== undefined && normalized > options.max) return fallback;
    return normalized;
  }

  function overlays(key = "overlay"): UrlOverlay[] {
    return getStrings(key)
      .map(parseUrlOverlay)
      .filter((overlay): overlay is UrlOverlay => overlay !== null);
  }

  function update(
    patch: UrlStatePatch,
    options: UrlStateWriteOptions = {},
  ): void | Promise<void> {
    const url = cloneCurrentUrl(adapter);
    for (const [key, value] of Object.entries(patch)) {
      url.searchParams.delete(key);
      if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === false
      )
        continue;
      const values = Array.isArray(value)
        ? value
        : [value === true ? "1" : String(value)];
      for (const item of values) {
        if (item !== "") url.searchParams.append(key, item);
      }
    }
    return adapter.navigate(url, {
      history: options.history ?? "replace",
      keepFocus: options.keepFocus ?? true,
      noScroll: options.noScroll ?? true,
    });
  }

  function setOverlays(
    next: readonly UrlOverlay[],
    options: UrlStateWriteOptions & { key?: string } = {},
  ): void | Promise<void> {
    return update(
      { [options.key ?? "overlay"]: next.map(serializeUrlOverlay) },
      options,
    );
  }

  function openOverlay(
    overlay: UrlOverlay,
    options: UrlStateWriteOptions & {
      key?: string;
      reset?: boolean;
      replaceKinds?: readonly string[];
    } = {},
  ): void | Promise<void> {
    const key = options.key ?? "overlay";
    const replaceKinds = new Set([
      overlay.kind,
      ...(options.replaceKinds ?? []),
    ]);
    const stack = options.reset
      ? []
      : overlays(key).filter((item) => !replaceKinds.has(item.kind));
    stack.push(overlay);
    return setOverlays(stack, {
      ...options,
      key,
      history: options.history ?? "push",
    });
  }

  function closeOverlay(
    kind?: string,
    options: UrlStateWriteOptions & { key?: string } = {},
  ): void | Promise<void> {
    const key = options.key ?? "overlay";
    const stack = overlays(key);
    const index = kind
      ? stack.map((overlay) => overlay.kind).lastIndexOf(kind)
      : stack.length - 1;
    if (index < 0) return;
    return setOverlays(stack.slice(0, index), {
      ...options,
      key,
      history: options.history ?? "replace",
    });
  }

  return {
    getString,
    getStrings,
    getBoolean,
    getNumber,
    overlays,
    update,
    setOverlays,
    openOverlay,
    closeOverlay,
  };
}
