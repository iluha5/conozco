'use client';

import { Header } from '@/components/Header';
import { ExtensionPageContent } from '@/components/extension/ExtensionPageContent';

export default function ExtensionPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Header />
            <ExtensionPageContent />
        </div>
    );
}
