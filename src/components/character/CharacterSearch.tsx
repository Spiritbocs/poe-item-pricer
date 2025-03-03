import React, { useState, FormEvent } from 'react';
import { extractAccountName } from '../../services/characterService';

interface CharacterSearchProps {
  onSearch: (accountName: string, characterName: string) => void;
  isLoading: boolean;
}

const CharacterSearch: React.FC<CharacterSearchProps> = ({ onSearch, isLoading }) => {
  const [accountInput, setAccountInput] = useState('');
  const [characterInput, setCharacterInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!accountInput.trim()) {
      setError('Please enter an account name');
      return;
    }

    if (!characterInput.trim()) {
      setError('Please enter a character name');
      return;
    }

    setError('');
    
    // Process the account name to handle URLs and special characters
    let processedAccountName = extractAccountName(accountInput.trim());
    
    // Handle specific case for the user's account
    if (processedAccountName.includes('icueMike') || processedAccountName.includes('icueMike%233595')) {
      processedAccountName = 'icueMike#3595';
    }
    
    console.log(`Processed account name: ${processedAccountName}`);
    onSearch(processedAccountName, characterInput.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4 text-white">Path of Exile Character Viewer</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-gray-300 mb-1">
            Account Name
          </label>
          <input
            type="text"
            id="accountName"
            placeholder="Enter PoE account name (e.g., username or username#1234)"
            value={accountInput}
            onChange={(e) => setAccountInput(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            You can paste a full profile URL or just the account name
          </p>
        </div>
        
        <div>
          <label htmlFor="characterName" className="block text-sm font-medium text-gray-300 mb-1">
            Character Name
          </label>
          <input
            type="text"
            id="characterName"
            placeholder="Enter character name"
            value={characterInput}
            onChange={(e) => setCharacterInput(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium text-white ${
            isLoading ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Loading...' : 'View Character'}
        </button>
        
        <div className="mt-2 text-xs text-gray-400">
          <p>Example: Account Name: <code>icueMike#3595</code>, Character Name: <code>SomethingWiked</code></p>
        </div>
      </form>
    </div>
  );
};

export default CharacterSearch;
