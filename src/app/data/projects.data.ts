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
    image: 'images/projects/minimalneovim/images/minimal-neovim-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/minimal-neovim',
    },
    tags: ['Lua', 'Neovim', 'CLI'],
    featured: true,
  },
  {
    id: 'gomodoro',
    image: 'images/projects/gomodoro/images/gomodoro-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/gomodoro',
      internal: '/projects/gomodoro',
    },
    tags: ['Go', 'CLI', 'Productivity'],
    featured: true,
  },
  {
    id: 'voting-system',
    image: 'images/projects/signotech/images/signo-tech-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/sistema-de-votacao-client',
    },
    tags: ['Angular', 'Node.js', 'Fullstack'],
  },
  {
    id: 'chmod-calculator',
    image: 'images/projects/chmod/images/chmod-calculator-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/chmod_calculator',
      demo: 'https://gustavommcv.github.io/chmod_calculator/',
    },
    tags: ['JavaScript', 'HTML/CSS'],
  },
  {
    id: 'xp-bootcamp',
    image: 'images/projects/xpe1/images/xpe1-thumbnail.webp',
    links: {
      github:
        'https://github.com/gustavommcv/Desafio-Bootcamp-Arquitetura-de-Software',
    },
    tags: ['Java', 'Spring Boot', 'API'],
  },
  {
    id: 'itau-challenge',
    image: 'images/projects/itau/images/itau-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/Desafio-API-Itau',
    },
    tags: ['Node.js', 'Express', 'API'],
  },
  {
    id: 'books-app',
    image: 'images/projects/booksapp/images/books-app-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/BooksApp_frontend',
    },
    tags: ['React', 'Node.js', 'Fullstack'],
  },
  {
    id: 'airlock-rest',
    image: 'images/projects/airlock/images/airlock-rest-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/AirlockRest',
    },
    tags: ['Java', 'Clean Architecture', 'API'],
  },
  {
    id: 'portfolio',
    image:
      'images/projects/firstportfolio/images/first-portfolio-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/Portfolio',
    },
    tags: ['Solid.js', 'TypeScript'],
  },
  {
    id: 'tic-tac-toe',
    image: 'images/projects/tictactoe/images/tic-tac-toe-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/TicTacToe',
    },
    tags: ['C#', 'Algorithms'],
  },
  {
    id: 'todo-list',
    image: 'images/projects/todo/images/todo-thumbnail.webp',
    links: {
      github: 'https://github.com/gustavommcv/to-do-app-main',
    },
    tags: ['React', 'Node.js', 'Fullstack'],
  },
];
