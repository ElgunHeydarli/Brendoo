import axios from "axios";
import { baseUrlInf } from "../../../InfluencerBaseURL";
import toast from "react-hot-toast";

export type EditCollectionBody = {
    title: string;
    description: string;
}

export const handleEditCollectionReq = async (collectionId: number, data: EditCollectionBody, closeModal: () => void) => {
    const userStr = localStorage.getItem('user-info');
    const user = userStr ? JSON.parse(userStr) : "";
    const token = user?.token;

    try {
        const res = await axios.post(`${baseUrlInf}/collection/${collectionId}/update`, data, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (res.data) {
            toast.success("Yeniləndi.");
            data.title = '';
            data.description = '';
            closeModal();
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            console.log(res.status);
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error?.response?.data?.message) {
                toast.error(error?.response?.data?.message ?? "");
            }
        }
        console.log(error);
    }
}
