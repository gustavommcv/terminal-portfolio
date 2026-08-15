export interface Project {
  id: string;
  image: string;
  gif?: string;
  links: {
    github?: string;
    demo?: string;
  };
  stack: string[];
  featured?: boolean;
  command?: string;
}

export const projectsData: Project[] = [
  {
    id: 'maquetaria',
    image: 'images/projects/maquetaria/images/maquetaria2-thumbnail.webp',
    links: {
      demo: 'https://veronesemaquetes.com.br',
    },
    stack: ['Angular', 'Go', 'AWS Lambda'],
    featured: true,
    command: 'glow maquetaria.md',
  },

  {
    id: 'minimal-neovim',
    image: 'images/projects/minimalneovim/images/minimal-neovim-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/minimal-neovim',
    },
    stack: ['Lua', 'Neovim', 'lazy.nvim'],
    featured: true,
    command: 'glow neovim.md',
  },

  {
    id: 'gomodoro',
    image: 'images/projects/gomodoro/images/gomodoro-thumbnail.webp',
    gif: 'images/projects/gomodoro/gifs/gomodoro.gif',
    links: {
      github: 'https://github.com/gustavommcv/gomodoro',
    },
    stack: ['Go', 'Lua'],
    featured: true,
    command: 'gomodoro',
  },

  {
    id: 'chmod-calculator',
    image: 'images/projects/chmod/images/chmod-calculator-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/chmod_calculator',
      demo: 'https://gustavommcv.github.io/chmod_calculator/',
    },
    stack: ['JavaScript', 'HTML', 'CSS'],
    featured: true,
    command: 'glow chmod.md',
  },

  {
    id: 'terminal-portfolio',
    image: 'images/projects/terminalportfolio/terminal-portfolio.webp',
    links: {
      github: 'https://github.com/gustavommcv/terminal-portfolio',
    },
    stack: ['Angular', 'TypeScript', 'SCSS'],
    command: 'glow terminal-portfolio.md',
    featured: true,
  },

  {
    id: 'voting-system',
    image: 'images/projects/signotech/images/signo-tech-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/sistema-de-votacao-client',
    },
    stack: ['Angular', 'TypeScript', 'RxJS', 'WebSockets'],
    command: 'glow voting.md',
  },

  {
    id: 'xp-bootcamp',
    image: 'images/projects/xpe1/images/xpe1-thumbnail.webp',
    links: {
      github:
        'https://github.com/gustavommcv/Desafio-Bootcamp-Arquitetura-de-Software',
    },
    stack: ['TypeScript', 'Express', 'MariaDB', 'Docker'],
    command: 'glow xp1.md',
  },

  {
    id: 'itau-challenge',
    image: 'images/projects/itau/images/itau-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/Desafio-API-Itau',
    },
    stack: ['Java', 'Spring Boot'],
    command: 'glow itau1.md',
  },
  {
    id: 'books-app',
    image: 'images/projects/booksapp/images/books-app-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/BooksApp_frontend',
    },
    stack: ['React', 'SCSS', 'Vite'],
    command: 'glow booksapp.md',
  },

  {
    id: 'airlock-rest',
    image: 'images/projects/airlock/images/airlock-rest-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/AirlockRest',
    },
    stack: ['TypeScript', 'Express', 'MariaDB', 'JWT'],
    command: 'glow airlock.md',
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
    command: 'glow portfolio.md',
  },

  {
    id: 'tic-tac-toe',
    image: 'images/projects/tictactoe/images/tic-tac-toe-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/TicTacToe',
    },
    stack: ['C#', '.NET'],
    command: 'glow ttt.md',
  },

  {
    id: 'todo-list',
    image: 'images/projects/todo/images/todo-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/to-do-app-main',
    },
    stack: ['React', 'Node.js', 'JWT'],
    command: 'glow todo.md',
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
    command: 'glow json-editor.md',
  },

  {
    id: 'rv-wheel',
    image: 'images/projects/rvwheel/images/rvwheel-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/RVWheel',
    },
    stack: ['C++', 'CMake', 'DirectInput'],
    command: 'glow rvwheel.md',
  },

  {
    id: 'dotfiles',
    image: 'images/projects/dotfiles/images/dotfiles-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/dotfiles',
    },
    stack: ['Hyprland', 'Waybar', 'Zsh'],
    command: 'glow dotfiles.md',
  },
];
