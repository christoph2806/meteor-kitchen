const hasSpace = /\s/;
const hasSeparator = /[\W_]/;
const hasCamel = /([a-z][A-Z]|[A-Z][a-z])/;

/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param string The input string.
 * @return The transformed string in no case.
 */
export function toNoCase(string: string): string {
  if (hasSpace.test(string)) return string.toLowerCase();
  if (hasSeparator.test(string)) return (unseparate(string) || string).toLowerCase();
  if (hasCamel.test(string)) return uncamelize(string).toLowerCase();
  return string.toLowerCase();
}

/**
 * Separator splitter.
 */
const separatorSplitter = /[\W_]+(.|$)/g;

/**
 * Un-separate a `string`.
 *
 * @param string The input string.
 * @return The un-separated string.
 */
function unseparate(string: string): string {
  return string.replace(separatorSplitter, (_, next) => {
    return next ? ' ' + next : '';
  });
}

/**
 * Camelcase splitter.
 */
const camelSplitter = /(.)([A-Z]+)/g;

/**
 * Un-camelcase a `string`.
 *
 * @param string The input string.
 * @return The un-camelcased string.
 */
function uncamelize(string: string): string {
  return string.replace(camelSplitter, (_, previous, uppers) => {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}

/**
 * Convert a string to space case.
 *
 * @param string The input string.
 * @return The space-cased string.
 */
export function toSpaceCase(string: string): string {
  return toNoCase(string)
    .replace(/[\W_]+(.|$)/g, (_, match) => {
      return match ? ' ' + match : '';
    })
    .trim();
}

/**
 * Convert a string to camel case.
 *
 * @param string The input string.
 * @return The camel-cased string.
 */
export function toCamelCase(string: string): string {
  return toSpaceCase(string).replace(/\s(\w)/g, (_, letter) => {
    return letter.toUpperCase();
  });
}

/**
 * Convert a string to snake case.
 *
 * @param string The input string.
 * @return The snake-cased string.
 */
export function toSnakeCase(string: string): string {
  return toSpaceCase(string).replace(/\s/g, '_');
}

/**
 * Convert a string to kebab case.
 *
 * @param string The input string.
 * @return The kebab-cased string.
 */
export function toKebabCase(string: string): string {
  return toSpaceCase(string).replace(/\s/g, '-');
}

/**
 * Convert a string to title case.
 *
 * @param string The input string.
 * @return The title-cased string.
 */
export function toTitleCase(string: string): string {
  let str = toSpaceCase(string).replace(/\s(\w)/g, (_, letter) => {
    return " " + letter.toUpperCase();
  });

  if (str) {
    str = str.charAt(0).toUpperCase() + str.slice(1);
  }
  return str;
}
