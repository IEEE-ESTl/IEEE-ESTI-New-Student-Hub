import image_a from '@/assets/image-home-1.webp';
import image_b from '@/assets/eventos/tallerGit.jpeg';
import image_c from '@/assets/eventos/tallerSql.jpeg';
import JoinForm from './JoinForm';
import BoxReveal from '@/components/magicui/box-reveal';
import { useNavigate } from 'react-router-dom';


export const Inicio = () => {
  
  const navigate = useNavigate();

  const disabled = false;

  return (
    <section className="flex flex-row items-center justify-center space-x-20" id="home">
      <div className="flex flex-col">
        <BoxReveal boxColor={'#0371a4'} duration={0.3}>
          <h1 className="text-5xl lg:text-7xl font-bold text-[#0371a4] text-center font-bebas">
            IEEE - ESTl Student Branch
          </h1>
        </BoxReveal>

        <BoxReveal boxColor={'#0371a4'} duration={0.4}>
          <p className="text-lg lg:text-lg text-center lg:text-left mt-4 max-w-2xl whitespace-normal break-words px-6 lg:px-0 text-black font-jetbrains">
            Somos un grupo de estudiantes apasionados por el saber. Nuestro objetivo es fomentar el conocimiento técnico, la colaboración y la innovación.
          </p>
        </BoxReveal>


          <div className="flex flex-row gap-6 lg:gap-10 mt-6 items-center justify-center lg:justify-start">
            <BoxReveal boxColor={'#0371a4'} duration={0.5}>
              <JoinForm text='Unirse' disable={disabled} className={`${disabled  ? 'bg-[#c4cdd1] text-[#9ca9b5]' : 'bg-[#0371a4] text-white transition-all duration-500 hover:scale-90'}  py-4 px-6 rounded-[1.5rem] font-semibold  font-jetbrains`}/>    
            </BoxReveal>
            <BoxReveal boxColor={'#0371a4'} duration={0.5}>
              <button className="py-4 px-6 border-[#0371a4] border-[3px] rounded-[1.5rem] font-semibold text-[#0371a4] font-jetbrains transition-all duration-500 hover:scale-90 hover:bg-[#0371a4] hover:text-white" onClick={() => navigate('/miembros')}>
                Miembros
              </button>
            </BoxReveal>

          </div>

      </div>

      <div className="hidden lg:flex flex-col gap-y-4">
        <BoxReveal boxColor={'#0371a4'} duration={0.6}>
          <img src={image_a} className='w-[31rem] h-40 object-cover rounded-xl hover:scale-90 hover:rotate-2 transition-all duration-300 cursor-pointer' />
        </BoxReveal>


        <div className='flex flex-row gap-4 '>
          <BoxReveal boxColor={'#0371a4'} duration={0.7}>
            <img src={image_b} className='w-[15rem] h-40 object-cover rounded-xl hover:scale-90 hover:-rotate-2 transition-all duration-300 cursor-pointer' />
          </BoxReveal>
          <BoxReveal boxColor={'#0371a4'} duration={0.8}>
            <img src={image_c} className='w-[15rem] h-40 object-cover rounded-xl hover:scale-90 hover:rotate-2 transition-all duration-300 cursor-pointer'  />
          </BoxReveal>
        </div>
      </div>
    </section>
  )
}
