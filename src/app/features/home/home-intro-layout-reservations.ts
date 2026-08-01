import type { SupportedLanguage } from '../../services/language.service';

export interface HomeIntroPresentationContent {
  readonly role: string;
  readonly about: string;
  readonly contact: string;
}

export interface HomeIntroLayoutReservation {
  readonly command: string;
  readonly presentation: HomeIntroPresentationContent;
}

/**
 * Build-time copies of the completed intro content provide a safe footprint
 * before the asynchronous translation catalog resolves. Keep these values in
 * sync with public/i18n/{en,pt}.json; focused tests guard that contract.
 */
export const HOME_INTRO_LAYOUT_RESERVATIONS: Readonly<
  Record<SupportedLanguage, HomeIntroLayoutReservation>
> = {
  en: {
    command: 'whoami',
    presentation: {
      role: 'Software Developer',
      about:
        'Full Stack Developer specialized in building modern and scalable web applications. Focused on quality delivery and clean code.',
      contact: 'Contact',
    },
  },
  pt: {
    command: 'whoami',
    presentation: {
      role: 'Desenvolvedor de Software',
      about:
        'Desenvolvedor Full Stack especializado em criar aplicações web modernas e escaláveis. Foco em entregas de qualidade e código limpo.',
      contact: 'Contato',
    },
  },
};
