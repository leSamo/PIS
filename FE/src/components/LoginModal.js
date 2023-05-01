import React, { useState } from 'react';
import { Form, FormGroup, TextInput, Button, Modal, ModalVariant, TextInputTypes } from '@patternfly/react-core';

// modal shown after clicking the "Log in" button in the top navigation bar
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
            className="login-modal"
            variant={ModalVariant.small}
            title="Log in"
            isOpen={isOpen}
            onClose={closeModal}
            actions={[
                <Button
                    className="login-modal-confirm" 
                    key="confirm"
                    variant="primary"
                    onClick={() => { loginCallback(usernameValue, passwordValue, closeModal); }}
                    isDisabled={!usernameValue || !passwordValue}
                >
                    Log in
                </Button>,
                <Button className="login-modal-cancel" key="cancel" variant="link" onClick={closeModal}>Cancel</Button>
            ]}>
            <Form>
                <FormGroup label="User name" isRequired>
                    <TextInput
                        isRequired
                        id="login-username"
                        name="login-username"
                        value={usernameValue}
                        onChange={value => setUsernameValue(value)}
                    />
                </FormGroup>
                <FormGroup label="Password" isRequired>
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
