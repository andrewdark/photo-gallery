import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './photo-api.js';
import myIcon from '../images/icons8-website-64.png';

var link = document.querySelector("link[rel~='icon']");
if (!link) {
  link = document.createElement('link');
  link.rel = 'icon';
  document.head.appendChild(link);
}
link.href = myIcon;
const loadMoreBtn = document.querySelector('.load-more');
const searchForm = document.querySelector('#search-form');
const galleryDiv = document.querySelector('.gallery');
const options = {
  captions: true,
  captionsDelay: 250,
  captionSelector: 'img',
  captionType: 'attr',
  captionPosition: 'bottom',
  captionsData: 'alt',
};
let sQuery = '';
let lightbox;
let per_page = 40;
let page = 1;
loadMoreBtn.hidden = true;

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  page = 1;
  const {
    elements: { searchQuery },
  } = event.currentTarget;
  if (searchQuery.value.length < 1) {
    loadMoreBtn.hidden = true;
    galleryDiv.innerHTML = '';
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  sQuery = searchQuery.value;
  fetchImages(sQuery, per_page, page).then(el => {
    const listItems = el.hits;
    if (listItems && listItems.length > 0) {
      galleryDiv.innerHTML = drowPictures(listItems);
      lightbox = new SimpleLightbox('.photo-card a', options);
      Notiflix.Notify.success(`Hooray! We found ${el.totalHits} images.`);
      loadMoreBtn.hidden = false;
    } else {
      loadMoreBtn.hidden = true;
      galleryDiv.innerHTML = '';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (el.totalHits <= page * per_page) {
      loadMoreBtn.hidden = true;
    }
  });
});

loadMoreBtn.addEventListener('click', event => {
  fetchImages(sQuery, per_page, ++page).then(el => {
    console.log(el);

    const listItems = el.hits;
    if (listItems && listItems.length > 0) {
      galleryDiv.insertAdjacentHTML('beforeend', drowPictures(listItems));
      lightbox.refresh();

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    } else {
      loadMoreBtn.hidden = true;
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    if (el.totalHits <= page * per_page) {
      loadMoreBtn.hidden = true;
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }
  });
});

function drowPictures(dataList) {
  return dataList
    .map(pict => {
      return `<div class="photo-card">
      <div class="pict">
        <a href=${pict.largeImageURL} class='gallery__link'>
        <img src="${pict.webformatURL}" alt="${pict.tags}" loading="lazy" class="gallery__img"/>
        </a>
      </div>
   
    <div class="info">
      <div class="item">
        <p class="info-item">
            <b>Likes</b>
          </p>
          <p class="data-item">${pict.likes}</p>
      </div>
      <div class="item">
          <p class="info-item">
            <b>Views</b>
          </p>
          <p class="data-item">${pict.views}</p>
        </div>
        <div class="item">
          <p class="info-item">
            <b>Comments</b>
          </p>
          <p class="data-item">${pict.comments}</p>
        </div>
        <div class="item">
          <p class="info-item">
            <b>Downloads</b>
          </p>
          <p class="data-item">${pict.downloads}</p>
        </div>
    </div>
</div>`;
    })
    .join('');
}
