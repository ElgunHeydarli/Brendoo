import React from 'react';
import TopTitle from './TopTitle';
import { useUpdateProfile } from '../../settings/useUpdateProfile';
import GETRequest from '../../../../setting/Request';
import { useParams } from 'react-router-dom';
import { TranslationsKeys } from '../../../../setting/Types';

const Settings: React.FC = () => {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  // lang-ı hook-a ötürürük ki, header-larda istifadə etsin
  const { form, loading, handleChange, handleSubmit } = useUpdateProfile(lang);

  return (
    <div className="settings">
      <TopTitle>
        <h3>{translation?.Tənzimləmələr ?? ''}</h3>
      </TopTitle>

      <form className="form-content" onSubmit={handleSubmit}>
        <div className="fields">
          <div className="field-input">
            <input
              required
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={translation?.ad_soyad ?? ''}
              autoComplete="name"
            />
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={translation?.email ?? ''}
              autoComplete="email"
            />
          </div>

          <div className="field-input">
            <input
              required
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder={translation?.phone_pl ?? ''}
              autoComplete="tel"
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={translation?.shifre ?? ''}
            />
          </div>

          <div className="field-input">
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder={translation?.sifre_tekrari ?? ''}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? translation?.loading_main_key ?? '.'
            : translation?.yadda_saxla_key ?? ''}
        </button>
      </form>
    </div>
  );
};

export default Settings;
