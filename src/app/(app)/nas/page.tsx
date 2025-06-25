
"use client"

import { redirect, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function Redirector() {
    const searchParams = useSearchParams();
    
    useEffect(() => {
        // We use useEffect to redirect on the client side to avoid build errors with useSearchParams
        redirect('/settings?tab=nas');
    }, [searchParams])

    return null;
}

export default function OldNasPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <Redirector />
    </Suspense>
  )
}
