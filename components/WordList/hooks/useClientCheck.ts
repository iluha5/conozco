import { useState, useEffect } from 'react';

export function useClientCheck() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return { isClient };
}
