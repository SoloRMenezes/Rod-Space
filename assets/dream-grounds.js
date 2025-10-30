// Smooth reveal
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => e.isIntersecting && e.target.classList.add("in"));
});
reveals.forEach(r => observer.observe(r));

// Expand cards & tiles
function makeExpandable(selector) {
  const items = document.querySelectorAll(selector);
  items.forEach(i => {
    i.addEventListener("click", () => {
      const isOpen = i.classList.contains("expanded");
      items.forEach(e => e.classList.remove("expanded"));
      if (!isOpen) i.classList.add("expanded");
    });
  });
}
makeExpandable(".card");
makeExpandable(".tile");

// Modal
const modal = document.getElementById("orderModal");
document.getElementById("orderBtn").onclick = () => modal.showModal();
document.getElementById("closeModal").onclick = () => modal.close();
