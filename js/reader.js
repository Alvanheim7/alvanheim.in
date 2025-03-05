document.addEventListener('DOMContentLoaded', function() {
  // Update current year in footer
  document.getElementById("currentYear").textContent = new Date().getFullYear();

  // Get query parameters: comicId and chapter number
  const params = new URLSearchParams(window.location.search);
  const comicId = params.get('comicId');
  const chapterParam = params.get('chapter'); // chapter number as string

  if (!comicId || !chapterParam) {
    document.querySelector('.container').innerHTML = '<p>Comic ID or chapter number not specified in the URL. Please use ?comicId=1&chapter=1</p>';
    return;
  }

  // Elements
  const chapterTitleEl = document.getElementById('chapter-title');
  const pageContainer = document.getElementById('page-container');
  const chapterInfoEl = document.getElementById('chapterInfo');
  const prevChapterBtn = document.getElementById('prevChapter');
  const nextChapterBtn = document.getElementById('nextChapter');
  const chapterSelect = document.getElementById('chapterSelect');

  let comicData;
  let currentChapterIndex = -1;
  
  // Fetch the comics data
  fetch('data/comics.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch comics data');
      }
      return response.json();
    })
    .then(data => {
      comicData = data.find(c => c.id === comicId);
      if (!comicData) {
        document.querySelector('.container').innerHTML = '<p>Comic not found</p>';
        return;
      }
      // Populate the drop-down menu with chapters
      comicData.chapters.forEach((chapter, index) => {
        let option = document.createElement('option');
        option.value = chapter.number;
        option.textContent = `Chapter ${chapter.number}: ${chapter.title}`;
        if (String(chapter.number) === chapterParam) {
          option.selected = true;
          currentChapterIndex = index;
        }
        chapterSelect.appendChild(option);
      });
      
      if (currentChapterIndex === -1) {
        document.querySelector('.container').innerHTML = '<p>Chapter not found</p>';
        return;
      }
      loadChapter();
    })
    .catch(error => {
      console.error('Error fetching comics data:', error);
      document.querySelector('.container').innerHTML = '<p>Error loading chapter details.</p>';
    });

  // Handle drop-down chapter selection change
  chapterSelect.addEventListener('change', function() {
    const selectedChapterNumber = this.value;
    window.location.href = `reader.html?comicId=${comicId}&chapter=${selectedChapterNumber}`;
  });

  function loadChapter() {
    const chapter = comicData.chapters[currentChapterIndex];
    // Set the chapter title
    chapterTitleEl.textContent = `Chapter ${chapter.number}: ${chapter.title}`;
    // Update chapter info display in pagination
    chapterInfoEl.textContent = `Chapter ${currentChapterIndex + 1} of ${comicData.chapters.length}`;

    // Clear current pages
    pageContainer.innerHTML = '';
    // Display all pages of the chapter
    if (Array.isArray(chapter.pages) && chapter.pages.length) {
      chapter.pages.forEach((pageUrl, index) => {
        const img = document.createElement('img');
        img.src = pageUrl;
        img.alt = `Page ${index + 1}`;
        pageContainer.appendChild(img);
      });
    } else {
      pageContainer.innerHTML = '<p>No pages available for this chapter.</p>';
    }
    // Update pagination buttons
    prevChapterBtn.disabled = (currentChapterIndex === 0);
    nextChapterBtn.disabled = (currentChapterIndex === comicData.chapters.length - 1);
  }

  // Chapter navigation event listeners
  prevChapterBtn.addEventListener('click', () => {
    if (currentChapterIndex > 0) {
      const prevChapter = comicData.chapters[currentChapterIndex - 1];
      window.location.href = `reader.html?comicId=${comicId}&chapter=${prevChapter.number}`;
    }
  });

  nextChapterBtn.addEventListener('click', () => {
    if (currentChapterIndex < comicData.chapters.length - 1) {
      const nextChapter = comicData.chapters[currentChapterIndex + 1];
      window.location.href = `reader.html?comicId=${comicId}&chapter=${nextChapter.number}`;
    }
  });

  // Keyboard support: arrow keys for chapter navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' && !nextChapterBtn.disabled) {
      nextChapterBtn.click();
    } else if (e.key === 'ArrowLeft' && !prevChapterBtn.disabled) {
      prevChapterBtn.click();
    }
  });
});
