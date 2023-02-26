import React, { useState } from 'react';
import { Card, CardBody, AlertVariant } from '@patternfly/react-core';
import NewCourseModal from './NewCourseModal';
import { useAction } from '../helpers/Hooks';

const IndexPage = ({ addToastAlert, userInfo }) => {
    const [isNewCourseModalOpen, setNewCourseModalOpen] = useState(false);

    const createNewCourse = useAction('/createNewCourse', userInfo);

    const createNewCourseAction = courseInfo => {
        const callback = () => {
            addToastAlert(AlertVariant.success, 'Kurz bol úspešne založený', 'Po schválení moderátorom bude zverejnený');
        }

        createNewCourse(courseInfo, callback);
    }

    return (
        <Card>
            <NewCourseModal isOpen={isNewCourseModalOpen} setOpen={setNewCourseModalOpen} createCallback={courseInfo => createNewCourseAction(courseInfo)} />
            <CardBody>

            </CardBody>
        </Card>
    );
};

export default IndexPage;