// File: src/script.js

// Filter gallery items by category
function filterGallery(category) {
  const items = document.querySelectorAll('.gallery-item');
  items.forEach((item) => {
    if (category === 'all' || item.classList.contains(category)) {
      item.style.display = 'block'; // Show items that match the category
    } else {
      item.style.display = 'none'; // Hide non-matching items
    }
  });
}

// Open the lightbox with the selected image
let currentIndex = 0; // Track the currently displayed image
const images = document.querySelectorAll('.gallery-item');

function openLightbox(image) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  lightbox.style.display = 'flex'; // Show the lightbox
  lightboxImage.src = image.src; // Display the clicked image in the lightbox
  currentIndex = Array.from(images).indexOf(image); // Save the index of the clicked image
}

// Close the lightbox
function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.style.display = 'none'; // Hide the lightbox
}

// Navigate through images in the lightbox
function changeImage(direction) {
  currentIndex = (currentIndex + direction + images.length) % images.length; // Circular navigation
  const lightboxImage = document.getElementById('lightboxImage');
  lightboxImage.src = images[currentIndex].src; // Update the lightbox with the new image
}

// Event listeners for the lightbox controls
document.querySelector('.close').addEventListener('click', closeLightbox);
document.querySelector('.prev').addEventListener('click', () => changeImage(-1));
document.querySelector('.next').addEventListener('click', () => changeImage(1));
