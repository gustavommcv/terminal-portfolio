# Self-hosted fonts

`jetbrains-mono-latin.woff2` and `jetbrains-mono-latin-ext.woff2` are the
variable-weight JetBrains Mono files (v24), extracted directly from Google
Fonts and re-hosted here so the site does not depend on
`fonts.googleapis.com` / `fonts.gstatic.com` at runtime.

Google serves JetBrains Mono as a single variable-font binary per Unicode
subset — every static weight (100–900) resolves to the same file, only
`unicode-range` differs between subsets. Only the `latin` and `latin-ext`
subsets are kept, since the site is English/Brazilian Portuguese only;
`cyrillic`, `cyrillic-ext`, `greek`, and `vietnamese` were intentionally
dropped.

The declarations live in `src/styles/abstracts/_fonts.scss`.

## Refreshing

If a new weight, style, or additional subset (e.g. for another supported
language) is ever needed, regenerate the source CSS and re-extract the
`.woff2` URLs for the desired subsets from:

```text
https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..900&display=swap
```

Request it with a browser-like `User-Agent` header (curl's default UA is
served WOFF1, not WOFF2). Download the referenced files into this directory
and update the `unicode-range` values in `_fonts.scss` to match.
