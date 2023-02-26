import React, { useState } from 'react';
import { Form, FormGroup, TextInput, Button, Modal, ModalVariant, ValidatedOptions, TextInputTypes } from '@patternfly/react-core';

const RegistrationModal = ({ isOpen, setOpen, registerCallback }) => {
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

	const validateYear = year => {
		return year >= 1950 && year <= new Date().getFullYear();
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
			title="Registrácia"
			isOpen={isOpen}
			onClose={closeModal}
			actions={[
				<Button
					key="confirm"
					variant="primary"
					onClick={() => { registerCallback(usernameValue, passwordValue, startYearValue, emailValue, closeModal); }}
					isDisabled={!validateEmail(emailValue) || !validateUsername(usernameValue) || !validatePassword(passwordValue) ||
						!validatePassword2(password2Value) || !validateYear(startYearValue) || !emailValue || !usernameValue || !passwordValue}
				>
					Zaregistrovať sa
				</Button>,
				<Button key="cancel" variant="link" onClick={closeModal}>Zrušiť</Button>
			]}>
			<Form>
				<FormGroup
					label="E-mailová adresa"
					isRequired
					validated={validateEmail(emailValue) || ValidatedOptions.error}
					helperTextInvalid="E-mailová adresa nie je platná">
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
					label="Používateľské meno"
					isRequired
					validated={validateUsername(usernameValue) || ValidatedOptions.error}
					helperTextInvalid="Používateľské meno musí mať 3-32 znakov a obsahovať alfanumerické znaky"
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
					label="Heslo"
					isRequired
					validated={validatePassword(passwordValue) || ValidatedOptions.error}
					helperTextInvalid="Heslo musí mať 8-128 znakov a obsahovať alfanumerické znaky a symboly !@#&()–{}:;',?/*~$=<>"
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
					label="Heslo znovu"
					isRequired
					validated={validatePassword2(password2Value) || ValidatedOptions.error}
					helperTextInvalid="Heslá sa nezhodujú"
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
				<FormGroup
					label="Rok začiatku štúdia"
					isRequired
					validated={validateYear(startYearValue) || ValidatedOptions.error}
					helperTextInvalid="Neplatný rok začiatku štúdia"
				>
					<TextInput
						isRequired
						id="reg-year"
						name="reg-year"
						type={TextInputTypes.number}
						validated={validateYear(startYearValue) || ValidatedOptions.error}
						value={startYearValue}
						onChange={value => setStartYearValue(value)}
					/>
				</FormGroup>
			</Form>
		</Modal>
	)
};

export default RegistrationModal;
