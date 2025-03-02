document.addEventListener('DOMContentLoaded', function() {
  // Get the comic ID from the URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const comicId = urlParams.get('id');
  
  if (!comicId) {
    showError('No comic ID specified');
    return;
  }
  
  // Fetch comic data
  fetchComicData(comicId);
  
  // Update copyright year in footer
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  
  // Set up meta tags for social media sharing
  setupMetaTags(comicId);
});

async function fetchComicData(comicId) {
  try {
    // Fetch the comics data
    const response = await fetch('/comics.json');
    
    if (!response.ok) {
      throw new Error('Failed to fetch comics data');
    }
    
    const comics = await response.json();
    const comic = comics.find(c => c.id === comicId);
    
    if (!comic) {
      showError('Comic not found');
      return;
    }
    
    // Render comic details and chapters
    renderComicDetails(comic);
    renderChapters(comic);
    
    // Update meta tags with actual comic data
    updateMetaTags(comic);
    
  } catch (error) {
    console.error('Error fetching comic data:', error);
    showError('Failed to load comic data. Please try again later.');
  }
}

function renderComicDetails(comic) {
  const detailsContent = document.getElementById('detailsContent');
  
  // Format genres for display
  const genresList = Array.isArray(comic.genres) ? comic.genres.join(', ') : '';
  
  // Handle missing fields with fallbacks
  const coverImg = comic.cover || 'assets/default-cover.jpg';
  const status = comic.status || 'Unknown';
  const author = comic.author || 'Unknown';
  const artist = comic.artist || 'Unknown';
  const releaseYear = comic.releaseYear || 'Unknown';
  const description = comic.description || 'No description available.';
  
  const html = `
    <div class="comic-details">
      <div class="comic-cover">
        <img src="${coverImg}" alt="${comic.title} Cover" onerror="this.src='assets/default-cover.jpg';" />
        <div class="status">${status}</div>
      </div>
      <div class="comic-info">
        <h1>${comic.title}</h1>
        <div class="comic-metadata">
          <p><strong>Author:</strong> ${author}</p>
          <p><strong>Artist:</strong> ${artist}</p>
          <p><strong>Release Year:</strong> ${releaseYear}</p>
          <p><strong>Status:</strong> ${status}</p>
          ${genresList ? `<p><strong>Genres:</strong> ${genresList}</p>` : ''}
        </div>
        <div class="comic-description">
          <h3>Synopsis</h3>
          <p>${description}</p>
        </div>
        <div class="share-links">
          <h3>Share</h3>
          <div class="social-share">
            <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out ${comic.title} on Alvenhiem!`)}" target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter"><i class="fab fa-twitter"></i></a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"><i class="fab fa-facebook"></i></a>
            <a href="https://discord.com/channels/@me" target="_blank" rel="noopener noreferrer" aria-label="Share on Discord"><i class="fab fa-discord"></i></a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  detailsContent.innerHTML = html;
}

function renderChapters(comic) {
  const chaptersContent = document.getElementById('chaptersContent');
  
  if (!comic.chapters || comic.chapters.length === 0) {
    chaptersContent.innerHTML = '<p class="no-chapters">No chapters available yet.</p>';
    return;
  }
  
  // Sort chapters by number in descending order (newest first)
  const sortedChapters = [...comic.chapters].sort((a, b) => {
    // Ensure numeric comparison by converting to numbers
    return parseFloat(b.number) - parseFloat(a.number);
  });
  
  let html = `
    <h2>Chapters</h2>
    <div class="chapters-list">
  `;
  
  sortedChapters.forEach(chapter => {
    // Format release date with error handling
    let formattedDate = 'Unknown Date';
    try {
      const releaseDate = new Date(chapter.releaseDate);
      if (!isNaN(releaseDate.getTime())) {
        formattedDate = releaseDate.toLocaleDateString('en-US', {
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        });
      }
    } catch (e) {
      console.error('Error formatting date:', e);
    }
    
    html += `
      <div class="chapter-item">
        <a href="${chapter.path || '#'}" class="chapter-link">
          <div class="chapter-number">Chapter ${chapter.number}</div>
          <div class="chapter-title">${chapter.title || ''}</div>
          <div class="chapter-date">${formattedDate}</div>
          <div class="read-icon"><i class="fas fa-book-open"></i></div>
        </a>
      </div>
    `;
  });
  
  html += `</div>`;
  
  if (comic.status === "Ongoing") {
    html += `
      <div class="subscription-box">
        <h3>Stay Updated</h3>
        <p>Get notified when new chapters are released!</p>
        <form id="subscribeForm" class="subscribe-form">
          <input type="email" placeholder="Your email address" required />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    `;
  }
  
  chaptersContent.innerHTML = html;
  
  // Add event listener for subscription form if it exists
  const subscribeForm = document.getElementById('subscribeForm');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      // Sanitize email input for security
      const sanitizedEmail = email.replace(/<\/?[^>]+(>|$)/g, "");
      // Here you would normally send this to your backend
      alert(`Thank you for subscribing with ${sanitizedEmail}! You'll receive updates for "${comic.title}".`);
      this.reset();
    });
  }
}

