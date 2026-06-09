export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'OpenStage',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'listerineh',
      url: 'https://listerineh.dev',
    },
    description:
      'Plataforma open source para músicos. Genera clips virales, gestiona contenido y crece en redes sociales.',
    url: 'https://openstage.online',
    image: 'https://openstage.online/og-image.png',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OpenStage',
    url: 'https://openstage.online',
    description:
      'Plataforma open source para músicos. Genera clips virales y crece en redes sociales.',
    publisher: {
      '@type': 'Person',
      name: 'listerineh',
      url: 'https://listerineh.dev',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
