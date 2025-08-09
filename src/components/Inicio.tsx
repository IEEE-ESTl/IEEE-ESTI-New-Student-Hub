import Image from "next/image";
import image_a from '@/assets/image-home-1.webp';
import image_b from '@/assets/tallerGit.webp';
import image_c from '@/assets/tallerSql.webp';
import { bebasNeue, jetBrainsMono } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import JoinDialog from "./JoinDialog";
import Link from "next/link";

export const Inicio = () => {
    return (
        <section className="min-h-screen flex items-center justify-center px-4 py-8 lg:py-0" id="home">
            <div className="w-full max-w-7xl mx-auto">
                {/* Layout para desktop */}
                <div className="hidden lg:flex lg:items-center lg:justify-center lg:space-x-20">
                    {/* Contenido de texto */}
                    <div className="flex flex-col items-center justify-center flex-1 max-w-2xl">
                        <h1 className={`${bebasNeue.className} text-5xl xl:text-7xl font-bold text-[#0371a4] text-center`}>
                            IEEE - ESTl Student Branch
                        </h1>
                        
                        <p className={`${jetBrainsMono.className} text-lg text-center mt-4 whitespace-normal break-words text-black`}>
                            Somos un grupo de estudiantes apasionados por el saber. Nuestro objetivo es fomentar el conocimiento técnico, la colaboración y la innovación.
                        </p>
                        
                        <div className="flex flex-row gap-6 mt-6 items-center justify-center">
                            <JoinDialog>
                                <Button className="bg-[#0371a4] text-white hover:bg-[#0371a4]/80 rounded-full py-4 px-6 cursor-pointer">
                                    Unirse
                                </Button>
                            </JoinDialog>
                            <Link href="/members">
                                <Button className="bg-[#0371a4] text-white hover:bg-[#0371a4]/80 rounded-full py-4 px-6 cursor-pointer">
                                    Miembros
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Grid de imágenes para desktop */}
                    <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-shrink-0">
                        <div className="col-span-2">
                            <img 
                                src={image_a.src} 
                                alt="image-home-1" 
                                className="object-cover w-[32rem] h-40 rounded-xl shadow-lg"
                            />
                        </div>
                        <div className="row-start-2">
                            <img 
                                src={image_b.src} 
                                alt="tallerGit" 
                                className="w-[15.5rem] h-32 object-cover rounded-xl shadow-lg" 
                            />
                        </div>
                        <div className="row-start-2">
                            <img 
                                src={image_c.src} 
                                alt="tallerSql" 
                                className="w-[15.5rem] h-32 object-cover rounded-xl shadow-lg" 
                            />
                        </div>
                    </div>
                </div>

                {/* Layout para mobile y tablet */}
                <div className="lg:hidden flex flex-col items-center justify-center space-y-8 mt-20">
                    {/* Contenido de texto */}
                    <div className="flex flex-col items-center justify-center text-center">
                        <h1 className={`${bebasNeue.className} text-4xl sm:text-5xl md:text-6xl font-bold text-[#0371a4] text-center px-4`}>
                            IEEE - ESTl Student Branch
                        </h1>
                        
                        <p className={`${jetBrainsMono.className} text-base sm:text-lg text-center mt-4 px-6 max-w-xl whitespace-normal break-words text-black`}>
                            Somos un grupo de estudiantes apasionados por el saber. Nuestro objetivo es fomentar el conocimiento técnico, la colaboración y la innovación.
                        </p>
                        
                        <div className="flex flex-row sm:flex-row gap-4 sm:gap-6 mt-6 items-center justify-center w-full px-6">
                            <JoinDialog>
                                <Button className="bg-[#0371a4] text-white hover:bg-[#0371a4]/80 rounded-full py-4 px-6 cursor-pointer">
                                    Unirse
                                </Button>
                            </JoinDialog>
                            <Link href="/members">
                                <Button className="bg-[#0371a4] text-white hover:bg-[#0371a4]/80 rounded-full py-4 px-6 cursor-pointer sm:w-auto">
                                    Miembros
                                </Button>
                            </Link> 
                        </div>
                    </div>

                    {/* Grid de imágenes para mobile/tablet */}
                    <div className="w-full px-4">
                        {/* Imagen principal */}
                        <div className="mb-4">
                            <img 
                                src={image_a.src} 
                                alt="image-home-1" 
                                className="object-cover w-full h-48 sm:h-56 rounded-xl shadow-lg"
                            />
                        </div>
                        
                        {/* Imágenes secundarias */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <img 
                                src={image_b.src} 
                                alt="tallerGit" 
                                className="w-full h-40 sm:h-32 object-cover rounded-xl shadow-lg" 
                            />
                            <img 
                                src={image_c.src} 
                                alt="tallerSql" 
                                className="w-full h-40 sm:h-32 object-cover rounded-xl shadow-lg" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}