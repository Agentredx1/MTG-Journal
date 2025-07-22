// Modal elements
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');
const modalLinkScryfall = document.getElementById('modalLinkScryfall');
const modalLinkEdhrec = document.getElementById('modalLinkEdhrec');


// Attach click listeners to all commander links
document.querySelectorAll('.commander-link').forEach(link => {
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
    modal.style.display = 'flex';
  });
});

// Close modal
modalClose.onclick = () => {
  modal.style.display = 'none';
  modalImage.src = '';
  modalLink.href = '#';
  modalLink.textContent = '';
};

// Close when clicking outside image
modal.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    modalImage.src = '';
    modalLink.href = '#';
    modalLink.textContent = '';
  }
};

function toKebabCase(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')   // remove commas, apostrophes, etc.
    .trim()
    .replace(/\s+/g, '-');         // replace spaces with hyphens
}