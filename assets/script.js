// Script for Rod Space
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  const chips = document.querySelectorAll(".chip");
  const cards = document.querySelectorAll(".card");

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const filter = chip.dataset.filter;
      cards.forEach(card => {
        if (filter === "all" || card.dataset.tags.includes(filter)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  const toggle = document.getElementById("themeToggle");
  toggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
});
