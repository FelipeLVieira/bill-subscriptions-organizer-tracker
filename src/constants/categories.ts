import i18n from '@/i18n';

export const getSubscriptionCategories = () => [
    { label: i18n.t('cat_entertainment'), value: 'Entertainment' },
    { label: i18n.t('cat_utilities'), value: 'Utilities' },
    { label: i18n.t('cat_housing'), value: 'Housing' },
    { label: i18n.t('cat_insurance'), value: 'Insurance' },
    { label: i18n.t('cat_personal_care'), value: 'Personal Care' },
    { label: i18n.t('cat_software'), value: 'Software' },
    { label: i18n.t('cat_other'), value: 'Other' },
];

// Helper to get localized label for a stored value
export const getCategoryLabel = (value: string) => {
    const categories = getSubscriptionCategories();
    const cat = categories.find(c => c.value === value);
    return cat ? cat.label : value;
};
