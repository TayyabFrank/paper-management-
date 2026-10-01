/**
 * Storage Calculator Utility for DocuVault
 * Calculates and formats total storage used by uploaded documents.
 */

export interface SizableDocument {
  fileSize?: string;
  fileSizeBytes?: number;
}

/**
 * Parses a fileSize string or numeric fileSizeBytes into total bytes.
 * Handles patterns like "250 MB", "1.4 MB", "980 KB", "1.2 GB", "500 Bytes", etc.
 */
export function parseFileSizeToBytes(fileSize?: string, fileSizeBytes?: number): number {
  if (typeof fileSizeBytes === 'number' && !isNaN(fileSizeBytes) && fileSizeBytes > 0) {
    return fileSizeBytes;
  }

  if (!fileSize || typeof fileSize !== 'string') {
    return 0;
  }

  const clean = fileSize.trim();

  // Non-storage links without local/vault bytes
  if (/^(?:drive link|google drive|cloud stream|vault encrypted|live document)$/i.test(clean)) {
    return 0;
  }

  // Extract number and unit
  const match = clean.match(/([\d.]+)\s*(GB|MB|KB|Bytes|B)?/i);
  if (!match) {
    return 0;
  }

  const value = parseFloat(match[1]);
  if (isNaN(value) || value < 0) {
    return 0;
  }

  const unit = (match[2] || '').toUpperCase();
  if (unit === 'GB') {
    return value * 1024 * 1024 * 1024;
  } else if (unit === 'MB') {
    return value * 1024 * 1024;
  } else if (unit === 'KB') {
    return value * 1024;
  } else if (unit === 'BYTES' || unit === 'B') {
    return value;
  }

  // If no unit provided, assume MB if small or bytes if large
  return value > 100000 ? value : value * 1024 * 1024;
}

/**
 * Calculates total storage in bytes across an array of documents.
 */
export function calculateTotalStorageBytes(documents: SizableDocument[]): number {
  if (!Array.isArray(documents) || documents.length === 0) {
    return 0;
  }
  return documents.reduce((sum, doc) => sum + parseFileSizeToBytes(doc?.fileSize, doc?.fileSizeBytes), 0);
}

/**
 * Formats a total byte count into a clean human-readable string (e.g., "250 MB", "1.5 GB", "980 KB").
 * Strips trailing zeroes like ".0" for clean integer representation ("250 MB").
 */
export function formatStorageSize(totalBytes: number): string {
  if (!totalBytes || totalBytes <= 0) {
    return '0 MB';
  }

  const gb = totalBytes / (1024 * 1024 * 1024);
  if (gb >= 1) {
    const formatted = (Math.round(gb * 10) / 10).toFixed(1).replace(/\.0$/, '');
    return `${formatted} GB`;
  }

  const mb = totalBytes / (1024 * 1024);
  if (mb >= 0.1 || totalBytes >= 1024 * 1024) {
    const formatted = (Math.round(mb * 10) / 10).toFixed(1).replace(/\.0$/, '');
    return `${formatted} MB`;
  }

  const kb = totalBytes / 1024;
  if (kb >= 1) {
    const formatted = (Math.round(kb * 10) / 10).toFixed(1).replace(/\.0$/, '');
    return `${formatted} KB`;
  }

  return `${Math.round(totalBytes)} B`;
}

/**
 * Formats total storage into the requested standard display format: "**250 MB Used**"
 */
export function formatStorageUsed(documents: SizableDocument[]): string {
  const totalBytes = calculateTotalStorageBytes(documents);
  return `${formatStorageSize(totalBytes)} Used`;
}
