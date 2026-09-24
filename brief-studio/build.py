from pathlib import Path
import json,re
R=Path(__file__).parent
css=(R/'studio.css').read_text()
a=(R/'assets.js').read_text().split('\nwindow.BriefStyles=')[0]
(R/'assets.js').write_text(a+'\nwindow.BriefStyles='+json.dumps(css)+';\nwindow.BriefTokenRuntime='+json.dumps((R.parent/'tokens-runtime.js').read_text())+';')
a=(R/'assets.js').read_text()
for name,source in [('BriefFieldCode','field-source.js'),('BriefMaterialCode','materials-source.js'),('BriefEngineCode','engine.js')]:a+='\nwindow.'+name+'='+json.dumps((R.parent/source).read_text())+';'
(R/'assets.js').write_text(a)
s=(R/'index.html').read_text()
s=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+(R/m[1]).read_text()+'</style>',s)
s=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(R/m[1]).read_text().replace('</script','<\\/script')+'</script>',s)
(R/'Impossible Brief Studio.html').write_text(s)
print('Brief Studio:',len(s),'bytes')
