"""Build the download catalogue from every Rod Space card and its local assets."""
from pathlib import Path
from urllib.parse import unquote,urlsplit
import json,hashlib,re
root=Path(__file__).resolve().parents[1]
source=(root/'index.html').read_text().split('const PROJECTS_DATA = [')[1].split('\n      ];')[0]
text_ext={'.html','.js','.css','.json'}
asset_ext=text_ext|{'.png','.jpg','.jpeg','.webp','.svg','.gif','.mp3','.wav','.ogg','.mp4','.webm','.ttf','.woff','.woff2','.ico','.glb','.gltf','.bin'}
def gather(page):
 found=set();todo=[root/page]
 if '/' in page:todo += [p for p in (root/page).parent.rglob('*') if p.is_file() and p.suffix.lower() in asset_ext]
 while todo:
  p=todo.pop().resolve()
  if p in found or not p.is_file() or not p.is_relative_to(root.resolve()):continue
  found.add(p)
  if p.suffix not in text_ext:continue
  text=p.read_text()
  for raw in re.findall(r'''["'`](.[^"'`\n<>]*?)["'`]''',text):
   if len(raw)>220 or raw.startswith(('data:','http:','https:','#')) or any(c in raw for c in '{};\n'):continue
   ref=unquote(urlsplit(raw).path)
   candidate=(p.parent/ref).resolve()
   if candidate.is_file() and candidate.suffix.lower() in asset_ext:todo.append(candidate)
   elif candidate.is_dir() and candidate.is_relative_to(root.resolve()) and ref not in ('','.','./','..','../'):
    todo.extend(x for x in candidate.rglob('*') if x.is_file() and x.suffix.lower() in asset_ext)
  # Import-map module roots and dynamically constructed assets.
  if p.name=='multiplayer.html':todo.extend((root/'assets/vendor/three160').rglob('*.js'))
  if p.name=='3d_drift_racer.html':todo.extend(x for x in (root/'assets/vendor').glob('tokyo-*') if x.is_file())
  if p.name.startswith('backrooms'):todo.extend(root.glob('backrooms*.html'))
  if p.name=='DND.html':todo.append(root/'DNDC.html')
 return sorted(str(p.relative_to(root.resolve())) for p in found)
result={}
for block in source.split('},'):
 def field(k):
  m=re.search(k+r': (?:BASE_URL \+ )?"([^"]+)"',block);return m[1] if m else ''
 id,name,page=[field(k) for k in ['id','name','url']]
 if not page:continue
 if (root/page).is_dir():page=page.rstrip('/')+'/index.html'
 if not (root/page).is_file():raise ValueError('Missing game: '+page)
 print("Collecting",page,flush=True)
 files=gather(page)
 result[id]={'name':name,'page':page,'files':[{'path':f,'bytes':(root/f).stat().st_size,'hash':hashlib.sha256((root/f).read_bytes()).hexdigest()} for f in files]}
 if id in ('nextup','karaoke-night'):result[id]['note']='Online song search and streaming need internet. Local content works offline.'
 result[id]['bytes']=sum(f['bytes'] for f in result[id]['files'])
 result[id]['version']=hashlib.sha256(json.dumps(result[id]).encode()).hexdigest()[:16]
(root/'offline-catalog.js').write_text('self.OFFLINE_CATALOG = '+json.dumps(result,indent=2)+';\n')
shell=['index.html','party.html','offline.js','offline-catalog.js','assets/vendor/tailwind.js','assets/vendor/lucide.js']
version=hashlib.sha256(b''.join((root/f).read_bytes() for f in shell)).hexdigest()[:16]
p=root/'sw.js';p.write_text(re.sub(r"const SHELL = '[^']+';", "const SHELL = 'rod-shell-"+version+"';",p.read_text()))
print('Built downloads for',len(result),'projects')
