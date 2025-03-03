'use client';

import React, { useState } from 'react';
import CharacterSearch from '../../components/character/CharacterSearch';
import CharacterEquipment from '../../components/character/CharacterEquipment';
import PassiveTreeViewer from '../../components/character/PassiveTreeViewer';
import { 
  getCharacterItems, 
  getPassiveSkills, 
  CharacterEquipment as CharacterEquipmentType,
  PassiveSkills
} from '../../services/characterService';

export default function CharacterViewerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any | null>(null);
  const [equipmentData, setEquipmentData] = useState<CharacterEquipmentType | null>(null);
  const [passiveData, setPassiveData] = useState<PassiveSkills | null>(null);
  const [searchInfo, setSearchInfo] = useState<{ accountName: string; characterName: string } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleSearch = async (accountName: string, characterName: string) => {
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setEquipmentData(null);
    setPassiveData(null);
    
    try {
      console.log(`Searching for character: ${characterName} on account: ${accountName}`);
      
      // Fetch character equipment
      const equipmentResponse = await getCharacterItems(accountName, characterName);
      setEquipmentData(equipmentResponse);
      
      // Fetch passive skills
      try {
        const passiveResponse = await getPassiveSkills(accountName, characterName);
        setPassiveData(passiveResponse);
      } catch (passiveError: any) {
        console.error('Error fetching passive skills:', passiveError);
        // We don't set an error here because we still have equipment data
      }
      
      setSearchInfo({ accountName, characterName });
    } catch (error: any) {
      console.error('Error fetching character data:', error);
      
      // Store the full error details for debugging
      setErrorDetails(error);
      
      // Provide more specific error messages based on the error
      if (error.response) {
        console.log('Error response:', error.response);
        
        if (error.response.status === 403) {
          setError(`Account profile is private or there was an authentication issue. Status: ${error.response.status}`);
        } else if (error.response.status === 404) {
          setError(`Character not found. Please check the account and character names. Status: ${error.response.status}`);
        } else {
          setError(`Error from Path of Exile API: ${error.response.status} ${error.response.statusText}`);
        }
      } else if (error.request) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Failed to fetch character data: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Path of Exile Character Viewer</h1>
        
        <CharacterSearch onSearch={handleSearch} isLoading={isLoading} />
        
        {isLoading && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2">Loading character data...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            
            {errorDetails?.cloudflare && (
              <div className="mt-2 text-sm">
                <p>The Path of Exile API is protected by Cloudflare, which may be blocking our requests.</p>
                <p className="mt-1">Try the following:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>Make sure your Path of Exile profile is set to public</li>
                  <li>Try again in a few minutes</li>
                  <li>Try using a different account name format (with or without the # part)</li>
                </ul>
              </div>
            )}
            
            {errorDetails?.details && (
              <p className="mt-2 text-sm">{errorDetails.details}</p>
            )}
            
            <button 
              className="text-xs underline mt-2"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide technical details' : 'Show technical details'}
            </button>
            
            {showDetails && errorDetails && (
              <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto max-h-40">
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            )}
          </div>
        )}
        
        {equipmentData && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              {equipmentData.character.name} 
              <span className="text-gray-400 ml-2">
                Level {equipmentData.character.level} {equipmentData.character.class}
              </span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CharacterEquipment equipment={equipmentData} />
              
              {passiveData && (
                <PassiveTreeViewer 
                  passiveData={passiveData} 
                  characterClass={equipmentData.character.classId}
                  ascendancyClass={equipmentData.character.ascendancyClass}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
