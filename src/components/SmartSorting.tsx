import React from 'react';

interface SmartSortingProps {
  sortOnlineFirst: boolean;
  hideAfk: boolean;
  hideOffline: boolean;
  hideDnd: boolean;
  onSortOnlineFirstChange: (value: boolean) => void;
  onHideAfkChange: (value: boolean) => void;
  onHideOfflineChange: (value: boolean) => void;
  onHideDndChange: (value: boolean) => void;
}

const SmartSorting: React.FC<SmartSortingProps> = ({
  sortOnlineFirst,
  hideAfk,
  hideOffline,
  hideDnd,
  onSortOnlineFirstChange,
  onHideAfkChange,
  onHideOfflineChange,
  onHideDndChange
}) => {
  return (
    <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#3d3d3d] mb-4">
      <h3 className="text-[#af6025] text-sm font-semibold mb-3">Smart Sorting</h3>
      
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-[#a38d6d] text-xs">Sort Online First</span>
          </div>
          
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={sortOnlineFirst}
              onChange={(e) => onSortOnlineFirstChange(e.target.checked)}
            />
            <div className="relative w-10 h-5 bg-[#2a2a2a] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-[#af6025] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3d3d3d]"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            <span className="text-[#a38d6d] text-xs">Hide AFK Sellers</span>
          </div>
          
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={hideAfk}
              onChange={(e) => onHideAfkChange(e.target.checked)}
            />
            <div className="relative w-10 h-5 bg-[#2a2a2a] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-[#af6025] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3d3d3d]"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            <span className="text-[#a38d6d] text-xs">Hide DnD Sellers</span>
          </div>
          
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={hideDnd}
              onChange={(e) => onHideDndChange(e.target.checked)}
            />
            <div className="relative w-10 h-5 bg-[#2a2a2a] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-[#af6025] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3d3d3d]"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
            <span className="text-[#a38d6d] text-xs">Hide Offline Sellers</span>
          </div>
          
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={hideOffline}
              onChange={(e) => onHideOfflineChange(e.target.checked)}
            />
            <div className="relative w-10 h-5 bg-[#2a2a2a] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-[#af6025] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3d3d3d]"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SmartSorting;
