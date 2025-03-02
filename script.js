document.addEventListener('DOMContentLoaded', function() {
    fetch('mangas.json')
        .then(response => response.json())
        .then(data => {
            const mangaGrid = document.getElementById('manga-grid');
            data.mangas.forEach(manga => {
                const mangaBox = document.createElement('div');
                mangaBox.classList.add('manga-box');
                mangaBox.innerHTML = `
                    <img src="${manga.image}" alt="${manga.title}">
                    <div class="manga-info">
                        <h2>${manga.title}</h2>
                        <p>${manga.synopsis}</p>
                        <a href="${manga.link}" target="_blank">Read on MangaDex</a>
                    </div>
                `;
                mangaGrid.appendChild(mangaBox);
            });
        });
});