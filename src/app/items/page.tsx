'use client';

export default function ItemsPage() {
  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-riot-gray border-t border-gray-700 z-50">
        <div className="flex">
          <button className="flex-1 py-3 text-center text-gray-400">
            <div className="text-lg">🏆</div>
            <div className="text-xs">Champions</div>
          </button>
          <button className="flex-1 py-3 text-center bg-riot-blue text-white">
            <div className="text-lg">⚔️</div>
            <div className="text-xs">Items</div>
          </button>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-riot-gray shadow-lg sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold">LoL Items</h1>
            <button className="px-3 py-1 border border-green-600 text-white rounded-full text-xs hover:bg-green-600/10 transition-colors">
              🔄 Sync
            </button>
          </div>
          <input
            type="text"
            placeholder="Search items..."
            className="w-full px-4 py-2 bg-riot-dark border border-gray-600 rounded-full text-riot-gold placeholder-gray-400 focus:outline-none focus:border-riot-blue"
          />
        </div>
      </header>

      {/* Content */}
      <main className="pb-20">
        <div className="px-4 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <h2 className="text-xl font-bold mb-2">Items Coming Soon</h2>
            <p className="text-gray-400 mb-6">
              We're working on bringing you a comprehensive items database.
            </p>
            <div className="bg-riot-gray rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-riot-blue">Planned Features:</h3>
              <ul className="text-sm text-gray-300 space-y-1 text-left">
                <li>• Complete items database</li>
                <li>• Item builds and recommendations</li>
                <li>• Search and filter functionality</li>
                <li>• Item stats and descriptions</li>
                <li>• Build paths visualization</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}