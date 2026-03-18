\*\*TOUT TOILETTAGE\*\*

\*\*Marketplace Feature\*\*

Complete Product & Technical Specification

Mars 2026 · Version 1.0 · Post-Launch Phase

\*\*1. Context & Strategic Fit\*\*

The ToutToilettage marketplace fills a real gap in the Quebec grooming  
industry. Groomers and salons constantly buy and sell used equipment,  
surplus products, and full salon setups with no dedicated platform.  
Facebook groups are the current default, which is fragmented,  
unsearchable, and untrustworthy.

  \-----------------------------------------------------------------------  
  Strategic goal: Make ToutToilettage the single destination for the  
  Quebec grooming professional, not just for shifts and jobs, but for  
  their entire professional ecosystem.

  \-----------------------------------------------------------------------

This feature should launch as Phase 5 on the roadmap, after the core  
platform is stable and the user base is established. A marketplace  
without users is useless. With 200+ salons and groomers on the platform,  
it becomes valuable immediately.

\*\*2. Feature Scope\*\*

\*\*2.1 What the Marketplace Covers\*\*

The marketplace is grooming-specific. No general classifieds. Every  
category relates to the professional grooming world.

  \-----------------------------------------------------------------------  
  \*\*Category\*\*     \*\*Examples\*\*                      \*\*Who Posts\*\*  
  \---------------- \--------------------------------- \--------------------  
  Equipment        Tables hydrauliques, dryers,      Salons, Groomers  
                   cages, baignoires, bras           

  Tools &          Ciseaux, tondeuses, peignes,      Salons, Groomers  
  Accessories      lames, accessoires                

  Products &       Shampooings surplus,              Salons, Groomers  
  Supplies         conditioners, parfums, lotions    

  Furniture &      Mobilier salon, receptionist      Salons  
  Fixtures         desk, enseigne, decorations       

  Full Salon       Rachat complet d\\'equip. de salon Salons  
  Buyouts          (vente, fermeture)                

  Looking For      \\"Je cherche une table Groomer\\'s Salons, Groomers  
  (ISO)            Best en region QC\\"               

  Giveaway /       Echange de service, don de        Salons, Groomers  
  Exchange         materiel, troc                      
  \-----------------------------------------------------------------------

\*\*2.2 What It Does NOT Cover\*\*

\-   Live animals or pets

\-   Non-grooming items (furniture, electronics, clothing)

\-   Services listings (those belong in Shifts/Jobs)

\-   Digital goods or software

\*\*3. User Roles & Permissions\*\*

  \-----------------------------------------------------------------  
  \*\*Action\*\*                  \*\*GROOMER\*\*   \*\*SALON\*\*   \*\*ADMIN\*\*  
  \--------------------------- \------------- \----------- \-----------  
  View all listings           Yes           Yes         Yes

  Post a listing              Yes           Yes         Yes

  Edit own listing            Yes           Yes         Yes

  Delete own listing          Yes           Yes         Yes

  Contact seller              Yes           Yes         Yes

  Mark listing as Sold        Yes (own)     Yes (own)   Yes (all)

  Flag a listing              Yes           Yes         Yes

  Remove any listing          No            No          Yes

  Feature a listing           No            No          Yes

  View flagged queue          No            No          Yes  
  \-----------------------------------------------------------------

\*\*4. Data Model\*\*

\*\*4.1 MarketplaceListing Model\*\*

Add to schema.prisma:

  \-----------------------------------------------------------------------  
  model MarketplaceListing { id String \\@id \\@default(cuid()) title  
  String titleFr String description String descriptionFr String price  
  Float? priceType PriceType \\@default(FIXED) category  
  MarketplaceCategory condition ItemCondition regionQc String status  
  ListingStatus \\@default(ACTIVE) isFeatured Boolean \\@default(false)  
  viewCount Int \\@default(0) images String\\\[\\\] posterId String poster  
  User \\@relation(fields: \\\[posterId\\\], references: \\\[id\\\]) expiresAt  
  DateTime soldAt DateTime? createdAt DateTime \\@default(now()) updatedAt  
  DateTime \\@updatedAt flags ListingFlag\\\[\\\] messages  
  MarketplaceMessage\\\[\\\] }

  \-----------------------------------------------------------------------

\*\*4.2 Enums\*\*

  \-----------------------------------------------------------------------  
  \*\*Enum\*\*              \*\*Values\*\*  
  \--------------------- \-------------------------------------------------  
  MarketplaceCategory   EQUIPMENT, TOOLS, PRODUCTS, FURNITURE,  
                        FULL\_SALON, ISO, EXCHANGE

  ItemCondition         NEW, EXCELLENT, GOOD, FAIR, FOR\_PARTS

  PriceType             FIXED, NEGOTIABLE, FREE, EXCHANGE

  ListingStatus         ACTIVE, SOLD, EXPIRED, REMOVED  
  \-----------------------------------------------------------------------

