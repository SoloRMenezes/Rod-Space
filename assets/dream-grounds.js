// ===== EXPANDABLE CARDS =====
const cards = document.querySelectorAll('.cards-3.expandable .card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    const isOpen = card.classList.contains('expanded');

    // collapse all cards first
    cards.forEach(c => c.classList.remove('expanded'));

    // expand clicked one if it was closed
    if (!isOpen) card.classList.add('expanded');
    if (!isOpen) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // optional keyboard accessibility
  card.addEventListener('keypress', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});
