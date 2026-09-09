import apiClient from "../utils/apiClient";

// /Admin/cv is the CV product's own mount. The old /Admin/OtherServices/cv-*
// paths still answer identically, so nothing breaks if something else is still
// calling those.
const BASE = "/Admin/cv";

/** Only the fields the catalogue owns, as multipart when there are files. */
const toBody = (fields, files) => {
    const hasFile = files?.introductoryImage || files?.introductoryVideo;
    if (!hasFile) return fields;

    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) form.append(key, value);
    }
    if (files.introductoryImage) form.append("introductoryImage", files.introductoryImage);
    if (files.introductoryVideo) form.append("introductoryVideo", files.introductoryVideo);
    return form;
};

const config = (body) =>
    body instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined;

const cvCatalogueAPI = {
    list: async () => (await apiClient.get(`${BASE}/services`)).data,

    get: async (id) => (await apiClient.get(`${BASE}/services/${id}`)).data,

    create: async (fields, files) => {
        const body = toBody(fields, files);
        return (await apiClient.post(`${BASE}/services`, body, config(body))).data;
    },

    update: async (id, fields, files) => {
        const body = toBody(fields, files);
        return (await apiClient.patch(`${BASE}/services/${id}`, body, config(body))).data;
    },

    toggle: async (id) =>
        (await apiClient.patch(`${BASE}/services/${id}/toggle-status`)).data,

    remove: async (id) => (await apiClient.delete(`${BASE}/services/${id}`)).data,
};

export default cvCatalogueAPI;
