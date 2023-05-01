import React, { Fragment, useEffect, useState } from 'react';
import {
	Page, PageHeader, Dropdown, DropdownToggle, Avatar, DropdownGroup, DropdownItem,
	PageHeaderTools, Button, Alert, AlertGroup, AlertVariant, AlertActionCloseButton, Split, SplitItem, Brand, NotificationBadge, Popover, NotificationDrawer, NotificationDrawerHeader, NotificationDrawerBody, NotificationDrawerList, NotificationDrawerListItem, NotificationDrawerListItemHeader, NotificationDrawerListItemBody
} from '@patternfly/react-core';
import avatarImg from './avatar.svg';
import LoginModal from './LoginModal'
import logo from './logo.png';
import { useAction } from '../helpers/Hooks';
import { KeyIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom/cjs/react-router-dom';
import jwt_decode from 'jwt-decode';
import { useFetch } from './../helpers/Hooks';
import { formatDateTimeRange } from '../helpers/CalendarHelper';

// TODO: Handle JWT expiration
const Wrapper = ({ children, userInfo, setUserInfo }) => {
	const [isDropdownOpen, setDropdownOpen] = useState(false);
	const [isLoginModalOpen, setLoginModalOpen] = useState(false);
	const [toastAlerts, setToastAlerts] = useState([]);

	const [notifications, areNotificationsLoading, notificationsRefresh] = useFetch(`/notifications/${userInfo.upn}`, userInfo);

	const acknowledgeNotifications = useAction('PUT', `/notifications/${userInfo.upn}/ack`, userInfo);

	console.log("notifs", notifications);

	const sendLoginRequest = useAction('POST', '/login');

	useEffect(() => {
		const savedInfo = localStorage.getItem('login');

		if (savedInfo != null) {
			try {
				const parsedInfo = JSON.parse(savedInfo);
				setUserInfo({ ...parsedInfo, loaded: true });
			}
			catch (e) {
				console.log("No info");
				setUserInfo({ loaded: true });
			}
		}
		else {
			setUserInfo({ loaded: true });
		}
	}, []);

	const addToastAlert = (variant, title, description) => {
		setToastAlerts([...toastAlerts, { title, variant, description, key: new Date().getTime() }]);
	};

	const removeToastAlert = key => {
		setToastAlerts(toastAlerts.filter(alert => alert.key !== key));
	};

	const loginUser = async (login, password, closeModal) => {
		const successCallback = receivedUserInfo => {
			addToastAlert(AlertVariant.success, 'Login successful');

			const decodedToken = jwt_decode(receivedUserInfo.data.token);
			decodedToken.raw = receivedUserInfo.data.token;
			decodedToken.loaded = true;

			setUserInfo(decodedToken);
			localStorage.setItem('login', JSON.stringify(decodedToken));
			closeModal();
		}

		const errorCallback = error => {
			addToastAlert(AlertVariant.danger, 'Login failed', error.response.data);
		}

		sendLoginRequest(null, {
			login,
			password
		}, successCallback, errorCallback);
	}

	const userDropdownItems = [
		<DropdownGroup key="user-actions">
			<DropdownItem
				key="logout"
				onClick={() => {
					setUserInfo({});
					localStorage.removeItem('login');
					addToastAlert(AlertVariant.success, "Logout successful")
					location.href = "/";
				}}>
				Log out
			</DropdownItem>
		</DropdownGroup>
	];

	const headerRightPanel = (
		<PageHeaderTools>
			<Split hasGutter>
				{userInfo.upn && userInfo.groups.includes("admin") &&
					<SplitItem>
						<Link to="/userManagement">
							<Button className="navigate-to-user-management-page" variant="tertiary" onClick={() => { }}>
								User management
								<KeyIcon style={{ marginLeft: 4, verticalAlign: -2 }} />
							</Button>
						</Link>
					</SplitItem>
				}

				{userInfo.upn
					? (
						<Fragment>
							<SplitItem>
								<Popover
									style={{ maxHeight: 600, minWidth: 400, overflow: "auto" }}
									onHide={() => notifications.filter(notif => !notif.ack).length > 0 && acknowledgeNotifications(null, {}, notificationsRefresh)}
									bodyContent={
										<NotificationDrawer>
											<NotificationDrawerHeader count={notifications.filter(notif => !notif.ack).length} />
											<NotificationDrawerBody>
												<NotificationDrawerList>
													{notifications.map(notification => (
														<NotificationDrawerListItem key={notification.id} isRead={notification.ack} variant="info">
															<NotificationDrawerListItemHeader
																variant="info"
																title="You have been invited to an event"
															></NotificationDrawerListItemHeader>
															<NotificationDrawerListItemBody timestamp={formatDateTimeRange(notification.eventStart, notification.eventEnd)}>
																{notification.eventName}
															</NotificationDrawerListItemBody>
														</NotificationDrawerListItem>
													))}
												</NotificationDrawerList>
											</NotificationDrawerBody>
										</NotificationDrawer>
									}>
									<NotificationBadge
										variant={notifications.filter(notif => !notif.ack).length === 0 ? "read" : "attention"}
										count={notifications.filter(notif => !notif.ack).length}
									/>
								</Popover>
							</SplitItem>
							<SplitItem>
								<Dropdown
									onSelect={() => setDropdownOpen(!isDropdownOpen)}
									isOpen={isDropdownOpen}
									toggle={
										<DropdownToggle icon={<Avatar src={avatarImg} alt="Avatar" size="sm" />} onToggle={() => setDropdownOpen(!isDropdownOpen)}>
											{userInfo.upn}
										</DropdownToggle>
									}
									dropdownItems={userDropdownItems}
								/>
							</SplitItem>
						</Fragment>
					) : <SplitItem>
						<Button className="log-in" variant="tertiary" onClick={() => setLoginModalOpen(true)}>Log in</Button>
					</SplitItem>
				}
			</Split>
		</PageHeaderTools>
	);

	const header = (
		<PageHeader
			logo={<Brand src={logo} alt="FIT CAL" />}
			headerTools={headerRightPanel}
		/>
	);

	return (
		<Page header={header} style={{ height: '100vh' }}>
			<AlertGroup isToast isLiveRegion>
				{toastAlerts.map(({ key, variant, title, description }) => (
					<Alert
						variant={AlertVariant[variant]}
						title={title}
						timeout={5000}
						actionClose={
							<AlertActionCloseButton
								title={title}
								variantLabel={`${variant} alert`}
								onClose={() => removeToastAlert(key)}
							/>
						}
						key={key}
					>{description}</Alert>
				))}
			</AlertGroup>
			<LoginModal isOpen={isLoginModalOpen} setOpen={setLoginModalOpen} loginCallback={loginUser} />
			{React.cloneElement(children, { addToastAlert, userInfo })}
		</Page>
	)
};

export default Wrapper;
