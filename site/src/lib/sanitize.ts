// Strict, allowlist-based input sanitizing for the "Text me" lead form.
// Pure — no I/O — so it can be reused server-side (the authoritative check in
// /api/text-me) and unit-reasoned in isolation. The rule set is intentionally
// narrow: letters + single spaces for names/messages, exactly 10 digits for
// phones. Anything else (symbols, punctuation, accents, emoji, control chars,
// newlines) is stripped, never interpreted. Client-side attributes are only UX;
// this module is what actually decides what a submission is allowed to contain.

export const LIMITS = {
  nameMin: 2,
  nameMax: 60,
  phoneLen: 10,
  messageMin: 3,
  messageMax: 600,
} as const;

/**
 * Reduce a string to letters and single spaces.
 * NFKC-normalize first so lookalike/compatibility forms can't smuggle symbols
 * past the allowlist, then drop everything outside [A-Za-z ], collapse runs of
 * whitespace (this also removes any CR/LF), and trim the ends.
 */
export function lettersOnly(input: unknown): string {
  const s = typeof input === "string" ? input : "";
  return s
    .normalize("NFKC")
    .replace(/[^A-Za-z ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Reduce a string to its digits only (drops spaces, dashes, parens, +, etc.). */
export function digitsOnly(input: unknown): string {
  const s = typeof input === "string" ? input : "";
  return s.replace(/\D+/g, "");
}

/**
 * Permissive-but-bounded cleaner for free text that will be fed to an AI prompt
 * (business names, short descriptions). Allows letters, numbers, spaces and safe
 * punctuation; strips control chars, angle brackets, and anything exotic; caps
 * length. Not for email headers/HTML — those use the stricter allowlists above.
 */
export function safeText(input: unknown, maxLen = 120): string {
  const s = typeof input === "string" ? input : "";
  return s
    .normalize("NFKC")
    .replace(/[<>]/g, " ") // no angle brackets (prompt/HTML hygiene)
    .replace(/[^\p{L}\p{N} .,'&\-!?()/]/gu, " ") // letters/numbers + safe punctuation
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

// --- Contact form v2 (name + phone OR email + situation message) ---

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Message allowlist: letters, digits, spaces, and basic punctuation. Wider than
 * lettersOnly (people write "need it by June 15, budget 500") but still bans
 * <>, symbols, emoji, newlines, and control chars.
 */
export function messageText(input: unknown, maxLen = 600): string {
  const s = typeof input === "string" ? input : "";
  return s
    .normalize("NFKC")
    .replace(/[^A-Za-z0-9 .,'\-!?()/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

export interface ContactLeadInput {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  message?: unknown;
}

export interface ContactLeadClean {
  name: string;
  phone: string; // "" or exactly 10 digits
  email: string; // "" or a validated, lowercased address
  message: string;
}

export interface ContactValidationResult {
  ok: boolean;
  errors: string[];
  clean: ContactLeadClean;
}

/**
 * Authoritative validation for the contact form. Name + message required;
 * phone and email each optional BUT at least one must be present and valid.
 * Every field is allowlist-sanitized; the email must match a strict regex
 * (which also makes CR/LF header injection impossible).
 */
export interface ContactValidateOpts {
  /** Require name, phone AND email all present (the AI gate). Default: phone-OR-email. */
  requireAll?: boolean;
  /** Skip the message requirement (the AI gate collects business fields separately). */
  skipMessage?: boolean;
}

export function validateContactLead(
  input: ContactLeadInput,
  opts: ContactValidateOpts = {},
): ContactValidationResult {
  const errors: string[] = [];

  const name = lettersOnly(input.name).slice(0, LIMITS.nameMax);
  const message = messageText(input.message);

  const phoneRaw = digitsOnly(input.phone);
  const phone = /^\d{10}$/.test(phoneRaw) ? phoneRaw : "";

  const emailRaw = (typeof input.email === "string" ? input.email : "").trim().toLowerCase();
  const email = EMAIL_RE.test(emailRaw) && emailRaw.length <= 254 ? emailRaw : "";

  if (name.length < LIMITS.nameMin) {
    errors.push("Please enter your name using letters only.");
  }
  if ((phoneRaw || opts.requireAll) && !phone) {
    errors.push("Enter a 10-digit phone number.");
  }
  if ((emailRaw || opts.requireAll) && !email) {
    errors.push("Enter a valid email address.");
  }
  if (!opts.requireAll && !phone && !email) {
    errors.push("Give me at least one way to reach you — a phone number or an email.");
  }
  if (!opts.skipMessage && message.replace(/\s/g, "").length < LIMITS.messageMin) {
    errors.push("Tell me a little about your situation.");
  }

  return { ok: errors.length === 0, errors, clean: { name, phone, email, message } };
}

export interface TextLeadInput {
  name?: unknown;
  phone?: unknown;
  message?: unknown;
}

export interface TextLeadClean {
  name: string;
  phone: string; // exactly 10 digits
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  clean: TextLeadClean;
}

/**
 * Authoritative validation for a text-me submission. Sanitizes each field to its
 * allowlist, enforces length/format rules, and reports every failure. Inputs are
 * truncated to their max BEFORE the empty/length checks so an oversized payload
 * can't be used to probe or to slip past a bound.
 */
export function validateTextLead(input: TextLeadInput): ValidationResult {
  const errors: string[] = [];

  const name = lettersOnly(input.name).slice(0, LIMITS.nameMax);
  const message = lettersOnly(input.message).slice(0, LIMITS.messageMax);
  const phone = digitsOnly(input.phone).slice(0, LIMITS.phoneLen + 4); // room to detect "too long"

  if (name.length < LIMITS.nameMin) {
    errors.push("Please enter your name using letters only.");
  }
  if (!/^\d{10}$/.test(phone)) {
    errors.push("Please enter a 10-digit phone number.");
  }
  if (message.replace(/\s/g, "").length < LIMITS.messageMin) {
    errors.push("Please tell us how we can help, using letters only.");
  }

  return {
    ok: errors.length === 0,
    errors,
    clean: { name, phone: phone.slice(0, LIMITS.phoneLen), message },
  };
}
