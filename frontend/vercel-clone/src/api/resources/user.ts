import axiosClient from "../axiosClient";

interface SignupData {
    email: string;
    password: string;
}

const usersApi: any = {
    signup: (data : SignupData) => {
        return axiosClient.post('/v1/users/signup', data);
    },
    deleteUser: (userId : string) => {
        return axiosClient.delete(`/v1/users/${userId}`);
    }
};

export default usersApi;
