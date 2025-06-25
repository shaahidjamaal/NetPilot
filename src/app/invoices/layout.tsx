
export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-8 md:p-12 print:p-0">
      <div className="mx-auto max-w-4xl">
        {children}
      </div>
    </main>
  );
}