\*\*4.3 MarketplaceMessage Model\*\*

Private messaging between buyer and seller, scoped to a listing. No  
public comments.

  \-----------------------------------------------------------------------  
  model MarketplaceMessage { id String \\@id \\@default(cuid()) listingId  
  String listing MarketplaceListing \\@relation(\\...) senderId String  
  sender User \\@relation(\\...) body String readAt DateTime? createdAt  
  DateTime \\@default(now()) }

  \-----------------------------------------------------------------------

\*\*4.4 ListingFlag Model\*\*

  \-----------------------------------------------------------------------  
  model ListingFlag { id String \\@id \\@default(cuid()) listingId String  
  listing MarketplaceListing \\@relation(\\...) reporterId String reason  
  FlagReason note String? createdAt DateTime \\@default(now())  
  @@unique(\\\[listingId, reporterId\\\]) }

  \-----------------------------------------------------------------------

FlagReason enum: SPAM, WRONG\_CATEGORY, MISLEADING, INAPPROPRIATE,  
ALREADY\_SOLD, OTHER

\*\*5. Monetization\*\*

  \-----------------------------------------------------------------------  
  The marketplace does NOT use the credit system. Credits are for  
  shift/job publishing only. Marketplace has its own simple monetization  
  layer.

  \-----------------------------------------------------------------------

\*\*5.1 Free Tier Limits\*\*

  \-----------------------------------------------------------------------  
  \*\*Subscription     \*\*Active      \*\*Photos per     \*\*Listing Duration\*\*  
  Plan\*\*             Listings\*\*    Listing\*\*          
  \------------------ \------------- \---------------- \---------------------  
  NONE (no           2 active      3 photos         30 days  
  subscription)                                     

  ESSENTIEL          5 active      5 photos         60 days

  SALON              10 active     8 photos         60 days

  RESEAU             25 active     10 photos        90 days

  CHAINE             Unlimited     10 photos        90 days  
  \-----------------------------------------------------------------------

\*\*5.2 Paid Upgrades (Post-Stripe)\*\*

  \------------------------------------------------------------------------  
  \*\*Feature\*\*            \*\*Price       \*\*Duration\*\*   \*\*Notes\*\*  
                         (CAD)\*\*                        
  \---------------------- \------------- \-------------- \--------------------  
  Boost listing (top of  4.99 \\$       7 jours        Label \\'En vedette\\'  
  search)                                             on card

  Extend listing         2.99 \\$       \+30 jours      Max 3 extensions  
  duration                                            

  Extra photo slots      1.99 \\$       Per listing    \+5 photos above plan  
                                                      limit  
  \------------------------------------------------------------------------

  \-----------------------------------------------------------------------  
  V1 Launch: Implement free tier limits only. Paid upgrades go in the  
  same Stripe phase as subscription payments.

  \-----------------------------------------------------------------------

\*\*6. Routes & Pages\*\*

  \------------------------------------------------------------------------------------------------  
  \*\*Route\*\*                                             \*\*Page\*\*              \*\*Access\*\*  
  \----------------------------------------------------- \--------------------- \--------------------  
  app/\\\[locale\\\]/marketplace/page.tsx                   Public listings       Public  
                                                        browse \+ search       

  app/\\\[locale\\\]/marketplace/\\\[id\\\]/page.tsx            Single listing detail Public

  app/\\\[locale\\\]/marketplace/new/page.tsx               Create listing form   Auth required

  app/\\\[locale\\\]/marketplace/mes-annonces/page.tsx      My listings           Auth required  
                                                        management            

  app/\\\[locale\\\]/marketplace/\\\[id\\\]/edit/page.tsx       Edit listing          Owner only

  app/\\\[locale\\\]/marketplace/messages/page.tsx          All conversations     Auth required  
                                                        inbox                 

  app/\\\[locale\\\]/marketplace/messages/\\\[id\\\]/page.tsx   Conversation thread   Auth required

  app/\\\[locale\\\]/admin/marketplace/page.tsx             Admin: flagged        ADMIN only  
                                                        listings                
  \------------------------------------------------------------------------------------------------

