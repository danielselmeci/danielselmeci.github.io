// File: script.js

// Filter gallery items by category
function filterGallery(category) {
  const items = document.querySelectorAll('.gallery-item');
  items.forEach(item => {
    if (category === 'all' || item.classList.contains(category)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Open lightbox with selected image
let currentIndex = 0;
const images = document.querySelectorAll('.gallery-item');

function openLightbox(image) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  currentIndex = Array.from(images).indexOf(image);
  lightboxImage.src = image.src;
  lightbox.style.display = 'flex';
}

// Close lightbox
function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
}

// Navigate images in lightbox
function changeImage(direction) {
  currentIndex = (currentIndex + direction + images.length) % images.length;
  const lightboxImage = document.getElementById('lightboxImage');
  lightboxImage.src = images[currentIndex].src;
}
