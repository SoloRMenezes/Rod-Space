(function () {
  function cardKey(card) {
    const image = card.querySelector('img');
    return image ? image.currentSrc || image.src : card.textContent.trim();
  }

  function cardNodes(section) {
    return Array.from(section.querySelectorAll('article, li, [class*="card"]')).filter((node) => {
      const button = node.querySelector('button');
      return button && /^(add|remove|not compatible)$/i.test(button.textContent.trim());
    });
  }

  function refreshAvailableCards() {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
    const deckHeading = headings.find((heading) => /deck cards/i.test(heading.textContent));
    const ownedHeading = headings.find((heading) => /owned cards/i.test(heading.textContent));
    if (!deckHeading || !ownedHeading) return;

    const deckSection = deckHeading.closest('section, main, div');
    const ownedSection = ownedHeading.closest('section, main, div');
    if (!deckSection || !ownedSection || deckSection === ownedSection) return;

    const committed = new Map();
    cardNodes(deckSection).forEach((card) => {
      const key = cardKey(card);
      committed.set(key, (committed.get(key) || 0) + 1);
    });

    cardNodes(ownedSection).forEach((card) => {
      const key = cardKey(card);
      const remaining = committed.get(key) || 0;
      if (remaining > 0) {
        card.hidden = true;
        committed.set(key, remaining - 1);
      } else {
        card.hidden = false;
      }
    });
  }

  const observer = new MutationObserver(refreshAvailableCards);
  observer.observe(document.body, { childList: true, subtree: true });
  refreshAvailableCards();
})();
