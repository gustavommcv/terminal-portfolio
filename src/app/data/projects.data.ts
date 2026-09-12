/**
 * GitHub-README-style tech/platform badge, rendered as a Shields.io
 * "flat-square" static badge (see ProjectBadges). `slug` is the Simple
 * Icons logo slug; `color`/`logoColor` are hex without a leading `#`.
 * `slug` is optional for a tool with no real Simple Icons entry - but
 * stack entries without one are dropped rather than shown as a bare
 * colored label (see projectsData below).
 */
export interface ProjectBadge {
  label: string;
  slug?: string;
  color: string;
  logoColor?: string;
  category?: 'language' | 'framework' | 'platform' | 'hosting' | 'database' | 'tool';
  description?: string;
}

export interface Project {
  id: string;
  image: string;
  gif?: string;
  links: {
    github?: string;
    demo?: string;
  };
  stack: string[];
  badges?: ProjectBadge[];
  featured?: boolean;
  command?: string;
}

// Shared badge definitions for technologies that repeat across projects,
// so each one is only sourced/verified once.
const angular: ProjectBadge = {
  label: 'Angular',
  slug: 'angular',
  color: 'DD0031',
  category: 'framework',
};
const go: ProjectBadge = {
  label: 'Go',
  slug: 'go',
  color: '00ADD8',
  category: 'language',
};
const lua: ProjectBadge = {
  label: 'Lua',
  slug: 'lua',
  color: '0051B3',
  category: 'language',
};
const typescript: ProjectBadge = {
  label: 'TypeScript',
  slug: 'typescript',
  color: '3178C6',
  category: 'language',
};
const scss: ProjectBadge = {
  label: 'SCSS',
  slug: 'sass',
  color: 'CC6699',
  category: 'language',
};
const react: ProjectBadge = {
  label: 'React',
  slug: 'react',
  color: '61DAFB',
  logoColor: 'black',
  category: 'framework',
};
const vite: ProjectBadge = {
  label: 'Vite',
  slug: 'vite',
  color: '646CFF',
  category: 'tool',
};
const express: ProjectBadge = {
  label: 'Express',
  slug: 'express',
  color: '000000',
  category: 'framework',
};
const mariadb: ProjectBadge = {
  label: 'MariaDB',
  slug: 'mariadb',
  color: '003545',
  category: 'database',
};
const nodejs: ProjectBadge = {
  label: 'Node.js',
  slug: 'nodedotjs',
  color: '339933',
  category: 'framework',
};

