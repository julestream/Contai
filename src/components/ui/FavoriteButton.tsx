'use client'
import { useFavorite } from '@/hooks/useFavorite'
import { Heart } from 'lucide-react'

export default function FavoriteButton({ artworkId }: { artworkId: string }) {
  const { isFavorited, toggleFavorite, loading } = useFavorite(artworkId)

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Heart
        size={24}
        color={isFavorited ? '#b94040' : '#999'}
        fill={isFavorited ? '#b94040' : 'none'}
      />
    </button>
  )
}
