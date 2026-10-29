/**
 * Central Site & Creator Configuration for RaddiBhaav
 */

export const SITE_CONFIG = {
  name: 'RaddiBhaav',
  legalName: 'RaddiBhaav Technologies',
  tagline: 'Kabadi ka sahi bhaav',
  description: 'Hyperlocal scrap bidding and doorstep pickup marketplace connecting Indian households with verified local scrap dealers (kabadiwalas).',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://raddibhaav.in',
  city: 'Nashik',
  location: 'Nashik, Maharashtra, India',
  creator: {
    name: 'Vishal Shirsath',
    role: 'Founder & Developer',
    location: 'Nashik, Maharashtra, India',
    bio: 'Software engineer and builder passionate about civic-tech, circular economies, and empowering local communities through intuitive hyperlocal platforms.',
    linkedin: 'https://www.linkedin.com/in/vishal-shirsath-6138792ab',
    github: 'https://github.com/VishalShir60',
  },
  links: {
    linkedin: 'https://www.linkedin.com/in/vishal-shirsath-6138792ab',
    github: 'https://github.com/VishalShir60',
    repo: 'https://github.com/VishalShir60/raddibhaav',
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;
export default SITE_CONFIG;
