import { useRouter } from 'next/router';

const LanguageSwitcher = () => {
  const router = useRouter();
  const { locale, asPath } = router;

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'al', name: 'Shqip' },
    { code: 'az', name: 'Azərbaycan' },
    { code: 'ba', name: 'Босански' },
    { code: 'be', name: 'Беларуская' },
    { code: 'bg', name: 'Български' },
    { code: 'bs', name: 'Bosanski' },
    { code: 'by', name: 'Беларускі' },
    { code: 'cs', name: 'Čeština' },
    { code: 'da', name: 'Dansk' },
    { code: 'el', name: 'Ελληνικά' },
    { code: 'et', name: 'Eesti' },
    { code: 'fi', name: 'Suomi' },
    { code: 'fr-ch', name: 'Français (Suisse)' },
    { code: 'ga', name: 'Gaeilge' },
    { code: 'gd', name: 'Gàidhlig' },
    { code: 'gsw', name: 'Schweizerdeutsch' },
    { code: 'hu', name: 'Magyar' },
    { code: 'hy', name: 'Հայերեն' },
    { code: 'ie', name: 'Irish' },
    { code: 'is', name: 'Íslenska' },
    { code: 'it', name: 'Italiano' },
    { code: 'ka', name: 'ქართული' },
    { code: 'lb', name: 'Lëtzebuergesch' },
    { code: 'lt', name: 'Lietuvių' },
    { code: 'lv', name: 'Latviešu' },
    { code: 'mk', name: 'Македонски' },
    { code: 'mt', name: 'Malti' },
    { code: 'no', name: 'Norsk' },
    { code: 'pl', name: 'Polski' },
    { code: 'pt', name: 'Português' },
    { code: 'ro', name: 'Română' },
    { code: 'rm', name: 'Rumantsch' },
    { code: 'ru', name: 'Русский' },
    { code: 'sk', name: 'Slovenčina' },
    { code: 'sl', name: 'Slovenščina' },
    { code: 'sq', name: 'Shqip' },
    { code: 'sr', name: 'Српски' },
    { code: 'sv', name: 'Svenska' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ua', name: 'Українська' }
  ];

  const changeLanguage = (lng) => {
    if (locale !== lng) {
      router.push(asPath, asPath, { locale: lng });
    }
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <label htmlFor="language-selector" style={{ color: '#fff', marginRight: '10px', fontSize: '16px' }}>
        Select Language:
      </label>
      <select
        id="language-selector"
        value={locale}
        onChange={(e) => changeLanguage(e.target.value)}
        aria-label="Select language"
        style={{
          padding: '10px',
          fontSize: '16px',
          borderRadius: '5px',
          backgroundColor: '#333',
          color: '#fff',
          border: '1px solid #28a745',
          cursor: 'pointer',
          width: '200px',
        }}
      >
        {languages.map((lng) => (
          <option key={lng.code} value={lng.code}>
            {lng.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
