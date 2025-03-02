function setupCarouselNavigation() {
  const comicsCarousel = document.getElementById('comicsCarousel');
  if (comicsCarousel) {
    window.addEventListener('load', () => checkCarouselOverflow(comicsCarousel));
    setTimeout(() => checkCarouselOverflow(comicsCarousel), 1000);
  }
}

function checkCarouselOverflow(carousel) {
  if (carousel.scrollWidth > carousel.clientWidth) {
    addCarouselControls(carousel);
  }
}

function addCarouselControls(carousel) {
  if (carousel.parentElement.querySelector('.carousel-buttons')) return;
  
  const scrollAmount = Math.min(300, carousel.clientWidth * 0.8);
  
  const scrollButtons = document.createElement('div');
  scrollButtons.className = 'carousel-buttons';
  
  const leftBtn = document.createElement('button');
  leftBtn.className = 'scroll-btn left';
  leftBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
  
  const rightBtn = document.createElement('button');
  rightBtn.className = 'scroll-btn right';
  rightBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
  
  scrollButtons.appendChild(leftBtn);
  scrollButtons.appendChild(rightBtn);
  
  carousel.parentElement.appendChild(scrollButtons);
  
  updateScrollButtonsVisibility(carousel, leftBtn, rightBtn);
  
  carousel.addEventListener('scroll', () => {
    updateScrollButtonsVisibility(carousel, leftBtn, rightBtn);
  });
}

function updateScrollButtonsVisibility(carousel, leftBtn, rightBtn) {
  if (carousel.scrollLeft <= 0) {
    leftBtn.classList.add('disabled');
  } else {
    leftBtn.classList.remove('disabled');
  }
  
  if (Math.abs(carousel.scrollLeft + carousel.clientWidth - carousel.scrollWidth) < 1) {
    rightBtn.classList.add('disabled');
  } else {
    rightBtn.classList.remove('disabled');
  }
}