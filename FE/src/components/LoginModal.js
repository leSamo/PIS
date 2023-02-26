import React, { useState } from 'react';
import { Form, FormGroup, TextInput, Button, Modal, ModalVariant, TextInputTypes } from '@patternfly/react-core';

const LoginModal = ({ isOpen, setOpen, loginCallback }) => {
  const [usernameValue, setUsernameValue] = useState('');
	const [passwordValue, setPasswordValue] = useState('');

  const closeModal = () => {
		setUsernameValue('')
		setPasswordValue('')
		setOpen(false)
	}

  return (
    <Modal
      variant={ModalVariant.small}
      title="Prihlásenie"
      isOpen={isOpen}
      onClose={closeModal}
      actions={[
        <Button key="confirm" variant="primary" onClick={() => { loginCallback(usernameValue, passwordValue, closeModal); }} isDisabled={!usernameValue || !passwordValue}>Prihlásiť sa</Button>,
        <Button key="cancel" variant="link" onClick={closeModal}>Zrušiť</Button>
      ]}>
      <Form>
        <FormGroup label="Používateľské meno" isRequired>
          <TextInput
            isRequired
            id="login-username"
            name="login-username"
            value={usernameValue}
						onChange={value => setUsernameValue(value)}
          />
        </FormGroup>
        <FormGroup label="Heslo" isRequired>
          <TextInput
            isRequired
            id="login-password"
            name="login-password"
            value={passwordValue}
						onChange={value => setPasswordValue(value)}
            type={TextInputTypes.password}
          />
        </FormGroup>
      </Form>
    </Modal>
  )
};

export default LoginModal;