function showError(message) {
  const detailsContent = document.getElementById('detailsContent');
  const chaptersContent = document.getElementById('chaptersContent');
  
  if (detailsContent) {
    detailsContent.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <a href="index.html#comics" class="btn-primary">Back to Comics</a>
      </div>
    `;
  }
  
  if (chaptersContent) {
    chaptersContent.innerHTML = '';
  }
}

function setupMetaTags(comicId) {
  // Create meta tags for Open Graph and Twitter Card
  const metaTags = [
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: window.location.href },
    { property: 'og:title', content: 'Alvenhiem - Comic Loading...' },
    { property: 'og:description', content: 'Loading comic details...' },
    { property: 'og:image', content: '/assets/default-embed.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Alvenhiem - Comic Loading...' },
    { name: 'twitter:description', content: 'Loading comic details...' },
    { name: 'twitter:image', content: '/assets/default-embed.jpg' }
  ];
  
  metaTags.forEach(tagInfo => {
    let meta = document.querySelector(`meta[${tagInfo.property ? 'property' : 'name'}="${tagInfo.property || tagInfo.name}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      if (tagInfo.property) {
        meta.setAttribute('property', tagInfo.property);
      } else {
        meta.setAttribute('name', tagInfo.name);
      }
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', tagInfo.content);
  });
}

function updateMetaTags(comic) {
  // Update meta tags with actual comic data
  const title = `${comic.title} - Alvenhiem`;
  const description = comic.description 
    ? comic.description.substring(0, 150) + (comic.description.length > 150 ? '...' : '') 
    : 'Read this comic on Alvenhiem';
  const image = comic.cover || '/assets/default-embed.jpg';
  
  // Update document title
  document.title = title;
  
  // Update Open Graph meta tags
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description);
  updateMetaTag('og:image', image);
  
  // Update Twitter Card meta tags
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:image', image);
  
  // Add structured data for Google
  addStructuredData(comic);
}

function updateMetaTag(selector, content) {
  const prop = selector.startsWith('og:') ? 'property' : 'name';
  const meta = document.querySelector(`meta[${prop}="${selector}"]`);
  if (meta) {
    meta.setAttribute('content', content);
  }
}

function addStructuredData(comic) {
  // Remove any existing structured data
  const existingScript = document.getElementById('structuredData');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Create structured data for comic with proper fallbacks
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": comic.title,
    "author": {
      "@type": "Person",
      "name": comic.author || "Unknown Author"
    }
  };
  
  // Only add optional fields if they exist
  if (comic.artist) {
    structuredData.illustrator = {
      "@type": "Person",
      "name": comic.artist
    };
  }
  
  if (comic.releaseYear) {
    structuredData.datePublished = comic.releaseYear.toString();
  }
  
  if (comic.description) {
    structuredData.description = comic.description;
  }
  
  if (Array.isArray(comic.genres) && comic.genres.length > 0) {
    structuredData.genre = comic.genres;
  }
  
  if (comic.cover) {
    structuredData.image = comic.cover;
  }
  
  structuredData.publisher = {
    "@type": "Organization",
    "name": "Alvenhiem"
  };
  
  // Add structured data to page
  const script = document.createElement('script');
  script.id = 'structuredData';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}