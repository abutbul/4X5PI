const fs = require("node:fs/promises");
const path = require("node:path");
const yaml = require("yaml");

const root = path.resolve(__dirname, "..");
const modelDirectory = path.join(root, "salvaged-knowledge/Radios/HTs/Anytone/D868");
const outputDirectory = path.join(modelDirectory, "pdf-text");
const minimumTextLength = 80;

function slugify(value, fallback) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || fallback;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

async function extractText(pdfjs, pdfPath) {
  const bytes = new Uint8Array(await fs.readFile(pdfPath));
  const document = await pdfjs.getDocument({
    data: bytes,
    isEvalSupported: false,
    useSystemFonts: true
  }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    let pageText = "";

    for (const item of content.items) {
      if (!("str" in item)) continue;
      pageText += item.str;
      pageText += item.hasEOL ? "\n" : " ";
    }

    pages.push(pageText.trim());
  }

  return pages.filter(Boolean).join("\n\n").replace(/[ \t]+\n/g, "\n").trim();
}

async function main() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  await fs.rm(outputDirectory, { recursive: true, force: true });
  await fs.mkdir(outputDirectory, { recursive: true });

  const entries = (await fs.readdir(modelDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.pdf$/i.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));
  let converted = 0;
  let skipped = 0;

  for (const [index, entry] of entries.entries()) {
    const sourcePath = path.join(modelDirectory, entry.name);
    const relativeSourcePath = path.relative(root, sourcePath).split(path.sep).join("/");
    let text;

    try {
      text = await extractText(pdfjs, sourcePath);
    } catch (error) {
      skipped += 1;
        console.warn(`PDF text extraction failed; original will remain linked: ${entry.name}: ${error.message}`);
      continue;
    }

    if (text.length < minimumTextLength) {
      skipped += 1;
      console.log(`No usable embedded text; original will remain linked: ${entry.name}`);
      continue;
    }

    const baseName = entry.name.replace(/\.pdf$/i, "");
    const slug = `${String(index + 1).padStart(2, "0")}-${slugify(baseName, `document-${index + 1}`)}`;
    const frontMatter = {
      layout: "page",
      title: baseName,
      nav_title: baseName,
      parent: "d868",
      nav_order: index + 1,
      description: `Text extracted from ${entry.name}. Download the original PDF on the AnyTone AT-D868UV page.`,
      source_pdf: relativeSourcePath,
      source_pdf_name: entry.name,
      source_pdf_url: `/${relativeSourcePath.split("/").map(encodeURIComponent).join("/")}`,
      theme_key: "knowledge",
      generated_pdf_page: true,
      ...( /[\u0590-\u05ff]/.test(baseName) ? { lang: "he" } : {})
    };
    const frontMatterText = yaml.stringify(frontMatter).trimEnd();
    const safeText = escapeHtml(text);
    const pageContent = `---\n${frontMatterText}\n---\n\n<p class="pdf-transcription-note">Machine-extracted searchable text. Check the original PDF for page layout, diagrams, tables, and exact formatting.</p>\n\n<div class="pdf-transcription" dir="auto"><pre>${safeText}</pre></div>\n`;

    await fs.writeFile(path.join(outputDirectory, `${slug}.md`), pageContent, "utf8");
    converted += 1;
    console.log(`Generated searchable page: ${entry.name}`);
  }

  console.log(`PDF conversion complete: ${converted} generated page(s), ${skipped} PDF(s) left as download-only.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});