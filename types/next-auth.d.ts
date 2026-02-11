import { RegistrationMethod } from '@prisma/client';

declare module 'next-auth' {
    // eslint-disable-next-line no-unused-vars
    interface User {
        role?: string;
        emailVerified?: Date | null;
        registrationMethod?: RegistrationMethod;
        passwordChangedAt?: Date | null;
    }

    // eslint-disable-next-line no-unused-vars
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            image?: string | null;
            role: string;
            emailVerified?: Date | null;
            registrationMethod?: string;
        };
    }
}

declare module 'next-auth/jwt' {
    // eslint-disable-next-line no-unused-vars
    interface JWT {
        role?: string;
        id?: string;
        image?: string | null;
        emailVerified?: Date | null;
        registrationMethod?: string;
        passwordChangedAt?: Date | string | null;
    }
}
