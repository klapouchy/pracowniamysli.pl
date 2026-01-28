import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

const WAYBACK_PREFIX = 'https://web.archive.org/web';
const ORIGINAL_BASE = 'http://www.pracowniamysli.pl';
const CONTENT_DIR = 'src/content/pages';
const IMAGES_DIR = 'public/images';

// Page configuration: slug -> WordPress URL path and latest archive timestamp
const PAGES: Record<string, { url: string; timestamp: string; order: number }> = {
  'o-mnie': { url: '/o-mnie/', timestamp: '20250907111645', order: 1 },
  'jak-pomagam': { url: '/jak-pomagam/', timestamp: '20251209130308', order: 2 },
  'oferta': { url: '/oferta/', timestamp: '20251209130641', order: 3 },
  'psychoterapia-dda': { url: '/psychoterapia-dda/', timestamp: '20210614003112', order: 4 },
  'konsultacje-online': { url: '/konsultacje-online/', timestamp: '20251209130641', order: 5 },
  'polityka-prywatnosci': { url: '/polityka-prywatnosci/', timestamp: '20210613233000', order: 6 },
};

// Initialize Turndown for HTML to Markdown conversion
const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

// Remove script and style tags
turndown.remove(['script', 'style', 'noscript']);

// Custom rule for images - update paths to local
turndown.addRule('images', {
  filter: 'img',
  replacement: (content, node) => {
    const img = node as HTMLImageElement;
    const alt = img.getAttribute('alt') || '';
    let src = img.getAttribute('src') || img.getAttribute('data-src') || '';

    if (!src) return '';

    // Handle Wayback Machine URLs
    if (src.includes('web.archive.org')) {
      const match = src.match(/\/web\/\d+\/(.*)/);
      if (match) {
        src = match[1];
      }
    }

    // Extract filename from URL
    try {
      const url = new URL(src, ORIGINAL_BASE);
      const filename = path.basename(url.pathname);
      return `![${alt}](/images/${filename})`;
    } catch {
      return `![${alt}](${src})`;
    }
  },
});

