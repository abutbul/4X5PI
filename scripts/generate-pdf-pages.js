const fs = require("node:fs/promises");
const path = require("node:path");
const yaml = require("yaml");
const { createCanvas, DOMMatrix, ImageData, Path2D } = require("@napi-rs/canvas");

const root = path.resolve(__dirname, "..");
const modelDirectory = path.join(root, "salvaged-knowledge/Radios/HTs/Anytone/D868");
const outputDirectory = path.join(modelDirectory, "pdf-text");
const imageDirectory = path.join(outputDirectory, "assets");
const maximumRenderScale = 1.8;
const maximumPageEdge = 2400;
const maximumPagesPerPdf = 20;

globalThis.DOMMatrix ??= DOMMatrix;
globalThis.ImageData ??= ImageData;
globalThis.Path2D ??= Path2D;

function slugify(value, fallback) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || fallback;
}

function encodePath(relativePath) {
  return `/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
}

async function renderPages(pdfjs, pdfPath, relativeOutputPath) {
  const bytes = new Uint8Array(await fs.readFile(pdfPath));
  const loadingTask = pdfjs.getDocument({
    data: bytes,
    isEvalSupported: false,
    useSystemFonts: true
  });
  const document = await loadingTask.promise;
  const pages = [];
  const totalPageCount = document.numPages;
  const renderedPageCount = Math.min(totalPageCount, maximumPagesPerPdf);
  const imageFolder = path.join(imageDirectory, relativeOutputPath);
  await fs.mkdir(imageFolder, { recursive: true });

  try {
    for (let pageNumber = 1; pageNumber <= renderedPageCount; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(maximumRenderScale, maximumPageEdge / Math.max(baseViewport.width, baseViewport.height));
      const viewport = page.getViewport({ scale });
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const context = canvas.getContext("2d");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: context, viewport }).promise;

      const fileName = `page-${String(pageNumber).padStart(3, "0")}.webp`;
      const relativeImagePath = path.posix.join(
        "salvaged-knowledge/Radios/HTs/Anytone/D868/pdf-text/assets",
        relativeOutputPath,
        fileName
      );
      await fs.writeFile(path.join(imageFolder, fileName), canvas.toBuffer("image/webp", { quality: 94 }));
      pages.push({
        number: pageNumber,
        width: canvas.width,
        height: canvas.height,
        url: encodePath(relativeImagePath)
      });

      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  return { pages, totalPageCount };
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
    const baseName = entry.name.replace(/\.pdf$/i, "");
    const slug = `${String(index + 1).padStart(2, "0")}-${slugify(baseName, `document-${index + 1}`)}`;
    let renderedDocument;
    try {
      renderedDocument = await renderPages(pdfjs, sourcePath, slug);
    } catch (error) {
      skipped += 1;
      await fs.rm(path.join(imageDirectory, slug), { recursive: true, force: true });
      console.warn(`PDF page rendering failed; original will remain linked: ${entry.name}: ${error.message}`);
      continue;
    }

    if (renderedDocument.pages.length === 0) {
      skipped += 1;
      await fs.rm(path.join(imageDirectory, slug), { recursive: true, force: true });
      console.log(`No pages rendered; original will remain linked: ${entry.name}`);
      continue;
    }

    const frontMatter = {
      layout: "page",
      title: baseName,
      nav_title: baseName,
      parent: "d868",
      nav_order: index + 1,
      description: `Rendered ${renderedDocument.pages.length} of ${renderedDocument.totalPageCount} pages from ${entry.name}. Download the original PDF for the complete document.`,
      source_pdf: relativeSourcePath,
      source_pdf_name: entry.name,
      source_pdf_url: encodePath(relativeSourcePath),
      theme_key: "knowledge",
      generated_pdf_page: true,
      rendered_pages: renderedDocument.pages,
      rendered_page_count: renderedDocument.pages.length,
      source_page_count: renderedDocument.totalPageCount,
      has_more_pages: renderedDocument.pages.length < renderedDocument.totalPageCount,
      ...( /[\u0590-\u05ff]/.test(baseName) ? { lang: "he" } : {})
    };
    const frontMatterText = yaml.stringify(frontMatter).trimEnd();
    const pageContent = `---\n${frontMatterText}\n---\n`;

    await fs.writeFile(path.join(outputDirectory, `${slug}.md`), pageContent, "utf8");
    converted += 1;
    console.log(`Rendered ${renderedDocument.pages.length}/${renderedDocument.totalPageCount} page(s): ${entry.name}`);
  }

  console.log(`PDF conversion complete: ${converted} generated page(s), ${skipped} PDF(s) left as download-only.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});