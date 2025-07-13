// utils/sanitize.js

// Remove caracteres inválidos para nomes de abas de Excel
export const sanitizeSheetName = (name) => {
  if (!name) return 'Sheet';
  return name
    .toString()
    .replace(/[\\/*?:[\]]/g, '-')         // substitui caracteres inválidos
    .substring(0, 31)                     // Excel só permite 31 caracteres em nomes de abas
    .trim();
};

// Remove caracteres problemáticos para nomes de arquivos
export const sanitizeFileName = (name) => {
  if (!name) return 'arquivo';
  return name
    .toString()
    .replace(/[^a-zA-Z0-9-_]/g, '_')      // substitui tudo que não for alfanumérico, hífen ou underscore
    .replace(/_+/g, '_')                  // reduz múltiplos underscores seguidos
    .replace(/^_+|_+$/g, '')              // remove underscores no início/fim
    .substring(0, 100);                   // limite de tamanho para evitar erros no filesystem
};
