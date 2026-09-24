from pathlib import Path
import re,json,base64,zipfile,hashlib,runpy,sys
R=Path(__file__).parent
mime={'.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.json':'application/json','.md':'text/markdown'}
def data(p):return 'data:'+mime.get(p.suffix,'application/octet-stream')+';base64,'+base64.b64encode(p.read_bytes()).decode()
tokens=json.loads((R/'tokens.json').read_text())
(R/'tokens-runtime.js').write_text('window.IOTokens='+json.dumps(tokens)+';\n'+(R/'token-runtime-template.js').read_text())
(R/'field-source.js').write_text('window.FIELD_SOURCE='+json.dumps((R/'source/field.frag').read_text())+';')
(R/'materials-source.js').write_text('window.MATERIAL_SOURCE='+json.dumps((R/'source/materials.frag').read_text())+';')
fonts=(R/'fonts.css').read_text()
fonts=re.sub(r"url\('([^']+)'\)",lambda m:"url('"+data(R/m[1])+"')",fonts)
brand=":root{--mark:url('"+data(R/'assets/marks/mark.svg')+"');--wordmark:url('"+data(R/'assets/marks/wordmark.png')+"')}"
(R/'brand-assets.css').write_text(brand)
files={str(p.relative_to(R)):data(p) for p in [*list((R/'assets/marks').glob('*')),R/'tokens.json',R/'BRAND_SYSTEM.md',*list((R/'assets/fonts').glob('*'))]}
bundle={'tokenRuntime':(R/'tokens-runtime.js').read_text(),'tokens':tokens,'fontCSS':fonts,'brandCSS':brand,'css':(R/'style.css').read_text(),'engine':(R/'engine.js').read_text(),'fieldSource':(R/'field-source.js').read_text(),'materialSource':(R/'materials-source.js').read_text(),'rules':(R/'BRAND_SYSTEM.md').read_text(),'files':files}
(R/'bundle-assets.js').write_text('window.IOBundle='+json.dumps(bundle)+';')
s=(R/'index.html').read_text()
s=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+(fonts if m[1]=='fonts.css' else (R/m[1]).read_text())+'</style>',s)
s=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(R/m[1]).read_text().replace('</script','<\\/script')+'</script>',s)
s=s.replace('href="assets/marks/mark.svg"','href="'+data(R/'assets/marks/mark.svg')+'"')
(R/'Impossible Brand Toolkit.html').write_text(s)
# Keep the application editor synchronized with the canonical embedded assets.
runpy.run_path(str(R/'application-studio/build.py'))
runpy.run_path(str(R/'brief-studio/build.py'))
# Keep the prebuilt application and component files on the current renderer.
material_script=(R/'materials-source.js').read_text()
engine_script=(R/'engine.js').read_text()
for folder in [R/'applications',R/'application-studio/examples',R/'application-studio/components']:
 for p in folder.glob('*.html'):
  source=p.read_text()
  source,n=re.subn(r'window\.MATERIAL_SOURCE=.*?;</script>',lambda _:material_script+'</script>',source,count=1,flags=re.S)
  if n!=1:raise ValueError(f'Material source missing from {p}')
  source,n=re.subn(r'<script>/\* Shared WebGL field renderer\..*?</script>',lambda _:'<script>'+engine_script+'</script>',source,count=1,flags=re.S)
  if n!=1:raise ValueError(f'Engine source missing from {p}')
  if folder.name=='applications':
   css='<style>'+fonts+'\n'+brand+'\n'+(R/'style.css').read_text()+'</style>'
   source,n=re.subn(r'<style>.*?</style>',lambda _:css,source,count=1,flags=re.S)
   if n!=1:raise ValueError(f'Application CSS missing from {p}')
  source=source.replace('/* Codex edition: readable metadata; source color tokens stay exact. */','/* Readable metadata; source color tokens stay exact. */')
  p.write_text(source)
if '--zip' in sys.argv:
 exclude={'qa','_handoff','_superseded','source-history','review','explorations','Impossible Brand Toolkit','DECISIONS.md','sources.json','VERIFICATION.md','impossible-specimen-00.html','.DS_Store','__pycache__'}
 with zipfile.ZipFile(R/'Impossible-Brand-Toolkit.zip','w',zipfile.ZIP_DEFLATED) as z:
  for p in R.rglob('*'):
   rel=p.relative_to(R)
   if p.is_file() and p.suffix!='.zip' and not exclude.intersection(rel.parts):
    dest='Impossible Brand Toolkit/'+str(rel)
    if rel.name in {'index.html','Impossible Brand Toolkit.html'} and len(rel.parts)==1:
     z.writestr(dest,p.read_text().replace('<a href="Impossible-Brand-Toolkit.zip" download>Complete toolkit ZIP ↓</a>',''))
    else:z.write(p,dest)
print('Standalone HTML:',len(s),'bytes; assets:',len(files))
