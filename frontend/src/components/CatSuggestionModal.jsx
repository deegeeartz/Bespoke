import http from '@/config/axios';
import { errorHandler } from '@/utils/errorHandler';
import { Label, Modal, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

export function CatSuggestionModal({ openModal, setOpenModal, createOrUpdateRecord, setCategories }) {
	const [category, setCategory] = useState(openModal.category);
	const isEdit = openModal.type === 'edit';

	const createRecord = async (category) => {
		try {
			const res = await http.post('/category', { title: category.title });
			if (res?.status == 200) {
				setOpenModal({ open: false });
				setCategories(res.data.result);
				toast.success(res.data.message);
			}
		} catch (error) {
			errorHandler(error);
		}
	};

	const action = () => {
		if (!category?.title.trim()) {
			toast.error('Category field is required!');
			return;
		}

		if (createOrUpdateRecord) {
			createOrUpdateRecord(category);
		} else {
			createRecord(category);
		}
	};

	return (
		<>
			<Modal
				dismissible
				position={'center'}
				show={openModal.open}
				onClose={() => setOpenModal({ open: false })}>
				<Modal.Header>{isEdit ? 'Edit Category' : 'Add New Category'}</Modal.Header>

				<Modal.Body>
					<div className='space-y-6'>
						<div>
							<div className='mb-2 block'>
								<Label htmlFor='category' value='Category' />
							</div>
							<TextInput
								id='category'
								value={category?.title || ''}
								onChange={(e) => setCategory({ ...category, title: e.target.value })}
								required
								// placeholder='Enter category'
							/>
						</div>

						<div className='w-full'>
							<button className='btn_primary px-8 w-36' onClick={action}>
								{isEdit ? 'Update' : 'Submit'}
							</button>
						</div>
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
}
