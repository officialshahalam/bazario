'use client';
import Image from "next/image";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();

  return (
    <div className="bg-[#115061] h-[85vh] flex flex-col justify-center w-full">
      <div className="md:w-[80%] w-[90%] m-auto md:flex h-full items-center">
        <div className="md:w-1/2">
          <p className="font-Roboto font-normal text-white pb-2 text-xl">
            Starting from 40$
          </p>
          <h1 className="text-white text-6xl font-extrabold font-Roboto">
            The best watch <br />
            Collection 2025
          </h1>
          <p className="font-Oregano text-3xl pt-4 text-white">
            Exclusive offer <span className="text-yellow-400">10%</span> this
            week
          </p>
          <br />
          <button
            onClick={() => router.push("/products")}
            className="w-[140px] gap-2 font-semibold h-[40px] hover:text-gray-400 bg-white text-[#115061] px-4 py-2 rounded-md flex items-center justify-center transition"
          >
            Shop Now <MoveRight size={18} className="ml-1" />
          </button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="https://static.vecteezy.com/system/resources/thumbnails/050/177/034/small_2x/smart-watch-isolated-on-transparent-background-png.png"
            alt="Watch collection"
            width={450}
            height={450}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
