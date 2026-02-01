# React Component Specifications

## Component Structure and Implementation Details

### 1. Common Components

#### Navbar.jsx
**Purpose:** Main navigation bar with search and theme toggle

**Props:**
- None (uses context for theme/auth)

**Features:**
- Logo/Brand name
- Search bar (links to search page)
- Navigation links (Home, Browse)
- Theme toggle button
- User menu (if authenticated)

**State:**
- Mobile menu open/closed
- Search query (local)

**Example:**
```jsx
<Navbar />
```

#### Footer.jsx
**Purpose:** Site footer with links and information

**Props:** None

**Features:**
- Copyright information
- Quick links
- Social media links (optional)

#### LoadingSpinner.jsx
**Purpose:** Loading indicator component

**Props:**
- `size` (string): 'sm', 'md', 'lg'
- `fullScreen` (boolean): Show as full screen overlay

**Example:**
```jsx
<LoadingSpinner size="lg" fullScreen={false} />
```

#### ErrorBoundary.jsx
**Purpose:** Catch and display React errors gracefully

**Props:**
- `children`: React children
- `fallback`: Custom error component (optional)

**Features:**
- Catches component errors
- Displays user-friendly error message
- Option to retry or go home

#### ThemeToggle.jsx
**Purpose:** Toggle between dark and light theme

**Props:** None (uses ThemeContext)

**Features:**
- Icon button
- Smooth transition
- Persists to localStorage

---

### 2. Series Components

#### SeriesCard.jsx
**Purpose:** Display a single series card

**Props:**
- `series` (object): Series data
- `onClick` (function): Click handler

**Features:**
- Thumbnail image with lazy loading
- Title
- Latest chapter badge
- View count
- Rating stars
- Hover effects

**Example:**
```jsx
<SeriesCard 
  series={seriesData} 
  onClick={() => navigate(`/series/${seriesData.slug}`)} 
/>
```

#### SeriesGrid.jsx
**Purpose:** Display grid of series cards

**Props:**
- `series` (array): Array of series objects
- `loading` (boolean): Loading state
- `columns` (number): Grid columns (responsive)

**Features:**
- Responsive grid layout
- Infinite scroll support
- Loading skeleton cards

**Example:**
```jsx
<SeriesGrid 
  series={seriesList} 
  loading={isLoading}
  columns={4}
/>
```

#### SeriesDetail.jsx
**Purpose:** Series detail page component

**Props:**
- `seriesSlug` (string): Series slug from route

**Features:**
- Cover image
- Series information (title, description, author, etc.)
- Category and tag badges
- Action buttons (Read, Bookmark)
- Chapter list
- Related series (optional)

**State:**
- Series data
- Chapters data
- Loading state
- Error state

**Example:**
```jsx
<SeriesDetail seriesSlug="one-piece" />
```

#### SeriesInfo.jsx
**Purpose:** Display series metadata

**Props:**
- `series` (object): Series data

**Features:**
- Title and description
- Author/Artist
- Status badge
- Rating display
- View count
- Category tags
- Genre tags

---

### 3. Chapter Components

#### ChapterList.jsx
**Purpose:** Display list of chapters for a series

**Props:**
- `chapters` (array): Array of chapter objects
- `seriesSlug` (string): Series slug
- `loading` (boolean): Loading state

**Features:**
- Paginated or infinite scroll
- Chapter number and title
- View count
- Published date
- Click to read

**Example:**
```jsx
<ChapterList 
  chapters={chapters} 
  seriesSlug="one-piece"
  loading={isLoading}
/>
```

#### ChapterItem.jsx
**Purpose:** Single chapter list item

**Props:**
- `chapter` (object): Chapter data
- `seriesSlug` (string): Series slug
- `onClick` (function): Click handler

**Features:**
- Chapter number
- Title
- View count
- Published date
- Read indicator (if user authenticated)

#### ChapterNavigation.jsx
**Purpose:** Navigate between chapters

