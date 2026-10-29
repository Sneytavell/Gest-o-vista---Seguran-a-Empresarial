"""Monta o portal Gestão à Vista.
Fontes: src/telas.html (telas), src/estilo.css (visual), src/app.js (código),
dados/logo.txt (logo) e dados/semente.json (lista inicial de painéis, importada uma vez pelo administrador).
Saída: dist/index.html + dist/firebase-config.js (pasta publicada na Vercel).
"""
from pathlib import Path
import json, shutil
raiz = Path(__file__).parent
ler = lambda p: (raiz / p).read_text(encoding='utf-8')
FB = '10.12.2'
semente = json.dumps(json.loads(ler('dados/semente.json')), ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
scripts = ''.join(f'<script src="https://www.gstatic.com/firebasejs/{FB}/firebase-{m}-compat.js"></script>\n' for m in ('app', 'auth', 'firestore'))
html = ('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="robots" content="noindex, nofollow">\n'
        '<title>Gestão à Vista — Segurança Empresarial</title>\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap" rel="stylesheet">\n'
        '<style>' + ler('src/estilo.css') + '</style>\n</head>\n<body class="travado">\n'
        + ler('src/telas.html') + '\n'
        '<script id="logo" type="text/plain">' + ler('dados/logo.txt').strip() + '</script>\n'
        '<script id="semente" type="application/json">' + semente + '</script>\n'
        + scripts + '<script src="firebase-config.js"></script>\n'
        '<script>\n' + ler('src/app.js') + '\n</script>\n</body>\n</html>\n')
dist = raiz / 'dist'; dist.mkdir(exist_ok=True)
(dist / 'index.html').write_text(html, encoding='utf-8')
shutil.copy(raiz / 'firebase-config.js', dist / 'firebase-config.js')
print(f'OK: dist/index.html ({len(html)//1024} KB)')
