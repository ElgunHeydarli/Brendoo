import axios from "axios";
import { baseUrlInf } from "../../../InfluencerBaseURL";
import toast from "react-hot-toast";

export interface AddProductPayloadType {
    collection_id: number[];
    product_id: number;
}

export const addProductInCollection = async (payload: AddProductPayloadType, msg: any) => {
    const userStr = localStorage.getItem('user-info');
    const user = userStr ? JSON.parse(userStr) : "";
    const token = user?.token;

    try {
        const res = await axios.post(`${baseUrlInf}/collection/add/product`, payload, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });

        if (res.data) {
            toast.success(msg);
            payload.collection_id = [];
            payload.product_id = 0;
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.data?.message) {
                toast.error(error.response?.data?.message ?? "Error");
            }
        }
        console.log(error);
    }
}