**Props:**
- `currentChapter` (object): Current chapter data
- `previousChapter` (object|null): Previous chapter
- `nextChapter` (object|null): Next chapter
- `seriesSlug` (string): Series slug

**Features:**
- Previous/Next buttons
- Chapter list dropdown
- Series info link

---

### 4. Reader Components

#### ReaderView.jsx
**Purpose:** Main chapter reader component

**Props:**
- `chapterId` (number): Chapter ID
- `seriesSlug` (string): Series slug
- `chapterNumber` (number): Chapter number

**Features:**
- Page viewer
- Navigation controls
- Reading progress tracking
- Fullscreen mode
- Keyboard shortcuts (arrow keys, space)

**State:**
- Current page
- Chapter data
- Loading state
- Fullscreen state

**Example:**
```jsx
<ReaderView 
  chapterId={100}
  seriesSlug="one-piece"
  chapterNumber={1100}
/>
```

#### ReaderControls.jsx
**Purpose:** Reader control buttons and settings

**Props:**
- `onPrevious` (function): Previous chapter handler
- `onNext` (function): Next chapter handler
- `onFullscreen` (function): Toggle fullscreen
- `onSettings` (function): Open settings

**Features:**
- Previous/Next chapter buttons
- Fullscreen toggle
- Settings menu (reading mode, page fit)
- Progress indicator

#### PageViewer.jsx
**Purpose:** Display individual page image

**Props:**
- `imageUrl` (string): Image URL
- `pageNumber` (number): Page number
- `fitMode` (string): 'width' | 'height' | 'original'

**Features:**
- Lazy loading
- Progressive image loading
- Zoom controls
- Click to next page
- Loading placeholder

**Example:**
```jsx
<PageViewer 
  imageUrl="https://cdn.example.com/chapters/100/001.jpg"
  pageNumber={1}
  fitMode="width"
/>
```

---

### 5. Search Components

#### SearchBar.jsx
**Purpose:** Search input component

**Props:**
- `onSearch` (function): Search handler
- `placeholder` (string): Input placeholder
- `debounceMs` (number): Debounce delay (default: 300)

**Features:**
- Debounced input
- Search icon
- Clear button
- Keyboard shortcut (Ctrl+K / Cmd+K)

**State:**
- Search query

**Example:**
```jsx
<SearchBar 
  onSearch={(query) => navigate(`/search?q=${query}`)}
  placeholder="Search series..."
/>
```

#### SearchResults.jsx
**Purpose:** Display search results

**Props:**
- `query` (string): Search query
- `results` (array): Search results
- `loading` (boolean): Loading state

**Features:**
- Results list/grid
- Result count
- No results message
- Pagination

---

### 6. Filter Components

#### CategoryFilter.jsx
**Purpose:** Filter series by category

**Props:**
- `categories` (array): Available categories
- `selectedCategories` (array): Selected category IDs
- `onChange` (function): Selection change handler

**Features:**
- Multi-select checkboxes
- Category icons
- Clear all button

**Example:**
```jsx
<CategoryFilter 
  categories={categories}
  selectedCategories={selected}
  onChange={setSelected}
/>
```

#### TagFilter.jsx
**Purpose:** Filter series by tags

**Props:**
- `tags` (array): Available tags
- `selectedTags` (array): Selected tag IDs
- `onChange` (function): Selection change handler

**Features:**
- Multi-select tags
- Tag chips/badges
- Clear selection

#### SortFilter.jsx
**Purpose:** Sort series list

**Props:**
- `value` (string): Current sort value
- `onChange` (function): Sort change handler

**Features:**
- Dropdown select
- Options: Latest, Popular, Rating, Alphabetical

**Example:**
```jsx
<SortFilter 
  value="latest"
  onChange={setSort}
/>
```

---

## 7. Pages

### Home.jsx
**Purpose:** Home page with latest updates

**Route:** `/`

**Features:**
- Latest updated series section
- Popular series section
- Trending series section
- Category quick links

**State Management:**
- Uses React Query or SWR for data fetching
- Caches data for fast navigation

