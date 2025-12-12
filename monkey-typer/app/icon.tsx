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
            // ImageResponse JSX element
            <div
                style={{
                    background: '#fab115ff', // Nice vivid yellow (yellow-400)
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '20%',
                }}
            >
                <div
                    style={{
                        fontSize: 26,
                        fontWeight: 900,
                        color: 'white',
                        // Simulating text stroke/outline
                        textShadow: `
                            -2px -2px 0 #000,
                             2px -2px 0 #000,
                            -2px  2px 0 #000,
                             2px  2px 0 #000,
                            -2px  0   0 #000,
                             2px  0   0 #000,
                             0   -2px 0 #000,
                             0    2px 0 #000
                        `
                    }}
                >
                    D
                </div>
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported icons size metadata
            // config to also set the ImageResponse's width and height.
            ...size,
        }
    )
}
