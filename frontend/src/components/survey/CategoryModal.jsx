import http from '@/config/axios';
import { errorHandler } from '@/utils/errorHandler';
import { Label, Modal, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

export function CategoryModal({ openModal, setOpenModal, setCategories, catSuggestions }) {
	const [category, setCategory] = useState(openModal.category);
	const isEdit = openModal.type === 'edit';

	const action = () => {
		if (!category?.title.trim()) {
			toast.error('Category field is required!');
			return;
		}

		if (isEdit) {
			// updateCategory();
		} else {
			let newCategory = {
				title: category.title,
				id: Math.floor(Math.random() * Date.now()).toString(),
			};

			console.log('data', newCategory);

			setCategories((prev) => [newCategory, ...prev]);
			toast.success('Category added successfully!');
			// reset form
			setCategory({ title: '' });
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
								list='cat_suggestions'
								// placeholder='Enter category'
							/>

							<datalist id='cat_suggestions'>
								{catSuggestions.map((cat) => (
									<option key={cat.id} value={cat.title} />
								))}
							</datalist>
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
