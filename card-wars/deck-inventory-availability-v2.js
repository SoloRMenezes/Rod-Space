(function () {
  function heading(text) {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4')).find(function (node) {
      return node.textContent.trim().toLowerCase() === text;
    });
  }

  function rangeBetween(start, end) {
    var range = document.createRange();
    range.setStartAfter(start);
    if (end) range.setEndBefore(end);
    else range.setEndAfter(document.body.lastChild || document.body);
    return range;
  }

  function wrapper(button) {
    var node = button;
    for (var i = 0; i < 8 && node && node !== document.body; i += 1) {
      if (node.querySelector && node.querySelector('img')) {
        var classes = typeof node.className === 'string' ? node.className : '';
        if (node.tagName === 'ARTICLE' || node.tagName === 'LI' || /card/i.test(classes)) return node;
      }
      node = node.parentElement;
    }
    return button.parentElement;
  }

  function key(card) {
    var image = card.querySelector('img');
    if (!image) return card.textContent.trim();
    return (image.currentSrc || image.src).split('?')[0].split('#')[0];
  }

  function cardsIn(range, label) {
    var seen = new Set();
    return Array.from(document.querySelectorAll('button'))
      .filter(function (button) { return button.textContent.trim().toLowerCase() === label; })
      .map(wrapper)
      .filter(function (card) {
        if (!card || seen.has(card) || !range.intersectsNode(card)) return false;
        seen.add(card);
        return true;
      });
  }

  function accountCount(card) {
    if (!card.dataset.accountOwnedCount) {
      var match = card.textContent.match(/(\d+)\s+owned\b/i);
      if (match) card.dataset.accountOwnedCount = match[1];
    }
    return Number(card.dataset.accountOwnedCount || 0);
  }

  function setVisibleCount(card, count) {
    var walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (/\d+\s+owned\b/i.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(/\d+(?=\s+owned\b)/i, String(count));
        return;
      }
    }
  }

  function refresh() {
    var deckTitle = heading('deck cards');
    var ownedTitle = heading('owned cards');
    if (!deckTitle || !ownedTitle) return;

    var titles = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
    var ownedIndex = titles.indexOf(ownedTitle);
    var nextTitle = ownedIndex >= 0 ? titles[ownedIndex + 1] : null;
    var deckRange = rangeBetween(deckTitle, ownedTitle);
    var ownedRange = rangeBetween(ownedTitle, nextTitle);
    var committed = new Map();

    cardsIn(deckRange, 'remove').forEach(function (card) {
      var cardKey = key(card);
      committed.set(cardKey, (committed.get(cardKey) || 0) + 1);
    });

    cardsIn(ownedRange, 'add').forEach(function (card) {
      var cardKey = key(card);
      var remaining = Math.max(0, accountCount(card) - (committed.get(cardKey) || 0));
      setVisibleCount(card, remaining);
      card.hidden = remaining === 0;
    });
  }

  var observer = new MutationObserver(refresh);
  observer.observe(document.body, { childList: true, subtree: true });
  refresh();
})();
