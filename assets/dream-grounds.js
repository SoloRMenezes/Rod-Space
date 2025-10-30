// year
document.getElementById('year').textContent = new Date().getFullYear();

// intersection reveal
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  })
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// tile expand also works on keyboard
document.querySelectorAll('.tile').forEach(t=>{
  t.tabIndex = 0;
});

// fake checkout
const dlg = document.getElementById('checkout');
const chosen = document.getElementById('chosenPlan');
const total = document.getElementById('totalPrice');

function openCheckout(plan){
  chosen.textContent = `Dream Grounds ${plan}`;
  total.textContent = (plan.includes('Extra') ? '$29.89' : (plan.includes('Basic') ? '$299.89' : '$350.00'));
  dlg.showModal();
}

document.querySelectorAll('[data-open-checkout]').forEach(btn=>{
  btn.addEventListener('click', ()=> openCheckout(btn.getAttribute('data-open-checkout')));
});

dlg?.querySelector('.close')?.addEventListener('click', ()=> dlg.close());

// block real submit
dlg?.querySelector('.modal')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  alert('Demo only — no payment processed.');
  dlg.close();
});
