import { useState, useEffect } from 'react';
import axios from 'axios';

// hook for fetching data using HTTP GET requests
// returns an array of 
// - reponse data
// - boolean whether the response is still loading
// - function to refresh and refetch the data with new parameters
export const useFetch = (endpoint, userInfo, params) => {
	endpoint ?? console.error('You are not passing endpoint into useFetch hook');

	const [data, setData] = useState([]);
	const [refreshCounter, setRefreshCounter] = useState(0);
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		if (userInfo?.loaded) {
			axios.get(`/rest-api/rest${endpoint}`, {
				params: { ...params },
				headers: { 'Authorization': `Bearer ${userInfo.raw}` },
				paramsSerializer: { indexes: null }
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

// hook for executing HTTP POST/PUT/PATCH/DELETE requests
// returns a function which will execute the request
// the function contains the following parameters
// - id - used for /resource/{id} endpoints, can be set to nullish to ignore
// - data - request body data (this parameter is absent when verb is DELETE)
// - successCallback - will be executed upon successful response
// - errorCallback - will be executed upon unsuccessful response
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
				.catch(error => errorCallback?.(error?.response?.data));
		}
		else if (verb === "PUT") {
			axios.put(
				id ? `/rest-api/rest${endpoint}/${id}` : `/rest-api/rest${endpoint}`,
				{ ...data },
				userInfo.raw && { headers: { 'Authorization': `Bearer ${userInfo.raw}` } }
			)
				.then(response => successCallback?.(response))
				.catch(error => errorCallback?.(error?.response?.data));
		}
		else if (verb === "PATCH") {
			axios.patch(
				id ? `/rest-api/rest${endpoint}/${id}` : `/rest-api/rest${endpoint}`,
				{ ...data },
				userInfo.raw && { headers: { 'Authorization': `Bearer ${userInfo.raw}` } }
			)
				.then(response => successCallback?.(response))
				.catch(error => errorCallback?.(error?.response?.data));
		}
		else if (verb === "DELETE") {
			axios.delete(
				id ? `/rest-api/rest${endpoint}/${id}` : `/rest-api/rest${endpoint}`,
				userInfo.raw && { headers: { 'Authorization': `Bearer ${userInfo.raw}` } }
			)
				.then(response => successCallback?.(response))
				.catch(error => errorCallback?.(error?.response?.data));
		}
	}

	return action;
}
