export default function Header() {

  return (
    <header className="relative p-4">
      <div className="absolute inset-0"></div>
      <div className="relative container mx-auto flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <a href="https://www.baariafilmfestival.com/">
            <img
              src="https://www.baariafilmfestival.com/wp-content/uploads/2025/06/LOGO_BFF_NERO.png"
              alt="Baarìa Film Festival"
              className="hidden md:block h-32"
            />
            <img
              src="https://www.baariafilmfestival.com/wp-content/uploads/2025/06/LOGO_BFF_NERO.png"
              alt="Baarìa Film Festival"
              className="block md:hidden h-24"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
