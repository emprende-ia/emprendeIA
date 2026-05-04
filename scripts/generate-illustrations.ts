/**
 * Genera las ilustraciones del dashboard y de /start usando Imagen 4 fast.
 *
 * Uso:
 *   npm run gen:illustrations          (genera todas)
 *   npm run gen:illustrations -- nombre (regenera solo una, ej: identidad-digital)
 *
 * Requiere GOOGLE_GENAI_API_KEY en .env.local. Las imágenes se guardan como
 * PNG en /public/illustrations/ y se referencian estáticamente desde el código.
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { ai } from '../src/ai/genkit';

// Asegurar que .env.local sobreescriba a .env (Next usa este orden).
loadEnv({ path: path.resolve(process.cwd(), '.env.local'), override: true });

interface Illustration {
  slug: string;
  aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  prompt: string;
}

const STYLE_BASE =
  'Modern 3D illustration, soft pastel gradient background, isometric perspective, ' +
  'soft volumetric lighting, clean professional vector style, centered composition, ' +
  'no text, no letters, no logos, no human faces, vibrant but tasteful colors';

const ILLUSTRATIONS: Illustration[] = [
  // Hero cards de /start (formato horizontal, dan más impacto)
  {
    slug: 'emprendimiento-nuevo',
    aspectRatio: '4:3',
    prompt:
      'a glowing rocket launching upward from an open laptop, leaving a trail of sparkles ' +
      'and a lightbulb idea floating beside it, deep violet and fuchsia gradient sky, ' +
      'symbolizing a brand new business idea taking off',
  },
  {
    slug: 'potenciar-negocio',
    aspectRatio: '4:3',
    prompt:
      'a small green plant sprouting from a stack of coins next to an upward growing bar ' +
      'chart with a glowing arrow rising through the clouds, emerald and teal gradient ' +
      'background, symbolizing scaling and growing an existing business',
  },

  // 5 módulos del dashboard (cuadrados, encajan en las cards)
  {
    slug: 'identidad-digital',
    aspectRatio: '1:1',
    prompt:
      'a floating color palette with a paintbrush and a glowing logo abstract shape, ' +
      'violet and fuchsia gradient background, symbolizing digital brand identity creation',
  },
  {
    slug: 'finanzas',
    aspectRatio: '1:1',
    prompt:
      'stacks of golden coins next to a transparent financial chart with rising bars and ' +
      'a calculator, emerald and teal gradient background, symbolizing financial planning ' +
      'and budget tracking',
  },
  {
    slug: 'marketing',
    aspectRatio: '1:1',
    prompt:
      'a glowing megaphone surrounded by floating chat bubbles, hearts and notification ' +
      'icons, rose and pink gradient background, symbolizing marketing campaigns and ' +
      'social media outreach',
  },
  {
    slug: 'proveedores',
    aspectRatio: '1:1',
    prompt:
      'cardboard delivery boxes connected by glowing lines on a global map node network, ' +
      'amber and orange gradient background, symbolizing supplier search and logistics',
  },
  {
    slug: 'guia-paso-a-paso',
    aspectRatio: '1:1',
    prompt:
      'a folded map with a winding path marked by glowing checkpoint flags and a checklist ' +
      'with checkmarks floating beside it, sky blue and cyan gradient background, ' +
      'symbolizing a step by step action plan',
  },
];

async function generateOne(illustration: Illustration, outDir: string): Promise<void> {
  const fullPrompt = `${illustration.prompt}. ${STYLE_BASE}.`;

  console.log(`\n🎨  Generando: ${illustration.slug} (${illustration.aspectRatio})`);
  console.log(`   prompt: ${illustration.prompt.slice(0, 80)}...`);

  const { media } = await ai.generate({
    model: 'googleai/imagen-4.0-fast-generate-001',
    prompt: fullPrompt,
    config: {
      aspectRatio: illustration.aspectRatio,
    },
  });

  if (!media?.url) {
    throw new Error(`Imagen 4 no devolvió media para ${illustration.slug}`);
  }

  // media.url viene como `data:image/png;base64,iVBORw...`. Extraemos el base64.
  const match = media.url.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) {
    throw new Error(`URL inesperada para ${illustration.slug}: ${media.url.slice(0, 60)}...`);
  }
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const buffer = Buffer.from(match[2], 'base64');

  const outPath = path.join(outDir, `${illustration.slug}.${ext}`);
  await writeFile(outPath, buffer);
  console.log(`   ✓ Guardado en ${path.relative(process.cwd(), outPath)} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  const filter = process.argv[2];
  const targets = filter
    ? ILLUSTRATIONS.filter((i) => i.slug === filter)
    : ILLUSTRATIONS;

  if (targets.length === 0) {
    console.error(`No se encontró ninguna ilustración con slug "${filter}".`);
    console.error(`Disponibles: ${ILLUSTRATIONS.map((i) => i.slug).join(', ')}`);
    process.exit(1);
  }

  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.error('❌  Falta GOOGLE_GENAI_API_KEY. Configúrala en .env.local.');
    process.exit(1);
  }

  const outDir = path.resolve(process.cwd(), 'public', 'illustrations');
  await mkdir(outDir, { recursive: true });

  console.log(`\n📁  Salida: ${path.relative(process.cwd(), outDir)}`);
  console.log(`🖼️   Generando ${targets.length} ilustración(es) con Imagen 4 fast...\n`);

  const startedAt = Date.now();
  let ok = 0;
  let failed = 0;

  for (const illustration of targets) {
    try {
      await generateOne(illustration, outDir);
      ok++;
    } catch (err) {
      failed++;
      console.error(`   ✗ Falló ${illustration.slug}: ${(err as Error).message}`);
    }
  }

  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\n✅  Listo en ${seconds}s — ${ok} ok, ${failed} con error.`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
