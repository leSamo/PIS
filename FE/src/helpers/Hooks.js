import { useState, useEffect } from 'react';
import axios from 'axios';

export const useFetch = (endpoint, userInfo, sortMapper, defaultPerPage = 20, defaultSortIndex = 0, defaultSortDirection = 'asc', params) => {
	// FETCHING
	endpoint ?? console.error('You are not passing endpoint into useFetch hook');

	if (sortMapper === undefined) {
		sortMapper = sort => sort;
	}

	const [data, setData] = useState([]);
	const [refreshCounter, setRefreshCounter] = useState(0);
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		if (userInfo?.loaded) {
			axios.get(endpoint, {
				params: { sortIndex: sortMapper(sortIndex), sortDirection, page, perPage, username: userInfo.username, ...params },
				headers: { 'Authorization': `Bearer ${userInfo.token}` }
			}).then(response => {
				setData(response.data);
				setLoading(false);
			}).catch(error => {
				setLoading(false);
				console.error(error)
			});
		}
	}, [refreshCounter, userInfo]);

	const refresh = () => setRefreshCounter(refreshCounter + 1);

	// SORTING
	const [sortIndex, setSortIndex] = useState(defaultSortIndex);
	const [sortDirection, setSortDirection] = useState(defaultSortDirection);

	const onSort = (_, newSortIndex, newSortDirection) => {
		setSortDirection(newSortDirection);
		setSortIndex(newSortIndex);
		refresh();
	};

	const sortBy = {
		index: sortIndex,
		direction: sortDirection
	};

	const sort = { sortBy, onSort };

	// PAGINATION
	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(defaultPerPage);

	const onSetPage = (_, page) => {
		setPage(page);
		refresh();
	}

	const onPerPageSelect = (_, perPage) => {
		setPerPage(perPage);
		setPage(1);
		refresh();
	}

	const pagination = { page, perPage, onSetPage, onPerPageSelect };

	return [data, isLoading, refresh, sort, pagination];
}

export const useAction = (endpoint, userInfo = {}) => {
	endpoint ?? console.error('You are not passing endpoint into useAction hook');

	const action = (data, successCallback, errorCallback) =>
		axios.post(
			endpoint,
			{ ...data },
			userInfo.token && { headers: { 'Authorization': `Bearer ${userInfo.token}` } })
			.then(response => successCallback?.(response))
			.catch(error => errorCallback?.(error));

	return action;
}


export const useActionWithFile = (endpoint, userInfo = {}) => {
	endpoint ?? console.error('You are not passing endpoint into useActionWithFile hook');

	const action = (data, file, successCallback, errorCallback) => {
		if (file) {
			const read = new FileReader();
			read.readAsBinaryString(file);

			read.onloadend = () => {
				axios.post(
					endpoint,
					{ ...data, file: btoa(read.result) },
					userInfo.token && { headers: { 'Authorization': `Bearer ${userInfo.token}` } })
					.then(response => successCallback?.(response))
					.catch(error => errorCallback?.(error));
			}
		}
		else {
			axios.post(
				endpoint,
				data,
				userInfo.token && { headers: { 'Authorization': `Bearer ${userInfo.token}` } })
				.then(response => successCallback?.(response))
				.catch(error => errorCallback?.(error));
		}
	}

	return action;
}
