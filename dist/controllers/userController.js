import { UserModel } from "../models/UserModel.js";
const getUser = async (req, res) => {
    try {
        const listUsers = await UserModel.find().exec();
        res.send(listUsers);
    }
    catch (error) {
        console.log(error);
    }
};
export { getUser };
