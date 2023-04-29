import React, { useState } from 'react';
import { Form, FormGroup, TextInput, Button, Modal, ModalVariant, ValidatedOptions, TextInputTypes, InputGroup } from '@patternfly/react-core';
import { validateEmail, validateUsername, validatePassword } from './../helpers/Validators';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';

const NewUserModal = ({ isOpen, setOpen, registerCallback }) => {
	const [emailValue, setEmailValue] = useState('');
	const [usernameValue, setUsernameValue] = useState('');
	const [fullnameValue, setFullnameValue] = useState('');
	const [passwordValue, setPasswordValue] = useState('');
	const [isPasswordHidden, setPasswordHidden] = useState(true);


	const closeModal = () => {
		setEmailValue('')
		setUsernameValue('')
		setPasswordValue('')
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
					onClick={() => { registerCallback(usernameValue, passwordValue, emailValue, closeModal); }}
					isDisabled={!validateEmail(emailValue) || !validateUsername(usernameValue) || !validatePassword(passwordValue) || !emailValue || !usernameValue || !passwordValue || !fullnameValue}
				>
					Add new user
				</Button>,
				<Button key="cancel" variant="link" onClick={closeModal}>Cancel</Button>
			]}>
			<Form>
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
					label="Full name"
					isRequired
				>
					<TextInput
						isRequired
						id="reg-fullname"
						name="reg-fullname"
						value={fullnameValue}
						onChange={value => setFullnameValue(value)}
					/>
				</FormGroup>
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
					label="Password"
					isRequired
					validated={validatePassword(passwordValue) || ValidatedOptions.error}
					helperTextInvalid="Password must consist of 8-128 characters and must contain alphanumerical characters and symbols !@#&()–{}:;',?/*~$=<>"
				>
					<InputGroup>
						<TextInput
							isRequired
							id="reg-password"
							name="reg-password"
							type={isPasswordHidden ? TextInputTypes.password : TextInputTypes.text}
							validated={validatePassword(passwordValue) || ValidatedOptions.error}
							value={passwordValue}
							onChange={value => setPasswordValue(value)}
						/>
						<Button
							variant="control"
							onClick={() => setPasswordHidden(!isPasswordHidden)}
							aria-label={isPasswordHidden ? 'Show password' : 'Hide password'}
						>
							{isPasswordHidden ? <EyeIcon /> : <EyeSlashIcon />}
						</Button>
					</InputGroup>
				</FormGroup>
			</Form>
		</Modal>
	)
};

export default NewUserModal;