\*\*6.1 API Routes\*\*

  \------------------------------------------------------------------------------------------  
  \*\*Method\*\*   \*\*Route\*\*                               \*\*Action\*\*  
  \------------ \--------------------------------------- \-------------------------------------  
  GET          /api/marketplace                        List/search listings with filters

  POST         /api/marketplace                        Create new listing

  GET          /api/marketplace/\\\[id\\\]                 Get single listing \+ increment views

  PATCH        /api/marketplace/\\\[id\\\]                 Update listing (owner/admin)

  DELETE       /api/marketplace/\\\[id\\\]                 Soft delete (owner/admin)

  POST         /api/marketplace/\\\[id\\\]/sold            Mark as sold

  POST         /api/marketplace/\\\[id\\\]/flag            Flag a listing

  GET          /api/marketplace/\\\[id\\\]/messages        Get conversation thread

  POST         /api/marketplace/\\\[id\\\]/messages        Send message

  PATCH        /api/marketplace/messages/\\\[id\\\]/read   Mark messages as read  
  \------------------------------------------------------------------------------------------

\*\*7. UI Components\*\*

\*\*7.1 Browse Page Layout\*\*

\-   Left sidebar: filters (category, condition, price range, region,  
    priceType)

\-   Top bar: search input, sort (recent, price asc/desc, featured first)

\-   Main grid: ListingCard components (image, title, price badge,  
    condition badge, region, date)

\-   Pagination: cursor-based, 20 listings per page

\-   Mobile: filters collapse into a bottom sheet drawer

\*\*7.2 ListingCard Component\*\*

\-   Photo thumbnail (fallback to category icon if no photo)

\-   Title (bilingual: display based on user locale)

\-   Price with PriceType badge (Nego., Gratuit, Echange)

\-   Condition badge with color coding (Neuf=green, Excellent=teal,  
    Bon=blue, Passable=orange, Pièces=red)

\-   Region label (ex: Montréal, Rive-Sud, Québec City)

\-   \\"En vedette\\" banner if isFeatured

\-   Time since posted (ex: il y a 2 jours)

\*\*7.3 Listing Detail Page\*\*

\-   Image gallery with lightbox (max 10 photos)

\-   Full bilingual description tabs (FR / EN)

\-   Seller info card: name, type (salon/groomer), member since

\-   \\"Contacter le vendeur\\" button triggers inline message form

\-   Similar listings carousel (same category, same region)

\-   Flag button in footer (dropdown with reason select)

\-   If owner: Edit, Mark as Sold, Delete buttons

\*\*7.4 Create/Edit Listing Form\*\*

\-   Step 1: Category \+ Condition \+ PriceType

\-   Step 2: Title (FR required, EN optional), Description (FR required,  
    EN optional)

\-   Step 3: Photos upload (drag and drop, preview, reorder)

\-   Step 4: Price, Region (Quebec regions dropdown), Contact preference

\-   Preview before submit

\-   Auto-save as draft on each step

\*\*8. Search & Filtering\*\*

\*\*8.1 Filter Parameters\*\*

  \------------------------------------------------------------------------  
  \*\*Filter\*\*    \*\*Type\*\*     \*\*Notes\*\*  
  \------------- \------------ \---------------------------------------------  
  q             String       Full-text search on title \+ description (FR \+  
                             EN)

  category      Enum         MarketplaceCategory value

  condition     Enum\\\[\\\]     Multi-select

  priceType     Enum\\\[\\\]     FIXED, NEGOTIABLE, FREE, EXCHANGE

  priceMin /    Float        Price range  
  priceMax                   

  region        String       Quebec region name

  sortBy        String       recent \\| price\_asc \\| price\_desc \\| featured  
  \------------------------------------------------------------------------

\*\*8.2 V1 Search Strategy\*\*

Use Prisma full-text search on SQLite for dev, PostgreSQL full-text  
search for production. Keep it simple: search title and description  
fields. No Algolia or Elasticsearch needed at V1 scale.

\*\*9. Moderation System\*\*

\*\*9.1 Admin Flag Queue\*\*

When 2+ users flag the same listing, it auto-hides from public browse  
(status remains ACTIVE but a hiddenAt timestamp is set). Admin sees a  
flag queue at /admin/marketplace with:

\-   Listing preview, flag count, flag reasons

\-   Actions: Approve (clear flags, restore), Remove (set status  
    REMOVED), Warn seller

\*\*9.2 Auto-Expiry\*\*

A cron job (or middleware on browse page load) marks listings EXPIRED  
when expiresAt \\\< now(). Sellers receive an email 7 days before expiry  
with a re-list option.

\*\*9.3 Seller Trust Signals\*\*

\-   \\"Membre depuis\\" date visible on listing

\-   Response rate badge (% of messages replied to within 48h)

\-   Verified professional badge for subscribed accounts

