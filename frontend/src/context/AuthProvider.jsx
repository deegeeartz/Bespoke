import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { API_URL } from '@/config/axios';
import { LoaderOverlay } from '@/components/common/LoaderOverlay';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loader, setLoader] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (Cookies.get('user')) {
			setUser(JSON.parse(Cookies.get('user')));
		} else {
			router.push('/');
		}
	}, []);

	const login = async (email, password) => {
		try {
			const { data } = await axios.post(API_URL + '/auth/login', { email, password });

			if (data?.token) {
				const { user, token, message } = data;
				// Persist data
				Cookies.set('user', JSON.stringify(user));
				Cookies.set('token', token);

				toast.success(message);
				setUser(user);
				// router.push(`/${user.role.toLowerCase()}`);
			}
		} catch (error) {
			console.log(error);
			toast.error(error?.response?.data?.error || 'An error ocurred. Please try again!');
		}
	};

	const logout = () => {
		Cookies.remove('user');
		Cookies.remove('token');
		setUser(null);
		router.push('/');
	};

	return (
		<AuthContext.Provider value={{ user, setUser, login, logout, loader, setLoader }}>
			{children}
			{loader && <LoaderOverlay />}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
