import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OffersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/discounts');
  }, [router]);

  return null;
}
