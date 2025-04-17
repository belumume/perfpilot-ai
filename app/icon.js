import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // This uses the SVG from our public logo
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer circular track (performance meter) */}
          <path d="M21 4C11.0589 4 3 12.0589 3 22C3 31.9411 11.0589 40 21 40C30.9411 40 39 31.9411 39 22C39 12.0589 30.9411 4 21 4Z" stroke="url(#gradient1)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 4"/>
          
          {/* Speed arc (primary brand element) */}
          <path d="M21 4C30.9411 4 39 12.0589 39 22" stroke="url(#gradient2)" strokeWidth="3" strokeLinecap="round"/>
          
          {/* Center circular hub */}
          <circle cx="21" cy="22" r="6" fill="url(#gradient3)"/>
          
          {/* Dynamic speed indicator/needle */}
          <path d="M21 22L33 10" stroke="url(#gradient4)" strokeWidth="2.5" strokeLinecap="round"/>
          
          {/* Data point accents */}
          <circle cx="33" cy="10" r="2.5" fill="#5EEAD4"/>
          <circle cx="8" cy="22" r="2" fill="#34D399" opacity="0.8"/>
          <circle cx="21" cy="5" r="1.5" fill="#2DD4BF" opacity="0.9"/>
          
          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="3" y1="22" x2="39" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#1E293B"/>
              <stop offset="1" stopColor="#475569"/>
            </linearGradient>
            <linearGradient id="gradient2" x1="21" y1="4" x2="39" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#22D3EE"/>
              <stop offset="1" stopColor="#2563EB"/>
            </linearGradient>
            <linearGradient id="gradient3" x1="15" y1="18" x2="27" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#0EA5E9"/>
              <stop offset="1" stopColor="#3B82F6"/>
            </linearGradient>
            <linearGradient id="gradient4" x1="21" y1="22" x2="33" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#0EA5E9"/>
              <stop offset="1" stopColor="#5EEAD4"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
} 