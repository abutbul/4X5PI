const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const scanDirectories = ["_layouts", "_includes"];
const quotedInclude = /{%-?\s*include\s+["']/;

function liquidFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return liquidFiles(file);
    return /\.(html|liquid|md)$/.test(entry.name) ? [file] : [];
  });
}

const failures = [];
for (const directory of scanDirectories) {
  for (const file of liquidFiles(path.join(root, directory))) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      if (quotedInclude.test(line)) failures.push(`${path.relative(root, file)}:${index + 1}`);
    });
  }
}

if (failures.length) {
  console.error("GitHub Pages Jekyll 3 does not accept quoted filenames in include tags:");
  for (const location of failures) console.error(`  ${location}`);
  process.exitCode = 1;
} else {
  console.log("Jekyll Liquid compatibility check passed.");
}