// src/app/data/members.ts
import paulo from '@/assets/memberImages/paulo.webp';
import martin from '@/assets/memberImages/martin.webp';
import abdiel from '@/assets/memberImages/abdiel.webp';
import ivan from '@/assets/memberImages/ivan.webp';
import malkhi from '@/assets/memberImages/malkhi.webp';
import { date } from 'zod';

export const members = [
    {
        name: 'Ivan Rojo',
        date: 'Miembro desde 2024',
        image: ivan,
        badges: [
            {
                name: 'Presidente',
                description: 'Presidente de la rama',
                icon: 'ieee',
                color: 'bg-white',
                iconColor: 'text-white',
            }
        ]
    },
    {
        name: 'Paulo Mantilla',
        date: 'Miembro desde 2024',
        image: paulo,
        badges: [
            {
                name: 'Vicepresidente',
                description: 'Vicepresidente de la rama',
                icon: 'ieee',
                color: 'bg-white',
                iconColor: 'text-white',
            },
            {
                name: 'Desarrollador',
                description: 'Desarrollador de la rama',
                icon: 'terminal',
                color: 'bg-black',
                iconColor: 'text-white',
            }
        ]
    },
    {
        name: 'Abdiel Ávila',
        date: 'Miembro desde 2024',
        image: abdiel,
        badges: [
            {
                name: 'Web Master',
                description: 'Web Master de la rama',
                icon: 'terminal',
                color: 'bg-black',
                iconColor: 'text-white',
            }
        ]
    },
    {
        name: 'Malkhi Lopéz',
        date: 'Miembro desde 2025',
        image: malkhi,
        badges: [
            {
                name: 'Diseñadora',
                description: 'Diseñadora de la rama',
                icon: 'brush',
                color: 'bg-black',
                iconColor: 'text-white',
            }
        ]
    },
    {
        name: 'Martín Hernández',
        date: 'Miembro desde 2025',
        image: martin,
        badges: [
            {
                name: 'Secretario',
                description: 'Encargado de la administración y organización de la rama',
                icon: 'secretary',
                color: 'bg-black',
                iconColor: 'text-white',
            }
        ]
    },
]