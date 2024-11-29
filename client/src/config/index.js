import axios from 'axios';
import { API_URL } from '../config';

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Export configuration
export { API_URL }; 