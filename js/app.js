document.addEventListener('DOMContentLoaded', () => {
  const titles = {
    missions: '🚀 Central de Missões',
    terminal: '⌨️ Terminal Interativo',
    backup: '💾 Backup & Restore',
    disaster: '🔥 Recuperação a Desastres',
    imaging: '📸 Imagem de Sistema',
    install: '📦 Apps & Instalação de SO',
    security: '🛡️ Diretivas de Segurança',
    filesystem: '🩺 Sistema de Arquivos',
    vms: '🖥️ Máquinas Virtuais',
    achievements: '🏆 Hall da Fama'
  };

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mod = btn.dataset.module;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
      document.getElementById('module-' + mod).classList.add('active');
      document.getElementById('module-title').textContent = titles[mod] || mod;
      if (mod === 'terminal') setTimeout(() => document.getElementById('terminal-input').focus(), 80);
    });
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Resetar TODO o progresso (XP, missões, arquivos)?')) {
      FileSystem.reset();
      Game.reset();
      location.reload();
    }
  });

  Game.init();
  Terminal.init();
  Modules.initAll();
  console.log('%cLab OS Academia carregado!', 'color:#00d4ff;font-weight:bold;font-size:14px');
});
