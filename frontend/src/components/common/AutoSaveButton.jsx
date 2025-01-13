import { Spinner } from 'flowbite-react';
import { RiSave2Line } from 'react-icons/ri';

export const AutoSaveButton = ({ action, loading }) => {
	return (
		<div
			onClick={action}
			className='auto_save_btn btn_primary !bg-green-600 !px-3 _flex fixed top-[170px] right-[-4px] cursor-pointer'>
			{loading ? (
				<Spinner color='success' className='mr-2 h-4 w-4' />
			) : (
				<RiSave2Line className='mr-2 h-4 w-4' />
			)}
			<span className='text-[13px]'>Save</span>
		</div>
	);
};
