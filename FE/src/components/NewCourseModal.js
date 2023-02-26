import React, {useState} from 'react';
import { Form, FormGroup, TextInput, Alert, TextArea, Modal, ModalVariant, Button } from '@patternfly/react-core';

const NewCourseModal = ({ isOpen, setOpen, createCallback }) => {
    const [courseName, setCourseName] = useState('');
    const [courseDescription, setCourseDescription] = useState('');

    return (
        <Modal
            variant={ModalVariant.small}
            title="Založiť nový kurz"
            isOpen={isOpen}
            onClose={() => setOpen(false)}
            actions={[
                <Button key="confirm" variant="primary" onClick={() => { createCallback({ courseName, courseDescription }); setOpen(false); }}>Založiť</Button>,
                <Button key="cancel" variant="link" onClick={() => setOpen(false)}>Zrušiť</Button>
            ]}>
            <Form>
                <Alert variant="info" title="Kurz bude pred zverejnením musieť byť schválený moderátorom" />
                <FormGroup label="Názov kurzu" isRequired>
                    <TextInput
                        isRequired
                        id="course-name"
                        name="course-name"
                        value={courseName}
                        onChange={value => setCourseName(value)}
                    />
                </FormGroup>
                <FormGroup label="Popis kurzu" isRequired>
                    <TextArea
                        isRequired
                        id="course-description"
                        name="course-description"
                        resizeOrientation='vertical'
                        value={courseDescription}
                        onChange={value => setCourseDescription(value)}
                    />
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default NewCourseModal;
