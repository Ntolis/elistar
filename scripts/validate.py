from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from collections import Counter

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(); self.path=path; self.ids=[]; self.links=[]; self.h1=0; self.template=0; self.images=0; self.forms=[]
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='template': self.template+=1
        if self.template: return
        if 'id' in a:self.ids.append(a['id'])
        if tag=='h1':self.h1+=1
        if tag=='a': self.links.append(a.get('href',''))
        if tag in ('script','img','link'):
            u=a.get('src') or a.get('href')
            if u:self.links.append(u)
        if tag=='img':
            self.images+=1
            assert a.get('alt'), f'{self.path}: image alt missing'
            assert a.get('width') and a.get('height'), f'{self.path}: image dimensions missing'
        if tag=='form': self.forms.append(a)
    def handle_endtag(self,tag):
        if tag=='template':self.template-=1

names=['index','production','software','about','support','contacts','foton','price']
pages={n+'.html':Page(Path(n+'.html')) for n in names}
links=0
for name,p in pages.items():
    assert p.h1==1, f'{name}: expected one h1, got {p.h1}'
    assert len(p.ids)==len(set(p.ids)),f'{name}: duplicate IDs'
    assert p.forms and all(x.get('action')=='mailto:arkhast@mail.ru' for x in p.forms)
    for link in p.links:
        u=urlsplit(link)
        if u.scheme or u.netloc:continue
        target=unquote(u.path) or name
        assert Path(target).is_file(),f'{name}: missing {target}'
        if u.fragment:assert u.fragment in pages[target].ids,f'{name}: missing anchor {link}'
        links+=1
    print(f'OK {name}: one H1, unique IDs, {p.images} images, form and local links')
print(f'Validated {len(pages)} pages, {links} local links/assets')