\*\*10. Email Notifications\*\*

  \--------------------------------------------------------------------------  
  \*\*Trigger\*\*               \*\*Recipient\*\*      \*\*Function Name\*\*  
  \------------------------- \------------------ \-----------------------------  
  New message received      Seller             notifyMarketplaceMessage()

  Listing marked as sold    Buyer (last        notifyListingSold()  
                            message sender)    

  Listing expires in 7 days Poster             notifyListingExpiringSoon()

  Listing flagged \+ removed Poster             notifyListingRemoved()

  Listing approved after    Poster             notifyListingApproved()  
  review                                         
  \--------------------------------------------------------------------------

  \-----------------------------------------------------------------------  
  All notification functions follow the existing fire-and-forget pattern  
  with error logging. No blocking on email send.

  \-----------------------------------------------------------------------

\*\*11. Quebec Regions Reference\*\*

Use a standardized dropdown to ensure consistent filtering. Do not use  
free-text for region.

  \------------------------------------------------------------------------  
  \*\*Region Key\*\*  \*\*Display Name (FR)\*\*        \*\*Display Name (EN)\*\*  
  \--------------- \---------------------------- \---------------------------  
  montreal        Montréal                     Montreal

  rive-sud        Rive-Sud de Montréal         South Shore Montreal

  rive-nord       Rive-Nord de Montréal        North Shore Montreal

  laval           Laval                        Laval

  quebec-city     Québec (ville)               Quebec City

  estrie          Estrie / Sherbrooke          Eastern Townships

  laurentides     Laurentides                  Laurentians

  lanaudiere      Lanaudière                   Lanaudiere

  outaouais       Outaouais / Gatineau         Outaouais / Gatineau

  saguenay        Saguenay-Lac-Saint-Jean      Saguenay

  chaudiere       Chaudière-Appalaches         Chaudiere-Appalaches

  abitibi         Abitibi-Témiscamingue        Abitibi

  cote-nord       Côte-Nord                    North Shore

  autre           Autre région du Québec       Other Quebec region  
  \------------------------------------------------------------------------

\*\*12. Build Plan\*\*

\*\*12.1 Estimated Effort\*\*

  \------------------------------------------------------------------------  
  \*\*Task\*\*                    \*\*Effort\*\*   \*\*Notes\*\*  
  \--------------------------- \------------ \-------------------------------  
  Prisma schema additions     0.5 day      Add 3 models \+ enums, run  
                                           migration

  API routes (CRUD)           1.5 days     7 routes, thin logic in  
                                           lib/marketplace.ts

  Browse \+ Search page        1 day        Filters, grid, pagination

  Listing detail page         0.5 day      Gallery, contact form, similar

  Create/Edit form            1 day        Most complex UI piece  
  (multi-step)                             

  My Listings page            0.5 day      List \+ status controls

  Messaging system            1 day        Thread view \+ inbox

  Admin flag queue            0.5 day      Simple table \+ actions

  Email notifications         0.5 day      5 functions following existing  
                                           pattern

  i18n (FR/EN)                0.5 day      All strings bilingual from day  
                                           one

  TOTAL                       \\\~7-8 days   Two focused sprints post-launch  
  \------------------------------------------------------------------------

\*\*12.2 Recommended Build Order\*\*

1\.  Schema migration (no UI risk, can run in parallel with post-launch  
    fixes)

2\.  lib/marketplace.ts \--- all business logic in one file

3\.  API routes (CRUD first, messaging second)

4\.  Browse page \+ ListingCard component

5\.  Listing detail page

6\.  Create/Edit form (multi-step)

7\.  Messaging inbox \+ thread view

8\.  Admin flag queue

9\.  Email notifications \+ expiry cron

\*\*13. Post-V1 Ideas\*\*

  \-----------------------------------------------------------------------  
  These are good ideas but intentionally out of scope for V1. Park them  
  here to avoid scope creep.

  \-----------------------------------------------------------------------

\-   Seller ratings (after a transaction is marked complete)

\-   Wishlist / saved listings

\-   \\"Alert me\\" for a category \+ region (email when new listing  
    matches)

\-   Bulk listing management for large salons

\-   Featured marketplace section on homepage

\-   Statistics for sellers (views, message count, saves)

\-   Verified seller badge (linked to subscribed salon account)

\-   Integration with partner\\'s social content: share listing to her  
    audience

\-   Partner commission on featured listings (revenue share model)

\*\*Note interne\*\*

This spec was designed to fit the existing ToutToilettage architecture  
without breaking any Phase 1-4 systems. The marketplace is fully  
additive \--- it does not touch the credit system, shift flow, or job  
posting logic. It can be built in a dedicated post-launch sprint by one  
developer in under two weeks.