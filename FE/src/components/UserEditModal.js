import React, { useState, useEffect } from 'react';
import { Form, Button, Modal, ModalVariant, FormGroup, TextInput, ValidatedOptions, TextInputTypes, InputGroup, Checkbox } from '@patternfly/react-core';
import { validateEmail, validatePassword } from './../helpers/Validators';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';

const UserEditModal = ({ isOpen, setOpen, callback, selectedUser, initialFullname, initialEmail }) => {
    const [emailValue, setEmailValue] = useState('');
    const [fullnameValue, setFullnameValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [isPasswordUnchanged, setPasswordUnchanged] = useState(true);
    const [isPasswordHidden, setPasswordHidden] = useState(true);

    const closeModal = () => {
        // TODO: set all fields to empty
        setOpen(false)
    }

    useEffect(() => {
        if (isOpen) {
            setFullnameValue(initialFullname);
            setEmailValue(initialEmail);
            setPasswordUnchanged(true);
            setPasswordHidden(true);
            setPasswordValue('');
        }
    }, [isOpen]);

    return (
        <Modal
            variant={ModalVariant.small}
            title={`Editing user ${selectedUser}`}
            isOpen={isOpen}
            onClose={closeModal}
            actions={[
                <Button
                    key="confirm"
                    variant="primary"
                    onClick={callback}
                    /* TODO */
                    isDisabled={false}
                >
                    Save
                </Button>,
                <Button key="cancel" variant="link" onClick={closeModal}>Cancel</Button>
            ]}>
            <Form>
                <FormGroup
                    label="User name"
                >
                    <TextInput
                        isRequired
                        id="edit-username"
                        name="edit-username"
                        value={selectedUser}
                        isDisabled
                    />
                </FormGroup>
                <FormGroup
                    label="Full name"
                    isRequired
                >
                    <TextInput
                        isRequired
                        id="edit-fullname"
                        name="edit-fullname"
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
                        id="edit-email"
                        name="edit-email"
                        type={TextInputTypes.email}
                        validated={validateEmail(emailValue) || ValidatedOptions.error}
                        value={emailValue}
                        onChange={value => setEmailValue(value)}
                    />
                </FormGroup>
                <FormGroup>
                    <Checkbox
                        label="Keep password the same"
                        isChecked={isPasswordUnchanged}
                        onChange={newValue => setPasswordUnchanged(newValue)}
                        id="edit-keep-password"
                        name="edit-keep-password"
                    />
                    {!isPasswordUnchanged &&
                        <FormGroup
                            label="Password"
                            isRequired
                            validated={validatePassword(passwordValue) || ValidatedOptions.error}
                            helperTextInvalid="Password must consist of 8-128 characters and must contain alphanumerical characters and symbols !@#&()–{}:;',?/*~$=<>"
                            style={{ marginTop: 16 }}
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
                    }
                </FormGroup>
            </Form>
        </Modal>
    )
};

export default UserEditModal;
