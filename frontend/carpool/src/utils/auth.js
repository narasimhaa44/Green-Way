export const getUser = () => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
};

export const logout = () => {
    localStorage.removeItem("user");
};