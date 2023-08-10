import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { fetchImages } from './api';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
let currentPage = 1;
let lightbox;

searchForm.addEventListener('submit', function (event) {
  event.preventDefault();
  currentPage = 1;

  const searchQuery = searchForm.elements.searchQuery.value;
  searchImages(searchQuery);
});

loadMoreButton.addEventListener('click', function () {
  const searchQuery = searchForm.elements.searchQuery.value;
  searchImages(searchQuery);
});

async function searchImages(searchQuery) {
  gallery.innerHTML = '';
  try {
    const data = await fetchImages(searchQuery, currentPage, 40);

    if (data.hits.length > 0) {
      data.hits.forEach(image => {
        const photoCard = document.createElement('div');
        photoCard.classList.add('photo-card');

        const imageLink = document.createElement('a');
        imageLink.href = image.largeImageURL;
        imageLink.setAttribute('data-lightbox', 'gallery');

        const imageElement = document.createElement('img');
        imageElement.src = image.webformatURL;
        imageElement.alt = image.tags;
        imageElement.loading = 'lazy';

        imageLink.appendChild(imageElement);
        photoCard.appendChild(imageLink);

        const infoElement = document.createElement('div');
        infoElement.classList.add('info');

        const likesElement = createInfoItem('Likes', image.likes);
        const viewsElement = createInfoItem('Views', image.views);
        const commentsElement = createInfoItem('Comments', image.comments);
        const downloadsElement = createInfoItem('Downloads', image.downloads);

        infoElement.append(
          likesElement,
          viewsElement,
          commentsElement,
          downloadsElement
        );

        photoCard.append(infoElement);
        gallery.appendChild(photoCard);
      });

      if (!lightbox) {
        lightbox = new SimpleLightbox('[data-lightbox="gallery"]');
      } else {
        lightbox.refresh();
      }

      currentPage++;

      if (data.totalHits <= currentPage * 40) {
        removeLoadMoreButton();
        Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
      } else {
        showLoadMoreButton();
      }

      smoothScrollToNextGroup();
    } else {
      Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
  }
}

function createInfoItem(label, value) {
  const infoItem = document.createElement('p');
  infoItem.classList.add('info-item');

  const labelElement = document.createElement('b');
  labelElement.textContent = label;

  infoItem.append(labelElement, `: ${value}`);
  return infoItem;
}

function showLoadMoreButton() {
  loadMoreButton.style.display = 'block';
}

function removeLoadMoreButton() {
  loadMoreButton.style.display = 'none';
}

function smoothScrollToNextGroup() {
  const cardHeight = gallery.firstElementChild.getBoundingClientRect().height;
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
