import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

// Path resolution: this test file lives at `src/lib/`, so the workflows dir
// is two levels up. Avoid `__dirname` ambiguities in vitest's CJS/ESM modes
// by using `import.meta.url` for the source-of-truth.
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const WORKFLOWS_DIR = path.resolve(HERE, "..", "..", ".github", "workflows");

// Find a top-level `permissions:` block (column-0) and the lines that
// belong to its body, stopping at the next top-level key.
function findTopLevelPermissions(
  raw: string,
): { bodyLines: string[] } {
  const lines = raw.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!/^permissions:/.test(lines[i])) continue;
    const bodyLines: string[] = [];
    for (let j = i + 1; j < lines.length; j++) {
      // Comments don't break the body — they sit at any indent.
      if (/^\s*#/.test(lines[j])) continue;
      // A non-indented, non-comment line means we've left the `permissions:`
      // map (it's the next top-level key, e.g. `concurrency:`).
      if (/^[^\s]/.test(lines[j])) break;
      // Empty lines terminate the body conservatively.
      if (lines[j].trim() === "") break;
      bodyLines.push(lines[j]);
    }
    return { bodyLines };
  }
  throw new Error("`permissions:` block (column 0) not found");
}

// Extract the permission scope names from the body's "<key>: <level>" lines.
function permissionKeys(raw: string): string[] {
  return findTopLevelPermissions(raw).bodyLines
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"))
    .map((l) => l.split(":")[0].trim());
}

// Capture every comment line that appears before the `permissions:` key —
// that's the audit-parity header block.
function permissionsHeaderComments(raw: string): string {
  // `/m` matches `permissions:` at the start of any line. Handles both
  // `permissions:` (block form) and the no-trailing-newline case uniformly.
  const m = /^permissions:/m.exec(raw);
  if (!m) throw new Error("`permissions:` not found at column 0");
  return raw
    .slice(0, m.index)
    .split("\n")
    .filter((l) => l.trim().startsWith("#"))
    .join("\n");
}

// Generic top-level-key body extractor (column-0 only). Returns `null` if
// the key is absent, vs `findTopLevelPermissions` which throws on absence.
// Used for `concurrency:` (block) and similar scalar-or-block keys whose
// exact schema doesn't need a full YAML parser.
function findTopLevelKeyBody(raw: string, key: string): string[] | null {
  const lines = raw.split("\n");
  const keyRegex = new RegExp(`^${key}:`);
  for (let i = 0; i < lines.length; i++) {
    if (!keyRegex.test(lines[i])) continue;
    const bodyLines: string[] = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (/^\s*#/.test(lines[j])) continue;
      if (/^[^\s]/.test(lines[j])) break;
      if (lines[j].trim() === "") break;
      bodyLines.push(lines[j]);
    }
    return bodyLines;
  }
  return null;
}

// Pull the `group:` value (quoted or unquoted) out of a `concurrency:`
// block, or `null` if the block or the `group:` line is absent.
function concurrencyGroup(raw: string): string | null {
  const body = findTopLevelKeyBody(raw, "concurrency");
  if (!body) return null;
  for (const line of body) {
    const m = /^\s*group\s*:\s*"?([^"\n]+?)"?\s*$/.exec(line);
    if (m) return m[1].trim();
  }
  return null;
}

// True iff a `concurrency:` block exists AND its body has a
// `cancel-in-progress: true` line.
function hasCancelInProgress(raw: string): boolean {
  const body = findTopLevelKeyBody(raw, "concurrency");
  if (!body) return false;
  return body.some((l) => /^\s*cancel-in-progress\s*:\s*true\s*$/.test(l));
}

// Audit-parity fixtures. Each entry asserts:
//   - The audit-parity HEADER_REGEX appears in the file header block.
//   - Every documented consumer step string is present in the comment block.
//   - The actual `permissions:` scopes match `expectedKeys`.
type Case = {
  file: string;
  expectedKeys: ReadonlyArray<string>;
  expectedConsumerHints: ReadonlyArray<string>;
};

const HEADER_REGEX = /^# Permissions used by this workflow\./m;
const SHARED_VARS_NOTE = /^# Note: `vars\.PAGES_BASE_URL` is implicitly readable/m;

const cases: ReadonlyArray<Case> = [
  {
    file: "deploy.yml",
    expectedKeys: ["contents", "pages", "id-token"],
    expectedConsumerHints: [
      "actions/checkout@v4",
      "actions/deploy-pages@v4",
      "OIDC",
    ],
  },
  {
    file: "test.yml",
    expectedKeys: ["contents"],
    expectedConsumerHints: ["actions/checkout@v4"],
  },
  {
    file: "lint.yml",
    expectedKeys: ["contents"],
    expectedConsumerHints: ["actions/checkout@v4"],
  },
];

describe("Workflow `permissions:` audit-parity", () => {
  for (const c of cases) {
    describe(c.file, () => {
      const filePath = path.join(WORKFLOWS_DIR, c.file);
      const raw = fs.readFileSync(filePath, "utf8");

      it("exists in the repo", () => {
        expect(fs.existsSync(filePath)).toBe(true);
      });

      it("opens with the audit-parity header comment", () => {
        const header = permissionsHeaderComments(raw);
        expect(header).toMatch(HEADER_REGEX);
      });

      it("closes the header block with the implicit-vars note", () => {
        const header = permissionsHeaderComments(raw);
        expect(header).toMatch(SHARED_VARS_NOTE);
      });

      it("documents every consumer step in the comment block", () => {
        const header = permissionsHeaderComments(raw);
        for (const hint of c.expectedConsumerHints) {
          expect(header).toContain(hint);
        }
      });

      it("permission scope list matches the expected set", () => {
        const keys = permissionKeys(raw);
        expect(new Set(keys)).toEqual(new Set(c.expectedKeys));
      });
    });
  }

  it("every workflow shares the audit-parity header text", () => {
    // Drift can creep in if one workflow is updated and the others
    // aren't. A literal substring check on the opening line proves
    // every file in the audited set opens the header identically.
    const auditedWorkflows = ["deploy.yml", "test.yml", "lint.yml"];
    const opening =
      "# Permissions used by this workflow. Each line is the minimum scope the";
    for (const file of auditedWorkflows) {
      const header = permissionsHeaderComments(
        fs.readFileSync(path.join(WORKFLOWS_DIR, file), "utf8"),
      );
      expect(header, `workflow ${file} should open with the parity header`).toContain(opening);
    }
  });

  // Drift-detection on deploy.yml's `concurrency:` block. Prevents
  // accidental rename of the `pages` group (which GH would otherwise allow
  // to race its own deploy jobs) or removal of the cancel-in-progress flag.
  // test.yml deliberately has no concurrency block; this assertion doesn't
  // apply there — see ask_user Q1 history for the design rationale.
  describe("deploy.yml concurrency drift", () => {
    const raw = fs.readFileSync(
      path.join(WORKFLOWS_DIR, "deploy.yml"),
      "utf8",
    );

    it("concurrency.group is 'pages' (canonical)", () => {
      expect(concurrencyGroup(raw)).toBe("pages");
    });

    it("cancel-in-progress is true", () => {
      expect(hasCancelInProgress(raw)).toBe(true);
    });
  });
});
