import React from 'react';
import { PassiveSkills } from '../../services/characterService';

interface PassiveTreeViewerProps {
  passiveData: PassiveSkills;
  characterClass: number;
  ascendancyClass: number;
}

const PassiveTreeViewer: React.FC<PassiveTreeViewerProps> = ({ 
  passiveData,
  characterClass,
  ascendancyClass
}) => {
  // Create the URL for the official passive tree viewer with the passive data
  const buildPassiveTreeUrl = () => {
    // Base URL for the passive tree
    let url = 'https://www.pathofexile.com/fullscreen-passive-skill-tree/alternate/';
    
    // Add class identifier
    const classIdentifiers = [
      'AAAABAA', // Scion
      'AAAABAE', // Marauder
      'AAAABAQ', // Ranger
      'AAAABAU', // Witch
      'AAAABAI', // Duelist
      'AAAABAM', // Templar
      'AAAABAA', // Shadow
    ];
    
    // Default to Scion if class is not in range
    const classId = characterClass >= 0 && characterClass < classIdentifiers.length 
      ? classIdentifiers[characterClass] 
      : classIdentifiers[0];
    
    url += classId;
    
    // Add passive skill points as a query parameter
    if (passiveData && passiveData.hashes && passiveData.hashes.length > 0) {
      url += '?hashes=' + passiveData.hashes.join(',');
      
      // Add jewels if available
      if (passiveData.jewels && Object.keys(passiveData.jewels).length > 0) {
        url += '&jewels=' + encodeURIComponent(JSON.stringify(passiveData.jewels));
      }
    }
    
    return url;
  };
  
  const passiveTreeUrl = buildPassiveTreeUrl();
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">Passive Skill Tree</h3>
      
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        <div className="p-4">
          <p className="text-white mb-4">
            This character has allocated {passiveData.hashes.length} passive skill points.
          </p>
          
          <div className="flex flex-col space-y-2">
            <a 
              href={passiveTreeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
            >
              View Full Passive Tree
            </a>
            
            <div className="text-gray-400 text-sm text-center">
              Opens the official Path of Exile passive tree viewer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassiveTreeViewer;
