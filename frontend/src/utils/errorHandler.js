import { toast } from 'react-toastify';

export const errorHandler = (error) => {
	console.log(error);
	const errorMessage = error?.response?.data?.error || 'An error occurred! Please try again. ';
	toast.error(errorMessage);
};
