# GitHub Copilot Instructions for Information Aggregator & Search Platform

This file guides GitHub Copilot to write code that aligns with our project standards and conventions.

---

## 🎯 Project Context

- **Project**: Information Aggregator & Search Platform
- **Type**: Full-stack web application
- **Primary Purpose**: Search, aggregate, and summarize documents from multiple sources
- **Architecture**: Frontend (React/Vue/Next.js) + Backend (Node.js/Python) + Local Database (SQLite/MongoDB/PostgreSQL)

---

## 📋 Code Style & Conventions

### JavaScript/TypeScript
```javascript
// ✅ DO: Use async/await for promises
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// ❌ DON'T: Use .then().catch() unless necessary
data.then(res => ...).catch(err => ...);

// ✅ DO: Use const/let, prefer const
const API_BASE_URL = 'http://localhost:5000/api';
let currentSearchQuery = '';

// ✅ DO: Use arrow functions for callbacks
const handleSearch = (query) => { ... };

// ✅ DO: Destructure objects
const { id, name, email } = user;

// ✅ DO: Use template literals for strings
const message = `Hello ${name}, your ID is ${id}`;
```

### React Components
```javascript
// ✅ DO: Use functional components with hooks
const SearchComponent = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const data = await searchService.search(query);
    setResults(data);
  };

  return (
    <div className="search-container">
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

// ✅ DO: Keep components small and focused
// ✅ DO: Extract business logic to services
// ❌ DON'T: Call APIs directly in component render
// ❌ DON'T: Use class components unless necessary
```

### Tailwind CSS
```javascript
// ✅ DO: Use Tailwind utility classes
<div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">
  <h2 className="text-lg font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>

// ✅ DO: Use responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// ❌ DON'T: Use inline styles
// ❌ DON'T: Create custom CSS when Tailwind covers it
```

### API Service Layer
```javascript
// ✅ DO: Create service files for API calls
// frontend/src/services/searchService.js
import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

export const searchService = {
  search: async (query, filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },

  getDocument: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/documents/${id}`);
    return response.data;
  },

  getSummary: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/documents/${id}/summary`);
    return response.data;
  }
};

// ✅ DO: Use services in components
const SearchPage = () => {
  const handleSearch = async (query) => {
    const results = await searchService.search(query);
    setResults(results);
  };
};

// ❌ DON'T: Call APIs directly in components
// ❌ DON'T: Hardcode URLs in components
```

### Backend (Express/Node.js)
```javascript
// ✅ DO: Separate routes, controllers, services
// routes/searchRoutes.js
router.get('/search', searchController.search);
router.post('/search/advanced', searchController.advancedSearch);

// controllers/searchController.js
exports.search = async (req, res) => {
  try {
    const { q, filters } = req.query;
    const results = await searchService.search(q, filters);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// services/searchService.js
exports.search = async (query, filters) => {
  // Business logic here
  const results = await db.query('SELECT * FROM documents WHERE ...');
  return results;
};

// ✅ DO: Use middleware for authentication, validation
router.post('/collections', authMiddleware, validateInput, collectionController.create);

// ✅ DO: Use environment variables
const PORT = process.env.PORT || 5000;
const DB_PATH = process.env.DB_PATH || './data/database.sqlite';

// ✅ DO: Handle errors properly
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ❌ DON'T: Query database directly from routes
// ❌ DON'T: Expose internal errors to clients
// ❌ DON'T: Hardcode configuration values
```

### Database & Migrations
```javascript
// ✅ DO: Use migration files for schema changes
// database/migrations/001_create_users.js
module.exports = {
  up: async (db) => {
    await db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  },
  down: async (db) => {
    await db.exec('DROP TABLE users');
  }
};

// ✅ DO: Use seed files for test data
// database/seeds/001_users.js
module.exports = {
  seed: async (db) => {
    await db.run('INSERT INTO users (email, name) VALUES (?, ?)', 
      ['user@example.com', 'Test User']
    );
  }
};

// ❌ DON'T: Modify schema manually
// ❌ DON'T: Commit database files to version control
```

---

## 📁 Directory & Naming Conventions

### Frontend
```
frontend/src/
├── components/
│   ├── SearchBar.jsx          # PascalCase for components
│   ├── DocumentCard.jsx
│   ├── Collections/
│   │   ├── CollectionList.jsx
│   │   └── CollectionDetail.jsx
│   └── Common/
│       ├── Header.jsx
│       └── Footer.jsx
├── pages/
│   ├── Home.jsx               # Page components in pages/
│   ├── SearchResults.jsx
│   └── DocumentDetail.jsx
├── services/
│   ├── searchService.js       # camelCase for services
│   ├── documentService.js
│   └── api.js                 # Axios config
├── hooks/
│   ├── useSearch.js           # Custom hooks with 'use' prefix
│   ├── useFetch.js
│   └── useLocalStorage.js
└── styles/
    ├── globals.css
    └── index.css
```

### Backend
```
backend/src/
├── routes/
│   ├── searchRoutes.js        # Route definitions
│   ├── documentRoutes.js
│   └── collectionRoutes.js
├── controllers/
│   ├── searchController.js    # Request handlers
│   ├── documentController.js
│   └── collectionController.js
├── services/
│   ├── searchService.js       # Business logic
│   ├── documentService.js
│   └── aggregationService.js
├── models/
│   ├── User.js                # Database models
│   ├── Document.js
│   └── Collection.js
├── middleware/
│   ├── auth.js                # Authentication
│   ├── validation.js          # Input validation
│   └── errorHandler.js        # Error handling
└── config/
    ├── database.js            # DB config
    └── constants.js           # Constants
```

