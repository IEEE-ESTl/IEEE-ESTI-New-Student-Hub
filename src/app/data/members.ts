// src/app/data/members.ts
import paulo from '@/assets/memberImages/paulo.webp';
import mario from '@/assets/memberImages/mario.webp';
import abdiel from '@/assets/memberImages/abdiel.webp';
import ivan from '@/assets/memberImages/ivan.webp';

export const members = [
    {
        name: 'Mario Lozano',
        date: 'Miembro desde 2024',
        image: mario,
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
        name: 'Ivan Rojo',
        date: 'Miembro desde 2024',
        image: ivan,
        badges: [
            {
                name: 'Diseñador',
                description: 'Diseñador de la rama',
                icon: 'brush',
                color: 'bg-black',
                iconColor: 'text-white',
            }
        ]
    }
]