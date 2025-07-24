export interface Project {
  id: string;
  image: string;
  gif?: string;
  links: {
    github?: string;
    demo?: string;
  };
  tags?: string[];
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
    tags: ['Angular', 'GOlang', 'AWS Lambda'],
    featured: true,
    command: 'glow maquetaria.md',
  },

  {
    id: 'minimal-neovim',
    image: 'images/projects/minimalneovim/images/minimal-neovim-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/minimal-neovim',
    },
    tags: ['Lua', 'Neovim', 'CLI'],
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
    tags: ['Go', 'CLI', 'Productivity'],
    featured: true,
    command: 'gomodoro',
  },

  {
    id: 'voting-system',
    image: 'images/projects/signotech/images/signo-tech-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/sistema-de-votacao-client',
    },
    tags: ['Angular', 'Node.js', 'Fullstack'],
    command: 'glow voting.md',
  },

  {
    id: 'chmod-calculator',
    image: 'images/projects/chmod/images/chmod-calculator-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/chmod_calculator',
      demo: 'https://gustavommcv.github.io/chmod_calculator/',
    },
    tags: ['JavaScript', 'HTML/CSS'],
    featured: true,
    command: 'glow chmod.md',
  },

  {
    id: 'xp-bootcamp',
    image: 'images/projects/xpe1/images/xpe1-thumbnail.webp',
    links: {
      github:
        'https://github.com/gustavommcv/Desafio-Bootcamp-Arquitetura-de-Software',
    },
    tags: ['Java', 'Spring Boot', 'API'],
    command: 'glow xp1.md',
  },

  {
    id: 'itau-challenge',
    image: 'images/projects/itau/images/itau-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/Desafio-API-Itau',
    },
    tags: ['Node.js', 'Express', 'API'],
    command: 'glow itau1.md',
  },
  {
    id: 'books-app',
    image: 'images/projects/booksapp/images/books-app-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/BooksApp_frontend',
    },
    tags: ['React', 'Node.js', 'Fullstack'],
    command: 'glow booksapp.md',
  },

  {
    id: 'airlock-rest',
    image: 'images/projects/airlock/images/airlock-rest-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/AirlockRest',
    },
    tags: ['Java', 'Clean Architecture', 'API'],
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
    tags: ['Solid.js', 'TypeScript'],
    command: 'glow portfolio.md',
  },

  {
    id: 'tic-tac-toe',
    image: 'images/projects/tictactoe/images/tic-tac-toe-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/TicTacToe',
    },
    tags: ['C#', 'Algorithms'],
    command: 'glow ttt.md',
  },

  {
    id: 'todo-list',
    image: 'images/projects/todo/images/todo-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/to-do-app-main',
    },
    tags: ['React', 'Node.js', 'Fullstack'],
    command: 'glow todo.md',
  },
];
