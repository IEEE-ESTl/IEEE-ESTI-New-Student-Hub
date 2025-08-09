import johan from '@/assets/memberImages/johan.webp';
import erick from '@/assets/memberImages/ErickMedelGalindo.webp';
import valeri from '@/assets/memberImages/valeri.webp';

export const exMembers = [
    {
        name: 'Erick Medel',
        date: 'Fue miembro desde 2023 hasta 2024',
        image: erick,
        badges: [
            {
                name: 'Fundador',
                description: 'Fue el fundador de la rama en 2023',
                icon: 'ieeeWhite',
                color: 'bg-gradient-to-r from-amber-400 to-orange-500',
                iconColor: 'text-white',
            },
            {
                name: 'Presidente',
                description: 'Fue presidente de la rama',
                icon: 'ieee',
                color: 'bg-white',
                iconColor: 'text-white',
            }
        ]
    },
    {
        name: 'Johan González',
        date: 'Fue miembro desde 2023 hasta 2025',
        image: johan,
        badges: [
            {
                name: 'Presidente',
                description: 'Fue presidente de la rama',
                icon: 'ieee',
                color: 'bg-white',
                iconColor: 'text-white',
            },
            {
                name: 'Tesorero',
                description: 'Fue tesorero de la rama',
                icon: 'handCoins',
                color: 'bg-black',
                iconColor: 'text-white',
            }
        ]
    },
    {
        name: 'Valeri Marmolejo',
        date: 'Fue miembro desde 2024 hasta 2025',
        image: valeri,
        badges: [
            {
                name: 'Marketing',
                description: 'Fue la encargada de promocionar la comunidad y sus actividades',
                icon: 'marketing',
                color: 'bg-black',
                iconColor: 'text-white',
            }
        ]
    }
]