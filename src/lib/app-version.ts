export const APP_VERSION = "1.0.0";
export const APP_CODENAME = "Supreme";
export const FOUNDATIONAL_DECLARATION = "Deus em primeiro lugar, Sempre.";

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  changes: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2026-08-05",
    title: "Supreme — Backup e Instalação",
    changes: [
      "Tela de Atualizações com versão e changelog do sistema.",
      "Backup completo: exportar e importar todos os dados em .json.",
      "Snapshot do backup sincronizado na nuvem e no armazenamento local.",
      "App instalável (PWA): ícones, manifesto, splash e suporte offline.",
    ],
  },
  {
    version: "0.9.0",
    date: "2026-07-20",
    title: "Núcleo Trinarius",
    changes: [
      "Sistema Trinarius com Batman, Reacher e Red Reddington.",
      "Oficina do Eu (JARVIS Mestre de Obras) com voz e termômetro emocional.",
      "Corpo de Ferro: check-in físico com presets semanais.",
    ],
  },
];
