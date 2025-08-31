// src/data/dataAdapter.js
import mockDataJson from './mock-data.json';

// Function to extract category from text content
const extractCategory = (text, title) => {
  const content = (text + ' ' + title).toLowerCase();
  
  if (content.includes('quantum') || content.includes('technology') || content.includes('ai') || content.includes('computer') || content.includes('tech')) {
    return 'Technology';
  }
  if (content.includes('health') || content.includes('medical') || content.includes('hospital') || content.includes('treatment') || content.includes('bacteria')) {
    return 'Health';
  }
  if (content.includes('industry') || content.includes('entertainment') || content.includes('movie') || content.includes('film') || content.includes('tv')) {
    return 'Entertainment';
  }
  if (content.includes('regulatory') || content.includes('government') || content.includes('policy') || content.includes('political')) {
    return 'Politics';
  }
  if (content.includes('economic') || content.includes('business') || content.includes('market') || content.includes('financial')) {
    return 'Economy';
  }
  return 'General';
};

// Function to determine bias based on source and content
const determineBias = (text, title, author) => {
  const content = (text + ' ' + title + ' ' + author).toLowerCase();
  
  // Simple bias detection based on keywords and sources
  if (content.includes('imdb') || content.includes('variety') || content.includes('entertainment')) {
    return 'center';
  }
  if (content.includes('sciencedaily') || content.includes('university') || content.includes('research')) {
    return 'center';
  }
  if (content.includes('bioworld') || content.includes('healthcare')) {
    return 'center';
  }
  
  // Default to center for scientific/technical content
  return 'center';
};

// Function to generate fact check status based on content
const generateFactCheck = (text, title, score) => {
  const content = (text + ' ' + title).toLowerCase();
  
  // Higher scores and scientific sources get better fact check ratings
  if (score > 0.3 && (content.includes('university') || content.includes('research') || content.includes('study'))) {
    return {
      status: 'verified',
      confidence: Math.min(95, Math.round(score * 100 + 60)),
      explanation: 'Information verified through academic sources and peer-reviewed research.'
    };
  }
  
  if (score > 0.25) {
    return {
      status: 'verified',
      confidence: Math.min(90, Math.round(score * 100 + 50)),
      explanation: 'Information cross-referenced with multiple reliable sources.'
    };
  }
  
  if (score > 0.2) {
    return {
      status: 'disputed',
      confidence: Math.round(score * 100 + 30),
      explanation: 'Some aspects of the information require additional verification.'
    };
  }
  
  return {
    status: 'unverified',
    confidence: Math.round(score * 100 + 20),
    explanation: 'Information requires further verification from additional sources.'
  };
};

// Function to extract source from URL
const extractSource = (url, author) => {
  if (author && author.trim()) return author;
  
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const sourceName = domain.split('.')[0];
    return sourceName.charAt(0).toUpperCase() + sourceName.slice(1);
  } catch {
    return 'Unknown Source';
  }
};

// Function to create summary from text
const createSummary = (text, maxLength = 150) => {
  if (!text) return 'No summary available.';
  
  // Remove HTML tags and extra whitespace
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  
  // Find the first few sentences
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  let summary = sentences[0] || cleanText.substring(0, maxLength);
  
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength).trim() + '...';
  }
  
  return summary;
};

// Function to generate a safe ID from URL or create a unique one
const generateSafeId = (originalId, index) => {
  if (!originalId) return `article-${index}`;

  // If it's a URL, extract a safe identifier
  try {
    const url = new URL(originalId);
    const pathname = url.pathname.replace(/[^a-zA-Z0-9]/g, '-');
    const hostname = url.hostname.replace(/[^a-zA-Z0-9]/g, '-');
    return `${hostname}${pathname}-${index}`.substring(0, 50); // Limit length
  } catch {
    // If not a URL, sanitize the string
    return originalId.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50) + `-${index}`;
  }
};

// Convert JSON data to app format
export const convertJsonToAppFormat = () => {
  const articles = mockDataJson.map((item, index) => ({
    id: generateSafeId(item.id, index),
    title: item.title || 'Untitled Article',
    summary: createSummary(item.text),
    category: extractCategory(item.text || '', item.title || ''),
    source: extractSource(item.url || '', item.author || ''),
    bias: determineBias(item.text || '', item.title || '', item.author || ''),
    factCheck: generateFactCheck(item.text || '', item.title || '', item.score || 0),
    timestamp: new Date(item.publishedDate || Date.now()),
    url: item.url,
    author: item.author,
    score: item.score,
    favicon: item.favicon,
    image: item.image,
    originalText: item.text
  }));

  // Ensure all IDs are unique by adding a suffix if needed
  const seenIds = new Set();
  const finalArticles = articles.map((article, index) => {
    let uniqueId = article.id;
    let counter = 1;

    while (seenIds.has(uniqueId)) {
      uniqueId = `${article.id}-${counter}`;
      counter++;
    }

    seenIds.add(uniqueId);
    return { ...article, id: uniqueId };
  });

  // Log the first few IDs for debugging
  console.log('Generated article IDs:', finalArticles.slice(0, 3).map(a => a.id));

  return finalArticles;
};

// Get all unique categories
export const getCategories = () => {
  const articles = convertJsonToAppFormat();
  const categories = [...new Set(articles.map(article => article.category))];
  return ['All', ...categories.sort()];
};

export default {
  convertJsonToAppFormat,
  getCategories
};
