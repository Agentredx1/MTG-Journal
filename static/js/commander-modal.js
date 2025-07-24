// Commander Modal Functionality
// Generic modal system that works with any modal ID

function initCommanderModal(modalId = 'imageModal') {
  // Modal elements
  const modal = document.getElementById(modalId);
  const modalImage = document.getElementById(`${modalId}Image`);
  const modalClose = document.getElementById(`${modalId}Close`);
  const modalLinkScryfall = document.getElementById(`${modalId}LinkScryfall`);
  const modalLinkEdhrec = document.getElementById(`${modalId}LinkEdhrec`);

  if (!modal || !modalImage || !modalClose || !modalLinkScryfall || !modalLinkEdhrec) {
    console.warn(`Commander modal elements not found for modalId: ${modalId}`);
    return;
  }

  // Attach click listeners to all commander links
  document.querySelectorAll('.link[data-commander]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const commanderName = link.dataset.commander;
      const kebabName = toKebabCase(commanderName);

      // Build image URL
      const imageUrl = `/static/assets/commanders/${kebabName}.jpg`;
      modalImage.src = imageUrl;

      // Set Scryfall link
      const scryfallUrl = `https://scryfall.com/search?q=${encodeURIComponent(commanderName)}`;
      modalLinkScryfall.href = scryfallUrl;
      modalLinkScryfall.textContent = `View ${commanderName} on Scryfall`;

      // Set EDHREC link
      const edhrecUrl = `https://edhrec.com/commanders/${kebabName}`;
      modalLinkEdhrec.href = edhrecUrl;
      modalLinkEdhrec.textContent = `View ${commanderName} on EDHREC`;

      // Show modal
      modal.classList.add('modal--active');
    });
  });

  // Also handle commander gallery images (for index.html.j2)
  document.querySelectorAll('.commander-gallery__image[data-commander]').forEach(img => {
    img.addEventListener('click', (e) => {
      const commanderName = img.dataset.commander;
      const kebabName = toKebabCase(commanderName);

      // Build image URL
      const imageUrl = `/static/assets/commanders/${kebabName}.jpg`;
      modalImage.src = imageUrl;

      // Set Scryfall link
      const scryfallUrl = `https://scryfall.com/search?q=${encodeURIComponent(commanderName)}`;
      modalLinkScryfall.href = scryfallUrl;
      modalLinkScryfall.textContent = `View ${commanderName} on Scryfall`;

      // Set EDHREC link
      const edhrecUrl = `https://edhrec.com/commanders/${kebabName}`;
      modalLinkEdhrec.href = edhrecUrl;
      modalLinkEdhrec.textContent = `View ${commanderName} on EDHREC`;

      // Show modal
      modal.classList.add('modal--active');
    });
  });

  // Close modal function
  function closeModal() {
    modal.classList.remove('modal--active');
    modalImage.src = '';
    modalLinkScryfall.href = '#';
    modalLinkScryfall.textContent = '';
    modalLinkEdhrec.href = '#';
    modalLinkEdhrec.textContent = '';
  }

  // Close modal
  modalClose.onclick = closeModal;

  // Close when clicking outside image (on overlay)
  modal.onclick = (e) => {
    if (e.target === modal || e.target.classList.contains('modal__overlay')) {
      closeModal();
    }
  };
  
  // Add touch support for mobile devices
  modal.addEventListener('touchstart', (e) => {
    if (e.target === modal || e.target.classList.contains('modal__overlay')) {
      closeModal();
    }
  });
}

function toKebabCase(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove commas, apostrophes, etc.
    .trim()
    .replace(/\s+/g, '-');         // replace spaces with hyphens
}

// Initialize default modal on page load
document.addEventListener('DOMContentLoaded', () => {
  initCommanderModal();
});