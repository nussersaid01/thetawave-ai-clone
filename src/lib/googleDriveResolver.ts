import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface GoogleDriveItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  filePath?: string;
}

export interface GoogleDriveResolveResult {
  success: boolean;
  fileId: string;
  cloudUrl: string;
  fileName?: string;
  filePath?: string;
  fileBuffer?: Buffer;
  isFolder?: boolean;
  folderChildren?: GoogleDriveItem[];
  error?: string;
}

/**
 * Extracts Google Drive ID from a URL or raw ID string.
 */
export function extractGoogleDriveId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // Pattern 1: /file/d/<ID>
  const matchFile = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,50})/i);
  if (matchFile) return matchFile[1];

  // Pattern 2: ?id=<ID> or &id=<ID> (e.g. open?id=...)
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,50})/i);
  if (matchId) return matchId[1];

  // Pattern 3: /folders/<ID>
  const matchFolder = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{20,50})/i);
  if (matchFolder) return matchFolder[1];

  // Pattern 4: /document/d/<ID> or /presentation/d/<ID> or /spreadsheets/d/<ID>
  const matchDoc = trimmed.match(/\/(?:document|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]{20,50})/i);
  if (matchDoc) return matchDoc[1];

  // Pattern 5: Raw ID string (alphanumeric, dashes, underscores, length 25-50)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Dynamically locates the active Google Drive Desktop mount point.
 * Scans available drive letters and user profile paths to avoid hardcoded paths.
 */
export function findGoogleDriveMount(): string | null {
  const possibleDriveLetters = ['G', 'D', 'E', 'F', 'H', 'I', 'J', 'K', 'C'];
  
  for (const letter of possibleDriveLetters) {
    const candidate = `${letter}:\\My Drive`;
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Check user profile folder if mounted as directory
  if (process.env.USERPROFILE) {
    const userProfileDrive = path.join(process.env.USERPROFILE, 'Google Drive', 'My Drive');
    if (fs.existsSync(userProfileDrive)) {
      return userProfileDrive;
    }
    const directProfileDrive = path.join(process.env.USERPROFILE, 'Google Drive');
    if (fs.existsSync(directProfileDrive)) {
      return directProfileDrive;
    }
  }

  return null;
}

/**
 * Searches DriveFS local metadata database for the file/folder ID.
 */
export function resolveViaDriveFsDb(fileId: string): {
  isFolder: boolean;
  localTitle?: string;
  fileSize?: number;
  mimeType?: string;
  folderChildren?: GoogleDriveItem[];
} | null {
  try {
    const scriptPath = path.join(__dirname, 'gdrive_db_query.py');
    const fallbackPath = path.join(process.cwd(), 'src', 'lib', 'gdrive_db_query.py');
    const finalScriptPath = fs.existsSync(scriptPath) ? scriptPath : fallbackPath;

    if (!fs.existsSync(finalScriptPath)) return null;

    const stdout = execSync(`python "${finalScriptPath}" "${fileId}"`, {
      encoding: 'utf-8',
      timeout: 4000
    });

    const parsed = JSON.parse(stdout.trim());
    if (parsed.found) {
      return {
        isFolder: parsed.is_folder,
        localTitle: parsed.local_title,
        fileSize: parsed.file_size,
        mimeType: parsed.mime_type,
        folderChildren: parsed.folderChildren
      };
    }
  } catch (err) {
    console.warn('DriveFS DB lookup error (falling back to file search):', err);
  }
  return null;
}

/**
 * Recursively searches a directory for a specific filename (up to maxDepth).
 */
function findFileInDir(dir: string, targetName: string, maxDepth = 4, currentDepth = 0): string | null {
  if (currentDepth > maxDepth) return null;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile()) {
        if (entry.name.toLowerCase() === targetName.toLowerCase()) {
          return fullPath;
        }
      } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const found = findFileInDir(fullPath, targetName, maxDepth, currentDepth + 1);
        if (found) return found;
      }
    }
  } catch {
    // Ignore access permission errors
  }
  return null;
}

/**
 * Main Google Drive Resolver function.
 */
export async function resolveGoogleDriveSource(input: string): Promise<GoogleDriveResolveResult> {
  const fileId = extractGoogleDriveId(input);
  if (!fileId) {
    return {
      success: false,
      fileId: '',
      cloudUrl: input,
      error: 'Invalid Google Drive link or File ID'
    };
  }

  const cloudUrl = `https://drive.google.com/file/d/${fileId}/view`;
  const mount = findGoogleDriveMount();

  // 1. Check local DriveFS database for instant mapping
  const dbInfo = resolveViaDriveFsDb(fileId);

  if (dbInfo) {
    if (dbInfo.isFolder) {
      return {
        success: true,
        fileId,
        cloudUrl: `https://drive.google.com/drive/folders/${fileId}`,
        fileName: dbInfo.localTitle || 'Google Drive Folder',
        isFolder: true,
        folderChildren: dbInfo.folderChildren || []
      };
    }

    if (dbInfo.localTitle && mount) {
      // Find the file path on the mounted Google Drive
      const targetFileName = dbInfo.localTitle;
      let resolvedPath = findFileInDir(mount, targetFileName);

      if (resolvedPath && fs.existsSync(resolvedPath)) {
        const fileBuffer = fs.readFileSync(resolvedPath);
        return {
          success: true,
          fileId,
          cloudUrl,
          fileName: targetFileName,
          filePath: resolvedPath,
          fileBuffer,
          isFolder: false
        };
      }
    }
  }

  return {
    success: false,
    fileId,
    cloudUrl,
    error: `Could not locate file for Google Drive ID ${fileId}. Ensure Google Drive for Desktop is running.`
  };
}
