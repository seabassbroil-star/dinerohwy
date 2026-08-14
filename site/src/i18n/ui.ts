import en from "./en.json";
import es from "./es.json";

export type Lang = "en" | "es";
export const defaultLang: Lang = "en";

const tables = { en, es } as const;
type Key = keyof typeof en;

/** Detect the active locale from the URL (/es/... → "es"). */
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split("/");
  return seg === "es" ? "es" : "en";
}

/** Translate a key for a given language, falling back to English. */
export function useT(lang: Lang) {
  return function t(key: Key): string {
    return (tables[lang] as Record<string, string>)[key] ?? en[key] ?? key;
  };
}

/** Prefix a path with the locale (English stays unprefixed). */
export function localizedPath(path: string, lang: Lang): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return lang === "en" ? clean : `/es${clean === "/" ? "" : clean}`;
}

/** Toggle between the English and Spanish variant of the current path. */
export function alternatePath(url: URL, lang: Lang): string {
  const path = url.pathname;
  if (lang === "en") {
    // → Spanish
    return path === "/" ? "/es" : `/es${path}`;
  }
  // → English: strip the /es prefix
  const stripped = path.replace(/^\/es(\/|$)/, "/");
  return stripped === "" ? "/" : stripped;
}