**Example Structure:**
```jsx
function Home() {
  const { data: latest, isLoading } = useLatestSeries();
  const { data: popular } = usePopularSeries();
  const { data: trending } = useTrendingSeries();

  return (
    <div>
      <Section title="Latest Updates">
        <SeriesGrid series={latest} />
      </Section>
      <Section title="Popular">
        <SeriesGrid series={popular} />
      </Section>
      <Section title="Trending">
        <SeriesGrid series={trending} />
      </Section>
    </div>
  );
}
```

### Browse.jsx
**Purpose:** Browse page with filters and search

**Route:** `/browse`

**Features:**
- Search bar
- Category filter
- Tag filter
- Sort options
- Series grid
- Pagination/Infinite scroll

**Query Parameters:**
- `q`: Search query
- `category`: Category slug
- `tag`: Tag slug
- `type`: Series type
- `status`: Series status
- `sort`: Sort option
- `page`: Page number

**State:**
- Filters state
- Search query
- Series list
- Loading state
- Pagination state

### SeriesDetail.jsx (Page)
**Purpose:** Series detail page

**Route:** `/series/:slug`

**Features:**
- Series information
- Chapter list
- Related series
- SEO meta tags

**Data Fetching:**
- Fetch series by slug
- Fetch chapters for series
- Fetch related series (optional)

### Reader.jsx (Page)
**Purpose:** Chapter reader page

**Route:** `/read/:seriesSlug/:chapterNumber`

**Features:**
- Chapter reader
- Navigation controls
- Progress tracking
- Fullscreen mode

**Query Parameters:**
- `page`: Current page number (optional)

**State:**
- Chapter data
- Pages data
- Current page
- Reading progress

### NotFound.jsx
**Purpose:** 404 error page

**Route:** `*` (catch-all)

**Features:**
- Error message
- Link to home
- Search bar

---

## 8. Context Providers

### ThemeContext.jsx
**Purpose:** Manage theme state (dark/light)

**State:**
- `theme`: 'dark' | 'light'
- `toggleTheme`: Function to toggle theme

**Persistence:**
- localStorage

**Example:**
```jsx
const { theme, toggleTheme } = useTheme();
```

### AuthContext.jsx (Optional)
**Purpose:** Manage authentication state

**State:**
- `user`: User object or null
- `isAuthenticated`: Boolean
- `login`: Login function
- `logout`: Logout function
- `bookmarks`: User bookmarks

**Example:**
```jsx
const { user, isAuthenticated, bookmarks } = useAuth();
```

### AppContext.jsx
**Purpose:** Global app state

**State:**
- `loading`: Global loading state
- `error`: Global error state
- `notifications`: Notification queue

---

## 9. Custom Hooks

### useApi.js
**Purpose:** API request hook with error handling

**Example:**
```jsx
const { data, loading, error, refetch } = useApi('/api/v1/series');
```

### useDebounce.js
**Purpose:** Debounce value changes

**Example:**
```jsx
const debouncedQuery = useDebounce(searchQuery, 300);
```

### useInfiniteScroll.js
**Purpose:** Infinite scroll detection

**Example:**
```jsx
const { loadMore, hasMore, loading } = useInfiniteScroll(fetchMore);
```

---

## 10. Services

### api.js
**Purpose:** API client with axios/fetch

**Features:**
- Base URL configuration
- Request interceptors
- Response interceptors
- Error handling
- Token management

**Example:**
```jsx
import api from './services/api';

const series = await api.get('/series');
```

### cache.js
**Purpose:** Client-side caching utilities

**Features:**
- localStorage wrapper
- Cache expiration
- Cache invalidation

---

## 11. Utilities

### constants.js
**Purpose:** App constants

**Example:**
```js
export const API_BASE_URL = 'http://localhost:8000/api/v1';
export const ITEMS_PER_PAGE = 20;
export const THEME_STORAGE_KEY = 'manga-app-theme';
```

### helpers.js
**Purpose:** Utility functions

**Examples:**
- Format date
- Format number (views, etc.)
- Generate slug
- Truncate text
- Format chapter number

