const Terminal = (() => {
  const outputEl = () => document.getElementById('terminal-output');
  const inputEl = () => document.getElementById('terminal-input');
  const promptEl = () => document.getElementById('prompt');
  let history = []; let historyIndex = -1;

  function print(text, cls = 'output') {
    const line = document.createElement('div');
    line.className = 'line ' + cls;
    line.textContent = text;
    outputEl().appendChild(line);
    outputEl().scrollTop = outputEl().scrollHeight;
  }
  function clear() { outputEl().innerHTML = ''; }
  function updatePrompt() {
    const short = FileSystem.currentPath.replace(/^\/home\/user/, '~');
    promptEl().textContent = 'neo-corp@lab-os:' + short + '$';
  }

  function formatLS(entries, long) {
    if (!entries.length) return '';
    if (!long) return entries.map(e => e.type === 'dir' ? e.name + '/' : e.name).join('  ');
    return entries.map(e => {
      const size = e.type === 'file' ? String(e.size || 0).padStart(6) : '     -';
      return e.permissions + '  ' + (e.owner||'').padEnd(6) + ' ' + (e.group||'').padEnd(6) + ' ' + size + '  ' + e.name + (e.type === 'dir' ? '/' : '');
    }).join('\n');
  }

  function execute(raw) {
    const cmdLine = raw.trim();
    if (!cmdLine) return;
    history.push(cmdLine); historyIndex = history.length;
    const short = FileSystem.currentPath.replace(/^\/home\/user/, '~');
    print('neo-corp@lab-os:' + short + '$ ' + cmdLine, 'cmd');

    // Track for missions
    if (cmdLine.includes('|')) Game.track('usedPipe');
    if (cmdLine.includes('>') && !cmdLine.includes('>>')) Game.track('usedRedirect');
    if (cmdLine.includes('>>')) Game.track('usedRedirect');

    const parts = cmdLine.split('|').map(p => p.trim());
    let input = null; let result = '';
    for (let i = 0; i < parts.length; i++) {
      const out = runCommand(parts[i], input);
      if (out.error) { print(out.error, 'error'); return; }
      input = out.output || ''; result = input;
    }
    if (result) print(result, 'output');
  }

  function runCommand(cmdLine, pipeInput) {
    let redirect = null, append = false, cleanCmd = cmdLine;
    const redir = cmdLine.match(/^(.*?)\s*(>>?)\s*(.+)$/);
    if (redir) { cleanCmd = redir[1].trim(); append = redir[2] === '>>'; redirect = redir[3].trim(); }

    const tokens = tokenize(cleanCmd);
    if (!tokens.length) return { output: '' };
    let cmd = tokens[0].toLowerCase();
    let args = tokens.slice(1);

    const aliases = {
      'get-childitem':'ls','gci':'ls','dir':'ls','set-location':'cd','sl':'cd',
      'get-location':'pwd','gl':'pwd','new-item':'mkdir','get-content':'cat','gc':'cat',
      'write-output':'echo','write-host':'echo','remove-item':'rm','ri':'rm',
      'copy-item':'cp','move-item':'mv','select-string':'find','get-help':'help',
      'cls':'clear','clear-host':'clear'
    };
    if (aliases[cmd]) cmd = aliases[cmd];
    if (tokens[0].toLowerCase() === 'new-item') {
      const ti = args.findIndex(a => a.toLowerCase() === '-itemtype' || a.toLowerCase() === '-type');
      if (ti >= 0 && args[ti+1]) {
        const t = args[ti+1].toLowerCase();
        args = args.filter((_,i) => i !== ti && i !== ti+1);
        cmd = (t === 'directory' || t === 'dir') ? 'mkdir' : 'touch';
      } else cmd = 'touch';
    }

    let output = '';
    switch (cmd) {
      case 'ls': case 'll': {
        const long = cmd === 'll' || args.includes('-l') || args.includes('-la');
        const path = args.find(a => !a.startsWith('-')) || FileSystem.currentPath;
        const res = FileSystem.list(path);
        if (res.error) return { error: res.error };
        Game.track('usedLs');
        output = formatLS(res, long);
        break;
      }
      case 'cd': {
        const target = args[0] || '/home/user';
        const resolved = FileSystem.resolvePath(target);
        const node = FileSystem.getNode(resolved);
        if (!node) return { error: 'cd: nao existe' };
        if (node.type !== 'dir') return { error: 'cd: nao e diretorio' };
        FileSystem.currentPath = resolved; updatePrompt();
        Game.track('usedCd');
        break;
      }
      case 'pwd': output = FileSystem.currentPath; break;
      case 'mkdir': {
        if (!args[0]) return { error: 'mkdir: falta operando' };
        const res = FileSystem.mkdir(args[0]);
        if (res.error) return { error: res.error };
        Game.track('usedMkdir');
        output = 'Diretorio criado: ' + res.path;
        break;
      }
      case 'touch': {
        if (!args[0]) return { error: 'touch: falta operando' };
        const res = FileSystem.touch(args[0]);
        if (res.error) return { error: res.error };
        Game.track('usedTouch');
        output = 'Arquivo criado: ' + res.path;
        break;
      }
      case 'cat': {
        if (pipeInput !== null) output = pipeInput;
        else if (!args[0]) return { error: 'cat: falta operando' };
        else { const res = FileSystem.cat(args[0]); if (res.error) return { error: res.error }; output = res.content; Game.track('usedCat'); }
        break;
      }
      case 'echo': output = args.join(' ').replace(/^["']|["']$/g, ''); break;
      case 'rm': {
        const recursive = args.includes('-r') || args.includes('-rf');
        const targets = args.filter(a => !a.startsWith('-'));
        if (!targets.length) return { error: 'rm: falta operando' };
        for (const t of targets) { const res = FileSystem.rm(t, recursive); if (res.error) return { error: res.error }; }
        output = 'Removido';
        break;
      }
      case 'cp': {
        if (args.length < 2) return { error: 'cp: falta operando' };
        const res = FileSystem.cp(args[0], args[1]); if (res.error) return { error: res.error };
        output = 'Copiado'; break;
      }
      case 'mv': {
        if (args.length < 2) return { error: 'mv: falta operando' };
        const res = FileSystem.mv(args[0], args[1]); if (res.error) return { error: res.error };
        output = 'Movido'; break;
      }
      case 'chmod': {
        if (args.length < 2) return { error: 'chmod: falta operando' };
        const res = FileSystem.chmod(args[1], args[0]); if (res.error) return { error: res.error };
        Game.track('usedChmod');
        output = 'Permissoes: ' + res.permissions; break;
      }
      case 'find': case 'grep': {
        const pattern = args[0] || '';
        if (pipeInput !== null) {
          output = pipeInput.split('\n').filter(l => l.toLowerCase().includes(pattern.toLowerCase())).join('\n');
        } else {
          output = FileSystem.find(args[1] || FileSystem.currentPath, pattern).join('\n') || 'Nenhum resultado';
        }
        break;
      }
      case 'tree': output = FileSystem.tree(args[0]); break;
      case 'clear': clear(); return { output: '' };
      case 'whoami': output = 'user (NeoCorp SysAdmin)'; break;
      case 'history': output = history.map((h,i) => (i+1) + '  ' + h).join('\n'); break;
      case 'df': {
        const du = FileSystem.getDiskUsage();
        output = 'Filesystem     Size   Used  Avail Use%\n/dev/virtual   50M   ' + 
          (du.used/1024).toFixed(0) + 'K  ' + (du.free/1024).toFixed(0) + 'K  ' + du.percent + '%';
        break;
      }
      case 'help':
        Game.track('usedHelp');
        output = 'Comandos: ls, cd, pwd, mkdir, touch, cat, echo, rm, cp, mv, chmod, find, tree, clear, whoami, history, df, help\nAliases PS: Get-ChildItem, Set-Location, Get-Content, Remove-Item...\nPipes: cmd1 | cmd2\nRedirect: echo texto > arq.txt';
        break;
      default: return { error: 'Comando nao encontrado: ' + cmd + '. Digite help' };
    }
    if (redirect) {
      const existing = append ? (FileSystem.cat(redirect).content || '') : '';
      const res = FileSystem.touch(redirect, existing + output);
      if (res.error) return { error: res.error };
      return { output: '' };
    }
    return { output };
  }

  function tokenize(str) {
    const tokens = []; let current = ''; let inQuote = null;
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (inQuote) { if (c === inQuote) inQuote = null; else current += c; }
      else if (c === '"' || c === "'") inQuote = c;
      else if (c === ' ' || c === '\t') { if (current) { tokens.push(current); current = ''; } }
      else current += c;
    }
    if (current) tokens.push(current);
    return tokens;
  }

  function init() {
    updatePrompt();
    print('Lab OS Terminal v2.0 — Academia NeoCorp', 'info');
    print('Digite "help" para comecar. Complete as missoes!\n', 'success');
    const input = inputEl();
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { execute(input.value); input.value = ''; }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (historyIndex > 0) { historyIndex--; input.value = history[historyIndex]; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (historyIndex < history.length - 1) { historyIndex++; input.value = history[historyIndex]; } else { historyIndex = history.length; input.value = ''; } }
    });
    document.querySelectorAll('.qcmd').forEach(btn => {
      btn.addEventListener('click', () => { input.value = btn.dataset.cmd; input.focus(); execute(btn.dataset.cmd); input.value = ''; });
    });
  }
  return { init, print, clear, execute, updatePrompt };
})();
