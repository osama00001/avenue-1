import Link from "next/link";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { TEMPLATE_REGISTRY } from "@/components/templates/registry";
import CmsNotFound from "@/components/CmsNotFound";
import { getSitePageBySlug, listSitePages } from "@/lib/siteContentStore";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const cmsHeadingFont = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-cms-heading",
});

const cmsBodyFont = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cms-body",
});

const renderCmsContent = (content) => {
  if (!content) return null;
  if (typeof content !== "string") {
    return (
      <pre className="cms-pre">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  }

  const looksLikeHtml = /^\s*</.test(content) || /<(?:p|figure|img|h[1-6]|ul|ol|table)\b/i.test(content);
  if (looksLikeHtml) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeRaw]}
    >
      {content}
    </ReactMarkdown>
  );
};

function normalizeBlockType(type = "") {
  if (type === "richtext") return "richText";
  return type;
}

function blockProps(block) {
  const type = normalizeBlockType(block.type);
  if (type === "richText") {
    return { content: block.data?.html || block.data?.content || "" };
  }
  return block.data || {};
}

function renderBlocks(blocks = []) {
  return blocks.map((block, index) => {
    const type = normalizeBlockType(block.type);
    const Comp = TEMPLATE_REGISTRY[type]?.component;

    if (Comp) {
      return <Comp key={block.id || index} {...blockProps(block)} />;
    }

    const html = block.data?.html || block.data?.content;
    if (html) {
      return (
        <div
          key={block.id || index}
          className="prose max-w-none my-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    return null;
  });
}

export default async function Page({ params }) {
  const { slug } = await params;

  try {
    await connectDB();
  } catch (err) {
    console.error("[cms] database connection failed:", err);
    throw err;
  }

  const page = await getSitePageBySlug(slug);
  const navPages = (await listSitePages()).filter((entry) => entry?.slug && entry?.title);

  if (!page) {
    return <CmsNotFound />;
  }

  const { title, content, blocks = [] } = page;
  const hasContent = Boolean(String(content || "").trim());
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0;

  return (
    <div
      className={`cms-page ${cmsHeadingFont.variable} ${cmsBodyFont.variable}`}
    >
      <div className="cms-shell">
        <div className="cms-grid">
          {navPages.length > 0 && (
            <aside className="cms-sidebar">
              <h2 className="cms-sidebar-title">Help menu</h2>
              <ul className="cms-nav">
                {navPages.map((navPage) => {
                  const isActive = navPage.slug === slug;
                  const level = Number(navPage.level || 0);
                  const itemClass =
                    level === 1 ? "cms-nav-heading" : "cms-nav-item";
                  return (
                    <li key={navPage.id || navPage.slug}>
                      <Link
                        href={`/cms/${navPage.slug}`}
                        className={`${itemClass} ${
                          isActive ? "cms-nav-active" : ""
                        }`}
                      >
                        <span>{navPage.title}</span>
                        <span className="cms-nav-arrow">▶</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </aside>
          )}
          <div className="cms-article">
            {title && <h1 className="cms-title">{title}</h1>}
            <div className="cms-content">
              {hasContent ? renderCmsContent(content) : null}
              {!hasContent && hasBlocks ? renderBlocks(blocks) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
