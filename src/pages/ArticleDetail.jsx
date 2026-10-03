import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  CalendarPlus,
  BookOpen,
} from "lucide-react";
import { getBlogPostBySlug, getRelatedPosts } from "../data/blogData";
import { BlogArticleCard } from "./Blog";
import "./blog.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=85";

export default function ArticleDetailPage({ navbar, footer }) {
  const { slug } = useParams();
  const article = getBlogPostBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (article) {
      document.title = `${article.title} | PAWLIO Journal`;
    } else {
      document.title = "Article Not Found | PAWLIO Journal";
    }
  }, [slug, article]);

  // If article slug does not exist, show friendly 404 state
  if (!article) {
    return (
      <div className="article-page-wrapper">
        {navbar}

        <main className="article-main">
          <div className="article-container">
            <div className="article-not-found-card">
              <div className="article-not-found-icon">
                <BookOpen size={28} />
              </div>
              <h1 className="article-not-found-title">Article Not Found</h1>
              <p className="article-not-found-desc">
                The pet-care article you are looking for does not exist, has been renamed, or has moved to another section.
              </p>
              <Link
                to="/blog"
                className="blog-clear-btn"
                style={{ textDecoration: "none", display: "inline-block" }}
              >
                Return to Blog Directory
              </Link>
            </div>
          </div>
        </main>

        {footer}
      </div>
    );
  }

  const relatedArticles = getRelatedPosts(article.slug, article.category, 3);

  return (
    <div className="article-page-wrapper">
      {navbar}

      <main className="article-main">
        <article className="article-container">
          {/* BREADCRUMB */}
          <nav className="article-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <Link to="/blog">Journal</Link>
            <ChevronRight size={13} />
            <span>{article.category}</span>
          </nav>

          {/* ARTICLE HEADER */}
          <header className="article-header">
            <div className="article-meta-row">
              <span className="blog-category-badge">{article.category}</span>
              <span className="blog-read-time">
                <Clock size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                {article.readingTime}
              </span>
              <span className="blog-card-date">
                <Calendar size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                {article.publishedAt}
              </span>
            </div>

            <h1 className="article-title">{article.title}</h1>
            <p className="article-intro">{article.intro}</p>
          </header>

          {/* FEATURED COVER IMAGE */}
          <div className="article-featured-image-wrap">
            <img
              src={article.image}
              alt={article.title}
              className="article-featured-image"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </div>

          {/* TWO-COLUMN LAYOUT: CONTENT + STICKY SIDEBAR */}
          <div className="article-content-layout">
            {/* LEFT: BODY CONTENT */}
            <div className="article-body">
              {article.sections &&
                article.sections.map((section, idx) => (
                  <section key={idx} className="article-section-block">
                    <h2>{section.heading}</h2>
                    {section.content.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </section>
                ))}

              {/* PAWLIO TIP CARD */}
              {article.pawlioTip && (
                <div className="article-pawlio-tip">
                  <div className="article-pawlio-tip-icon">
                    <Lightbulb size={20} />
                  </div>
                  <div className="article-pawlio-tip-content">
                    <h4>PAWLIO Care Tip</h4>
                    <p>{article.pawlioTip}</p>
                  </div>
                </div>
              )}

              {/* MEDICAL DISCLAIMER */}
              <aside className="article-disclaimer" aria-label="Medical Disclaimer">
                <strong>Medical Notice: </strong>
                This article provides general pet-care educational guidance only. Every companion animal has unique clinical baselines, dietary restrictions, and medical histories. For specific concerns about your pet's health, symptoms, or medication protocols, always consult a qualified licensed veterinarian.
              </aside>

              {/* TAGS */}
              {article.tags && article.tags.length > 0 && (
                <div className="article-tags-wrap">
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--color-forest, #12312D)" }}>
                    Topics:
                  </span>
                  {article.tags.map((tag) => (
                    <span key={tag} className="article-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: QUICK TAKEAWAYS SIDEBAR */}
            <aside className="article-sidebar">
              {article.quickTakeaways && (
                <div className="article-takeaways-card">
                  <div className="article-takeaways-header">
                    <Sparkles size={16} color="var(--color-primary, #0F766E)" />
                    <h3>Quick Takeaways</h3>
                  </div>

                  <ul className="article-takeaways-list">
                    {article.quickTakeaways.map((point, index) => (
                      <li key={index} className="article-takeaway-item">
                        <CheckCircle2 size={16} />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* EDITORIAL ATTRIBUTION */}
              <div className="article-author-card">
                <strong>{article.author}</strong>
                <span>
                  Reviewed for evidence-based preventive care and companion wellness by the PAWLIO clinical network.
                </span>
              </div>
            </aside>
          </div>

          {/* ARTICLE FOOTER GUIDANCE CTA */}
          <section className="article-footer-cta" aria-label="Care Guidance Options">
            <div className="article-footer-cta-text">
              <h3>Looking for more pet-care guidance?</h3>
              <p>
                Explore additional health guides or schedule a preventive checkup for your companion.
              </p>
            </div>

            <div className="article-footer-cta-buttons">
              <Link to="/blog" className="article-footer-btn-secondary">
                <BookOpen size={16} />
                <span>Explore More Articles</span>
              </Link>

              <Link to="/appointments" className="article-footer-btn-primary">
                <CalendarPlus size={16} />
                <span>Book an Appointment</span>
              </Link>
            </div>
          </section>

          {/* RELATED ARTICLES (PHASE 6) */}
          {relatedArticles.length > 0 && (
            <section className="related-articles-section" aria-label="Related Articles">
              <div className="related-articles-header">
                <h2>Related Care Articles</h2>
                <p>Continue exploring trusted guidance for your pet's wellness.</p>
              </div>

              <div className="blog-grid">
                {relatedArticles.map((rel) => (
                  <BlogArticleCard key={rel.id} article={rel} />
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      {footer}
    </div>
  );
}
