```markdown
# Lab OS — Academia de SysAdmins

![Lab OS](favicon.svg)

**Laboratório interativo de Administração de Sistemas Operacionais** feito apenas com **HTML, CSS e JavaScript**.

Aprenda na prática (e de forma divertida) os principais conceitos de administração de SO: terminal, backup, recuperação a desastres, imagens de sistema, instalação de apps/SO, segurança, filesystem e máquinas virtuais.

---

## Sobre o projeto

Você é o novo administrador de sistemas da **NeoCorp**. O datacenter está instável e o chefe quer resultados. Complete missões, ganhe XP, suba de nível, desbloqueie ranks e conquistas — e vire uma lenda da TI.

Ideal para:

- Aulas práticas de Sistemas Operacionais
- Laboratórios de redes / infraestrutura
- Treinamento introdutório de SysAdmin
- Portfólio de projetos educacionais front-end

---

## Funcionalidades

### Terminal interativo
- Comandos estilo Linux + aliases PowerShell
- Navegação, manipulação de arquivos, permissões (`chmod`)
- Pipes (`|`) e redirecionamento (`>`, `>>`)
- Sistema de arquivos virtual persistente (`localStorage`)

### Módulos práticos
| Módulo | O que você pratica |
|--------|--------------------|
| **Backup & Restore** | Full, Incremental, Diferencial + restauração |
| **Recuperação a Desastres** | Diagnóstico, reinício de serviços, modo emergência |
| **Imagem de Sistema** | Captura e aplicação de imagens (.wim) |
| **Apps & SO** | Instalação/desinstalação + técnicas de deploy de SO |
| **Segurança** | Políticas (SMBv1, Firewall, UAC, BitLocker…) + ACLs |
| **Sistema de Arquivos** | Scan, reparo, SFC, DISM |
| **Máquinas Virtuais** | Criar, iniciar e gerenciar VMs (estilo Hyper-V) |

### Gamificação
- **25 missões** progressivas
- Sistema de **XP e níveis**
- **Ranks**: Novato → Técnico → SysAdmin → Engenheiro → Arquiteto → Lenda
- **10 conquistas** desbloqueáveis
- Feedback visual (toasts, Level Up, barra de XP)

---

## Como usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU_USUARIO/lab-os.git
   cd lab-os
   ```

2. Abra o arquivo `index.html` no navegador  
   (Chrome, Edge ou Firefox — não precisa de servidor)

3. Ou use um servidor local simples:
   ```bash
   # Python
   python -m http.server 8080

   # Node (npx)
   npx serve .
   ```

Tudo funciona **offline**. O progresso (XP, missões, arquivos, VMs) é salvo no `localStorage` do navegador.

---

## Estrutura do projeto

```
lab-os/
├── index.html          # Página principal
├── favicon.svg         # Ícone do site
├── css/
│   └── style.css       # Estilos (tema cyberpunk)
└── js/
    ├── app.js          # Inicialização e navegação
    ├── game.js         # XP, missões, conquistas, ranks
    ├── filesystem.js   # Sistema de arquivos virtual
    ├── terminal.js     # Terminal interativo
    └── modules.js      # Lógica dos módulos visuais
```

---

## Tecnologias

- HTML5
- CSS3 (Flexbox, Grid, animações, gradientes)
- JavaScript (Vanilla ES6+)
- `localStorage` para persistência
- Sem frameworks, sem build, sem dependências

---

## Missões (resumo)

1. Primeiros Passos (help)
2. Explorador (ls + cd)
3. Criador de Arquivos (mkdir + touch)
4. Leitor de Logs (cat)
5. Mestre do Terminal (pipes / redirecionamento)
6. Guardião de Permissões (chmod)
7. Arquiteto de Pastas
8–10. Backup e Restore
11–13. Recuperação a Desastres
14. **Clone Warrior** (capturar e aplicar imagem)
15. Galeria de Imagens
16–17. Instalação / Desinstalação de apps
18–19. Políticas de Segurança e ACLs
20–21. Reparo de Filesystem
22–23. Máquinas Virtuais
24. Operador Completo (15 missões)
25. **Lenda da NeoCorp** (todas as missões)

---

## Objetivos educacionais

O projeto cobre tópicos típicos de disciplinas de **Sistemas Operacionais** e **Administração de Sistemas**:

- Ferramentas de backup e restore
- Recuperação a desastres
- Imagem de sistema
- Técnicas de instalação/desinstalação de SO e aplicativos
- Configuração de diretivas de segurança
- Correção de falhas no sistema de arquivos
- Laboratório em sistemas operacionais
- Criação e execução de máquinas virtuais
- Linha de comando (navegação, arquivos, pipes, redirecionamentos, filtros, permissões, comandos em lote)

---

## Personalização

- Missões e conquistas: `js/game.js`
- Comandos do terminal: `js/terminal.js`
- Sistema de arquivos inicial: `js/filesystem.js`
- Visual / tema: `css/style.css`

Para resetar todo o progresso do aluno, use o botão de reset na sidebar ou limpe o `localStorage` do site.

---

## Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais.

Sinta-se à vontade para:
- Usar em sala de aula
- Adaptar para sua grade curricular
- Contribuir com melhorias

---

## Autor

Desenvolvido como material de apoio para aulas da disciplina de Laboratório de Software, abordando os seguintes tópicos: Ferramentas de backup e restore para cópia de segurança, restauração de dados e configuração de sistema; Ferramentas de recuperação a desastres; Ferramentas de imagem de sistema; Técnicas de desinstalação e instalação de sistemas peracionais e aplicativos; Configuração das diretivas de segurança; Correção de falhas no sistema de arquivos. Laboratório em sistemas operacionais; Criação e execução de máquinas virtuais; Linha de comando; Navegação básica; Manipulação de arquivos; Pipes, redirecionamentos e filtros; Permissões; Execução de comandos em lote..

---

**Dica:** complete as missões em ordem e acompanhe seu rank na sidebar. Boa sorte, SysAdmin!
```
