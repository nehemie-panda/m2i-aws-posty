/**
 * Utilities for fetching data from the API
 */

const axios = require('axios');
const API_BASE_URL = process.env.API_BASE_URL;

module.exports = {
    async list(page=1, limit=9){
        return await axios.get(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`);
    },
    get(id=null){
        if(!id) throw "Missing post id";
        return axios.get(`${API_BASE_URL}/posts/${id}`);
    },
    upvotePost(id=null){
        if(!id) throw "Missing post id";
        return axios.post(`${API_BASE_URL}/posts/${id}/upvote`);
    },
    downvotePost(id=null){
        if(!id) throw "Missing post id";
        return axios.post(`${API_BASE_URL}/posts/${id}/downvote`);
    },
    searchPost(keyword=null, page=null){
        return axios.get(`${API_BASE_URL}/posts/search?keyword=${keyword}${ page ? "&page=" + page : "" }`);
    }
}
