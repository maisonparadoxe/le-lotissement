// Résolution des fichiers statiques : indépendante du système (Windows, macOS, Linux).
// L'adresse web utilise toujours « / » ; seul le chemin sur le disque dépend du système.

import path from 'node:path';

/**
 * Renvoie le chemin du fichier demandé dans `dist`, ou null s'il sort du
 * dossier ou est mal formé. « / » correspond à index.html.
 */
export function resolveStaticPath(dist: string, rawPathname: string, p: path.PlatformPath = path): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(rawPathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0') || decoded.includes('\\')) return null;
  const clean = p.posix.normalize(decoded);
  const rel = clean === '/' ? 'index.html' : clean.replace(/^\/+/, '');
  const parts = rel.split('/');
  if (parts.includes('..')) return null;
  const root = p.resolve(dist);
  const file = p.resolve(root, ...parts);
  return file === root || file.startsWith(root + p.sep) ? file : null;
}

/** Les fichiers de /assets/ ont un nom contenant leur empreinte : cache longue durée. */
export function isHashedAsset(rawPathname: string): boolean {
  return rawPathname.startsWith('/assets/');
}
