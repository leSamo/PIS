import React, { useState, useEffect } from 'react';
import { Form, Button, Modal, ModalVariant, FormGroup, TextInput, ValidatedOptions, TextInputTypes, InputGroup, Checkbox, Select, SelectVariant, SelectOption } from '@patternfly/react-core';
import { validateEmail, validatePassword } from '../helpers/Validators';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';
import { decapitalize } from '../helpers/Utils';
import { ROLES } from '../helpers/Constants';
import { capitalize } from './../helpers/Utils';
import { useAction } from '../helpers/Hooks';

const EditUserModal = ({ userInfo, isOpen, setOpen, callback, selectedUser }) => {
    const [emailValue, setEmailValue] = useState('');
    const [fullnameValue, setFullnameValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [isPasswordUnchanged, setPasswordUnchanged] = useState(true);
    const [isPasswordHidden, setPasswordHidden] = useState(true);
    const [shouldUserBeAdmin, setShouldUserBeAdmin] = useState(false);
    const [isRoleSelectOpen, setRoleSelectOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState('manager');

    const submitEditedUser = useAction('PATCH', '/users', userInfo);

    useEffect(() => {
        if (isOpen) {
            setFullnameValue(selectedUser.fullname);
            setEmailValue(selectedUser.email);
            setPasswordUnchanged(true);
            setPasswordHidden(true);
            setPasswordValue('');
            setShouldUserBeAdmin(selectedUser.isAdmin);
            setSelectedRole(decapitalize(selectedUser.role));
        }
    }, [isOpen]);

    const closeModal = () => {
        setOpen(false)
    }

    const onRoleSelect = (event, selection) => {
        setSelectedRole(selection);
        setRoleSelectOpen(false);
        document.getElementById('reg-role').focus();
    };

    const onSubmit = () => {
        isPasswordUnchanged
            ? submitEditedUser(selectedUser.username, { name: fullnameValue, email: emailValue, userRole: selectedRole.toUpperCase(), admin: shouldUserBeAdmin }, callback)
            : submitEditedUser(selectedUser.username, { name: fullnameValue, email: emailValue, userRole: selectedRole.toUpperCase(), admin: shouldUserBeAdmin, password: passwordValue }, callback)
    }

    return (
        <Modal
            variant={ModalVariant.small}
            title={`Editing user ${selectedUser.username}`}
            isOpen={isOpen}
            onClose={closeModal}
            actions={[
                <Button
                    key="confirm"
                    variant="primary"
                    onClick={onSubmit}
                    isDisabled={
                        !validateEmail(emailValue) ||
                        !validatePassword(passwordValue) ||
                        !emailValue ||
                        (!isPasswordUnchanged && !passwordValue) ||
                        !fullnameValue
                    }
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
                        value={selectedUser.username}
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
                <FormGroup
                    label="Role"
                    isRequired
                >
                    <Select
                        variant={SelectVariant.single}
                        placeholderText="Select role"
                        onToggle={newState => setRoleSelectOpen(newState)}
                        onSelect={onRoleSelect}
                        selections={selectedRole}
                        isOpen={isRoleSelectOpen}
                        menuAppendTo={document.body}
                        id="reg-role"
                    >
                        {ROLES.map(option => (
                            <SelectOption
                                key={option}
                                value={option}
                            >
                                {capitalize(option)}
                            </SelectOption>
                        ))}
                    </Select>
                </FormGroup>
                <FormGroup>
                    <Checkbox
                        label="User can manage other users"
                        isChecked={shouldUserBeAdmin}
                        onChange={newValue => setShouldUserBeAdmin(newValue)}
                        id="reg-admin"
                        name="reg-admin"
                    />
                </FormGroup>
            </Form>
        </Modal>
    )
};

export default EditUserModal;
