import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, XCircle, AlertCircle } from 'lucide-react';

type ConfirmationType = 'delete' | 'suspend' | 'warning' | 'danger';

interface ConfirmationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  type?: ConfirmationType;
  isLoading?: boolean;
}

const iconMap: Record<ConfirmationType, typeof AlertTriangle> = {
  delete: Trash2,
  suspend: XCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
};

const colorMap: Record<ConfirmationType, string> = {
  delete: 'text-red-600 bg-red-100',
  suspend: 'text-orange-600 bg-orange-100',
  warning: 'text-amber-600 bg-amber-100',
  danger: 'text-red-600 bg-red-100',
};

const buttonVariantMap: Record<ConfirmationType, 'destructive' | 'default'> = {
  delete: 'destructive',
  suspend: 'destructive',
  warning: 'default',
  danger: 'destructive',
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'warning',
  isLoading = false,
}: ConfirmationDialogProps) {
  const { t } = useTranslation('common');
  const Icon = iconMap[type];
  const iconColor = colorMap[type];

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelText || t('cancel', 'Отмена')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              buttonVariantMap[type] === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : ''
            }
          >
            {isLoading ? t('loading', 'Загрузка...') : confirmText || t('confirm', 'Подтвердить')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface DeleteConfirmationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  itemName: string;
  itemType?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  trigger,
  itemName,
  itemType,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation('common');

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={t('deleteConfirmation.title', 'Удалить {{type}}?', { type: itemType || 'элемент' })}
      description={t(
        'deleteConfirmation.description',
        'Вы уверены, что хотите удалить "{{name}}"? Это действие нельзя отменить.',
        { name: itemName }
      )}
      confirmText={t('delete', 'Удалить')}
      onConfirm={onConfirm}
      onCancel={onCancel}
      type="delete"
      isLoading={isLoading}
    />
  );
}

interface SuspendConfirmationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  itemName: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function SuspendConfirmationDialog({
  open,
  onOpenChange,
  trigger,
  itemName,
  onConfirm,
  onCancel,
  isLoading = false,
}: SuspendConfirmationDialogProps) {
  const { t } = useTranslation('common');

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={t('suspendConfirmation.title', 'Приостановить доступ?')}
      description={t(
        'suspendConfirmation.description',
        'Вы уверены, что хотите приостановить доступ для "{{name}}"? Пользователи этого портала не смогут войти.',
        { name: itemName }
      )}
      confirmText={t('suspend', 'Приостановить')}
      onConfirm={onConfirm}
      onCancel={onCancel}
      type="suspend"
      isLoading={isLoading}
    />
  );
}

export function useConfirmation() {
  const { t } = useTranslation('common');

  return {
    getDeleteTitle: (itemType?: string) =>
      t('deleteConfirmation.title', 'Удалить {{type}}?', { type: itemType || 'элемент' }),
    getDeleteDescription: (itemName: string) =>
      t(
        'deleteConfirmation.description',
        'Вы уверены, что хотите удалить "{{name}}"? Это действие нельзя отменить.',
        { name: itemName }
      ),
    getSuspendTitle: () => t('suspendConfirmation.title', 'Приостановить доступ?'),
    getSuspendDescription: (itemName: string) =>
      t(
        'suspendConfirmation.description',
        'Вы уверены, что хотите приостановить доступ для "{{name}}"?',
        { name: itemName }
      ),
  };
}