// Ordered by portfolio relevance (most compelling first), weighted toward
// projects that are both market-relevant and genuinely enjoyed building
// (gomodoro, minimal-neovim, dotfiles sit above some "safer" business
// challenges for that reason). Drives both the portfolio grid and (after
// filtering) the home page's featured carousel, so this order is the one
// visitors see.
export const projectsData: Project[] = [
  {
    id: 'maquetaria',
    image: 'images/projects/maquetaria/images/maquetaria2-thumbnail.webp',
    links: {
      demo: 'https://veronesemaquetes.com.br',
    },
    stack: ['Angular', 'Go', 'AWS Lambda'],
    badges: [
      angular,
      go,
      {
        label: 'AWS Lambda',
        slug: 'awslambda',
        color: 'FF9900',
        logoColor: 'black',
        category: 'hosting',
      },
      {
        label: 'Cloudflare',
        slug: 'cloudflare',
        color: 'F38020',
        category: 'hosting',
      },
    ],
    featured: true,
    command: 'glow maquetaria.md',
  },

  {
    id: 'terminal-portfolio',
    image: 'images/projects/terminalportfolio/terminal-portfolio.webp',
    links: {
      github: 'https://github.com/gustavommcv/terminal-portfolio',
    },
    stack: ['Angular', 'TypeScript', 'SCSS'],
    badges: [
      angular,
      typescript,
      scss,
      {
        label: 'Vercel',
        slug: 'vercel',
        color: '000000',
        category: 'hosting',
      },
    ],
    command: 'glow terminal-portfolio.md',
    featured: true,
  },

  {
    id: 'voting-system',
    image: 'images/projects/signotech/images/signo-tech-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/sistema-de-votacao-client',
    },
    stack: ['Angular', 'TypeScript', 'RxJS'],
    badges: [
      angular,
      typescript,
      { label: 'RxJS', slug: 'reactivex', color: 'B7178C', category: 'tool' },
    ],
    featured: true,
    command: 'glow voting.md',
  },

  {
    id: 'json-visual-editor',
    image:
      'images/projects/jsonvisualeditor/images/json-visual-editor-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/JSON-Visual-Editor',
      demo: 'https://gustavommcv.github.io/JSON-Visual-Editor/',
    },
    stack: ['Vue', 'TypeScript', 'Vite'],
    badges: [
      { label: 'Vue', slug: 'vuedotjs', color: '4FC08D', category: 'framework' },
      typescript,
      vite,
    ],
    featured: true,
    command: 'glow json-editor.md',
  },

  {
    id: 'mangabind',
    image: 'images/projects/mangabind/images/mangabind-thumbnail.svg',
    links: {
      github: 'https://github.com/gustavommcv/mangabind',
    },
    stack: ['Go'],
    badges: [go],
    featured: true,
    command: 'mangabind',
  },

  {
    id: 'rv-wheel',
    image: 'images/projects/rvwheel/images/rvwheel-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/RVWheel',
    },
    stack: ['C++', 'CMake'],
    badges: [
      { label: 'C++', slug: 'cplusplus', color: '00599C', category: 'language' },
      { label: 'CMake', slug: 'cmake', color: '064F8C', category: 'tool' },
    ],
    command: 'glow rvwheel.md',
  },

  {
    id: 'gomodoro',
    image: 'images/projects/gomodoro/images/gomodoro-thumbnail.webp',
    gif: 'images/projects/gomodoro/gifs/gomodoro.gif',
    links: {
      github: 'https://github.com/gustavommcv/gomodoro',
    },
    stack: ['Go', 'Lua'],
    badges: [go, lua],
    command: 'gomodoro',
  },

  {
    id: 'minimal-neovim',
    image: 'images/projects/minimalneovim/images/minimal-neovim-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/minimal-neovim',
    },
    stack: ['Lua', 'Neovim'],
    badges: [
      lua,
      { label: 'Neovim', slug: 'neovim', color: '57A143', category: 'tool' },
    ],
    command: 'glow neovim.md',
  },

  {
    id: 'dotfiles',
    image: 'images/projects/dotfiles/images/dotfiles-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/dotfiles',
    },
    stack: ['Hyprland'],
    badges: [
      { label: 'Hyprland', slug: 'hyprland', color: '00C853', category: 'tool' },
    ],
    command: 'glow dotfiles.md',
  },

  {
    id: 'itau-challenge',
    image: 'images/projects/itau/images/itau-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/Desafio-API-Itau',
    },
    stack: ['Java', 'Spring Boot'],
    badges: [
      { label: 'Java', slug: 'openjdk', color: '437291', category: 'language' },
      {
        label: 'Spring Boot',
        slug: 'springboot',
        color: '6DB33F',
        category: 'framework',
      },
    ],
    command: 'glow itau1.md',
  },

  {
    id: 'xp-bootcamp',
    image: 'images/projects/xpe1/images/xpe1-thumbnail.webp',
    links: {
      github:
        'https://github.com/gustavommcv/Desafio-Bootcamp-Arquitetura-de-Software',
    },
    stack: ['TypeScript', 'Express', 'MariaDB', 'Docker'],
    badges: [
      typescript,
      express,
      mariadb,
      { label: 'Docker', slug: 'docker', color: '2496ED', category: 'tool' },
    ],
    command: 'glow xp1.md',
  },

  {
    id: 'airlock-rest',
    image: 'images/projects/airlock/images/airlock-rest-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/AirlockRest',
    },
    stack: ['TypeScript', 'Express', 'MariaDB', 'JWT'],
    badges: [
      typescript,
      express,
      mariadb,
      { label: 'JWT', slug: 'jsonwebtokens', color: '000000', category: 'tool' },
    ],
    command: 'glow airlock.md',
  },

  {
    id: 'todo-list',
    image: 'images/projects/todo/images/todo-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/to-do-app-main',
    },
    stack: ['React', 'Node.js', 'JWT'],
    badges: [
      react,
      nodejs,
      { label: 'JWT', slug: 'jsonwebtokens', color: '000000', category: 'tool' },
    ],
    command: 'glow todo.md',
  },

  {
    id: 'books-app',
    image: 'images/projects/booksapp/images/books-app-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/BooksApp_frontend',
    },
    stack: ['React', 'SCSS', 'Vite'],
    badges: [react, scss, vite],
    command: 'glow booksapp.md',
  },

  {
    id: 'chmod-calculator',
    image: 'images/projects/chmod/images/chmod-calculator-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/chmod_calculator',
      demo: 'https://gustavommcv.github.io/chmod_calculator/',
    },
    stack: ['JavaScript', 'HTML', 'CSS'],
    badges: [
      {
        label: 'JavaScript',
        slug: 'javascript',
        color: 'F7DF1E',
        logoColor: 'black',
        category: 'language',
      },
      { label: 'HTML', slug: 'html5', color: 'E34F26', category: 'language' },
      { label: 'CSS', slug: 'css3', color: '1572B6', category: 'language' },
    ],
    command: 'glow chmod.md',
  },

  {
    id: 'tic-tac-toe',
    image: 'images/projects/tictactoe/images/tic-tac-toe-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/TicTacToe',
    },
    stack: ['.NET'],
    badges: [
      { label: '.NET', slug: 'dotnet', color: '512BD4', category: 'framework' },
    ],
    command: 'glow ttt.md',
  },

  {
    id: 'portfolio',
    image:
      'images/projects/firstportfolio/images/first-portfolio-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/portfolio',
      demo: 'https://gustavommcv.github.io/portfolio/#/',
    },
    stack: ['Solid.js', 'TypeScript', 'Vite'],
    badges: [
      { label: 'Solid.js', slug: 'solid', color: '2C4F7C', category: 'framework' },
      typescript,
      vite,
    ],
    command: 'glow portfolio.md',
  },
];
