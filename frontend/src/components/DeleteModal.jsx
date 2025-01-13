import { Button, Modal } from 'flowbite-react';
import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

const DeleteModal = ({ openModal, setOpenModal, deleteRecord }) => {
	const action = () => {
		deleteRecord();
		setOpenModal({ open: false });
	};

	return (
		<>
			<Modal dismissible show={openModal} size='md' onClose={() => setOpenModal({ open: false })} popup>
				<Modal.Header />

				<Modal.Body>
					<div className='text-center'>
						<FaExclamationCircle className='mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200' />
						<h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400'>
							Are you sure you want to delete this item?
						</h3>
						<div className='flex justify-center gap-4'>
							<Button color='failure' onClick={action}>
								{"Yes, I'm sure"}
							</Button>
							<Button color='gray' onClick={() => setOpenModal({ open: false })}>
								No, cancel
							</Button>
						</div>
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
};

export default DeleteModal;
