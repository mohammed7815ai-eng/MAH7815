import type { SourceId } from './types';

export interface Source {
  id: SourceId;
  title: string;
  org: string;
  year: string;
  url?: string;
}

export const SOURCES: Record<SourceId, Source> = {
  krg2023: {
    id: 'krg2023',
    title: 'Cancer Screening Clinical Practice Guidelines, V01',
    org: 'Kurdistan Regional Government, Ministry of Health, Cancer Control Department',
    year: '2023',
  },
  who_cervical2021: {
    id: 'who_cervical2021',
    title: 'WHO guideline for screening and treatment of cervical pre-cancer lesions for cervical cancer prevention, 2nd ed.',
    org: 'World Health Organization',
    year: '2021',
    url: 'https://www.who.int/publications/i/item/9789240030824',
  },
  who_breast: {
    id: 'who_breast',
    title: 'Global Breast Cancer Initiative / Breast cancer fact sheet',
    org: 'World Health Organization',
    year: '2023',
    url: 'https://www.who.int/news-room/fact-sheets/detail/breast-cancer',
  },
  iarc: {
    id: 'iarc',
    title: 'IARC Handbooks of Cancer Prevention (Vol. 15 Breast, Vol. 17 Colorectal, Vol. 18 Cervical)',
    org: 'International Agency for Research on Cancer (WHO)',
    year: '2016–2022',
    url: 'https://handbooks.iarc.who.int/',
  },
  uspstf_breast2024: {
    id: 'uspstf_breast2024',
    title: 'Breast Cancer: Screening',
    org: 'US Preventive Services Task Force',
    year: '2024',
    url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening',
  },
  uspstf_crc2021: {
    id: 'uspstf_crc2021',
    title: 'Colorectal Cancer: Screening',
    org: 'US Preventive Services Task Force',
    year: '2021',
    url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening',
  },
  uspstf_lung2021: {
    id: 'uspstf_lung2021',
    title: 'Lung Cancer: Screening',
    org: 'US Preventive Services Task Force',
    year: '2021',
    url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening',
  },
  uspstf_prostate2018: {
    id: 'uspstf_prostate2018',
    title: 'Prostate Cancer: Screening',
    org: 'US Preventive Services Task Force',
    year: '2018',
    url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/prostate-cancer-screening',
  },
  uspstf_cervical2018: {
    id: 'uspstf_cervical2018',
    title: 'Cervical Cancer: Screening',
    org: 'US Preventive Services Task Force',
    year: '2018',
    url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/cervical-cancer-screening',
  },
  nhs: {
    id: 'nhs',
    title: 'NHS screening programmes (breast, cervical, bowel) and PSA testing',
    org: 'National Health Service (UK)',
    year: '2024',
    url: 'https://www.nhs.uk/conditions/nhs-screening/',
  },
  cdc: {
    id: 'cdc',
    title: 'Cancer screening information',
    org: 'US Centers for Disease Control and Prevention',
    year: '2024',
    url: 'https://www.cdc.gov/cancer/',
  },
  acr_lungrads2022: {
    id: 'acr_lungrads2022',
    title: 'Lung-RADS v2022',
    org: 'American College of Radiology',
    year: '2022',
    url: 'https://www.acr.org/Clinical-Resources/Reporting-and-Data-Systems/Lung-Rads',
  },
  usmstf_crc2017: {
    id: 'usmstf_crc2017',
    title: 'Colorectal cancer screening: recommendations from the US Multi-Society Task Force (Gastroenterology 2017;153:307-323)',
    org: 'US Multi-Society Task Force on Colorectal Cancer',
    year: '2017',
  },
  nccn_breast: {
    id: 'nccn_breast',
    title: 'NCCN Guidelines: Breast Cancer Screening and Diagnosis',
    org: 'National Comprehensive Cancer Network',
    year: '2024',
    url: 'https://www.nccn.org/guidelines',
  },
};
