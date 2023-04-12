import React, { useState } from 'react';
import { Form, FormGroup, TextInput, Button, Modal, ModalVariant, ValidatedOptions, TextInputTypes } from '@patternfly/react-core';

const NewUserModal = ({ isOpen, setOpen, registerCallback }) => {
	const [emailValue, setEmailValue] = useState('');
	const [usernameValue, setUsernameValue] = useState('');
	const [passwordValue, setPasswordValue] = useState('');
	const [password2Value, setPassword2Value] = useState('');
	const [startYearValue, setStartYearValue] = useState(new Date().getFullYear());

	const validateEmail = email => {
		if (!email) return true;

		const re = /^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/;
		return re.test(email) && email.length <= 320;
	}

	const validateUsername = username => {
		if (!username) return true;

		const re = /^[a-z0-9_-]{3,32}$/i;
		return re.test(username);
	}

	const validatePassword = password => {
		if (!password) return true;

		const re = /^([a-z0-9!@#&()–{}:;',?/*~$=<> ]){8,128}$/i;
		return re.test(password);
	}

	const validatePassword2 = password => {
		return password === passwordValue;
	}

	const closeModal = () => {
		setEmailValue('')
		setUsernameValue('')
		setPasswordValue('')
		setPassword2Value('')
		setStartYearValue(new Date().getFullYear())
		setOpen(false)
	}

	return (
		<Modal
			variant={ModalVariant.small}
			title="Add new user"
			isOpen={isOpen}
			onClose={closeModal}
			actions={[
				<Button
					key="confirm"
					variant="primary"
					onClick={() => { registerCallback(usernameValue, passwordValue, startYearValue, emailValue, closeModal); }}
					isDisabled={!validateEmail(emailValue) || !validateUsername(usernameValue) || !validatePassword(passwordValue) ||
						!validatePassword2(password2Value) || !emailValue || !usernameValue || !passwordValue}
				>
					Add new user
				</Button>,
				<Button key="cancel" variant="link" onClick={closeModal}>Cancel</Button>
			]}>
			<Form>
				<FormGroup
					label="Email address"
					isRequired
					validated={validateEmail(emailValue) || ValidatedOptions.error}
					helperTextInvalid="Email address in not valid">
					<TextInput
						isRequired
						id="reg-email"
						name="reg-email"
						type={TextInputTypes.email}
						validated={validateEmail(emailValue) || ValidatedOptions.error}
						value={emailValue}
						onChange={value => setEmailValue(value)}
					/>
				</FormGroup>
				<FormGroup
					label="User name"
					isRequired
					validated={validateUsername(usernameValue) || ValidatedOptions.error}
					helperTextInvalid="User name must consist of 3-32 characters and must contain alphanumeric characters"
				>
					<TextInput
						isRequired
						id="reg-username"
						name="reg-username"
						validated={validateUsername(usernameValue) || ValidatedOptions.error}
						value={usernameValue}
						onChange={value => setUsernameValue(value)}
					/>
				</FormGroup>
				<FormGroup
					label="Password"
					isRequired
					validated={validatePassword(passwordValue) || ValidatedOptions.error}
					helperTextInvalid="Password must consist of 8-128 characters and must contain alphanumerical characters and symbols !@#&()–{}:;',?/*~$=<>"
				>
					<TextInput
						isRequired
						id="reg-password"
						name="reg-password"
						type={TextInputTypes.password}
						validated={validatePassword(passwordValue) || ValidatedOptions.error}
						value={passwordValue}
						onChange={value => setPasswordValue(value)}
					/>
				</FormGroup>
				<FormGroup
					label="Password again"
					isRequired
					validated={validatePassword2(password2Value) || ValidatedOptions.error}
					helperTextInvalid="Passwords do not match"
				>
					<TextInput
						isRequired
						id="reg-password2"
						name="reg-password2"
						type={TextInputTypes.password}
						validated={validatePassword2(password2Value) || ValidatedOptions.error}
						value={password2Value}
						onChange={value => setPassword2Value(value)}
					/>
				</FormGroup>
			</Form>
		</Modal>
	)
};

export default NewUserModal;
