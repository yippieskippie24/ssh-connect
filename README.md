# SSH Connect

A modern, beautiful TUI SSH connection manager — the spiritual successor to [`ssh_connect.sh`](https://github.com/yippieskippie24/SSH_connect).

Built with [Ink](https://github.com/vadimdemedes/ink) (React for terminals), Commander, and Chalk.

```
╭────────────────────────────────────────────────────╮
│ SSH Connect  v1.0.0  —  Modern SSH connection manager│
╰────────────────────────────────────────────────────╯

─────────────── SERVERS ───────────────

▶ ● prod-web1              192.168.1.10        Production Web 1
  ● staging                10.0.0.5            Staging Server
  ○ dev-box                dev.example.com

  + Add Server

 ↑↓  Navigate   Enter  Detail   C  Connect   A  Add   K  Keys   L  Logs   Q  Quit
```

---

## Features

- **Interactive TUI** — Arrow key navigation, live health status badges
- **Quick connect** — `ssh-connect <alias>` bypasses the TUI entirely for speed
- **Server management** — Add, edit, remove servers with a guided form
- **Health checks** — Non-blocking TCP ping on startup with live badge updates
- **SSH key management** — List, generate, and copy keys to servers
- **Connection logging** — Timestamped history of every connection attempt
- **Styled CLI commands** — `list`, `logs`, `check` with formatted table output
- **Post-session loop** — Returns to the TUI menu after an SSH session ends

---

## Installation

```bash
npm install -g ssh-connect
```

Or clone and link locally:

```bash
git clone https://github.com/yippieskippie24/ssh-connect.git
cd ssh-connect
npm install
npm link
```

**Requirements:** Node.js ≥ 18

---

## Usage

### Launch the interactive TUI

```bash
ssh-connect
```

### Quick-connect to a server by alias

```bash
ssh-connect prod-web1
```

### All CLI commands

| Command | Description |
|---|---|
| `ssh-connect` | Launch interactive TUI |
| `ssh-connect <alias>` | Quick-connect by alias |
| `ssh-connect add` | Add a new server (TUI form) |
| `ssh-connect list` | List all servers (table) |
| `ssh-connect remove <alias>` | Remove a server |
| `ssh-connect edit <alias>` | Edit a server (TUI form) |
| `ssh-connect keys` | SSH key manager (TUI) |
| `ssh-connect logs` | Show connection history |
| `ssh-connect check [alias]` | Health check one or all servers |
| `ssh-connect config` | Show config/log file paths |

---

## TUI Keybindings

### Main Menu
| Key | Action |
|---|---|
| `↑` / `↓` | Navigate server list |
| `Enter` | Open server detail |
| `C` | Connect to selected server |
| `A` | Add new server |
| `K` | Open key manager |
| `L` | View connection logs |
| `Q` | Quit |

### Server Detail
| Key | Action |
|---|---|
| `C` | Connect |
| `E` | Edit server |
| `H` | Run health check |
| `D` | Delete server |
| `Esc` / `B` | Back to main menu |

### Add / Edit Form
| Key | Action |
|---|---|
| `Enter` | Next field (save on last) |
| `Tab` | Next field |
| `↑` / `↓` | Move between fields |
| `Esc` | Cancel |

---

## Configuration

Config is stored at `~/.ssh-connect/config.json`:

```json
{
  "servers": [
    {
      "alias": "prod-web1",
      "host": "192.168.1.10",
      "port": 22,
      "username": "deploy",
      "description": "Production Web Server 1",
      "identityFile": "~/.ssh/id_rsa"
    }
  ],
  "defaults": {
    "port": 22,
    "username": "youruser"
  },
  "settings": {
    "healthCheckOnStart": true,
    "logConnections": true
  }
}
```

Connection logs are stored at `~/.ssh-connect/logs.json`.

---

## Design Decisions

- **Ink over blessed** — Modern React component model, composable, easy to maintain
- **Commander for routing** — Separates TUI from fast CLI commands cleanly
- **`child_process.spawn` for SSH** — Native PTY inheritance; no intermediary SSH library
- **TCP health checks** — Lightweight; no auth required, just verifies the port is open
- **Direct SSH only** — No bastion/jump host; simple and fast
- **Post-session loop** — The TUI relaunches after each SSH session so you stay in the tool

---

## Original Script

This tool is a ground-up rewrite of [`ssh_connect.sh`](https://github.com/yippieskippie24/SSH_connect), a Bash/whiptail SSH manager written years ago. The core idea is the same — a quick interactive menu for SSH connections — but now with:

- Persistent JSON config (no hardcoded servers)
- Real-time health badges
- SSH key management
- Connection logging
- A proper CLI interface

---

## Author

**Tyler M Johnson** — [@yippieskippie24](https://github.com/yippieskippie24)
