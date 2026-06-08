'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useCookieConsent } from '@/hooks/shared/useCookieConsent';

export default function PrivacyPolicyPage() {
    const { t } = useTranslation();
    const { consent, withdrawing, withdrawConsent } = useCookieConsent();
    const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

    const handleWithdraw = async () => {
        await withdrawConsent();
        setShowWithdrawDialog(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />
            <div className="container mx-auto px-4 py-4">
                <div className="mb-3">
                    <Link href="/">
                        <Button variant="ghost">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('Back')}
                        </Button>
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">
                        {t('Privacy Policy')}
                    </h1>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>{t('1. Introduction')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                {t(
                                    'This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.',
                                )}
                            </p>
                            <p className="text-gray-700">
                                <strong>{t('Contact Information:')}</strong>
                            </p>
                            <p className="text-gray-700">
                                {t(
                                    'If you have any questions about this Privacy Policy, please contact us.',
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                {t('2. Information We Collect')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                {t(
                                    'We collect information that you provide directly to us, including:',
                                )}
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                <li>
                                    {t(
                                        'Account information: email address, password, name',
                                    )}
                                </li>
                                <li>
                                    {t(
                                        'Language preferences: native language, language to learn, interface language',
                                    )}
                                </li>
                                <li>
                                    {t(
                                        'Training data: words, progress, training sessions, statistics',
                                    )}
                                </li>
                                <li>
                                    {t(
                                        'Cookie preferences: your consent for different types of cookies',
                                    )}
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                {t(
                                    '3. Legal Basis for Processing (GDPR Art. 6)',
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                {t(
                                    'We process your personal data based on the following legal grounds:',
                                )}
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                <li>
                                    <strong>
                                        {t('Consent (Art. 6(1)(a)):')}
                                    </strong>{' '}
                                    {t(
                                        'For cookies and similar technologies (with your explicit consent)',
                                    )}
                                </li>
                                <li>
                                    <strong>
                                        {t(
                                            'Contract Performance (Art. 6(1)(b)):',
                                        )}
                                    </strong>{' '}
                                    {t(
                                        'To provide you with our language learning services',
                                    )}
                                </li>
                                <li>
                                    <strong>
                                        {t(
                                            'Legitimate Interests (Art. 6(1)(f)):',
                                        )}
                                    </strong>{' '}
                                    {t(
                                        'To improve our services, ensure security, and prevent fraud',
                                    )}
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                {t('4. Types of Cookies and Their Purpose')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">
                                    {t('4.1 Necessary Cookies')}
                                </h3>
                                <p className="text-gray-700">
                                    {t(
                                        'These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility. These cookies cannot be disabled.',
                                    )}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    <strong>{t('Examples:')}</strong>{' '}
                                    {t(
                                        'Session cookies for authentication, CSRF tokens for security',
                                    )}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">
                                    {t('4.2 Functional Cookies')}
                                </h3>
                                <p className="text-gray-700">
                                    {t(
                                        'These cookies allow the website to remember your preferences and provide enhanced features, such as saving your training progress and language settings.',
                                    )}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    <strong>{t('Examples:')}</strong>{' '}
                                    {t(
                                        'LocalStorage for training progress, user preferences',
                                    )}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">
                                    {t('4.3 Analytics Cookies')}
                                </h3>
                                <p className="text-gray-700">
                                    {t(
                                        'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
                                    )}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    <strong>{t('Provider:')}</strong> Google LLC
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>{t('Service:')}</strong> Google
                                    Analytics
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>{t('Privacy Policy:')}</strong>{' '}
                                    <a
                                        href="https://policies.google.com/privacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        https://policies.google.com/privacy
                                    </a>
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>{t('Data Type:')}</strong>{' '}
                                    {t(
                                        'Anonymous statistical data (IP addresses are anonymized)',
                                    )}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>{t('Retention:')}</strong>{' '}
                                    {t(
                                        'According to Google Analytics privacy policy',
                                    )}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">
                                    {t('4.4 Marketing Cookies')}
                                </h3>
                                <p className="text-gray-700">
                                    {t(
                                        'These cookies are used to deliver personalized advertisements. Currently, we do not use marketing cookies, but this section is reserved for future use.',
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                {t('5. Your Rights (GDPR Art. 15-22)')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                {t(
                                    'Under the General Data Protection Regulation (GDPR), you have the following rights:',
                                )}
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                <li>
                                    <strong>
                                        {t('Right of Access (Art. 15):')}
                                    </strong>{' '}
                                    {t(
                                        'You have the right to request copies of your personal data.',
                                    )}
                                </li>
                                <li>
                                    <strong>
                                        {t('Right to Rectification (Art. 16):')}
                                    </strong>{' '}
                                    {t(
                                        'You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.',
                                    )}
                                </li>
                                <li>
                                    <strong>
                                        {t('Right to Erasure (Art. 17):')}
                                    </strong>{' '}
                                    {t(
                                        'You have the right to request that we erase your personal data, under certain conditions.',
                                    )}
                                </li>
                                <li>
                                    <strong>
                                        {t(
                                            'Right to Restrict Processing (Art. 18):',
                                        )}
                                    </strong>{' '}
                                    {t(
                                        'You have the right to request that we restrict the processing of your personal data, under certain conditions.',
                                    )}
                                </li>
                                <li>
                                    <strong>
                                        {t(
                                            'Right to Data Portability (Art. 20):',
                                        )}
                                    </strong>{' '}
                                    {t(
                                        'You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.',
                                    )}
                                </li>
                                <li>
                                    <strong>
                                        {t('Right to Object (Art. 21):')}
                                    </strong>{' '}
                                    {t(
                                        'You have the right to object to our processing of your personal data, under certain conditions.',
                                    )}
                                </li>
                            </ul>
                            <p className="text-gray-700 mt-4">
                                {t(
                                    'To exercise any of these rights, please contact us using the contact information provided in this policy.',
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>{t('6. Data Storage')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                {t(
                                    'We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.',
                                )}
                            </p>
                            <p className="text-gray-700">
                                {t(
                                    'When we no longer need your personal data, we will securely delete or anonymize it.',
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                {t('7. Data Sharing with Third Parties')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                {t(
                                    'We do not sell, trade, or rent your personal data to third parties. We may share your data only in the following circumstances:',
                                )}
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                <li>
                                    {t(
                                        'With your explicit consent (e.g., Google Analytics)',
                                    )}
                                </li>
                                <li>
                                    {t(
                                        'To comply with legal obligations or respond to lawful requests',
                                    )}
                                </li>
                                <li>
                                    {t(
                                        'To protect our rights, privacy, safety, or property',
                                    )}
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>{t('8. Data Security')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                {t(
                                    'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.',
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                {t('9. Changes to This Privacy Policy')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                {t(
                                    'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.',
                                )}
                            </p>
                            <p className="text-gray-700">
                                {t(
                                    'If we make material changes to this policy, we will request your consent again for cookie usage if required by law.',
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                {t('10. Contact Information')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                {t(
                                    'If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us.',
                                )}
                            </p>
                            <p className="text-gray-700">
                                {t(
                                    'You also have the right to lodge a complaint with a supervisory authority if you believe that our processing of your personal data violates applicable data protection laws.',
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    {consent?.given && (
                        <div className="mt-8 pt-8 border-t">
                            <div className="text-center">
                                <p className="text-sm text-gray-700 mb-2">
                                    {t(
                                        'You can withdraw your cookie consent at any time. ',
                                    )}
                                    <span
                                        onClick={() =>
                                            setShowWithdrawDialog(true)
                                        }
                                        className="underline hover:text-gray-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        {t('Withdraw consent')}.
                                    </span>
                                </p>
                                {/* <button
                                    onClick={() => setShowWithdrawDialog(true)}
                                    disabled={withdrawing}
                                    className="text-gray-600 underline hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {withdrawing
                                        ? t('Withdrawing...')
                                        : t('Withdraw Consent')}
                                </button> */}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog
                open={showWithdrawDialog}
                onOpenChange={setShowWithdrawDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t('Withdraw Cookie Consent')}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'Are you sure you want to withdraw your consent for cookies? This will disable functional and analytics cookies. Necessary cookies will remain enabled as they are required for the website to function.',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-row justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowWithdrawDialog(false)}
                            disabled={withdrawing}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleWithdraw}
                            disabled={withdrawing}
                        >
                            {withdrawing
                                ? t('Withdrawing...')
                                : t('Withdraw Consent')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
