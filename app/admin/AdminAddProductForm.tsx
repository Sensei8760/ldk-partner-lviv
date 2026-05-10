'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Toast from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import styles from './AdminPage.module.css';

const styleOptions = [
  'ПОРТАЛА',
  'ДПМ+МК',
  'Комфорт NEW',
  'Елегант NEW',
  'Концепт',
  'Модерн',
  'ЛЮКС',
  'ТРІО ЛАЙТ',
  'ТРІО',
  'ТРІО ТЕРМО',
  'ТРІО MOTTURA',
  'Квадро',
  'Стріт',
  'Стріт ТЕРМО',
  'PROF GUARD',
  'Протипожежні + Економ + Епік',
  'РОЗПРОДАЖ',
  'РОЗПРОДАЖ Преміум NEW',
] as const;

const styleOptionsList: readonly string[] = styleOptions;

const doorTypeOptions = [
  { id: 'interior', label: 'Міжкімнатні' },
  { id: 'entrance', label: 'Вхідні' },
] as const;

const sizeOptions = [
  { id: '850x2040', label: '850х2040 мм' },
  { id: '950x2040', label: '950х2040 мм' },
  { id: '1200x2040', label: '1200х2040 мм' },
] as const;

const characteristicLabels = [
  'Короб',
  'Полотно',
  'Метал короб/полотно',
  'МДФ',
  'Теплоізоляція',
  'Ущільнення',
  'Замок верхній',
  'Замок нижній',
  'Ручка',
  'Вічко',
  'Антизрізи',
  'Петлі',
  'Лиштва',
  'Колір ззовні',
  'Колір зсередини',
  'Торець',
  'Броненакладка',
] as const;

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const INITIAL_VISIBLE_COUNT = 5;
const LOAD_MORE_STEP = 10;

type ProductDoorType = (typeof doorTypeOptions)[number]['id'];
type ProductSize = (typeof sizeOptions)[number]['id'];

type ProductSizeStock = {
  size: ProductSize;
  leftStock?: number;
  rightStock?: number;
  stock: number;
};

type Product = {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
  image: string;
  images?: string[];
  description: string;
  type: 'street' | 'apartment';
  doorType: ProductDoorType;
  styles: string[];
  sizes: ProductSize[];
  sizeStocks: ProductSizeStock[];
  stock: number;
  isHit: boolean;
  characteristics: { label: string; value: string }[];
};

type CharacteristicField = {
  label: string;
  value: string;
};

type SizeStockField = {
  size: ProductSize;
  enabled: boolean;
  leftStock: string;
  rightStock: string;
};

type FormState = {
  id: string;
  title: string;
  price: string;
  discountPrice: string;
  imageFrontFile: File | null;
  imageBackFile: File | null;
  imageFrontUrl: string;
  imageBackUrl: string;
  description: string;
  type: 'street' | 'apartment';
  doorType: ProductDoorType;
  styles: string[];
  sizeStocks: SizeStockField[];
  isHit: boolean;
  characteristics: CharacteristicField[];
};

type FormErrors = Partial<{
  title: string;
  price: string;
  discountPrice: string;
  imageFront: string;
  imageBack: string;
  images: string;
  type: string;
  doorType: string;
  styles: string;
  sizeStocks: string;
  description: string;
  characteristics: string;
  general: string;
}>;

type StylePreset = {
  style: string;
  characteristics: CharacteristicField[];
  updated_at?: string;
  updated_by_name?: string | null;
  updated_by_email?: string | null;
};

function createEmptyCharacteristics(): CharacteristicField[] {
  return characteristicLabels.map((label) => ({
    label,
    value: '',
  }));
}

function createEmptySizeStocks(): SizeStockField[] {
  return sizeOptions.map((item) => ({
    size: item.id,
    enabled: false,
    leftStock: '',
    rightStock: '',
  }));
}

const emptyForm: FormState = {
  id: '',
  title: '',
  price: '',
  discountPrice: '',
  imageFrontFile: null,
  imageBackFile: null,
  imageFrontUrl: '',
  imageBackUrl: '',
  description: '',
  type: 'apartment',
  doorType: 'interior',
  styles: [],
  sizeStocks: createEmptySizeStocks(),
  isHit: false,
  characteristics: createEmptyCharacteristics(),
};

