/**
 * Sistema de Gamificação - XP, Níveis, Missões, Conquistas
 */
const Game = (() => {
  const STORAGE = 'labos_game_v2';

  const RANKS = [
    { level: 1, name: '🐣 Novato', avatar: '🧑‍💻' },
    { level: 3, name: '🛠️ Técnico Júnior', avatar: '👨‍🔧' },
    { level: 5, name: '💻 SysAdmin', avatar: '👨‍💻' },
    { level: 8, name: '⚡ Engenheiro de Sistemas', avatar: '🧙‍♂️' },
    { level: 12, name: '🏆 Arquiteto de Infra', avatar: '👑' },
    { level: 15, name: '🌟 Lenda da TI', avatar: '🚀' }
  ];

  const MISSIONS = [
    // --- Terminal básico ---
    { id: 'm1', title: 'Primeiros Passos', desc: 'Abra o Terminal e digite o comando help', xp: 30, module: 'terminal', check: (s) => s.usedHelp },
    { id: 'm2', title: 'Explorador', desc: 'Liste os arquivos com ls -l e navegue com cd', xp: 40, module: 'terminal', check: (s) => s.usedLs && s.usedCd },
    { id: 'm3', title: 'Criador de Arquivos', desc: 'Crie uma pasta e um arquivo com mkdir e touch', xp: 50, module: 'terminal', check: (s) => s.usedMkdir && s.usedTouch },
    { id: 'm4', title: 'Leitor de Logs', desc: 'Use cat para ler o arquivo readme.txt', xp: 35, module: 'terminal', check: (s) => s.usedCat },
    { id: 'm5', title: 'Mestre do Terminal', desc: 'Use pipe (|) ou redirecionamento (>)', xp: 45, module: 'terminal', check: (s) => s.usedPipe || s.usedRedirect },
    { id: 'm6', title: 'Guardião de Permissões', desc: 'Altere permissões de um arquivo ou pasta com chmod', xp: 50, module: 'terminal', check: (s) => s.usedChmod },
    { id: 'm7', title: 'Arquiteto de Pastas', desc: 'Crie a estrutura /home/user/projetos/lab1', xp: 55, module: 'terminal', check: (s) => s.usedMkdir },

    // --- Backup ---
    { id: 'm8', title: 'Backup Herói', desc: 'Faça seu primeiro backup', xp: 60, module: 'backup', check: (s) => s.backups >= 1 },
    { id: 'm9', title: 'Estratégia Triple', desc: 'Realize 3 backups (qualquer tipo)', xp: 70, module: 'backup', check: (s) => s.backups >= 3 },
    { id: 'm10', title: 'Salvamento Rápido', desc: 'Restaure um backup com sucesso', xp: 55, module: 'backup', check: (s) => s.restores >= 1 },

    // --- Disaster Recovery ---
    { id: 'm11', title: 'Caçador de Bugs', desc: 'Faça um diagnóstico completo do sistema', xp: 45, module: 'disaster', check: (s) => s.healthChecks >= 1 },
    { id: 'm12', title: 'Bombeiro Digital', desc: 'Use pelo menos 3 ações de recuperação', xp: 60, module: 'disaster', check: (s) => s.drActions >= 3 },
    { id: 'm13', title: 'Modo Pânico', desc: 'Ative o Modo de Emergência', xp: 40, module: 'disaster', check: (s) => s.emergencyUsed },

    // --- Imaging ---
    { id: 'm14', title: 'Clone Warrior', desc: 'Capture uma imagem de sistema (.wim) e aplique em um destino', xp: 80, module: 'imaging', check: (s) => s.images >= 1 && s.imagesApplied >= 1 },
    { id: 'm15', title: 'Galeria de Imagens', desc: 'Capture pelo menos 2 imagens de sistema', xp: 55, module: 'imaging', check: (s) => s.images >= 2 },

    // --- Install ---
    { id: 'm16', title: 'Instalador Pro', desc: 'Instale 3 aplicativos na loja', xp: 50, module: 'install', check: (s) => s.appsInstalled >= 3 },
    { id: 'm17', title: 'Limpeza de Apps', desc: 'Desinstale pelo menos 1 aplicativo', xp: 40, module: 'install', check: (s) => s.appsUninstalled >= 1 },

    // --- Security ---
    { id: 'm18', title: 'Guardião', desc: 'Aplique as políticas de segurança', xp: 55, module: 'security', check: (s) => s.policiesApplied },
    { id: 'm19', title: 'Mestre das ACLs', desc: 'Altere permissões pela interface de Segurança', xp: 45, module: 'security', check: (s) => s.aclUsed },

    // --- Filesystem ---
    { id: 'm20', title: 'Médico de Disco', desc: 'Execute SFC ou DISM com sucesso', xp: 50, module: 'filesystem', check: (s) => s.fsRepairs >= 1 },
    { id: 'm21', title: 'Checkup Completo', desc: 'Faça Scan + Reparo no sistema de arquivos', xp: 60, module: 'filesystem', check: (s) => s.fsScans >= 1 && s.fsRepairs >= 1 },

    // --- VMs ---
    { id: 'm22', title: 'Criador de Universos', desc: 'Crie e inicie uma Máquina Virtual', xp: 70, module: 'vms', check: (s) => s.vmsCreated >= 1 && s.vmsStarted >= 1 },
    { id: 'm23', title: 'Fazenda de VMs', desc: 'Crie pelo menos 2 Máquinas Virtuais', xp: 65, module: 'vms', check: (s) => s.vmsCreated >= 2 },

    // --- Finais ---
    { id: 'm24', title: 'Operador Completo', desc: 'Complete pelo menos 15 missões', xp: 100, module: 'missions', check: (s) => s.missionsDone >= 15 },
    { id: 'm25', title: 'Lenda da NeoCorp', desc: 'Complete todas as outras missões', xp: 200, module: 'missions', check: (s) => s.missionsDone >= 24 }
  ];

  const ACHIEVEMENTS = [
    { id: 'a1', icon: '⌨️', title: 'Hello World', desc: 'Usou o terminal pela primeira vez' },
    { id: 'a2', icon: '💾', title: 'Backup Addict', desc: 'Fez 5 backups' },
    { id: 'a3', icon: '🔥', title: 'Apaga-Incêndios', desc: 'Resolveu 5 incidentes' },
    { id: 'a4', icon: '🖼️', title: 'Colecionador', desc: 'Capturou 3 imagens' },
    { id: 'a5', icon: '📦', title: 'App Hoarder', desc: 'Instalou 5 apps' },
    { id: 'a6', icon: '🛡️', title: 'Fortaleza', desc: 'Ativou todas as políticas' },
    { id: 'a7', icon: '🖥️', title: 'Hypervisor', desc: 'Criou 3 VMs' },
    { id: 'a8', icon: '🌟', title: 'Completista', desc: 'Finalizou todas as missões' },
    { id: 'a9', icon: '🚀', title: 'Nível 10', desc: 'Alcançou o nível 10' },
    { id: 'a10', icon: '👑', title: 'Lenda', desc: 'Alcançou o rank máximo' }
  ];

  let state = {
    xp: 0,
    level: 1,
    stats: {
      usedHelp: false, usedLs: false, usedCd: false, usedMkdir: false, usedTouch: false,
      usedPipe: false, usedRedirect: false, usedChmod: false, usedCat: false,
      backups: 0, restores: 0, healthChecks: 0, drActions: 0, emergencyUsed: false,
      images: 0, imagesApplied: 0, appsInstalled: 0, appsUninstalled: 0,
      policiesApplied: false, aclUsed: false, fsRepairs: 0, fsScans: 0,
      vmsCreated: 0, vmsStarted: 0, missionsDone: 0
    },
    completedMissions: [],
    unlockedAchievements: []
  };

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) state = { ...state, ...JSON.parse(saved) };
    } catch {}
  }

  function save() {
    localStorage.setItem(STORAGE, JSON.stringify(state));
  }

  function xpForLevel(lvl) {
    return lvl * 100;
  }

  function getRank() {
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (state.level >= r.level) rank = r;
    }
    return rank;
  }

  function addXP(amount, reason) {
    state.xp += amount;
    const needed = xpForLevel(state.level);
    let leveled = false;

    while (state.xp >= needed) {
      state.xp -= needed;
      state.level++;
      leveled = true;
    }

    save();
    updateUI();

    // XP popup
    const popup = document.getElementById('xp-popup');
    document.getElementById('xp-amount').textContent = amount;
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 1000);

    toast(`+${amount} XP — ${reason}`, 'xp');

    if (leveled) {
      setTimeout(() => showLevelUp(), 600);
    }

    checkMissions();
    checkAchievements();
  }

  function showLevelUp() {
    const rank = getRank();
    document.getElementById('new-level').textContent = state.level;
    document.getElementById('new-rank-text').textContent = rank.name;
    document.getElementById('levelup-overlay').classList.remove('hidden');
  }

  function track(key, value = true) {
    if (typeof state.stats[key] === 'number') {
      state.stats[key] += (typeof value === 'number' ? value : 1);
    } else {
      state.stats[key] = value;
    }
    save();
    checkMissions();
    checkAchievements();
  }

  function checkMissions() {
    let newlyCompleted = 0;
    MISSIONS.forEach(m => {
      if (state.completedMissions.includes(m.id)) return;
      if (m.check(state.stats)) {
        state.completedMissions.push(m.id);
        state.stats.missionsDone = state.completedMissions.length;
        newlyCompleted++;
        addXP(m.xp, `Missão: ${m.title}`);
        toast(`🎯 Missão completa: ${m.title}`, 'success');
      }
    });
    if (newlyCompleted) {
      save();
      renderMissions();
      updateUI();
    }
  }

  function checkAchievements() {
    const checks = {
      a1: () => state.stats.usedHelp || state.stats.usedLs,
      a2: () => state.stats.backups >= 5,
      a3: () => state.stats.drActions >= 5,
      a4: () => state.stats.images >= 3,
      a5: () => state.stats.appsInstalled >= 5,
      a6: () => state.stats.policiesApplied,
      a7: () => state.stats.vmsCreated >= 3,
      a8: () => state.completedMissions.length >= 24,
      a9: () => state.level >= 10,
      a10: () => state.level >= 15
    };

    ACHIEVEMENTS.forEach(a => {
      if (state.unlockedAchievements.includes(a.id)) return;
      if (checks[a.id] && checks[a.id]()) {
        state.unlockedAchievements.push(a.id);
        toast(`🏆 Conquista: ${a.title}`, 'ach');
        addXP(25, `Conquista: ${a.title}`);
      }
    });
    save();
    renderAchievements();
    updateUI();
  }

  function updateUI() {
    const rank = getRank();
    document.getElementById('player-name').textContent = rank.name.replace(/^[^\s]+\s/, '');
    document.getElementById('player-avatar').textContent = rank.avatar;
    document.getElementById('player-level').textContent = state.level;
    document.getElementById('xp-current').textContent = state.xp;
    document.getElementById('xp-next').textContent = xpForLevel(state.level);
    document.getElementById('xp-fill').style.width = `${Math.min(100, (state.xp / xpForLevel(state.level)) * 100)}%`;
    document.getElementById('stat-missions').textContent = state.completedMissions.length;
    document.getElementById('stat-achievements').textContent = state.unlockedAchievements.length;
    const rankEl = document.getElementById('current-rank');
    if (rankEl) rankEl.textContent = rank.name;
  }

  function renderMissions() {
    const grid = document.getElementById('missions-grid');
    if (!grid) return;

    grid.innerHTML = MISSIONS.map((m, i) => {
      const done = state.completedMissions.includes(m.id);
      // Unlock logic: first 3 always open, then previous must be done
      const unlocked = i < 3 || state.completedMissions.includes(MISSIONS[i - 1].id) || done;
      const statusClass = done ? 'done' : unlocked ? 'todo' : 'lock';
      const statusText = done ? '✅ Completa' : unlocked ? '🎯 Disponível' : '🔒 Bloqueada';

      return `
        <div class="mission-card ${done ? 'completed' : ''} ${!unlocked ? 'locked' : ''}" data-mission="${m.id}" data-module="${m.module}">
          <div class="mission-header">
            <span class="mission-num">#${i + 1}</span>
            <span class="mission-xp">+${m.xp} XP</span>
          </div>
          <div class="mission-title">${m.title}</div>
          <div class="mission-desc">${m.desc}</div>
          <div class="mission-status ${statusClass}">${statusText}</div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.mission-card:not(.locked)').forEach(card => {
      card.addEventListener('click', () => {
        const mod = card.dataset.module;
        if (mod && mod !== 'missions') {
          document.querySelector(`.nav-btn[data-module="${mod}"]`)?.click();
        }
      });
    });
  }

  function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    grid.innerHTML = ACHIEVEMENTS.map(a => {
      const unlocked = state.unlockedAchievements.includes(a.id);
      return `
        <div class="ach-card ${unlocked ? 'unlocked' : 'locked'}">
          <div class="ach-icon">${a.icon}</div>
          <div class="ach-title">${a.title}</div>
          <div class="ach-desc">${a.desc}</div>
        </div>
      `;
    }).join('');
  }

  function toast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function reset() {
    localStorage.removeItem(STORAGE);
    state = {
      xp: 0, level: 1,
      stats: {
        usedHelp: false, usedLs: false, usedCd: false, usedMkdir: false, usedTouch: false,
        usedPipe: false, usedRedirect: false, usedChmod: false, usedCat: false,
        backups: 0, restores: 0, healthChecks: 0, drActions: 0, emergencyUsed: false,
        images: 0, imagesApplied: 0, appsInstalled: 0, appsUninstalled: 0,
        policiesApplied: false, aclUsed: false, fsRepairs: 0, fsScans: 0,
        vmsCreated: 0, vmsStarted: 0, missionsDone: 0
      },
      completedMissions: [],
      unlockedAchievements: []
    };
    save();
    updateUI();
    renderMissions();
    renderAchievements();
  }

  function init() {
    load();
    updateUI();
    renderMissions();
    renderAchievements();

    document.getElementById('btn-close-levelup')?.addEventListener('click', () => {
      document.getElementById('levelup-overlay').classList.add('hidden');
    });
  }

  return { init, addXP, track, toast, reset, checkMissions, state };
})();
