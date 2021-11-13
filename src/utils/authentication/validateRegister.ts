// TODO: add more errors
export const validateRegister = (
	username: string,
	email: string,
	password: string
) => {
	if (!email.includes('@')) {
		return [
			{
				field: 'email',
				message: 'invalid email',
			},
		];
	}

	if (username.length <= 2) {
		return [
			{
				field: 'username',
				message: 'length must be greater than 2',
			},
		];
	}

	if (username.includes('@')) {
		return [
			{
				field: 'username',
				message: 'cannot include an @',
			},
		];
	}

	if (password.length <= 2) {
		return [
			{
				field: 'password',
				message: 'length must be greater than 2',
			},
		];
	}

	return null;
};
