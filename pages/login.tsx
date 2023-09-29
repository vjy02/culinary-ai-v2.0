import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { FaGoogle } from 'react-icons/fa'; 
import { useEffect } from 'react'

export default function IndexPage() {
  const router = useRouter();
  const { data: session} = useSession();
  
  useEffect(() => {
    if (session && router.pathname === "/login") {
      router.push("/generator");
    } else if (!session && router.pathname !== "/" && router.pathname !== "/login") {
      router.push("/");
    }
  }, [session]);

  return (
<div className="flex flex-col items-center justify-center min-h-screen w-full space-y-8 inset-0" 
     style={{
       backgroundImage: `url('/images/loginBg.jpg')`,
       backgroundPosition: 'center',
       backgroundSize: 'cover',
       backgroundRepeat: 'no-repeat',
       margin: 0,
       padding: 0
     }}>
  <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="bg-gray-100 p-8 rounded-lg shadow-lg text-center flex flex-col items-center md:max-w-[25vw] md:min-h-[70vh] z-40">
        <h1 className="text-2xl md:text-4xl font-bold mb-4">Login to CulinaryAI</h1>
        <p className="text-gray-700 mb-8 font-bold">
          NOTE: Demo version does not have saving recipe functionality or page! Please connect with Google for the full experience!
        </p>

        <div className="space-y-4 w-full max-w-md">
          <a
            href={`/api/auth/signin`}
            onClick={(e) => {
              e.preventDefault();
              signIn('google');
            }} 
            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-gray-700 hover:bg-gray-100 transition w-full"
          >
            <FaGoogle className="mr-2 text-xl text-red-500" />
            Continue With Google
          </a>

          <button 
            onClick={() => router.push('/demo')} 
            className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-500 transition w-full"
          >
            Continue with Demo
          </button>
        </div>
      </div>
    </div>
  );
}
