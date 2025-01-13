import { Spinner } from 'flowbite-react';

export const Loader = ({ styles }) => (
	<div className={`text-center pt-5 pb-8 ${styles}`}>
		<Spinner aria-label='spinner' className='fill-[#252525]' size='lg' />
	</div>
);
