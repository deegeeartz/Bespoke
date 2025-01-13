import { Button } from 'flowbite-react';
import { FaPlus } from 'react-icons/fa';

export const UploadFileButton = ({ files, onClick }) => {
	return (
		<Button
			color='success'
			size='sm'
			className='text-nowrap [&>span]:items-center !ring-gray-200'
			onClick={onClick}>
			<FaPlus className='mr-2 text-[16px]' />
			File <span className='pl-2 ml-2 border-l'>{files?.length || 0}</span>
		</Button>
	);
};
