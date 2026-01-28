import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/o-mnie', label: 'O Mnie' },
  { href: '/jak-pomagam', label: 'Jak Pomagam' },
  { href: '/oferta', label: 'Dla Kogo?' },
  { href: '/psychoterapia-dda', label: 'DDA' },
  { href: '/konsultacje-online', label: 'Online' },
  { href: '/kontakt', label: 'Kontakt' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex items-center">
      {/* Desktop Navigation */}
      <ul className="hidden md:flex items-center space-x-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={cn(
                'inline-flex items-center px-3 py-2 text-sm font-medium font-serif',
                'text-muted-foreground hover:text-foreground',
                'transition-colors'
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] sm:w-[350px]">
          <div className="flex flex-col space-y-4 mt-8">
            <a
              href="/"
              onClick={() => setIsOpen(false)}
              className="mb-4"
            >
              <img src="/images/logo.svg" alt="Pracownia Myśli" className="h-10 w-auto" />
            </a>
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'px-3 py-3 text-base font-medium font-serif',
                    'text-muted-foreground hover:text-foreground',
                    'transition-colors'
                  )}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
