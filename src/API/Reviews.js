import axios from "../utils/axios.jsx";

const reviewsAdminAPI = {
  getCourseReviews: (params) => axios.get("/Admin/Reviews/Courses", { params }),
  getProgramReviews: (params) =>
    axios.get("/Admin/Reviews/Programs", { params }),
  deleteCourseReview: (id) => axios.delete(`/Admin/Reviews/Courses/${id}`),
  deleteProgramReview: (id) => axios.delete(`/Admin/Reviews/Programs/${id}`),
};

export default reviewsAdminAPI;
