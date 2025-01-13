import { Modal } from 'flowbite-react';
import EditQuestion from './EditQuestion';

export function EditQuestionModal({ openModal, setOpenModal, setQuestions, CATEGORIES }) {
	// console.log('EditQuestionModal -> openModal', openModal);

	const closeModal = () => {
		setOpenModal({ open: false });
	};

	return (
		<>
			<Modal dismissible position={'center'} show={openModal.open} onClose={closeModal}>
				<Modal.Header>Edit Question</Modal.Header>

				<Modal.Body>
					<div className='space-y-6'>
						<EditQuestion
							question={openModal?.question}
							category={CATEGORIES}
							setQuestions={setQuestions}
							closeModal={closeModal}
						/>
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
}
