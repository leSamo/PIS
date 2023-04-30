import { useState, useEffect } from 'react';
import axios from 'axios';

export const useFetch = (endpoint, userInfo, params) => {
	// FETCHING
	endpoint ?? console.error('You are not passing endpoint into useFetch hook');

	const [data, setData] = useState([]);
	const [refreshCounter, setRefreshCounter] = useState(0);
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		if (userInfo?.loaded) {
			axios.get(`/rest-api/rest${endpoint}`, {
				params: { ...params },
				headers: { 'Authorization': `Bearer ${userInfo.raw}` }
			}).then(response => {
				setData(response.data);
				setLoading(false);
			}).catch(error => {
				setLoading(false);
				console.error(error);
			});
		}
	}, [refreshCounter, userInfo]);

	const refresh = () => setRefreshCounter(refreshCounter + 1);

	return [data, isLoading, refresh];
}

export const useAction = (verb, endpoint, userInfo = {}) => {
	endpoint ?? console.error('You are not passing endpoint into useAction hook');

	const action = (id, data, successCallback, errorCallback) => {
		if (verb === "POST") {
			axios.post(
				id ? `/rest-api/rest${endpoint}/${id}` : `/rest-api/rest${endpoint}`,
				{ ...data },
				userInfo.raw && { headers: { 'Authorization': `Bearer ${userInfo.raw}` } }
			)
				.then(response => successCallback?.(response))
				.catch(error => errorCallback?.(error?.response?.data?.message));
		}
		else if (verb === "DELETE") {
			axios.delete(
				id ? `/rest-api/rest${endpoint}/${id}` : `/rest-api/rest${endpoint}`,
				userInfo.raw && { headers: { 'Authorization': `Bearer ${userInfo.raw}` } }
			)
				.then(response => successCallback?.(response))
				.catch(error => errorCallback?.(error?.response?.data?.message));
		}
	}


	return action;
}
