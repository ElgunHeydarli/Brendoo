import{a as z,u as L,G as M,d as E,i as _,k as S,e as n,j as e,F as T,f as q,g as t,E as a,R as b,h,z as g}from"./index-Dsd0V-8z.js";import{r as d}from"./react-RasmPOVX.js";const B=()=>{const{lang:s="az"}=z(),c=L(),[p,w]=d.useState(!1),[m,l]=d.useState(!1),[f,x]=d.useState(""),[j,u]=d.useState(!1),{data:i}=M("/translates","translates",[s]),k=async()=>{u(!0);try{const r=await h.get("https://admin.brendoo.com/api/pages?page_id=4",{headers:{"Accept-Language":s}});r.data?.description?x(r.data.description):x(`<h2>${r.data?.title||"Şərtlər və Qaydalar"}</h2><p>Məzmun tapılmadı.</p>`)}catch(r){console.error("Terms fetch error:",r),x(i?.sertler_yuklenmedi||"Şərtlər yüklənə bilmədi")}finally{u(!1)}},v=r=>{r.preventDefault(),l(!0),f||k()};d.useEffect(()=>{const r=o=>{o.key==="Escape"&&l(!1)};return m&&(document.addEventListener("keydown",r),document.body.style.overflow="hidden"),()=>{document.removeEventListener("keydown",r),document.body.style.overflow="unset"}},[m]);const y=E({name:n().required("Ad tələb olunur"),phone:n().required("Telefon nömrəsi tələb olunur").matches(/^[0-9]{9}$/,"Telefon nömrəsi 9 rəqəm olmalıdır"),email:n().email("Düzgün email daxil edin").required("Email tələb olunur"),password:n().min(8,"Şifrə minimum 8 simvol olmalıdır").required("Şifrə tələb olunur"),fin_code:n().required("FIN kod tələb olunur").matches(/^[A-Z0-9]{7}$/,"FIN kod 7 simvol olmalıdır"),id_serial:n().required("Şəxsiyyət seriyası tələb olunur").min(8,"Minimum 8 simvol"),gender:n().oneOf(["man","woman"],"Cins seçin").required("Cins tələb olunur"),birthday:S().required("Doğum tarixi tələb olunur"),acceptTerms:_().oneOf([!0],"Şərtləri qəbul etməlisiniz").required()}),N=async r=>{try{const o=await h.post("https://admin.brendoo.com/api/register",{name:r.name,phone:r.phone,email:r.email,password:r.password,fin_code:r.fin_code.toUpperCase(),id_serial:r.id_serial.toUpperCase(),gender:r.gender,birthday:r.birthday});(o.status===200||o.status===201)&&(g.success("Qeydiyyat uğurla tamamlandı!"),c(`/${s}/${b.login[s]}`))}catch(o){h.isAxiosError(o)&&(o.response?.data?.error?o.response.data.error.forEach(C=>{g.error(C)}):g.error("Xəta baş verdi"))}};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
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
      `}),e.jsxs("div",{className:"register-container",children:[e.jsxs("div",{className:"left-panel",children:[e.jsx("div",{className:"back-btn",onClick:()=>c(-1),children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 19l-7-7 7-7"})})}),e.jsx("div",{className:"left-content",children:e.jsxs("div",{className:"brand-logo",children:["Brend",e.jsx("span",{children:"oo"})]})})]}),e.jsx("div",{className:"right-panel",children:e.jsxs("div",{className:"form-wrapper",children:[e.jsxs("div",{className:"form-header",children:[e.jsx("div",{className:"form-icon",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"})})}),e.jsx("h2",{className:"form-title",children:i?.register||"Qeydiyyat"}),e.jsx("p",{className:"form-subtitle",children:"Hesab yaratmaq üçün məlumatları doldurun"})]}),e.jsx(T,{initialValues:{name:"",phone:"",email:"",password:"",fin_code:"",id_serial:"",gender:"",birthday:"",acceptTerms:!1},validationSchema:y,onSubmit:N,children:({setFieldValue:r})=>e.jsxs(q,{children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Ad Soyad"}),e.jsx(t,{name:"name",className:"form-input",placeholder:"Ad Soyad daxil edin"}),e.jsx(a,{name:"name",component:"span",className:"error-text"})]}),e.jsxs("div",{className:"form-row",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"FIN Kod"}),e.jsx(t,{name:"fin_code",maxLength:7,className:"form-input uppercase",placeholder:"ABCD123",onChange:o=>{r("fin_code",o.target.value.toUpperCase())}}),e.jsx(a,{name:"fin_code",component:"span",className:"error-text"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Şəxsiyyət Seriyası"}),e.jsx(t,{name:"id_serial",maxLength:9,className:"form-input uppercase",placeholder:"AA1234567",onChange:o=>{r("id_serial",o.target.value.toUpperCase())}}),e.jsx(a,{name:"id_serial",component:"span",className:"error-text"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Telefon"}),e.jsxs("div",{className:"phone-wrapper",children:[e.jsx("span",{className:"phone-prefix",children:"+994"}),e.jsx(t,{name:"phone",type:"tel",maxLength:9,className:"phone-input",placeholder:"XX XXX XX XX"})]}),e.jsx(a,{name:"phone",component:"span",className:"error-text"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Email"}),e.jsx(t,{name:"email",type:"email",className:"form-input",placeholder:"email@example.com"}),e.jsx(a,{name:"email",component:"span",className:"error-text"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Şifrə"}),e.jsxs("div",{className:"password-wrapper",children:[e.jsx(t,{type:p?"text":"password",name:"password",className:"form-input",placeholder:"Minimum 8 simvol",style:{paddingRight:"48px"}}),e.jsx("button",{type:"button",className:"password-toggle",onClick:()=>w(!p),children:p?e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"})}):e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 12a3 3 0 11-6 0 3 3 0 016 0z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"})]})})]}),e.jsx(a,{name:"password",component:"span",className:"error-text"})]}),e.jsxs("div",{className:"form-row",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Cins"}),e.jsxs(t,{as:"select",name:"gender",className:"form-select",children:[e.jsx("option",{value:"",children:"Seçin"}),e.jsx("option",{value:"man",children:"Kişi"}),e.jsx("option",{value:"woman",children:"Qadın"})]}),e.jsx(a,{name:"gender",component:"span",className:"error-text"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Doğum tarixi"}),e.jsx(t,{name:"birthday",type:"date",className:"form-input"}),e.jsx(a,{name:"birthday",component:"span",className:"error-text"})]})]}),e.jsxs("div",{className:"checkbox-wrapper",children:[e.jsx(t,{type:"checkbox",name:"acceptTerms",className:"checkbox-input",id:"acceptTerms"}),e.jsxs("label",{htmlFor:"acceptTerms",className:"checkbox-label",children:[e.jsx("a",{onClick:v,children:"Şərtlər və Qaydaları"})," qəbul edirəm"]})]}),e.jsx(a,{name:"acceptTerms",component:"span",className:"error-text"}),e.jsx("button",{type:"submit",className:"submit-btn",children:i?.register||"Qeydiyyatdan keç"}),e.jsxs("div",{className:"login-link",children:["Hesabınız var? ",e.jsx("a",{onClick:()=>c(`/${s}/${b.login[s]}`),children:"Daxil olun"})]})]})})]})})]}),m&&e.jsx("div",{className:"terms-modal-overlay",onClick:()=>l(!1),children:e.jsxs("div",{className:"terms-modal",onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"terms-modal-header",children:[e.jsxs("h3",{className:"terms-modal-title",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})}),i?.sertler_ve_qaydalar||"Şərtlər və Qaydalar"]}),e.jsx("button",{className:"terms-modal-close",onClick:()=>l(!1),children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsx("div",{className:"terms-modal-body",children:j?e.jsxs("div",{className:"terms-loading",children:[e.jsx("div",{className:"terms-loading-spinner"}),e.jsx("span",{children:i?.yuklenir||"Yüklənir..."})]}):e.jsx("div",{className:"terms-content",dangerouslySetInnerHTML:{__html:f}})}),e.jsx("div",{className:"terms-modal-footer",children:e.jsx("button",{className:"terms-accept-btn",onClick:()=>l(!1),children:i?.bagla||"Bağla"})})]})})]})};export{B as default};
