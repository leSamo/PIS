import React, { useState } from 'react';
import { Form, FormGroup, TextInput, Modal, ModalVariant, Button } from '@patternfly/react-core';

const NewUserModal = ({ isOpen, setOpen }) => {    
    const [usernameInput, setUsernameInput] = useState('');
    const [fullNameInput, setFullNameInput] = useState('');
    const [emailInput, setEmailInput] = useState('');

    return (
        <Modal
            variant={ModalVariant.small}
            title="Add a new user"
            isOpen={isOpen}
            onClose={() => setOpen(false)}
            actions={[
                <Button isDisabled={!usernameInput || !fullNameInput || !emailInput} key="confirm" variant="primary" onClick={() => setOpen(false)}>Add user</Button>,
                <Button key="cancel" variant="link" onClick={() => setOpen(false)}>Cancel</Button>
            ]}>
            <Form>
                <FormGroup label="User name" isRequired>
                    <TextInput
                        isRequired
                        id="user-name-input"
                        name="user-name-input"
                        value={usernameInput}
                        onChange={value => setUsernameInput(value)}
                    />
                </FormGroup>
                <FormGroup label="Full name" isRequired>
                    <TextInput
                        isRequired
                        id="full-name-input"
                        name="full-name-input"
                        value={fullNameInput}
						onChange={value => setFullNameInput(value)}
                    />
                </FormGroup>
                <FormGroup label="Email adrress" isRequired>
                    <TextInput
                        isRequired
                        id="email-address-input"
                        name="email-address-input"
                        value={emailInput}
						onChange={value => setEmailInput(value)}
                    />
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default NewUserModal;
