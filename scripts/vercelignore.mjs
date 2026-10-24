/**
 * Minimal .vercelignore matcher (gitignore syntax), no dependencies.
 *
 * Used by scripts/check-r2-coverage.mjs to work out which files under
 * public/ Vercel would deploy. Supports what gitignore supports and this repo
 * uses: comments, blank lines, `!` negation, anchored patterns (a `/` before
 * the last character), directory patterns (trailing `/`), `*`, `?`, `[...]`
 * and `**`. A file under an ignored directory stays ignored, as in git.
 *
 * Checked against `git check-ignore` on every file under public/ (see the
 * design job notes for t_e1d348db).
 */

import fs from 'fs';

function globToRegex(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        const before = i === 0 || glob[i - 1] === '/';
        const after = i + 2 === glob.length || glob[i + 2] === '/';
        if (before && after) {
          if (i + 2 === glob.length) re += '.*';          // trailing /** : everything inside
          else { re += '(?:.*/)?'; i += 1; }               // **/ : zero or more dirs
          i += 1;
          continue;
        }
      }
      re += '[^/]*';
    } else if (c === '?') {
      re += '[^/]';
    } else if (c === '[') {
      const end = glob.indexOf(']', i + 1);
      if (end === -1) { re += '\\['; continue; }
      let cls = glob.slice(i + 1, end);
      if (cls.startsWith('!')) cls = '^' + cls.slice(1);
      re += `[${cls.replace(/\\/g, '\\\\')}]`;
      i = end;
    } else if (c === '\\' && i + 1 < glob.length) {
      re += glob[++i].replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    } else {
      re += c.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    }
  }
  return re;
}

export function parseIgnore(text) {
  const rules = [];
  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.replace(/(?<!\\)\s+$/, '');
    if (!line || line.startsWith('#')) continue;
    let negate = false;
    if (line.startsWith('!')) { negate = true; line = line.slice(1); }
    else if (line.startsWith('\\!') || line.startsWith('\\#')) line = line.slice(1);
    let dirOnly = false;
    if (line.endsWith('/')) { dirOnly = true; line = line.slice(0, -1); }
    const anchored = line.includes('/');
    if (line.startsWith('/')) line = line.slice(1);
    const body = globToRegex(line);
    const regex = new RegExp(anchored ? `^${body}$` : `^(?:.*/)?${body}$`);
    rules.push({ negate, dirOnly, regex, source: rawLine });
  }
  return rules;
}

/** Last matching rule wins for one path. Returns true, false or null (no rule). */
function verdict(rules, relPath, isDir) {
  let result = null;
  for (const r of rules) {
    if (r.dirOnly && !isDir) continue;
    if (r.regex.test(relPath)) result = !r.negate;
  }
  return result;
}

/** relPath is repo-relative with forward slashes, e.g. public/images/a.jpg */
export function isIgnored(rules, relPath) {
  const parts = relPath.split('/');
  for (let i = 1; i < parts.length; i++) {
    if (verdict(rules, parts.slice(0, i).join('/'), true) === true) return true;
  }
  return verdict(rules, relPath, false) === true;
}

export function loadIgnore(file) {
  return fs.existsSync(file) ? parseIgnore(fs.readFileSync(file, 'utf8')) : [];
}
