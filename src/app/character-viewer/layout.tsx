import React from 'react';

export const metadata = {
  title: 'Character Viewer - Path of Exile',
  description: 'View Path of Exile character equipment and passive tree',
};

export default function CharacterViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  );
}
