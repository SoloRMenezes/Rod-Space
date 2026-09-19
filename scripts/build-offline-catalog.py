"""Regenerate after changing an offline-supported game or its dependencies."""
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
v='assets/vendor/'
games=[('multiplayer-test','Parkour','multiplayer.html',[v+'tailwind.js',v+'three160/three.module.js',v+'three160/controls/PointerLockControls.js']),('3d-drift','Tokyo Drift','3d_drift_racer.html',[str(p.relative_to(root)) for p in (root/v).glob('*') if p.is_file()]),('pac-man-3d','Pac-Man 3D','pac-man-3d.html',[v+'three160/three.module.js']),('reaction','Reaction','reaction.html',[]),('blackjack','Blackjack','Blackjack.html',[v+'tailwind.js']),('who-wants-to-be-a-millionaire','Millionaire','Who Wants to be a Millionaire.html',[v+'tailwind.js'])]
result={}
for id,name,page,assets in games:
 files=[page]+assets
 result[id]={'name':name,'page':page,'files':[{'path':f,'bytes':(root/f).stat().st_size,'hash':hashlib.sha256((root/f).read_bytes()).hexdigest()} for f in files]}
 result[id]['bytes']=sum(f['bytes'] for f in result[id]['files'])
 result[id]['version']=hashlib.sha256(json.dumps(result[id]).encode()).hexdigest()[:16]
(root/'offline-catalog.js').write_text('self.OFFLINE_CATALOG = '+json.dumps(result,indent=2)+';\n')
# Bump the launcher cache whenever its offline shell changes.
shell=['index.html','offline.js','offline-catalog.js','assets/vendor/tailwind.js','assets/vendor/lucide.js']
version=hashlib.sha256(b''.join((root/f).read_bytes() for f in shell)).hexdigest()[:16]
import re
p=root/'sw.js'
p.write_text(re.sub(r"const SHELL = '[^']+';", "const SHELL = 'rod-shell-"+version+"';",p.read_text()))
