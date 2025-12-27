'use client';

import React from 'react';
import type i18n from 'i18next';

export const TranslationContext = React.createContext<typeof i18n | null>(null);
TranslationContext.displayName = 'TranslationContext';
