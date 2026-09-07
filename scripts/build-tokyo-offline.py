"""Build Tokyo Drift as one directly openable HTML file (no local server)."""
from pathlib import Path
import base64, hashlib, os, re, subprocess, tempfile
root = Path(__file__).resolve().parents[1]
source = (root / '3d_drift_racer.html').read_text()
entry = root / '.offline-entry.js'
try:
    match = re.search(r'<script type="module">([\s\S]*?)</script>', source)
    entry.write_text(match[1])
    with tempfile.TemporaryDirectory() as temp:
        bundle = Path(temp) / 'game.js'
        env = dict(os.environ, npm_config_cache='/tmp/tokyo-npm-cache')
        subprocess.run(['npx', '--yes', 'esbuild@0.27.4', str(entry), '--bundle', '--format=iife', '--minify', '--outfile=' + str(bundle)], check=True, env=env)
        html = source[:match.start()] + '<script>' + bundle.read_text().replace('</script', '<\\/script') + '</script>' + source[match.end():]
    for name in ['tailwind.js', 'lucide.js']:
        html = html.replace(f'<script src="./assets/vendor/{name}"></script>', '<script>' + (root / 'assets/vendor' / name).read_text().replace('</script', '<\\/script') + '</script>')
    css = (root / 'assets/vendor/tokyo-fonts.css').read_text()
    for name in re.findall(r'url\(([^)]+)\)', css):
        css = css.replace(name, 'data:font/ttf;base64,' + base64.b64encode((root / 'assets/vendor' / name).read_bytes()).decode())
    html = html.replace('<link href="./assets/vendor/tokyo-fonts.css" rel="stylesheet">', '<style>' + css + '</style>')
    html = html.replace('<head>', '<head>\n<!-- Source SHA256: ' + hashlib.sha256(source.encode()).hexdigest() + ' -->')
    target = root.parent / 'Tokyo Drift/index.html'
    target.write_text(html)
    print('Built self-contained ' + str(target))
finally:
    entry.unlink(missing_ok=True)
