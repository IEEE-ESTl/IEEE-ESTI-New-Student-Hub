"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, User, X } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { BlurFade } from "./magicui/blur-fade"
import { bebasNeue, jetBrainsMono, montserrat } from "@/lib/fonts";
import { eventos, type Evento } from "@/app/data/events";


export default function Events() {
    const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const openModal = (event: Evento) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
        // Retraso que permite que el modal se muestre animado
        setTimeout(() => {
            setIsAnimating(true);
        }, 10);
    }

    const closeModal = () => {
        setIsAnimating(false);
        setIsClosing(true);
        setTimeout(() => {
            setSelectedEvent(null);
            setIsModalOpen(false);
            setIsClosing(false);
        }, 300); 
    }

    // Cerrar modal con la tecla ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        if (isModalOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevenir el scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
          case 'taller':
            return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          case 'conference':
            return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          case 'hackathon':
            return 'bg-green-100 text-green-800 hover:bg-green-200'
          case 'congreso':
            return 'bg-red-100 text-red-800 hover:bg-red-200'
          case 'evento':
            return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          default:
            return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }
    }

    return (
        <section className="min-h-screen bg-white mb-10 px-4 sm:px-6 lg:px-8" id="events">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className={`${bebasNeue.className} font-bold text-[#0371a4] text-center text-7xl lg:text-8xl xl:text-9xl`}>Eventos</h1>
                </div>

                {/* Grid de eventos */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {eventos.map((event, idx) => (
                        <BlurFade 
                            delay={0.15 + idx * 0.05} 
                            inView 
                            key={event.id}
                        >
                            
                        
                        <div
                            key={event.id}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                            onClick={() => openModal(event)}
                        >
                            <div className="relative">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-48 object-cover"
                                />
                                <Badge
                                    className={`absolute top-4 left-4 ${getCategoryColor(event.category)}`}
                                >
                                    {event.category}
                                </Badge>
                            </div>

                            <div className={`${montserrat.className} p-6`}>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                                    {event.title}
                                </h3>
                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {event.description}
                                </p>
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <Calendar className="w-4 h-4 mr-2"/>
                                    <span>{event.date}</span>
                                </div>
                                <Button
                                    className="w-full bg-[#0371a4] hover:bg-[#0371a4]/80 text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openModal(event);
                                    }}
                                >
                                    Ver más
                                </Button>
                            </div>
                        </div>
                        </BlurFade>
                    ))}
                </div>

                {/* Modal de eventos */}
                {selectedEvent && (
                    <div 
                        className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300 ${
                            isAnimating && !isClosing ? 'opacity-100' : 'opacity-0'
                        }`}
                        onClick={closeModal}
                    >
                        <div 
                            className={`bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
                                isAnimating && !isClosing
                                    ? 'scale-100 opacity-100 translate-y-0' 
                                    : 'scale-95 opacity-0 translate-y-4'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative">
                                <button
                                    onClick={closeModal}
                                    className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5"/>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                                <div className="relative">
                                    <img
                                        src={selectedEvent.image}
                                        alt={selectedEvent.title}
                                        className="w-full h-64 lg:h-full object-cover lg:rounded-l-2xl"
                                    />
                                    <Badge
                                        className={`absolute top-4 left-4 ${getCategoryColor(selectedEvent.category)}`}
                                    >
                                        {selectedEvent.category}
                                    </Badge>
                                </div>

                                <div className="p-8">
                                    <h2 className={`${montserrat.className} text-3xl font-bold text-gray-900 mb-4`}>
                                        {selectedEvent.title}
                                    </h2>
                                    <p className={`${jetBrainsMono.className} text-gray-600 mb-6 leading-relaxed`}>
                                        {selectedEvent.fullDescription}
                                    </p>

                                    <div className="space-y-4 mb-8">
                                        <div className={`${montserrat.className} flex items-center text-gray-700`}>
                                            <Calendar className="w-5 h-5 mr-2 text-blue-600"/>
                                            <div>
                                                <div className="font-medium">
                                                    {selectedEvent.date}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`${montserrat.className} flex items-center text-gray-700`}>
                                            <MapPin className="w-5 h-5 mr-2 text-red-500"/>
                                            <div>
                                                <div className="font-medium">
                                                    {selectedEvent.location}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`${montserrat.className} flex items-center text-gray-700`}>
                                            <User className="w-5 h-5 mr-2 text-green-600"/>
                                            <div>
                                                <div className="font-medium">
                                                    {selectedEvent.instructor}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}