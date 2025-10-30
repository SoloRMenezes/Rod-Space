/* ===== Scroll reveal ===== */
const onView = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); onView.unobserve(e.target); }
  });
}, {threshold: .12});
document.querySelectorAll('.reveal').forEach(el=>onView.observe(el));

/* ===== Cartridges grid – centered expanding card ===== */
const tiles = document.querySelectorAll('.tile[data-detail]');
const detail = document.querySelector('#tileDetail');
const detailTitle = detail.querySelector('h5');
const detailText = detail.querySelector('.txt');

const DETAIL_MAP = {
  auth: {
    t:'Authentic Dream Storage',
    d:'Each cartridge contains a genuine dream imprint captured during natural REM sleep — no synthetic content.'
  },
  personal: {
    t:'Personal Recording',
    d:'Record your own dreams with Dream Band + Hub. Cartridges preserve emotion, tone, and unique neural patterns.'
  },
  trade: {
    t:'Dream Trading',
    d:'Exchange cartridges with friends & family to experience different perspectives and inner worlds.'
  },
  memory: {
    t:'Memory Preservation',
    d:'Archive special dreams as keepsakes to revisit or pass down to the people you love.'
  },
  replay: {
    t:'Replay Mode',
    d:'Relive favorite dreams exactly as they happened — every detail and emotion preserved.'
  },
  cont: {
    t:'Continue Mode',
    d:'Pick up unfinished dreams right where you left off; perfect for ongoing adventures.'
  },
  lucid: {
    t:'Lucid Switch',
    d:'Biometric monitoring detects stress and triggers lucid awareness so you can take control.'
  },
  shared: {
    t:'Shared Dreams',
    d:'Enter the same dream world simultaneously and create memories together.'
  },
  privacy: {
    t:'Complete Privacy',
    d:'All data stays on your Dream Hub at home. No cloud, no subscriptions, no ads.'
  },
};

tiles.forEach((tile, idx)=>{
  tile.addEventListener('click', ()=>{
    const key = tile.dataset.detail;
    const {t, d} = DETAIL_MAP[key];
    detailTitle.textContent = t;
    detailText.textContent = d;

    // insert detail card after the clicked tile so it appears centered beneath
    tile.after(detail);
    detail.classList.add('show');

    // slight scroll nudge so the opened card is obvious on mobile
    detail.scrollIntoView({block:'center', behavior:'smooth'});
  });
});

/* ===== Pricing -> Checkout modal ===== */
const priceButtons = document.querySelectorAll('[data-open-checkout]');
const dialog = document.querySelector('#checkout');
const chosen = document.querySelector('#chosenPlan');
const total = document.querySelector('#totalPrice');

const PRICE = {
  'Basic Kit': 299.89,
  'Complete Kit': 350.00,
  'Extra Cartridges': 29.89,
  'Storage Case': 29.89
};

priceButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const plan = btn.dataset.openCheckout;
    const amount = PRICE[plan] ?? 299.89;
    chosen.textContent = plan;
    total.textContent = `$${amount.toFixed(2)}`;
    dialog.showModal();
    document.body.style.overflow='hidden';
  });
});

dialog.querySelector('.close').addEventListener('click', ()=>{
  dialog.close();
  document.body.style.overflow='';
});

/* Close on outside click */
dialog.addEventListener('click', (e)=>{
  const rect = dialog.querySelector('.modal').getBoundingClientRect();
  const inDialog = (e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom);
  if(!inDialog){ dialog.close(); document.body.style.overflow=''; }
});

/* Fake submit */
dialog.querySelector('form').addEventListener('submit', (e)=>{
  e.preventDefault();
  alert('Demo checkout only — no charge will occur.');
  dialog.close();
  document.body.style.overflow='';
});
