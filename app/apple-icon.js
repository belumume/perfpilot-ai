import { ImageResponse } from 'next/og'

// Image metadata - Apple recommends 180x180 for apple-touch-icon
export const size = {
  width: 180,
  height: 180,
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
          background: 'linear-gradient(to bottom right, #0EA5E9, #3B82F6)',
          borderRadius: '22%',
          padding: '5%',
        }}
      >
        <svg width="90%" height="90%" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer circular track (performance meter) */}
          <path d="M21 4C11.0589 4 3 12.0589 3 22C3 31.9411 11.0589 40 21 40C30.9411 40 39 31.9411 39 22C39 12.0589 30.9411 4 21 4Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 4"/>
          
          {/* Speed arc (primary brand element) */}
          <path d="M21 4C30.9411 4 39 12.0589 39 22" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
          
          {/* Center circular hub */}
          <circle cx="21" cy="22" r="6" fill="#FFFFFF"/>
          
          {/* Dynamic speed indicator/needle */}
          <path d="M21 22L33 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
          
          {/* Data point accents */}
          <circle cx="33" cy="10" r="2.5" fill="#FFFFFF"/>
          <circle cx="8" cy="22" r="2" fill="#FFFFFF" opacity="0.8"/>
          <circle cx="21" cy="5" r="1.5" fill="#FFFFFF" opacity="0.9"/>
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
} 