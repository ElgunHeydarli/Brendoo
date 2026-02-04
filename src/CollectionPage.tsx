import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import Loading from "./components/Loading";
import { Product } from "./setting/Types";
import Products from "./pages/Products";

const CollectionPage: React.FC = () => {
    const { lang = "az", slug } = useParams<{ lang: string; slug: string }>();
    const [searchParams] = useSearchParams();
    const collection_id = searchParams.get("collection_id") || "";

    const [productsCollection, setProductsCollection] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (collection_id) {
            localStorage.setItem("collection_id", collection_id);
        }
    }, [collection_id]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://admin.brendoo.com/api/products/${slug}`, {
                headers: {
                    "Accept-Language": lang,
                },
            });
            console.log(res.data, 'res.data');
            setProductsCollection(res.data?.data || []);
        } catch (err) {
            console.error("fetch xetasi:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (slug) fetchProducts();
    }, [slug, lang]);

    if (loading) return <Loading />;

    return (
        <Products
            slug={slug}
            collectionProducts={productsCollection}
        />
    );
};


export default CollectionPage;
