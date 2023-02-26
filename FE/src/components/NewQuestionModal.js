import React, { useState } from 'react';
import { Form, FormGroup, TextInput, TextArea, Modal, ModalVariant, Button, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { useFetch } from '../helpers/Hooks';

const NewQuestionModal = ({ isOpen, setOpen, createCallback, courseName, userInfo }) => {
    const [{data: dropdownItems}] = useFetch('/categories', userInfo);
    
    const [questionTitle, setQuestionTitle] = useState('');
	const [questionBody, setQuestionBody] = useState('');
    const [dropdownValue, setDropdownValue] = useState(null);

    return (
        <Modal
            variant={ModalVariant.small}
            title="Položiť novú otázku"
            isOpen={isOpen}
            onClose={() => setOpen(false)}
            actions={[
                <Button isDisabled={!questionTitle || !questionBody} key="confirm" variant="primary" onClick={() => { setQuestionTitle(''); setQuestionBody(''); setDropdownValue(null); createCallback({ questionTitle, questionBody, categoryName: dropdownValue ?? dropdownItems[0][0] }); setOpen(false); }}>Položiť otázku</Button>,
                <Button key="cancel" variant="link" onClick={() => setOpen(false)}>Zrušiť</Button>
            ]}>
            <Form>
                <FormGroup label="Názov kurzu">
                    <TextInput
                        isDisabled
                        id="course-name"
                        name="course-name"
                        value={courseName}
                    />
                </FormGroup>
                <FormGroup label="Nadpis otázky" isRequired>
                    <TextInput
                        isRequired
                        id="question-name"
                        name="question-name"
                        value={questionTitle}
						onChange={value => setQuestionTitle(value)}
                    />
                </FormGroup>
                <FormGroup label="Popis otázky" isRequired>
                    <TextArea
                        isRequired
                        id="question-description"
                        name="question-description"
                        resizeOrientation='vertical'
                        value={questionBody}
						onChange={value => setQuestionBody(value)}
                    />
                </FormGroup>
                <FormGroup label="Kategória" isRequired>
                    <FormSelect value={dropdownValue} onChange={setDropdownValue} aria-label="FormSelect Input">
                        {dropdownItems?.map(category => <FormSelectOption key={category[0]} value={category[0]} label={category[0]}/>)}
                    </FormSelect>
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default NewQuestionModal;