---

## 🔧 When to Use What

### Components vs Containers
```javascript
// ✅ Presentational Component (reusable, no side effects)
const DocumentCard = ({ title, summary, source, onClick }) => (
  <div onClick={onClick} className="card">
    <h3>{title}</h3>
    <p>{summary}</p>
    <span>{source}</span>
  </div>
);

// ✅ Container Component (handles logic, data fetching)
const DocumentCardContainer = ({ docId }) => {
  const [doc, setDoc] = useState(null);
  
  useEffect(() => {
    documentService.getDocument(docId).then(setDoc);
  }, [docId]);

  return <DocumentCard {...doc} onClick={() => handleClick(doc)} />;
};
```

### Hooks vs Services
```javascript
// ✅ Use Custom Hook for component state and side effects
const useSearch = (initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q) => {
    setLoading(true);
    const data = await searchService.search(q);
    setResults(data);
    setLoading(false);
  }, []);

  return { query, setQuery, results, loading, search };
};

// ✅ Use Service for API calls and business logic
const searchService = {
  search: (query) => axios.get(`/api/search?q=${query}`),
  advancedSearch: (filters) => axios.post('/api/search/advanced', filters)
};
```

---

## ⚠️ Common Pitfalls to Avoid

### 1. API Calls in Components
```javascript
// ❌ DON'T
const SearchResults = () => {
  useEffect(() => {
    fetch('/api/search')
      .then(r => r.json())
      .then(data => setResults(data));
  }, []);
};

// ✅ DO
const SearchResults = () => {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    searchService.search().then(setResults);
  }, []);
};
```

### 2. Missing Error Handling
```javascript
// ❌ DON'T
const data = await fetch('/api/data').then(r => r.json());

// ✅ DO
try {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
  // Handle error appropriately
}
```

### 3. Not Using Environment Variables
```javascript
// ❌ DON'T
const API_URL = 'http://localhost:5000/api';

// ✅ DO
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';
```

### 4. Class Components (when not necessary)
```javascript
// ❌ DON'T (unless necessary)
class SearchComponent extends React.Component {
  state = { query: '' };
  render() { ... }
}

// ✅ DO
const SearchComponent = () => {
  const [query, setQuery] = useState('');
  ...
};
```

---

## 🔐 Security Best Practices

```javascript
// ✅ DO: Validate user input
const validateSearchQuery = (query) => {
  if (!query || query.trim().length === 0) {
    throw new Error('Query cannot be empty');
  }
  if (query.length > 500) {
    throw new Error('Query too long');
  }
  return query.trim();
};

// ✅ DO: Sanitize data before rendering
const SampleComponent = ({ userInput }) => (
  <div>{userInput}</div> // React auto-escapes by default
);

// ✅ DO: Use HTTPS in production
// ✅ DO: Implement CORS properly
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// ✅ DO: Use JWT for authentication
// ✅ DO: Rate limit API endpoints
// ✅ DO: Validate all inputs server-side

// ❌ DON'T: Store sensitive data in localStorage
// ❌ DON'T: Hardcode API keys
// ❌ DON'T: Trust client-side validation alone
```

---

## 📝 Comments & Documentation

```javascript
// ✅ DO: Comment complex logic
// Using binary search to find the optimal cut-off point
// based on document relevance score
const findCutoffPoint = (scores) => {
  let left = 0, right = scores.length - 1;
  while (left < right) {
    // ...
  }
  return left;
};

// ✅ DO: Use JSDoc for functions
/**
 * Searches for documents matching the query
 * @param {string} query - Search query
 * @param {object} filters - Optional filters (date, source, etc)
 * @returns {Promise<Array>} Array of matching documents
 * @throws {Error} If search fails
 */
const search = async (query, filters) => { ... };

// ❌ DON'T: Over-comment obvious code
// ❌ DON'T: Leave stale comments
```

---

## 🧪 Testing Guidelines

```javascript
// ✅ DO: Write tests for business logic
describe('searchService', () => {
  it('should return results for valid query', async () => {
    const results = await searchService.search('test');
    expect(results.length).toBeGreaterThan(0);
  });
});

// ✅ DO: Test edge cases
it('should handle empty query', () => {
  expect(() => searchService.search('')).toThrow();
});

// ✅ DO: Mock external dependencies
jest.mock('./api', () => ({
  get: jest.fn()
}));
```

---

## 🚀 Performance Tips

- **Frontend**: Use React.memo for expensive components, implement code splitting
- **Backend**: Index database queries, implement caching, use pagination
- **General**: Monitor bundle size, minimize API calls, optimize images

---

## 📚 Related Files

- See [README.md](../README.md) for project overview and setup
- See [AGENTS.md](../AGENTS.md) for detailed architecture and conventions
- See `backend/.env.example` for environment variable requirements
- See test files in `frontend/__tests__/` and `backend/tests/` for code examples

---

**Last Updated**: June 2026
**Author**: Information Aggregator & Search Platform Team
