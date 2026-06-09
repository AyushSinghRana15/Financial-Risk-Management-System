import { Helmet } from "react-helmet-async";

const BASE_URL = "https://finrisk.online";

function SEO({ title, description, path, image }) {
  const fullTitle = title ? `${title} | FinRisk` : "FinRisk | Financial Risk Analytics Platform";
  const fullUrl = `${BASE_URL}${path || "/"}`;
  const ogImage = image || "https://finrisk.online/FinRisk.png";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
    </Helmet>
  );
}

export default SEO;
