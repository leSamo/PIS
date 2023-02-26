import React from 'react';
import {
    Card, CardBody, TextContent, Text, TextVariants, AlertVariant, ButtonVariant
} from '@patternfly/react-core';
import Table from './Table';
import { useAction, useFetch } from '../helpers/Hooks';

const CourseManagementPage = ({ addToastAlert, userInfo }) => {
    const COLUMNS_COURSES = [
        { label: 'Názov kurzu', link: (content, row) => `/courses/${row[2]}` },
        { label: 'Vytvorený', type: 'date' },
        { label: 'ID kurzu', type: 'hidden' }
    ];

    const [{ data: coursesToApproveData, meta: coursesToApproveMeta }, isLoadingCourses, refreshCourses, coursesToApproveSorting, coursesToApprovePagination] = useFetch('/coursesToApprove', userInfo);

    const approveCourseRequest = useAction('/approveCourse', userInfo);
    const rejectCourseRequest = useAction('/rejectCourse', userInfo);

    const approveCourse = name => {
		const callback = () => {
			addToastAlert(AlertVariant.success, `Kurz "${name}" bol schválený`);
            refreshCourses();
        }

        approveCourseRequest({ course: name }, callback);
    }

    const rejectCourse = name => {
		const callback = () => {
			addToastAlert(AlertVariant.success, `Kurz "${name}" bol odmietnutý`);
            refreshCourses();
        }

        rejectCourseRequest({ course: name }, callback);
    }

    return (
        <Card>
            <CardBody>
                <Table
                    title={
                        <TextContent>
                            <Text component={TextVariants.h1}>
                                Kurzy čakajúce na schválenie
                            </Text>
                        </TextContent>
                    }
                    isLoading={isLoadingCourses}
                    columns={COLUMNS_COURSES}
                    rows={coursesToApproveData}
                    actions={[{
                        label: 'Schváliť kurz',
                        onClick: courseId => approveCourse(courseId),
                        buttonProps: {
                            variant: ButtonVariant.primary,
                            style: {
                                backgroundColor: '#3E8635',
                                marginRight: 16
                            }
                        }
                    }, {
                        label: 'Odmietnuť kurz',
                        onClick: courseId => rejectCourse(courseId),
                        buttonProps: {
                            variant: ButtonVariant.danger
                        }
                    }]}
                    itemCount={coursesToApproveMeta?.itemCount}
                    {...coursesToApproveSorting}
                    {...coursesToApprovePagination}
                />
            </CardBody>
        </Card>
    );
}

export default CourseManagementPage;
