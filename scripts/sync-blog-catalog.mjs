import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, "content");
const OUTPUT_PATH = process.env.BLOG_CATALOG_OUTPUT || path.join(ROOT, "ops", "blog-catalog.json");

const BRAND_DIRS = ["impact-loop", "rovonn-russell", "dream-streams", "il-foundation"];
const BRAND_HOSTS = {
  "impact-loop": "https://blog.impactloop.ca",
  "rovonn-russell": "https://blog.rovonnrussell.com",
  "dream-streams": "https://blog.dreamstreams.ca",
  "il-foundation": "https://blog.ilfoundation.ca",
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function buildCatalog() {
  const rows = [];

  for (const brandKey of BRAND_DIRS) {
    const brandDir = path.join(CONTENT_ROOT, brandKey);
    if (!fs.existsSync(brandDir)) continue;

    const files = fs.readdirSync(brandDir).filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));
    for (const file of files) {
      const fullPath = path.join(brandDir, file);
      const raw = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(raw);
      const slug = data.slug || file.replace(/\.mdx?$/, "");
      const published = Boolean(data.published);
      const reading = readingTime(content).text;

      rows.push({
        brand_key: brandKey,
        source_system: "workspace_sync_script",
        source_path: path.relative(ROOT, fullPath).replace(/\\/g, "/"),
        local_path: path.relative(ROOT, fullPath).replace(/\\/g, "/"),
        title: data.title || slug,
        slug,
        excerpt: data.excerpt || "",
        category: data.category || "Uncategorized",
        tags: Array.isArray(data.tags) ? data.tags : [],
        author_name: data.authorName || data.author || "Rovonn Russell",
        publish_state: published ? "published" : "draft",
        is_published: published,
        live_url: published ? `${BRAND_HOSTS[brandKey]}/blog/${slug}` : null,
        reading_time: reading,
        published_at: data.date || null,
        view_count: 0,
        unique_view_count: 0,
        comment_count: 0,
        reaction_count: 0,
        metadata: {
          workspace_snapshot: true,
          metrics_pending: true,
          featured_image: data.featuredImage || null,
          meta_description: data.metaDescription || null,
        },
      });
    }
  }

  return rows;
}

async function syncCatalog(rows) {
  const supabaseUrl = process.env.CRM_SUPABASE_URL;
  const serviceRoleKey = process.env.CRM_SERVICE_ROLE_KEY;
  const syncSecret = process.env.BLOG_SYNC_SECRET;

  if (!supabaseUrl || !serviceRoleKey) {
    console.log("CRM_SUPABASE_URL or CRM_SERVICE_ROLE_KEY not set. Wrote catalog file only.");
    return;
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/blog-catalog-sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "content-type": "application/json",
      ...(syncSecret ? { "x-blog-sync-secret": syncSecret } : {}),
    },
    body: JSON.stringify({
      source: "workspace-sync-script",
      posts: rows,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`blog-catalog-sync failed (${res.status}): ${raw}`);
  }

  console.log(`CRM sync response: ${raw}`);
}

async function main() {
  const rows = buildCatalog();
  ensureDir(path.dirname(OUTPUT_PATH));
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(rows, null, 2));
  console.log(`Wrote ${rows.length} blog rows to ${OUTPUT_PATH}`);
  await syncCatalog(rows);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
