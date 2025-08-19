export function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm">
            © {currentYear} FibreFlow. All rights reserved.
          </div>
          <div className="mt-2 md:mt-0 text-sm text-gray-400">
            Migrated to React with ❤️
          </div>
        </div>
      </div>
    </footer>
  )
}