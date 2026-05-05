import ImageKit from '@imagekit/nodejs';

const imagekitPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const imagekitUrlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

if (!imagekitPrivateKey || !imagekitUrlEndpoint) {
  throw new Error(
    'Missing IMAGEKIT_PRIVATE_KEY or IMAGEKIT_URL_ENDPOINT in environment variables.'
  );
}

const privateKey = imagekitPrivateKey;
const urlEndpoint = imagekitUrlEndpoint.replace(/\/+$/, '');

const imagekit = new ImageKit({
  privateKey,
});

function transliterate(value: string) {
  const map: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'h',
    ґ: 'g',
    д: 'd',
    е: 'e',
    є: 'ye',
    ж: 'zh',
    з: 'z',
    и: 'y',
    і: 'i',
    ї: 'yi',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'kh',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'shch',
    ь: '',
    ю: 'yu',
    я: 'ya',
    "'": '',
    '’': '',
    '`': '',
    '"': '',
  };

  return value
    .split('')
    .map((char) => {
      const lower = char.toLowerCase();
      return map[lower] ?? lower;
    })
    .join('');
}

function slugify(value: string) {
  return transliterate(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getFileExtension(file: File) {
  const rawName = file.name || '';
  const parts = rawName.split('.');
  const fromName = parts.length > 1 ? parts.pop()?.toLowerCase() : '';

  if (fromName && /^[a-z0-9]+$/i.test(fromName)) {
    return fromName;
  }

  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
  };

  return mimeMap[file.type] || 'jpg';
}

export async function uploadProductImage(
  file: File,
  baseName: string,
  side: 'front' | 'back'
) {
  const safeBaseName = slugify(baseName) || 'product';
  const extension = getFileExtension(file);
  const fileName = `${safeBaseName}-${side}-${Date.now()}.${extension}`;

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  const result = await imagekit.files.upload({
    file: base64,
    fileName,
    folder: '/products',
    useUniqueFileName: true,
  });

  const fileId = result.fileId;
  const uploadedUrl =
    result.url ||
    (result.filePath ? `${urlEndpoint}/${result.filePath.replace(/^\/+/, '')}` : '');

  if (!fileId || !uploadedUrl) {
    throw new Error('ImageKit upload succeeded but response is missing fileId or url.');
  }

  return {
    url: uploadedUrl,
    fileId,
  };
}

export async function deleteImageKitFile(fileId: string | null | undefined) {
  if (!fileId) return;

  try {
    await imagekit.files.delete(fileId);
  } catch (error) {
    console.error('Failed to delete ImageKit file:', error);
  }
}