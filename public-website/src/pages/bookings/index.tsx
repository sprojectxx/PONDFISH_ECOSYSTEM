import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function BookingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/booking');
  }, [router]);

  return null;
}
