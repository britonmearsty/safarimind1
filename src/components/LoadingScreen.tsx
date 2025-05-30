const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50">
      <div className="w-24 h-24 mb-8 rounded-full flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="100%"
          height="100%"
          viewBox="0 0 48 48"
          className="animate-zoom"
        >
          <style>
            {`
              @keyframes zoom {
                0% { transform: scale(0.95); }
                50% { transform: scale(1.05); }
                100% { transform: scale(0.95); }
              }
              .animate-zoom {
                animation: zoom 2s infinite ease-in-out;
              }
            `}
          </style>
          <radialGradient
            id="loadingGradient1"
            cx="-670.437"
            cy="617.13"
            r=".041"
            gradientTransform="matrix(128.602 652.9562 653.274 -128.6646 -316906.281 517189.719)"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#1ba1e3"></stop>
            <stop offset="0" stopColor="#1ba1e3"></stop>
            <stop offset=".3" stopColor="#5489d6"></stop>
            <stop offset=".545" stopColor="#9b72cb"></stop>
            <stop offset=".825" stopColor="#d96570"></stop>
            <stop offset="1" stopColor="#f49c46"></stop>
          </radialGradient>
          <path
            fill="url(#loadingGradient1)"
            d="M22.882,31.557l-1.757,4.024c-0.675,1.547-2.816,1.547-3.491,0l-1.757-4.024	c-1.564-3.581-4.378-6.432-7.888-7.99l-4.836-2.147c-1.538-0.682-1.538-2.919,0-3.602l4.685-2.08	c3.601-1.598,6.465-4.554,8.002-8.258l1.78-4.288c0.66-1.591,2.859-1.591,3.52,0l1.78,4.288c1.537,3.703,4.402,6.659,8.002,8.258	l4.685,2.08c1.538,0.682,1.538,2.919,0,3.602l-4.836,2.147C27.26,25.126,24.446,27.976,22.882,31.557z"
          ></path>
          <radialGradient
            id="loadingGradient2"
            cx="-670.437"
            cy="617.13"
            r=".041"
            gradientTransform="matrix(128.602 652.9562 653.274 -128.6646 -316906.281 517189.719)"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#1ba1e3"></stop>
            <stop offset="0" stopColor="#1ba1e3"></stop>
            <stop offset=".3" stopColor="#5489d6"></stop>
            <stop offset=".545" stopColor="#9b72cb"></stop>
            <stop offset=".825" stopColor="#d96570"></stop>
            <stop offset="1" stopColor="#f49c46"></stop>
          </radialGradient>
          <path
            fill="url(#loadingGradient2)"
            d="M39.21,44.246l-0.494,1.132	c-0.362,0.829-1.51,0.829-1.871,0l-0.494-1.132c-0.881-2.019-2.467-3.627-4.447-4.506l-1.522-0.676	c-0.823-0.366-0.823-1.562,0-1.928l1.437-0.639c2.03-0.902,3.645-2.569,4.511-4.657l0.507-1.224c0.354-0.853,1.533-0.853,1.886,0	l0.507,1.224c0.866,2.088,2.481,3.755,4.511,4.657l1.437,0.639c0.823,0.366,0.823,1.562,0,1.928l-1.522,0.676	C41.677,40.619,40.091,42.227,39.21,44.246z"
          ></path>
        </svg>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Safarimind
      </h1>

      <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
    </div>
  );
};

export default LoadingScreen;
