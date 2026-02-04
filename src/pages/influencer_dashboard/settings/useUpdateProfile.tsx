import { useState, useEffect } from "react";
import axios from "axios";
import { baseUrlInf } from "../../../InfluencerBaseURL";
import toast from "react-hot-toast";

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

type RawUserInfo = {
  token?: string | null;
  customer?: any;
  data?: any;
  // başqa sahələr də ola bilər
  [key: string]: any;
} | null;

const readUserInfo = (): RawUserInfo => {
  try {
    const raw = localStorage.getItem("user-info");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("user-info parse error", e);
    return null;
  }
};

// localStorage strukturundan asılı olmayaraq name/email/phone çıxarır
const extractProfile = (user: RawUserInfo) => {
  const node = user?.customer ?? user?.data ?? user ?? {};
  return {
    name: node?.name ?? "",
    email: node?.email ?? "",
    phone: node?.phone ?? node?.phone_number ?? "",
  };
};

// localStorage-ı eyni strukturda saxlayaraq yalnız lazımlı sahələri yenilə
const writeUserInfo = (user: RawUserInfo, updated: Partial<{ name: string; email: string; phone: string }>) => {
  if (!user) return;

  if (user.customer) {
    user.customer = { ...user.customer, ...updated };
  } else if (user.data) {
    user.data = { ...user.data, ...updated };
  } else {
    Object.assign(user as any, updated);
  }

  localStorage.setItem("user-info", JSON.stringify(user));
};

export const useUpdateProfile = (lang?: string) => {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // İlk renderdə localStorage-dan doldur
  useEffect(() => {
    const user = readUserInfo();
    const { name, email, phone } = extractProfile(user);
    setForm((prev) => ({ ...prev, name, email, phone }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(false);

  // Şifrə daxil edilibsə, minimum uzunluğu yoxla
  if (form.password && form.password.length < 6) {
    setLoading(false);
    toast.error("Şifrə ən azı 6 simvol olmalıdır.");
    return;
  }

  try {
    const user = readUserInfo();
    const token = user?.token ?? null;

    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (lang) headers["Accept-Language"] = lang;

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      // şifrə boşdursa backendə göndərmə
      ...(form.password ? { password: form.password, password_confirmation: form.password_confirmation } : {}),
    };

    const res = await axios.post(`${baseUrlInf}/update-profile`, payload, { headers });

    const updatedNode = res?.data?.data ?? res?.data?.customer ?? res?.data ?? {};

    writeUserInfo(user, {
      name: updatedNode?.name ?? form.name,
      email: updatedNode?.email ?? form.email,
      phone: updatedNode?.phone ?? updatedNode?.phone_number ?? form.phone,
    });

    setForm((prev) => ({
      ...prev,
      name: updatedNode?.name ?? prev.name,
      email: updatedNode?.email ?? prev.email,
      phone: updatedNode?.phone ?? updatedNode?.phone_number ?? prev.phone,
      password: "",
      password_confirmation: "",
    }));

    setSuccess(true);
    toast.success(lang === 'en' ? 'Profile updated.' : 'Profil yeniləndi.');

  } catch (err: any) {
    console.error(err);
    setError(
      err?.response?.data?.message ||
      err?.message ||
      toast.error(lang === 'en' ? 'Profile was not updated.' : 'Profil yenilənmədi.')
    );
  } finally {
    setLoading(false);
  }
};


  return {
    form,
    loading,
    success,
    error,
    handleChange,
    handleSubmit,
  };
};
