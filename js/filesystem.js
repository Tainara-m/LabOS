const FileSystem = (() => {
  const STORAGE_KEY = 'labos_fs_v2';
  const BACKUPS_KEY = 'labos_backups_v2';
  const IMAGES_KEY = 'labos_images_v2';
  const VMS_KEY = 'labos_vms_v2';
  const APPS_KEY = 'labos_apps_v2';

  const defaultFS = {
    type: 'dir', name: '/', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
    children: {
      home: { type: 'dir', name: 'home', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', children: {
        user: { type: 'dir', name: 'user', permissions: 'drwxr-xr-x', owner: 'user', group: 'user', children: {
          'readme.txt': { type: 'file', name: 'readme.txt', permissions: '-rw-r--r--', owner: 'user', group: 'user',
            content: 'Bem-vindo ao Lab OS!\nAcademia de SysAdmins da NeoCorp.\nComplete as missoes e vire uma lenda!', size: 90 },
          docs: { type: 'dir', name: 'docs', permissions: 'drwxr-xr-x', owner: 'user', group: 'user', children: {
            'notas.txt': { type: 'file', name: 'notas.txt', permissions: '-rw-r--r--', owner: 'user', group: 'user', content: 'Anotacoes do laboratorio.', size: 26 }
          }}
        }}
      }},
      etc: { type: 'dir', name: 'etc', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', children: {
        hostname: { type: 'file', name: 'hostname', permissions: '-rw-r--r--', owner: 'root', group: 'root', content: 'lab-os', size: 6 }
      }},
      var: { type: 'dir', name: 'var', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', children: {
        log: { type: 'dir', name: 'log', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', children: {
          syslog: { type: 'file', name: 'syslog', permissions: '-rw-r-----', owner: 'root', group: 'adm', content: '[boot] System started', size: 22 }
        }}
      }},
      backup: { type: 'dir', name: 'backup', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', children: {} },
      images: { type: 'dir', name: 'images', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', children: {} },
      vms: { type: 'dir', name: 'vms', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', children: {} },
      tmp: { type: 'dir', name: 'tmp', permissions: 'drwxrwxrwx', owner: 'root', group: 'root', children: {} }
    }
  };

  let fs = null;
  let currentPath = '/home/user';

  function load() {
    try { const s = localStorage.getItem(STORAGE_KEY); fs = s ? JSON.parse(s) : JSON.parse(JSON.stringify(defaultFS)); }
    catch { fs = JSON.parse(JSON.stringify(defaultFS)); }
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(fs)); }
  function reset() {
    fs = JSON.parse(JSON.stringify(defaultFS)); currentPath = '/home/user'; save();
    localStorage.removeItem(BACKUPS_KEY); localStorage.removeItem(IMAGES_KEY);
    localStorage.removeItem(VMS_KEY); localStorage.removeItem(APPS_KEY);
  }
  function normalize(path) {
    const parts = path.split('/').filter(Boolean); const stack = [];
    for (const p of parts) { if (p === '..') stack.pop(); else if (p !== '.') stack.push(p); }
    return '/' + stack.join('/');
  }
  function resolvePath(path) {
    if (!path || path === '.') return currentPath;
    if (path === '..') { const parts = currentPath.split('/').filter(Boolean); parts.pop(); return '/' + parts.join('/') || '/'; }
    if (path.startsWith('/')) return normalize(path);
    return normalize(currentPath + '/' + path);
  }
  function getNode(path) {
    path = normalize(path); if (path === '/') return fs;
    const parts = path.split('/').filter(Boolean); let node = fs;
    for (const p of parts) { if (!node.children || !node.children[p]) return null; node = node.children[p]; }
    return node;
  }
  function getParent(path) {
    path = normalize(path); if (path === '/') return null;
    const parts = path.split('/').filter(Boolean); const name = parts.pop();
    const parentPath = '/' + parts.join('/');
    return { parent: getNode(parentPath || '/'), name, parentPath: parentPath || '/' };
  }
  function list(path) {
    const node = getNode(path || currentPath);
    if (!node) return { error: 'Nao encontrado: ' + path };
    if (node.type !== 'dir') return { error: 'Nao e diretorio' };
    return Object.values(node.children || {});
  }
  function mkdir(path) {
    path = resolvePath(path); if (getNode(path)) return { error: 'Ja existe' };
    const { parent, name } = getParent(path);
    if (!parent || parent.type !== 'dir') return { error: 'Caminho invalido' };
    parent.children[name] = { type: 'dir', name, permissions: 'drwxr-xr-x', owner: 'user', group: 'user', children: {} };
    save(); return { success: true, path };
  }
  function touch(path, content = '') {
    path = resolvePath(path); const existing = getNode(path);
    if (existing) { if (existing.type === 'file') { existing.content = content; existing.size = content.length; save(); return { success: true, path }; } return { error: 'E um diretorio' }; }
    const { parent, name } = getParent(path);
    if (!parent || parent.type !== 'dir') return { error: 'Caminho invalido' };
    parent.children[name] = { type: 'file', name, permissions: '-rw-r--r--', owner: 'user', group: 'user', content, size: content.length };
    save(); return { success: true, path };
  }
  function cat(path) {
    path = resolvePath(path); const node = getNode(path);
    if (!node) return { error: 'Nao encontrado' }; if (node.type !== 'file') return { error: 'E um diretorio' };
    return { content: node.content || '' };
  }
  function rm(path, recursive = false) {
    path = resolvePath(path);
    if (['/', '/home', '/etc'].includes(path)) return { error: 'Protegido' };
    const { parent, name } = getParent(path);
    if (!parent || !parent.children[name]) return { error: 'Nao encontrado' };
    const node = parent.children[name];
    if (node.type === 'dir' && Object.keys(node.children || {}).length && !recursive) return { error: 'Diretorio nao vazio. Use rm -r' };
    delete parent.children[name]; save(); return { success: true };
  }
  function cp(src, dest) {
    src = resolvePath(src); dest = resolvePath(dest);
    const srcNode = getNode(src); if (!srcNode) return { error: 'Origem nao encontrada' };
    const clone = JSON.parse(JSON.stringify(srcNode));
    const destNode = getNode(dest);
    if (destNode && destNode.type === 'dir') { destNode.children[srcNode.name] = clone; clone.name = srcNode.name; }
    else { const { parent, name } = getParent(dest); if (!parent) return { error: 'Destino invalido' }; clone.name = name; parent.children[name] = clone; }
    save(); return { success: true };
  }
  function mv(src, dest) { const r = cp(src, dest); if (r.error) return r; return rm(src, true); }
  function chmod(path, mode) {
    path = resolvePath(path); const node = getNode(path); if (!node) return { error: 'Nao encontrado' };
    if (/^[0-7]{3,4}$/.test(mode)) {
      const map = { '0':'---','1':'--x','2':'-w-','3':'-wx','4':'r--','5':'r-x','6':'rw-','7':'rwx' };
      const perms = mode.padStart(3,'0').slice(-3).split('').map(d => map[d]).join('');
      node.permissions = (node.type === 'dir' ? 'd' : '-') + perms;
    } else return { error: 'Modo invalido. Use 755' };
    save(); return { success: true, permissions: node.permissions };
  }
  function tree(path, prefix = '') {
    path = path || currentPath; const node = getNode(path); if (!node) return 'Nao encontrado';
    let result = prefix === '' ? path + '\n' : '';
    if (node.type === 'dir') {
      const children = Object.values(node.children || {});
      children.forEach((child, i) => {
        const isLast = i === children.length - 1;
        result += prefix + (isLast ? '└── ' : '├── ') + child.name + (child.type === 'dir' ? '/' : '') + '\n';
        if (child.type === 'dir') result += tree(normalize(path + '/' + child.name), prefix + (isLast ? '    ' : '│   '));
      });
    }
    return result;
  }
  function find(path, pattern) {
    path = path || currentPath; const results = [];
    function walk(node, current) {
      if (node.name && node.name.includes(pattern)) results.push(current);
      if (node.type === 'dir') for (const [name, child] of Object.entries(node.children || {})) walk(child, normalize(current + '/' + name));
    }
    const start = getNode(path); if (start) walk(start, path); return results;
  }
  function getDiskUsage() {
    function sizeOf(node) {
      if (node.type === 'file') return node.size || (node.content || '').length;
      let t = 0; for (const c of Object.values(node.children || {})) t += sizeOf(c); return t;
    }
    const used = sizeOf(fs); const total = 50 * 1024 * 1024;
    return { used, total, free: total - used, percent: Math.min(100, Math.round((used / total) * 100)) };
  }
  function getBackups() { try { return JSON.parse(localStorage.getItem(BACKUPS_KEY) || '[]'); } catch { return []; } }
  function saveBackup(e) { const l = getBackups(); l.unshift(e); localStorage.setItem(BACKUPS_KEY, JSON.stringify(l.slice(0, 20))); }
  function getImages() { try { return JSON.parse(localStorage.getItem(IMAGES_KEY) || '[]'); } catch { return []; } }
  function saveImage(e) { const l = getImages(); l.unshift(e); localStorage.setItem(IMAGES_KEY, JSON.stringify(l.slice(0, 15))); }
  function getVMs() { try { return JSON.parse(localStorage.getItem(VMS_KEY) || '[]'); } catch { return []; } }
  function saveVMs(l) { localStorage.setItem(VMS_KEY, JSON.stringify(l)); }
  function getInstalledApps() { try { return JSON.parse(localStorage.getItem(APPS_KEY) || '[]'); } catch { return []; } }
  function saveInstalledApps(l) { localStorage.setItem(APPS_KEY, JSON.stringify(l)); }

  load();
  return {
    get currentPath() { return currentPath; }, set currentPath(p) { currentPath = normalize(p); },
    resolvePath, getNode, list, mkdir, touch, cat, rm, cp, mv, chmod, tree, find, getDiskUsage,
    save, reset, getBackups, saveBackup, getImages, saveImage, getVMs, saveVMs, getInstalledApps, saveInstalledApps
  };
})();
