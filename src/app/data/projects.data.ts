export interface Project {
  id: string;
  image: string;
  links: {
    github?: string;
    demo?: string;
    internal?: string;
  };
  tags?: string[];
  featured?: boolean;
}

export const projectsData: Project[] = [
  {
    id: 'minimal-neovim',
    image: 'images/projects/minimal-neovim.webp',
    links: {
      github: 'https://github.com/gustavommcv/minimal-neovim',
    },
    tags: ['Lua', 'Neovim', 'CLI'],
    featured: true,
  },

  {
    id: 'gomodoro',
    image: 'images/projects/gomodoro.webp',
    links: {
      github: 'https://github.com/gustavommcv/gomodoro',
      internal: '/projects/gomodoro',
    },
    tags: ['Go', 'CLI', 'Productivity'],
    featured: true,
  },

  {
    id: 'voting-system',
    image: 'images/projects/signo-tech.webp',
    links: {
      github: 'https://github.com/gustavommcv/sistema-de-votacao-client',
    },
    tags: ['Angular', 'Node.js', 'Fullstack'],
  },

  {
    id: 'chmod-calculator',
    image: 'images/projects/chmod-calculator.webp',
    links: {
      github: 'https://github.com/gustavommcv/chmod_calculator',
      demo: 'https://gustavommcv.github.io/chmod_calculator/',
    },
    tags: ['JavaScript', 'HTML/CSS'],
  },

  {
    id: 'xp-bootcamp',
    image: 'images/projects/desafio-bootcamp-1-xp.webp',
    links: {
      github:
        'https://github.com/gustavommcv/Desafio-Bootcamp-Arquitetura-de-Software',
    },
    tags: ['Java', 'Spring Boot', 'API'],
  },

  {
    id: 'itau-challenge',
    image: 'images/projects/itau.webp',
    links: {
      github: 'https://github.com/gustavommcv/Desafio-API-Itau',
    },
    tags: ['Node.js', 'Express', 'API'],
  },

  {
    id: 'books-app',
    image: 'images/projects/books-app.webp',
    links: {
      github: 'https://github.com/gustavommcv/BooksApp_frontend',
    },
    tags: ['React', 'Node.js', 'Fullstack'],
  },

  {
    id: 'airlock-rest',
    image: 'images/projects/airlock-rest.webp',
    links: {
      github: 'https://github.com/gustavommcv/AirlockRest',
    },
    tags: ['Java', 'Clean Architecture', 'API'],
  },

  {
    id: 'portfolio',
    image: 'images/projects/portfolio.webp',
    links: {
      github: 'https://github.com/gustavommcv/Portfolio',
    },
    tags: ['Solid.js', 'TypeScript'],
  },

  {
    id: 'tic-tac-toe',
    image: 'images/projects/tic-tac-toe.webp',
    links: {
      github: 'https://github.com/gustavommcv/TicTacToe',
    },
    tags: ['C#', 'Algorithms'],
  },

  {
    id: 'todo-list',
    image: 'images/projects/todo.webp',
    links: {
      github: 'https://github.com/gustavommcv/to-do-app-main',
    },
    tags: ['React', 'Node.js', 'Fullstack'],
  },
];