function mapCharacteristicsToFields(
  characteristics: { label: string; value: string }[]
): CharacteristicField[] {
  return characteristicLabels.map((label) => {
    const found = characteristics.find((item) => item.label === label);

    return {
      label,
      value: found?.value || '',
    };
  });
}

function mapPresetCharacteristicsToFields(
  characteristics: { label: string; value: string }[]
): CharacteristicField[] {
  return characteristicLabels.map((label) => {
    const found = characteristics.find((item) => item.label === label);

    return {
      label,
      value: found?.value || '',
    };
  });
}

function applyStylePresetToCharacteristics(
  current: CharacteristicField[],
  preset: CharacteristicField[]
) {
  return current.map((field) => {
    const found = preset.find((item) => item.label === field.label);

    return {
      ...field,
      value: found?.value || '',
    };
  });
}

function mapSizeStocksToFields(
  sizeStocks: ProductSizeStock[],
  sizes: ProductSize[],
  totalStock: number
): SizeStockField[] {
  const normalizedSizes = Array.isArray(sizes) ? sizes : [];

  return sizeOptions.map((item) => {
    const found = sizeStocks.find((sizeStock) => sizeStock.size === item.id);

    if (found) {
      const leftStock = Math.max(0, Number(found.leftStock) || 0);
      const rightStock = Math.max(0, Number(found.rightStock) || 0);
      const fallbackStock = Math.max(0, Number(found.stock) || 0);

      let finalLeft = leftStock;
      let finalRight = rightStock;

      if (leftStock === 0 && rightStock === 0 && fallbackStock > 0) {
        finalLeft = 0;
        finalRight = fallbackStock;
      }

      return {
        size: item.id,
        enabled: true,
        leftStock: String(finalLeft),
        rightStock: String(finalRight),
      };
    }

    const isEnabledByLegacySizes = normalizedSizes.includes(item.id);

    if (isEnabledByLegacySizes) {
      return {
        size: item.id,
        enabled: true,
        leftStock: '',
        rightStock: totalStock > 0 ? String(totalStock) : '',
      };
    }

    return {
      size: item.id,
      enabled: false,
      leftStock: '',
      rightStock: '',
    };
  });
}

function getNormalizedSizeStocks(sizeStocks: SizeStockField[]): ProductSizeStock[] {
  return sizeStocks
    .filter((item) => item.enabled)
    .map((item) => {
      const leftStock = item.leftStock.trim() === '' ? 0 : Number(item.leftStock);
      const rightStock = item.rightStock.trim() === '' ? 0 : Number(item.rightStock);

      return {
        size: item.size,
        leftStock,
        rightStock,
        stock: leftStock + rightStock,
      };
    })
    .filter(
      (item) =>
        Number.isFinite(item.leftStock) &&
        Number.isInteger(item.leftStock) &&
        item.leftStock >= 0 &&
        Number.isFinite(item.rightStock) &&
        Number.isInteger(item.rightStock) &&
        item.rightStock >= 0
    );
}

function getTotalStock(sizeStocks: SizeStockField[]) {
  return getNormalizedSizeStocks(sizeStocks).reduce(
    (sum, item) => sum + item.stock,
    0
  );
}

function getDerivedOpenings(sizeStocks: SizeStockField[]) {
  const normalized = getNormalizedSizeStocks(sizeStocks);

  const openings: Array<'left' | 'right'> = [];

  if (normalized.some((item) => (item.leftStock || 0) > 0)) {
    openings.push('left');
  }

  if (normalized.some((item) => (item.rightStock || 0) > 0)) {
    openings.push('right');
  }

  return openings;
}

function isValidImageFile(file: File) {
  return file.type.startsWith('image/') && file.size <= MAX_IMAGE_SIZE_BYTES;
}

