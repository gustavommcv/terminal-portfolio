import type { SupportedLanguage } from '../../core/i18n/language.service';

export interface HomeIntroPresentationContent {
  readonly role: string;
  readonly about: string;
  readonly contact: string;
}

export interface HomeIntroLayoutReservation {
  readonly title: string;
  readonly command: string;
  readonly presentation: HomeIntroPresentationContent;
}

/**
 * Build-time copies of the completed intro content provide a safe footprint
 * before the asynchronous translation catalog resolves. Keep these values in
 * sync with public/i18n/{en,pt}.json; home-intro-layout-reservations.spec.ts
 * fails when they drift.
 */
export const HOME_INTRO_LAYOUT_RESERVATIONS: Readonly<
  Record<SupportedLanguage, HomeIntroLayoutReservation>
> = {
  en: {
    title: 'Who am I',
    command: 'whoami',
    presentation: {
      role: 'Software Developer',
      about:
        "Software developer with freelance experience delivering web applications to production and maintaining open-source projects. I work with Angular, Go, React, and TypeScript, with an interest in software engineering, automation, testing, and AI-assisted development.",
      contact: 'Contact',
    },
  },
  pt: {
    title: 'Quem sou eu',
    command: 'whoami',
    presentation: {
      role: 'Desenvolvedor de Software',
      about:
        "Desenvolvedor de software com experiência freelancer na entrega de aplicações web em produção e na manutenção de projetos open source. Trabalho com Angular, Go, React e TypeScript, com interesse em engenharia de software, automação, testes e IA aplicada ao desenvolvimento.",
      contact: 'Contato',
    },
  },
};
