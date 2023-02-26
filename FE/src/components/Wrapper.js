import React, { useEffect, useState } from 'react';
import {
	Page, PageHeader, Dropdown, DropdownToggle, Avatar, DropdownGroup, DropdownItem,
	PageHeaderTools, Button, Alert, AlertGroup, AlertVariant, AlertActionCloseButton, Split, SplitItem, Brand
} from '@patternfly/react-core';
import avatarImg from './avatar.svg';
import LoginModal from './LoginModal'
import logo from './logo.png';
import { useAction } from '../helpers/Hooks';
import { KeyIcon } from '@patternfly/react-icons';

const Wrapper = ({ children, userInfo, setUserInfo }) => {
	const [isDropdownOpen, setDropdownOpen] = useState(false);
	const [isLoginModalOpen, setLoginModalOpen] = useState(false);
	const [toastAlerts, setToastAlerts] = useState([]);

	const sendLoginRequest = useAction('/login');

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
			addToastAlert(AlertVariant.success, 'Prihlásenie bolo úspešné');
			setUserInfo(receivedUserInfo.data);

			localStorage.setItem('login', JSON.stringify(receivedUserInfo.data));
			closeModal();
		}

		const errorCallback = error => {
			addToastAlert(AlertVariant.danger, 'Prihlásenie nebolo úspešné', error.response.data);
		}

		sendLoginRequest({
			user: login,
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
					addToastAlert(AlertVariant.success, "Odhlásenie bolo úspešné")
					location.href = "/";
				}}>
				Odhlásiť sa
			</DropdownItem>
		</DropdownGroup>
	];

	const userDropdown = (
		<PageHeaderTools>
			{userInfo.username
				? <Dropdown
					onSelect={() => setDropdownOpen(!isDropdownOpen)}
					isOpen={isDropdownOpen}
					toggle={
						<DropdownToggle icon={<Avatar src={avatarImg} alt="Avatar" />} onToggle={() => setDropdownOpen(!isDropdownOpen)}>
							{userInfo.username}
						</DropdownToggle>
					}
					dropdownItems={userDropdownItems}
				/>
				: <Split hasGutter>
					<SplitItem>
						<Button variant="tertiary" onClick={() => setLoginModalOpen(true)}>Prihlásiť sa</Button>
					</SplitItem>
					<SplitItem>
						<Button variant="tertiary" onClick={() => {}}>Spravovať používateľov <KeyIcon/></Button>
					</SplitItem>
				</Split>
			}
		</PageHeaderTools>
	);

	const header = (
		<PageHeader
			logo={<Brand src={logo} alt="Fituška v2" />}
			headerTools={userDropdown}
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