function validateImageFile(file: File | null) {
  if (!file) return null;

  if (!file.type.startsWith('image/')) {
    return 'Оберіть файл зображення.';
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Фото повинно бути менше 5 МБ.';
  }

  return null;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  const title = form.title.trim();
  const price = Number(form.price);
  const discountPrice =
    form.discountPrice.trim() === '' ? null : Number(form.discountPrice);
  const description = form.description.trim();

  const hasFrontImage = Boolean(form.imageFrontFile || form.imageFrontUrl);
  const frontFileError = validateImageFile(form.imageFrontFile);
  const backFileError = validateImageFile(form.imageBackFile);

  if (!title) {
    errors.title = 'Вкажіть назву товару.';
  } else if (title.length < 5) {
    errors.title = 'Назва має містити щонайменше 5 символів.';
  } else if (title.length > 120) {
    errors.title = 'Назва не повинна перевищувати 120 символів.';
  }

  if (form.price === '') {
    errors.price = 'Вкажіть основну ціну.';
  } else if (!Number.isFinite(price)) {
    errors.price = 'Основна ціна повинна бути числом.';
  } else if (price <= 0) {
    errors.price = 'Основна ціна повинна бути більшою за 0.';
  } else if (price > 9999999) {
    errors.price = 'Основна ціна занадто велика.';
  }

  if (form.discountPrice.trim() !== '') {
    if (!Number.isFinite(discountPrice)) {
      errors.discountPrice = 'Ціна зі знижкою повинна бути числом.';
    } else if ((discountPrice ?? 0) <= 0) {
      errors.discountPrice = 'Ціна зі знижкою повинна бути більшою за 0.';
    } else if (Number.isFinite(price) && (discountPrice ?? 0) >= price) {
      errors.discountPrice = 'Ціна зі знижкою повинна бути меншою за основну ціну.';
    }
  }

  if (!hasFrontImage) {
    errors.imageFront = 'Перше фото є обов’язковим.';
  } else if (frontFileError) {
    errors.imageFront = frontFileError;
  }

  if (backFileError) {
    errors.imageBack = backFileError;
  }

  if (!doorTypeOptions.some((item) => item.id === form.doorType)) {
    errors.doorType = 'Оберіть тип дверей.';
  }

  const invalidStyles = form.styles.filter((style) => !styleOptionsList.includes(style));
  if (invalidStyles.length > 0) {
    errors.styles = 'Обрано некоректний стиль.';
  }

  const enabledSizeStocks = form.sizeStocks.filter((item) => item.enabled);

  const hasInvalidStock = enabledSizeStocks.some((item) => {
    const leftRaw = item.leftStock.trim();
    const rightRaw = item.rightStock.trim();

    const leftValue = leftRaw === '' ? 0 : Number(leftRaw);
    const rightValue = rightRaw === '' ? 0 : Number(rightRaw);

    const leftInvalid =
      !Number.isFinite(leftValue) ||
      !Number.isInteger(leftValue) ||
      leftValue < 0 ||
      leftValue > 9999;

    const rightInvalid =
      !Number.isFinite(rightValue) ||
      !Number.isInteger(rightValue) ||
      rightValue < 0 ||
      rightValue > 9999;

    return leftInvalid || rightInvalid;
  });

  if (hasInvalidStock) {
    errors.sizeStocks =
      'Для кожного вибраного розміру вкажіть коректну кількість лівих і правих дверей.';
  }

  if (description.length > 1000) {
    errors.description = 'Опис не повинен перевищувати 1000 символів.';
  }

  const invalidCharacteristics = form.characteristics.filter(
    (item) =>
      !characteristicLabels.includes(item.label as (typeof characteristicLabels)[number]) ||
      item.value.trim().length > 200
  );

  if (invalidCharacteristics.length > 0) {
    errors.characteristics =
      'Характеристики містять некоректні або занадто довгі значення.';
  }

  return errors;
}

