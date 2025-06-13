import { useState } from "react";
import { Menu } from "lucide-react"; // Icona per il menu

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative  p-4 ">
      {/* Sfondo */}
      <div className="absolute inset-0"></div>

      <div className="relative container mx-auto flex items-center justify-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <a href="https://www.baariafilmfestival.com/">
            {/* Logo Desktop */}
            <img
              src="https://www.baariafilmfestival.com/wp-content/uploads/2024/10/cropped-BAARIA_FILM_FESTIVAL-removebg-preview.png"
              alt="Baarìa Film Festival"
              className="hidden md:block h-32"
            />
            {/* Logo Mobile */}
            <img
              src="https://www.baariafilmfestival.com/wp-content/uploads/2024/10/cropped-BAARIA_FILM_FESTIVAL-removebg-preview.png"
              alt="Baarìa Film Festival"
              className="block md:hidden h-12"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
