from pathlib import Path
import re,json,base64
R=Path(__file__).parent
css=(R/'studio.css').read_text()
(R/'studio-assets.js').write_text('window.IOStudioAssets='+json.dumps({'css':css})+';')
s=(R/'index.html').read_text()
fonts=(R.parent/'fonts.css').read_text()
fonts=re.sub(r"url\('([^']+)'\)",lambda m:"url('data:font/woff2;base64,"+base64.b64encode((R.parent/m[1]).read_bytes()).decode()+"')",fonts)
s=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+(fonts if m[1]=='../fonts.css' else (R/m[1]).read_text())+'</style>',s)
s=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(R/m[1]).read_text().replace('</script','<\\/script')+'</script>',s)
(R/'Application Studio.html').write_text(s)
print('Application Studio:',len(s),'bytes')
