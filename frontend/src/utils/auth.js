// export const getUser = () => {
// 	return JSON.parse(localStorage.getItem('user'));
// };

// export const getToken = () => {
// 	return localStorage.getItem('token');
// };

// export const userIsLoggedIn = () => {
// 	const user = getUser();
// 	const token = getToken();
// 	const isLoggedIn = user?.email && token ? true : false;
// 	return isLoggedIn;
// };

// export const authMiddleware = (router, route) => {
// 	const user = getUser();
// 	const isLoggedIn = userIsLoggedIn();
// 	if (!isLoggedIn && route == 'protected') {
// 		return router.push('/'); // Redirect to login
// 	}

// 	if (isLoggedIn && route == 'guest') {
// 		return router.push(`/${user.role.toLowerCase()}`);
// 	}
// };

// export const logOutUser = () => {
// 	localStorage.removeItem('user');
// 	localStorage.removeItem('token');
// 	// localStorage.clear();
// };
