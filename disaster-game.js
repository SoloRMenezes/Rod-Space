/* Game rules are separate from rendering so every pass, reveal and win can be checked. */
const SpiralRules = {
  create(names, cards, random = Math.random) {
    const deck = cards.map(c => c.id);
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    const score = id => cards.find(c => c.id === id).score;
    const players = names.map(name => ({ name, lane: deck.splice(0, 3).sort((a, b) => score(a) - score(b)) }));
    return { version: 1, players, deck, current: deck.pop(), starter: 0, active: 0, attempts: 0, phase: 'guess', result: null, discarded: [], winners: [] };
  },
  guess(game, slot, cards) {
    if (game.phase !== 'guess') return false;
    const lane = game.players[game.active].lane;
    if (!Number.isInteger(slot) || slot < 0 || slot > lane.length) return false;
    const score = id => cards.find(c => c.id === id).score;
    const value = score(game.current);
    const correct = (slot === 0 || score(lane[slot - 1]) < value) && (slot === lane.length || value < score(lane[slot]));
    const guesser = game.active;
    if (correct) {
      lane.splice(slot, 0, game.current);
      game.result = { kind: 'correct', player: guesser };
      if (lane.length >= 10) game.winners = [guesser];
    } else {
      game.attempts++;
      game.result = { kind: game.attempts === game.players.length ? 'discard' : 'pass', player: guesser };
      if (game.result.kind === 'discard') game.discarded.push(game.current);
    }
    game.phase = 'result';
    return correct;
  },
  next(game) {
    if (game.phase !== 'result') return;
    if (game.result.kind === 'pass') {
      game.active = (game.active + 1) % game.players.length;
      game.phase = 'guess'; game.result = null; return;
    }
    if (game.winners.length || !game.deck.length) {
      if (!game.winners.length) { const highest = Math.max(...game.players.map(p => p.lane.length)); game.winners = game.players.flatMap((p, i) => p.lane.length === highest ? [i] : []); }
      game.phase = 'end'; return;
    }
    game.starter = (game.starter + 1) % game.players.length;
    game.active = game.starter; game.attempts = 0; game.current = game.deck.pop(); game.phase = 'guess'; game.result = null;
  }
};
if (typeof module !== 'undefined') module.exports = SpiralRules;
if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id), storageKey = 'rod-shit-spiral-v1';
  const cards = new Map(DISASTER_CARDS.map(c => [c.id, c]));
  let count = 2, game = null, saved = null;
  const names = Array.from({length: 8}, (_, i) => 'Player ' + (i + 1));
  function valid(g) {
    if (!g || g.version !== 1 || !Array.isArray(g.players) || g.players.length < 2 || g.players.length > 8 || !['guess','result','end'].includes(g.phase)) return false;
    if (!Number.isInteger(g.active) || g.active < 0 || g.active >= g.players.length || !Number.isInteger(g.starter) || g.starter < 0 || g.starter >= g.players.length || !cards.has(g.current)) return false;
    if (!Array.isArray(g.deck) || !Array.isArray(g.discarded) || !Array.isArray(g.winners) || !Number.isInteger(g.attempts) || g.attempts < 0 || g.attempts > g.players.length) return false;
    if (g.phase === 'result' && (!g.result || !['pass','correct','discard'].includes(g.result.kind) || g.result.player !== g.active)) return false;
    if (!g.players.every(p => typeof p.name === 'string' && p.name.length <= 24 && Array.isArray(p.lane) && p.lane.length >= 3 && p.lane.length <= 10 && p.lane.every((id,i) => cards.has(id) && (!i || cards.get(p.lane[i-1]).score < cards.get(id).score)))) return false;
    const ids = [...g.deck,...g.discarded,...g.players.flatMap(p=>p.lane)];
    if (g.phase === 'guess' || g.result?.kind === 'pass') ids.push(g.current);
    return ids.length === cards.size && new Set(ids).size === cards.size && ids.every(id=>cards.has(id)) && g.winners.every(i=>Number.isInteger(i)&&i>=0&&i<g.players.length);
  }
  try { const candidate = JSON.parse(localStorage.getItem(storageKey)); if (valid(candidate) && candidate.phase !== 'end') saved = candidate; } catch {}
  $('resume').hidden = !saved;
  function save() { try { localStorage.setItem(storageKey, JSON.stringify(game)); } catch { $('notice').textContent = 'This browser cannot save progress. Keep this tab open to finish your game.'; } }
  function buildNames() {
    $('names').replaceChildren(); $('player-count').textContent = count; $('less').disabled = count === 2; $('more').disabled = count === 8;
    for (let i=0;i<count;i++) { const label=document.createElement('label'),input=document.createElement('input');label.textContent='PLAYER '+(i+1);input.value=names[i];input.maxLength=24;input.autocomplete='off';input.oninput=()=>names[i]=input.value;label.append(input);$('names').append(label); }
  }
  $('less').onclick=()=>{count=Math.max(2,count-1);buildNames();};$('more').onclick=()=>{count=Math.min(8,count+1);buildNames();};buildNames();
  $('help').onclick=()=>$('rules').showModal();$('close-help').onclick=()=>$('rules').close();
  $('new-game').onclick=()=>$('confirm').showModal();$('cancel-reset').onclick=()=>$('confirm').close();
  function setup() { game=null;saved=null;try{localStorage.removeItem(storageKey);}catch{}$('confirm').close();$('setup').hidden=false;$('play').hidden=true;$('end').hidden=true;$('new-game').hidden=true;$('resume').hidden=true;$('notice').textContent=''; }
  $('confirm-reset').onclick=setup;$('again').onclick=setup;
  $('start').onclick=()=>{game=SpiralRules.create(names.slice(0,count).map((n,i)=>n.trim()||'Player '+(i+1)),DISASTER_CARDS);save();render();};
  $('resume').onclick=()=>{game=saved;render();};
  $('next').onclick=()=>{SpiralRules.next(game);save();render();};
  function render() {
    $('setup').hidden=true;$('new-game').hidden=false;$('play').hidden=game.phase==='end';$('end').hidden=game.phase!=='end';
    if(game.phase==='end'){$('winner').textContent=game.winners.map(i=>game.players[i].name).join(' & ')+(game.winners.length===1?' wins.':' tie.');$('end-message').textContent=game.players.map(p=>p.name+': '+p.lane.length+' cards').join(' · ');return;}
    const player=game.players[game.active], card=cards.get(game.current), result=game.phase==='result'?game.result:null;
    $('scoreboard').replaceChildren();
    game.players.forEach((p,i)=>{const chip=document.createElement('div');chip.className='player-chip'+(i===game.active?' current':'');chip.textContent=p.name;const score=document.createElement('strong');score.textContent=p.lane.length+'/10';chip.append(score);$('scoreboard').append(chip);});
    $('turn-name').textContent=player.name+"'s turn";$('deck-count').textContent=game.deck.length+' left in the deck';$('situation-text').textContent=card.text;
    const revealed=result&&result.kind!=='pass';$('rating').textContent=revealed?card.score+' / 100':'? / 100';$('rating').classList.toggle('hidden-number',!revealed);
    $('result').hidden=!result;$('lane-title').textContent=result?'Your lane':"Where does this disaster fit?";$('lane-help').textContent=result?'Least awful → most awful':'Tap a + between two cards. Swipe to see your whole lane.';
    if(result){const nextPlayer=game.players[(game.active+1)%game.players.length].name;
      $('result-title').textContent=result.kind==='correct'?'Correct. Keep that disaster.':result.kind==='pass'?'Wrong gap. Someone else’s problem.':'Everyone missed. Bin it.';
      $('result-text').textContent=result.kind==='pass'?'Pass the device to '+nextPlayer+'. The score stays hidden.':result.kind==='correct'?player.lane.length+'/10 cards collected.':"That one was rated "+card.score+'. Debate it amongst yourselves.';
      $('next').textContent=game.winners.length?'See the winner →':result.kind==='pass'?'Pass to '+nextPlayer+' →':'Next situation →';
    }
    $('lane').replaceChildren();
    const addSlot=index=>{const button=document.createElement('button');button.className='slot';button.innerHTML='<span>+</span>';const before=index?cards.get(player.lane[index-1]).score:null,after=index<player.lane.length?cards.get(player.lane[index]).score:null;button.setAttribute('aria-label',before===null?'Before '+after:after===null?'After '+before:'Between '+before+' and '+after);button.onclick=()=>{if(game.phase!=='guess')return;SpiralRules.guess(game,index,DISASTER_CARDS);save();render();};$('lane').append(button);};
    player.lane.forEach((id,i)=>{if(!result)addSlot(i);const owned=document.createElement('article'),score=document.createElement('b'),text=document.createElement('p');owned.className='owned';score.textContent=cards.get(id).score;text.textContent=cards.get(id).text;owned.append(score,text);$('lane').append(owned);});if(!result)addSlot(player.lane.length);$('lane').scrollLeft=0;
  }
}
