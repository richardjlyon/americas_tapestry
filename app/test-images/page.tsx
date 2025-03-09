import React from 'react';
import { getAllTapestries } from '@/lib/tapestries';

export default function TestImages() {
  const tapestries = getAllTapestries();
  const eligibleTapestries = tapestries.filter(t => 
    t.status === "In Production" || t.status === "Designed"
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Image Test Page</h1>
      
      {/* Raw direct links */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Direct Image Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-4 rounded">
            <h3 className="font-bold mb-2">Georgia (Main)</h3>
            <p className="text-sm mb-2 break-all">/content/tapestries/georgia/georgia-tapestry-main.jpg</p>
            <img 
              src="/content/tapestries/georgia/georgia-tapestry-main.jpg" 
              alt="Georgia Tapestry" 
              className="w-full h-auto border"
            />
          </div>
          
          <div className="border p-4 rounded">
            <h3 className="font-bold mb-2">Georgia (Thumbnail)</h3>
            <p className="text-sm mb-2 break-all">/content/tapestries/georgia/georgia-tapestry-thumbnail.png</p>
            <img 
              src="/content/tapestries/georgia/georgia-tapestry-thumbnail.png" 
              alt="Georgia Tapestry Thumbnail" 
              className="w-full h-auto border"
            />
          </div>
          
          <div className="border p-4 rounded">
            <h3 className="font-bold mb-2">New Jersey (Main)</h3>
            <p className="text-sm mb-2 break-all">/content/tapestries/new-jersey/new-jersey-tapestry-main.jpg</p>
            <img 
              src="/content/tapestries/new-jersey/new-jersey-tapestry-main.jpg" 
              alt="New Jersey Tapestry" 
              className="w-full h-auto border"
            />
          </div>
          
          <div className="border p-4 rounded">
            <h3 className="font-bold mb-2">New York (Main)</h3>
            <p className="text-sm mb-2 break-all">/content/tapestries/new-york/new-york-tapestry-main.jpg</p>
            <img 
              src="/content/tapestries/new-york/new-york-tapestry-main.jpg" 
              alt="New York Tapestry" 
              className="w-full h-auto border"
            />
          </div>
        </div>
      </section>
      
      {/* Paths from tapestry objects */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Paths from Tapestry Objects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eligibleTapestries.map(tapestry => (
            <div key={tapestry.slug} className="border p-4 rounded">
              <h3 className="font-bold mb-2">{tapestry.title}</h3>
              
              {tapestry.imagePath ? (
                <>
                  <p className="text-sm mb-2 break-all">imagePath: {tapestry.imagePath}</p>
                  <img 
                    src={tapestry.imagePath} 
                    alt={`${tapestry.title} (Main)`} 
                    className="w-full h-auto border mb-4"
                  />
                </>
              ) : (
                <p className="text-red-500 mb-4">No image path available</p>
              )}
              
              {tapestry.thumbnail ? (
                <>
                  <p className="text-sm mb-2 break-all">thumbnail: {tapestry.thumbnail}</p>
                  <img 
                    src={tapestry.thumbnail} 
                    alt={`${tapestry.title} (Thumbnail)`} 
                    className="w-full h-auto border"
                  />
                </>
              ) : (
                <p className="text-red-500">No thumbnail available</p>
              )}
            </div>
          ))}
        </div>
      </section>
      
      {/* Debug info */}
      <section className="mt-12 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold mb-4">Debug Information</h2>
        <pre className="text-xs overflow-auto p-4 bg-gray-800 text-white rounded">
          {JSON.stringify(eligibleTapestries, null, 2)}
        </pre>
      </section>
    </div>
  );
}