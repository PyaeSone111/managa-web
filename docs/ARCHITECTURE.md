# Myangarsite Architecture Documentation

## Overview

This document outlines the complete data model, search system, ranking algorithms, and API design for a scalable manga reading platform.

---

## 1. Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CORE ENTITIES                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    manga     │──────<│   chapter    │──────<│ chapter_page │
│              │ 1   N │              │ 1   N │              │
└──────────────┘       └──────────────┘       └──────────────┘
       │                      │
       │                      │
       ├───────┬──────┬───────┼──────────────────────────────┐
       │       │      │       │                              │
       ▼       ▼      ▼       ▼                              ▼
┌──────────┐ ┌────┐ ┌────┐ ┌─────────────────┐    ┌─────────────────────┐
│  author  │ │type│ │cat │ │user_reading_prog│    │user_reading_session │
│ (M:N)    │ │(M:N│ │(M:N│ │      (M:N)      │    │     (1:N)           │
└──────────┘ └────┘ └────┘ └─────────────────┘    └─────────────────────┘
       │                              │
       │                              │
┌──────────────┐              ┌──────────────┐
│ manga_author │              │     user     │
│  (join tbl)  │              │              │
└──────────────┘              └──────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
            ┌─────────────┐  ┌─────────────┐  ┌────────────┐
            │user_favorite│  │ user_rating │  │ view_event │
            │   (M:N)     │  │    (M:N)    │  │   (1:N)    │
            └─────────────┘  └─────────────┘  └────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  LOOKUP TABLES                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│    author    │  │  manga_type  │  │   category   │  │ manga_alt_name   │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              ANALYTICS/RANKING TABLES                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────┐  ┌───────────────────┐  ┌───────────────────────────┐
│ manga_stats_daily │  │ manga_stats_weekly│  │ manga_ranking_snapshot    │
│ (aggregated)      │  │ (materialized)    │  │ (materialized view)       │
└───────────────────┘  └───────────────────┘  └───────────────────────────┘
```

---

## 2. Database Approach

**Recommended: PostgreSQL 15+**

### Why PostgreSQL?

1. **Full-text search** with `tsvector`, `tsquery`, and GIN indexes
2. **Trigram similarity** via `pg_trgm` for fuzzy matching alternate names
3. **Materialized views** for efficient ranking queries
4. **JSON/JSONB** support for flexible metadata
5. **Partial indexes** for optimized filtered queries
6. **Table partitioning** for view_events (time-series data)

### Extensions Required

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- Trigram similarity
CREATE EXTENSION IF NOT EXISTS unaccent;     -- Remove accents for search
CREATE EXTENSION IF NOT EXISTS btree_gin;    -- GIN index for integers
```

---

## 3. Complete DDL Schema

### 3.1 Core Tables

```sql
-- ============================================================================
-- CORE: manga (renamed from series for clarity)
-- ============================================================================
CREATE TABLE manga (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(500) NOT NULL UNIQUE,
    description     TEXT,
    thumbnail_url   VARCHAR(1000),
    cover_url       VARCHAR(1000),
    status          VARCHAR(20) NOT NULL DEFAULT 'ongoing'
                    CHECK (status IN ('ongoing', 'completed', 'dropped', 'hiatus')),
    release_date    DATE,
    year            SMALLINT,
    is_featured     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,

    -- Denormalized counters (updated via triggers/jobs)
    total_views         BIGINT DEFAULT 0,
    total_favorites     INTEGER DEFAULT 0,
    total_chapters      INTEGER DEFAULT 0,
    average_rating      DECIMAL(3, 2) DEFAULT 0.00,
    rating_count        INTEGER DEFAULT 0,

    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    last_chapter_at     TIMESTAMPTZ,  -- When latest chapter was added

    -- Full-text search vector
    search_vector       TSVECTOR
);

-- ============================================================================
-- CORE: chapter
-- ============================================================================
CREATE TABLE chapter (
    id              BIGSERIAL PRIMARY KEY,
    manga_id        BIGINT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
    chapter_number  DECIMAL(10, 2) NOT NULL,  -- Supports 10.5, 10.1, etc.
    title           VARCHAR(500),
    slug            VARCHAR(500) NOT NULL,
    page_count      INTEGER DEFAULT 0,
    views           BIGINT DEFAULT 0,
    is_published    BOOLEAN DEFAULT FALSE,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(manga_id, chapter_number),
    UNIQUE(manga_id, slug)
);

-- ============================================================================
-- CORE: chapter_page
-- ============================================================================
CREATE TABLE chapter_page (
    id                  BIGSERIAL PRIMARY KEY,
    chapter_id          BIGINT NOT NULL REFERENCES chapter(id) ON DELETE CASCADE,
    page_number         INTEGER NOT NULL,
    image_url           VARCHAR(1000) NOT NULL,
    original_filename   VARCHAR(500),
    width               INTEGER,
    height              INTEGER,
    file_size           INTEGER,
    created_at          TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(chapter_id, page_number)
);
```

### 3.2 Lookup/Reference Tables

```sql
-- ============================================================================
-- LOOKUP: author
-- ============================================================================
CREATE TABLE author (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    bio         TEXT,
    image_url   VARCHAR(1000),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LOOKUP: manga_type (manga, manhwa, manhua, webtoon, etc.)
-- ============================================================================
CREATE TABLE manga_type (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    slug        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- ============================================================================
-- LOOKUP: category (genre)
-- ============================================================================
CREATE TABLE category (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon        VARCHAR(255)
);

-- ============================================================================
-- LOOKUP: manga_alt_name (alternate titles)
-- ============================================================================
CREATE TABLE manga_alt_name (
    id          BIGSERIAL PRIMARY KEY,
    manga_id    BIGINT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
    name        VARCHAR(500) NOT NULL,
    language    VARCHAR(10),  -- 'en', 'jp', 'kr', 'cn', etc.

    UNIQUE(manga_id, name)
);
```

### 3.3 Many-to-Many Join Tables

```sql
-- ============================================================================
-- JOIN: manga_author
-- ============================================================================
CREATE TABLE manga_author (
    manga_id    BIGINT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
    author_id   BIGINT NOT NULL REFERENCES author(id) ON DELETE CASCADE,
    role        VARCHAR(50) DEFAULT 'author',  -- 'author', 'artist', 'both'
    PRIMARY KEY (manga_id, author_id)
);

-- ============================================================================
-- JOIN: manga_type_mapping
-- ============================================================================
CREATE TABLE manga_type_mapping (
    manga_id        BIGINT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
    manga_type_id   INTEGER NOT NULL REFERENCES manga_type(id) ON DELETE CASCADE,
    PRIMARY KEY (manga_id, manga_type_id)
);

-- ============================================================================
-- JOIN: manga_category
-- ============================================================================
CREATE TABLE manga_category (
    manga_id    BIGINT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES category(id) ON DELETE CASCADE,
    PRIMARY KEY (manga_id, category_id)
);
```

### 3.4 User Tables

```sql
-- ============================================================================
-- USER: users
-- ============================================================================
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMPTZ,
    password        VARCHAR(255) NOT NULL,
    role            VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    avatar_url      VARCHAR(1000),
    remember_token  VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER: user_favorite (per-user favorites)
-- ============================================================================
CREATE TABLE user_favorite (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    manga_id    BIGINT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, manga_id)
);

-- ============================================================================
-- USER: user_rating
-- ============================================================================
CREATE TABLE user_rating (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    manga_id    BIGINT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
    rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 10),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, manga_id)
);

-- ============================================================================
-- USER: user_reading_progress (chapter-level progress)
-- ============================================================================
CREATE TABLE user_reading_progress (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    manga_id        BIGINT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
    chapter_id      BIGINT NOT NULL REFERENCES chapter(id) ON DELETE CASCADE,
    last_page       INTEGER DEFAULT 1,
    is_completed    BOOLEAN DEFAULT FALSE,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, chapter_id)
);

-- ============================================================================
-- USER: user_reading_session (for reading time tracking)
-- ============================================================================
CREATE TABLE user_reading_session (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    manga_id        BIGINT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
    chapter_id      BIGINT NOT NULL REFERENCES chapter(id) ON DELETE CASCADE,
    session_token   VARCHAR(100),  -- For anonymous users
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    duration_seconds INTEGER,
    pages_read      INTEGER DEFAULT 0
);
```

### 3.5 Analytics Tables

```sql
-- ============================================================================
-- ANALYTICS: view_event (partitioned by month for performance)
-- ============================================================================
CREATE TABLE view_event (
    id              BIGSERIAL,
    manga_id        BIGINT NOT NULL,
    chapter_id      BIGINT,
    user_id         BIGINT,
    session_id      VARCHAR(100),
    ip_hash         VARCHAR(64),  -- Hashed for privacy
    user_agent      VARCHAR(500),
    country_code    CHAR(2),
    viewed_at       TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id, viewed_at)
) PARTITION BY RANGE (viewed_at);

-- Create monthly partitions (example for 2025)
CREATE TABLE view_event_2025_01 PARTITION OF view_event
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE view_event_2025_02 PARTITION OF view_event
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- Continue for other months...

-- ============================================================================
-- ANALYTICS: manga_stats_daily (aggregated daily stats)
-- ============================================================================
CREATE TABLE manga_stats_daily (
    id              BIGSERIAL PRIMARY KEY,
    manga_id        BIGINT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
    stat_date       DATE NOT NULL,
    views           INTEGER DEFAULT 0,
    unique_viewers  INTEGER DEFAULT 0,
    favorites_added INTEGER DEFAULT 0,
    favorites_removed INTEGER DEFAULT 0,
    ratings_count   INTEGER DEFAULT 0,
    ratings_sum     INTEGER DEFAULT 0,
    chapters_read   INTEGER DEFAULT 0,
    reading_time_seconds BIGINT DEFAULT 0,

    UNIQUE(manga_id, stat_date)
);

-- ============================================================================
-- ANALYTICS: manga_stats_weekly (materialized view)
-- ============================================================================
CREATE MATERIALIZED VIEW manga_stats_weekly AS
SELECT
    manga_id,
    DATE_TRUNC('week', stat_date)::DATE AS week_start,
    SUM(views) AS total_views,
    SUM(unique_viewers) AS total_unique_viewers,
    SUM(favorites_added - favorites_removed) AS net_favorites,
    SUM(chapters_read) AS total_chapters_read,
    SUM(reading_time_seconds) AS total_reading_time,
    CASE
        WHEN SUM(ratings_count) > 0
        THEN ROUND(SUM(ratings_sum)::DECIMAL / SUM(ratings_count), 2)
        ELSE NULL
    END AS avg_rating
FROM manga_stats_daily
WHERE stat_date >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY manga_id, DATE_TRUNC('week', stat_date)
WITH DATA;

CREATE UNIQUE INDEX idx_manga_stats_weekly_unique ON manga_stats_weekly(manga_id, week_start);

-- ============================================================================
-- ANALYTICS: manga_ranking_snapshot (computed rankings)
-- ============================================================================
CREATE MATERIALIZED VIEW manga_ranking_snapshot AS
WITH
recent_stats AS (
    SELECT
        manga_id,
        SUM(views) AS views_7d,
        SUM(unique_viewers) AS viewers_7d,
        SUM(favorites_added) AS favorites_7d,
        SUM(chapters_read) AS chapters_read_7d,
        SUM(reading_time_seconds) AS reading_time_7d
    FROM manga_stats_daily
    WHERE stat_date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY manga_id
),
prev_stats AS (
    SELECT
        manga_id,
        SUM(views) AS views_prev_7d
    FROM manga_stats_daily
    WHERE stat_date >= CURRENT_DATE - INTERVAL '14 days'
      AND stat_date < CURRENT_DATE - INTERVAL '7 days'
    GROUP BY manga_id
)
SELECT
    m.id AS manga_id,
    m.title,
    m.total_views,
    m.total_favorites,
    m.average_rating,
    m.rating_count,
    m.last_chapter_at,
    COALESCE(rs.views_7d, 0) AS views_7d,
    COALESCE(rs.viewers_7d, 0) AS viewers_7d,
    COALESCE(rs.favorites_7d, 0) AS favorites_7d,
    COALESCE(rs.chapters_read_7d, 0) AS chapters_read_7d,
    COALESCE(rs.reading_time_7d, 0) AS reading_time_7d,

    -- Top Manga Score (configurable weights)
    (
        COALESCE(m.total_views, 0) * 0.3 +
        COALESCE(m.total_favorites, 0) * 100 * 0.25 +
        COALESCE(m.average_rating, 0) * COALESCE(m.rating_count, 0) * 10 * 0.25 +
        CASE
            WHEN m.last_chapter_at > NOW() - INTERVAL '7 days' THEN 1000
            WHEN m.last_chapter_at > NOW() - INTERVAL '30 days' THEN 500
            ELSE 0
        END * 0.2
    ) AS top_score,

    -- Top Reading Score (based on reading activity)
    (
        COALESCE(rs.chapters_read_7d, 0) * 10 +
        COALESCE(rs.reading_time_7d, 0) / 60.0 +  -- minutes
        COALESCE(rs.viewers_7d, 0) * 5
    ) AS reading_score,

    -- Trending/Popular Score (growth-based)
    (
        COALESCE(rs.views_7d, 0) * 2 +
        COALESCE(rs.favorites_7d, 0) * 50 +
        CASE
            WHEN COALESCE(ps.views_prev_7d, 0) > 0
            THEN (COALESCE(rs.views_7d, 0) - COALESCE(ps.views_prev_7d, 0))::FLOAT
                 / COALESCE(ps.views_prev_7d, 1) * 1000
            ELSE COALESCE(rs.views_7d, 0) * 0.1
        END
    ) AS trending_score,

    NOW() AS computed_at
FROM manga m
LEFT JOIN recent_stats rs ON m.id = rs.manga_id
LEFT JOIN prev_stats ps ON m.id = ps.manga_id
WHERE m.is_active = TRUE
WITH DATA;

CREATE UNIQUE INDEX idx_manga_ranking_manga_id ON manga_ranking_snapshot(manga_id);
CREATE INDEX idx_manga_ranking_top ON manga_ranking_snapshot(top_score DESC);
CREATE INDEX idx_manga_ranking_reading ON manga_ranking_snapshot(reading_score DESC);
CREATE INDEX idx_manga_ranking_trending ON manga_ranking_snapshot(trending_score DESC);
```

---

## 4. Indexes

### 4.1 Text Search Indexes

```sql
-- Full-text search on manga title and description
CREATE INDEX idx_manga_search ON manga USING GIN(search_vector);

-- Trigram index for fuzzy search on alternate names
CREATE INDEX idx_manga_alt_name_trgm ON manga_alt_name USING GIN(name gin_trgm_ops);

-- Trigram index on manga title for typo-tolerant search
CREATE INDEX idx_manga_title_trgm ON manga USING GIN(title gin_trgm_ops);

-- Author name search
CREATE INDEX idx_author_name_trgm ON author USING GIN(name gin_trgm_ops);
```

### 4.2 Filter Indexes

```sql
-- Status filter (partial indexes for common queries)
CREATE INDEX idx_manga_ongoing ON manga(id) WHERE status = 'ongoing' AND is_active = TRUE;
CREATE INDEX idx_manga_completed ON manga(id) WHERE status = 'completed' AND is_active = TRUE;

-- Active manga with common sorts
CREATE INDEX idx_manga_active_updated ON manga(updated_at DESC) WHERE is_active = TRUE;
CREATE INDEX idx_manga_active_created ON manga(created_at DESC) WHERE is_active = TRUE;
CREATE INDEX idx_manga_active_views ON manga(total_views DESC) WHERE is_active = TRUE;
CREATE INDEX idx_manga_active_rating ON manga(average_rating DESC, rating_count DESC) WHERE is_active = TRUE;

-- Featured manga
CREATE INDEX idx_manga_featured ON manga(created_at DESC) WHERE is_featured = TRUE AND is_active = TRUE;

-- Category filtering (for category pages)
CREATE INDEX idx_manga_category_manga ON manga_category(manga_id);
CREATE INDEX idx_manga_category_cat ON manga_category(category_id);

-- Type filtering
CREATE INDEX idx_manga_type_mapping_manga ON manga_type_mapping(manga_id);
CREATE INDEX idx_manga_type_mapping_type ON manga_type_mapping(manga_type_id);

-- Author filtering
CREATE INDEX idx_manga_author_manga ON manga_author(manga_id);
CREATE INDEX idx_manga_author_author ON manga_author(author_id);
```

### 4.3 Recent Updates Indexes

```sql
-- Latest chapter updates (most critical for "recently updated")
CREATE INDEX idx_manga_last_chapter ON manga(last_chapter_at DESC NULLS LAST) WHERE is_active = TRUE;

-- Chapter published date
CREATE INDEX idx_chapter_published ON chapter(published_at DESC) WHERE is_published = TRUE;
CREATE INDEX idx_chapter_manga_published ON chapter(manga_id, published_at DESC) WHERE is_published = TRUE;
```

### 4.4 User Data Indexes

```sql
-- User favorites lookup
CREATE INDEX idx_user_favorite_user ON user_favorite(user_id, created_at DESC);
CREATE INDEX idx_user_favorite_manga ON user_favorite(manga_id);

-- User reading progress
CREATE INDEX idx_user_progress_user ON user_reading_progress(user_id, updated_at DESC);
CREATE INDEX idx_user_progress_manga ON user_reading_progress(manga_id, user_id);

-- Reading sessions for analytics
CREATE INDEX idx_reading_session_manga ON user_reading_session(manga_id, started_at DESC);
CREATE INDEX idx_reading_session_user ON user_reading_session(user_id, started_at DESC) WHERE user_id IS NOT NULL;
```

### 4.5 Analytics Indexes

```sql
-- View events (on partitions)
CREATE INDEX idx_view_event_manga ON view_event(manga_id, viewed_at DESC);
CREATE INDEX idx_view_event_chapter ON view_event(chapter_id, viewed_at DESC) WHERE chapter_id IS NOT NULL;

-- Daily stats
CREATE INDEX idx_stats_daily_date ON manga_stats_daily(stat_date DESC);
CREATE INDEX idx_stats_daily_manga_date ON manga_stats_daily(manga_id, stat_date DESC);
```

---

## 5. Full-Text Search Implementation

### 5.1 Search Vector Setup

```sql
-- Function to update search vector
CREATE OR REPLACE FUNCTION update_manga_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
CREATE TRIGGER trigger_manga_search_vector
    BEFORE INSERT OR UPDATE OF title, description ON manga
    FOR EACH ROW EXECUTE FUNCTION update_manga_search_vector();

-- Also include alternate names in search
CREATE OR REPLACE FUNCTION search_manga_with_alt_names(search_term TEXT)
RETURNS TABLE(
    manga_id BIGINT,
    title VARCHAR,
    relevance FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (m.id)
        m.id,
        m.title,
        GREATEST(
            ts_rank(m.search_vector, plainto_tsquery('english', search_term)),
            COALESCE(similarity(m.title, search_term), 0),
            COALESCE(MAX(similarity(alt.name, search_term)), 0)
        ) AS relevance
    FROM manga m
    LEFT JOIN manga_alt_name alt ON m.id = alt.manga_id
    WHERE
        m.is_active = TRUE
        AND (
            m.search_vector @@ plainto_tsquery('english', search_term)
            OR m.title % search_term
            OR alt.name % search_term
        )
    GROUP BY m.id
    ORDER BY m.id, relevance DESC;
END;
$$ LANGUAGE plpgsql;
```

### 5.2 Combined Search Query

```sql
-- Full combined search with all filters
WITH search_results AS (
    SELECT DISTINCT m.id, m.title, m.slug, m.thumbnail_url, m.status,
           m.average_rating, m.total_views, m.last_chapter_at,
           GREATEST(
               ts_rank(m.search_vector, websearch_to_tsquery('english', :search_term)) * 2,
               COALESCE(similarity(m.title, :search_term), 0),
               COALESCE(MAX(alt.name <-> :search_term), 0)
           ) AS relevance
    FROM manga m
    LEFT JOIN manga_alt_name alt ON m.id = alt.manga_id
    LEFT JOIN manga_category mc ON m.id = mc.manga_id
    LEFT JOIN manga_type_mapping mtm ON m.id = mtm.manga_id
    LEFT JOIN manga_author ma ON m.id = ma.manga_id
    WHERE
        m.is_active = TRUE
        -- Text search (title, description, alt names)
        AND (
            :search_term IS NULL
            OR m.search_vector @@ websearch_to_tsquery('english', :search_term)
            OR m.title ILIKE '%' || :search_term || '%'
            OR alt.name % :search_term
        )
        -- Status filter
        AND (:status IS NULL OR m.status = :status)
        -- Category filter (any match)
        AND (:category_ids IS NULL OR mc.category_id = ANY(:category_ids))
        -- Type filter (any match)
        AND (:type_ids IS NULL OR mtm.manga_type_id = ANY(:type_ids))
        -- Author filter
        AND (:author_ids IS NULL OR ma.author_id = ANY(:author_ids))
        -- Release date range
        AND (:release_from IS NULL OR m.release_date >= :release_from)
        AND (:release_to IS NULL OR m.release_date <= :release_to)
    GROUP BY m.id
)
SELECT * FROM search_results
ORDER BY
    CASE WHEN :sort = 'relevance' THEN relevance END DESC,
    CASE WHEN :sort = 'latest' THEN last_chapter_at END DESC,
    CASE WHEN :sort = 'rating' THEN average_rating END DESC,
    CASE WHEN :sort = 'views' THEN total_views END DESC,
    CASE WHEN :sort = 'title' THEN title END ASC
LIMIT :limit OFFSET :offset;
```

---

## 6. Ranking Queries

### 6.1 Top Manga (Overall Best)

```sql
-- Uses the materialized view
SELECT
    m.id, m.title, m.slug, m.thumbnail_url, m.status,
    m.average_rating, m.total_views, m.total_favorites,
    r.top_score
FROM manga_ranking_snapshot r
JOIN manga m ON r.manga_id = m.id
WHERE m.is_active = TRUE
ORDER BY r.top_score DESC
LIMIT 20 OFFSET 0;
```

### 6.2 Top Reading (Most Active Readers)

```sql
-- Based on reading activity
SELECT
    m.id, m.title, m.slug, m.thumbnail_url,
    r.chapters_read_7d,
    r.reading_time_7d / 3600 AS hours_read,
    r.viewers_7d AS active_readers,
    r.reading_score
FROM manga_ranking_snapshot r
JOIN manga m ON r.manga_id = m.id
WHERE m.is_active = TRUE
ORDER BY r.reading_score DESC
LIMIT 20 OFFSET 0;
```

### 6.3 Popular/Trending (Growth-Based)

```sql
-- Based on recent growth and momentum
SELECT
    m.id, m.title, m.slug, m.thumbnail_url,
    r.views_7d,
    r.favorites_7d,
    r.trending_score,
    CASE
        WHEN r.views_7d > 0 THEN 'hot'
        ELSE 'rising'
    END AS trend_status
FROM manga_ranking_snapshot r
JOIN manga m ON r.manga_id = m.id
WHERE m.is_active = TRUE
ORDER BY r.trending_score DESC
LIMIT 20 OFFSET 0;
```

### 6.4 Recently Updated

```sql
-- Manga with newest chapters
SELECT
    m.id, m.title, m.slug, m.thumbnail_url,
    m.last_chapter_at,
    c.chapter_number AS latest_chapter,
    c.title AS latest_chapter_title
FROM manga m
JOIN chapter c ON m.id = c.manga_id AND c.is_published = TRUE
WHERE m.is_active = TRUE
  AND c.published_at = (
      SELECT MAX(c2.published_at)
      FROM chapter c2
      WHERE c2.manga_id = m.id AND c2.is_published = TRUE
  )
ORDER BY m.last_chapter_at DESC
LIMIT 20 OFFSET 0;
```

### 6.5 Recently Added

```sql
-- Newest manga added to the platform
SELECT
    m.id, m.title, m.slug, m.thumbnail_url, m.status,
    m.created_at,
    COUNT(c.id) AS chapter_count
FROM manga m
LEFT JOIN chapter c ON m.id = c.manga_id AND c.is_published = TRUE
WHERE m.is_active = TRUE
GROUP BY m.id
ORDER BY m.created_at DESC
LIMIT 20 OFFSET 0;
```

---

## 7. Refresh Strategy for Materialized Views

```sql
-- Daily refresh job (run via cron or Laravel scheduler)
REFRESH MATERIALIZED VIEW CONCURRENTLY manga_stats_weekly;
REFRESH MATERIALIZED VIEW CONCURRENTLY manga_ranking_snapshot;

-- Aggregate daily stats job (run hourly, upsert for current day)
INSERT INTO manga_stats_daily (manga_id, stat_date, views, unique_viewers)
SELECT
    manga_id,
    CURRENT_DATE,
    COUNT(*),
    COUNT(DISTINCT COALESCE(user_id::TEXT, ip_hash))
FROM view_event
WHERE viewed_at >= CURRENT_DATE
GROUP BY manga_id
ON CONFLICT (manga_id, stat_date)
DO UPDATE SET
    views = EXCLUDED.views,
    unique_viewers = EXCLUDED.unique_viewers;
```

---

## 8. REST API Endpoints

### 8.1 Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/manga` | List manga with filters + pagination |
| GET | `/api/v1/manga/{slug}` | Manga detail |
| GET | `/api/v1/manga/{slug}/chapters` | Chapter list for manga |
| GET | `/api/v1/chapters/{id}/pages` | Pages for chapter |
| GET | `/api/v1/search` | Advanced search |
| GET | `/api/v1/rankings/top` | Top manga |
| GET | `/api/v1/rankings/reading` | Top reading |
| GET | `/api/v1/rankings/trending` | Trending manga |
| GET | `/api/v1/manga/recent` | Recently updated |
| GET | `/api/v1/manga/new` | Recently added |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/types` | List manga types |
| GET | `/api/v1/authors` | List authors |

### 8.2 Authenticated User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/manga/{id}/favorite` | Add to favorites |
| DELETE | `/api/v1/manga/{id}/favorite` | Remove from favorites |
| GET | `/api/v1/user/favorites` | User's favorites list |
| POST | `/api/v1/manga/{id}/rate` | Rate manga |
| POST | `/api/v1/reading/progress` | Update reading progress |
| GET | `/api/v1/reading/history` | Reading history |
| POST | `/api/v1/reading/session/start` | Start reading session |
| POST | `/api/v1/reading/session/end` | End reading session |

### 8.3 Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/manga` | Create manga |
| PUT | `/api/v1/admin/manga/{id}` | Update manga |
| DELETE | `/api/v1/admin/manga/{id}` | Delete manga |
| POST | `/api/v1/admin/chapters` | Create chapter |
| PUT | `/api/v1/admin/chapters/{id}` | Update chapter |
| DELETE | `/api/v1/admin/chapters/{id}` | Delete chapter |
| POST | `/api/v1/admin/upload` | Upload images |
| POST | `/api/v1/admin/authors` | Create author |
| PUT | `/api/v1/admin/authors/{id}` | Update author |

---

## 9. Example API Request/Response

### 9.1 Search Request

```
GET /api/v1/search?q=one+piece&categories[]=1&categories[]=5&status=ongoing&sort=relevance&page=1&per_page=20
```

### 9.2 Search Response

```json
{
    "data": [
        {
            "id": 123,
            "title": "One Piece",
            "slug": "one-piece",
            "thumbnail_url": "https://cdn.example.com/manga/123/thumb.webp",
            "status": "ongoing",
            "average_rating": 9.5,
            "total_views": 15000000,
            "total_chapters": 1100,
            "last_chapter_at": "2025-01-25T10:00:00Z",
            "categories": [
                {"id": 1, "name": "Action", "slug": "action"},
                {"id": 5, "name": "Adventure", "slug": "adventure"}
            ],
            "types": [
                {"id": 1, "name": "Manga", "slug": "manga"}
            ],
            "authors": [
                {"id": 1, "name": "Eiichiro Oda", "role": "both"}
            ]
        }
    ],
    "meta": {
        "current_page": 1,
        "per_page": 20,
        "total": 1,
        "total_pages": 1
    },
    "filters_applied": {
        "query": "one piece",
        "categories": [1, 5],
        "status": "ongoing",
        "sort": "relevance"
    }
}
```

---

## 10. Caching Strategy

### 10.1 Redis Cache Layers

```php
// Cache keys and TTLs
return [
    // Static/semi-static data
    'categories' => 3600,           // 1 hour
    'types' => 3600,                // 1 hour
    'authors:list' => 1800,         // 30 min

    // Manga data
    'manga:{id}' => 300,            // 5 min
    'manga:{slug}' => 300,          // 5 min
    'manga:{id}:chapters' => 300,   // 5 min

    // Rankings (refresh with materialized views)
    'rankings:top' => 900,          // 15 min
    'rankings:reading' => 900,      // 15 min
    'rankings:trending' => 300,     // 5 min (more dynamic)

    // Search (hash-based key)
    'search:{hash}' => 180,         // 3 min

    // User-specific (shorter TTL)
    'user:{id}:favorites' => 60,    // 1 min
    'user:{id}:progress' => 60,     // 1 min
];
```

### 10.2 Cache Invalidation

```php
// Events that trigger cache invalidation
'manga.updated' => ['manga:{id}', 'manga:{slug}', 'search:*'],
'chapter.created' => ['manga:{manga_id}:chapters', 'rankings:*', 'manga:recent'],
'favorite.changed' => ['user:{user_id}:favorites', 'manga:{manga_id}'],
'rating.changed' => ['manga:{manga_id}', 'rankings:top'],
```

---

## 11. CDN Configuration for Images

### 11.1 URL Structure

```
https://cdn.mangasite.com/manga/{manga_id}/cover.webp
https://cdn.mangasite.com/manga/{manga_id}/thumb.webp
https://cdn.mangasite.com/manga/{manga_id}/chapters/{chapter_id}/pages/{page_number}.webp
```

### 11.2 Image Processing Pipeline

1. **Upload** → Laravel receives original image
2. **Process** → Generate multiple sizes (thumb, medium, large)
3. **Convert** → Convert to WebP for smaller file sizes
4. **Upload to S3** → Store on S3 with CloudFront CDN
5. **Store URL** → Save CDN URL in database

### 11.3 Recommended Image Sizes

| Type | Dimensions | Quality | Use Case |
|------|------------|---------|----------|
| Thumbnail | 200x280 | 80% | Grid listings |
| Cover Medium | 400x560 | 85% | Manga detail |
| Cover Large | 800x1120 | 90% | Hero sections |
| Page | Original | 90% | Reader |
| Page Preview | 150xAuto | 75% | Chapter preview |

---

## 12. Data Integrity Rules

### 12.1 Database Constraints

- All foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` as appropriate
- Unique constraints prevent duplicate entries
- Check constraints validate enum values and numeric ranges

### 12.2 Application-Level Validation

```php
// Manga validation rules
[
    'title' => 'required|string|max:500',
    'slug' => 'required|string|max:500|unique:manga,slug',
    'status' => 'required|in:ongoing,completed,dropped,hiatus',
    'categories' => 'array|min:1',
    'categories.*' => 'exists:category,id',
    'types' => 'array|min:1',
    'types.*' => 'exists:manga_type,id',
];
```

### 12.3 Triggers for Data Consistency

```sql
-- Update manga chapter count when chapter is added/removed
CREATE OR REPLACE FUNCTION update_manga_chapter_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE manga
        SET total_chapters = (
            SELECT COUNT(*) FROM chapter
            WHERE manga_id = NEW.manga_id AND is_published = TRUE
        ),
        last_chapter_at = (
            SELECT MAX(published_at) FROM chapter
            WHERE manga_id = NEW.manga_id AND is_published = TRUE
        ),
        updated_at = NOW()
        WHERE id = NEW.manga_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE manga
        SET total_chapters = (
            SELECT COUNT(*) FROM chapter
            WHERE manga_id = OLD.manga_id AND is_published = TRUE
        ),
        last_chapter_at = (
            SELECT MAX(published_at) FROM chapter
            WHERE manga_id = OLD.manga_id AND is_published = TRUE
        ),
        updated_at = NOW()
        WHERE id = OLD.manga_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_manga_chapter_count
    AFTER INSERT OR UPDATE OR DELETE ON chapter
    FOR EACH ROW EXECUTE FUNCTION update_manga_chapter_count();

-- Update manga favorites count
CREATE OR REPLACE FUNCTION update_manga_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE manga SET total_favorites = total_favorites + 1 WHERE id = NEW.manga_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE manga SET total_favorites = total_favorites - 1 WHERE id = OLD.manga_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_favorites_count
    AFTER INSERT OR DELETE ON user_favorite
    FOR EACH ROW EXECUTE FUNCTION update_manga_favorites_count();

-- Update manga average rating
CREATE OR REPLACE FUNCTION update_manga_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE manga
    SET
        average_rating = (SELECT ROUND(AVG(rating)::DECIMAL, 2) FROM user_rating WHERE manga_id = COALESCE(NEW.manga_id, OLD.manga_id)),
        rating_count = (SELECT COUNT(*) FROM user_rating WHERE manga_id = COALESCE(NEW.manga_id, OLD.manga_id))
    WHERE id = COALESCE(NEW.manga_id, OLD.manga_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_manga_rating
    AFTER INSERT OR UPDATE OR DELETE ON user_rating
    FOR EACH ROW EXECUTE FUNCTION update_manga_rating();
```

---

## 13. Migration Path from Current Schema

Since the current schema uses `series` instead of `manga`, here's the migration strategy:

1. **Rename tables** in a migration (or use table aliases)
2. **Add new columns** for missing fields
3. **Create new tables** for authors, types, alt names
4. **Migrate data** from single `author` string to `author` table
5. **Create materialized views** for rankings
6. **Add indexes** progressively

Alternatively, keep `series` naming but follow the same structure outlined above.

---

## 14. Laravel Scheduler Jobs

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    // Aggregate view stats every hour
    $schedule->command('stats:aggregate-hourly')->hourly();

    // Refresh rankings every 15 minutes
    $schedule->command('rankings:refresh')->everyFifteenMinutes();

    // Refresh weekly stats daily at 1 AM
    $schedule->command('stats:refresh-weekly')->dailyAt('01:00');

    // Clean old view events monthly (partition management)
    $schedule->command('maintenance:clean-view-events')->monthly();

    // Warm cache for top manga
    $schedule->command('cache:warm-rankings')->everyFifteenMinutes();
}
```

---

This architecture provides a solid foundation for a scalable manga reading platform with comprehensive search, ranking, and analytics capabilities.