function useImagePreview(file: File | null, fallbackUrl: string) {
  const objectUrl = useMemo(() => {
    if (!file) return '';
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  return objectUrl || fallbackUrl || '';
}

function ProductImagePreview({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const normalizedSrc = src.trim();
  const [hasError, setHasError] = useState(false);

  if (!normalizedSrc || hasError) {
    return (
      <div className={styles.imagePreviewBox}>
        <div
          className={styles.imagePreviewFrame}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888',
            fontSize: '14px',
            textAlign: 'center',
            padding: '12px',
          }}
        >
          Фото не додано
        </div>
      </div>
    );
  }

  return (
    <div className={styles.imagePreviewBox}>
      <div className={styles.imagePreviewFrame}>
        <Image
          src={normalizedSrc}
          alt={alt}
          fill
          unoptimized
          className={styles.imagePreview}
          sizes="160px"
          onError={() => {
            setHasError(true);
          }}
        />
      </div>
    </div>
  );
}

export default function AdminAddProductForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [stylePresets, setStylePresets] = useState<StylePreset[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsLoadError, setProductsLoadError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frontInputRef = useRef<HTMLInputElement | null>(null);
  const backInputRef = useRef<HTMLInputElement | null>(null);

  const totalStock = useMemo(() => getTotalStock(form.sizeStocks), [form.sizeStocks]);

  const frontPreview = useImagePreview(form.imageFrontFile, form.imageFrontUrl);
  const backPreview = useImagePreview(form.imageBackFile, form.imageBackUrl);

  const triggerToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const loadProducts = useCallback(
    async (showErrorToast = false) => {
      try {
        setIsLoadingProducts(true);
        setProductsLoadError('');

        const response = await fetch('/api/products?includeStylePresets=true', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Не вдалося завантажити товари.');
        }

        const data = await response.json();
        const loadedProducts = Array.isArray(data.products) ? data.products : [];
        const loadedPresets = Array.isArray(data.stylePresets)
          ? data.stylePresets.map(
              (preset: {
                style: string;
                characteristics: { label: string; value: string }[];
                updated_at?: string;
                updated_by_name?: string | null;
                updated_by_email?: string | null;
              }) => ({
                style: String(preset.style || '').trim(),
                characteristics: mapPresetCharacteristicsToFields(
                  Array.isArray(preset.characteristics) ? preset.characteristics : []
                ),
                updated_at: preset.updated_at,
                updated_by_name: preset.updated_by_name ?? null,
                updated_by_email: preset.updated_by_email ?? null,
              })
            )
          : [];

        setProducts(loadedProducts);
        setStylePresets(loadedPresets);
      } catch {
        setProducts([]);
        setStylePresets([]);
        setProductsLoadError('Не вдалося завантажити список товарів. Спробуйте ще раз.');

        if (showErrorToast) {
          triggerToast('Не вдалося завантажити список товарів.', 'error');
        }
      } finally {
        setIsLoadingProducts(false);
      }
    },
    [triggerToast]
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [searchQuery]);

  function clearFieldError(field: keyof FormErrors) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      return { ...prev, [field]: undefined };
    });
  }

  function clearNativeFileInputs() {
    if (frontInputRef.current) {
      frontInputRef.current.value = '';
    }

    if (backInputRef.current) {
      backInputRef.current.value = '';
    }
  }

  function handleSelectDoorType(doorType: ProductDoorType) {
    setForm((prev) => ({
      ...prev,
      doorType,
    }));
    clearFieldError('doorType');
  }

  function handleToggleStyle(style: string) {
    setForm((prev) => {
      const alreadySelected = prev.styles.includes(style);
      const nextStyles = alreadySelected
        ? prev.styles.filter((item) => item !== style)
        : [...prev.styles, style];

      if (alreadySelected) {
        return {
          ...prev,
          styles: nextStyles,
        };
      }

      const preset = stylePresets.find((preset: StylePreset) => preset.style === style);

      if (!preset) {
        return {
          ...prev,
          styles: nextStyles,
        };
      }

      return {
        ...prev,
        styles: nextStyles,
        characteristics: applyStylePresetToCharacteristics(
          prev.characteristics,
          preset.characteristics
        ),
      };
    });

    clearFieldError('styles');
    clearFieldError('characteristics');

    const preset = stylePresets.find((preset: StylePreset) => preset.style === style);
    if (preset) {
      triggerToast(`Підтягнуто останні характеристики для стилю "${style}".`, 'success');
    }
  }

  function handleToggleSize(size: ProductSize) {
    setForm((prev) => ({
      ...prev,
      sizeStocks: prev.sizeStocks.map((item) =>
        item.size === size
          ? {
              ...item,
              enabled: !item.enabled,
              leftStock: item.enabled ? '' : item.leftStock,
              rightStock: item.enabled ? '' : item.rightStock,
            }
          : item
      ),
    }));

    clearFieldError('sizeStocks');
  }

  function handleSizeSideChange(
    size: ProductSize,
    side: 'leftStock' | 'rightStock',
    value: string
  ) {
    const sanitized = value.replace(/[^\d]/g, '');

    setForm((prev) => ({
      ...prev,
      sizeStocks: prev.sizeStocks.map((item) =>
        item.size === size
          ? {
              ...item,
              [side]: sanitized,
            }
          : item
      ),
    }));

    clearFieldError('sizeStocks');
  }

  function handleCharacteristicChange(label: string, value: string) {
    setForm((prev) => ({
      ...prev,
      characteristics: prev.characteristics.map((item) =>
        item.label === label ? { ...item, value } : item
      ),
    }));

    clearFieldError('characteristics');
  }

  function handleFrontImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) return;

    if (!isValidImageFile(file)) {
      setErrors((prev) => ({
        ...prev,
        imageFront: 'Оберіть коректне фото до 5 МБ.',
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      imageFrontFile: file,
    }));

    clearFieldError('imageFront');
    clearFieldError('images');
  }

  function handleBackImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) return;

    if (!isValidImageFile(file)) {
      setErrors((prev) => ({
        ...prev,
        imageBack: 'Оберіть коректне фото до 5 МБ.',
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      imageBackFile: file,
    }));

    clearFieldError('imageBack');
  }

  function handleRemoveFrontImage() {
    setForm((prev) => ({
      ...prev,
      imageFrontFile: null,
      imageFrontUrl: prev.imageFrontFile ? prev.imageFrontUrl : '',
    }));

    if (frontInputRef.current) {
      frontInputRef.current.value = '';
    }

    clearFieldError('imageFront');
    clearFieldError('images');
  }

  function handleRemoveBackImage() {
    setForm((prev) => ({
      ...prev,
      imageBackFile: null,
      imageBackUrl: prev.imageBackFile ? prev.imageBackUrl : '',
    }));

    if (backInputRef.current) {
      backInputRef.current.value = '';
    }

    clearFieldError('imageBack');
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      sizeStocks: createEmptySizeStocks(),
      characteristics: createEmptyCharacteristics(),
    });
    setErrors({});
    setEditingId(null);
    clearNativeFileInputs();
  }

  function handleEdit(product: Product) {
    const productImages =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];

    setEditingId(product.id);

    setForm({
      id: product.id || '',
      title: product.title || '',
      price: String(product.price ?? ''),
      discountPrice:
        product.discountPrice !== null && product.discountPrice !== undefined
          ? String(product.discountPrice)
          : '',
      imageFrontFile: null,
      imageBackFile: null,
      imageFrontUrl: productImages[0] || '',
      imageBackUrl: productImages[1] || '',
      description: product.description || '',
      type: product.type === 'street' ? 'street' : 'apartment',
      doorType: product.doorType === 'entrance' ? 'entrance' : 'interior',
      styles: Array.isArray(product.styles) ? product.styles : [],
      sizeStocks: mapSizeStocksToFields(
        Array.isArray(product.sizeStocks) ? product.sizeStocks : [],
        Array.isArray(product.sizes) ? product.sizes : [],
        product.stock ?? 0
      ),
      isHit: Boolean(product.isHit),
      characteristics: mapCharacteristicsToFields(
        Array.isArray(product.characteristics) ? product.characteristics : []
      ),
    });

    clearNativeFileInputs();
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerToast('Режим редагування увімкнено.', 'success');
  }

  function openDeleteModal(product: Product) {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (isDeleting) return;
    setDeleteModalOpen(false);
    setProductToDelete(null);
  }

  async function handleDeleteConfirm() {
    if (!productToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productToDelete.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        triggerToast(data.message || 'Не вдалося видалити товар.', 'error');
        return;
      }

      if (editingId === productToDelete.id) {
        resetForm();
      }

      setDeleteModalOpen(false);
      setProductToDelete(null);

      await loadProducts();
      router.refresh();
      triggerToast('Товар успішно видалено.', 'success');
    } catch {
      triggerToast('Сталася помилка під час видалення товару.', 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      triggerToast('Не всі обов’язкові поля заповнені або містять помилки.', 'error');
      return;
    }

    setIsLoading(true);

    const normalizedSizeStocks = getNormalizedSizeStocks(form.sizeStocks);
    const derivedOpenings = getDerivedOpenings(form.sizeStocks);
    const totalCalculatedStock = normalizedSizeStocks.reduce(
      (sum, item) => sum + item.stock,
      0
    );

    const formData = new FormData();

    formData.append('id', form.id.trim());
    formData.append('title', form.title.trim());
    formData.append('price', String(Number(form.price)));
    formData.append(
      'discountPrice',
      form.discountPrice.trim() === '' ? '' : String(Number(form.discountPrice))
    );
    formData.append('description', form.description.trim());
    formData.append('type', form.type);
    formData.append('doorType', form.doorType);
    formData.append('isHit', String(form.isHit));

    formData.append('styles', JSON.stringify(form.styles));
    formData.append('openings', JSON.stringify(derivedOpenings));
    formData.append('sizes', JSON.stringify(normalizedSizeStocks.map((item) => item.size)));
    formData.append('sizeStocks', JSON.stringify(normalizedSizeStocks));
    formData.append('stock', String(totalCalculatedStock));
    formData.append(
      'characteristics',
      JSON.stringify(
        form.characteristics
          .map((item) => ({
            label: item.label,
            value: item.value.trim(),
          }))
          .filter((item) => item.value)
      )
    );

    formData.append('existingImageFront', form.imageFrontUrl);
    formData.append('existingImageBack', form.imageBackUrl);

    if (form.imageFrontFile) {
      formData.append('imageFrontFile', form.imageFrontFile);
    }

    if (form.imageBackFile) {
      formData.append('imageBackFile', form.imageBackFile);
    }

    try {
      const response = await fetch('/api/products', {
        method: editingId ? 'PATCH' : 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.errors && typeof data.errors === 'object') {
          setErrors(data.errors);
        }

        triggerToast(data.message || 'Не вдалося зберегти товар.', 'error');
        return;
      }

      const wasEditing = Boolean(editingId);

      resetForm();
      await loadProducts();
      router.refresh();

      triggerToast(
        wasEditing ? 'Товар успішно оновлено.' : 'Товар успішно додано.',
        'success'
      );
    } catch {
      triggerToast('Сталася помилка під час збереження товару.', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) return products;

    return products.filter((product) =>
      product.title.toLowerCase().includes(normalizedQuery)
    );
  }, [products, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleProducts.length < filteredProducts.length;

  function handleShowMore() {
    setVisibleCount((prev) => prev + LOAD_MORE_STEP);
  }

  return (
    <>
      <Toast show={showToast} message={toastMessage} type={toastType} />

      <ConfirmModal
        open={deleteModalOpen}
        title="Підтвердження видалення"
        message={
          productToDelete
            ? `Точно видалити товар "${productToDelete.title}"?`
            : 'Точно видалити цей товар?'
        }
        confirmText="Видалити"
        cancelText="Скасувати"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteModal}
        isLoading={isDeleting}
      />

      <div className={styles.adminContent}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formHeader}>
            <h2 className={styles.sectionTitle}>
              {editingId ? 'Редагування товару' : 'Додавання товару'}
            </h2>

            {editingId ? (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={resetForm}
              >
                Скасувати редагування
              </button>
            ) : null}
          </div>

          {errors.general ? (
            <p className={styles.fieldError}>{errors.general}</p>
          ) : null}

          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Назва</label>
              <input
                value={form.title}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, title: e.target.value }));
                  clearFieldError('title');
                }}
                placeholder='Міжкімнатні двері "Doors" Smart - модель - C067'
              />
              {errors.title ? <p className={styles.fieldError}>{errors.title}</p> : null}
            </div>

            <div className={styles.field}>
              <label>Основна ціна</label>
              <input
                type="number"
                min="1"
                value={form.price}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, price: e.target.value }));
                  clearFieldError('price');
                }}
                placeholder="3064"
              />
              {errors.price ? <p className={styles.fieldError}>{errors.price}</p> : null}
            </div>

            <div className={styles.field}>
              <label>Ціна зі знижкою</label>
              <input
                type="number"
                min="1"
                value={form.discountPrice}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, discountPrice: e.target.value }));
                  clearFieldError('discountPrice');
                }}
                placeholder="Необов'язково"
              />
              {errors.discountPrice ? (
                <p className={styles.fieldError}>{errors.discountPrice}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label>Фото 1 (одна сторона)</label>

              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                onChange={handleFrontImageChange}
                style={{ display: 'none' }}
              />

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginBottom: '12px',
                }}
              >
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => frontInputRef.current?.click()}
                >
                  {form.imageFrontFile || form.imageFrontUrl ? 'Замінити фото' : 'Обрати фото'}
                </button>

                {form.imageFrontFile || form.imageFrontUrl ? (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleRemoveFrontImage}
                  >
                    Видалити фото
                  </button>
                ) : null}
              </div>

              <p className={styles.stateText}>
                {form.imageFrontFile
                  ? `Обрано файл: ${form.imageFrontFile.name}`
                  : form.imageFrontUrl
                    ? 'Поточне фото збережено'
                    : 'Фото ще не обрано'}
              </p>

              {errors.imageFront ? (
                <p className={styles.fieldError}>{errors.imageFront}</p>
              ) : null}

              <ProductImagePreview
                key={`front-${frontPreview}`}
                src={frontPreview}
                alt={form.title ? `${form.title} - фото 1` : 'Фото 1'}
              />
            </div>

            <div className={styles.field}>
              <label>Фото 2 (друга сторона)</label>

              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackImageChange}
                style={{ display: 'none' }}
              />

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginBottom: '12px',
                }}
              >
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => backInputRef.current?.click()}
                >
                  {form.imageBackFile || form.imageBackUrl ? 'Замінити фото' : 'Обрати фото'}
                </button>

                {form.imageBackFile || form.imageBackUrl ? (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleRemoveBackImage}
                  >
                    Видалити фото
                  </button>
                ) : null}
              </div>

              <p className={styles.stateText}>
                {form.imageBackFile
                  ? `Обрано файл: ${form.imageBackFile.name}`
                  : form.imageBackUrl
                    ? 'Поточне фото збережено'
                    : 'Фото необов’язкове'}
              </p>

              {errors.imageBack ? (
                <p className={styles.fieldError}>{errors.imageBack}</p>
              ) : null}

              <ProductImagePreview
                key={`back-${backPreview}`}
                src={backPreview}
                alt={form.title ? `${form.title} - фото 2` : 'Фото 2'}
              />
            </div>

            <div className={styles.field}>
              <label>Тип дверей</label>
              <div className={styles.stylesGrid}>
                {doorTypeOptions.map((item) => (
                  <label key={item.id} className={styles.styleOption}>
                    <input
                      type="checkbox"
                      checked={form.doorType === item.id}
                      onChange={() => handleSelectDoorType(item.id)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
              {errors.doorType ? <p className={styles.fieldError}>{errors.doorType}</p> : null}
            </div>

            <div className={styles.field}>
              <label>Місце встановлення</label>
              <select
                value={form.type}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    type: e.target.value as 'street' | 'apartment',
                  }));
                  clearFieldError('type');
                }}
              >
                <option value="apartment">Квартира</option>
                <option value="street">Вулиця</option>
              </select>
              {errors.type ? <p className={styles.fieldError}>{errors.type}</p> : null}
            </div>
          </div>

          {errors.images ? <p className={styles.fieldError}>{errors.images}</p> : null}

          <div className={styles.field}>
            <label>Розміри та кількість по відкриванню</label>
            <div className={styles.characteristicsGrid}>
              {form.sizeStocks.map((item) => {
                const sizeLabel =
                  sizeOptions.find((option) => option.id === item.size)?.label || item.size;

                return (
                  <div key={item.size} className={styles.characteristicField}>
                    <label className={styles.styleOption}>
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => handleToggleSize(item.size)}
                      />
                      <span>{sizeLabel}</span>
                    </label>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginTop: '10px',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontSize: '14px',
                          }}
                        >
                          Ліве
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.leftStock}
                          onChange={(e) =>
                            handleSizeSideChange(item.size, 'leftStock', e.target.value)
                          }
                          placeholder="0"
                          disabled={!item.enabled}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontSize: '14px',
                          }}
                        >
                          Праве
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.rightStock}
                          onChange={(e) =>
                            handleSizeSideChange(item.size, 'rightStock', e.target.value)
                          }
                          placeholder="0"
                          disabled={!item.enabled}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className={styles.stateText}>Загальна кількість в наявності: {totalStock}</p>

            {errors.sizeStocks ? (
              <p className={styles.fieldError}>{errors.sizeStocks}</p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label>Стилі</label>
            <div className={styles.stylesGrid}>
              {styleOptions.map((style) => (
                <label key={style} className={styles.styleOption}>
                  <input
                    type="checkbox"
                    checked={form.styles.includes(style)}
                    onChange={() => handleToggleStyle(style)}
                  />
                  <span>{style}</span>
                </label>
              ))}
            </div>
            {errors.styles ? <p className={styles.fieldError}>{errors.styles}</p> : null}
          </div>

          <div className={styles.field}>
            <label>Опис</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, description: e.target.value }));
                clearFieldError('description');
              }}
              placeholder="Короткий опис товару..."
            />
            {errors.description ? (
              <p className={styles.fieldError}>{errors.description}</p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label>Характеристики</label>
            <div className={styles.characteristicsGrid}>
              {form.characteristics.map((item) => (
                <div key={item.label} className={styles.characteristicField}>
                  <label>{item.label}</label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleCharacteristicChange(item.label, e.target.value)}
                    placeholder={`Вкажіть значення для "${item.label}"`}
                  />
                </div>
              ))}
            </div>
            {errors.characteristics ? (
              <p className={styles.fieldError}>{errors.characteristics}</p>
            ) : null}
          </div>

          <label className={styles.hitRow}>
            <input
              type="checkbox"
              checked={form.isHit}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isHit: e.target.checked }))
              }
            />
            <span>Позначити як ХІТ</span>
          </label>

          <button className={styles.submitButton} type="submit" disabled={isLoading}>
            {isLoading
              ? 'Збереження...'
              : editingId
                ? 'Оновити товар'
                : 'Додати товар'}
          </button>
        </form>

        <div className={styles.productsManager}>
          <div className={styles.productsManagerHeader}>
            <h2 className={styles.sectionTitle}>Існуючі товари</h2>

            <div className={styles.searchBox}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук по назві..."
                className={styles.searchInput}
                disabled={Boolean(productsLoadError)}
              />
            </div>
          </div>

          {isLoadingProducts ? (
            <p>Завантаження товарів...</p>
          ) : productsLoadError ? (
            <div className={styles.stateBox}>
              <h3 className={styles.stateTitle}>Не вдалося завантажити товари</h3>
              <p className={styles.stateText}>{productsLoadError}</p>
              <button
                type="button"
                className={styles.retryButton}
                onClick={() => loadProducts(true)}
              >
                Спробувати ще раз
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.stateBox}>
              <h3 className={styles.stateTitle}>Товарів не знайдено</h3>
              <p className={styles.stateText}>
                {searchQuery.trim()
                  ? 'Спробуйте змінити пошуковий запит.'
                  : 'Поки що в каталозі немає доданих товарів.'}
              </p>
            </div>
          ) : (
            <>
              <div className={styles.productsList}>
                {visibleProducts.map((product) => (
                  <div key={product.id} className={styles.productRow}>
                    <div className={styles.productInfo}>
                      <p className={styles.productTitle}>{product.title}</p>
                      <p className={styles.productMeta}>
                        ID: {product.id} ·{' '}
                        {product.discountPrice !== null &&
                        product.discountPrice < product.price
                          ? `${product.discountPrice} грн (замість ${product.price} грн)`
                          : `${product.price} грн`}{' '}
                        · В наявності: {product.stock}
                      </p>
                    </div>

                    <div className={styles.productActions}>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => handleEdit(product)}
                      >
                        Редагувати
                      </button>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => openDeleteModal(product)}
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {hasMoreProducts ? (
                <button
                  type="button"
                  className={styles.showMoreProductsButton}
                  onClick={handleShowMore}
                >
                  Показати ще
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}