const Modules = (() => {
  function log(id, msg, type = 'info') {
    const el = document.getElementById(id); if (!el) return;
    const time = new Date().toLocaleTimeString('pt-BR');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = '<span class="log-time">[' + time + ']</span> <span class="log-' + (type === 'error' ? 'err' : type === 'success' ? 'ok' : type === 'warn' ? 'warn' : '') + '">' + msg + '</span>';
    el.prepend(entry);
  }

  function initBackup() {
    const restoreList = document.getElementById('restore-list');
    function refresh() {
      const backups = FileSystem.getBackups();
      restoreList.innerHTML = backups.length ? backups.map((b,i) => '<option value="'+i+'">'+b.name+' ('+b.type+')</option>').join('') : '<option value="">Nenhum</option>';
      const hist = document.getElementById('backup-history');
      hist.innerHTML = backups.length ? backups.map(b => '<div class="log-entry"><span class="log-time">'+b.date+'</span> '+b.name+' | '+b.type+' | '+b.compress+'</div>').join('') : '<div class="empty">Nenhum backup ainda.</div>';
    }
    document.getElementById('btn-create-backup').addEventListener('click', () => {
      const name = 'backup_' + new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
      const entry = { name, source: document.getElementById('backup-source').value, type: document.getElementById('backup-type').value, compress: document.getElementById('backup-compress').value, date: new Date().toLocaleString('pt-BR') };
      FileSystem.mkdir('/backup/' + name);
      FileSystem.touch('/backup/' + name + '/manifest.txt', JSON.stringify(entry, null, 2));
      FileSystem.saveBackup(entry);
      Game.track('backups');
      log('backup-history', 'Backup criado: ' + name, 'success');
      Terminal.print('[Backup] ' + name + ' criado!', 'success');
      refresh();
    });
    document.getElementById('btn-restore').addEventListener('click', () => {
      const idx = restoreList.value; if (idx === '') { log('backup-history', 'Selecione um backup', 'warn'); return; }
      const b = FileSystem.getBackups()[idx];
      const dest = document.getElementById('restore-dest').value || '/home/user/restore';
      FileSystem.mkdir(dest);
      FileSystem.touch(dest + '/restored.txt', 'Restaurado de: ' + b.name);
      Game.track('restores');
      log('backup-history', 'Restaurado ' + b.name + ' -> ' + dest, 'success');
      Terminal.print('[Restore] Concluido!', 'success');
    });
    refresh();
  }

  function initDisaster() {
    document.getElementById('btn-check-health').addEventListener('click', () => {
      ['svc-status','disk-status','fs-integrity','net-status'].forEach(id => {
        const ok = Math.random() > 0.2;
        const el = document.getElementById(id);
        el.textContent = ok ? 'OK' : 'PROBLEMA';
        el.className = 'status ' + (ok ? 'ok' : 'err');
      });
      Game.track('healthChecks');
      log('disaster-log', 'Diagnostico concluido', 'success');
      document.getElementById('incident-status').textContent = 'Diagnostico realizado. Verifique os status.';
    });
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const msgs = {
          'restart-services': 'Servicos reiniciados com sucesso',
          'clean-temp': 'Temporarios limpos. +1.2 GB liberados',
          'repair-boot': 'Bootloader reparado',
          'restore-last': 'Ponto de restauracao aplicado',
          'emergency': 'MODO EMERGENCIA ATIVADO'
        };
        const a = btn.dataset.action;
        Game.track('drActions');
        if (a === 'emergency') Game.track('emergencyUsed', true);
        log('disaster-log', msgs[a], a === 'emergency' ? 'warn' : 'success');
        Terminal.print('[DR] ' + msgs[a], a === 'emergency' ? 'info' : 'success');
        document.getElementById('incident-status').textContent = msgs[a];
      });
    });
  }

  function initImaging() {
    const imageList = document.getElementById('image-list');
    function refresh() {
      const images = FileSystem.getImages();
      imageList.innerHTML = images.length ? images.map((img,i) => '<option value="'+i+'">'+img.name+'</option>').join('') : '<option value="">Nenhuma</option>';
      document.getElementById('image-history').innerHTML = images.length ? images.map(img => '<div class="log-entry"><span class="log-time">'+img.date+'</span> '+img.name+' | '+img.compress+'</div>').join('') : '<div class="empty">Nenhuma imagem.</div>';
    }
    document.getElementById('btn-capture-image').addEventListener('click', () => {
      const name = (document.getElementById('image-name').value || 'Image') + '.wim';
      const entry = { name, source: document.getElementById('image-source').value, compress: document.getElementById('image-compress').value, date: new Date().toLocaleString('pt-BR') };
      FileSystem.touch('/images/' + name, 'WIM Image');
      FileSystem.saveImage(entry);
      Game.track('images');
      log('image-history', 'Imagem capturada: ' + name, 'success');
      Terminal.print('[Imaging] ' + name + ' capturada!', 'success');
      refresh();
    });
    document.getElementById('btn-apply-image').addEventListener('click', () => {
      const idx = imageList.value; if (idx === '') return;
      const img = FileSystem.getImages()[idx];
      Game.track('imagesApplied');
      log('image-history', 'Aplicada ' + img.name + ' em ' + document.getElementById('image-dest').value, 'success');
      Terminal.print('[Imaging] Imagem aplicada!', 'success');
    });
    refresh();
  }

  function initInstall() {
    const apps = [
      { id: 'chrome', name: 'Google Chrome', size: '85 MB' },
      { id: '7zip', name: '7-Zip', size: '1.5 MB' },
      { id: 'npp', name: 'Notepad++', size: '4 MB' },
      { id: 'git', name: 'Git', size: '50 MB' },
      { id: 'vscode', name: 'VS Code', size: '90 MB' },
      { id: 'vlc', name: 'VLC', size: '40 MB' },
      { id: 'python', name: 'Python 3.12', size: '25 MB' },
      { id: 'node', name: 'Node.js', size: '30 MB' }
    ];
    const avail = document.getElementById('available-apps');
    const inst = document.getElementById('installed-apps');
    function render() {
      const installed = FileSystem.getInstalledApps();
      const ids = installed.map(a => a.id);
      avail.innerHTML = apps.filter(a => !ids.includes(a.id)).map(a =>
        '<label class="app-item"><input type="checkbox" value="'+a.id+'"><span class="app-name">'+a.name+'</span><span class="app-size">'+a.size+'</span></label>'
      ).join('') || '<div class="empty">Tudo instalado!</div>';
      inst.innerHTML = installed.length ? installed.map(a =>
        '<label class="app-item"><input type="checkbox" value="'+a.id+'"><span class="app-name">'+a.name+'</span><span class="app-size">'+a.size+'</span></label>'
      ).join('') : '<div class="empty">Nenhum app</div>';
    }
    document.getElementById('btn-install-selected').addEventListener('click', () => {
      const checked = [...avail.querySelectorAll('input:checked')].map(i => i.value);
      if (!checked.length) return;
      const installed = FileSystem.getInstalledApps();
      checked.forEach(id => { const app = apps.find(a => a.id === id); if (app) installed.push(app); });
      FileSystem.saveInstalledApps(installed);
      Game.track('appsInstalled', checked.length);
      Terminal.print('[Install] ' + checked.length + ' app(s) instalado(s)', 'success');
      render();
    });
    document.getElementById('btn-uninstall-selected').addEventListener('click', () => {
      const checked = [...inst.querySelectorAll('input:checked')].map(i => i.value);
      if (!checked.length) return;
      FileSystem.saveInstalledApps(FileSystem.getInstalledApps().filter(a => !checked.includes(a.id)));
      Game.track('appsUninstalled', checked.length);
      Terminal.print('[Uninstall] Removidos', 'success');
      render();
    });
    render();
  }

  function initSecurity() {
    document.getElementById('btn-apply-policies').addEventListener('click', () => {
      Game.track('policiesApplied', true);
      log('security-log', 'Politicas aplicadas com sucesso', 'success');
      Terminal.print('[Security] Politicas aplicadas!', 'success');
    });
    document.getElementById('btn-set-acl').addEventListener('click', () => {
      const path = document.getElementById('acl-path').value;
      const perm = document.getElementById('acl-perm').value;
      const mode = perm === 'rwx' ? '755' : perm === 'r' ? '644' : perm === '---' ? '000' : '755';
      const res = FileSystem.chmod(path, mode);
      if (res.error) log('security-log', res.error, 'error');
      else { Game.track('aclUsed', true); log('security-log', 'ACL em ' + path + ': ' + perm, 'success'); Terminal.print('[ACL] Aplicada', 'success'); }
    });
  }

  function initFilesystem() {
    function updateDisk() {
      const du = FileSystem.getDiskUsage();
      document.getElementById('disk-usage').innerHTML =
        '<div class="disk-info"><span>/ root</span><span>'+du.percent+'% usado</span></div>' +
        '<div class="disk-bar"><div class="disk-fill" style="width:'+du.percent+'%"></div></div>' +
        '<div class="disk-info"><span>'+(du.used/1024).toFixed(0)+' KB usados</span><span>'+(du.free/1024).toFixed(0)+' KB livres</span></div>';
    }
    document.getElementById('btn-fs-scan').addEventListener('click', () => {
      log('fs-log', 'Scan em andamento...', 'info');
      setTimeout(() => { Game.track('fsScans'); log('fs-log', 'Scan OK — nenhum erro', 'success'); Terminal.print('[FS] Scan OK', 'success'); }, 700);
    });
    document.getElementById('btn-fs-repair').addEventListener('click', () => {
      log('fs-log', 'Reparando...', 'warn');
      setTimeout(() => { Game.track('fsRepairs'); log('fs-log', 'Reparo concluido', 'success'); Terminal.print('[FS] Reparado', 'success'); }, 1000);
    });
    document.getElementById('btn-sfc').addEventListener('click', () => {
      log('fs-log', 'SFC /scannow...', 'info');
      setTimeout(() => { Game.track('fsRepairs'); log('fs-log', 'SFC: nenhuma violacao', 'success'); Terminal.print('[FS] SFC OK', 'success'); }, 1200);
    });
    document.getElementById('btn-dism').addEventListener('click', () => {
      log('fs-log', 'DISM RestoreHealth...', 'info');
      setTimeout(() => { Game.track('fsRepairs'); log('fs-log', 'DISM: sucesso', 'success'); Terminal.print('[FS] DISM OK', 'success'); }, 1400);
    });
    updateDisk();
    setInterval(updateDisk, 5000);
  }

  function initVMs() {
    const listEl = document.getElementById('vm-list');
    function render() {
      const vms = FileSystem.getVMs();
      if (!vms.length) { listEl.innerHTML = '<p class="empty">Nenhuma VM ainda.</p>'; return; }
      listEl.innerHTML = vms.map((vm, i) =>
        '<div class="vm-card"><div class="vm-card-header"><strong>'+vm.name+'</strong><span class="vm-status '+vm.state+'">'+(vm.state==='running'?'Rodando':'Parada')+'</span></div>' +
        '<div class="vm-specs">'+vm.memory+' GB · '+vm.cpu+' vCPU · '+vm.disk+' GB · Gen '+vm.gen+'</div>' +
        '<div class="vm-actions">' +
        (vm.state==='stopped' ? '<button class="btn btn-success" data-a="start" data-i="'+i+'">Iniciar</button>' : '<button class="btn btn-outline" data-a="stop" data-i="'+i+'">Parar</button>') +
        '<button class="btn btn-danger" data-a="del" data-i="'+i+'">Excluir</button></div></div>'
      ).join('');
      listEl.querySelectorAll('[data-a]').forEach(btn => {
        btn.addEventListener('click', () => {
          const vms = FileSystem.getVMs(); const i = +btn.dataset.i; const a = btn.dataset.a;
          if (a === 'start') { vms[i].state = 'running'; Game.track('vmsStarted'); log('vm-log', vms[i].name + ' iniciada', 'success'); Terminal.print('[VM] Iniciada', 'success'); }
          else if (a === 'stop') { vms[i].state = 'stopped'; log('vm-log', vms[i].name + ' parada', 'warn'); }
          else { log('vm-log', vms[i].name + ' removida', 'error'); vms.splice(i, 1); }
          FileSystem.saveVMs(vms); render();
        });
      });
    }
    document.getElementById('btn-create-vm').addEventListener('click', () => {
      const name = document.getElementById('vm-name').value.trim() || 'VM';
      const vms = FileSystem.getVMs();
      if (vms.some(v => v.name === name)) { log('vm-log', 'Nome ja existe', 'error'); return; }
      const vm = {
        name, memory: +document.getElementById('vm-memory').value || 4,
        cpu: +document.getElementById('vm-cpu').value || 2,
        disk: +document.getElementById('vm-disk').value || 40,
        gen: document.getElementById('vm-gen').value,
        iso: document.getElementById('vm-iso').value, state: 'stopped'
      };
      vms.push(vm); FileSystem.saveVMs(vms);
      FileSystem.mkdir('/vms/' + name);
      Game.track('vmsCreated');
      log('vm-log', 'VM criada: ' + name, 'success');
      Terminal.print('[VM] ' + name + ' criada!', 'success');
      render();
    });
    render();
  }

  function initAll() {
    initBackup(); initDisaster(); initImaging(); initInstall();
    initSecurity(); initFilesystem(); initVMs();
  }
  return { initAll, log };
})();
