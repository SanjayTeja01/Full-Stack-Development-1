import { HttpError } from "./errors.js";

export const UNITS = ["kg", "quintal"];

export function text(value, field, min, max) {
  if (typeof value !== "string") throw new HttpError(400, `${field} is required.`);
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new HttpError(400, `${field} must be ${min} to ${max} characters.`);
  }
  return trimmed;
}

/** Whole numbers only: prices are whole rupees and quantities are whole units. */
export function positiveWhole(value, field, max = 1_000_000) {
  if (!Number.isInteger(value) || value <= 0 || value > max) {
    throw new HttpError(400, `${field} must be a whole number between 1 and ${max}.`);
  }
  return value;
}

export function oneOf(value, field, allowed) {
  if (!allowed.includes(value)) throw new HttpError(400, `${field} must be one of: ${allowed.join(", ")}.`);
  return value;
}
