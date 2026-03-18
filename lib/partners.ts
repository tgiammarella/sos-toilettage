export type Partner = {
  id: string;
  name: string;
  taglineFr: string;
  taglineEn: string;
  website: string;
  logo: string;
  category: "brand" | "school" | "tech" | "industry";
  featured: boolean;
  promoCodes?: {
    code: string;
    descriptionFr: string;
    descriptionEn: string;
  }[];
};

export const partners: Partner[] = [
  {
    id: "partenaire-exemple",
    name: "Partenaire Exemple",
    taglineFr: "Votre partenaire en toilettage professionnel",
    taglineEn: "Your professional grooming partner",
    website: "https://exemple.com",
    logo: "/partners/placeholder.svg",
    category: "brand",
    featured: true,
  },
];
