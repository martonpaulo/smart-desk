// Options for formatting an error message
export interface ErrorMessageOptions {
  prefix?: string; // text to prepend when an error exists
  error?: unknown; // any thrown value or error object
}

// Public function to get a user-friendly message
export function displayError(options: ErrorMessageOptions): string {
  const { prefix = '', error } = options;

  // No error provided, return prefix or empty
  let errorMessage = prefix || '';

  if (error != null) {
    // Merge prefix and core message when prefix is present
    const coreMessage = deriveErrorText(error).trim();
    errorMessage = prefix ? `${prefix}: ${coreMessage}` : coreMessage;
  }

  console.error(errorMessage);
  return errorMessage;
}

// Convert various error types into a string
function deriveErrorText(value: unknown): string {
  // plain string
  if (typeof value === 'string') {
    return value;
  }

  // native Error instance
  if (value instanceof Error) {
    return value.message;
  }

  // plain object (not null, not array)
  if (isPlainObject(value)) {
    try {
      return JSON.stringify(value);
    } catch {
      // circular or unparsable object
      return String(value);
    }
  }

  // numbers, booleans, symbols, functions, etc
  return String(value);
}

// Check for a simple object (excludes arrays, null, class instances)
function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    !Array.isArray(obj) &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
}
