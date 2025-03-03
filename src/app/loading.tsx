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
        <h1 className="text-3xl font-bold mb-2 text-center text-[#af6025]" style={{ textShadow: '0 0 10px rgba(175, 96, 37, 0.5)' }}>Path of Exile Item Search</h1>
        <p className="text-center text-[#a38d6d] mb-6">Check real-time prices for items in the Path of Exile Phrecia league</p>
        
        <div className="mb-8">
          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-[#3d3d3d]" style={{ 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="w-full mb-4">
              <div className="block text-[#af6025] mb-2 font-medium">
                Paste your item text here:
              </div>
              <div className="w-full h-32 bg-[#0c0c0e] rounded border border-[#3d3d3d] animate-pulse"></div>
            </div>
            
            <div className="flex justify-center mt-4">
              <div className="w-24 h-10 bg-[#1a1a1a] rounded border border-[#3d3d3d] animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="mb-4 p-4 bg-[#1a1a1a] text-[#a38d6d] rounded-lg border border-[#3d3d3d]">
          <p className="text-[#af6025]">This tool is designed to check prices for equipment items on the trade market.</p>
          <p className="mt-1 text-[#7f7f7f]">
            For currency exchange rates, check our <a href="/currency" className="text-[#af6025] hover:underline">Currency Exchange</a> page or 
            speak with Faustus, the Financier (Currency Exchange) in your hideout.
          </p>
          <p className="mt-1 text-[#7f7f7f]">
            For more detailed searches, visit the <a href="https://www.pathofexile.com/trade" target="_blank" rel="noopener noreferrer" className="text-[#af6025] hover:underline">official Path of Exile trade site</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