async function fetchPage(url: string): Promise<string> {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; content-migration/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function downloadImage(imageUrl: string): Promise<string | null> {
  try {
    // Handle Wayback Machine URLs
    let actualUrl = imageUrl;
    if (!imageUrl.includes('web.archive.org') && !imageUrl.startsWith('http')) {
      actualUrl = `${ORIGINAL_BASE}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    const url = new URL(actualUrl);
    let filename = path.basename(url.pathname);

    // Remove Wayback Machine path components from filename
    if (filename.match(/^\d{14}$/)) {
      // This is a timestamp, not a filename
      return null;
    }

    const outputPath = path.join(IMAGES_DIR, filename);

    // Check if already downloaded
    try {
      await fs.access(outputPath);
      console.log(`  Image already exists: ${filename}`);
      return filename;
    } catch {
      // File doesn't exist, continue with download
    }

    // For Wayback Machine, construct the archived URL
    let fetchUrl = actualUrl;
    if (!actualUrl.includes('web.archive.org')) {
      // Use a recent timestamp for the image
      fetchUrl = `${WAYBACK_PREFIX}/20251209133436im_/${actualUrl}`;
    }

    console.log(`  Downloading image: ${filename}`);
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; content-migration/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`  Failed to download ${imageUrl}: ${response.status}`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Optimize image with sharp
    const ext = path.extname(filename).toLowerCase();

    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      // Create WebP version
      const webpFilename = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      await sharp(buffer)
        .webp({ quality: 85 })
        .toFile(path.join(IMAGES_DIR, webpFilename));
      console.log(`  Created WebP: ${webpFilename}`);

      // Also save optimized original format as fallback
      if (ext === '.png') {
        await sharp(buffer)
          .png({ quality: 85, compressionLevel: 9 })
          .toFile(outputPath);
      } else if (['.jpg', '.jpeg'].includes(ext)) {
        await sharp(buffer)
          .jpeg({ quality: 85 })
          .toFile(outputPath);
      } else {
        await fs.writeFile(outputPath, buffer);
      }
    } else {
      // For other formats, just save as-is
      await fs.writeFile(outputPath, buffer);
    }

    return filename;
  } catch (error) {
    console.error(`  Error downloading image ${imageUrl}:`, error);
    return null;
  }
}

async function extractContent(html: string, pageSlug: string): Promise<{ title: string; description: string; content: string; images: string[] }> {
  const $ = cheerio.load(html);

  // Remove Wayback Machine toolbar
  $('#wm-ipp-base, #wm-ipp').remove();

  // Extract title
  const title = $('h1.entry-title, .page-title, h1').first().text().trim() ||
                $('title').text().split('|')[0].trim().split(' - ')[0].trim();

  // Extract meta description
  const description = $('meta[name="description"]').attr('content') ||
                     $('meta[property="og:description"]').attr('content') ||
                     '';

  // Find main content area (WordPress themes vary)
  let contentElement = $('.entry-content, .page-content, article .content, .elementor-widget-theme-post-content');

  if (contentElement.length === 0) {
    contentElement = $('main article, article, .content, main');
  }

  // If still nothing, try the body but exclude header/footer
  if (contentElement.length === 0 || contentElement.html()?.trim() === '') {
    $('header, footer, nav, .header, .footer, .navigation, #wm-ipp-base, #wm-ipp').remove();
    contentElement = $('body');
  }

  // Remove unwanted elements
  contentElement.find('script, style, noscript, .share-buttons, .social-share, .navigation, .comments, .related-posts, header, footer, nav').remove();

  // Collect image URLs
  const images: string[] = [];
  contentElement.find('img').each((_, img) => {
    let src = $(img).attr('src') || $(img).attr('data-src');
    if (src && !src.startsWith('data:')) {
      // Extract original URL from Wayback Machine URL
      if (src.includes('web.archive.org')) {
        const match = src.match(/\/web\/\d+(?:im_)?\/(.+)/);
        if (match) {
          src = match[1];
        }
      }
      images.push(src);
    }
  });

  // Convert to Markdown
  const contentHtml = contentElement.html() || '';
  let markdown = turndown.turndown(contentHtml);

  // Clean up the markdown
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
    .replace(/^\s+|\s+$/g, '')   // Trim whitespace
    .replace(/\[([^\]]+)\]\(\/web\/\d+\/([^)]+)\)/g, '[$1]($2)'); // Fix Wayback links

  return { title, description, content: markdown, images };
}

async function scrapeHomepage(): Promise<{ images: string[] }> {
  console.log('\n--- Scraping Homepage ---');
  const url = `${WAYBACK_PREFIX}/20251209133436/${ORIGINAL_BASE}/`;
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  // Remove Wayback Machine toolbar
  $('#wm-ipp-base, #wm-ipp').remove();

  // Collect all images from homepage
  const images: string[] = [];
  $('img').each((_, img) => {
    let src = $(img).attr('src') || $(img).attr('data-src');
    if (src && !src.startsWith('data:')) {
      // Extract original URL from Wayback Machine URL
      if (src.includes('web.archive.org')) {
        const match = src.match(/\/web\/\d+(?:im_)?\/(.+)/);
        if (match) {
          src = match[1];
        }
      }
      images.push(src);
    }
  });

  // Download homepage images
  for (const imageUrl of images) {
    await downloadImage(imageUrl);
  }

  return { images };
}

async function scrapePage(slug: string, config: { url: string; timestamp: string; order: number }): Promise<void> {
  console.log(`\n--- Scraping: ${slug} ---`);

  const url = `${WAYBACK_PREFIX}/${config.timestamp}/${ORIGINAL_BASE}${config.url}`;
  const html = await fetchPage(url);
  const { title, description, content, images } = await extractContent(html, slug);

  // Download images
  for (const imageUrl of images) {
    await downloadImage(imageUrl);
  }

  // Generate frontmatter
  const frontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    description ? `description: "${description.replace(/"/g, '\\"')}"` : null,
    `order: ${config.order}`,
    '---',
  ].filter(Boolean).join('\n');

  // Combine frontmatter and content
  const fullContent = `${frontmatter}\n\n${content}\n`;

  // Write to file
  const outputPath = path.join(CONTENT_DIR, `${slug}.md`);
  await fs.writeFile(outputPath, fullContent, 'utf-8');
  console.log(`Saved: ${outputPath}`);
}

async function main(): Promise<void> {
  console.log('=== Pracownia Mysli Content Scraper (Wayback Machine) ===\n');

  // Ensure directories exist
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  await fs.mkdir(CONTENT_DIR, { recursive: true });

  try {
    // Scrape homepage for images
    await scrapeHomepage();

    // Scrape all pages
    for (const [slug, config] of Object.entries(PAGES)) {
      try {
        await scrapePage(slug, config);
      } catch (error) {
        console.error(`Error scraping ${slug}:`, error);
      }
    }

    console.log('\n=== Scraping Complete ===');
    console.log('Next steps:');
    console.log('1. Review scraped content in src/content/pages/');
    console.log('2. Check downloaded images in public/images/');
    console.log('3. Run npm run build to verify');

  } catch (error) {
    console.error('Scraping failed:', error);
    process.exit(1);
  }
}

main();
