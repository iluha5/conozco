'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password || !adminPassword) {
            toast({
                title: 'Ошибка',
                description: 'Заполните все обязательные поля',
                variant: 'destructive',
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: 'Ошибка',
                description: 'Пароль должен содержать минимум 6 символов',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    name: name || undefined,
                    adminPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: 'Ошибка регистрации',
                    description:
                        data.error || 'Не удалось создать пользователя',
                    variant: 'destructive',
                });
                return;
            }

            toast({
                title: 'Успешно',
                description: 'Пользователь создан. Можете войти в систему.',
            });

            router.push('/auth/login');
        } catch (error) {
            console.error('Registration error:', error);
            toast({
                title: 'Ошибка',
                description: 'Произошла ошибка при регистрации',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Регистрация
                    </CardTitle>
                    <CardDescription className="text-center">
                        Только администратор может создавать новых пользователей
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                            Для регистрации требуется пароль администратора
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Email *
                            </label>
                            <Input
                                type="email"
                                placeholder="user@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Имя (опционально)
                            </label>
                            <Input
                                type="text"
                                placeholder="Иван Иванов"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Пароль *
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-500">
                                Минимум 6 символов
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-orange-600">
                                Пароль администратора *
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={adminPassword}
                                onChange={e => setAdminPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Создание...
                                </>
                            ) : (
                                'Создать пользователя'
                            )}
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            Уже есть аккаунт?{' '}
                            <Link
                                href="/auth/login"
                                className="text-blue-600 hover:underline"
                            >
                                Войти
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
