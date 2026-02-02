import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTenantFeatures, TenantFeatureFlags, TenantLimits } from '@/hooks/useTenantFeatures';
import { usePortal } from '@/contexts/PortalContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, Crown, ArrowUpRight } from 'lucide-react';

type LimitType = 'users' | 'deals' | 'contacts';

const limitKeyMapping: Record<string, LimitType> = {
  maxUsers: 'users',
  maxDeals: 'deals',
  maxContacts: 'contacts',
  users: 'users',
  deals: 'deals',
  contacts: 'contacts',
};

interface FeatureGateProps {
  feature?: keyof TenantFeatureFlags;
  module?: string;
  limit?: keyof TenantLimits | LimitType;
  currentCount?: number;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGate({
  feature,
  module,
  limit,
  currentCount = 0,
  children,
  fallback,
  showUpgrade = true,
}: FeatureGateProps) {
  const { t } = useTranslation('billing');
  const { hasFeature, hasModule, isWithinLimit, data, isLoading } = useTenantFeatures();
  const { portalSlug, getPortalPath } = usePortal();
  const navigate = useNavigate();

  if (isLoading) {
    return null;
  }

  let hasAccess = true;
  let reason = '';

  if (feature) {
    hasAccess = hasFeature(feature);
    reason = feature;
  } else if (module) {
    hasAccess = hasModule(module);
    reason = module;
  } else if (limit && typeof currentCount === 'number') {
    const mappedLimit = limitKeyMapping[limit as string];
    if (mappedLimit) {
      hasAccess = isWithinLimit(mappedLimit, currentCount);
      reason = limit as string;
    }
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  const handleUpgrade = () => {
    if (portalSlug) {
      navigate(getPortalPath('/billing'));
    }
  };

  return (
    <Card className="border-dashed border-2 border-amber-200 bg-amber-50/50">
      <CardContent className="py-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
          <Lock className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('featureGate.title', { defaultValue: 'Функция недоступна' })}
        </h3>
        <p className="text-sm text-gray-600 mb-4 max-w-xs mx-auto">
          {t('featureGate.description', { 
            feature: reason,
            plan: data?.plan?.name || 'Pro',
            defaultValue: 'Эта функция доступна на более высоких тарифных планах',
          })}
        </p>
        <Button onClick={handleUpgrade} className="gap-2">
          <Crown className="w-4 h-4" />
          {t('featureGate.upgradeButton', { defaultValue: 'Улучшить тариф' })}
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

interface ChannelGateProps {
  type: 'whatsapp' | 'telegram' | 'instagram';
  currentCount: number;
  children: ReactNode;
}

export function ChannelGate({ type, currentCount, children }: ChannelGateProps) {
  const { t } = useTranslation('billing');
  const { canAddChannel, data, isLoading } = useTenantFeatures();
  const { portalSlug, getPortalPath } = usePortal();
  const navigate = useNavigate();

  if (isLoading) {
    return null;
  }

  const canAdd = canAddChannel(type, currentCount);

  if (canAdd) {
    return <>{children}</>;
  }

  const limitKey = {
    whatsapp: 'maxWhatsappChannels',
    telegram: 'maxTelegramChannels',
    instagram: 'maxInstagramChannels',
  }[type] as keyof TenantLimits;

  const limit = data?.limits[limitKey];

  const handleUpgrade = () => {
    if (portalSlug) {
      navigate(getPortalPath('/billing'));
    }
  };

  return (
    <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
      <CardContent className="py-6 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mb-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
        </div>
        <h4 className="font-medium text-gray-900 mb-1">
          {t('channelGate.limitReached', { 
            defaultValue: 'Достигнут лимит каналов',
          })}
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          {t('channelGate.description', { 
            type: type.charAt(0).toUpperCase() + type.slice(1),
            limit: typeof limit === 'number' ? limit : 0,
            current: currentCount,
            defaultValue: `Ваш тариф поддерживает ${limit || 0} ${type} каналов`,
          })}
        </p>
        <Button size="sm" onClick={handleUpgrade} variant="outline" className="gap-2">
          <Crown className="w-4 h-4" />
          {t('channelGate.upgradeButton', { defaultValue: 'Увеличить лимит' })}
        </Button>
      </CardContent>
    </Card>
  );
}

interface ModuleGateProps {
  module: string;
  children: ReactNode;
  title?: string;
  description?: string;
}

export function ModuleGate({ module, children, title, description }: ModuleGateProps) {
  const { t } = useTranslation('billing');
  const { hasModule, isLoading } = useTenantFeatures();
  const { portalSlug, getPortalPath } = usePortal();
  const navigate = useNavigate();

  if (isLoading) {
    return null;
  }

  if (hasModule(module)) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    if (portalSlug) {
      navigate(getPortalPath('/billing'));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Lock className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title || t('moduleGate.title', { module, defaultValue: `Модуль "${module}" недоступен` })}
      </h3>
      <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
        {description || t('moduleGate.description', { 
          defaultValue: 'Этот модуль не включен в ваш текущий тарифный план. Обновите тариф, чтобы получить доступ к этой функции.',
        })}
      </p>
      <Button onClick={handleUpgrade} size="lg" className="gap-2">
        <Crown className="w-5 h-5" />
        {t('moduleGate.upgradeButton', { defaultValue: 'Улучшить тариф' })}
        <ArrowUpRight className="w-5 h-5" />
      </Button>
    </div>
  );
}

export function useFeatureCheck() {
  const { hasFeature, hasModule, canAddChannel, isWithinLimit, data, isLoading } = useTenantFeatures();

  return {
    isLoading,
    planName: data?.plan?.name || null,
    planSlug: data?.plan?.slug || null,
    isActive: data?.subscriptionActive || false,
    check: {
      feature: hasFeature,
      module: hasModule,
      channel: canAddChannel,
      limit: isWithinLimit,
    },
    limits: data?.limits || null,
    features: data?.features || null,
    modules: data?.modules || [],
  };
}
