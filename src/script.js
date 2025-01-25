// File: src/script.js

// Select all gallery items and track the current image index
const galleryItems = document.querySelectorAll('.gallery-item');
let currentIndex = 0; // Track the current image being displayed in the lightbox

// Open the lightbox with the selected image
function openLightbox(image) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  
  // Display the lightbox and set the image source
  lightbox.style.display = 'flex';
  lightboxImage.src = image.src;

  // Update the current index to match the clicked image
  currentIndex = Array.from(galleryItems).indexOf(image);
}

// Close the lightbox
function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.style.display = 'none'; // Hide the lightbox
}

// Navigate through the images in the lightbox
function changeImage(direction) {
  // Calculate the next image index (circular navigation)
  currentIndex = (currentIndex + direction + galleryItems.length) % galleryItems.length;

  // Update the lightbox image source
  const lightboxImage = document.getElementById('lightboxImage');
  lightboxImage.src = galleryItems[currentIndex].src;
}

// Event listeners for lightbox controls
document.querySelector('.close').addEventListener('click', closeLightbox);
document.querySelector('.prev').addEventListener('click', () => changeImage(-1));
document.querySelector('.next').addEventListener('click', () => changeImage(1));

// Optional: Close the lightbox when clicking outside the image
document.getElementById('lightbox').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    closeLightbox();
  }
});

// Accessibility: Close the lightbox with the Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
  } else if (e.key === 'ArrowRight') {
    changeImage(1); // Navigate to the next image
  } else if (e.key === 'ArrowLeft') {
    changeImage(-1); // Navigate to the previous image
  }
});
