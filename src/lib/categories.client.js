/**
 * Client-safe category utilities
 * These functions can be used in both client and server contexts
 */

/**
 * URL patterns for category matching
 */
const URL_PATTERNS = {
  technology: [
    /techcrunch\.com/i,
    /arstechnica\.com/i,
    /wired\.com/i,
    /theverge\.com/i,
    /engadget\.com/i,
    /gizmodo\.com/i,
    /tech/i
  ],
  programming: [
    /github\.com/i,
    /stackoverflow\.com/i,
    /dev\.to/i,
    /medium\.com.*programming/i,
    /hackernews/i,
    /reddit\.com\/r\/programming/i,
    /code/i,
    /programming/i
  ],
  gaming: [
    /ign\.com/i,
    /gamespot\.com/i,
    /polygon\.com/i,
    /kotaku\.com/i,
    /pcgamer\.com/i,
    /gaming/i,
    /games/i
  ],
  science: [
    /nature\.com/i,
    /science\.org/i,
    /scientificamerican\.com/i,
    /newscientist\.com/i,
    /science/i
  ],
  news: [
    /cnn\.com/i,
    /bbc\.com/i,
    /reuters\.com/i,
    /ap\.org/i,
    /news/i
  ]
};

/**
 * Keywords for title-based category matching
 */
const TITLE_KEYWORDS = {
  programming: [
    'javascript', 'python', 'java', 'react', 'vue', 'angular', 'node',
    'programming', 'code', 'coding', 'developer', 'software', 'framework',
    'library', 'api', 'database', 'algorithm', 'debug', 'git', 'github'
  ],
  gaming: [
    'game', 'gaming', 'video game', 'rpg', 'fps', 'mmorpg', 'console',
    'playstation', 'xbox', 'nintendo', 'steam', 'esports', 'tournament'
  ],
  technology: [
    'tech', 'technology', 'gadget', 'smartphone', 'laptop', 'computer',
    'innovation', 'startup', 'silicon valley', 'apple', 'google', 'microsoft'
  ],
  ai: [
    'ai', 'artificial intelligence', 'machine learning', 'deep learning',
    'neural network', 'chatgpt', 'openai', 'llm', 'algorithm'
  ],
  science: [
    'science', 'research', 'study', 'discovery', 'experiment', 'theory',
    'physics', 'chemistry', 'biology', 'astronomy', 'climate'
  ],
  health: [
    'health', 'medical', 'medicine', 'doctor', 'hospital', 'treatment',
    'disease', 'fitness', 'wellness', 'nutrition'
  ],
  business: [
    'business', 'startup', 'entrepreneur', 'company', 'market', 'economy',
    'finance', 'investment', 'stock', 'revenue'
  ],
  politics: [
    'politics', 'government', 'election', 'president', 'congress', 'senate',
    'policy', 'law', 'legislation', 'democracy'
  ],
  sports: [
    'sports', 'football', 'basketball', 'baseball', 'soccer', 'tennis',
    'olympics', 'championship', 'tournament', 'athlete'
  ],
  entertainment: [
    'movie', 'film', 'tv', 'television', 'actor', 'actress', 'celebrity',
    'hollywood', 'netflix', 'streaming'
  ],
  music: [
    'music', 'song', 'album', 'artist', 'band', 'concert', 'spotify',
    'musician', 'genre', 'lyrics'
  ],
  food: [
    'food', 'recipe', 'cooking', 'restaurant', 'chef', 'cuisine',
    'meal', 'ingredient', 'dish', 'nutrition'
  ],
  travel: [
    'travel', 'vacation', 'trip', 'destination', 'hotel', 'flight',
    'tourism', 'adventure', 'explore', 'journey'
  ],
  education: [
    'education', 'school', 'university', 'college', 'student', 'teacher',
    'learning', 'course', 'degree', 'academic'
  ],
  environment: [
    'environment', 'climate', 'green', 'sustainable', 'renewable',
    'pollution', 'conservation', 'ecology', 'carbon'
  ],
  privacy: [
    'privacy', 'anonymous', 'anonymity', 'personal data', 'data protection',
    'private', 'confidential', 'secure'
  ],
  security: [
    'security', 'cybersecurity', 'infosec', 'information security',
    'digital safety', 'secure', 'protection'
  ],
  hacking: [
    'hacking', 'hack', 'ethical hacking', 'penetration testing', 'pentest',
    'security research', 'exploit', 'vulnerability'
  ],
  tor: [
    'tor', 'onion', 'dark web', 'darkweb', 'hidden service', 'onion service',
    'tor browser', 'anonymity network'
  ],
  cryptography: [
    'cryptography', 'encryption', 'crypto', 'cipher', 'cryptographic',
    'secure communication', 'pgp', 'gpg'
  ],
  whistleblowing: [
    'whistleblowing', 'whistleblower', 'leak', 'anonymous reporting',
    'transparency', 'disclosure'
  ],
  surveillance: [
    'surveillance', 'mass surveillance', 'government surveillance',
    'data collection', 'monitoring', 'tracking'
  ],
  vpn: [
    'vpn', 'virtual private network', 'proxy', 'secure browsing',
    'ip masking', 'location hiding'
  ],
  opsec: [
    'opsec', 'operational security', 'anonymity', 'digital footprint',
    'security practices', 'privacy practices'
  ],
  decentralization: [
    'decentralization', 'decentralized', 'distributed', 'peer-to-peer',
    'p2p', 'blockchain', 'web3'
  ],
  osint: [
    'osint', 'open source intelligence', 'information gathering',
    'research', 'investigation', 'reconnaissance'
  ],
  malware: [
    'malware', 'virus', 'trojan', 'ransomware', 'reverse engineering',
    'malware analysis', 'threat analysis'
  ],
  censorship: [
    'censorship', 'anti-censorship', 'freedom of speech', 'internet freedom',
    'blocked', 'restricted', 'firewall'
  ]
};

/**
 * Match categories based on URL patterns
 * @param {string} url - The URL to analyze
 * @returns {string[]} Array of matching category slugs
 */
export function matchCategoryFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return [];
  }

  const matches = [];
  
  for (const [category, patterns] of Object.entries(URL_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        matches.push(category);
        break; // Only add category once
      }
    }
  }
  
  return matches;
}

/**
 * Match categories based on title keywords
 * @param {string} title - The title to analyze
 * @returns {string[]} Array of matching category slugs
 */
export function matchCategoryFromTitle(title) {
  if (!title || typeof title !== 'string') {
    return [];
  }

  const matches = [];
  const lowerTitle = title.toLowerCase();
  
  for (const [category, keywords] of Object.entries(TITLE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword.toLowerCase())) {
        matches.push(category);
        break; // Only add category once
      }
    }
  }
  
  return matches;
}

/**
 * Suggest categories based on URL and title
 * @param {Object} options - Options object
 * @param {string} [options.url] - The URL to analyze
 * @param {string} [options.title] - The title to analyze
 * @returns {string[]} Array of suggested category slugs (deduplicated)
 */
export function suggestCategories({ url, title } = {}) {
  const urlMatches = url ? matchCategoryFromUrl(url) : [];
  const titleMatches = title ? matchCategoryFromTitle(title) : [];
  
  // Combine and deduplicate
  const allMatches = [...urlMatches, ...titleMatches];
  return Array.from(new Set(allMatches));
}