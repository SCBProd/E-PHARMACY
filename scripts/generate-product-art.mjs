import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const productFiles = ['server/data/products.json', 'client/src/data/products.json'];
const publicDir = path.join(root, 'client/public/assets/products');
const palette = ['#54B17A', '#67A8C7', '#E3A85A', '#9B83C9', '#58AFA6', '#D67D8A', '#6D91D0', '#91AC56', '#D58A57', '#7396A2'];
const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const wrapName = (name) => {
  const words = String(name).split(/\s+/);
  if (words.length < 2) return [words[0], ''];
  const pivot = Math.ceil(words.length / 2);
  return [words.slice(0, pivot).join(' '), words.slice(pivot).join(' ')];
};

function productIllustration(product, id) {
  const name = String(product.name || 'Medicine');
  const lower = name.toLowerCase();
  const color = palette[id % palette.length];
  const pale = `${color}22`;
  const [line1, line2] = wrapName(name);
  const label = `<text x="256" y="252" text-anchor="middle" textLength="130" lengthAdjust="spacingAndGlyphs" fill="#25332C" font-family="Arial, sans-serif" font-size="21" font-weight="700">${escapeXml(line1)}</text>${line2 ? `<text x="256" y="280" text-anchor="middle" textLength="130" lengthAdjust="spacingAndGlyphs" fill="#25332C" font-family="Arial, sans-serif" font-size="21" font-weight="700">${escapeXml(line2)}</text>` : ''}`;
  const labelSmall = `<text x="256" y="260" text-anchor="middle" textLength="72" lengthAdjust="spacingAndGlyphs" fill="#25332C" font-family="Arial, sans-serif" font-size="12" font-weight="700">${escapeXml(line1)}</text>${line2 ? `<text x="256" y="280" text-anchor="middle" textLength="72" lengthAdjust="spacingAndGlyphs" fill="#25332C" font-family="Arial, sans-serif" font-size="12" font-weight="700">${escapeXml(line2)}</text>` : ''}`;
  let packageArt;

  if (lower.includes('toothbrush')) {
    packageArt = `<g filter="url(#shadow)" transform="rotate(-25 255 260)"><rect x="228" y="115" width="54" height="300" rx="26" fill="#FFFFFF" stroke="${color}" stroke-width="5"/><rect x="230" y="112" width="50" height="87" rx="20" fill="${pale}" stroke="${color}" stroke-width="4"/><path d="M239 128v44m12-48v48m12-48v48m12-44v44" stroke="${color}" stroke-width="5" stroke-linecap="round"/><rect x="239" y="234" width="32" height="115" rx="16" fill="${pale}"/> </g>`;
  } else if (lower.includes('mouthwash') || lower.includes('cleanser') || lower.includes('moisturizer')) {
    packageArt = `<g filter="url(#shadow)"><rect x="216" y="105" width="80" height="58" rx="14" fill="${color}"/><path d="M225 157h62l22 35v196a20 20 0 0 1-20 20h-66a20 20 0 0 1-20-20V192z" fill="#FFFFFF" stroke="${color}" stroke-width="5"/><rect x="207" y="222" width="98" height="114" rx="9" fill="${pale}"/>${labelSmall}<path d="M228 361h74" stroke="${color}" stroke-width="7" stroke-linecap="round"/></g>`;
  } else if (lower.includes('toothpaste')) {
    packageArt = `<g filter="url(#shadow)"><path d="M211 137h90l-10 218-35 41-35-41z" fill="#FFFFFF" stroke="${color}" stroke-width="5"/><path d="M211 137h90l-5 70h-80z" fill="${pale}"/><rect x="240" y="392" width="32" height="25" rx="5" fill="${color}"/>${labelSmall}<path d="M224 327h64" stroke="${color}" stroke-width="7" stroke-linecap="round"/></g>`;
  } else if (/vitamin|multivitamin|fish oil|calcium|folic acid/.test(lower)) {
    packageArt = `<g filter="url(#shadow)"><rect x="211" y="130" width="90" height="47" rx="12" fill="${color}"/><path d="M218 168h76v215a21 21 0 0 1-21 21h-34a21 21 0 0 1-21-21z" fill="#FFFFFF" stroke="${color}" stroke-width="5"/><rect x="220" y="232" width="72" height="112" rx="7" fill="${pale}"/>${label}<path d="M237 359h38" stroke="${color}" stroke-width="7" stroke-linecap="round"/></g>`;
  } else {
    packageArt = `<g filter="url(#shadow)"><rect x="174" y="114" width="164" height="286" rx="18" fill="#FFFFFF" stroke="${color}" stroke-width="5"/><path d="M176 132a18 18 0 0 1 18-18h128a18 18 0 0 1 18 18v42H176z" fill="${color}"/><circle cx="256" cy="153" r="9" fill="#FFFFFF"/><rect x="188" y="201" width="136" height="128" rx="12" fill="${pale}"/>${label}<text x="256" y="312" text-anchor="middle" fill="#66716A" font-size="13" letter-spacing="1">${lower.includes('medicine') ? 'CARE' : 'TABLETS'}</text><rect x="213" y="354" width="86" height="8" rx="4" fill="${color}" opacity=".65"/><rect x="224" y="370" width="64" height="6" rx="3" fill="${color}" opacity=".35"/></g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" font-family="Inter, Arial, sans-serif" role="img" aria-labelledby="title desc"><title id="title">${escapeXml(name)} product illustration</title><desc id="desc">Generic, non-branded packaging illustration for ${escapeXml(name)}.</desc><defs><filter id="shadow" x="-30%" y="-20%" width="160%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="13" flood-color="#365B45" flood-opacity=".13"/></filter><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F8FBF9"/><stop offset="1" stop-color="#EEF5F0"/></linearGradient></defs><rect width="512" height="512" rx="30" fill="url(#bg)"/><circle cx="96" cy="108" r="55" fill="${pale}"/><circle cx="425" cy="401" r="75" fill="${pale}"/><path d="M62 433c68-42 115-38 157-11" fill="none" stroke="${color}" stroke-opacity=".18" stroke-width="5" stroke-linecap="round"/>${packageArt}<rect x="30" y="464" width="452" height="1" fill="#DCE8E0"/><text x="256" y="489" text-anchor="middle" fill="#75827A" font-size="12" font-weight="600" letter-spacing="2">E-PHARMACY · PRODUCT ART</text></svg>`;
}

await mkdir(publicDir, { recursive: true });
const products = JSON.parse(await readFile(path.join(root, productFiles[0]), 'utf8'));
const seenProducts = new Map();
for (const [index, product] of products.entries()) {
  const id = String(index);
  const key = [product.name, product.suppliers, Number(product.stock), Number(product.price), product.category].join('|').toLowerCase();
  const original = seenProducts.get(key);
  if (original) product.duplicateOf = original;
  else { delete product.duplicateOf; seenProducts.set(key, id); }
  product.id = id;
  product.photo = `/assets/products/${id}.svg?v=1`;
  await writeFile(path.join(publicDir, `${id}.svg`), productIllustration(product, index), 'utf8');
}
for (const relativeFile of productFiles) {
  await writeFile(path.join(root, relativeFile), `${JSON.stringify(products, null, 2)}\n`, 'utf8');
}
console.log(`Generated ${products.length} local product illustrations and updated both product data files.`);
