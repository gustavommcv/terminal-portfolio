// Turns the `headers` rules of vercel.json into Build Output API routes.
//
// vercel.json stays the one place where the response headers are written down;
// `create-build-output.mjs` reads them from there. A rule's `source` is
// path-to-regexp on Vercel, which this does not implement in full: a source may
// contain literal text and (regular expression groups), nothing else. Anything
// that would need real path-to-regexp (`:param`, `*`, `+`, `?`) fails loudly
// instead of becoming a route that quietly matches the wrong files.

export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, (character) => `\\${character}`);
}

/** Returns the index of the `)` that closes the `(` at `start`. */
function closingParenthesis(source, start) {
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === '\\') {
      index += 1;
    } else if (source[index] === '(') {
      depth += 1;
    } else if (source[index] === ')') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }
  throw new Error(`header source "${source}" has a "(" that is never closed`);
}

/** `/((?:chunk|main)-[a-z]+\.js)` -> `^/((?:chunk|main)-[a-z]+\.js)$` */
export function sourceToRegExp(source) {
  if (!source.startsWith('/')) {
    throw new Error(`header source "${source}" must start with "/"`);
  }

  let pattern = '';
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (character === '(') {
      const end = closingParenthesis(source, index);
      pattern += source.slice(index, end + 1);
      index = end;
    } else if (':*+?{}'.includes(character)) {
      throw new Error(
        `header source "${source}": "${character}" outside a (group) is path-to-regexp syntax that create-build-output does not translate. Put it inside a group or extend scripts/lib/header-routes.mjs.`,
      );
    } else {
      pattern += escapeRegExp(character);
    }
  }

  return `^${pattern}$`;
}

/** The `headers` array of vercel.json -> Build Output routes that let the request go on to the next route. */
export function headerRoutes(rules = []) {
  return rules.map((rule) => {
    if (rule.has || rule.missing) {
      throw new Error(
        `header source "${rule.source}" uses has/missing, which create-build-output does not support.`,
      );
    }

    return {
      src: sourceToRegExp(rule.source),
      headers: Object.fromEntries(rule.headers.map(({ key, value }) => [key, value])),
      continue: true,
    };
  });
}

/** Every header a request for `path` gets: the matching rules are applied in order, a later value replacing an earlier one. */
export function headersFor(routes, path) {
  const headers = {};
  for (const route of routes) {
    if (new RegExp(route.src).test(path)) {
      Object.assign(headers, route.headers);
    }
  }
  return headers;
}
