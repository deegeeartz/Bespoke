import axios from 'axios';
import Cookies from 'js-cookie';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// axios config for server
const http = axios.create({
	baseURL: API_URL,
	timeout: 15000,
	headers: { 'Content-Type': 'application/json' },
});

// Interceptor
http.interceptors.request.use(function (config) {
	const token = Cookies.get('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config; // Make sure to return the modified config object
});

// Add a response interceptor
http.interceptors.response.use(
	(response) => response,
	(error) => {
		console.log('interceptors: ', error);

		const { status, data } = error.response;
		if (status == 401 || data?.errorObject?.name === 'TokenExpiredError') {
			// toast.error(error.response.data?.error ?? 'Invalid Token! Please login again.');
			Cookies.remove('user');
			Cookies.remove('token');
		}

		return Promise.reject(error);
	}
);

export default http;
