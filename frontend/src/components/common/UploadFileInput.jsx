import { useState } from 'react';
import { RiUpload2Line } from 'react-icons/ri';
import { toast } from 'react-toastify';

const UploadFileInput = ({ uploadedFile, setUploadedFile }) => {
	const onFileChange = (e) => {
		const file = e.target.files[0];

		// Check if file exceeds 200MB
		const maxSize = 150 * 1024 * 1024;
		if (file.size > maxSize) {
			setUploadedFile(null);
			return toast.error('File is too large (150MB max). Please compress and reupload.');
		}

		if (file) {
			setUploadedFile(file);
		}
	};

	return (
		<div>
			<label
				htmlFor='file_input'
				className={
					'btn_outline fx_center font-bold !py-2.5 !px-2 w-[120px] ' + (uploadedFile && 'bg-green-400')
				}>
				<RiUpload2Line className='mr-2 text-[14px]' />
				Choose File
				<input id='file_input' type='file' className='hidden' onChange={onFileChange} />
			</label>
		</div>
	);
};

export default UploadFileInput;
