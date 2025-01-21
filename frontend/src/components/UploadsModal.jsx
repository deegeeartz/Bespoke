import { Modal } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { FloatField } from './Fields';
import { RiDeleteBin4Fill } from 'react-icons/ri';
import Link from 'next/link';
import { toast } from 'react-toastify';
import http from '@/config/axios';
import { useAuth } from '@/context/AuthProvider';
import { getValidUsername, sanitizeString } from '../utils/helper';
import UploadFileInput from './common/UploadFileInput';
import { FaGoogleDrive } from 'react-icons/fa';
import { Loader } from './Loader';

export const UploadsModal = ({ openModal, setOpenModal, setUploads, survey, viewOnly, saveAudit }) => {
	const { user } = useAuth();
	const data = openModal.data;
	const [files, setFiles] = useState(data?.files || []);
	const [uploadedFile, setUploadedFile] = useState(null);
	const [fileDesc, setFileDesc] = useState(`${data.title} ${files?.length + 1}`);
	const [loading, setLoading] = useState(false);
	const [filesChanged, setFilesChanged] = useState(false);

	// Trigger saveAudit whenever files state changes
	useEffect(() => {
		if (filesChanged) {
			saveAudit(null, false);
			setFilesChanged(false);
		}
	}, [filesChanged]);

	const onFormSubmit = async (e) => {
		e.preventDefault();

		if (!uploadedFile || !fileDesc) {
			return toast.error('Description and File is required!');
		}

		// Get file name based on the data
		let fileName = `S${survey.id}-${getValidUsername(user.name)}-${Date.now()}`;
		if (survey?.id)
			fileName = `S${survey.id}-${getValidUsername(user.name)}-${sanitizeString(
				fileDesc,
				true
			)}-${Date.now()}`;

		// Add file extension
		const fileExtension = uploadedFile.name.split('.').pop();
		fileName = `${fileName}.${fileExtension}`;

		// Upload file
		const formData = new FormData();
		formData.append('file', uploadedFile);
		formData.append('fileName', fileName);
		formData.append('mimeType', uploadedFile.type);

		try {
			toast.info('Uploading... This may take a moment.');
			setLoading(true);

			const response = await http.post('/upload', formData, {
				timeout: 20 * 60 * 1000, // minutes
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			toast.success('File uploaded successfully.');
			const data = response.data.result;
			const fileData = { id: data.id, name: fileName, desc: fileDesc, url: data.url };

			AddFileToList(fileData);
			setFilesChanged(true); // Trigger saveAudit
		} catch (error) {
			toast.error('Error uploading file.');
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const AddFileToList = (fileData) => {
		// Add to files list
		const updatedFiles = [...files, fileData];
		setFiles(updatedFiles);
		setUploads((prev) => ({ ...prev, [data.id]: updatedFiles }));
		// Reset
		setUploadedFile(null);
		setFileDesc(`${data.title} ${updatedFiles?.length + 1}`);
	};

	const removeFile = async (id) => {
		const confirm = window.confirm('Are you sure you want to delete this file?');
		if (!confirm) return;

		// Remove file from list
		const removeFileFromList = () => {
			const updatedFiles = files.filter((file) => file.id !== id);
			setFiles(updatedFiles);
			setUploads((prev) => ({ ...prev, [data.id]: updatedFiles }));
		};

		try {
			setLoading(true);
			// toast.info('Deleting file...');
			const response = await http.post('/upload/delete/' + id);

			if (response.status === 200) {
				removeFileFromList();
				setFilesChanged(true); // Trigger saveAudit
				toast.success('File deleted successfully.');
			}
		} catch (error) {
			// Remove file from list if not found
			if (error.response?.status === 404) {
				removeFileFromList();
				toast.success('File deleted successfully.');
			} else {
				toast.error('Error deleting file.');
			}
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Modal
				dismissible={viewOnly}
				show={openModal.open}
				onClose={() => !loading && setOpenModal({ open: false })}>
				<Modal.Header>Upload file</Modal.Header>

				<Modal.Body>
					<div className='mb-6'>
						{!files.length ? (
							<p>No files uploaded</p>
						) : (
							<div className='list pb-2'>
								{files.map((file, index) => (
									<div
										key={index}
										className='card mb-4 grid gap-3 md:flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg '>
										<span className='pr-3'>
											<b>#{index + 1}</b>
										</span>

										<span className='w-full pr-2 '>
											<b>Description:</b> {file.desc}
										</span>

										<Link
											href={`${file.url}` || '#'}
											target={file.url && '_blank'}
											className='mr-1 w-fit border border-black p-2'>
											<FaGoogleDrive size={16} />
										</Link>

										<Link
											href={`${process.env.NEXT_PUBLIC_FILE_URL}/${file.id}` || '#'}
											target={file.url && '_blank'}
											className='btn_primary !px-2 w-[60px]'>
											View
										</Link>

										{(!viewOnly || data?.canEdit) && (
											<div
												className='btn_primary !py-[8px] w-fit cursor-pointer'
												onClick={() => removeFile(file.id)}>
												<RiDeleteBin4Fill className='text-[18px] text-red-400' />
											</div>
										)}
									</div>
								))}
							</div>
						)}

						{loading && <Loader styles={'!pb-2'} />}
					</div>

					<form className='space-y-4' id='uploadForm'>
						{(!viewOnly || data?.canEdit) && (
							<div className='addNew md:flex gap-x-3'>
								<div className='w-full mb-3 md:mb-[-6px]'>
									<FloatField
										label={'File Description'}
										value={fileDesc || ''}
										onChange={(el) => setFileDesc(el.target.value)}
									/>
								</div>

								<div className='w-fit inline-block mr-2'>
									<UploadFileInput uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} />
								</div>

								<button className='btn_primary h-[42px] !px-4 w-36' onClick={onFormSubmit}>
									Upload
								</button>
							</div>
						)}
					</form>
				</Modal.Body>
			</Modal>
		</>
	);
};
