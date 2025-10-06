import { Instagram, Github, Linkedin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from '@/assets/logo.png';
import { montserrat } from '@/lib/fonts';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 mt-3 mb-3">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <Image src={logo} alt="logo" width={100} height={100} priority />
                        </Link>

                    </div>
                    {/* Navigation Links */}
                    <div className="hidden md:block flex-grow">
                        <div className="flex items-center justify-center space-x-4">
                            <Link href={'/#home'} className={`${montserrat.className} text-black hover:scale-110 hover:text-[#035b98] px-3 py-2 rounded-md text-md font-medium transition-all duration-300`}>
                                INICIO
                            </Link>

                            
                            <Link href={'/#events'} className={`${montserrat.className} text-black hover:scale-110 hover:text-[#035b98] px-3 py-2 rounded-md text-md font-medium transition-all duration-300`}>
                                EVENTOS
                            </Link>
                            
                            
                            {/* <Link href={'/#coming-soon'} className={`${montserrat.className} text-black hover:scale-110 hover:text-[#035b98] px-3 py-2 rounded-md text-md font-medium transition-all duration-300`}>
                                PRÓXIMAMENTE
                            </Link> */}
                            
                            
                            <Link href={'/#join'} className={`${montserrat.className} text-black hover:scale-110 hover:text-[#035b98] px-3 py-2 rounded-md text-md font-medium transition-all duration-300`}>
                                ÚNETE
                            </Link>

                            <Link href={'/#faq'} className={`${montserrat.className} text-black hover:scale-110 hover:text-[#035b98] px-3 py-2 rounded-md text-md font-medium transition-all duration-300`}>
                                FAQ
                            </Link>
                        </div>
                    </div>

                    {/* Social Media Icons */}
                    <div className="flex items-center space-x-3">
                        <Link href={'https://www.instagram.com/ieee-estl'} target="_blank" className="text-black hover:-translate-y-1 px-2 py-1 transition-all duration-300">
                            <Instagram size={20}/>
                        </Link>
                        <Link href={'https://www.linkedin.com/company/ieee-estl'} target="_blank" className="text-black hover:-translate-y-1 px-2 py-1 transition-all duration-300">
                            <Linkedin size={20}/>
                        </Link>
                        <Link href={'https://github.com/IEEE-ESTl/IEEE-ESTl-Student-Web-Hub'} target="_blank" className="text-black hover:-translate-y-1 px-2 py-1 transition-all duration-300">
                            <Github size={20}/>
                        </Link>

                    </div>

                </div>
            </div>
        </nav>
    )
}