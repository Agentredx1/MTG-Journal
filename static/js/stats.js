// Modal elements
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');

// Attach click listeners to all commander links
document.querySelectorAll('.commander-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const commanderName = link.dataset.commander;

    // Encode name for URL (replace spaces etc.)
    const imageUrl = `/static/assets/${encodeURIComponent(commanderName)}.jpg`;
    modalImage.src = imageUrl;
    modal.style.display = 'flex';
  });
});

// Close modal
modalClose.onclick = () => {
  modal.style.display = 'none';
  modalImage.src = '';
};

// Close when clicking outside image
modal.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    modalImage.src = '';
  }
};
