import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  X,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { BLOG_POSTS, BLOG_CATEGORIES } from "../data/blogData";
import "./blog.css";

// Fallback high-resolution pet photo if external image link has issues
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=85";

export function BlogHero() {
  return (
    <section className="blog-hero-section" aria-label="Journal Overview">
      <div className="blog-container">
        <div className="blog-hero-grid">
          <div>
            <div className="blog-hero-badge">
              <Sparkles size={14} />
              <span>PAWLIO JOURNAL</span>
            </div>
            <h1 className="blog-hero-title">
              Better Care Starts With <br />
              <span className="hero-highlight">Better Information.</span>
            </h1>
            <p className="blog-hero-subtitle">
              Practical, veterinary-reviewed guidance to help you understand, organize, and care for the pets you love every single day.
            </p>
          </div>

          <div className="blog-hero-visual">
            <div className="blog-hero-card">
              <div className="blog-hero-card-header">
                <div className="blog-hero-card-icon">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h3 className="blog-hero-card-title">Trusted Pet Knowledge</h3>
                  <span className="blog-hero-card-subtitle">
                    Evidence-based preventive care
                  </span>
                </div>
              </div>

              <div className="blog-hero-card-pills">
                <div className="blog-hero-card-pill">
                  <CheckCircle2 size={16} />
                  <span>Veterinary Lifestyle Guidance</span>
                </div>
                <div className="blog-hero-card-pill">
                  <CheckCircle2 size={16} />
                  <span>Nutrition & Daily Routine Routines</span>
                </div>
                <div className="blog-hero-card-pill">
                  <CheckCircle2 size={16} />
                  <span>Vaccination Compliance Insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedArticle({ article }) {
  if (!article) return null;

  return (
    <section className="blog-featured-section" aria-label="Featured Story">
      <div className="blog-container">
        <Link
          to={`/blog/${article.slug}`}
          className="blog-featured-card"
          aria-label={`Read featured article: ${article.title}`}
        >
          <div className="blog-featured-image-wrap">
            <img
              src={article.image}
              alt={article.title}
              className="blog-featured-img"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            <span className="blog-featured-badge">FEATURED ARTICLE</span>
          </div>

          <div className="blog-featured-content">
            <div className="blog-featured-meta-top">
              <span className="blog-category-badge">{article.category}</span>
              <span className="blog-read-time">
                <Clock size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                {article.readingTime}
              </span>
            </div>

            <h2 className="blog-featured-title">{article.title}</h2>
            <p className="blog-featured-desc">{article.excerpt}</p>

            <span className="blog-btn-cta">
              <span>Read Article</span>
              <ArrowRight size={17} />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}

export function BlogArticleCard({ article }) {
  return (
    <article className="blog-card">
      <Link
        to={`/blog/${article.slug}`}
        style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}
        aria-label={`Read article: ${article.title}`}
      >
        <div className="blog-card-thumb-wrap">
          <img
            src={article.image}
            alt={article.title}
            className="blog-card-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>

        <div className="blog-card-body">
          <div className="blog-card-meta">
            <span className="blog-category-badge">{article.category}</span>
            <span className="blog-card-date">{article.publishedAt}</span>
          </div>

          <h3 className="blog-card-title">{article.title}</h3>
          <p className="blog-card-excerpt">{article.excerpt}</p>

          <div className="blog-card-footer">
            <span className="blog-read-time">
              <Clock size={12} style={{ verticalAlign: "middle", marginRight: "4px" }} />
              {article.readingTime}
            </span>
            <span className="blog-btn-cta">
              <span>Read Article</span>
              <ArrowRight size={15} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogPage({ navbar, footer }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "PAWLIO Journal | Pet Care Knowledge & Guides";
  }, []);

  // Identify featured article (first with isFeatured or first in list)
  const featuredArticle = useMemo(() => {
    return BLOG_POSTS.find((p) => p.isFeatured) || BLOG_POSTS[0];
  }, []);

  // Filtered articles list
  const filteredArticles = useMemo(() => {
    let result = BLOG_POSTS;

    // Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter(
        (article) =>
          article.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(q) ||
          article.excerpt.toLowerCase().includes(q) ||
          article.category.toLowerCase().includes(q) ||
          (article.tags && article.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
  };

  const isFiltering = selectedCategory !== "All" || searchQuery.trim().length > 0;

  return (
    <div className="blog-page-wrapper">
      {navbar}

      <main className="blog-main">
        {/* HERO SECTION */}
        <BlogHero />

        {/* FEATURED STORY (Hide if active search or category filtered away) */}
        {!isFiltering && featuredArticle && (
          <FeaturedArticle article={featuredArticle} />
        )}

        {/* CONTROLS: CATEGORIES & SEARCH */}
        <section className="blog-controls-section" aria-label="Article Filters">
          <div className="blog-container">
            <div className="blog-controls-wrapper">
              {/* SEARCH FIELD */}
              <div className="blog-search-wrap">
                <Search size={18} className="blog-search-icon" />
                <input
                  type="text"
                  placeholder="Search pet-care articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="blog-search-input"
                  aria-label="Search pet-care articles"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="blog-search-clear"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* CATEGORY FILTER PILLS */}
              <div
                className="blog-categories-bar"
                role="tablist"
                aria-label="Blog categories"
              >
                {BLOG_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`blog-category-pill ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ARTICLE GRID */}
        <section className="blog-grid-section" aria-label="Article List">
          <div className="blog-container">
            {isFiltering && (
              <div className="blog-results-meta">
                <span className="blog-results-count">
                  Found <strong>{filteredArticles.length}</strong> article
                  {filteredArticles.length === 1 ? "" : "s"}
                  {selectedCategory !== "All" && ` in ${selectedCategory}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-primary, #0F766E)",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Reset all
                </button>
              </div>
            )}

            {filteredArticles.length > 0 ? (
              <div className="blog-grid">
                {filteredArticles.map((article) => (
                  <BlogArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="blog-empty-state">
                <div className="blog-empty-icon">
                  <Search size={24} />
                </div>
                <h3 className="blog-empty-title">No articles found</h3>
                <p className="blog-empty-desc">
                  Try adjusting your keywords or browse all categories to explore pet-care guidance.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="blog-clear-btn"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {footer}
    </div>
  );
}
