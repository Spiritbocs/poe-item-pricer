import Navbar from '@/components/Navbar';

export default function Loading() {
  return (
    <div className="min-h-screen text-[#a38d6d]" style={{ 
      backgroundImage: 'linear-gradient(to bottom, #0c0c0e, #151515, #0c0c0e)',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      fontFamily: '"Fontin SmallCaps", "Fontin-SmallCaps", Verdana, Arial, Helvetica, sans-serif'
    }}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2 text-center text-[#af6025]" style={{ textShadow: '0 0 10px rgba(175, 96, 37, 0.5)' }}>
          Currency Exchange Rates
        </h1>
        <p className="text-center text-[#a38d6d] mb-6">
          Current exchange rates for Path of Exile Phrecia league
        </p>
        
        <div className="mb-6">
          <div className="bg-[#1a1a1a] p-4 rounded-lg shadow-lg border border-[#3d3d3d]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#af6025]">Currency Values</h2>
              <div className="relative">
                <div className="w-64 h-10 bg-[#0c0c0e] rounded border border-[#3d3d3d] animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#af6025]"></div>
            </div>
          </div>
        </div>
        
        <div className="mb-4 p-4 bg-[#1a1a1a] text-[#a38d6d] rounded-lg border border-[#3d3d3d]">
          <p className="text-[#af6025]">Currency Exchange Information</p>
          <p className="mt-1 text-[#7f7f7f]">
            These rates are approximate and based on player listings. Actual in-game rates may vary.
          </p>
          <p className="mt-1 text-[#7f7f7f]">
            For more detailed currency information, visit <a href="https://poe.ninja/economy/phrecia/currency" target="_blank" rel="noopener noreferrer" className="text-[#af6025] hover:underline">poe.ninja</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
