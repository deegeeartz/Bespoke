import { Spinner } from 'flowbite-react';

export const LoaderOverlay = (styles) => (
	<div className={`fixed top-0 h-[100vh] w-[100vw] bg-gray-50 bg-opacity-70 fx_center z-[999] ${styles}`}>
		<Spinner aria-label='spinner' className='fill-[#252525]' size='lg' />
	</div>
);
