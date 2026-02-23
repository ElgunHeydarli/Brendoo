import React, { useState, useEffect } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import GETRequest from '../../setting/Request';
import { TranslationsKeys } from '../../setting/Types';
import ROUTES from '../../setting/routes';

const Register = () => {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  // ✅ YENİ: Modal state və şərtlər məzmunu
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsContent, setTermsContent] = useState<string>('');
  const [termsLoading, setTermsLoading] = useState(false);

  const { data: tarnslation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang]
  );

  // ✅ YENİ: Şərtləri API-dən yüklə
  const fetchTerms = async () => {
    setTermsLoading(true);
    try {
      // page_id=12 = "Şərtlər və Qaydalar"
      const response = await axios.get('https://admin.brendoo.com/api/pages?page_id=12', {
        headers: { 'Accept-Language': lang }
      });
      
      if (response.data?.description) {
        setTermsContent(response.data.description);
      } else {
        setTermsContent(`<h2>${response.data?.title || 'Şərtlər və Qaydalar'}</h2><p>Məzmun tapılmadı.</p>`);
      }
    } catch (error) {
      console.error('Terms fetch error:', error);
      setTermsContent(tarnslation?.sertler_yuklenmedi || 'Şərtlər yüklənə bilmədi');
    } finally {
      setTermsLoading(false);
    }
  };

  // ✅ YENİ: Modal açılanda şərtləri yüklə
  const handleOpenTermsModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTermsModal(true);
    if (!termsContent) {
      fetchTerms();
    }
  };

  // ✅ YENİ: ESC düyməsi ilə modalı bağla
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowTermsModal(false);
    };
    if (showTermsModal) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [showTermsModal]);

  const validationSchema = Yup.object({
    name: Yup.string().required('Ad tələb olunur'),
    phone: Yup.string()
      .required('Telefon nömrəsi tələb olunur')
      .matches(/^[0-9]{9}$/, 'Telefon nömrəsi 9 rəqəm olmalıdır'),
    email: Yup.string()
      .email('Düzgün email daxil edin')
      .required('Email tələb olunur'),
    password: Yup.string()
      .min(8, 'Şifrə minimum 8 simvol olmalıdır')
      .required('Şifrə tələb olunur'),
    fin_code: Yup.string()
      .required('FIN kod tələb olunur')
      .matches(/^[A-Z0-9]{7}$/, 'FIN kod 7 simvol olmalıdır'),
    id_serial: Yup.string()
      .required('Şəxsiyyət seriyası tələb olunur')
      .min(8, 'Minimum 8 simvol'),
    gender: Yup.string()
      .oneOf(['man', 'woman'], 'Cins seçin')
      .required('Cins tələb olunur'),
    birthday: Yup.date().required('Doğum tarixi tələb olunur'),
    acceptTerms: Yup.boolean()
      .oneOf([true], 'Şərtləri qəbul etməlisiniz')
      .required(),
  });

  const handleRegister = async (values: any) => {
    try {
      const response = await axios.post('https://admin.brendoo.com/api/register', {
        name: values.name,
        phone: values.phone,
        email: values.email,
        password: values.password,
        fin_code: values.fin_code.toUpperCase(),
        id_serial: values.id_serial.toUpperCase(),
        gender: values.gender,
        birthday: values.birthday,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Qeydiyyat uğurla tamamlandı!');
        navigate(`/${lang}/${ROUTES.login[lang as keyof typeof ROUTES.login]}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.error) {
          error.response.data.error.forEach((item: string) => {
            toast.error(item);
          });
        } else {
          toast.error('Xəta baş verdi');
        }
      }
    }
  };

  return (
    <>
      <style>{`
        .register-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }
        
        /* Sol Panel */
        .left-panel {
          flex: 1;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          position: relative;
          overflow: hidden;
        }
        
        .left-panel::before {
          content: '';
          position: absolute;
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: rgba(56, 115, 195, 0.1);
          border-radius: 50%;
        }
        
        .left-panel::after {
          content: '';
          position: absolute;
          bottom: -150px;
          left: -150px;
          width: 500px;
          height: 500px;
          background: rgba(56, 115, 195, 0.08);
          border-radius: 50%;
        }
        
        .left-content {
          position: relative;
          z-index: 10;
          max-width: 500px;
        }
        
        .brand-logo {
          font-size: 42px;
          font-weight: 800;
          color: white;
          margin-bottom: 24px;
          letter-spacing: -1px;
        }
        
        .brand-logo span {
          color: #3873C3;
        }
        
        .left-title {
          font-size: 36px;
          font-weight: 700;
          color: white;
          line-height: 1.3;
          margin-bottom: 20px;
        }
        
        .left-description {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          margin-bottom: 40px;
        }
        
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(56, 115, 195, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .feature-icon svg {
          width: 24px;
          height: 24px;
          color: #5a9fd4;
        }
        
        .feature-text h4 {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
        }
        
        .feature-text p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        /* Sağ Panel */
        .right-panel {
          flex: 1;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px;
          overflow-y: auto;
        }
        
        .form-wrapper {
          width: 100%;
          max-width: 440px;
        }
        
        .form-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .form-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #3873C3 0%, #5a9fd4 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 10px 30px rgba(56, 115, 195, 0.3);
        }
        
        .form-icon svg {
          width: 32px;
          height: 32px;
          color: white;
        }
        
        .form-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
        }
        
        .form-subtitle {
          font-size: 14px;
          color: #64748b;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        
        .form-input {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          color: #1a1a2e;
          background: white;
          transition: all 0.3s ease;
          outline: none;
          box-sizing: border-box;
        }
        
        .form-input:focus {
          border-color: #3873C3;
          box-shadow: 0 0 0 4px rgba(56, 115, 195, 0.1);
        }
        
        .form-input::placeholder {
          color: #94a3b8;
        }
        
        .form-input.uppercase {
          text-transform: uppercase;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .phone-wrapper {
          display: flex;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .phone-wrapper:focus-within {
          border-color: #3873C3;
          box-shadow: 0 0 0 4px rgba(56, 115, 195, 0.1);
        }
        
        .phone-prefix {
          padding: 0 14px;
          font-size: 15px;
          font-weight: 600;
          color: #3873C3;
          background: #f1f5f9;
          height: 48px;
          display: flex;
          align-items: center;
          border-right: 2px solid #e2e8f0;
        }
        
        .phone-input {
          flex: 1;
          height: 48px;
          padding: 0 16px;
          border: none;
          font-size: 15px;
          color: #1a1a2e;
          background: transparent;
          outline: none;
        }
        
        .password-wrapper {
          position: relative;
        }
        
        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px;
          transition: color 0.3s;
        }
        
        .password-toggle:hover {
          color: #3873C3;
        }
        
        .form-select {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          color: #1a1a2e;
          background: white;
          cursor: pointer;
          outline: none;
          transition: all 0.3s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 20px;
        }
        
        .form-select:focus {
          border-color: #3873C3;
          box-shadow: 0 0 0 4px rgba(56, 115, 195, 0.1);
        }
        
        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 0;
        }
        
        .checkbox-input {
          width: 20px;
          height: 20px;
          accent-color: #3873C3;
          cursor: pointer;
        }
        
        .checkbox-label {
          font-size: 14px;
          color: #475569;
          cursor: pointer;
        }
        
        .checkbox-label a {
          color: #3873C3;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
        }
        
        .checkbox-label a:hover {
          text-decoration: underline;
        }
        
        .error-text {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }
        
        .submit-btn {
          width: 100%;
          height: 52px;
          background: linear-gradient(135deg, #3873C3 0%, #5a9fd4 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(56, 115, 195, 0.3);
        }
        
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(56, 115, 195, 0.4);
        }
        
        .login-link {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: #64748b;
        }
        
        .login-link a {
          color: #3873C3;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
        }
        
        .login-link a:hover {
          text-decoration: underline;
        }
        
        .back-btn {
          position: absolute;
          top: 24px;
          left: 24px;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          z-index: 20;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .back-btn svg {
          width: 20px;
          height: 20px;
          color: white;
        }
        
        /* ✅ YENİ: Modal Styles */
        .terms-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }
        
        .terms-modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 700px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          animation: modalSlideIn 0.3s ease;
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .terms-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .terms-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .terms-modal-title svg {
          width: 24px;
          height: 24px;
          color: #3873C3;
        }
        
        .terms-modal-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: #f3f4f6;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .terms-modal-close:hover {
          background: #e5e7eb;
        }
        
        .terms-modal-close svg {
          width: 18px;
          height: 18px;
          color: #6b7280;
        }
        
        .terms-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        
        .terms-content {
          font-size: 15px;
          line-height: 1.7;
          color: #374151;
        }
        
        .terms-content h1, .terms-content h2, .terms-content h3 {
          color: #1a1a2e;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        
        .terms-content p {
          margin-bottom: 12px;
        }
        
        .terms-content ul, .terms-content ol {
          padding-left: 24px;
          margin-bottom: 12px;
        }
        
        .terms-content li {
          margin-bottom: 6px;
        }
        
        .terms-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #6b7280;
        }
        
        .terms-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #3873C3;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .terms-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
        }
        
        .terms-accept-btn {
          padding: 12px 32px;
          background: linear-gradient(135deg, #3873C3 0%, #5a9fd4 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .terms-accept-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(56, 115, 195, 0.3);
        }
        
        /* Responsive */
        @media (max-width: 1024px) {
          .left-panel {
            padding: 40px;
          }
          
          .left-title {
            font-size: 28px;
          }
          
          .left-description {
            font-size: 16px;
          }
        }
        
        @media (max-width: 768px) {
          .register-container {
            flex-direction: column;
          }
          
          .left-panel {
            padding: 40px 24px;
            min-height: auto;
          }
          
          .left-content {
            text-align: center;
          }
          
          .features-list {
            display: none;
          }
          
          .left-title {
            font-size: 24px;
          }
          
          .left-description {
            font-size: 14px;
            margin-bottom: 0;
          }
          
          .right-panel {
            padding: 32px 24px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .back-btn {
            top: 16px;
            left: 16px;
          }
          
          .terms-modal {
            max-height: 90vh;
            border-radius: 16px;
          }
        }
      `}</style>

      <div className="register-container">
        {/* Sol Panel */}
        <div className="left-panel">
          <div className="back-btn" onClick={() => navigate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          
          <div className="left-content">
            <div className="brand-logo">Brend<span>oo</span></div>
          </div>
        </div>

        {/* Sağ Panel - Form */}
        <div className="right-panel">
          <div className="form-wrapper">
            <div className="form-header">
              <div className="form-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="form-title">{tarnslation?.register || 'Qeydiyyat'}</h2>
              <p className="form-subtitle">Hesab yaratmaq üçün məlumatları doldurun</p>
            </div>

            <Formik
              initialValues={{
                name: '',
                phone: '',
                email: '',
                password: '',
                fin_code: '',
                id_serial: '',
                gender: '',
                birthday: '',
                acceptTerms: false,
              }}
              validationSchema={validationSchema}
              onSubmit={handleRegister}
            >
              {({ setFieldValue }) => (
                <Form>
                  <div className="form-group">
                    <label className="form-label">Ad Soyad</label>
                    <Field name="name" className="form-input" placeholder="Ad Soyad daxil edin" />
                    <ErrorMessage name="name" component="span" className="error-text" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">FIN Kod</label>
                      <Field
                        name="fin_code"
                        maxLength={7}
                        className="form-input uppercase"
                        placeholder="ABCD123"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue('fin_code', e.target.value.toUpperCase());
                        }}
                      />
                      <ErrorMessage name="fin_code" component="span" className="error-text" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Şəxsiyyət Seriyası</label>
                      <Field
                        name="id_serial"
                        maxLength={9}
                        className="form-input uppercase"
                        placeholder="AA1234567"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue('id_serial', e.target.value.toUpperCase());
                        }}
                      />
                      <ErrorMessage name="id_serial" component="span" className="error-text" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Telefon</label>
                    <div className="phone-wrapper">
                      <span className="phone-prefix">+994</span>
                      <Field name="phone" type="tel" maxLength={9} className="phone-input" placeholder="XX XXX XX XX" />
                    </div>
                    <ErrorMessage name="phone" component="span" className="error-text" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <Field name="email" type="email" className="form-input" placeholder="email@example.com" />
                    <ErrorMessage name="email" component="span" className="error-text" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Şifrə</label>
                    <div className="password-wrapper">
                      <Field
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className="form-input"
                        placeholder="Minimum 8 simvol"
                        style={{ paddingRight: '48px' }}
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="span" className="error-text" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Cins</label>
                      <Field as="select" name="gender" className="form-select">
                        <option value="">Seçin</option>
                        <option value="man">Kişi</option>
                        <option value="woman">Qadın</option>
                      </Field>
                      <ErrorMessage name="gender" component="span" className="error-text" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Doğum tarixi</label>
                      <Field name="birthday" type="date" className="form-input" />
                      <ErrorMessage name="birthday" component="span" className="error-text" />
                    </div>
                  </div>

                  {/* ✅ YENİ: Şərtlər checkbox - modal açan link */}
                  <div className="checkbox-wrapper">
                    <Field type="checkbox" name="acceptTerms" className="checkbox-input" id="acceptTerms" />
                    <label htmlFor="acceptTerms" className="checkbox-label">
                      <a onClick={handleOpenTermsModal}>Şərtlər və Qaydaları</a> qəbul edirəm
                    </label>
                  </div>
                  <ErrorMessage name="acceptTerms" component="span" className="error-text" />

                  <button type="submit" className="submit-btn">
                    {tarnslation?.register || 'Qeydiyyatdan keç'}
                  </button>

                  <div className="login-link">
                    Hesabınız var? <a onClick={() => navigate(`/${lang}/${ROUTES.login[lang as keyof typeof ROUTES.login]}`)}>Daxil olun</a>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      {/* ✅ YENİ: Şərtlər Modal */}
      {showTermsModal && (
        <div className="terms-modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="terms-modal-header">
              <h3 className="terms-modal-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {tarnslation?.sertler_ve_qaydalar || 'Şərtlər və Qaydalar'}
              </h3>
              <button className="terms-modal-close" onClick={() => setShowTermsModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="terms-modal-body">
              {termsLoading ? (
                <div className="terms-loading">
                  <div className="terms-loading-spinner"></div>
                  <span>{tarnslation?.yuklenir || 'Yüklənir...'}</span>
                </div>
              ) : (
                <div 
                  className="terms-content" 
                  dangerouslySetInnerHTML={{ __html: termsContent }}
                />
              )}
            </div>
            
            <div className="terms-modal-footer">
              <button className="terms-accept-btn" onClick={() => setShowTermsModal(false)}>
                {tarnslation?.bagla || 'Bağla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;